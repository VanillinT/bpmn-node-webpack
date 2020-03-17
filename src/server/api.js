module.exports = (app) => {
    const bodyParser = require('body-parser')
    const db = require('../database/db')

    app.use(bodyParser.json())

    app.get('/get_documents_list', async (req, res) => {
        const result = await db.getDocumentsList();
        res.send(JSON.stringify(result))
    })

    app.post('/save_document', async (req, res) => {
        const name = req.body.name,
            xml = req.body.xml
        const result = await db.saveDocument({ name, xml })
        res.send(JSON.stringify(result))
    })

    app.post('/update_document', async (req, res) => {
        const id = req.body.id,
            name = req.body.name,
            xml = req.body.xml
        const result = await db.updateDocument({ id, name, xml })
        res.send(JSON.stringify(result))
    })

    app.get('*', (req, res) => {
        res.status = 501;
        res.send();
    })
}