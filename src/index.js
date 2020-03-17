import "./styles/main.css"
import App from './app'


//Hot Module Replacement
if(module.hot) {
    module.hot.accept()
}

const app = new App()