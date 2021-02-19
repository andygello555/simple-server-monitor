const { exec } = require('child_process');
const constants = require('../../constants')
const Partition = require('../../../models/partition')
const util = require('util');

/**
 * Gets the partition root directory sizes
 * @param {*} partition 
 */
const runDu = (partition) => {
  return new Promise((resolve, reject) => {
    exec(util.format(constants.COMMANDS.DU, partition.mounted), (error, stdout, stderr) => {
      if (error && !error.toString().toLowerCase().includes('command failed')) {
        console.log(`error: ${error.message}`)
        reject(error)
      }

      // Only reject when the error is not a permission denied error
      if (stderr && !stderr.toString().toLowerCase().includes('permission denied')) {
        console.log(`stderr: ${stderr}`)
        reject(stderr)
      }

      partition['rootDirectories'] = []

      for (let line of stdout.toString().split('\n')) {
        if (!line) {
          continue
        }

        let partition_root_dir = {}
        let tokens = line.split(/\s+/)
        
        for (let header of constants.DU_HEADERS) {
          let token = tokens.shift()

          if (token) {
            if (header === 'size') {
              partition_root_dir[header] = parseInt(token)
            } else {
              // Remove mounted location from directory path only if the path is not root (e.g. /home)
              if (partition.mounted !== '/') {
                token = token.replace(partition.mounted, '')
              }
              partition_root_dir[header] = token
            }
          } else {
            continue
          }
        }

        partition.rootDirectories.push(partition_root_dir)
      }

      console.log('\n', partition)

      // Retrieve and update old partition if it exists otherwise create a new one
      Partition.updateOne({ filesystem: partition.filesystem, mounted: partition.mounted }, partition, { upsert: true }, err => {
        if (err) console.log(err)
      })
      resolve(true)
    })
  })
}

const cronPartitions = () => {
  exec(constants.COMMANDS.DF, (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`)
      return
    }

    if (stderr) {
      console.log(`stderr: ${stderr}`)
      return
    }

    console.log('\nStarting partition update:')

    let scraped = []

    for (let line of stdout.toString().split('\n')) {
      // Skip empty lines
      if (!line) {
       continue
      }

      let partition = {}
      let tokens = line.split(/\s+/)

      for (let header of constants.DF_HEADERS) {
        let token = tokens.shift()
        if (token) {
          switch (header) {
            case 'filesystem':
            case 'mounted':
              partition[header] = token
              break
            case 'usedPercent':
              partition[header] = parseInt(token.slice(0, -1))
              break
            default:
              partition[header] = parseInt(token)
              break
          }
        } else {
          continue
        }
      }

      // Get the partitions root directory sizes which is done asynchronously
      // Skip the partitions that are in constants.SKIP_DIRECTORIES
      if (constants.SKIP_DIRECTORIES.indexOf(partition.mounted) > -1) {
        console.log(`\tSkipping "${partition.mounted}"...`)
      } else {
        scraped.push({
          '$and': [
            {'filesystem': partition.filesystem},
            {'mounted': process.mounted}
          ]
        })
        console.log(`\tGetting info of roots at ${partition.mounted}`)
        runDu(partition)
      }

      // Delete non-scraped/skipped partitions
      Partition.deleteMany({ '$nor': scraped })
    }
  })
}

module.exports.cronPartitions = cronPartitions
