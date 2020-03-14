import Modeler from 'bpmn-js/lib/Modeler'
import exampleXML from './example.bpmn'
import $ from 'jquery'
import setHandlers from "./setHandlers.js"

const badXML = '<xml></xml>'
class App {

    constructor() {
        this.modeler = new Modeler({
            container: '#canvas'
        })
        this.container = $('#app')
        this.diagramOverlay = this.container.find('#custom-diagram-list-ovelray')
        this.properteisOverlay = this.container.find('#custom-properties-ovelray')
        this.showMessage.bind(this)
        setHandlers(this)
    }

    openDiagram(xml) {
        this.modeler.importXML(xml, err => {
            if (err) {
                showMessage({message: err, error: true})
                console.error(err)
            }
        });
    }

    newDiagram() {
        this.modeler.createDiagram()
    }

    getDiagramList() {

    }

    importDiagram() {
        this.modeler.importXML(exampleXML)
    }

    showDiagramList(){
        $.ajax({
            type: "get",
            url: '/get_documents_list',
            contentType: 'application/json',
            success: (res) => {
                console.log(res)
                this.appendListItems(JSON.parse(res))
                this.showElement(this.diagramOverlay)
            }
        })
    }

    saveDiagram(name){
        this.modeler.saveXML({ format: true }, (err, xml) => {
            if (err) return showMessage({message: err, error: true})
            const data = JSON.stringify({
                name: name ?  name : 'bpmn diagram ' + new Date().toUTCString(),
                xml: xml
            })
            
            $.ajax({
                type: "POST",
                url: '/save_document',
                contentType: 'application/json',
                data: data,
                processData: false,
                success: (res) => {
                    this.showMessage(JSON.parse(res))
                }
            })
        });
    }

    showMessage({message, isError}) {
        const container = this.container.find('#notification-container'),
            textContainer = container.find('pre'),
            resultClass = isError ? 'has-errors' : 'success'

        this.showElement(container)

        container.addClass(resultClass)
        textContainer.text(message)

        setTimeout(() => {
            container.fadeOut(500).removeClass(resultClass);
            this.hideElement(container)
            textContainer.text('')
        }, 3000)
    }

    hideElement(el) {
        el.addClass('hidden')
    }

    showElement(el) {
        el.removeClass('hidden')
    }

    appendListItems(arr){
        const target = this.container.find('#custom-diagram-list table')
        for(let {name, date} of arr){
            target.append($(`<tr><td>${name}</td><td>${date}</td></tr>`))
        }
    }
}

export default App;