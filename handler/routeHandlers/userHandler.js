const { hash, jsonToJsObject } = require("../../helper/utilities");
const data = require("../../lib/data");
const tokenHandler = require("./tokenHandler");

const handler = {};
handler._user = {};
handler.userHandler = (requestedProperties, callback) => {
  const acceptedMethods = ["get", "post", "put", "delete"];
  if (acceptedMethods.indexOf(requestedProperties.method) > -1) {
    handler._user[requestedProperties.method](requestedProperties, callback);
  } else {
    callback(405);
  }
};
handler._user.post = (requestedProperties, callback) => {
  const firstName =
    typeof requestedProperties.body.firstName === "string" &&
    requestedProperties.body.firstName.trim().length > 0
      ? requestedProperties.body.firstName
      : false;
  const lastName =
    typeof requestedProperties.body.lastName === "string" &&
    requestedProperties.body.lastName.trim().length > 0
      ? requestedProperties.body.lastName
      : false;
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
  const tosAggrement =
    typeof requestedProperties.body.tosAggrement === "boolean" &&
    requestedProperties.body.tosAggrement === true
      ? requestedProperties.body.tosAggrement
      : false;
  if (firstName && lastName && phone && password && tosAggrement) {
    data.read("users", phone, (error, user) => {
      if (error) {
        const userData = {
          firstName,
          lastName,
          phone,
          password: hash(password),
          tosAggrement,
        };
        data.create("users", phone, userData, (msg) => {
          if (!msg) {
            callback(500, {
              error: "Couldn't create user",
            });
          } else {
            callback(200, {
              message: "successfully created user",
            });
          }
        });
      } else {
        callback(500, {
          error: "there's an error in server side",
        });
      }
    });
  } else {
    callback(400, {
      error: "There is some error in your request ",
    });
  }
};
handler._user.get = (requestedProperties, callback) => {
  const phone =
    typeof requestedProperties.queryStringObj.phone === "string" &&
    requestedProperties.queryStringObj.phone.trim().length === 11
      ? requestedProperties.queryStringObj.phone
      : false;
  tokenHandler._token.varify(
    requestedProperties.headersObj.token,
    phone,
    (verifed) => {
      if (verifed) {
        data.read("users", phone, (error, u) => {
          const user = { ...jsonToJsObject(u) };
          delete user.password;
          if (!error) {
            callback(200, user);
          } else {
            callback(400, {
              error: "user couldn't found",
            });
          }
        });
      } else {
        callback(403, {
          error: "Authentication failed",
        });
      }
    }
  );
};
handler._user.put = (requestedProperties, callback) => {
  const firstName =
    typeof requestedProperties.body.firstName === "string" &&
    requestedProperties.body.firstName.trim().length > 0
      ? requestedProperties.body.firstName
      : false;
  const lastName =
    typeof requestedProperties.body.lastName === "string" &&
    requestedProperties.body.lastName.trim().length > 0
      ? requestedProperties.body.lastName
      : false;
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
  const token =
    typeof requestedProperties.headersObj.token === "string" &&
    requestedProperties.headersObj.token.trim().length === 20
      ? requestedProperties.headersObj.token
      : false;
  if (phone) {
    tokenHandler._token.varify(token, phone, (verify) => {
      if (verify) {
        if (firstName || lastName || password) {
          data.read("users", phone, (error, uData) => {
            if (!error) {
              const userData = { ...jsonToJsObject(uData) };
              if (firstName) {
                userData.firstName = firstName;
              }
              if (firstName) {
                userData.lastName = lastName;
              }
              if (firstName) {
                userData.password = hash(password);
              }
              data.update("users", phone, userData, (error2) => {
                if (error2 === 200) {
                  callback(200, { message: "Successfully updated file" });
                } else {
                  callback(500, { error: "There is an error in server side" });
                }
              });
            } else {
              callback(500, { error: "There is an error while reading file" });
            }
          });
        } else {
          callback(400, {
            error: "There is an error in your request",
          });
        }
      } else {
        callback(400, {
          error: "Invalid token",
        });
      }
    });
  } else {
    callback(400, {
      error: "The phone number is not correct",
    });
  }
};
handler._user.delete = (requestedProperties, callback) => {
  const phone =
    typeof requestedProperties.queryStringObj.phone === "string" &&
    requestedProperties.queryStringObj.phone.trim().length === 11
      ? requestedProperties.queryStringObj.phone
      : false;
  const token =
    typeof requestedProperties.headersObj.token === "string" &&
    requestedProperties.headersObj.token.trim().length === 20
      ? requestedProperties.headersObj.token
      : false;
  if (phone) {
    tokenHandler._token.varify(token, phone, (verify) => {
      if (verify) {
        data.delete("users", phone, (result) => {
          if (result === true) {
            callback(200, { message: "Successfully deleted" });
          } else {
            callback(500, { error: "There is an error in server side" });
          }
        });
      } else {
        callback(403, {
          error: "Invalid token",
        });
      }
    });
  } else {
    callback(400, { error: "there is an error in your request" });
  }
};
module.exports = handler;
