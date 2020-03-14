const mongoose = require('mongoose')

const ObjectId = mongoose.Schema.ObjectId;
 
const bpmnDocSchema = mongoose.Schema({
  id: ObjectId,
  name: String,
  xml: String,
  date: { type: Date, default: Date.now }
});

module.exports = {
  bpmnDocSchema
}