var express = require('express');
const Partition = require('../models/partition')
var router = express.Router();

/* GET partitions */
router.get('/', async function(req, res, next) {
  // Get the required partitions using the query parameters
  const queryObj = { ...req.query }
  const excludedFields = ['page', 'sort', 'limit', 'fields']
  excludedFields.forEach(el => delete queryObj[el])

  // Handle gt, lt, gte and lte queries
  let queryStr = JSON.stringify(queryObj)
  queryStr = queryStr.replace(
    /\b(gte)|(gt)|(lte)|(lt)\b/g,
    match => `$${match}`
  )

  let query = Partition.find(JSON.parse(queryStr))

  // Handle sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ')
    query = query.sort(sortBy)
  }

  // Handle projection
  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ')
    query = query.select(fields)
  } else {
    query.select('-__v')
  }

  // Handle limiting
  if (req.query.limit) {
    query = query.limit(req.query.limit * 1)
  }

  // Await and return the query
  const partitions = await query

  res.status(200).json({
    status: 'success',
    results: partitions.length,
    data: { partitions }
  })
})

module.exports = router
