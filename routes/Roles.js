const express = require('express');
var bodyParser = require('body-parser');
var http = require("http");
var settings =require('../config/settings.js');
var logger = require('../config/logger.js').getLogger('userRoleAction');
var mongo = require('../dao/mongo-connect.js');
var queryUtils = require('../dao/query-utils.js');
var AuthorizationHelper = require('../helper/authorization.js');
var router = express.Router();

router.post('/userRoleActionForRoleMaster', function userRoleActionForRoleMaster(req, res) {    
try {
        var conn = mongo.client;
        var role_name = req.body.role_name;
        var args = {
            action : req.body.action,
            user : req.body.user
        }
        AuthorizationHelper.auth(args, function(err, dbres) {
            if (err) {
                logger.error('userRoleActionForRoleMaster: error in userRoleActionForRoleMaster');
                res.status(500).send('Error occured while determining user permissions');
            } else if (dbres) { //dbres is either true or false
                logger.debug(dbres);
                conn.collection("role_masters").insertOne({permissions : args.action, role_name : role_name},{upsert: true},function(err,resp){
                    if(err){
                        res.send('ERROR' + err.stack);
                    }else{
                        res.send('SUCCESS' + dbres);
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
