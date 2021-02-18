class AbstractChart {
  constructor() {
    // Cannot construct this class
    if (new.target === AbstractChart) {
      throw new TypeError("Cannot construct AbstractChart instances directly")
    }

    this.abstractMethods = [this.init, this.render, this.createChart]

    // Have to override these methods
    this.abstractMethods.forEach(m => {
      if (m === undefined) {
        var fun = m.toString();
        fun = fun.substr('function '.length);
        fun = fun.substr(0, fun.indexOf('('));
        throw new TypeError(`Must override method: ${fun}`)
      }
    })

    this.init()
    this.update()
  }

  /**
   * Called within an update loop to update a widget
   * 
   * Will first get the data required, parse the data and then render the data
   */
  update() {
    // Fetches, parses and then renders the data
    if (this.UPDATE_TIMEOUT === undefined) {
      throw new TypeError("UPDATE_TIMEOUT property needs to be defined")
    }
    this.getData().then(() => this.render())

    // Call update again in this.UPDATE_TIMEOUT ms
    setTimeout(() => { this.update() }, this.UPDATE_TIMEOUT)
  }

  /**
   * Makes a request to this.ENDPOINT for the data required and then passes that data to parseData
   */
  getData() {
    // Get the data from the endpoint
    if (this.ENDPOINT === undefined) {
      throw new TypeError("ENDPOINT property needs to be defined")
    }

    return axios.get(this.ENDPOINT).then(res => {
      this.parseData(res.data)
    }).catch(error => {
      console.log(error)
    }).then(() => { return })
  }

  /**
   * Called after getData. Used to cleanse and parse data into their respective data structures. Needs to be extended.
   */
  parseData(data) {
    if (data.status !== 'success' || !data.results) {
      console.log(`Uh oh, request returned: ${data.status} with ${data.results} results`)
      return false
    }

    // You have to extend this function
  }
}