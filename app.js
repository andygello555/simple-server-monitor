// DEBUG=simple-server-monitor:* npm start

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var { CronJob } = require('cron');
const constants = require('./public/constants')
const io = require("socket.io")();
const { spawn } = require('child_process');
const process = require('process')

// Routers
var indexRouter = require('./routes/index');
var processesRouter = require('./routes/processes');
var partitionsRouter = require('./routes/partitions');
var logsRouter = require('./routes/log');
var servicesRouter = require('./routes/services')

// Models to clear on start
var processModel = require('./models/process')
var partitionModel = require('./models/partition')
var serviceModel = require('./models/service')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Also host socket.io files
app.use('/socket.io', express.static(path.join(__dirname, 'node_modules/socket.io/client-dist/')));

// socket.io for log watching
app.io = io
io.on('connection', (socket) => {
  var tail
  var defaultCallbacks = {
    callStdout: function(data) {
      // Emit all lines over the socket
      var lines = data.toString().split('\n')
      if (lines.length) {
        io.emit('newLine', lines)
      }      
    },
    callStderr: function(data) {
      io.emit('error', data.toString())
    },
    callError: function(error) {
      io.emit('error', error.toString())
    },
    callClose: function(code) {
      io.emit('stopped', code)
    }
  }

  const assignDefaults = () => {
    tail.stdout.on("data", defaultCallbacks.callStdout);
    tail.stderr.on("data", defaultCallbacks.callStderr);
    tail.on('error', defaultCallbacks.callError);
    tail.on('close', defaultCallbacks.callClose);
  }

  // On disconnect we want to kill the tail process
  socket.on('disconnect', () => {
    console.log('Disconnecting from tail...')
    if (tail) {
      tail.stdin.pause()
      tail.kill()
    }
  });

  // The client has to send a message first saying what log that they want to 'tail'
  socket.on('startTail', (log) => {
    var options = [...constants.COMMANDS.TAIL_OPTIONS]
    options.push(...[log.lines.toString(), log.path])

    tail = spawn('tail', options)

    assignDefaults()
  })

  socket.on('startJournalCtl', (serviceUnit) => {
    var options = [...constants.COMMANDS.SERVICE_TAIL_LOG]
    options[1][1] = serviceUnit

    tail = spawn(...options)

    assignDefaults()
  })
});


app.use('/', indexRouter);
app.use('/processes', processesRouter);
app.use('/partitions', partitionsRouter);
app.use('/logs', logsRouter)
app.use('/services', servicesRouter)

// Setup database connection
var mongoDB = 'mongodb://127.0.0.1/simple-monitor';
console.log('Connecting to:', mongoDB);
mongoose.connect(mongoDB, { useNewUrlParser: true , useUnifiedTopology: true, useFindAndModify: false });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Empty all collections (except logs as those should persist)
process.stdout.write('Clearing all collections...');

(async () => {
  await processModel.deleteMany({}).exec()
  await partitionModel.deleteMany({}).exec()
  await serviceModel.deleteMany({}).exec()
})();

console.log('Done')

// Initialise all cronjobs
var { cronProcesses } = require('./public/js/tasks/processes');
var { cronPartitions } = require('./public/js/tasks/partitions');
var { cronServices } = require('./public/js/tasks/services');

// Call jobs first so that they are run on start
cronProcesses()
cronPartitions()

// Set a timeout so that cronProcesses has time to finish
setTimeout(() => {
  cronServices()
}, 2000)

var processJob = new CronJob(constants.UPDATES.CRONS.PROCESSES, cronProcesses, null, true, 'Europe/London')
var partitionJob = new CronJob(constants.UPDATES.CRONS.PARTITIONS, cronPartitions, null, true, 'Europe/London')
var serviceJob = new CronJob(constants.UPDATES.CRONS.SERVICES, cronServices, null, true, 'Europe/London')

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
