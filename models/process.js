var mongoose = require("mongoose");
var Schema = mongoose.Schema;

const percentValidator = {
  min: [0, 'Percentage usage cannot be below 0'],
  max: [100, 'Percentage usage cannot exceed 100'],
}

// Defines a snapshot of the process status in time
const ProcessHistorySchema = new Schema({
  time: Date,
  memPercent: {
    type: Number,
    min: percentValidator.min,
    max: percentValidator.max,
  },
  cpuPercent: {
    type: Number,
    min: percentValidator.min,
    max: percentValidator.max,
  },
  running: {
    type: Boolean,
    default: true,
  }
})

// Defines a process: pid, user and command along with snapshots through time
const ProcessSchema = new Schema(
  {
    pid: {
      type: Number,
      required: true
    },
    command: {
      type: String,
      required: true,
    },
    user: String,
    history: [ProcessHistorySchema],
  }
)

// Instance methods
/**
 * Checks whether the process is running by finding the latest history within the document and checking its 'running' field
 * @param {*} cb callback
 */
ProcessSchema.methods.isRunning = function(cb) {
  return this.latestHistory().running
}

/**
 * Gets the latest history within the document
 * @param {*} cb callback
 */
ProcessSchema.methods.latestHistory = function(cb) {
  return Math.max.apply(null, this.history.map(function(e) {
    return e.time
  }))
}

module.exports = mongoose.model('Process', ProcessSchema);
