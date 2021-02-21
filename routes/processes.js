var express = require('express');
const Process = require('../models/process')
var router = express.Router();

/* GET processes. */
router.get('/', async function(req, res, next) {
  // Get the required processes using the query parameters
  const queryObj = { ...req.query }
  const excludedFields = ['page', 'sort', 'limit', 'fields']
  excludedFields.forEach(el => delete queryObj[el])

  // Handle gt, lt, gte and lte queries
  let queryStr = JSON.stringify(queryObj)
  queryStr = queryStr.replace(
    /\b(gte)|(gt)|(lte)|(lt)\b/g,
    match => `$${match}`
  )

  let query = Process.find(JSON.parse(queryStr))

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
  const processes = await query

  res.status(200).json({
    status: 'success',
    results: processes.length,
    data: { processes }
  })
});

/* GET the all processes with only their latest RUNNING history */
router.get('/latest', async function(req, res, next) {
  var processes = await Process.find()
  processes = processes.filter(p => p.history[p.history.length - 1].running).map(p => {
    return {
      pid: p.pid,
      command: p.command,
      latest: p.history[p.history.length - 1]
    }
  })

  res.status(200).json({
    status: 'success',
    results: processes.length,
    data: { processes }
  })
})

module.exports = router;
