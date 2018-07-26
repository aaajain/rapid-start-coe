var queryUtils = require('../dao/query-utils.js');
var logger = require('../config/logger.js').getLogger('Authorization');

var authorize = 
{
	auth: function(args,callback)
	{
		var user = args.user;
		var action = args.action;
		queryUtils.methods.checkUserPermissionForAction(user,function(err,permissions){
			if(err)
			{
				logger.debug(err.stack);
				callback(err,null)
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
			 		logger.debug("user do not have access")
			 		callback(null,false);
			 	}
			}
		});
	}
};

module.exports = authorize;