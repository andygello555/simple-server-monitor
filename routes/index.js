var express = require('express');
const Log = require('../models/log')
const Service = require('../models/service')
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

    try {
      return res.render('log_view', { logDoc: { ...log._doc } })
    } catch (error) {
      return res.render('error', {
        message: `Log of ID: "${req.params.id}", not found`,
        error: {
          status: 404,
          stack: error.stack
        }
      })
    }
  })
})

/* GET the systemd page */
router.get('/systemd', function(req, res, next) {
  res.render('systemd')
})

/* GET a service detail page */
router.get('/systemd/:id', function(req, res, next) {
  Service.findById(req.params.id, (err, service) => {
    if (err) {
      return res.render('error', {
        message: `Service of ID: "${req.params.id}", not found`,
        error: {
          status: 404,
          stack: err.stack
        }
      })
    }

    try {
      return res.render('service', { serviceDoc: { ...service._doc } })
    } catch (error) {
      return res.render('error', {
        message: `Service of ID: "${req.params.id}", not found`,
        error: {
          status: 404,
          stack: error.stack
        }
      })
    }
  })
})

module.exports = router;
