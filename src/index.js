const cpx = require('cpx');
const fs = require('fs');
const rimraf = require('rimraf');
const mv = require('mv');
const makeDir = require('make-dir');

class FileManagerPlugin {
  
  constructor(options) {
    
    this.options = this.setOptions(options);
    this.isWin = /^win/.test(process.platform);

    /* cpx options */
    this.cpxOptions = {
      clean: false,
      includeEmptyDirs: true,
      update: false 
    };
    
  }

  setOptions(userOptions) {

    const defaultOptions = {
      verbose: false,
      moveWithMkdirp: false,
      onStart: {},
      onEnd: {}
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

    if(operationList.length) {

      operationList.reduce((previous, fn) => {
        return previous.then(retVal => fn(retVal));
      }, Promise.resolve());

    }


  }

  copyDirectory(source, destination, resolve, reject) {
      
    console.log(source, destination);
    cpx.copy(source, destination, this.cpxOptions, (err) => {
      if (err && this.options.verbose) {
        console.log('  - FileManagerPlugin: Error - copy failed', err);
        reject(err);
      }
      
      if (this.options.verbose) {
        console.log(`  - FileManagerPlugin: Finished copy source: ${sourceDir} to destination: ${command.destination}`)
      }

      resolve();
    
    });

  }

  parseFileOptions(options, preserveOrder = false) {

    const optKeys = Object.keys(options);

    let commandOrder = [];

    for (let i = 0; i < optKeys.length; i++) {

      const fileAction = optKeys[i];
      const fileOptions = options[fileAction];

      switch (fileAction) {
      
        case 'copy':

          for(let key in fileOptions) {

            const command = fileOptions[key];

            if (!command.source || !command.destination) {
              if (this.options.verbose) {
                console.log('  - FileManagerPlugin: Warning - copy parameter has to be formated as follows: { source: <string>, destination: <string> }');
              }
              return;
            }
            
            commandOrder.push(() => new Promise((resolve, reject) => {

              // if source is a file, just copyFile()
              // if source is a NOT a glob pattern, simply append **/*
              if (!command.source.includes("*")) {            

                fs.lstat(command.source, (err, stats) => {
                  
                  if (this.options.verbose) {
                    console.log(`  - FileManagerPlugin: Start copy source: ${sourceDir} to destination: ${command.destination}`)
                  }

                  if(stats.isFile()) {

                    fs.copyFile(command.source, command.destination, (err) => {
                      if (err && this.options.verbose) {
                        console.log(`  - FileManagerPlugin: Start copy source file: ${command.source} to destination file: ${command.destination}`)
                      }
                      resolve(err)
                    });

                  } else {

                    let sourceDir = command.source;
                    sourceDir += ((sourceDir.substr(-1) !== "/") ? "/" : "") + "**/*";

                    this.copyDirectory(sourceDir, command.destination, resolve, reject);
           
                  }

                });

              } else {
     
                this.copyDirectory(command.source, command.destination, resolve, reject);

              }

            }));
            
          }          

          break;
        
        
        case 'move':

          for(let key in fileOptions) {
          
            const command = fileOptions[key];

            if (!command.source || !command.destination) {
              if (this.options.verbose) {
                console.log('  - FileManagerPlugin: Warning - move parameter has to be formated as follows: { source: <string>, destination: <string> }');
              }
              return;
            }

            commandOrder.push(() => new Promise((resolve, reject) => {
              
              if (this.options.verbose) {
                console.log(`  - FileManagerPlugin: Start move source: ${command.source} to destination: ${command.destination}`)
              }

              mv(command.source, command.destination, { mkdirp: this.options.moveWithMkdirp }, (err) => {
                if (err && this.options.verbose) {
                  console.log('  - FileManagerPlugin: Error - move failed', err);
                  reject(err);
                }
                
                if (this.options.verbose) {
                  console.log(`  - FileManagerPlugin: Finished move source: ${command.source} to destination: ${command.destination}`)
                }

                resolve();
              });
            }));

          }

          break;

        case 'delete':

          for(let key in fileOptions) {

            const path = fileOptions[key];

            commandOrder.push(() => new Promise((resolve, reject) => {

              if (this.options.verbose) {
                console.log(`  - FileManagerPlugin: Starting delete path ${path}`)
              }
              
              if (typeof path !== 'string') {
                if (this.options.verbose) {
                  console.log('  - FileManagerPlugin: Warning - delete parameter has to be type of string. Process canceled.');
                }
                reject();
              }

              rimraf(path, { }, (response) => {
                if (this.options.verbose && response === null) {
                  console.log(`  - FileManagerPlugin: Finished delete path ${path}`)
                }
                resolve();
              });

            }));

          }

          break;
          
        case 'mkdir':
        
          for(let key in fileOptions) {
            
            const path = fileOptions[key];
            
            if (this.options.verbose) {
              console.log(`  - FileManagerPlugin: Creating path ${path}`)
            }
            
            if (typeof path !== 'string') {
              if (this.options.verbose) {
                console.log('  - FileManagerPlugin: Warning - mkdir parameter has to be type of string. Process canceled.');
              }
              return;
            }
            
            commandOrder.push(() => makeDir(path));
          }

          break;

        default: 
          break;

      }

    }
 
    return commandOrder;

  }


  apply(compiler) {

    compiler.plugin("compilation", (comp) => {

      this.checkOptions("onStart");

    });

    compiler.plugin('after-emit', (compliation, callback) => {

      this.checkOptions("onEnd");

      callback();
   
    });

  }

}

export default FileManagerPlugin;
