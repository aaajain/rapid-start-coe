var MongoClient = require('mongodb').MongoClient;

MongoClient.connect(uri, { useNewUrlParser: true },function(err, client) {
   //const collection = client.db("test").collection("devices");
   // perform actions on the collection object
 logger.debug(err);
   //client.close();
});



/*var MongoClient = require('mongodb').MongoClient;

var uri = "mongodb://admin:admin@cluster0-shard-00-00.mongodb.net:27017,cluster0-shard-00-01.mongodb.net:27017,cluster0-shard-00-02.mongodb.net:27017/test?ssl=true&replicaSet=cluster0-shard-0&authSource=admin";
MongoClient.connect(uri, { useNewUrlParser: true } ,function(err, db) {
 console.log(err);
});*/


/*cluster0-shard-00-00-snti6.mongodb.net
cluster0-shard-00-00-snti6.mongodb.net*/