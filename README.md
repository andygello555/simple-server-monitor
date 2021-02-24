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
- [socket.io](https://socket.io/): for web-sockets which are used for real time log tailing
- Animation libraries:
  - [typed.js](https://mattboldt.github.io/typed.js/): for text animation
  - [CountUp.js](https://inorganik.github.io/countUp.js/): for animated counters
  - [bulma-toast](https://github.com/rfoel/bulma-toast): for toast notifications using Bulma (mostly to save time)
- Stylesheets and frameworks:
  - [Font Awesome 5](https://fontawesome.com/): for icons
  - [Bulma](https://bulma.io/): for responsive layout of elements

All client-side libraries are included in `public/dist` as minified `.js` files. This is so that the application can be used with no active internet connection.

## How it works

Cron tasks are scheduled using the `cron` package server-side. These tasks usually spawn shell commands, such as `ps` or `df`, to gain information about the system and its resources. The output of said commands is then parsed and input into their respective MongoDB collection. For example, `ps` is called to gain information about the running processes and their CPU and memory usage. This is then parsed and input into the Process collection in the `simple-monitor` MongoDB database. All this data is then requested by the frontend which displays it in a user-friendly way.<br/>

## Widgets

The dashboard contains most of the graph, list and count widgets

### Graphs

- Process Memory % Usage
- Process CPU % Usage
- Partition Pie

### Lists

- Top 3 processes by memory usage
- Top 3 processes by CPU usage
- Partition list

### Counts

- Total running processes
- Total % CPU usage (bit buggy still)

## Sections

### Dashboard

Contains most of the graphs for process resource usage, as well as overviews for the different sections available.

### Log viewer

Provides the ability to tail files on the host machine. The location and parameters of the tail persist as they are stored in the database. **Log files update in real time using web-sockets**.

### Systemd

Lists all services that are **loaded in memory** which can be filtered by _loaded-ness_, _active-ness_ and _running-ness_ as well as searched for using the real time search bar.<br/>

When individual services are clicked on this will open the **service detail view**, which provides a realtime log using **journalctl** and **web-sockets**. Along with an option to be **taken to the process which is bound to that service** (if it exists in the database/is running).

## FAQ

**Q. Why no CDNs?**<br/>
A. I want the client interface to be useable offline on the same network as the server. This just stems from my personal use case.
<br/><br/>
