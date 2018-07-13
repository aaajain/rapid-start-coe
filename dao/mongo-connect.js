const mongoose = require('mongoose');
var uri = "mongodb://localhost:27017/test";

const options = {
  autoIndex: false, // Don't build indexes
  reconnectTries: Number.THREE, // Never stop trying to reconnect
  reconnectInterval: 500, // Reconnect every 500ms
  poolSize: 1, // Maintain up to 10 socket connections
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


var userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
  },
  role:{
  	type: Number,
    required: true,
  }
});

var roleSchema = new mongoose.Schema({
  role_id: {
    type: Number,
    unique: true,
    required: true,
  },
  role_name: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
});

var conn;
 mongoose.createConnection(uri, options,function(err,db)
	{
		console.log(db);
	});
/*conn.on('error', console.error.bind(console, 'connection error:'));
            conn.once('open', function callback() {
                console.log('db connection open');
            });*/

//test


//console.log(conn.prototype.db);

