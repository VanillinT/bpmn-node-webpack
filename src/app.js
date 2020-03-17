import Modeler from 'bpmn-js/lib/Modeler'
import $ from 'jquery'
import $request from './queries'
import BpmnViewer from 'bpmn-js/lib/Viewer';

class Model {
    constructor({ id, name, xml, date, rowInList, viewer }) {
        this.id = id
        this.name = name ? name : this.generateName()
        this.xml = xml
        this.date = date
        this.rowInList = rowInList
        this.viewerInRow = viewer
    }

    generateName() {
        return 'BPMN Diagram ' + new Date().getTime();
    }

    getProps() {
        return { id: this.id, name: (this.name = this.name ? this.name : this.generateName()), xml: this.xml, date: this.date }
    }

    setProps(id, date) {
        this.id = id
        this.date = date
    }

    updateListRow(name, xml) {
        if(name)
            this.rowInList.find(`#row-name-${this.id}`).text(name)
        if(xml )
            this.viewerInRow.importXML(xml, err=> {
                if(err) console.error(err)
            })
    }

}

class App {

    constructor() {
        this.modeler = new Modeler({
            container: '#canvas'
        })
        this.container = $('#app')
        this.isSaved = true
        this.models = []
        this.selectedModel = null

        this.GetDiagramList()
        this.SetHandlers()
        
        $(document).ajaxStart(() => {
            this.ShowSpinner()
        }).ajaxStop(() => {
            this.HideSpinner()
        }).ajaxError((evt, xhr, textStatus, errorThrown) => {
            this.HideSpinner()
            this.ShowMessage('Unhandled query error :(', true)
        })

        this.modeler.on('element.changed', e => {
            this.EnableSave()
            this.isSaved = false
        })
    }

    OpenModel(xml) {
        this.modeler.importXML(xml, err => {
            if (err) {
                this.ShowMessage(err, true)
                console.error(err)
            }
        });
    }

    CreateNewModel() {
        const create = () => {
            this.modeler.createDiagram(() => {
                this.modeler.saveXML({ format: true }, (err, xml) => {
                    const newModel = new Model({ xml })
                    this.SaveNewAndSelect(newModel)
                })
            })
        }
        if (!this.selectedModel || this.isSaved) {
            create()
        }
        else {
            this.Dialog('Create new diagram? \nCurrent one will not be saved.', () => {
                create()
            })
        }
    }

    GetDiagramList() {
        $request.getDocumentsList(res => {
            // response in empty due to database i/o load, retrying
            if(!Array.isArray(res)) return this.GetDiagramList()
            this.ProcessListItems(res)
        })
    }

    //get item from database and assign a row in the list
    ImportDiagram(id) {
        if (!this.selectedModel || this.isSaved)
            this.SelectModel(id)
        else {
            this.Dialog('Import new diagram?\nCurrent one will not be saved', () => {
                this.SelectModel(id)
            })
        }
    }

    SaveCurrentModel() {
        this.modeler.saveXML({ format: true }, (err, xml) => {
            if (err) return this.ShowMessage(err, true)
            this.DisableSave()
            this.selectedModel.xml = xml
            
            const data = this.selectedModel.getProps()
            
                $request.updateDocument(data, (res) => {
                    const model = this.GetModel(data.id)
                    model.updateListRow(data.name, data.xml)
                    this.SetCurrentName(model.getProps().name)
                    this.ShowMessage(`${this.selectedModel.name} updated successfuly`)
                })

            this.isSaved = true
        })
    }

    SaveNewAndSelect(model) {
        const data = model.getProps()

        $request.saveDocument(data, (res) => {
            this.DisableSave()
            
            this.ShowMessage(`${data.name} has been created`)

            const { id, date } = res
            model.setProps(id, date)

            this.ProcessListItem(model)
            this.SelectModel(model.id)

            this.isSaved = true
        })

    }

    SelectModel(id) {
        if(!this.GetModel(id)) return this.ShowMessage('Weird, this item could not be retrieved. Try reloading')
        this.container.find('#canvas').show()
        this.selectedModel = this.GetModel(id)
        this.SetCurrentName(this.selectedModel.name)
        this.OpenModel(this.selectedModel.xml)
        this.DisableSave()
    }

    ProcessListItem(m) {
        const target = this.container.find('#custom-diagram-list')
        const model = new Model({...m})

        const rowId = `row-name-${(m.id ? m.id: 'new')}`,
            viewerId =  `row-viewer-${(m.id ? m.id: 'new')}`

        const newRow = $(
            `<div title="Import diagram">
                <div id="${rowId}">${m.name}</div>
                <div><small>${m.date}</small></div>
                <div id="${viewerId}"></div>
            </div>`)
            .addClass('custom-diagram-list-row')
            .click(() => {
                if (this.selectedModel && this.selectedModel.id === m.id)
                    return this.ShowMessage('This diagram is selected', true)
                this.ImportDiagram(m.id)
                this.HideDiagramList()
            })

        target.append(newRow)
        model.rowInList = newRow

        const selector = `#custom-diagram-list > div.custom-diagram-list-row > #${viewerId}`
        const viewer = new BpmnViewer({container: selector, width: '100%', height: '100%'})
        viewer.importXML(m.xml, err => {
            if(err) console.error(err)
        })
        viewer.get('canvas').zoom(.25, 'auto')
        model.viewerInRow = viewer
        this.models.push(model)
    }

    ProcessListItems(models) {
        this.ShowSpinner()
        for (let m of models) {
            this.ProcessListItem(m)
        }
        this.HideSpinner()
    }

    GetModel(id){
        let res = {}
        for(let m of this.models){
            if(m.id === id){
                res = m
                break
            }
        }
        return res
    }

    ShowDiagramList() {
        if(this.models.length > 0)
            this.container.find('#custom-diagram-list-ovelray').fadeIn(300)
        else
            this.ShowMessage('There are currently no diagrams saved')
    }

    HideDiagramList() {
        this.container.find('#custom-diagram-list-ovelray').fadeOut(100)
    }

    SetCurrentName(name) {
        return this.container.find('#diagram-name-input')
            .prop('disabled', false)
            .val(name)
            .change((evt) => { 
                evt.target.value = evt.target.value.trim()
                this.selectedModel.name = evt.target.value
                this.EnableSave()
            })
    }

    EnableSave() {
        this.container.find('#save-button').css('visibility', 'visible')
    }

    DisableSave() {
        this.container.find('#save-button').css('visibility', 'hidden')
    }

    Dialog(message, acceptCallback, declineCallback) {
        let dialogEl = $(`
        <div id="dialog-overlay" class="overlay">
            <div id="dialog-container" class="overlay-container">
                <div id="dialog-head">
                    <pre>${message}</pre>
                </div>
                <div id="dialog-body">
                    <button id="accept">OK</button>
                    <button id="decline">Calcel</button>
                </div>

            </div>
        </div>`).appendTo(this.container).fadeIn(100)

        dialogEl.find('#accept').click(() => {
            acceptCallback()
            dialogEl.fadeOut(100)
        })
        dialogEl.find('#decline').click(() => {
            declineCallback = declineCallback && declineCallback()
            dialogEl.fadeOut(100)
        })
    }

    ShowSpinner() {
        this.container.find('#spinner').show()
    }

    HideSpinner() {
        this.container.find('#spinner').fadeOut(50)
    }

    ShowMessage(message, isError) {
        const messageEl = $(`<div id="notification-container">
                                <pre>${message}</pre>
                            </div>`).appendTo(this.container)

        const resultClass = isError ? 'has-errors' : 'success'

        messageEl.addClass(resultClass).fadeIn(300)

        setTimeout(() => {
            messageEl.fadeOut(300).remove()
        }, 2000)
    }

    SetHandlers() {
        const c = this.container

        const importBtn = c.find('#import-button'),
            saveBtn = c.find('#save-button'),
            createNewModelBtn = c.find('#new-diagram-button'),
            closeDiagramListBtn = c.find('#diagram-list-button-close')

        importBtn.click(() => {
            this.ShowDiagramList()
        })

        saveBtn.click(() => {
            this.SaveCurrentModel()
        })

        createNewModelBtn.click(() => {
            this.CreateNewModel()
        })

        closeDiagramListBtn.click(() => {
            this.HideDiagramList()
        })
    }
}

export default App;