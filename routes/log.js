var express = require('express');
var router = express.Router();

/* GET processes. */
router.get('/', async function(req, res, next) {
  res.status(200).json()
}