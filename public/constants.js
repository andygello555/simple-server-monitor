function define(name, value) {
  Object.defineProperty(exports, name, {
      value:      value,
      enumerable: true
  });
}

// Maximum histories that can be stored within a Process document
define("MAX_HISTORIES", 30)

// Mongoose validator used for percentages
define("PERCENT_VALIDATOR", {
  min: [0, 'Percentage usage cannot be below 0'],
  max: [100, 'Percentage usage cannot exceed 100'],
})

// Any processes with a current usage below these thresholds will not be included Charts (such as memory/CPU usage charts)
define("PERCENT_THRESHOLD", {
  PROCESSES: {
    MEM: 1,
    CPU: 0.5,
  }
})

// Partition mount points that can be skipped when checking disk space usage
define("SKIP_DIRECTORIES", ['/boot/efi'])

// Files which cannot be logged (this is up to the user)
// NOTE THAT FILES WHICH THE SERVER DOESN'T HAVE PERMISSION TO LOG CANNOT BE TAILED ANYWAY
define("LOG_BLACKLIST", ['/etc/passwd'])

// Command headers to enable parsing of commands below
define("PS_HEADERS", ['pid', 'user', '%mem', '%cpu', 'command'])
define("DF_HEADERS", ['filesystem', 'size', 'used', 'available', 'usedPercent', 'mounted'])
define("DU_HEADERS", ['size', 'directory'])
define("LIST_UNITS_HEADERS", ['UNIT', 'LOAD', 'ACTIVE', 'SUB', 'DESCRIPTION'])

// All commands that are used to scrape system info
define("COMMANDS", {
  // Command will print out currently running processes along with CPU and MEM usage. Excludes 
  // header line, 'ps' process and 'head' process
  PS: ['sh', ['-c', `ps -o ${exports.PS_HEADERS.join(',')} ax | head -n -4 | tail -n +2`]],
  DF: 'df -k -x squashfs -x tmpfs -x devtmpfs | tail -n +2',
  GDU: 'gdu -cnx %s',
  DU: 'du -kx --max-depth=1 %s 2>/dev/null | head -n -1',
  CHECK_READABLE: 'test -r %s -a %s',
  TAIL_OPTIONS: ['-f', '-n'],
  SERVICE_LIST: 'systemctl list-units --type=service --no-pager --all | tail -n +2 | head -n -7 | sed "s/\\xe2\\x97\\x8f//g"',
  SERVICE_TAIL_LOG: ['journalctl', ['-u', '%s', '-b', '-f']],
  SERVICE_GET_PID: 'systemctl show --property MainPID --value %s',
})

// Routes used by frontend to get needed MongoDB docs
define('ROUTES', {
  PROCESSES: {
    LINE_CHART: `/processes?fields=pid,command,history.memPercent,history.cpuPercent,history.time&history.memPercent[gt]=${exports.PERCENT_THRESHOLD.PROCESSES.MEM}&history.cpuPercent[gt]=${exports.PERCENT_THRESHOLD.PROCESSES.CPU}`,
    LATEST: '/processes/latest',
  },
  PARTITIONS: {
    PIE: '/partitions?sort=mounted'
  }
})

// Defines the update times used for cronjobs as well as frontend setInterval times
define('UPDATES', {
  CRONS: {
    PROCESSES: '0 */1 * * * *',   // Every minute
    PARTITIONS: '0 */30 * * * *',  // Every 30 minutes
    SERVICES: '0 */30 * * * *',  // Every 30 minutes
  },
  CHARTS: {
    PROCESSES: 30,
    PARTITIONS: 240,
  }
})

// Defines the total number of legend labels for each kind of chart
define('LEGEND_TOTAL', {
  PROCESSES: {
    MEM: 10,
    CPU: 10,
  }
})

// Defines the percent at which the is-danger class should be used
define('IS_DANGER_PERCENT', 80)

// Defaults used within schema attributes
define('DEFAULTS', {
  LOGS: {
    LINES: 100
  }
})

// Numer of milleseconds before a cached query is considered stale
define('STALE_CACHED_QUERY', 15000)

// The number of milleseonds that slave widgets should wait before 
// calling their update function for the first time
define('SLAVE_WIDGET_START_OFFSET', 800)
