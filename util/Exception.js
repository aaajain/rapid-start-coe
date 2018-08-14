var queryutils = require('../dao/query-utils.js');
var fs = require('fs');
var logger = require('../config/logger.js').getLogger('exceptionHandler');


var exceptionHandler = {

	insertException: function(batch_id,paramName,
	paramValue,exception_reason,exception_desc,origin,callback) {

	queryutils.methods.createExceptionRecord(batch_id,paramName,
		paramValue,exception_reason,exception_desc,origin,function(err)
			{
				if(err)
				{
					logger.error('createExceptionRecord: '+err);
					return callback(err);
				}
				else
				{
					logger.debug('createExceptionRecord: created');
					return callback(null);
				}
			});
	
	},
	trimStack: function(stack)
	{
		if(stack && stack.length > 400)
		{
			stack = stack.substr(stack.length - 400);
		}
		//logger.debug('trimStack: '+stack);
		return stack;
	}
}



/*(function test()
{
	var exception_desc = '';
	fs.readFile('demofile1.html', function(err, data) {
		if(err)
		{
			//console.log(err.stack);
			exception_desc = trimStack(err.stack);
			insertException(4,'ndc',
			'224','uom','30254',
				err.message,exception_desc,'rest',function(err){
					if(err)
					{
						//log err
					}
					else
					{
						console.log('done');
					}
			});
		}
  });
	
}())*/

module.exports = exceptionHandler;