import Modeler from 'bpmn-js/lib/Modeler'
import $ from 'jquery'
import $request from './queries'

class Model {
    constructor({ id, name, xml, date, correspondingRowInList }) {
        this.id = id
        this.name = name ? name : 'BPMN Diagram ' + new Date().getTime()
        this.xml = xml
        this.date = date
        this.correspondingRowInList = correspondingRowInList
    }

    getProps() {
        return { id: this.id, name: this.name, xml: this.xml, date: this.date }
    }

    setProps(id, date) {
        this.id = id
        this.date = date
    }

    bindListItem(row) {
        this.selectedModel.correspondingRowInList = row;
    }
}

class App {

    constructor() {
        this.modeler = new Modeler({
            container: '#canvas'
        })
        this.container = $('#app')

        this.diagramList = null
        this.selectedModel = null

        this.setHandlers()
        this.getDiagramList()

        $(document).ajaxStart(() => {
            this.showSpinner()
        }).ajaxStop(() => {
            this.hideSpinner()
        }).ajaxError((evt, xhr, textStatus, errorThrown) => {
            this.hideSpinner()
            this.showMessage('Unhandled query error :(', true)
        })
    }

    openDiagram(xml) {
        this.modeler.importXML(xml, err => {
            if (err) {
                this.showMessage(err, true)
                console.error(err)
            }
        });
    }

    newDiagram() {
        const createNew = () => {
            this.modeler.createDiagram(() => {
                this.modeler.saveXML({ format: true }, (err, xml) => {
                    this.initiateModel({ xml, id:'new' })
                })
            })
        }
        if (!this.selectedModel) {
            createNew()
        }
        else {
            this.dialog('Create new diagram? \nCurrent one will be saved.', () => {
                this.saveDiagram()
                createNew()
            })
        }
    }

    getDiagramList() {
        $request.getDocumentsList(res => {
            // response in empty due to database i/o load, retrying
            if(!Array.isArray(res)) return this.getDiagramList()
            this.diagramList = res
            this.appendListItems(res)
        })
    }

    //get item from database and assign a row in the list
    importDiagram(id, correspondingRowInList) {
        const request = () => {
            $request.getDocument(id, res => {
                // response in empty due to database i/o load, retrying
                if (!res.id) return request()

                const props = { ...res, correspondingRowInList }
                this.initiateModel(props)
            })
        }
        if (!this.selectedModel)
            request()
        else {
            this.dialog('Import new diagram?\nCurrent one will not be saved', () => {
                request()
            })
        }
    }

    saveDiagram() {
        if (this.selectedModel)
            this.modeler.saveXML({ format: true }, (err, xml) => {
                if (err) return this.showMessage(err, true)
                
                this.selectedModel.xml = xml

                const data = this.selectedModel.getProps()

                //diagram has assigned id (is in database)
                if (this.selectedModel.id) {
                    $request.updateDocument(data, (res) => {
                        this.showMessage(`${this.selectedModel.name} updated successfuly`)
                        this.updateListName(data.id, data.name)
                    })
                } else {
                    $request.saveDocument(data, (res) => {
                        const { id, date } = res
                        this.showMessage(`${this.selectedModel.name} has been saved`)
                        this.selectedModel.setProps(id, date)
                        this.appendListItems([this.selectedModel.getProps()])
                    })
                }
            });
        else
            this.showMessage('Nothing to save')
    }

    initiateModel(props) {
        this.container.find('#canvas').show()
        this.selectedModel = new Model(props)
        this.setCurrentName(this.selectedModel.name)
        if (props.xml)
            this.openDiagram(props.xml)
        this.enableSave()
    }

    appendListItems(arr) {
        const target = this.container.find('#custom-diagram-list')

        for (let { id, name, date } of arr) {
            const newRow = $(
                `<div title="Import diagram">
                    <div id="row-name-${(id ? id: 'new')}">${name}</div>
                    <div>${date}</div>
                </div>`)
            newRow.addClass('custom-diagram-list-row')
            if (this.selectedModel && id === this.selectedModel.id)
                this.selectedModel.bindListItem(newRow)
            newRow.click(() => {
                if (this.selectedModel && id === this.selectedModel.id)
                    return this.showMessage('This diagram is selected', true)
                this.importDiagram(id, newRow)
                this.hideDiagramList()
            })
            target.append(newRow)
        }
    }

    showDiagramList() {
        if(this.diagramList.length > 0)
            this.container.find('#custom-diagram-list-ovelray').fadeIn(300)
        else
            this.showMessage('There are currently no diagrams saved')
    }

    hideDiagramList() {
        this.container.find('#custom-diagram-list-ovelray').fadeOut(100)
    }

    setCurrentName(name) {
        return this.container.find('#diagram-name-input')
            .prop('disabled', false)
            .val(name)
            .change((evt) => { this.selectedModel.name = evt.target.value })
    }

    enableSave() {
        this.container.find('#save-button').prop('disabled', false)
    }

    updateListName(id, name) {
        this.container.find(`#row-name-${id}`).text(name)
    }

    dialog(message, acceptCallback, declineCallback) {
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

    showSpinner() {
        this.container.find('#spinner').show()
    }

    hideSpinner() {
        this.container.find('#spinner').fadeOut(50)
    }

    showMessage(message, isError) {
        const messageEl = $(`<div id="notification-container">
                                <pre>${message}</pre>
                            </div>`).appendTo(this.container)

        const resultClass = isError ? 'has-errors' : 'success'

        messageEl.addClass(resultClass).fadeIn(300)

        setTimeout(() => {
            messageEl.fadeOut(300).remove()
        }, 2000)
    }

    setHandlers() {
        const c = this.container

        const importBtn = c.find('#import-button'),
            saveBtn = c.find('#save-button'),
            newDiagramBtn = c.find('#new-diagram-button'),
            closeDiagramListBtn = c.find('#diagram-list-button-close')

        importBtn.click(() => {
            this.showDiagramList()
        })

        saveBtn.click(() => {
            this.saveDiagram()
        })

        newDiagramBtn.click(() => {
            this.newDiagram()
        })

        closeDiagramListBtn.click(() => {
            this.hideDiagramList()
        })
    }
}

export default App;