const mongoose = require('mongoose')
const schemas = require('./schemas.js')
const connectionString = 'mongodb+srv://bpmn-app:ZndD5MQFEuNgSBoe@cluster0-cj5xv.mongodb.net/test?retryWrites=true&w=majority'

const bpmnDoc = mongoose.model('bpmnDocument', schemas.bpmnDocSchema)
const options = { useNewUrlParser: true, useUnifiedTopology: true }

execute = async (query) => {
  await mongoose.connect(connectionString, options).then(async res => {
    await query()
  })
  mongoose.connection.close()
}

saveDocument = async ({ name, xml }) => {
  const result = {message: '', isError: false}
  await execute(async () => {
    const newDoc = new bpmnDoc({name, xml})
    console.log(newDoc)
    await newDoc.save({ name, xml }).then(res => {
      console.log(result.message = `"${name}" saved successfuly`)
    }).catch(reason => {console.error(result.message = reason); result.isError = true})
  })
  return result
}

updateDocument = async ({ id, name, xml }) => {
  const result = {message: '', isError: false}
  await execute(async ()=> {
    await bpmnDoc.updateOne({id}, { name, xml }).then(res => {
      console.log(result.message = `"${name}" updated successfuly`)
    }).catch(reason => {console.error(result.message = reason); result.isError = true})
  })
  return result
}

getDocumentsList = async () => {
  let result = {};
  await execute(async () => {
    await bpmnDoc.find({}, (err, docs) => {
      result = docs.map(doc => {
        return {id: doc.id, name: doc.name, date: doc.date}
      })
    }).catch(reason => {console.error(result.message = reason); result.isError = true})
  })
  return result
}

module.exports = {
  saveDocument,
  updateDocument,
  getDocumentsList
}