addFunctionOnWindowLoad(() => {
  var total = new ProcessTotal()
})

class ProcessTotal extends AbstractChart {
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
    this.countUp = new countUp.CountUp('process_total', this.total);
    this.countUp.start();

    this.ENDPOINT = exports.ROUTES.PROCESSES.LATEST
    this.UPDATE_TIMEOUT = exports.UPDATES.CHARTS.PROCESSES * 1000
  }

  parseData(data) {
    super.parseData(data)

    this.total = data.results

    return true
  }

  render() {
    this.countUp.update(this.total)
  }

  createChart() { return true }
}
