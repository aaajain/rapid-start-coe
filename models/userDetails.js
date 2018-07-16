var mongo = require('../dao/mongo-connect.js');
var mongoose = require('mongoose');

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
  role_name: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
});

var methods = 
{
	createAdminRole: function(callback){
		var conn = mongo.client;
		const role_admin = conn.model('role_master', roleSchema);
		const admin = new role_admin({role_name:"admin" });
		conn.collection("role_masters").find({}, { role: 'admin' }).toArray(function(err, result) {
	    	if (err) throw err;
	    	else if(result && result.length > 0)
	    	{
	    		callback(err,null);
	    	}
	    	else
	    	{
	    		admin.save(function (err) {
					 if(err)
					 {
					 	console.log(err.stack);
					 	callback(err,null);
					 }
					 else
					 {
					 	console.log('roles created');
					 	callback(null,true);
					 }
				});
	    	}
		    
	  	});
	},
	createAdminUser: function(callback){
		var conn = mongo.client;
		const admin_user= conn.model('user_master', userSchema);
		const admin = new admin_user({ role_id: 1,role_name:"admin" });
		admin.save(function (err) {
			 if(err)
			 {
			 	console.log(err.stack);
			 	callback(err,null);
			 }
			 else
			 {
			 	console.log('roles created');
			 	callback(null,true);
			 }
		});
	}
}

module.exports.methods = methods;
