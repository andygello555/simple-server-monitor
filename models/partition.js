var mongoose = require("mongoose");
const constants = require('../public/constants')
var Schema = mongoose.Schema;

const SIZE_MIN = [0, 'Size cannot be below 0']
const percentValidator = constants.PERCENT_VALIDATOR

// Defines one directory within the partition's mounted directory
const PartitionRootDirectory = new Schema({
  size: {
    type: Number,
    min: SIZE_MIN,
  },
  directory: {
    type: String,
    required: true,
  }
})

// Defines one partitions information
const PartitionSchema = new Schema({
  filesystem: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    min: SIZE_MIN,
  },
  used: {
    type: Number,
    min: SIZE_MIN,
  },
  available: {
    type: Number,
    min: SIZE_MIN,
  },
  usedPercent: {
    type: Number,
    min: percentValidator.min,
    max: percentValidator.max,
  },
  mounted: {
    type: String,
    required: true
  },
  rootDirectories: [PartitionRootDirectory],
})

module.exports = mongoose.model('Partition', PartitionSchema)
