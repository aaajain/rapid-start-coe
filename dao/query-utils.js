var mongo = require('../dao/mongo-connect.js');
var logger = require('../config/logger.js').getLogger('query-utils');
var constants = require('../util/Constants.js');
var async = require('async');
var bcrypt = require('bcrypt');

var roleMasterMap = new Object();
var tenantData = [];

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
	createAdminUser: function(tenant,callback){
		var conn = mongo.client;
		const dummyPassword = 'admin';
		var salt = bcrypt.genSaltSync(constants.SALT_ROUNDS);
		var hash = bcrypt.hashSync(dummyPassword, salt);
		//const admin_user= conn.mtModel(tenant+'.user_master');
		conn.collection(tenant+".role_masters").find({ role_name: 'admin' }).toArray(function(err, result) {
	    	if (err) throw err;
	    	else if(result && result.length > 0)
	    	{
	    		var roleId = result[0]._id;
	    		//const admin = new admin_user({ email: 'admin@admin.com',username:'admin',password:'test',role:roleId});
	    		conn.collection(tenant+".user_masters").findOneAndUpdate({username:'admin'},{$set: { email: 'admin@admin.com',username:'admin',password:hash,role:roleId}},{upsert: true, new: true, runValidators: true},function (err,doc) {
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
	checkUserPermissionForAction: function(user, tenant_name, callback)
	{
		var conn = mongo.client;
		var tenantExist = false;
		var tenantCertPath;
		//get user role
		//const admin_user= conn.model('user_master');
		tenantData.forEach(function(tenant){
			if(tenant.tenant_name == tenant_name){
				tenantExist = true;
				tenantCertPath = tenant.cert;
			}
		});
		if(tenantExist)
		{
			conn.collection(tenant_name+".user_masters").find({ username: user }).toArray(function(err, result) {
				logger.debug(result);
				if(err)
				{
					logger.debug(err.stack);
					callback(err,null);
				}
				else if(result && result.length > 0)
				{
					var roleId = result[0].role;
					var hashedPwd = result[0].password;
					logger.debug(roleId);
					if(roleId)
					{
						conn.collection(tenant_name+".role_masters").find({_id: roleId}).toArray(function(err,role){
							//logger.debug(role);
							if(err)
							 {
							 	logger.debug(err.stack);
							 	callback(err,null);
							 }
							 else
							 {
							 	logger.debug('role found');
							 	logger.debug('role is', role);
							 	var result = {permissions:role[0].permissions, dbPwd:hashedPwd,tenantCertPath:tenantCertPath}
							 	callback(null,result);
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
		}
		else
		{
			logger.debug('tenant does not exist');
			callback(null,false);
		}
	},
	getAllUsers : function(tenant,callback){
		var conn = mongo.client;
		conn.collection(tenant+".user_masters").find().toArray(function(err, result) {
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
	insertRoleMasters : function(role_name,permissions,tenant,callback){
		var conn = mongo.client;
          conn.collection(tenant+".role_masters").findOneAndUpdate({role_name:role_name},{$set: { role_name : role_name, permissions : permissions }},{upsert: true, new: true, runValidators: true},function(err,resp){
            if(err){
                logger.debug(err.stack);
                callback(err,null);
            }else{
                logger.debug('role updated');
				callback(null,true);
            }
        });
	},
	insertUserMasters : function(username,email,password,role_name,tenant,callback){
		var conn = mongo.client;
		conn.collection(tenant+".role_masters").find({ role_name: role_name }).toArray(function(err, result) {
			if (err) throw err;
	    	else if(result && result.length > 0){
	    		var roleId = result[0]._id;
	    		conn.collection(tenant+".user_masters").findOneAndUpdate({username : username},{$set : {username : username, email : email, password : password, role:roleId}},{upsert: true, new: true, runValidators: true},function(err,res){
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
		//conn.collection("tenant_master").find().toArray(function(err, tenants) {
            	var roleMasterData; 
            	async.eachSeries(tenantData, function(tenant,asyncCallback){
            		roleMasterData = [];
            		conn.collection(tenant.tenant_name+".role_masters").find().toArray(function(err, dbres) {
            			if(err)
            			{
            				logger.error('getRoleMasterData ' + err.stack);
                			return callback(err, null);
            			}
            			else if(dbres && dbres.length > 0)
            			{
            				for (var i = 0; i < dbres.length; i++) {
			                    //roleMasterData[dbres[i].role_name] = dbres[i].permissions;
			                    roleMasterData[i] = {"role_name" : dbres[i].role_name , "permissions" : dbres[i].permissions};
			                }
			                roleMasterMap[tenant.tenant_name]=JSON.stringify(roleMasterData);
			                asyncCallback();
            			}
            			else
            			{
            				logger.debug("no records found for "+tenant.name);
            				asyncCallback();
            			}	
            		});
            	},function(err){
            		if(err)
            			callback(err, null);
            		else
            			callback(null, roleMasterMap);
            	});
            //}
		//});
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
    userBatchUpload : function(key,tenant,callback){
		var conn = mongo.client;
		conn.collection(tenant+".role_masters").find({ role_name: key.role_name }).toArray(function(err, result) {
			if (err)
			{
				logger.debug('role not found');
	    		callback(null,false);
			}
	    	else if(result && result.length > 0){
	    		var roleId = result[0]._id;
	    		var userObj = { username : key.username, email : key.email, password : key.password, role : roleId };
	    		conn.collection(tenant+".user_masters").insertOne(userObj,function(err,res){
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
	    		logger.error('role not found');
	    		var err = new Error('role not found');
	    		callback(err,null);
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
	insertBatchExecutionStatus : function(key,batch_id,callback){
		var conn = mongo.client;	
		var batchObj = {parameter_name : constants.USER_NAME, parameter_value : key.username, is_success : "Y", batch_id : batch_id};
		conn.collection("batch_execution_status").insertOne(batchObj,function(err,res){
			if(err){
                logger.debug(err.stack);
                callback(err,null);
            }else{
                logger.debug('inserted record into the batch_execution_status table');
				callback(null,true);
            }
		});	    	
	},
	insertTenantMaster : function(tenantJson,callback){
		var conn = mongo.client;
		//var tenantMasterObj = {tenant_name : result.tenant_name, status : result.status};
         conn.db.listCollections().toArray(function(err,names){
	      		var tenantMasterExist = false
	      		if(names)
		      		for (var i = 0; i < names.length; i++) {
		      			if(names[i].name === 'tenant_master') 
		      				tenantMasterExist = true 
		      		}	
		      	console.log('tenantMasterExist '+tenantMasterExist);
	      		if (tenantMasterExist)
		          conn.dropCollection("tenant_master",function(err,result)
		          {
		          	if(err)
		          	{
		          		logger.error(err.stack);
		                callback(err,null);
		          	}
		          	else
		          	{
		          		 insertTenant(tenantJson,callback)
		          	}
		          });
		      else
		      	insertTenant(tenantJson,callback)
	      	});
	}/*,
	validateUser: function(user,pwd,tenant_name,callback)
	{
		var conn = mongo.client;
		var tenantExist = false;
		//get user role
		//const admin_user= conn.model('user_master');
		tenantData.forEach(function(tenant){
			logger.debug(tenant.tenant_name);
			logger.debug('tenant_name is',tenant_name);
			if(tenant.tenant_name == tenant_name){
				tenantExist = true;
			}
		});
		if(tenantExist)
		{
			console.log('user '+user);
			conn.collection(tenant_name+".user_masters").find({ username: user, password: pwd }).toArray(function(err, result) {
				logger.debug(result);
				if(err)
				{
					logger.debug(err.stack);
					callback(err,null);
				}
				else if(result && result.length > 0)
				{
					var roleId = result[0].role;
					logger.debug(roleId);
					if(roleId)
					{
						conn.collection(tenant_name+".role_masters").find({_id: roleId}).toArray(function(err,role){
							//logger.debug(role);
							if(err)
							 {
							 	logger.debug(err.stack);
							 	callback(err,null);
							 }
							 else
							 {
							 	logger.debug('role found');
							 	logger.debug('role is', role);
							 	callback(null,role[0].permissions);
							 }
						});
					}
				}
				else
				{
					logger.error('record not found');
					callback(true,false);
				}

			});
		}
		else
		{
			logger.debug('tenant does not exist');
			callback(true,false);
		}
	}*/
}

function insertTenant(tenantJson,callback)
{
	var conn = mongo.client;
	conn.collection("tenant_master").insertMany(tenantJson.tenants,function(err,dbres){
        if(err){
            logger.error(err.stack);
            callback(err,null);
        }else{
            logger.debug('record inserted for tenant upload');
			for (var i = 0; i < dbres.ops.length; i++) {
                //roleMasterData[dbres[i].role_name] = dbres[i].permissions;
                tenantData[i] = {"tenant_name" : dbres.ops[i].tenant_name , 
                				"status" : dbres.ops[i].status,"domain":dbres.ops[i].domain,"cert":dbres.ops[i].cert};
            }
			callback(null,tenantData);
        }
    });
}

module.exports.methods = methods;
module.exports.roleMasterMap = roleMasterMap;
module.exports.tenantData = tenantData;