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

    return defaultOptions;

  }

  checkOptions(stage) {

    if (this.options[stage] && Array.isArray(this.options[stage])) {
      this.options[stage].map(opts => this.parseFileOptions(opts));
    } else {
      this.parseFileOptions(this.options[stage]);
    }

  }

  parseFileOptions(options) {

    const optKeys = Object.keys(options);

    for (let i = 0; i < optKeys.length; i++) {

      const fileAction = optKeys[i];
      const fileOptions = options[fileAction];

      switch (fileAction) {
      
        case 'copy':

          fileOptions.forEach(command => {
          
            if (!command.source || !command.destination)
              return;

            cpr(command.source, command.destination, this.cprOptions, (err, files) => {
              // handle error
            });

          });          

          break;
        
        
        case 'move':

          fileOptions.forEach(command => {
          
            if (!command.source || !command.destination)
              return;

            mv(command.source, command.destination, (err) => {
              // handle error
            });

          });

          break;

        case 'delete':

          fileOptions.forEach(path => {

            rimraf(path, { }, (response) => {
              // handle error
            });

          });

          break;

        default: 
          break;

      }

    }
 
  }


  apply(compiler) {

    compiler.plugin("compilation", (comp) => {

      if (this.options.verbose) {
        console.log("FileManagerPlugin: onStart");
      }

      this.checkOptions("onStart");

    });

    compiler.plugin('after-emit', (compliation, callback) => {

      if (this.options.verbose) {
        console.log("FileManagerPlugin: onEnd");
      }

      this.checkOptions("onEnd");

      callback();
   
    });

  }

}

export default FileManagerPlugin;
