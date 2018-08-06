const express = require('express');
var bodyParser = require('body-parser');
var http = require("http");
var settings =require('../config/settings.js');
var logger = require('../config/logger.js').getLogger('getAllUsers');
var mongo = require('../dao/mongo-connect.js');
var queryUtils = require('../dao/query-utils.js');
var AuthorizationHelper = require('../helper/authorization.js');
var router = express.Router();
var constants = require('../util/Constants.js');
var bcrypt = require('bcrypt');

router.get('/getAllUsers', function getAllUsers(req, res) {
     try {
     	var conn = mongo.client;
        var args = {
            action : constants.VIEW,
            user : req.query.logged_in_user,
            tenant_name : req.query.tenant_name
        }
        AuthorizationHelper.auth(args, function(err, dbres) {
            if (err) {
                logger.error('getAllUsers: error in fetching record');
                res.status(500).send('Cound not fetch data');
            } else if (dbres) { //dbres is either true or false
                logger.debug(dbres);
                queryUtils.methods.getAllUsers(args.tenant_name,function(ierr,result){
                    if(ierr){
                        res.send('ERROR' + ierr.stack);
                    }else{
                        res.send(JSON.stringify({
                        "Result": result
                    }));
                    }
                });
            } else {
            logger.debug(dbres);
                res.send(JSON.stringify({
                    "result": "FAILURE"
                }));
            }
        });
    } catch (e) {
        logger.error(e.stack);
        res.status(500).send('technical error occured while fetching record from user_masters table');
    }
});

router.post('/createUser', function userActionForUserMaster(req, res) {    
try {
        var conn = mongo.client;
        var username = req.body.username;
        var role_name = req.body.role_name;
        var email = req.body.email;
        var password = req.body.password;
        var salt = bcrypt.genSaltSync(constants.SALT_ROUNDS);
        var hash = bcrypt.hashSync(password, salt);
        logger.debug(hash);
        var args = {
            action : constants.CREATE,
            user : req.body.logged_in_user
        }
        AuthorizationHelper.auth(args, function(err, dbres) {
            if (err) {
                logger.error('userActionForUserMaster: error in userActionForUserMaster');
                res.status(500).send('Error occured while determining user permissions');
            } else if (dbres) { //dbres is either true or false
                logger.debug(dbres);
                queryUtils.methods.insertUserMasters(username,email,hash,role_name,function(ierr,result){
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
        res.status(500).send('technical error occured while preparing userActionForUserMaster service');
    }
});

module.exports = router;
