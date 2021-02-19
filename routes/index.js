var express = require('express');
const Log = require('../models/log')
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET process info page */
router.get('/process', function(req, res, next) {
  res.render('process')
})

/* GET log viewer page */
router.get('/log-viewer', function(req, res, next) {
  res.render('log_viewer')
})

/* GET the log view page (this is just a detail page for a log) */
router.get('/log-viewer/:id', function(req, res, next) {
  Log.findById(req.params.id, (err, log) => {
    if (err) {
      return res.render('error', {
        message: `Log of ID: "${req.params.id}", not found`,
        error: {
          status: 404,
          stack: err.stack
        }
      })
    }
    return res.render('log_view', { ...log })
  })
})

module.exports = router;
