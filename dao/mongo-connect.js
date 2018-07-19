var mongoose = require('mongoose');
var settings = require("../config/settings");
var uri = settings.mongo.url;
var logger = require('../config/logger.js').getLogger('mongo-connect');

var options = {
  autoIndex: false, // Don't build indexes
  reconnectTries: Number.THREE, // Never stop trying to reconnect
  reconnectInterval: 500, // Reconnect every 500ms
  poolSize: 10, // Maintain up to 10 socket connections
  // If not connected, return errors immediately rather than waiting for reconnect
  bufferMaxEntries: 0,
  connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  useNewUrlParser: true 
};
/*for(var i=0;i<100;i++)
{
	mongoose.connect(uri, options,function(err)
		{
			console.log('connected');
			// console.log(mongoose);
			// console.log(mongoose.connection);
		});
}*/


/*module.exports.connect = function(callback)
{
	return mongoose.createConnection(uri,options,callback);
}*/

/*mongoose.createConnection(uri, options,function(err,db)
{

	console.log(db);
});*/
/*conn.on('error', console.error.bind(console, 'connection error:'));
            conn.once('open', function callback() {
                console.log('db connection open');
            });*/

//test


//console.log(conn.prototype.db);

var connection =
{
	createConnection:function(callback)
	{
		mongoose.createConnection(uri,options,function(err,db){
			if(err)
			{
				logger.debug(err.stack);
				callback(err,null);
			}
			else
			{
				module.exports.client = db;
				callback(null,db);
			}
		});
	}
}

module.exports.connection = connection;


