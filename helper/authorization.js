var queryUtils = require('../dao/query-utils.js');
var logger = require('../config/logger.js').getLogger('Authorization');

var authorize = 
{
	auth: function(args,callback)
	{
		var user = args.user;
		var action = args.action;
		var tenant_name = args.tenant_name;
		queryUtils.methods.checkUserPermissionForAction(user, tenant_name,function(err,permissions){
			if(err)
			{
				logger.debug(err.stack);
				callback(err,null)
			}
			else
			{
				console.log(action);
				console.log(permissions);
				if(permissions && permissions.indexOf(action) >=0 )
			 	{
			 		logger.debug("user has access");
			 		callback(null,true);
			 	}
			 	else
			 	{
			 		logger.debug("user do not have access")
			 		callback(null,false);
			 	}
			}
		});
	}
};

module.exports = authorize;