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

router.get('/getAllUsers', function getAllUsers(req, res) {
     try {
     	var conn = mongo.client;
        var args = {
            action : constants.VIEW,
            user : req.query.user
        }
        AuthorizationHelper.auth(args, function(err, dbres) {
            if (err) {
                logger.error('getAllUsers: error in fetching record');
                res.status(500).send('Cound not fetch data');
            } else if (dbres) { //dbres is either true or false
                logger.debug(dbres);
                queryUtils.methods.getAllUsers(function(ierr,result){
                    if(ierr){
                        res.send('ERROR' + ierr.stack);
                    }else{
                        res.send(JSON.stringify({
                        "Result": result
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
        res.status(500).send('technical error occured while fetching record from user_masters table');
    }
});

module.exports = router;
