addFunctionOnWindowLoad(() => {
  var pie_chart = new PartitionPieChart()
})

class PartitionPieChart extends AbstractChart {
  constructor() {
    super()
  }

  init() {
    this.chartElement = document.querySelector('#partition-pie-chart')
    this.chart = this.createChart()
    this.colorArray = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6',
                       '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
                       '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A', 
                       '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
                       '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC', 
                       '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
                       '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680', 
                       '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
                       '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3', 
                       '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF']
    this.ENDPOINT = exports.ROUTES.PARTITIONS.PIE
    this.UPDATE_TIMEOUT = exports.UPDATES.CHARTS.PARTITIONS * 1000
  }

  parseData(data) {
    super.parseData(data)

    this.datasets = data.data.partitions.map(p => {
      return {
        data: p.rootDirectories.map(dir => { return dir.size }).concat(p.available),
        label: p.mounted,
        labels: p.rootDirectories.map(dir => {
          if (p.mounted === '/') {
            return dir.directory
          }
          return `${p.mounted}${dir.directory}`
        }).concat('free'),
        backgroundColor: this.colorArray.slice(0, p.rootDirectories.length).concat('#27e627')
      }
    })

    return true
  }

  render() {
    this.chart.data.datasets = this.datasets
    this.chart.update()
  }

  /**
   * Format bytes as human-readable text.
   * 
   * @param bytes Number of bytes.
   * @param si True to use metric (SI) units, aka powers of 1000. False to use 
   *           binary (IEC), aka powers of 1024.
   * @param dp Number of decimal places to display.
   * 
   * @return Formatted string.
   */
  humanFileSize(bytes, si=false, dp=1) {
    const thresh = si ? 1000 : 1024;

    if (Math.abs(bytes) < thresh) {
      return bytes + ' B';
    }

    const units = si 
      ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] 
      : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    let u = -1;
    const r = 10**dp;

    do {
      bytes /= thresh;
      ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


    return bytes.toFixed(dp) + ' ' + units[u];
  }

  createChart() {
    var that = this
    return new Chart(this.chartElement, {
      type: 'pie',
      data: {
        datasets: []
      },
      options: {
        responsive: true,
        tooltips: {
          callbacks: {
            label: function(tooltipItem, data) {
              var dataset = data.datasets[tooltipItem.datasetIndex];
              var index = tooltipItem.index;
              return `${dataset.labels[index]}: ${that.humanFileSize(dataset.data[index] * 1024)}`;
            }
          }
        }
      }
    })
  }
}