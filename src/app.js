import Modeler from 'bpmn-js/lib/Modeler'
import exampleXML from './example.bpmn'
import $ from 'jquery'
import extensionModule from './customButtonGroup'
const badXML = '<xml></xml>'
const App = () => {
    const container = $('#app')
    const modeler = new Modeler({
        container: '#canvas',
        additionalModules: [extensionModule]
    })

    openDiagram(exampleXML);

    function openDiagram(xml) {
        modeler.importXML(xml, err => {
            if (err) {
                container.addClass('has-errors').find('#error-placeholder pre').text(err)
                setTimeout(() => {
                    container.find('#error-placeholder').fadeOut(500);
                }, 3000)
                console.error(err)
            }
        });
    }

    function saveDiagram(done) {
        modeler.saveXML({ format: true }, (err, xml) => {
            done(err, xml)
        })
    }
}

export default App;