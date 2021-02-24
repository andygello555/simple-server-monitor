var express = require('express');
const Service = require('../models/service')
var router = express.Router();

/* GET a list of all services */
router.get('/', async function (req, res, next) {
  const services = await Service.find({})

  res.status(200).json({
    status: 'success',
    results: services.length,
    data: { services }
  })
})

module.exports = router
