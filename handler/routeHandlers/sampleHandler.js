const handler = {};
handler.sampleHanler = (requestedProperties, callback) => {
  callback(200, {
    message: "This is sample route !",
  });
};
module.exports = handler;
