const { spawn } = require('child_process');
const { pid } = require('process');
const Process = require('../../../models/process')

const PS_HEADERS = ['pid', 'user', '%mem', '%cpu', 'command']
// Command will print out currently running processes along with CPU and MEM usage. Excludes 
// header line, 'ps' process and 'head' process
const PS_COMMAND = ['sh', ['-c', `ps -o ${PS_HEADERS.join(',')} ax | head -n -4 | tail -n +2`]]

const cronProcesses = async () => {
  const ps = spawn(...PS_COMMAND)

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

  ps.stdout.on("data", data => {
    let scraped_pids_commands = []
    let rejected = 0
    // On data we want to parse each line into correct format
    data.toString().split('\n').forEach(async line => {
      // Skip empty lines
      if (!line) {
        rejected++
        return
      }
      
      let process = {}
      let process_history = {}
      let tokens = line.split(/\s+/)
      let i = 0, deficit = 0

      while (i - deficit < PS_HEADERS.length && tokens.length) {
        let token = tokens.shift()
        if (token) {
          switch (PS_HEADERS[i - deficit]) {
            case '%mem':
              process_history['memPercent'] = token
              break;
            case '%cpu':
              process_history['cpuPercent'] = token
              break;
            default:
              // Check if current line is the first header line, if so skip
              if (token === PS_HEADERS[i - deficit].toUpperCase()) {
                rejected++
                return
              } else {
                process[PS_HEADERS[i - deficit]] = token
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
      if (Object.keys(process).length + Object.keys(process_history).length !== PS_HEADERS.length) {
        rejected++
        return
      }
      
      // Check if there are processes of a duplicate pid
      //   1. If there is NOT create a new process document with its first history listing
      //   2. If there is then for all processes:
      //     a. If the process is of the same command create a new history listing + remove an amount of histories from the head of the list
      //     b. If the process is a different command create a new history listing with running = false
      // Query all pid + command combos that haven't been scraped from the latest ps call and mark them all as stopped
      processes = Process.find().where('pid').equals(process.pid).exec()
      if (processes.length) {
        // processes.forEach(p => {

        // })
        console.log('Already exists')
      } else {
        // Process of pid doesn't exist so create it as well as creating its first history
        // console.log(`${process.pid}: ${process.command} doesn't exist creating...`)
        scraped_pids_commands.push({
          '$and': [
            {'pid': process.pid},
            {'command': process.command}
          ]
        })
      }

      // console.log('process', process)
    });
    console.log('scraped', scraped_pids_commands[0])
  });

  ps.stderr.on("data", data => {
      console.log(`stderr: ${data}`);
  });

  ps.on('error', (error) => {
      console.log(`error: ${error.message}`);
  });
}

module.exports.cronProcesses = cronProcesses