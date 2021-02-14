# simple-server-monitor
A web-based server monitoring tool built on express.js

## Technologies used

- [Express.js](https://expressjs.com/): for routing
- [MongoDB](https://www.mongodb.com/3) using [mongoose](https://mongoosejs.com/): for storing process and partition information
- [node-cron](https://github.com/kelektiv/node-cron): for scheduled spawning of shell processes
- [morgan](https://github.com/expressjs/morgan): for logging
- [pug](https://pugjs.org/api/getting-started.html): for templating
- [Chart.js](https://www.chartjs.org/): for drawing charts
- [axios](https://github.com/axios/axios): for requests
- [moment.js](https://momentjs.com/): for time related functionality
- Animation libraries:
  - [typed.js](https://mattboldt.github.io/typed.js/): for text animation
  - [CountUp.js](https://inorganik.github.io/countUp.js/): for animated counters
- Stylesheets and frameworks:
  - [Font Awesome 5](https://fontawesome.com/): for icons
  - [Bulma](https://bulma.io/): for responsive layout of elements

All client-side libraries are included in `public/dist` as minified `.js` files. This is so that the application can be used with no active internet connection.

## How it works

Cron tasks are scheduled using the `cron` package server-side. These tasks usually spawn shell commands, such as `ps` or `df`, to gain information about the system and its resources. The output of said commands is then parsed and input into their respective MongoDB collection. For example, `ps` is called to gain information about the running processes and their CPU and memory usage. This is then parsed and input into the Process collection in the `simple-monitor` MongoDB database. All this data is then requested by the frontend which displays it in a user-friendly way.<br/>
