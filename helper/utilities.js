const crypto = require("crypto");
const environmentToExport = require("./environment");
const utilities = {};
utilities.jsonToJsObject = (jsonString) => {
  let bodyData;
  try {
    bodyData = JSON.parse(jsonString);
  } catch {
    bodyData = {};
  }
  return bodyData;
};
utilities.hash = (str) => {
  if (typeof str === "string" && str.length > 0) {
    const hash = crypto
      .createHmac("sha256", environmentToExport.secretKey)
      .update(str)
      .digest("hex");
    return hash;
  } else {
    return false;
  }
};
utilities.tokenGenetor = (tknLength) => {
  let length =
    typeof tknLength === "number" && tknLength > 0 ? tknLength : false;
  if (length) {
    const possibleChar = "abcdefghijklmnopqrstuvwxyz1234567890";
    let token = "";
    for (let i = 0; i < length; i++) {
      token += possibleChar[Math.floor(Math.random() * possibleChar.length)];
    }
    return token;
  } else {
    return false;
  }
};
module.exports = utilities;
