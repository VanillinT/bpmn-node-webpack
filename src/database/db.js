const mongoose = require('mongoose')
const schemas = require('./schemas.js')
const connectionString = 'mongodb+srv://bpmn-app:ZndD5MQFEuNgSBoe@cluster0-cj5xv.mongodb.net/test?retryWrites=true&w=majority'
//'mongodb://127.0.0.1:27017/bpmn'

const bpmnDoc = mongoose.model('bpmnDocument', schemas.bpmnDocSchema)
const options = { useNewUrlParser: true, useUnifiedTopology: true }

mongoose.connect(connectionString, options).then(res => {
  console.log('connected')
})

//accepts {name, xml}
saveDocument = async (props) => {
  let result = {}
  const newDoc = new bpmnDoc(props)
  await newDoc.save(props).then(({ _id, name, date, xml }) => {
    result = { id: _id, name, date, xml }
    console.log('Saved', result)
  }).catch(reason => { console.error(reason) })
  return result
}

updateDocument = async ({ id, name, xml }) => {
  let result = {}
  await bpmnDoc.updateOne({ _id: id }, ({$set: xml ? { name, xml } : { name } })).then(info => {
    result = info
    console.log(`"${name}" updated`)
  }).catch(reason => { console.error(reason) })
  return result
}

getDocumentsList = async () => {
  let result = {};
  await bpmnDoc.find({}, async (err, docs) => {
    if (err) return console.error(err)
    result = docs.map(({ _id, name, date, xml }) => {
      return { id: _id, name, date, xml }
    })
  }).catch(reason => { console.error(reason); })
  return result
}

module.exports = {
  saveDocument,
  getDocumentsList,
  updateDocument
}