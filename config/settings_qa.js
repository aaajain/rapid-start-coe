var Setting = {
"rds":
  {
	  "user": '??', //env var: PGUSER 
	  "database": '??', //env var: PGDATABASE 
	  "password": '??', //env var: PGPASSWORD 
	  "host": '??',
	  "port": 5432
  },
"contextRoot" : '/services/',
"logLevel" : 'DEBUG',
"appPort": "??",
"timeOut": 50000,
"thresholdValue" : 300,
"offlinrCTUrl" : 'http://foundationui[environment-name].us-east-1.elasticbeanstalk.com/foundationsui/CT_OFFLINE?batch_id=',
"sendMail_CT" : true,
"CTLinkExpirationTime" : 60000,
"numbersOfCpu" : 4,
"timeForProcessingOneCtRecord" : 3000,
//config file path
"pathToConfig": "/home/ec2-user/foundations/REST/rest-conf/config.properties.json",
"mailcredentials": {
		"user": "vishal8singh8@gmail.com",
		"pass": "mfpamerbmrxgtatd",
		"to":"PKaur@chenoainc.com,PBhosale@chenoainc.com,PRamakrishnan@chenoainc.com,VSwaminathan@chenoainc.com,PSampathKumar@chenoainc.com",
		"cc" : "achavan@chenoainc.com,ndave@chenoainc.com,AAJain@chenoainc.com,PRedkar@chenoainc.com,SGupta@chenoainc.com,vishals@chenoainc.com",
		"text":"The batch id is $1 and batch size is $2"
	},
"mailcredentials_CT": {
		"user": "vishal8singh8@gmail.com",
		"pass": "mfpamerbmrxgtatd",
		"to":"nsingh@chenoainc.com",
		"cc" : "VSwaminathan@chenoainc.com",
		"text":"The batch id is $1 and batch size is $2"
	}
"pathToJbpmConfig": "/home/ec2-user/foundations/JBPM/rule-conf/config/config.properties",
"default_encryption_key":"rjhs",
"mockPort":3333
}

module.exports =Setting;