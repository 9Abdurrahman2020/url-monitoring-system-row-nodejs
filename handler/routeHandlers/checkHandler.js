const { jsonToJsObject, tokenGenetor } = require("../../helper/utilities");
const data = require("../../lib/data");
const useToken = require("./tokenHandler");
const environment = require("../../helper/environment");
const handler = {};
handler.checkHandler = (requestedProperties, callback) => {
  const acceptedMethods = ["get", "post", "put", "delete"];
  if (acceptedMethods.indexOf(requestedProperties.method) > -1) {
    handler.check[requestedProperties.method](requestedProperties, callback);
  }
};
handler.check = {};
handler.check.get = (requestedProperties, callback) => {
  const id =
    typeof requestedProperties.queryStringObj.id === "string" &&
    requestedProperties.queryStringObj.id.trim().length === 20
      ? requestedProperties.queryStringObj.id
      : false;
  if (id) {
    data.read("checks", id, (error, checkData) => {
      if (!error && checkData) {
        const token =
          typeof requestedProperties.headersObj.token === "string" &&
          requestedProperties.headersObj.token.trim().length === 20
            ? requestedProperties.headersObj.token
            : false;
        useToken._token.varify(
          token,
          jsonToJsObject(checkData).userPhone,
          (isTokenVarify) => {
            if (isTokenVarify) {
              callback(200, jsonToJsObject(checkData));
            } else {
              callback(403, {
                error: "Authentication error",
              });
            }
          }
        );
      } else {
        callback(403, { error: "Authentication failed" });
      }
    });
  } else {
    callback(400, { error: "There is a problem in your request" });
  }
};
handler.check.post = (requestedProperties, callback) => {
  const protocol =
    typeof requestedProperties.body.protocol === "string" &&
    ["http", "https"].indexOf(requestedProperties.body.protocol) > -1
      ? requestedProperties.body.protocol
      : false;
  const url =
    typeof requestedProperties.body.url === "string" &&
    requestedProperties.body.url.trim().length > 0
      ? requestedProperties.body.url
      : false;
  const method =
    typeof requestedProperties.body.method === "string" &&
    ["get", "post", "put", "delete"].indexOf(requestedProperties.body.method) >
      -1
      ? requestedProperties.body.method
      : false;
  const successCode =
    typeof requestedProperties.body.successCode === "object" &&
    requestedProperties.body.successCode instanceof Array
      ? requestedProperties.body.successCode
      : false;
  const timeOutSec =
    typeof requestedProperties.body.timeOutSec === "number" &&
    requestedProperties.body.timeOutSec > 0 &&
    requestedProperties.body.timeOutSec < 6
      ? requestedProperties.body.timeOutSec
      : false;
  if (protocol && url && method && successCode && timeOutSec) {
    const token =
      typeof requestedProperties.headersObj.token === "string" &&
      requestedProperties.headersObj.token.trim().length === 20
        ? requestedProperties.headersObj.token
        : false;
    data.read("tokens", token, (err, tokenData) => {
      if (!err && tokenData) {
        const userPhone = jsonToJsObject(tokenData).phone;
        data.read("users", userPhone, (err2, userData) => {
          if (!err2 && userData) {
            useToken._token.varify(token, userPhone, (isTokenVarify) => {
              if (isTokenVarify) {
                const userObj = jsonToJsObject(userData);
                const userChecks =
                  typeof userObj.check === "object" &&
                  userObj.check instanceof Array
                    ? userObj.check
                    : [];
                if (userChecks.length <= environment.maxChecks) {
                  const id = tokenGenetor(20);
                  const checkObj = {
                    id,
                    method,
                    url,
                    protocol,
                    timeOutSec,
                    successCode,
                    userPhone,
                  };
                  data.create("checks", id, checkObj, (err3) => {
                    if (err3 === 200) {
                      userObj.check = userChecks;
                      userObj.check.push(id);
                      data.update("users", userPhone, userObj, (err4) => {
                        if (err4 === 200) {
                          callback(200, checkObj);
                        } else {
                          callback(500, {
                            error: "There is a problem is server side updating",
                          });
                        }
                      });
                    } else {
                      callback(500, {
                        errro: "There is a problem in server side",
                      });
                    }
                  });
                } else {
                  callback(500, { error: "User check is already full" });
                }
              } else {
                callback(404, {
                  error: "Authentication failed",
                });
              }
            });
          } else {
            callback(404, {
              error: "User not found",
            });
          }
        });
      } else {
        callback(403, {
          error: "Authentication problem",
        });
      }
    });
  } else {
    callback(403, {
      error: "There is a problem in your request",
    });
  }
};
handler.check.put = (requestedProperties, callback) => {
  const id =
    typeof requestedProperties.body.id === "string" &&
    requestedProperties.body.id.trim().length === 20
      ? requestedProperties.body.id
      : false;
  const protocol =
    typeof requestedProperties.body.protocol === "string" &&
    ["http", "https"].indexOf(requestedProperties.body.protocol) > -1
      ? requestedProperties.body.protocol
      : false;
  const url =
    typeof requestedProperties.body.url === "string" &&
    requestedProperties.body.url.trim().length > 0
      ? requestedProperties.body.url
      : false;
  const method =
    typeof requestedProperties.body.method === "string" &&
    ["get", "post", "put", "delete"].indexOf(requestedProperties.body.method) >
      -1
      ? requestedProperties.body.method
      : false;
  const successCode =
    typeof requestedProperties.body.successCode === "object" &&
    requestedProperties.body.successCode instanceof Array
      ? requestedProperties.body.successCode
      : false;
  const timeOutSec =
    typeof requestedProperties.body.timeOutSec === "number" &&
    requestedProperties.body.timeOutSec > 0 &&
    requestedProperties.body.timeOutSec < 6
      ? requestedProperties.body.timeOutSec
      : false;
  const token =
    typeof requestedProperties.headersObj.token === "string" &&
    requestedProperties.headersObj.token.trim().length === 20
      ? requestedProperties.headersObj.token
      : false;
  if (id) {
    if (protocol || url || method || successCode || timeOutSec) {
      data.read("checks", id, (err, checkData) => {
        if (!err && checkData) {
          const checkObject = { ...jsonToJsObject(checkData) };
          useToken._token.varify(
            token,
            checkObject.userPhone,
            (isTokenValid) => {
              if (isTokenValid) {
                if (protocol) {
                  checkObject.protocol = protocol;
                }
                if (url) {
                  checkObject.url = url;
                }
                if (method) {
                  checkObject.method = method;
                }
                if (successCode) {
                  checkObject.successCode = successCode;
                }
                if (timeOutSec) {
                  checkObject.timeOutSec = timeOutSec;
                }
                // update the check file
                data.update("checks", id, checkObject, (err3) => {
                  if (err3 === 200) {
                    callback(200, checkObject);
                  } else {
                    callback(500, {
                      error: "There is a problem in server side",
                    });
                  }
                });
              } else {
                callback(403, {
                  error: "Authentication error",
                });
              }
            }
          );
        } else {
          callback(500, { error: "There was an error in the server side" });
        }
      });
    } else {
      callback(400, { error: "You didn't give any info to update" });
    }
  } else {
    callback(400, {
      error: "There is a problem in your request",
    });
  }
};
handler.check.delete = (requestedProperties, callback) => {
  const id =
    typeof requestedProperties.queryStringObj.id === "string" &&
    requestedProperties.queryStringObj.id.trim().length === 20
      ? requestedProperties.queryStringObj.id
      : false;

  const token =
    typeof requestedProperties.headersObj.token === "string" &&
    requestedProperties.headersObj.token.trim().length === 20
      ? requestedProperties.headersObj.token
      : false;
  if (id) {
    data.read("checks", id, (error, checkData) => {
      if (!error && checkData) {
        const checkObjects = jsonToJsObject(checkData);
        useToken._token.varify(
          token,
          checkObjects.userPhone,
          (isTokenValid) => {
            if (isTokenValid) {
              data.delete("checks", id, (err) => {
                if (err === true) {
                  data.read(
                    "users",
                    checkObjects.userPhone,
                    (err2, userData) => {
                      if (!err2 && userData) {
                        const userObject = { ...jsonToJsObject(userData) };
                        const userCheck =
                          typeof userObject.check === "object" &&
                          userObject.check instanceof Array
                            ? userObject.check
                            : [];
                        if (userCheck.length > 0) {
                          if (userCheck.indexOf(id) > -1) {
                            userCheck.splice(userCheck.indexOf(id), 1);
                            userObject.check = userCheck;
                            data.update(
                              "users",
                              checkObjects.userPhone,
                              userObject,
                              (err3) => {
                                if (err3 === 200) {
                                  callback(200, {
                                    message: "Successfully deleted",
                                  });
                                } else {
                                  callback(500, {
                                    error: "There was a server side problem",
                                  });
                                }
                              }
                            );
                          } else {
                            callback(500, {
                              error:
                                "The id you want to remove is not in the user check list",
                            });
                          }
                        } else {
                          callback(500, {
                            error: "there was a server side error",
                          });
                        }
                      } else {
                        callback(500, {
                          error: "There was a server side error",
                        });
                      }
                    }
                  );
                } else {
                  callback(500, { error: "There was a server side error" });
                }
              });
            } else {
              callback(403, { error: "Authenticationi failed" });
            }
          }
        );
      } else {
        callback(404, { error: "Invalid id" });
      }
    });
  } else {
    callback(400, { error: "There is a problem in your request" });
  }
};
module.exports = handler;
