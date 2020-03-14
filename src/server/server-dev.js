import webpack from 'webpack'
import devMiddleware from 'webpack-dev-middleware'
import hotMiddleware from 'webpack-hot-middleware'
import express from 'express'
import path from 'path'
import config from '../../webpack.dev'
import connectApi from './api'

const app = express(),
      DIST_DIR = __dirname,
      HTML = DIST_DIR + '/index.html',
      compiler = webpack(config)

connectApi(app)

const PORT = process.env.PORT || 5000;

app.use(express.static(DIST_DIR))

app.use(devMiddleware(compiler, {
  publicPath: config.output.publicPath
}))

app.use(hotMiddleware(compiler))

app.get('/', (req, res, next) => {
  compiler.outputFileSystem.readFile(HTML, (err, result) => {
    if(err) return next(err)
  })
  res.set('content-type', 'text/html')
  res.send(result)
  res.end()
})

app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}`)
});