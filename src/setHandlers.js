import $ from 'jquery'

const setHandlers = (app) => {
    const container = app.container,
        diagramOverlay = container.find('#custom-diagram-list-ovelray'),
        propertisOverlay = container.find('#custom-properties-ovelray')

    const importBtn = container.find('#import-button'),
        saveBtn = container.find('#save-button'),
        newDiagramBtn = container.find('#new-diagram-button'),
        selectDiagramListBtn = container.find('#diagram-list-button-select'),
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

    selectDiagramListBtn.click(() => {
        app.hideElement(diagramOverlay)
    })

    closeDiagramListBtn.click(() => {
        app.hideElement(diagramOverlay)
    })

    $('.overlay').click(() => app.hideElement($('.overlay')))
}

export default setHandlers