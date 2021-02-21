addFunctionOnWindowLoad(() => {
  var top3Mem = new ProcessTop3Mem()
})

class ProcessTop3Mem extends AbstractChart {
  constructor() {
    super()
  }

  init() {
    this.oldTop3 = ['', '', '']

    this.ENDPOINT = exports.ROUTES.PROCESSES.LATEST
    this.UPDATE_TIMEOUT = exports.UPDATES.CHARTS.PROCESSES * 1000
  }

  parseData(data) {
    super.parseData(data)

    this.newTop3 = []

    data.data.processes.sort((a, b) => b.latest.memPercent - a.latest.memPercent).slice(0, 3).forEach(p => {
      this.newTop3.push(p.command.split(' ')[0].split('/').splice(-1).pop())
    })

    return true
  }

  render() {
    // Change the top 3 using typing.js
    for (var i=0; i<3; i++) {
      if (this.oldTop3[i] !== this.newTop3[i]) {
        console.log(`Changing top memory process no. ${i + 1}: ${this.oldTop3[i]} => ${this.newTop3[i]}`)
        var typed = new Typed(`#process-mem-no-${i + 1}`, {
          strings: [this.oldTop3[i], this.newTop3[i]],
          smartBackspace: true,
          showCursor: false
        })
      }
    }
    this.oldTop3 = this.newTop3
  }

  // Empty (doesn't need to be implemented)
  createChart() { return true }
}
