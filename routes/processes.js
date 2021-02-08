var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/processes', function(req, res, next) {
  // Get the required processes using the query parameters
  res.send('respond with a resource');
});

module.exports = router;
