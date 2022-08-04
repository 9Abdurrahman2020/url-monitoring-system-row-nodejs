const url = require("url");
const { StringDecoder } = require("string_decoder");
const routes = require("../routes");
const { notFoundHandler } = require("../handler/routeHandlers/notFoundHandler");
const { jsonToJsObject } = require("./utilities");
const handler = {};
handler.handleReqRes = (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, "");
  const method = req.method.toLowerCase();
  const queryStringObj = parsedUrl.query;
  const headersObj = req.headers;
  const decoder = new StringDecoder("utf-8");
  let data = "";
  const requestedProperties = {
    path,
    trimmedPath,
    method,
    queryStringObj,
    headersObj,
  };

  const chosenRoute = routes[trimmedPath]
    ? routes[trimmedPath]
    : notFoundHandler;

  // by default nodejs sends data as stream
  req.on("data", (buffer) => {
    data += decoder.write(buffer);
  });
  req.on("end", () => {
    data += decoder.end();

    requestedProperties.body = jsonToJsObject(data);
    chosenRoute(requestedProperties, (statusCode, payload) => {
      statusCode = typeof statusCode === "number" ? statusCode : 500;
      payload = typeof payload === "object" ? payload : {};
      const payloadString = JSON.stringify(payload);
      res.writeHead(statusCode);
      res.end(payloadString);
    });
  });
};
module.exports = handler;
