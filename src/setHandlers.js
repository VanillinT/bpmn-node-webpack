import $ from 'jquery'

const setHandlers = (app) => {
    const container = app.container,
        diagramOverlay = container.find('#custom-diagram-list-ovelray'),
        propertisOverlay = container.find('#custom-properties-ovelray')

    const importBtn = container.find('#import-button'),
        saveBtn = container.find('#save-button'),
        newDiagramBtn = container.find('#new-diagram-button'),
        closeDiagramListBtn = container.find('#diagram-list-button-close')

    importBtn.click(() => {
        app.showDiagramList()
    })

    saveBtn.click(() => {
        app.saveDiagram()
    })

    newDiagramBtn.click(() => {
        app.newDiagram()
    })

    closeDiagramListBtn.click(() => {
        diagramOverlay.hide()
    })
}

export default setHandlers