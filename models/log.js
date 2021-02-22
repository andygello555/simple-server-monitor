var mongoose = require("mongoose");
const constants = require('../public/constants')
const { execSync } = require('child_process');
const util = require('util');
var Schema = mongoose.Schema;

// Defines a LogSchema to watch
const LogSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        // First check if file is blacklisted
        if (constants.LOG_BLACKLIST.indexOf(v) > -1) {
          return false
        }
        
        // Execute the test command and return the output code
        try {
          execSync(util.format(constants.COMMANDS.CHECK_READABLE, v, v))
          return true
        } catch (error) {
          return false
        }
      },
      message: props => constants.LOG_BLACKLIST.indexOf(props.value) > -1 ? `${props.value} is blacklisted` : `${props.value} cannot be found/read from`
    }
  },
  lines: {
    type: Number,
    default: constants.DEFAULTS.LOGS.LINES,
    min: 0
  }
})

module.exports = mongoose.model('Log', LogSchema)
