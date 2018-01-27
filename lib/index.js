'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();









































var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

var cpx = require("cpx");
var fs = require("fs");
var path = require("path");
var fsExtra = require("fs-extra");
var rimraf = require("rimraf");
var mv = require("mv");
var makeDir = require("make-dir");
var archiver = require("archiver");

var FileManagerPlugin = function () {
  function FileManagerPlugin(options) {
    classCallCheck(this, FileManagerPlugin);

    this.options = this.setOptions(options);
    this.isWin = /^win/.test(process.platform);

    /* cpx options */
    this.cpxOptions = {
      clean: false,
      includeEmptyDirs: true,
      update: false
    };
  }

  createClass(FileManagerPlugin, [{
    key: "setOptions",
    value: function setOptions(userOptions) {
      var defaultOptions = {
        verbose: false,
        moveWithMkdirp: false,
        onStart: {},
        onEnd: {}
      };

      for (var key in defaultOptions) {
        if (userOptions.hasOwnProperty(key)) {
          defaultOptions[key] = userOptions[key];
        }
      }

      return defaultOptions;
    }
  }, {
    key: "checkOptions",
    value: function checkOptions(stage) {
      var _this = this;

      if (this.options.verbose && Object.keys(this.options[stage]).length) {
        console.log("FileManagerPlugin: processing " + stage + " event");
      }

      var operationList = [];

      if (this.options[stage] && Array.isArray(this.options[stage])) {
        this.options[stage].map(function (opts) {
          return operationList.push.apply(operationList, toConsumableArray(_this.parseFileOptions(opts, true)));
        });
      } else {
        operationList.push.apply(operationList, toConsumableArray(this.parseFileOptions(this.options[stage])));
      }

      if (operationList.length) {
        operationList.reduce(function (previous, fn) {
          return previous.then(function (retVal) {
            return fn(retVal);
          });
        }, Promise.resolve());
      }
    }
  }, {
    key: "copyDirectory",
    value: function copyDirectory(source, destination, resolve, reject) {
      var _this2 = this;

      if (this.options.verbose) {
        console.log("  - FileManagerPlugin: Start copy source file: " + source + " to destination file: " + destination);
      }

      cpx.copy(source, destination, this.cpxOptions, function (err) {
        if (err && _this2.options.verbose) {
          console.log("  - FileManagerPlugin: Error - copy failed", err);
          reject(err);
        }

        if (_this2.options.verbose) {
          console.log("  - FileManagerPlugin: Finished copy source: " + source + " to destination: " + destination);
        }

        resolve();
      });
    }
  }, {
    key: "replaceHash",
    value: function replaceHash(filename) {
      return filename.replace("[hash]", this.fileHash);
    }
  }, {
    key: "parseFileOptions",
    value: function parseFileOptions(options) {
      var _this3 = this;

      var optKeys = Object.keys(options);

      var commandOrder = [];

      for (var i = 0; i < optKeys.length; i++) {
        var fileAction = optKeys[i];
        var fileOptions = options[fileAction];

        switch (fileAction) {
          case "copy":
            var _loop = function _loop(key) {
              var command = {
                source: _this3.replaceHash(fileOptions[key].source),
                destination: _this3.replaceHash(fileOptions[key].destination)
              };

              if (!command.source || !command.destination) {
                if (_this3.options.verbose) {
                  console.log("  - FileManagerPlugin: Warning - copy parameter has to be formated as follows: { source: <string>, destination: <string> }");
                }
                return {
                  v: void 0
                };
              }

              commandOrder.push(function () {
                return new Promise(function (resolve, reject) {
                  // if source is a file, just copyFile()
                  // if source is a NOT a glob pattern, simply append **/*
                  var fileRegex = /(\*|\{+|\}+)/g;
                  var matches = fileRegex.exec(command.source);

                  if (matches === null) {
                    fs.lstat(command.source, function (sErr, sStats) {
                      fs.lstat(command.destination, function (dErr, dStats) {
                        if (sStats.isFile()) {
                          var destination = dStats && dStats.isDirectory() ? command.destination + "/" + path.basename(command.source) : command.destination;

                          if (_this3.options.verbose) {
                            console.log("  - FileManagerPlugin: Start copy source: " + command.source + " to destination: " + destination);
                          }

                          /*
                           * If the supplied destination is a directory copy inside.
                           * If the supplied destination is a directory that does not exist yet create it & copy inside                      
                           */

                          var pathInfo = path.parse(destination);

                          var execCopy = function execCopy(src, dest) {
                            fsExtra.copy(src, dest, function (err) {
                              if (err) reject(err);
                              resolve();
                            });
                          };

                          if (pathInfo.ext === "") {
                            makeDir(destination).then(function (mPath) {
                              execCopy(command.source, destination + "/" + path.basename(command.source));
                            });
                          } else {
                            execCopy(command.source, destination);
                          }
                        } else {
                          var sourceDir = command.source + (command.source.substr(-1) !== "/" ? "/" : "") + "**/*";
                          _this3.copyDirectory(sourceDir, command.destination, resolve, reject);
                        }
                      });
                    });
                  } else {
                    _this3.copyDirectory(command.source, command.destination, resolve, reject);
                  }
                });
              });
            };

            for (var key in fileOptions) {
              var _ret = _loop(key);

              if ((typeof _ret === "undefined" ? "undefined" : _typeof(_ret)) === "object") return _ret.v;
            }

            break;

          case "move":
            var _loop2 = function _loop2(key) {
              var command = {
                source: _this3.replaceHash(fileOptions[key].source),
                destination: _this3.replaceHash(fileOptions[key].destination)
              };

              if (!command.source || !command.destination) {
                if (_this3.options.verbose) {
                  console.log("  - FileManagerPlugin: Warning - move parameter has to be formated as follows: { source: <string>, destination: <string> }");
                }
                return {
                  v: void 0
                };
              }

              commandOrder.push(function () {
                return new Promise(function (resolve, reject) {
                  if (_this3.options.verbose) {
                    console.log("  - FileManagerPlugin: Start move source: " + command.source + " to destination: " + command.destination);
                  }

                  mv(command.source, command.destination, { mkdirp: _this3.options.moveWithMkdirp }, function (err) {
                    if (err) {
                      if (_this3.options.verbose) {
                        console.log("  - FileManagerPlugin: Error - move failed", err);
                      }
                      reject(err);
                    }

                    if (_this3.options.verbose) {
                      console.log("  - FileManagerPlugin: Finished move source: " + command.source + " to destination: " + command.destination);
                    }

                    resolve();
                  });
                });
              });
            };

            for (var key in fileOptions) {
              var _ret2 = _loop2(key);

              if ((typeof _ret2 === "undefined" ? "undefined" : _typeof(_ret2)) === "object") return _ret2.v;
            }

            break;

          case "delete":
            if (!Array.isArray(fileOptions)) {
              throw Error("  - FileManagerPlugin: Fail - delete parameters has to be type of 'strings array' but was '" + (typeof fileOptions === "undefined" ? "undefined" : _typeof(fileOptions)) + "'. Process canceled.");
            }

            var _loop3 = function _loop3(key) {
              var path = _this3.replaceHash(fileOptions[key]);

              commandOrder.push(function () {
                return new Promise(function (resolve, reject) {
                  if (_this3.options.verbose) {
                    console.log("  - FileManagerPlugin: Starting delete path " + path);
                  }

                  if (typeof path !== "string") {
                    if (_this3.options.verbose) {
                      console.log("  - FileManagerPlugin: Warning - delete parameter has to be type of string. Process canceled.");
                    }
                    reject();
                  }

                  rimraf(path, {}, function (response) {
                    if (_this3.options.verbose && response === null) {
                      console.log("  - FileManagerPlugin: Finished delete path " + path);
                    }
                    resolve();
                  });
                });
              });
            };

            for (var key in fileOptions) {
              _loop3(key);
            }

            break;

          case "mkdir":
            var _loop4 = function _loop4(key) {
              var path = _this3.replaceHash(fileOptions[key]);

              if (_this3.options.verbose) {
                console.log("  - FileManagerPlugin: Creating path " + path);
              }

              if (typeof path !== "string") {
                if (_this3.options.verbose) {
                  console.log("  - FileManagerPlugin: Warning - mkdir parameter has to be type of string. Process canceled.");
                }
                return {
                  v: void 0
                };
              }

              commandOrder.push(function () {
                return makeDir(path);
              });
            };

            for (var key in fileOptions) {
              var _ret4 = _loop4(key);

              if ((typeof _ret4 === "undefined" ? "undefined" : _typeof(_ret4)) === "object") return _ret4.v;
            }

            break;

          case "archive":
            var _loop5 = function _loop5(key) {
              var command = {
                source: _this3.replaceHash(fileOptions[key].source),
                destination: fileOptions[key].destination
              };

              if (!command.source || !command.destination) {
                if (_this3.options.verbose) {
                  console.log("  - FileManagerPlugin: Warning - archive parameter has to be formated as follows: { source: <string>, destination: <string> }");
                }
                return {
                  v: void 0
                };
              }

              commandOrder.push(function () {
                return new Promise(function (resolve, reject) {
                  var fileRegex = /(\*|\{+|\}+)/g;
                  var matches = fileRegex.exec(command.source);

                  var isGlob = matches !== null ? true : false;

                  fs.lstat(command.source, function (sErr, sStats) {
                    var output = fs.createWriteStream(command.destination);
                    var archive = archiver("zip", {
                      zlib: { level: 9 }
                    });

                    archive.on("error", function (err) {
                      reject(err);
                    });

                    archive.pipe(output);

                    if (isGlob) archive.glob(command.source);else if (sStats.isFile()) archive.file(command.source, { name: path.basename(command.source) });else if (sStats.isDirectory()) archive.directory(command.source, false);

                    archive.finalize().then(resolve());
                  });
                });
              });
            };

            for (var key in fileOptions) {
              var _ret5 = _loop5(key);

              if ((typeof _ret5 === "undefined" ? "undefined" : _typeof(_ret5)) === "object") return _ret5.v;
            }

            break;

          default:
            break;
        }
      }

      return commandOrder;
    }
  }, {
    key: "apply",
    value: function apply(compiler) {
      var _this4 = this;

      compiler.plugin("compilation", function (compliation) {
        try {
          _this4.checkOptions("onStart");
        } catch (error) {
          compliation.errors.push(error);
        }
      });

      compiler.plugin("after-emit", function (compliation, callback) {
        _this4.fileHash = compliation.hash;
        try {
          _this4.checkOptions("onEnd");
        } catch (error) {
          compliation.errors.push(error);
        }
        callback();
      });
    }
  }]);
  return FileManagerPlugin;
}();

module.exports = FileManagerPlugin;
//# sourceMappingURL=index.js.map
