const { io } = require('../../app')
const { spawn } = require('child_process');
const constants = require('../constants')

const logViewer = (socket) => {
  console.log('A client connected');
  var tail

  // On disconnect we want to kill the tail process
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

  // The client has to send a message first saying what log that they want to 'tail'
  socket.on('startTail', (log) => {
    var options = constants.COMMANDS.TAIL_OPTIONS
    options.push(...[log.lines.toString(), log.path])
    console.log(options)

    tail = spawn('tail', options)

    tail.stdout.on("data", data => {
      io.emit('newLine', data.toString())
    });
  
    tail.stderr.on("data", data => {
      io.emit('error', data.toString())
    });
  
    tail.on('error', (error) => {
      io.emit('error', error.toString())
    });

    tail.on('close', code => {
      io.emit('stopped', code)
    })
  })
}

module.exports.logViewer = logViewer
