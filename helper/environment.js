const environment = {};
require("dotenv").config();
environment.staging = {
  port: 4000,
  envName: "staging",
  secretKey: "sgdfjsdfsdfhasdklfjasdlkfjhasdlskdfjsdf",
  maxChecks: 5,
  twilio: {
    fromPhone: "+17432339330",
    accountSid: "AC937e83773d3ef0c011cfd5b2c1b404bb",
    authToken: "ce39737c8afab4cf0ae1607c2402e02f",
  },
};
environment.development = {
  port: 5000,
  envName: "development",
  secretKey: "ertvrdvgmmkajerwecw,x,wemrhmwecrgcthexw",
  maxChecks: 5,
  twilio: {
    fromPhone: "+17432339330",
    accountSid: "AC937e83773d3ef0c011cfd5b2c1b404bb",
    authToken: "ce39737c8afab4cf0ae1607c2402e02f",
  },
};
const currentEnvironment =
  typeof process.env.NODE_ENV === "string" ? process.env.NODE_ENV : "staging";
const environmentToExport =
  typeof environment[currentEnvironment] === "object"
    ? environment[currentEnvironment]
    : environment.staging;
module.exports = environmentToExport;
