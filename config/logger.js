var log4js = require('log4js'); // include log4js
var settings =require('../config/settings.js');

log4js.configure({ // configure to use all types in different files.
    appenders: [
        {   type: 'file',
            filename: "./logs/server.log", // specify the path where u want logs folder error.log
            maxLogSize: 2000000,
            backups: 40
        }
    ]
});

/*var loggerinfo = log4js.getLogger('info'); // initialize the var to use.
var loggererror = log4js.getLogger('error'); // initialize the var to use.
var loggerdebug = log4js.getLogger('debug');*/ // initialize the var
/*
 ALL: ,
  TRACE: 
  DEBUG: 
  INFO: 
  WARN: 
  ERROR: 
  FATAL: 
  MARK: 
  OFF: 
  */

log4js.setGlobalLogLevel(settings.logLevel);

module.exports = log4js;
