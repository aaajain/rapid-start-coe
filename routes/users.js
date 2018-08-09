const express = require('express');
var bodyParser = require('body-parser');
var http = require("http");
var settings =require('../config/settings.js');
var logger = require('../config/logger.js').getLogger('users');
var mongo = require('../dao/mongo-connect.js');
var queryUtils = require('../dao/query-utils.js');
var AuthorizationHelper = require('../helper/authorization.js');
var router = express.Router();
var constants = require('../util/Constants.js');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var fs = require('fs');

router.get('/getAllUsers', function getAllUsers(req, res) {
     try {
     	var conn = mongo.client;
        var args = {
            action : constants.VIEW,
            user : req.query.logged_in_user,
            tenant_name : req.query.tenant_name,
            authToken:req.headers.authorization //token
        }
        AuthorizationHelper.auth(args, function(err, dbres) {
            if (err) {
                logger.error('getAllUsers: error in fetching record');
                res.status(500).send('Cound not fetch data');
            } else if (dbres) { //dbres is either true or false
                logger.debug(dbres);
                queryUtils.methods.getAllUsers(args.tenant_name,function(ierr,result){
                    if(err){
                        res.send('ERROR' + ierr.stack);
                    }else{
                        res.send(JSON.stringify({
                        "result": result
                    }));
                    }
                });
            } else {
            logger.debug(dbres);
                res.send(JSON.stringify({
                    "result": "fail"
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
            user : req.body.logged_in_user,
            tenant_name : req.body.tenant_name,
            authToken:req.headers.authorization //token
        }
        AuthorizationHelper.auth(args, function(err, dbres) {
            if (err) {
                logger.error('userActionForUserMaster: error in userActionForUserMaster');
                res.status(500).send('Error occured while determining user permissions');
            } else if (dbres) { //dbres is either true or false
                logger.debug(dbres);
                queryUtils.methods.insertUserMasters(username,email,hash,role_name,args.tenant_name,function(ierr,result){
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

router.post('/login',function(req,res){
    var conn = mongo.client;
    var username = req.body.username;
    var password = req.body.password;
    //var salt = bcrypt.genSaltSync(constants.SALT_ROUNDS);
    //ar hashedPwd = bcrypt.hashSync(password, salt);
    var tenant_name = req.body.tenant_name;
    queryUtils.methods.checkUserPermissionForAction(username,tenant_name,function(err,data){
        if(err)
        {
            logger.error('invalid login details '+err.stack);
            res.status(403).send('invalid credentials');
        }
        else if(data)
        {
            //set the jwt
            //logger.debug(data);
            var dbPwd = data.dbPwd;
            var permissions = data.permissions;
            bcrypt.compare(password, dbPwd, function(err, hashres) {
            if(hashres) {
                //read the cert
                var cert = fs.readFileSync(data.tenantCertPath); //todo use async file read
                //console.log(cert);
                jwt.sign({ username: username,permissions: permissions}, cert, {expiresIn: settings.auth_expiration }, function(err, token) {
                    if(err)
                    {
                        logger.error('invalid login details '+err.stack);
                        res.status(403).send('invalid credentials');
                    }
                    else
                    {
                        logger.debug('login successful');
                        res.send({msg:'login successful',auth:token});
                    }
                });
              } else {
                logger.debug('invalid credentials');
                res.status(403).send('invalid credentials');
              } 
            });
        }
        else
        {
            logger.error('invalid login details');
            res.status(403).send('invalid credentials');
        }
    })
});

module.exports = router;
