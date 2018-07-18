var settings = {
"mongo":
  {
         "url":"mongodb://admin:admin@chenoacluster-shard-00-00-7on4g.mongodb.net:27017,chenoacluster-shard-00-01-7on4g.mongodb.net:27017,chenoacluster-shard-00-02-7on4g.mongodb.net:27017/test?ssl=true&replicaSet=ChenoaCluster-shard-0&authSource=admin&retryWrites=true"
  },
"contextRoot" : '/services/',
"logLevel" : 'DEBUG',
"appPort": "9090",
"timeOut": 500,
"mockPort":3333
}

module.exports =settings;
