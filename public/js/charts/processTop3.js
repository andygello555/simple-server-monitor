addFunctionOnWindowLoad(() => {
  var top3 = new ProcessTop3()
  setInterval(() => { top3.update() }, exports.UPDATES.CHARTS.PROCESSES * 1000)
})

class ProcessTop3 {
  constructor() {
    this.init()
    this.update()
  }

  init() {
    this.oldTop3 = ['', '', '']
  }

  update() {
    // Fetches, parses and then renders the data
    this.getData().then(() => this.render())
  }

  getData() {
    // Get the process data from the endpoint
    return axios.get(exports.ROUTES.PROCESSES.MEM_TOP3).then(res => {
      this.parseData(res.data)
    }).catch(error => {
      console.log(error)
    }).then(() => { return })
  }

  parseData(data) {
    // Parse the data so that it can be used within the Chart
    if (data.status === 'success' && data.results === 3) {
      this.newTop3 = []
      for (var p of data.data.processes) {
        this.newTop3.push(p.command.split(' ')[0].split('/').splice(-1).pop())
      }
      return true
    } else {
      console.log(`Uh oh, request returned: ${data.status} with ${data.results} results`)
      return false
    }
  }

  render() {
    // Change the top 3 using typing.js
    for (var i=0; i<3; i++) {
      if (this.oldTop3[i] !== this.newTop3[i]) {
        console.log(`Changing top process no. ${i + 1}: ${this.oldTop3[i]} => ${this.newTop3[i]}`)
        var typed = new Typed(`#process-no-${i + 1}`, {
          strings: [this.oldTop3[i], this.newTop3[i]],
          smartBackspace: true,
          showCursor: false
        })
      }
    }
    this.oldTop3 = this.newTop3
  }

}
