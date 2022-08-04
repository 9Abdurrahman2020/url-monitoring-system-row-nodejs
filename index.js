const server = require("./lib/server");
const worker = require("./lib/worker");

const app = {};
app.init = () => {
  // initialize the server
  server.init();
  // initialize the worker
  worker.init();
};
app.init();
