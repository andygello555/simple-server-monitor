var mongoose = require("mongoose");
const constants = require('../public/constants')
const { exec } = require('child_process');
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
        var valid = false
        
        // Execute the test command and return the output code
        exec(util.format(constants.COMMANDS.CHECK_READABLE, v), (err, stdout, stderr) => {
          console.log('stdout is: ' + stdout)
          console.log('stderr is: ' + stderr)
          console.log('error is: ' + err)
        }).on('exit', code => valid = !code)

        return valid
      },
      message: props => `${props.value} cannot be found/read from`
    }
  },
  lines: {
    type: Number,
    default: constants.DEFAULTS.LOGS.LINES,
    min: 0
  }
})

module.exports = mongoose.model('Log', LogSchema)
