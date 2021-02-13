const { spawn } = require('child_process');
const Process = require('../../../models/process')
const constants = require('../../constants')


const cronProcesses = async () => {
  const ps = spawn(...constants.COMMANDS.PS)

  // Finds all the processes that haven't been scraped from 'ps' command
  // Process.find({
  //   '$nor': [
  //     {
  //       '$and': [
  //         {'pid': scraped_pid_1},
  //         {'command': scraped_command_1}
  //       ]
  //     },
  //     ...
  //   ]
  // })
  var ps_output = ""

  ps.stdout.on("data", async data => {
    ps_output += data.toString()
  });

  ps.stderr.on("data", data => {
      console.log(`stderr: ${data}`);
  });

  ps.on('error', (error) => {
      console.log(`error: ${error.message}`);
  });

  ps.on('close', async code => {
    console.log(`\nps finished (${code}). processing output`)

    let scraped = []
    let counters = {
      rejected: 0,
      stopped: 0,
      deleted: 0,
      new: 0,
      added: 0
    }

    for (let line of ps_output.split('\n')) {
      // Skip empty lines
      if (!line) {
        counters.rejected++
        continue
      }
      
      let process = {}
      let process_history = {}
      let tokens = line.split(/\s+/)
      let i = 0, deficit = 0

      while (i - deficit < constants.PS_HEADERS.length && tokens.length) {
        let token = tokens.shift()
        if (token) {
          switch (constants.PS_HEADERS[i - deficit]) {
            case '%mem':
              process_history['memPercent'] = parseFloat(token)
              break;
            case '%cpu':
              process_history['cpuPercent'] = parseFloat(token)
              break;
            default:
              // Check if current line is the first header line, if so skip
              if (token === constants.PS_HEADERS[i - deficit].toUpperCase()) {
                counters.rejected++
                continue
              } else {
                process[constants.PS_HEADERS[i - deficit]] = token
              }
              break;
          }
        } else {
          deficit++
        }
        i++
      }

      // Append the rest of the command onto the end of the command
      // This is because commands can contain whitespace which is used as delimeter
      if (tokens.length)
        process.command += tokens.join(' ')

      // Skip if all the required attributes have not been scraped
      if (Object.keys(process).length + Object.keys(process_history).length !== constants.PS_HEADERS.length) {
        counters.rejected++
        continue
      }
      
      // Check if there are processes of a duplicate pid
      //   1. If there is NOT create a new process document with its first history listing
      //   2. If there is then for all processes:
      //     a. If the process is of the same command create a new history listing + remove an amount of histories from the head of the list
      //     b. If the process is a different command create a new history listing with running = false
      //   3. If no process with the same command is found then go to step 1
      // Query all pid + command combos that haven't been scraped from the latest ps call and mark them all as stopped
      const process_query = await Process.find().where('pid').equals(process.pid)
      let done = false

      scraped.push({
        '$and': [
          {'pid': process.pid},
          {'command': process.command}
        ]
      })

      if (process_query.length) {
        // for await (const p of process_query) {
        process_query.forEach(p => {
          if (p.command === process.command) {
            // Add a new history if the commands are the same
            p.addHistory(process_history, false)
            p.removeHistories(constants.MAX_HISTORIES, false)
            counters.added++
            // console.log(`${p.command} === ${process.command}, adding history -> ${process.pid}:`, process_history)
            done = true
          } else if (p.pid === process.pid) {
            // If PIDs match but commands don't check if p is not running and if so then delete p and save process in its place
            if (p.isRunning()) {
              // console.log(`Replacing ${p.command} with ${process.command}`)
              p.delete()
              deleted++
            }
          } else {
            // Otherwise mark the process as stopped
            counters.stopped += p.stop(false) ? 1 : 0
          }
          p.save()
          // If there exists a process that matches the pid of the new process but not the command then insert the new process
        })
      }
      
      if (!done) {
        // Process of pid doesn't exist so create it as well as creating its first history
        // console.log(`${process.pid}: ${process.command} doesn't exist creating...`)
        process_doc = new Process(process)
        process_doc.addHistory(process_history)
        counters.new++
      }
    }

    // Now find all the processes that weren't matched in the most recent scrape and set them all to stopped
    if (scraped.length) {
      // console.log('Checking for stopped processes')
      for await (const p of Process.find({ '$nor': scraped })) {
        if (p.checkStale() && !p.isRunning()) {
          // console.log(`${p.command} is stale, deleting...`)
          p.delete()
          counters.deleted++
        } else {
          // console.log(`${p.command} has stopped`)
          counters.stopped += p.stop() ? 1 : 0
        }
      }
    }

    console.log(`Scraped ${scraped.length} lines`)
    console.log(`\tOf which new: ${counters.new}`)
    console.log(`\tOf which with new history: ${counters.added}`)
    console.log(`\tOf which rejected: ${counters.rejected}`)
    console.log(`\tOf which stopped: ${counters.stopped}`)
    console.log(`\tOf which deleted: ${counters.deleted}`)
  })
}

module.exports.cronProcesses = cronProcesses
