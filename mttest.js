const express = require('express');
var bodyParser = require('body-parser');
var http = require("http");
var settings =require('./config/settings.js');
var queryUtils = require('./dao/query-utils.js');
var async = require('async');
var logger = require('./config/logger.js').getLogger('mttest.js');
var mongo = require('./dao/mongo-connect.js');
var authorizer = require('./helper/authorization.js');
const app = express();
app.use(bodyParser.json());
/* Added below for CMS Rebate CR for request payload more that 0.1 MB*/
app.use(bodyParser.json({limit: '50mb'})); 
//Code added for resolving cors issue.
//var fs = require('fs');
var tenantJson = require('./config/uploadTenants.json');

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

//require all models
globSync('./models/**/*.js', {
    cwd: __dirname
}).map(require);

var allRoutes = globSync('./routes/**/*.js', {
    cwd: __dirname
}).map(require);
allRoutes.forEach(function(routes) {
    app.use(settings.contextRoot,routes);
});

mongo.connection.createConnection(function(err,db)
{
    console.log('db connect state '+mongo.client.readyState);
    async.parallel({
        createAdmin: function(callback) {
            var role_name = "admin",
                permissions = ['view','create','modify','delete'];
            queryUtils.methods.insertRoleMasters(role_name,permissions,function(err,data){
                if(err)
                {
                    callback(err, null);
                }
                else
                {
                    queryUtils.methods.createAdminUser(function(err,data){
                        if(err)
                        {
                            callback(err, null);
                        }
                        else
                        {
                            callback(null, true);
                        }
                    });
                }
            });
        },
        insertTenantData: function(callback) {
        queryUtils.methods.insertTenantMaster(tenantJson,function(err,tenantData)
        {
            if(!err)
            {
                callback(null, true);
            }
            else
            {
                logger.error('error while inserting entry in tenant_master table');
                console.log(err.stack);
                callback(err, null);
            }
        });
    },
    insertUserMasterData : function(callback){
        var username = "test1024";
        var email = "test1024@test1024.com";
        var password = "test";
        var role_name = "admin";
        var tenant_name = "tenant_1";
        queryUtils.methods.insertUserMasters(username,email,password,role_name,tenant_name,function(err,data){
            if(err){
                logger.error('error occured while inserting user data');
                callback(err,null);
            }else{
                logger.debug('user inserted successfully during service start');
                callback(null,true);
            }
        });
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
            console.log(queryUtils.roleMasterData);
            /*queryUtils.methods.checkUserPermissionForAction('admin',function(err,data){ 
                console.log(err);
            });*/
        }
    });
});