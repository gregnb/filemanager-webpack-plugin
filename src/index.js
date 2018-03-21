const cpx = require("cpx");
const fs = require("fs");
const path = require("path");
const fsExtra = require("fs-extra");
const rimraf = require("rimraf");
const mv = require("mv");
const makeDir = require("make-dir");
const archiver = require("archiver");

class FileManagerPlugin {
  constructor(options) {
    this.options = this.setOptions(options);
    this.isWin = /^win/.test(process.platform);

    /* cpx options */
    this.cpxOptions = {
      clean: false,
      includeEmptyDirs: true,
      update: false,
    };
  }

  setOptions(userOptions) {
    const defaultOptions = {
      verbose: false,
      moveWithMkdirp: false,
      onStart: {},
      onEnd: {},
    };

    for (const key in defaultOptions) {
      if (userOptions.hasOwnProperty(key)) {
        defaultOptions[key] = userOptions[key];
      }
    }

    return defaultOptions;
  }

  checkOptions(stage) {
    if (this.options.verbose && Object.keys(this.options[stage]).length) {
      console.log(`FileManagerPlugin: processing ${stage} event`);
    }

    let operationList = [];

    if (this.options[stage] && Array.isArray(this.options[stage])) {
      this.options[stage].map(opts => operationList.push(...this.parseFileOptions(opts, true)));
    } else {
      operationList.push(...this.parseFileOptions(this.options[stage]));
    }

    if (operationList.length) {
      operationList.reduce((previous, fn) => {
        return previous.then(retVal => fn(retVal));
      }, Promise.resolve());
    }
  }

  copyDirectory(source, destination, resolve, reject) {
    if (this.options.verbose) {
      console.log(`  - FileManagerPlugin: Start copy source file: ${source} to destination file: ${destination}`);
    }

    cpx.copy(source, destination, this.cpxOptions, err => {
      if (err && this.options.verbose) {
        console.log("  - FileManagerPlugin: Error - copy failed", err);
        reject(err);
      }

      if (this.options.verbose) {
        console.log(`  - FileManagerPlugin: Finished copy source: ${source} to destination: ${destination}`);
      }

      resolve();
    });
  }

  replaceHash(filename) {
    return filename.replace("[hash]", this.fileHash);
  }

  parseFileOptions(options, preserveOrder = false) {
    const optKeys = Object.keys(options);

    let commandOrder = [];

    for (let i = 0; i < optKeys.length; i++) {
      const fileAction = optKeys[i];
      const fileOptions = options[fileAction];

      switch (fileAction) {
        case "copy":
          for (let key in fileOptions) {
            const command = {
              source: this.replaceHash(fileOptions[key].source),
              destination: this.replaceHash(fileOptions[key].destination),
            };

            if (!command.source || !command.destination) {
              if (this.options.verbose) {
                console.log(
                  "  - FileManagerPlugin: Warning - copy parameter has to be formated as follows: { source: <string>, destination: <string> }",
                );
              }
              return;
            }

            commandOrder.push(
              () =>
                new Promise((resolve, reject) => {
                  // if source is a file, just copyFile()
                  // if source is a NOT a glob pattern, simply append **/*
                  const fileRegex = /(\*|\{+|\}+)/g;
                  const matches = fileRegex.exec(command.source);

                  if (matches === null) {
                    fs.lstat(command.source, (sErr, sStats) => {
                      fs.lstat(command.destination, (dErr, dStats) => {
                        if (sStats.isFile()) {
                          const destination =
                            dStats && dStats.isDirectory()
                              ? command.destination + "/" + path.basename(command.source)
                              : command.destination;

                          if (this.options.verbose) {
                            console.log(
                              `  - FileManagerPlugin: Start copy source: ${
                                command.source
                              } to destination: ${destination}`,
                            );
                          }

                          /*
                           * If the supplied destination is a directory copy inside.
                           * If the supplied destination is a directory that does not exist yet create it & copy inside
                           */

                          const pathInfo = path.parse(destination);

                          const execCopy = (src, dest) => {
                            fsExtra.copy(src, dest, err => {
                              if (err) reject(err);
                              resolve();
                            });
                          };

                          if (pathInfo.ext === "") {
                            makeDir(destination).then(mPath => {
                              execCopy(command.source, destination + "/" + path.basename(command.source));
                            });
                          } else {
                            execCopy(command.source, destination);
                          }
                        } else {
                          const sourceDir = command.source + (command.source.substr(-1) !== "/" ? "/" : "") + "**/*";
                          this.copyDirectory(sourceDir, command.destination, resolve, reject);
                        }
                      });
                    });
                  } else {
                    this.copyDirectory(command.source, command.destination, resolve, reject);
                  }
                }),
            );
          }

          break;

        case "move":
          for (let key in fileOptions) {
            const command = {
              source: this.replaceHash(fileOptions[key].source),
              destination: this.replaceHash(fileOptions[key].destination),
            };

            if (!command.source || !command.destination) {
              if (this.options.verbose) {
                console.log(
                  "  - FileManagerPlugin: Warning - move parameter has to be formated as follows: { source: <string>, destination: <string> }",
                );
              }
              return;
            }

            commandOrder.push(
              () =>
                new Promise((resolve, reject) => {
                  if (this.options.verbose) {
                    console.log(
                      `  - FileManagerPlugin: Start move source: ${command.source} to destination: ${
                        command.destination
                      }`,
                    );
                  }

                  mv(command.source, command.destination, { mkdirp: this.options.moveWithMkdirp }, err => {
                    if (err) {
                      if (this.options.verbose) {
                        console.log("  - FileManagerPlugin: Error - move failed", err);
                      }
                      reject(err);
                    }

                    if (this.options.verbose) {
                      console.log(
                        `  - FileManagerPlugin: Finished move source: ${command.source} to destination: ${
                          command.destination
                        }`,
                      );
                    }

                    resolve();
                  });
                }),
            );
          }

          break;

        case "delete":
          if (!Array.isArray(fileOptions)) {
            throw Error(
              `  - FileManagerPlugin: Fail - delete parameters has to be type of 'strings array' but was '${typeof fileOptions}'. Process canceled.`,
            );
          }

          for (let key in fileOptions) {
            const path = this.replaceHash(fileOptions[key]);

            commandOrder.push(
              () =>
                new Promise((resolve, reject) => {
                  if (this.options.verbose) {
                    console.log(`  - FileManagerPlugin: Starting delete path ${path}`);
                  }

                  if (typeof path !== "string") {
                    if (this.options.verbose) {
                      console.log(
                        "  - FileManagerPlugin: Warning - delete parameter has to be type of string. Process canceled.",
                      );
                    }
                    reject();
                  }

                  rimraf(path, {}, response => {
                    if (this.options.verbose && response === null) {
                      console.log(`  - FileManagerPlugin: Finished delete path ${path}`);
                    }
                    resolve();
                  });
                }),
            );
          }

          break;

        case "mkdir":
          for (let key in fileOptions) {
            const path = this.replaceHash(fileOptions[key]);

            if (this.options.verbose) {
              console.log(`  - FileManagerPlugin: Creating path ${path}`);
            }

            if (typeof path !== "string") {
              if (this.options.verbose) {
                console.log(
                  "  - FileManagerPlugin: Warning - mkdir parameter has to be type of string. Process canceled.",
                );
              }
              return;
            }

            commandOrder.push(() => makeDir(path));
          }

          break;

        case "archive":
          for (let key in fileOptions) {
            const command = {
              source: this.replaceHash(fileOptions[key].source),
              destination: fileOptions[key].destination,
              format: fileOptions[key].format ? fileOptions[key].format : "zip",
              options: fileOptions[key].options ? fileOptions[key].options : { zlib: { level: 9 } },
            };

            if (!command.source || !command.destination) {
              if (this.options.verbose) {
                console.log(
                  "  - FileManagerPlugin: Warning - archive parameter has to be formated as follows: { source: <string>, destination: <string> }",
                );
              }
              return;
            }

            commandOrder.push(
              () =>
                new Promise((resolve, reject) => {
                  const fileRegex = /(\*|\{+|\}+)/g;
                  const matches = fileRegex.exec(command.source);

                  const isGlob = matches !== null ? true : false;

                  fs.lstat(command.source, (sErr, sStats) => {
                    const output = fs.createWriteStream(command.destination);
                    const archive = archiver(command.format, command.options);

                    archive.on("error", err => {
                      reject(err);
                    });

                    archive.pipe(output);

                    if (isGlob) archive.glob(command.source);
                    else if (sStats.isFile()) archive.file(command.source, { name: path.basename(command.source) });
                    else if (sStats.isDirectory()) archive.directory(command.source, false);

                    archive.finalize().then(() => resolve());
                  });
                }),
            );
          }

          break;

        default:
          break;
      }
    }

    return commandOrder;
  }

  apply(compiler) {
    const that = this;

    const comp = compilation => {
      try {
        that.checkOptions("onStart");
      } catch (error) {
        compilation.errors.push(error);
      }
    };

    const afterEmit = (compilation, cb) => {
      that.fileHash = compilation.hash;

      try {
        that.checkOptions("onEnd");
      } catch (error) {
        compilation.errors.push(error);
      }

      cb();
    };

    if (compiler.hooks) {
      compiler.hooks.compilation.tap("compilation", comp);
      compiler.hooks.afterEmit.tapAsync("afterEmit", afterEmit);
    } else {
      compiler.plugin("compilation", comp);
      compiler.plugin("after-emit", afterEmit);
    }
  }
}

export default FileManagerPlugin;
