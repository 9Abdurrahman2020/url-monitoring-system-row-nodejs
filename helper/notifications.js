const https = require("https");
const querystring = require("querystring");
const { twilio } = require("./environment");
const notifications = {};
notifications.sendMessage = (phone, msg, callback) => {
  const userPhone =
    typeof phone === "string" && phone.trim().length === 11
      ? phone.trim()
      : false;
  const userMsg =
    typeof msg === "string" &&
    msg.trim().length > 0 &&
    msg.trim().length <= 1600
      ? msg.trim()
      : false;
  if (phone && userMsg) {
    const payload = {
      from: twilio.fromPhone,
      to: `+88${userPhone}`,
      body: userMsg,
    };
    const stringifyPayload = querystring.stringify(payload);
    const requestDetails = {
      hostname: "api.twilio.com",
      method: "POST",
      path: `2010-04-01/Accounts/${twilio.accountSid}/Messages.json`,
      auth: `${twilio.accountSid}:${twilio.authToken}`,
      Headers: {
        "Content-type": "application/x-www-form-urlencoded",
      },
    };
    const req = https.request(requestDetails, (res) => {
      const status = res.statusCode;
      if (status === 200 || status === 201) {
        callback(false);
      } else {
        callback(`Status code was returned : ${status}`);
      }
    });
    req.on("error", (e) => {
      callback(e);
    });
    req.write(stringifyPayload);
    req.end();
  } else {
    callback(400, { error: "Phone number or message is not valid" });
  }
};
module.exports = notifications;
