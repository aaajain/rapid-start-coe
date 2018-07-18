var mongo = require('../dao/mongo-connect.js');

var methods = 
{
	createAdminRole: function(callback){
		var conn = mongo.client;
		const role_admin = conn.model('role_master');
		const admin = new role_admin({role_name:"admin", permissions:['view','create','modify','delete']});
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
		const admin_user= conn.model('user_master');
		conn.collection("role_masters").find({}, { role: 'admin' }).toArray(function(err, result) {
	    	if (err) throw err;
	    	else if(result && result.length > 0)
	    	{
	    		var roleId = result[0]._id;
	    		//const admin = new admin_user({ email: 'admin@admin.com',username:'admin',password:'test',role:roleId});
	    		admin_user.findOneAndUpdate({username:'admin'},{$set: { email: 'admin@admin.com',username:'admin',password:'test',role:roleId}},{upsert: true, new: true, runValidators: true},function (err,doc) {
					 if(err)
					 {
					 	console.log(err.stack);
					 	callback(err,null);
					 }
					 else
					 {
					 	console.log('admin updated');
					 	callback(null,true);
					 }
				});
	    	}
	    	else
	    	{
	    		console.log('role not found');
	    		callback(null,false);
	    	}
		});
	},
	checkUserPermissionForAction: function(user,action,callback)
	{
		var conn = mongo.client;
		//get user role
		//const admin_user= conn.model('user_master');
		conn.collection("user_masters").find({}, { username: user }).toArray(function(err, result) {
			console.log(result);
			if(err)
			{
				console.log(err.stack);
				callback(err,null);
			}
			else
			{
				var roleId = result[0].role;
				if(roleId)
				{
					conn.model("role_master").findById(roleId,function(err,role){
						console.log(role);
						if(err)
						 {
						 	console.log(err.stack);
						 	callback(err,null);
						 }
						 else
						 {
						 	console.log('role found');
						 	var permissions = role.permissions;
						 	if(permissions.indexOf(action) >=0 )
						 	{
						 		callback(null,true);
						 	}
						 	else
						 	{
						 		callback(null,false);
						 	}
						 }
					});
				}
			}
		});
	}
}

module.exports.methods = methods;