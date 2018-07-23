const express = require('express');
var bodyParser = require('body-parser');
var http = require("http");
var settings =require('../config/settings.js');
var logger = require('../config/logger.js').getLogger('getAllUsers');
var mongo = require('../dao/mongo-connect.js');
var queryUtils = require('../dao/query-utils.js');
var AuthorizationHelper = require('../helper/authorization.js');
var router = express.Router();

router.get('/getAllUsers', function getAllUsers(req, res) {
     try {
     	var conn = mongo.client;
        var role_name = req.body.role_name;
        var args = {
            action : req.body.action,
            user : req.body.user
        }
        queryUtils.methods.getAllUsers(args.user,function(err, dbres) {
            if (err) {
                logger.error('getAllUsers: error in fetching record');
                res.status(500).send('Cound not fetch data');
            }else if (dbres) {
                    res.send(JSON.stringify({
                        "Result": dbres
                    }));

                } else {
                    res.send(JSON.stringify({
                        "Result": null
                    }));
                }
        }); 
    } catch (e) {
        logger.error(e.stack);
        res.status(500)
            .send('technical error occured while fetching record from user_masters table');
    }
});

module.exports = router;
