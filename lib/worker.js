const url = require("url");
const http = require("http");
const https = require("https");
const { jsonToJsObject } = require("../helper/utilities");
const data = require("./data");
const { sendMessage } = require("../helper/notifications");
const worker = {};

worker.getherAllChecks = () => {
  data.list("checks", (statusCode, payload) => {
    if (statusCode === 200 && payload.length > 0) {
      payload.forEach((check) => {
        data.read("checks", check, (err, checkData) => {
          if (!err && checkData) {
            const checkDataObj = jsonToJsObject(checkData);
            worker.validateCheckData(checkDataObj);
          } else {
            console.log("error while reading single file");
          }
        });
      });
    } else {
      console.log("Folder not found or empty");
    }
  });
};
worker.validateCheckData = (data) => {
  const checkData = { ...data };
  if (checkData && checkData.id) {
    checkData.state =
      typeof checkData === "string" &&
      ["up", "down"].indexOf(checkData.state) > -1
        ? checkData.state
        : "down";
    checkData.lastChecked =
      typeof checkData.lastChecked === "number" && checkData.lastChecked > 0
        ? checkData.lastChecked
        : false;
    worker.checkPerformer(checkData);
  }
};
worker.checkPerformer = (checkData) => {
  // check outCome initalize
  let checkOutcome = {
    error: false,
    value: false,
  };
  // track the response from request
  let outComeSent = false;
  const parsedUrl = url.parse(`${checkData.protocol}://${checkData.url}`, true);
  const hostName = parsedUrl.hostname;
  const path = parsedUrl.path;
  const requestDetails = {
    protocol: `${checkData.protocol}:`,
    hostname: hostName,
    path: path,
    method: checkData.method.toUpperCase(),
    timeout: checkData.timeOutSec * 1000,
  };
  const protocolToUse = checkData.protocol === "http" ? http : https;
  const req = protocolToUse.request(requestDetails, (res) => {
    const status = res.statusCode;
    checkOutcome.responsecode = status;
    if (!outComeSent) {
      worker.processCheckOutcome(checkData, checkOutcome);
      outComeSent = true;
    }
  });
  // check error
  req.on("error", (e) => {
    checkOutcome = {
      error: true,
      value: e,
    };
    if (!outComeSent) {
      worker.processCheckOutcome(checkData, checkOutcome);
      outComeSent = true;
    }
  });
  // check timeout or not
  req.on("timeout", () => {
    checkOutcome = {
      error: true,
      value: "timeout",
    };
    if (!outComeSent) {
      worker.processCheckOutcome(checkData, checkOutcome);
      outComeSent = true;
    }
  });
  // send req
  req.end();
};
worker.processCheckOutcome = (checkData, checkOutcome) => {
  const state =
    !checkOutcome.error &&
    checkData.successCode.indexOf(checkOutcome.responsecode) > -1
      ? "up"
      : "down";
  let alertWanted =
    checkData.lastChecked && checkData.status !== state ? true : false;
  const newCheckData = { ...checkData };
  newCheckData.state = state;
  newCheckData.lastChecked = Date.now();
  data.update("checks", checkData.id, newCheckData, (error) => {
    if (error === 200) {
      if (alertWanted) {
        worker.alertUserToStatechanged(newCheckData);
      } else {
        console.log("Alert is not needed as there is no state changed");
      }
    } else {
      console.log(`There is an error while updating ${checkData.id}`);
    }
  });
};
worker.alertUserToStatechanged = (newCheckData) => {
  const msg = `Alert: Your check for method: ${newCheckData.method} url: ${newCheckData.protocol}://${newCheckData.url} current status is: ${newCheckData.state}`;
  sendMessage(newCheckData.userPhone, msg, (feedback) => {
    console.log(feedback);
  });
};
worker.init = () => {
  worker.getherAllChecks();
  setInterval(() => {
    worker.getherAllChecks();
  }, 8000);
};
module.exports = worker;
