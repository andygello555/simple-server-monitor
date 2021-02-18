addFunctionOnWindowLoad(() => {
  var process_cpu_chart = new ProcessCPUUsageChart()
})

class ProcessCPUUsageChart extends AbstractChart {
  constructor() {
    super()
  }

  init() {
    this.chartElement = document.querySelector('#process-cpu-chart')
    this.chart = this.createChart()

    this.ENDPOINT = exports.ROUTES.PROCESSES.CPU
    this.UPDATE_TIMEOUT = exports.UPDATES.CHARTS.PROCESSES * 1000
  }

  parseData(data) {
    super.parseData(data)

    // Get the minimum and maximum time from the list of returned processes
    this.labels = []
    var historyTimes = data.data.processes.map(o => o.history.map(h => new Date(h.time))).flat()
    var pids = data.data.processes.map(o => o.pid).sort((a, b) => a - b)
    this.chart.options.scales.xAxes[0].ticks.min = new Date(Math.min.apply(Math, historyTimes))
    this.chart.options.scales.xAxes[0].ticks.max = new Date(Math.max.apply(Math, historyTimes))

    // Set minimum and maximum time to be the minimum and maximum time of process history
    var time = this.chart.options.scales.xAxes[0].ticks
    var timeDiff = moment(time.max).diff(moment(time.min), 's')

    for (var i = 0; i <= timeDiff; i+=exports.UPDATES.CHARTS.PROCESSES) {
      var _label = moment(time.min).add(i, 's').format('YYYY-MM-DD HH:mm:ss');
      this.labels.push(_label)
    }

    // Now we parse the processes into datasets
    this.datasets = data.data.processes.map(p => {
      return {
        data: p.history.sort((a,b)=>b.time-a.time).map(e => { return { x: e.time, y: e.cpuPercent } }),
        label: `${p.pid}: ${p.command.split(' ')[0].split('/').splice(-1).pop()}`,
        borderColor: this.colorFromPid(p.pid, pids[0], pids[pids.length - 1]),
        fill: false,
        showLine: true
      }
    })

    return true
  }

  render() {
    this.chart.data.datasets = this.datasets
    this.chart.data.labels = this.labels
    this.chart.update()
  }

  createChart() {
    return new Chart(this.chartElement, {
      type: "line",
      data: {
        labels: [],
        datasets: []
      },
      options: {
        responsive: true,
        scales: {
          xAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Time'
            },
            gridLines: {
              display: false
            },
            type: 'time',
            time: {
              parser: 'YYYY-MM-DD HH:mm:ss',
              unit: 'minute',
              displayFormats: {
                minute: 'h:mm a'
              }
            },
            ticks: {
              source: 'data',
              min: '',
              max: ''
            }
          }],
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'CPU Usage (%)'
            },
            gridLines: {
              display: false
            },
          }]
        },
        title: {
          display: false,
          text: "Process CPU Usage"
        },
        legend: {
          display: true,
          labels: {
            filter: function(item, data) {
              return item.datasetIndex < exports.LEGEND_TOTAL.PROCESSES.CPU
            }
          }
        }
      }
    })
  }

  colorFromPid(pid, minPid, maxPid) {
    // Maps a pid within a given range to a hex colour
    return `#${Math.floor((pid - minPid) * (0xffe3e3 - 0x4d0505) / (maxPid - minPid) + 0x4d0505).toString(16)}`
  }
}
