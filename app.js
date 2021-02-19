// DEBUG=simple-server-monitor:* npm start

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var { CronJob } = require('cron');
const constants = require('./public/constants')

// Routers
var indexRouter = require('./routes/index');
var processesRouter = require('./routes/processes');
var partitionsRouter = require('./routes/partitions');
var logsRouter = require('./routes/log');

// Models
var processModel = require('./models/process')
var partitionModel = require('./models/partition')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/processes', processesRouter);
app.use('/partitions', partitionsRouter);
app.use('/logs', logsRouter)

// Setup database connection
var mongoDB = 'mongodb://127.0.0.1/simple-monitor';
console.log('Connecting to:', mongoDB);
mongoose.connect(mongoDB, { useNewUrlParser: true , useUnifiedTopology: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Empty all collections (except logs as those should persist)
processModel.deleteMany({}, null, (err) => {
  if (err) console.log(err)
})
partitionModel.deleteMany({}, null, (err) => {
  if (err) console.log(err)
})

// Initialise all cronjobs
var { cronProcesses } = require('./public/js/tasks/processes')
var { cronPartitions } = require('./public/js/tasks/partitions')

// Call jobs first so that they are run on start
// cronProcesses()
// cronPartitions()

// var processJob = new CronJob(constants.UPDATES.CRONS.PROCESSES, cronProcesses, null, true, 'Europe/London')
// var partitionJob = new CronJob(constants.UPDATES.CRONS.PARTITIONS, cronPartitions, null, true, 'Europe/London')

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
