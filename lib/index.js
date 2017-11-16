'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var cpr = require('cpr');
var rimraf = require('rimraf');
var mv = require('mv');
var makeDir = require('make-dir');

var FileManagerPlugin = function () {
  function FileManagerPlugin(options) {
    _classCallCheck(this, FileManagerPlugin);

    this.options = this.setOptions(options);
    this.isWin = /^win/.test(process.platform);

    /* cpr options */
    this.cprOptions = {
      deleteFirst: true,
      overwrite: true,
      confirm: true
    };
  }

  _createClass(FileManagerPlugin, [{
    key: 'setOptions',
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
    key: 'checkOptions',
    value: function checkOptions(stage) {
      var _this = this;

      if (this.options.verbose && Object.keys(this.options[stage]).length) {
        console.log('FileManagerPlugin: processing ' + stage + ' event');
      }

      var operationList = [];

      if (this.options[stage] && Array.isArray(this.options[stage])) {
        this.options[stage].map(function (opts) {
          return operationList.push.apply(operationList, _toConsumableArray(_this.parseFileOptions(opts, true)));
        });
      } else {
        operationList.push.apply(operationList, _toConsumableArray(this.parseFileOptions(this.options[stage])));
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
    key: 'parseFileOptions',
    value: function parseFileOptions(options) {
      var _this2 = this;

      var optKeys = Object.keys(options);

      var commandOrder = [];

      for (var i = 0; i < optKeys.length; i++) {

        var fileAction = optKeys[i];
        var fileOptions = options[fileAction];

        switch (fileAction) {

          case 'copy':
            var _loop = function _loop(key) {

              var command = fileOptions[key];

              if (!command.source || !command.destination) {
                if (_this2.options.verbose) {
                  console.log('  - FileManagerPlugin: Warning - copy parameter has to be formated as follows: { source: <string>, destination: <string> }');
                }
                return {
                  v: void 0
                };
              }

              commandOrder.push(function () {
                return new Promise(function (resolve, reject) {

                  if (_this2.options.verbose) {
                    console.log('  - FileManagerPlugin: Start copy source: ' + command.source + ' to destination: ' + command.destination);
                  }

                  cpr(command.source, command.destination, _this2.cprOptions, function (err, files) {
                    if (err && _this2.options.verbose) {
                      console.log('  - FileManagerPlugin: Error - copy failed', err);
                    }

                    if (_this2.options.verbose) {
                      console.log('  - FileManagerPlugin: Finished copy source: ' + command.source + ' to destination: ' + command.destination);
                    }

                    resolve(err);
                  });
                });
              });
            };

            for (var key in fileOptions) {
              var _ret = _loop(key);

              if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
            }

            break;

          case 'move':
            var _loop2 = function _loop2(key) {

              var command = fileOptions[key];

              if (!command.source || !command.destination) {
                if (_this2.options.verbose) {
                  console.log('  - FileManagerPlugin: Warning - move parameter has to be formated as follows: { source: <string>, destination: <string> }');
                }
                return {
                  v: void 0
                };
              }

              commandOrder.push(function () {
                return new Promise(function (resolve, reject) {

                  if (_this2.options.verbose) {
                    console.log('  - FileManagerPlugin: Start move source: ' + command.source + ' to destination: ' + command.destination);
                  }

                  mv(command.source, command.destination, { mkdirp: _this2.options.moveWithMkdirp }, function (err) {
                    if (err && _this2.options.verbose) {
                      console.log('  - FileManagerPlugin: Error - move failed', err);
                    }

                    if (_this2.options.verbose) {
                      console.log('  - FileManagerPlugin: Finished move source: ' + command.source + ' to destination: ' + command.destination);
                    }

                    resolve(err);
                  });
                });
              });
            };

            for (var key in fileOptions) {
              var _ret2 = _loop2(key);

              if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
            }

            break;

          case 'delete':
            var _loop3 = function _loop3(key) {

              var path = fileOptions[key];

              commandOrder.push(function () {
                return new Promise(function (resolve, reject) {

                  if (_this2.options.verbose) {
                    console.log('  - FileManagerPlugin: Starting delete path ' + path);
                  }

                  if (typeof path !== 'string') {
                    if (_this2.options.verbose) {
                      console.log('  - FileManagerPlugin: Warning - delete parameter has to be type of string. Process canceled.');
                    }
                    return;
                  }

                  rimraf(path, {}, function (response) {
                    if (_this2.options.verbose && response === null) {
                      console.log('  - FileManagerPlugin: Finished delete path ' + path);
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

          case 'mkdir':
            var _loop4 = function _loop4(key) {

              var path = fileOptions[key];

              if (_this2.options.verbose) {
                console.log('  - FileManagerPlugin: Creating path ' + path);
              }

              if (typeof path !== 'string') {
                if (_this2.options.verbose) {
                  console.log('  - FileManagerPlugin: Warning - mkdir parameter has to be type of string. Process canceled.');
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

              if ((typeof _ret4 === 'undefined' ? 'undefined' : _typeof(_ret4)) === "object") return _ret4.v;
            }

            break;

          default:
            break;

        }
      }

      return commandOrder;
    }
  }, {
    key: 'apply',
    value: function apply(compiler) {
      var _this3 = this;

      compiler.plugin("compilation", function (comp) {

        _this3.checkOptions("onStart");
      });

      compiler.plugin('after-emit', function (compliation, callback) {

        _this3.checkOptions("onEnd");

        callback();
      });
    }
  }]);

  return FileManagerPlugin;
}();

module.exports = FileManagerPlugin;
//# sourceMappingURL=index.js.map
