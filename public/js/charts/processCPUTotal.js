addFunctionOnWindowLoad(() => {
  var process_cpu_total = new ProcessCPUTotal()
})

class ProcessCPUTotal extends AbstractChart {
  constructor() {
    super()
  }

  init() {
    this.total = 0
    this.countUpOptions = {
      useEasing : true,
      useGrouping : true,
      separator : ',',
      decimal : '.',
      prefix : '',
      suffix : ''
    }
    this.countUp = new countUp.CountUp('process_cpu_total', this.total);
    this.countUp.start();

    this.ENDPOINT = exports.ROUTES.PROCESSES.CPU_USAGE
    this.UPDATE_TIMEOUT = exports.UPDATES.CHARTS.PROCESSES * 1000
  }

  parseData(data) {
    super.parseData(data)

    this.total = data.data.processes.filter(p => p.history[p.history.length - 1].running).map(p => {
      return p.history[0].cpuPercent
    }).reduce((a, b) => a + b, 0)

    return true
  }

  render() {
    this.countUp.update(this.total)
  }

  createChart() { return true }
}
