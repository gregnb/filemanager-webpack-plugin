const cpr = require('cpr');
const rimraf = require('rimraf');
const mv = require('mv');

class FileManagerPlugin {
  
  constructor(options) {
    
    this.options = this.setOptions(options);
    this.isWin = /^win/.test(process.platform);

    /* cpr options */
    this.cprOptions = {
      deleteFirst: true,
      overwrite: true,
      confirm: true 
    };
    
  }

  setOptions(userOptions) {

    const defaultOptions = {
      verbose: false,
      onStart: {},
      onEnd: {}
    };

    for (const key in defaultOptions) {
      if (userOptions.hasOwnProperty(key)) {
        defaultOptions[key] = userOptions[key];
      }
    }
    /* override cpr default options */
    for (const key in this.cprOptions) {
      if (userOptions.hasOwnProperty(key)) {
        this.cprOptions[key] = userOptions[key];
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

            if (!command.source || !command.destination)
              return;

            
            commandOrder.push(() => new Promise((resolve, reject) => {

              if (this.options.verbose) {
                console.log(`  - FileManagerPlugin: Start copy source: ${command.source} to destination: ${command.destination}`)
              }

              cpr(command.source, command.destination, this.cprOptions, (err, files) => {
                
                if (this.options.verbose) {
                  console.log(`  - FileManagerPlugin: Finished copy source: ${command.source} to destination: ${command.destination}`)
                }

                resolve(err);
              
              });

            }));
            
          }          

          break;
        
        
        case 'move':

          for(let key in fileOptions) {
          
            const command = fileOptions[key];

            if (!command.source || !command.destination)
              return;

            commandOrder.push(() => new Promise((resolve, reject) => {
              mv(command.source, command.destination, (err) => {
                resolve(err);
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

              rimraf(path, { }, (response) => {
                if (this.options.verbose && response === null) {
                  console.log(`  - FileManagerPlugin: Finished delete path ${path}`)
                }
                resolve();
              });

            }));

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
