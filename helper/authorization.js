var queryUtils = require('../dao/query-utils.js');
var logger = require('../config/logger.js').getLogger('Authorization');
var jwt = require('jsonwebtoken');
var fs = require('fs');
var constants = require('../util/Constants.js');


var authorize = 
{
	authorizeInterceptor: function()
	{
		return function(req,res,next)
		{
			logger.debug('url '+req.url)
			if(req.url.indexOf('/services/login') >= 0) return next();
			logger.debug('http method type '+req.method.toLowerCase());
			var args = {
				            action : action,
				            user : req.query.logged_in_user,
				            tenant_name : req.query.tenant_name,
				            authToken:req.headers.authorization //token
		        		}	
			var action = constants.VIEW;
			switch(req.method.toLowerCase())
			{
				case 'get':
					action = constants.VIEW;
					args = {
			            action : action,
			            user : req.query.logged_in_user,
			            tenant_name : req.query.tenant_name,
			            authToken:req.headers.authorization //token
		        	}
		        	break;
				case 'post':
					action = constants.CREATE;
					args = {
				            action : action,
				            user : req.body.logged_in_user,
				            tenant_name : req.body.tenant_name,
				            authToken:req.headers.authorization //token
			        	}
			        break;	
				case 'put':
					action = constants.MODIFY;
					args = {
				            action : action,
				            user : req.body.logged_in_user,
				            tenant_name : req.body.tenant_name,
				            authToken:req.headers.authorization //token
			        	}
			        break;	
				case 'patch':
					action = constants.MODIFY;
					args = {
				            action : action,
				            user : req.body.logged_in_user,
				            tenant_name : req.body.tenant_name,
				            authToken:req.headers.authorization //token
			        	}
			        break;	
				default:
					break;
			}
        	authorizer(args,function(err,data){
        		if(err)
        		{
        			logger.error('not authorized '+err.stack);
                	return res.status(403).send('not authorized');
        		}
        		else if(data)
        		{
        			logger.debug('authorized');
        			next();
        		}
        		else
        		{
        			logger.error('not authorized');
        			return res.status(403).send("not authorized1");
        		}

        	});
		}
	}
};


function authorizer(args,callback)
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

module.exports = authorize;