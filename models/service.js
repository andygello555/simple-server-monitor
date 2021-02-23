var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// Defines a service unit THAT IS CURRENTLY IN MEMORY (list-units not list-unit-files)
const ServiceSchema = new Schema({
  unit: {
    type: String,
    required: true
  },
  pid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Process'
  },
  load: {
    type: String,
    required: true,
    enum: ['loaded', 'masked', 'not-found']
  },
  active: {
    type: String,
    required: true,
    enum: ['active', 'inactive', 'failed']
  },
  sub: {
    type: String,
    required: true,
    enum: ['running', 'exited', 'dead']
  },
  description: {
    type: String,
    required: false,
    default: ''
  }
})

module.exports = mongoose.model('Service', ServiceSchema)
