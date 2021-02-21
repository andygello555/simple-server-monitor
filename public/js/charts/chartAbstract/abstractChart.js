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

    if (this.ENDPOINT === undefined) {
      throw new TypeError("ENDPOINT property needs to be defined")
    }

    // Increment the endpoint that's being used
    // This is so an offset can be applied to the first update so that cached values are used
    if (endpointsBeingUsed.has(this.ENDPOINT)) {
      endpointsBeingUsed.set(this.ENDPOINT, endpointsBeingUsed.get(this.ENDPOINT) + 1)
    } else {
      endpointsBeingUsed.set(this.ENDPOINT, 1)
    }

    setTimeout(() => {
      this.update()
    }, endpointsBeingUsed.get(this.ENDPOINT) > 1 ? exports.SLAVE_WIDGET_START_OFFSET : 50)
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
    // Get the data from the endpoint or from the cached storage
    var skipRequest = false
    var now = moment().valueOf()
    if (cachedQueries && cachedQueries.has(this.ENDPOINT)) {
      // Use the cached query if its not stale
      var query = cachedQueries.get(this.ENDPOINT)
      if (now - exports.STALE_CACHED_QUERY < query.time) {
        // Query is still within 'fresh' window so skip the request and call parseData with cached data
        console.log('Using query:', query, 'for', this.ENDPOINT)
        skipRequest = true

        // Returning a promise so that the flow of update is not disturbed
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve(this.parseData(query.data))
          }, 0)
        })
      } else {
        // Query is stale, delete and make the query
        cachedQueries.delete(this.ENDPOINT)
      }
    }

    if (!skipRequest) {
      // Make the query
      return axios.get(this.ENDPOINT).then(res => {
        this.parseData(res.data)
        cachedQueries.set(this.ENDPOINT, {
          data: { ...res.data },
          time: now,
          endpoint: this.ENDPOINT
        })
        console.log('Cached:', cachedQueries.get(this.ENDPOINT))
      }).catch(error => {
        console.log(error)
      }).then(() => { return })
    }
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