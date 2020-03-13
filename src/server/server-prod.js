import express from 'express'
import path from 'path'

const app = express(),
      DIST_DIR = __dirname + '/dist',
      HTML = DIST_DIR + '/index.html'
const PORT = process.env.PORT || 5000;

app.use(express.static(DIST_DIR));

app.get('/', (req, res) => {
  res.sendFile(path.resolve(HTML))
})

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`)
});