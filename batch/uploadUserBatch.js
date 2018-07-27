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

var globSync = require('glob').sync;

//require all models
globSync('./models/**/*.js', {
    cwd: __dirname
}).map(require);

mongo.connection.createConnection(function(err,db){
	var obj = JSON.parse(fs.readFileSync('../config/uploadUserBatch.json', 'utf8'));
	async.eachSeries(obj.result, function(key,callback){
			console.log(key);
			var conn = mongo.client;

			/*queryUtils.methods.userBatchUpload(obj.result,function(err,data)
			{
				if(!err)
				{
					callback(null, true);
				}
				else
				{
					console.log(err.stack);
					callback(err, null);
				}
			});*/
			callback(null, true);
		},
		function(ferr)
		{
			if(ferr)
			{
				logger.error('error in function',ferr);
				callback(ferr,null);
			} 
			else
			{
				return;
				logger.debug('in function completed');
				callback(null,null);
			}

		});
	});

