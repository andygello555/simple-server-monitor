var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET process info page */
router.get('/process', function(req, res, next) {
  res.render('process')
})

module.exports = router;
