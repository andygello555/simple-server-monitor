addFunctionOnWindowLoad(() => {
  var list = new PartitionList()
  setInterval(() => { list.update() }, exports.UPDATES.CHARTS.PARTITIONS * 1000)
})

class PartitionList {
  constructor() {
    this.init()
    this.update()
  }

  init() {
    this.currentPartitions = []
    this.partitionContainer = document.getElementById('partition-list-container')
  }

  update() {
    // Fetches, parses and then renders the data
    this.getData().then(() => this.render())
  }

  getData() {
    // Get the process data from the endpoint
    return axios.get(exports.ROUTES.PARTITIONS.PIE).then(res => {
      this.parseData(res.data)
    }).catch(error => {
      console.log(error)
    }).then(() => { return })
  }

  parseData(data) {
    // Parse the data so that it can be used within the Chart
    if (data.status === 'success' && data.results) {
      this.newPartitions = []
      data.data.partitions.forEach((p, i) => {
        var ringPosition = ''
        if (i === 0) {
          ringPosition = '(outmost ring)'
        } else if (i === data.results - 1) {
          ringPosition = '(innermost ring)'
        }
        var template = `
        <div class='notification mb-4 ${p.usedPercent > exports.IS_DANGER_PERCENT ? 'is-danger' : 'is-success'}'>
          <nav class='level'>
            <div class='level-left'>
              <div class='level-item'><strong class='title is-5'>${p.filesystem}</strong></div>
              <div class='level-item is-size-7'>mounted on</div>
              <div class='level-item'><strong class='title is-5'>${p.mounted}</strong></div>
              <div class='level-item is-size-7'>${ringPosition}</div>
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
    } else {
      console.log(`Uh oh, request returned: ${data.status} with ${data.results} results`)
      return false
    }
  }

  render() {
    // Set up the text nodes that are children of the container
    if (this.currentPartitions.length !== this.newPartitions.length) {
      // Remove all the child nodes under partitionContainer
      while (this.partitionContainer.firstChild) {
        myNode.removeChild(this.partitionContainer.lastChild);
      }

      // Then append back empty children to fit the number of partitions in newPartitions 
      // as well as setting their ids
      for (var i=0; i<this.newPartitions.length; i++) {
        var par = document.createElement('p')
        par.setAttribute('id', `partition-no-${i}`)
        this.partitionContainer.appendChild(par)
      }
    }

    if (this.currentPartitions.length === 0 && this.newPartitions.length) {
      this.currentPartitions = new Array(this.newPartitions.length).fill('')
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

}
