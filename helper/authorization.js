var queryUtils = require('../dao/query-utils.js');
var logger = require('../config/logger.js').getLogger('Authorization');
var jwt = require('jsonwebtoken');
var fs = require('fs');

var authorize = 
{
	auth: function(args,callback)
	{
		var user = args.user;
		var action = args.action;
		var tenant_name = args.tenant_name;
		var authToken = args.authToken;
		var tenantData = queryUtils.tenantData;
		var tenantExist = false;
		var tenantCertPath;
		tenantData.forEach(function(tenant){
			if(tenant.tenant_name == tenant_name){
				tenantExist = true;
				tenantCertPath = tenant.cert;
			}
		});
		if(tenantExist)
		{
			var cert = fs.readFileSync(tenantCertPath);  // todo make fs async
			jwt.verify(authToken, cert, function(err, decoded) {
				  if(err)
				  {
				  	  logger.error("invalid token "+err.stack);
					  callback(err,false);
				  }
				  else
				  {
				  	  var logged_in_user = decoded.username;
					  var permissions = decoded.permissions;
					  if(logged_in_user != user)
					  {
					  		logger.error("invalid logged_in_user")
							callback(null,false);
					  }
					  else
					  {
						  	if(permissions && permissions.indexOf(action) >=0 )
						 	{
						 		logger.debug("user has access");
						 		callback(null,true);
						 	}
						 	else
						 	{
						 		logger.error("user do not have access")
						 		callback(null,false);
						 	}
					  }
				  }
				  
			});
		}
		else
		{
			logger.error("tenant not found")
			callback(null,false);
		}
	}
};

module.exports = authorize;