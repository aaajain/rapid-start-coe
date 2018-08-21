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

router.post('/role', function userRoleActionForRoleMaster(req, res) {    
try {
        var conn = mongo.client;
        var role_name = req.body.role_name;
        var permissions = req.body.permissions;
        queryUtils.methods.insertRoleMasters(role_name,permissions,req.body.tenant_name,function(ierr,result){
        if(ierr){
            logger.error(ierr.stack);
            res.status(500).send('technical error occured');
        }else{
            res.send('done');
        }
});
    } catch (e) {
        logger.error(e.stack);
        res.status(500).send('technical error occured');
    }
});


module.exports = router;
