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

router.get('/users', function getAllUsers(req, res) {
     try {
     	var conn = mongo.client;
        var offset = Number(req.query.offset);
        var limit = Number(req.query.limit);
        queryUtils.methods.getAllUsers(req.query.tenant_name,offset,limit,function(ierr,result){
            if(ierr){
                logger.error(ierr.stack);
                res.status(500).send('technical error occured');
            }else{
                res.send(JSON.stringify({"result": result}));
            }
        });
    } catch (e) {
        logger.error(e.stack);
        res.status(500).send('technical error occured');
    }
});

router.post('/user', function userActionForUserMaster(req, res) {    
try {
        var conn = mongo.client;
        var username = req.body.username;
        var role_name = req.body.role_name;
        var email = req.body.email;
        var password = req.body.password;
        var salt = bcrypt.genSaltSync(constants.SALT_ROUNDS);
        var hash = bcrypt.hashSync(password, salt);
        queryUtils.methods.insertUserMasters(username,email,hash,role_name,req.body.tenant_name,function(ierr,result){
            if(ierr){
                logger.error(ierr.stack)
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
