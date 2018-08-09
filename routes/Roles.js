const express = require('express');
var bodyParser = require('body-parser');
var http = require("http");
var settings =require('../config/settings.js');
var logger = require('../config/logger.js').getLogger('userRoleAction');
var mongo = require('../dao/mongo-connect.js');
var queryUtils = require('../dao/query-utils.js');
var AuthorizationHelper = require('../helper/authorization.js');
var router = express.Router();
var constants = require('../util/Constants.js');
var bcrypt = require('bcrypt');

router.post('/insertRole', function userRoleActionForRoleMaster(req, res) {    
try {
        var conn = mongo.client;
        var role_name = req.body.role_name;
        var permissions = req.body.permissions;
        var args = {
            action : constants.CREATE,
            user : req.body.logged_in_user,
            tenant_name : req.body.tenant_name
        }
        AuthorizationHelper.auth(args, function(err, dbres) {
            if (err) {
                logger.error('userRoleActionForRoleMaster: error in userRoleActionForRoleMaster');
                res.status(500).send('Error occured while determining user permissions');
            } else if (dbres) { //dbres is either true or false
                logger.debug(dbres);
                queryUtils.methods.insertRoleMasters(role_name,permissions,args.tenant_name,function(ierr,result){
                    if(ierr){
                        res.send('ERROR' + ierr.stack);
                    }else{
                        res.send(JSON.stringify({
                        "result": "SUCCESS"
                }));
                    }
                });
            } else {
                res.send(JSON.stringify({
                    "result": "FAILURE"
                }));
            }
        });
    } catch (e) {
        logger.error(e.stack);
        res.status(500).send('technical error occured while preparing userRoleActionForRoleMaster service');
    }
});


module.exports = router;
