process.env.NODE_ENV = 'test';
var sinon = require('sinon');
var queryUtils = require('../dao/query-utils.js');
var AuthorizationHelper = require('../helper/authorization.js');
var assert     =  require('assert')

describe('test authorization', function () {
	before(function () {
		sinon.stub(queryUtils.methods,"checkUserPermissionForAction").yields(null,true);
	});
	it('test if user was authorized', function (done) {
		 AuthorizationHelper.auth({'user':'testUser','action':'create'},function(err,result){
		 	assert.equal(result,true);
		 })
		 done();
	});
	after(function () {
		queryUtils.methods.checkUserPermissionForAction.restore();
	});
});