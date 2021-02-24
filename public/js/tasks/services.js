const { exec } = require('child_process');
const Service = require('../../../models/service')
const Process = require('../../../models/process')
const constants = require('../../constants')
const util = require('util');


const getMainPid = (service) => {
  return new Promise((resolve, reject) => {
    exec(util.format(constants.COMMANDS.SERVICE_GET_PID, service.unit), (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`)
        reject(error)
      }

      if (stderr) {
        console.log(`stderr: ${stderr}`)
        reject(stderr)
      }

      Process.findOne({ pid: parseInt(stdout) }, (err, process) => {
        if (err) {
          console.log(err)
          reject(err)
        }

        // Set pid to the process.id or null (if the process doesn't exist)
        service['pid'] = process ? process.id : process

        // console.log(service)

        Service.updateOne({ unit: service.unit }, service, { upsert: true }, err => {
          if (err) console.log(err)
        })

        resolve(true)
      })
    })
  })
}

const cronServices = () => {
  // - Call list-units to get the individual units that are in memory
  // - Iterate over lines
  // - Seperate columns
  // - For each line (unit) get the main pid of the command

  console.log('\nScraping service info...')

  exec(constants.COMMANDS.SERVICE_LIST, (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`)
    }

    if (stderr) {
      console.log(`stderr: ${stderr}`)
    }

    let scraped = []

    for (let line of stdout.toString().split('\n')) {
      if (!line) {
        continue
      }

      var service = {}
      var tokens = line.split(/\s+/)
      let i = 0, deficit = 0

      while (i - deficit < constants.LIST_UNITS_HEADERS.length && tokens.length) {
        let header = constants.LIST_UNITS_HEADERS[i - deficit].toLowerCase()
        let token = tokens.shift()

        if (token) {
          service[header] = token
        } else {
          deficit++
        }
        i++
      }

      // Add the rest of the tokens (if there are any) to the description
      if (tokens.length)
        service.description += tokens.join(' ')

      // Get the MainPID of the service (if there is one)
      console.log(`\tGetting info of: ${service.unit}`)
      scraped.push({ 'unit': service.unit })
      getMainPid(service)
    }

    // Delete all services that were not scraped as they are no longer in memory
    Service.deleteMany({ '$nor': scraped })
  })
}

module.exports.cronServices = cronServices
