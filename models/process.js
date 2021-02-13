var mongoose = require("mongoose");
var Schema = mongoose.Schema;

const percentValidator = {
  min: [0, 'Percentage usage cannot be below 0'],
  max: [100, 'Percentage usage cannot exceed 100'],
}

// Defines a snapshot of the process status in time
const ProcessHistorySchema = new Schema({
  time: {
    type: Date,
    default: Date.now,
  },
  memPercent: {
    type: Number,
    min: percentValidator.min,
    max: percentValidator.max,
    default: 0.0,
  },
  cpuPercent: {
    type: Number,
    min: percentValidator.min,
    max: percentValidator.max,
    default: 0.0,
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
 */
ProcessSchema.methods.isRunning = function() {
  return this.latestHistory().running
}

/**
 * Gets the latest history within the document
 */
ProcessSchema.methods.latestHistory = function() {
  return this.history.reduce((a, b) => a.time > b.time ? a : b)
}

/**
 * Adds a new history instance
 * @param {*} processHistory the ProcessHistory object to add
 * @param {Boolean} save whether or not to save the model
 */
ProcessSchema.methods.addHistory = function(processHistory, save = true) {
  this.history.push(processHistory)
  if (save) {
    this.save(err => {
      if (err) console.log(err)
    })
  }
}

/**
 * Add a new history instance with the running flag not set.
 * In other words mark the process as not running
 * 
 * Will check if the Process is already stopped
 * @param {Boolean} save whether or not to save the model
 * @returns true if the process was marked as stopped, false otherwise
 */
ProcessSchema.methods.stop = function(save = true) {
  if (this.isRunning()) {
    this.addHistory({
      running: false
    }, save)
    return true
  }
  return false
}

/**
 * Removes the given amount of histories from the head of the list
 * 
 * Only if there are more histories than the given amount to remove
 * @param {int} amount the amount of histories to remove
 * @param {Boolean} save whether or not to save the model
 */
ProcessSchema.methods.removeHistories = function(amount, save = true) {
  if (this.history.length > amount) {
    this.history.splice(0, amount)
    if (save) {
      this.save(err => {
        if (err) console.log(err)
      })
    }
  }
}

/**
 * Checks if the latest history is greater than a given number of seconds
 * @param {int} staleSecs the number of seconds to check whether or not the latest history is greater than
 */
ProcessSchema.methods.checkStale = function(staleSecs = 30) {
  return ((new Date().getTime() - this.latestHistory().time.getTime()) / 1000) > staleSecs
}

module.exports = mongoose.model('Process', ProcessSchema);
