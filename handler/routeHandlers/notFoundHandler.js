const handler = {};
handler.notFoundHandler = (requestedProperties, callback) => {
  callback(404, {
    message: "Resource not found !",
  });
};
module.exports = handler;
