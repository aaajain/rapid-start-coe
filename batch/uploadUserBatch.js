const express = require('express');
var bodyParser = require('body-parser');
var http = require("http");
var settings =require('../config/settings.js');
var logger = require('../config/logger.js').getLogger('uploadUser');
var mongo = require('../dao/mongo-connect.js');
var constants = require('../util/Constants.js');
var userMap = require('../config/uploadUserBatch.json');
var fs = require('fs');
var queryUtils = require('../dao/query-utils.js');
var async = require('async');
const app = express();
var bcrypt = require('bcrypt');

var globSync = require('glob').sync;

//require all models
globSync('./models/**/*.js', {
    cwd: __dirname
}).map(require);

mongo.connection.createConnection(function(err,db){
	var obj = JSON.parse(fs.readFileSync('../config/uploadUserBatch.json', 'utf8'));
	queryUtils.methods.insertBatchMaster(obj.result.length,function(err,data)
	{
		if(err)
		{
			logger.error('error while inserting entry in batch_master table');
			callback(err, null);
		}
		else
		{
			var conn = mongo.client;
			var batch_id = data;
			async.eachSeries(obj.result, function(key,callback){
				//insert in batch execution with Y
				queryUtils.methods.insertBatchExecutionStatus(key,function(ierr,ires){
					if(ierr)
					{
						logger.error('error occured while inserting into the batch_execution_status table');
						callback(ierr,null);
					}
					else
					{
						logger.debug('record inserted successfully in batch_execution_status table');
						var salt = bcrypt.genSaltSync(constants.SALT_ROUNDS);
				        var hash = bcrypt.hashSync(key.password, salt);
				        key.password = hash;
						queryUtils.methods.userBatchUpload(key,function(err,data){
				    		if(err)
				    		{
				    			var exception_reason = err.message;
							    var exception_desc = exc.trimStack(err.stack);
							    exc.insertException(batch_id,constants.USER_NAME,key.username,"error occured while inserting the record", exception_desc, constants.NODE, function(dberr) 
							    {
							        if (dberr) 
							        {
							            logger.error('error in exception db'+err.stack);
							            return callback(dberr);
							        }
							        else
							        {
							           logger.info('logging done in db');
							           return callback(dberr);
							        }
							    });
				    			logger.error('error while inserting user batch in user_masters table');
				    			callback(err, null);
				    		}
				    		else
				    		{
				    			logger.debug('users inserted successfully');
				    			callback(null, true);
				    		}
				    	});			
					}
				});
			},
			function(ferr)
			{
				if(ferr)
				{
					var exception_reason = err.message;
				    var exception_desc = exc.trimStack(err.stack);
				    exc.insertException(batch_id,constants.USER_NAME,key.username,"error occured while inserting the record", err.stack, constants.NODE, function(dberr) 
				    {
				        if (dberr) 
				        {
				            logger.error('error in exception db'+err.stack);
				            return callback(dberr);
				        }
				        else
				        {
				           logger.info('logging done in db');
				           return callback(dberr);
				        }
				    });
					logger.error('error in function',ferr);
					callback(ferr,null);
				} 
				else
				{
					logger.debug('in function completed');
					callback(null,true);
				}

			});
		}
	});
});

