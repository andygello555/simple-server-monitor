addFunctionOnWindowLoad(() => {
  var total = new ProcessTotal()
  setInterval(() => { total.update() }, exports.UPDATES.CHARTS.PROCESSES * 1000)
})

class ProcessTotal {
  constructor() {
    this.init()
    this.update()
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
  }

  update() {
    // Fetches, parses and then renders the data
    this.getData().then(() => this.render())
  }

  getData() {
    // Get the process data from the endpoint
    return axios.get(exports.ROUTES.PROCESSES.RUNNING).then(res => {
      this.parseData(res.data)
    }).catch(error => {
      console.log(error)
    }).then(() => { return })
  }

  parseData(data) {
    // Parse the data so that it can be used within the Chart
    if (data.status === 'success' && data.results) {
      this.total = data.results
      return true
    } else {
      console.log(`Uh oh, request returned: ${data.status} with ${data.results} results`)
      return false
    }
  }

  render() {
    this.countUp.update(this.total)
  }
}