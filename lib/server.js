const http = require("http");
const environmentToExport = require("../helper/environment");
const { handleReqRes } = require("../helper/handlerReqRes");
const server = {};

server.createServer = () => {
  const serverInstance = http.createServer(server.handleReqRes);
  serverInstance.listen(environmentToExport.port, () => {
    console.log("server is running on port: ", environmentToExport.port);
  });
};
server.handleReqRes = handleReqRes;
server.init = () => {
  server.createServer();
};
module.exports = server;
