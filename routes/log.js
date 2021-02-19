var express = require('express');
const Log = require('../models/log')
var router = express.Router();

/* Create new/update logs with similar names */
router.post('/', function(req, res, next) {
  const log = {
		name: req.body.name,
		path: req.body.path,
    lines: req.body.lines
	}

  var options = { upsert: true, new: true, setDefaultsOnInsert: true }
  Log.findOneAndUpdate({ name: log.name }, log, options, (error, log) => {
    if (error) {
      return res.status(404).send({
        errors: error.errors,
        message: 'An error has occured when trying to create this Log view'
      })
    }
    return res.status(201).send({
      message: 'Log view was created successfully!',
      log: log
    })
  });
})

/* DELETE a log */
router.delete("/:id", async (req, res) => {
	try {
		await Log.deleteOne({ _id: req.params.id })
		res.status(204).send()
	} catch {
		res.status(404)
		res.send({ error: "Log doesn't exist!" })
	}
})

/* GET logs */
router.get('/', async function(req, res, next) {
  // Get the required logs using the query parameters
  const queryObj = { ...req.query }
  const excludedFields = ['page', 'sort', 'limit', 'fields']
  excludedFields.forEach(el => delete queryObj[el])

  // Handle gt, lt, gte and lte queries
  let queryStr = JSON.stringify(queryObj)
  queryStr = queryStr.replace(
    /\b(gte)|(gt)|(lte)|(lt)\b/g,
    match => `$${match}`
  )

  let query = Log.find(JSON.parse(queryStr))

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
  const logs = await query

  res.status(200).json({
    status: 'success',
    results: logs.length,
    data: { logs }
  })
})

module.exports = router;
