'use strict';

var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();





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

var cpr = require('cpr');
var rimraf = require('rimraf');

var FileManagerPlugin = function () {
  function FileManagerPlugin(options) {
    classCallCheck(this, FileManagerPlugin);


    this.options = this.setOptions(options);
    this.isWin = /^win/.test(process.platform);

    /* cpr options */
    this.cprOptions = {
      deleteFirst: true,
      overwrite: true,
      confirm: true
    };
  }

  createClass(FileManagerPlugin, [{
    key: 'setOptions',
    value: function setOptions(userOptions) {

      var defaultOptions = {
        verbose: false,
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
    key: 'parseFileOptions',
    value: function parseFileOptions(options) {
      var _this = this;

      var optKeys = Object.keys(options);

      for (var i = 0; i < optKeys.length; i++) {

        var fileAction = optKeys[i];
        var fileOptions = options[fileAction];

        switch (fileAction) {

          case 'copy':

            fileOptions.forEach(function (command) {

              if (!command.source || !command.destination) return;

              cpr(command.source, command.destination, _this.cprOptions, function (err, files) {
                // handle error
              });
            });

            break;

          case 'delete':

            fileOptions.forEach(function (path) {

              rimraf(path, {}, function (response) {
                // handle error
              });
            });

            break;

          default:
            break;

        }
      }
    }
  }, {
    key: 'apply',
    value: function apply(compiler) {
      var _this2 = this;

      compiler.plugin("compilation", function (comp) {

        if (_this2.options.verbose) {
          console.log("FileManagerPlugin: onStart");
        }

        if (_this2.options.onStart && Object.keys(_this2.options.onStart).length) {
          _this2.parseFileOptions(_this2.options.onStart);
        }
      });

      compiler.plugin('after-emit', function (compliation, callback) {

        if (_this2.options.verbose) {
          console.log("FileManagerPlugin: onEnd");
        }

        if (_this2.options.onEnd && Object.keys(_this2.options.onEnd).length) {
          _this2.parseFileOptions(_this2.options.onEnd);
        }
      });
    }
  }]);
  return FileManagerPlugin;
}();

module.exports = FileManagerPlugin;
//# sourceMappingURL=index.js.map
