var mongo = require('../dao/mongo-connect.js');
var logger = require('../config/logger.js').getLogger('query-utils');
var constants = require('../util/Constants.js');

var roleMasterData = {};

var methods = 
{
	createAdminRole: function(callback){
		var conn = mongo.client;
		const role_admin = conn.model('role_master');
		const admin = new role_admin({role_name:"admin", permissions:['view','create','modify','delete']});
		conn.collection("role_masters").find({ role_name: 'admin' }).toArray(function(err, result) {
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
					 	logger.debug(err.stack);
					 	callback(err,null);
					 }
					 else
					 {
					 	logger.debug('roles created');
					 	callback(null,true);
					 }
				});
	    	}
		    
	  	});
	},
	createAdminUser: function(callback){
		var conn = mongo.client;
		const admin_user= conn.model('user_master');
		conn.collection("role_masters").find({ role_name: 'admin' }).toArray(function(err, result) {
	    	if (err) throw err;
	    	else if(result && result.length > 0)
	    	{
	    		var roleId = result[0]._id;
	    		//const admin = new admin_user({ email: 'admin@admin.com',username:'admin',password:'test',role:roleId});
	    		admin_user.findOneAndUpdate({username:'admin'},{$set: { email: 'admin@admin.com',username:'admin',password:'test',role:roleId}},{upsert: true, new: true, runValidators: true},function (err,doc) {
					 if(err)
					 {
					 	logger.debug(err.stack);
					 	callback(err,null);
					 }
					 else
					 {
					 	logger.debug('admin updated');
					 	callback(null,true);
					 }
				});
	    	}
	    	else
	    	{
	    		logger.debug('role not found');
	    		callback(null,false);
	    	}
		});
	},
	checkUserPermissionForAction: function(user,callback)
	{
		var conn = mongo.client;
		//get user role
		//const admin_user= conn.model('user_master');
		conn.collection("user_masters").find({ username: user }).toArray(function(err, result) {
			logger.debug(result);
			if(err)
			{
				logger.debug(err.stack);
				callback(err,null);
			}
			else if(result && result.length > 0)
			{
				var roleId = result[0].role;
				if(roleId)
				{
					conn.model("role_master").findById(roleId,function(err,role){
						logger.debug(role);
						if(err)
						 {
						 	logger.debug(err.stack);
						 	callback(err,null);
						 }
						 else
						 {
						 	logger.debug('role found');
						 	callback(null,role.permissions);
						 }
					});
				}
			}
			else
			{
				logger.error('record not found');
				callback(null,false);
			}

		});
	},
	getAllUsers : function(callback){
		var conn = mongo.client;
		conn.collection("user_masters").find().toArray(function(err, result) {
			logger.debug(result);
			if(err)
			{
				logger.error(err.stack);
				callback(err,null);
			}
			else
			{
				logger.debug('data fetched');
				callback(null,result);
			}
		});
	},
	insertRoleMasters : function(role_name,permissions,callback){
		var conn = mongo.client;
          conn.collection("role_masters").findOneAndUpdate({role_name:role_name},{$set: { role_name : role_name, permissions : permissions }},{upsert: true, new: true, runValidators: true},function(err,resp){
            if(err){
                logger.debug(err.stack);
                callback(err,null);
            }else{
                logger.debug('role updated');
				callback(null,true);
            }
        });
	},
	insertUserMasters : function(username,email,password,role_name,callback){
		var conn = mongo.client;
		conn.collection("role_masters").find({ role_name: role_name }).toArray(function(err, result) {
			if (err) throw err;
	    	else if(result && result.length > 0){
	    		var roleId = result[0]._id;
	    		conn.collection("user_masters").findOneAndUpdate({username : username},{$set : {username : username, email : email, password : password, role:roleId}},{upsert: true, new: true, runValidators: true},function(err,res){
	    			if(err){
		                logger.debug(err.stack);
		                callback(err,null);
		            }else{
		                logger.debug('user updated');
						callback(null,true);
		            }
	    		});
	    	}
	    	else
	    	{
	    		logger.debug('role not found');
	    		callback(null,false);
	    	}
		});
	},
	getRoleMasterData: function(callback) {
		var conn = mongo.client;
        conn.collection("role_masters").find().toArray(function(err, dbres) {
            if (err) {
                logger.error('getRoleMasterData ' + err.stack);
                callback(err, null);
            } else if (dbres && dbres.length > 0) {
                for (var i = 0; i < dbres.length; i++) {
                    //roleMasterData[dbres[i].role_name] = dbres[i].permissions;
                    roleMasterData[i] = {"role_name" : dbres[i].role_name , "permissions" : dbres[i].permissions};
                	//console.log(roleMasterData);

                }
                callback(null, roleMasterData);
            } else {
                callback("no records found", null);
            }
        });
    },
    createExceptionRecord: function(batch_id, paramName,
        paramValue,exception_reason, exception_desc, origin, callback) {
    	var conn = mongo.client;
        if (!batch_id) {
            logger.error('createExceptionRecord: batch_id cannot be null')
            return callback('batch_id cannot be null');
        }
        conn.collection("batch_exception").insertOne({batch_id : batch_id, parameter_name : paramName,
        	parameter_value : paramValue, exception_reason : exception_reason, exception_desc : exception_desc,
        	origin : origin},function(err, dbres){
        		if (err) {
	                logger.error('BatchExceptionInsert: ' + err.stack);
	                return callback(err);
            	}
            	logger.debug('batch_exception: insert success in BATCH_EXCEPTION ');
            	conn.collection("batch_execution_status").findOneAndUpdate({batch_id : batch_id,
            		parameter_name : paramName, parameter_value : paramValue},{$set : {"is_success" : "N"}},
            		{upsert: true, new: true, runValidators: true},function(err,res){
            			if (err) {
                    		logger.error('error while updating batch_execution_status: ' + err.stack);
                    		return callback(err);
                		}
                		if (dbres && dbres.rowCount == 0) {
                    		logger.error("batch_execution_status: No data found for batch_id");
                    		return callback(null);
                		}
                		logger.debug('batch_execution_status: update success in batch_execution_status');
                		return callback(null);
            		});
        	});
    },
    userBatchUpload : function(key,callback){
		var conn = mongo.client;
		conn.collection("role_masters").find({ role_name: key.role_name }).toArray(function(err, result) {
			if (err)
			{
				logger.debug('role not found');
	    		callback(null,false);
			}
	    	else if(result && result.length > 0){
	    		var roleId = result[0]._id;
	    		var userObj = { username : key.username, email : key.email, password : key.password, role : roleId };
	    		conn.collection("user_masters").insertOne(userObj,function(err,res){
	    			if(err){
		                logger.debug(err.stack);
		                callback(err,null);
		            }else{
		                logger.debug('users inserted');
						callback(null,true);
		            }
	    		});
	    	}
	    	else
	    	{
	    		logger.debug('role not found');
	    		callback(null,false);
	    	}
		});
	},
	insertBatchMaster : function(batch_size,callback){
		var conn = mongo.client;
		var batchMasterObj = {batch_size : batch_size, batch_name : constants.UPLOAD_USERS_BATCH, origin : constants.NODE};
          conn.collection("batch_master").insertOne(batchMasterObj,function(err,resp){
            if(err){
                logger.debug(err.stack);
                callback(err,null);
            }else{
                logger.debug('record inserted for batch upload');
				callback(null,batchMasterObj._id);
            }
        });
	},
	insertBatchExecutionStatus : function(key,callback){
		var conn = mongo.client;
		conn.collection("batch_master").find({ batch_name: constants.UPLOAD_USERS_BATCH }, { sort: { _id: -1 }, limit: 1}).toArray(function(err, result) {
			if (err) throw err;
	    	else if(result && result.length > 0){
	    		var batchId = result[0]._id;
	    		var batchObj = {parameter_name : constants.USER_NAME, parameter_value : key.username, is_success : "Y", batch_id : batchId};
	    		conn.collection("batch_execution_status").insertOne(batchObj,function(err,res){
	    			if(err){
		                logger.debug(err.stack);
		                callback(err,null);
		            }else{
		                logger.debug('inserted record into the batch_execution_status table');
						callback(null,true);
		            }
	    		});
	    	}
	    	else
	    	{
	    		logger.debug('batch not found');
	    		callback(null,false);
	    	}
		});
	}
}

module.exports.methods = methods;
module.exports.roleMasterData = roleMasterData;