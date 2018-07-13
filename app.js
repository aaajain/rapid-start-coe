const express = require('express');
var bodyParser = require('body-parser');
var http = require("http");
var settings =require('./config/settings.js');
var queryUtils = require('./dao/query-utils.js');
var async = require('async');
var logger = require('./config/logger.js').getLogger('app.js');
const app = express();
app.use(bodyParser.json());
/* Added below for CMS Rebate CR for request payload more that 0.1 MB*/
app.use(bodyParser.json({limit: '50mb'})); 
//Code added for resolving cors issue.

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, origin, accept, authorization');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);


    res.setHeader('Access-Control-Max-Age', '1209600');

    // Pass to next layer of middleware
    next();
});

var globSync = require('glob').sync;
var allRoutes = globSync('./routes/**/*.js', {
    cwd: __dirname
}).map(require);
allRoutes.forEach(function(routes) {
    app.use(settings.contextRoot,routes);
}); 
/*app.listen(3000, function clearMajorityCheckBasedOnWQ() {
  console.log('Example app listening on port 3000!')
});*/

async.parallel({
    masterDataMap: function(callback) {
    	console.log('query for master');
        callback(null, true);
    }
}, function(err, results) {
    // results is now equals to: {one: 1, two: 2}
    if(!err)
    {
    	var port = settings.appPort;
    	var server = http.createServer(app); 
		var setRequestTimeOut = server.listen(port,function(err)
		{
			if(err) throw err;
			console.log('app listening on port ' + port + '!')
		});
		setRequestTimeOut.timeout = settings.timeOut; 
	}
});

