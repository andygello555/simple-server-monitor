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

    this.ENDPOINT = exports.ROUTES.PROCESSES.LATEST
    this.UPDATE_TIMEOUT = exports.UPDATES.CHARTS.PROCESSES * 1000
  }

  parseData(data) {
    super.parseData(data)

    this.total = data.data.processes.map(p => {
      return p.latest.cpuPercent
    }).reduce((a, b) => a + b, 0)

    return true
  }

  render() {
    this.countUp.update(this.total)
  }

  createChart() { return true }
}
