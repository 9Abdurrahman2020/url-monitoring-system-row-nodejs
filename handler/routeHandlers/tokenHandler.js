const { hash, jsonToJsObject } = require("../../helper/utilities");
const data = require("../../lib/data");
const { tokenGenetor } = require("../../helper/utilities");
const handler = {};
handler.tokenHandler = (requestedProperties, callback) => {
  const acceptedMethods = ["get", "post", "put", "delete"];
  if (acceptedMethods.indexOf(requestedProperties.method) > -1) {
    handler._token[requestedProperties.method](requestedProperties, callback);
  } else {
    callback(405);
  }
};
handler._token = {};
handler._token.get = (requestedProperties, callback) => {
  const token =
    typeof requestedProperties.queryStringObj.id === "string" &&
    requestedProperties.queryStringObj.id.trim().length === 20
      ? requestedProperties.queryStringObj.id
      : false;
  if (token) {
    data.read("tokens", token, (error, tokenData) => {
      if (!error && tokenData) {
        callback(200, jsonToJsObject(tokenData));
      } else {
        callback(404, {
          error: "Token not found ",
        });
      }
    });
  } else {
    callback(400, {
      error: "Invalid token !",
    });
  }
};
handler._token.post = (requestedProperties, callback) => {
  const phone =
    typeof requestedProperties.body.phone === "string" &&
    requestedProperties.body.phone.trim().length === 11
      ? requestedProperties.body.phone
      : false;
  const password =
    typeof requestedProperties.body.password === "string" &&
    requestedProperties.body.password.trim().length > 5
      ? requestedProperties.body.password
      : false;
  if (phone && password) {
    data.read("users", phone, (error, userData) => {
      if (!error && data) {
        const hashedPassword = hash(password);
        if (hashedPassword === jsonToJsObject(userData).password) {
          const tokenId = tokenGenetor(20);
          const expires = Date.now() + 60 * 60 * 1000;
          const tokenObj = {
            phone,
            token: tokenId,
            expires,
          };
          data.create("tokens", tokenId, tokenObj, (error2) => {
            if (error2 === 200) {
              callback(200, tokenObj);
            } else {
              callback(500, {
                error: "There is an error in server side",
              });
            }
          });
        } else {
          callback(400, { error: "Your password is not valid" });
        }
      } else {
        callback(404, { error: "User not found" });
      }
    });
  } else {
    callback("There is an error in your request");
  }
};
handler._token.put = (requestedProperties, callback) => {
  const token =
    typeof requestedProperties.body.token === "string" &&
    requestedProperties.body.token.trim().length === 20
      ? requestedProperties.body.token
      : false;
  const extend =
    typeof requestedProperties.body.extend === "boolean" &&
    requestedProperties.body.extend === true
      ? requestedProperties.body.extend
      : false;
  if (token && extend) {
    data.read("tokens", token, (error, tokenData) => {
      if (!error) {
        const tokenObj = jsonToJsObject(tokenData);
        if (tokenObj.expires > Date.now()) {
          tokenObj.expires = Date.now() + 60 * 60 * 1000;
          data.update("tokens", token, tokenObj, (err3) => {
            if (err3 === 200) {
              callback(200, tokenObj);
            } else {
              callback(500, {
                error: "There was an error occured in server side ",
              });
            }
          });
        } else {
          callback(400, {
            message: "Token already Expired",
          });
        }
      } else {
        callback(404, {
          error: "Invalid token",
        });
      }
    });
  } else {
    callback(400, {
      error: "There is a problem in your request",
    });
  }
};
handler._token.delete = (requestedProperties, callback) => {
  const token =
    typeof requestedProperties.queryStringObj.id === "string" &&
    requestedProperties.queryStringObj.id.trim().length === 20
      ? requestedProperties.queryStringObj.id
      : false;
  if (token) {
    data.delete("tokens", token, (error) => {
      if (error === true) {
        callback(200, { message: "Token deleted successfully" });
      } else {
        callback(400, {
          error: "There is a problem in your request",
        });
      }
    });
  } else {
    callback(400, {
      error: "There is a problem in your request",
    });
  }
};
handler._token.varify = (id, phone, callback) => {
  const token = typeof id === "string" && id.trim().length === 20 ? id : false;
  if (token) {
    data.read("tokens", id, (err, tokenData) => {
      if (!err && tokenData) {
        if (
          jsonToJsObject(tokenData).token === id &&
          jsonToJsObject(tokenData).expires > Date.now() &&
          jsonToJsObject(tokenData).phone === phone
        ) {
          callback(true);
        } else {
          callback(false);
        }
      } else {
        callback(false);
      }
    });
  } else {
    callback(false);
  }
};
module.exports = handler;
