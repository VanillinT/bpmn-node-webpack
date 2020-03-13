// logging component
function InteractionLogger(eventBus) {
    eventBus.on('element.hover', function (event) {
        console.log()
    })
}

InteractionLogger.$inject = ['eventBus']; // minification save

// extension module
var extensionModule = {
    __init__: ['interactionLogger'],
    interactionLogger: ['type', InteractionLogger]
};