const { checkHandler } = require("./handler/routeHandlers/checkHandler");
const { sampleHanler } = require("./handler/routeHandlers/sampleHandler");
const { tokenHandler } = require("./handler/routeHandlers/tokenHandler");
const { userHandler } = require("./handler/routeHandlers/userHandler");
const routes = {
  sample: sampleHanler,
  user: userHandler,
  token: tokenHandler,
  check: checkHandler,
};
module.exports = routes;
