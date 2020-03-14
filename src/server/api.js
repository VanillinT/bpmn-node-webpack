module.exports = (app) => {
    const bodyParser = require('body-parser')
    const db = require('../database/db')

    app.post('/save_document',bodyParser.json(), async (req, res) => {
        const name = req.body.name,
            xml = req.body.xml
        const result = await db.saveDocument({name, xml})
        res.send(result)
    })

    app.get('/get_documents_list', async (req, res) => {
        const result = await db.getDocumentsList();
        res.send(JSON.stringify(result))
    })
}