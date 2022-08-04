const fs = require("fs");
const path = require("path");
const lib = {};
lib.basedir = path.join(__dirname, "../.data/");
// create a new file
lib.create = (dirName, fileName, data, callback) => {
  fs.open(
    `${lib.basedir}${dirName}/${fileName}.json`,
    "wx",
    (error, fileDescriptor) => {
      if (!error) {
        const stringData = JSON.stringify(data);
        fs.writeFile(fileDescriptor, stringData, (writeError) => {
          if (!writeError) {
            fs.close(fileDescriptor, (closingError) => {
              if (!closingError) {
                callback(200);
              } else {
                callback(closingError);
              }
            });
          } else {
            callback(writeError);
          }
        });
      } else {
        callback(error);
      }
    }
  );
};
// read a file from system
lib.read = (dirName, fileName, callback) => {
  fs.readFile(
    `${lib.basedir}${dirName}/${fileName}.json`,
    "utf8",
    (error, data) => {
      callback(error, data);
    }
  );
};
// get all the file from a directory
lib.list = (dir, callback) => {
  fs.readdir(`${lib.basedir}${dir}`, (error, fileNames) => {
    if (!error && fileNames) {
      const trimmedFileName = [];
      fileNames.forEach((fileName) => {
        trimmedFileName.push(fileName.replace(".json", ""));
      });
      callback(200, trimmedFileName);
    } else {
      callback(500, { error: "There was an error in server side" });
    }
  });
};
// update an exsiting file
lib.update = (dirName, fileName, data, callback) => {
  fs.open(
    `${lib.basedir}${dirName}/${fileName}.json`,
    "r+",
    (error, fileDescriptor) => {
      if (!error && fileDescriptor) {
        const stringData = JSON.stringify(data);
        fs.ftruncate(fileDescriptor, (truncateError) => {
          if (!truncateError) {
            fs.writeFile(fileDescriptor, stringData, (err) => {
              if (!err) {
                fs.close(fileDescriptor, (closeError) => {
                  if (!closeError) {
                    callback(200);
                  } else {
                    callback("file closing error occured");
                  }
                });
              } else {
                callback("file writing error");
              }
            });
          } else {
            callback("truncate Error occured");
          }
        });
      } else {
        callback("file Openning error");
      }
    }
  );
};
// delete the file from system
lib.delete = (dirName, fileName, callback) => {
  fs.unlink(`${lib.basedir}${dirName}/${fileName}.json`, (error) => {
    if (!error) {
      callback(true);
    } else {
      callback(error);
    }
  });
};
module.exports = lib;
