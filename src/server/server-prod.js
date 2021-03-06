import express from 'express'
import path from 'path'
import connectApi from './api'

const app = express(),
      DIST_DIR = __dirname,
      HTML = DIST_DIR + '/index.html'
const PORT = process.env.PORT || 5000;

app.use(express.static(DIST_DIR));

app.get('/', (req, res) => {
  res.sendFile(HTML)
})

connectApi(app)

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`)
});