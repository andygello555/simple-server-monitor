addFunctionOnWindowLoad(() => {
  var list = new PartitionList()
})

class PartitionList extends AbstractChart {
  constructor() {
    super()
  }

  init() {
    this.currentPartitions = []
    this.partitionContainer = document.getElementById('partition-list-container')

    this.ENDPOINT = exports.ROUTES.PARTITIONS.PIE
    this.UPDATE_TIMEOUT = exports.UPDATES.CHARTS.PARTITIONS * 1000
  }

  parseData(data) {
    super.parseData(data)

    this.newPartitions = []

    // Populate the list with a notification block for each partition which includes:
    // - Filesystem
    // - Colour depending on how much of that partition is used (see constants.IS_DANGER_PERCENT)
    // - Mounted on
    // - Ring position, in pie chart (if innermost or outermost)
    // - Used percentage
    data.data.partitions.forEach((p, i) => {
      var ringPosition = ''
      if (i === 0) {
        ringPosition = "<div class='level-item is-size-7'>(outmost ring)</div>"
      } else if (i === data.results - 1) {
        ringPosition = "<div class='level-item is-size-7'>(innermost ring)</div>"
      }
      var template = `
      <div class='notification mb-4 ${p.usedPercent > exports.IS_DANGER_PERCENT ? 'is-danger' : 'is-success'}'>
        <nav class='level'>
          <div class='level-left'>
            <div class='level-item'><strong class='title is-5'>${p.filesystem}</strong></div>
            <div class='level-item is-size-7'>mounted on</div>
            <div class='level-item'><strong class='title is-5'>${p.mounted}</strong></div>
            ${ringPosition}
          </div>
          <div class='level-right'>
            <div class='level-item is-size-6'>${p.usedPercent}%</div>
          </div>
        </nav>
      </div>
      `
      this.newPartitions.push(template)
    })

    return true
  }

  render() {
    // Set up the text nodes that are children of the container
    if (this.currentPartitions.length !== this.newPartitions.length) {
      // Remove all the child nodes under partitionContainer
      while (this.partitionContainer.firstChild) {
        this.partitionContainer.removeChild(this.partitionContainer.lastChild);
      }

      // Then append back empty children to fit the number of partitions in newPartitions 
      // as well as setting their ids
      for (var i=0; i<this.newPartitions.length; i++) {
        var par = document.createElement('div')
        par.setAttribute('id', `partition-no-${i}`)
        this.partitionContainer.appendChild(par)
      }

      // Match the sizes of the data arrays
      while (this.currentPartitions.length !== this.newPartitions.length) {
        if (this.currentPartitions.length <= this.newPartitions.length) {
          // Push empty elements onto currentPartitions as there are now more partitions
          this.currentPartitions.push('')
        } else {
          // In the case that there are less partitions now than there once was remove elements from currentPartitions
          this.currentPartitions.pop()
        }
      }
    }

    // Change the partition list using typing.js
    for (var i=0; i<this.newPartitions.length; i++) {
      if (this.currentPartitions[i] !== this.newPartitions[i]) {
        console.log(`Changing partition no. ${i}: ${this.currentPartitions[i]} => ${this.newPartitions[i]}`)
        var typed = new Typed(`#partition-no-${i}`, {
          strings: [this.currentPartitions[i], this.newPartitions[i]],
          smartBackspace: true,
          showCursor: false
        })
      }
    }
    this.currentPartitions = this.newPartitions
  }

  /**
   * Needs to be overriden, but it's not used in the partition list widget
   */
  createChart() { return true }
}
