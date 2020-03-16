import Modeler from 'bpmn-js/lib/Modeler'
import $ from 'jquery'
import setHandlers from './setHandlers.js'
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

    updateListName() {
        this.correspondingRowInList.find('div:first-child').text(this.name)
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
        this.notification = $('#notification-container').hide()
        this.spinner = this.container.find('#spinner').hide()
        this.diagramListOverlay = this.container.find('#custom-diagram-list-ovelray').hide()
        this.properteisOverlay = this.container.find('#custom-properties-ovelray').hide()
        this.diagramNameInput = this.container.find('#diagram-name-input').change(()=>{this.selectedModel.name = this.diagramNameInput.val()})
        
        setHandlers(this)

        $(document).ajaxStart(() => {
            this.spinner.show()
        }).ajaxStop(() => {
            this.spinner.hide();
        }).ajaxError((evt, xhr, textStatus, errorThrown )=>{
            this.spinner.hide()
        })

        this.diagramList = null

        this.selectedModel = null

        this.getDiagramList()
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
        if (!this.selectedModel) {
            this.modeler.createDiagram(()=> {
                this.modeler.saveXML({ format: true }, (err, xml) => {
                    this.initiateModel({xml})
                    this.diagramNameInput.val(this.selectedModel.name).prop('disabled', false).focus().select()
                })
            })
        }
        else {
            this.saveDiagram()
        }
    }

    getDiagramList() {
        $request.getDocumentsList(res => {
            if (res != {}) {
                this.diagramList = res
                this.appendListItems(res)
            }
            else this.getDiagramList()
        })
    }

    //get item from database and assign a row in the list
    importDiagram(id, correspondingRowInList) {
        console.log(id, typeof(id))
        this.diagramListOverlay.hide()
        $request.getDocument(id, res => {
            console.log('got item', res)
            const props = res
            props.correspondingRowInList = correspondingRowInList
            console.log('importing',props)
            if (res === {}) return this.showMessage(`Diagram couldn't be found`, true);
            this.initiateModel(props)
        })
    }

    saveDiagram() {
        this.modeler.saveXML({ format: true }, (err, xml) => {

            this.selectedModel.xml = xml
            
            if (err) return this.showMessage(err, true)

            const data = this.selectedModel.getProps()

            //diagram has assigned id (is in database)
            if (this.selectedModel.id) {
                $request.updateDocument(data, (res) => {
                    console.log('saving', this.selectedModel)
                    this.showMessage(`${this.selectedModel.name} updated successfuly`)
                    this.selectedModel.updateListName()
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
    }

    initiateModel(props) {
        this.selectedModel = new Model(props)
        this.diagramNameInput.val(this.selectedModel.name).prop('disabled', false)
        if(props.xml)
            this.openDiagram(props.xml)
    }

    showMessage(message, isError) {
        const container = this.notification,
            textContainer = container.find('pre'),
            resultClass = isError ? 'has-errors' : 'success'

        container.show()

        container.addClass(resultClass)
        textContainer.text(message)

        setTimeout(() => {
            container.fadeOut(500).removeClass(resultClass);
            container.hide()
            textContainer.text('')
        }, 3000)
    }

    appendListItems(arr) {
        const target = this.container.find('#custom-diagram-list')
        for (let { id, name, date } of arr) {
            const newRow = $(
                `<div title="Import diagram">
                    <div>${name}</div>
                    <div>${date}</div>
                </div>`)
            newRow.addClass('custom-diagram-list-row')
            if (this.selectedModel && id === this.selectedModel.id)
                this.selectedModel.bindListItem(newRow)
            newRow.click(() => {
                console.log(this.selectedModel)
                if (this.selectedModel && id === this.selectedModel.id)
                    return this.showMessage('This diagram is selected', true)
                this.importDiagram(id, newRow)
            })
            target.append(newRow)
        }
    }

    showDiagramList() {
        this.diagramListOverlay.show()
    }

}

export default App;