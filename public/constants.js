function define(name, value) {
  Object.defineProperty(exports, name, {
      value:      value,
      enumerable: true
  });
}

define("MAX_HISTORIES", 10)
define("PS_HEADERS", ['pid', 'user', '%mem', '%cpu', 'command'])
define("COMMANDS", {
  // Command will print out currently running processes along with CPU and MEM usage. Excludes 
  // header line, 'ps' process and 'head' process
  PS: ['sh', ['-c', `ps -o ${exports.PS_HEADERS.join(',')} ax | head -n -4 | tail -n +2`]],
  DF: ['sh', ['-c', 'df -h -x squashfs -x tmpfs -x devtmpfs | tail -n +2']]  
})
define('ROUTES', {
  PROCESSES: {
    MEM: '/processes?sort=-history.memPercent&fields=pid,command,history.memPercent,history.time&history.memPercent[gt]=1',
    RUNNING: '/processes?fields=pid&sort=-history.time&history.running=true',
    MEM_TOP3: '/processes?fields=pid,command&history.running=true&sort=-history.memPercent&limit=3'
  }
})
define('UPDATES', {
  CRONS: {
    PROCESSES: '*/15 * * * * *'
  },
  CHARTS: {
    PROCESSES: 15
  }
})
define('LEGEND_TOTAL', {
  PROCESSES: {
    MEM: 10
  }
})
