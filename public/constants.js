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

// Command headers to enable parsing of commands below
define("PS_HEADERS", ['pid', 'user', '%mem', '%cpu', 'command'])
define("DF_HEADERS", ['filesystem', 'size', 'used', 'available', 'usedPercent', 'mounted'])
define("DU_HEADERS", ['size', 'directory'])

// All commands that are used to scrape system info
define("COMMANDS", {
  // Command will print out currently running processes along with CPU and MEM usage. Excludes 
  // header line, 'ps' process and 'head' process
  PS: ['sh', ['-c', `ps -o ${exports.PS_HEADERS.join(',')} ax | head -n -4 | tail -n +2`]],
  DF: 'df -k -x squashfs -x tmpfs -x devtmpfs | tail -n +2',
  GDU: 'gdu -cnx %s',
  DU: 'du -kx --max-depth=1 %s 2>/dev/null | head -n -1',
  CHECK_READABLE: 'test -r -a %s'
})

// Routes used by frontend to get needed MongoDB docs
define('ROUTES', {
  PROCESSES: {
    MEM: `/processes?sort=-history.memPercent&fields=pid,command,history.memPercent,history.time&history.memPercent[gt]=${exports.PERCENT_THRESHOLD.PROCESSES.MEM}`,
    CPU: `/processes?sort=-history.cpuPercent&fields=pid,command,history.cpuPercent,history.time&history.cpuPercent[gt]=${exports.PERCENT_THRESHOLD.PROCESSES.CPU}`,
    RUNNING: '/processes?fields=history.cpuPercent,history.time,history.running',
    CPU_USAGE: '/processes?fields=history.cpuPercent,history.time,history.running',
    MEM_TOP3: '/processes?fields=pid,command,history.memPercent,history.time,history.running',
    CPU_TOP3: '/processes?fields=pid,command,history.cpuPercent,history.time,history.running',
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
