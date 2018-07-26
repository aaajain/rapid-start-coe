process.env.NODE_ENV = 'test';
var sinon = require('sinon');
var queryUtils = require('../dao/query-utils.js');
var AuthorizationHelper = require('../helper/authorization.js');
var assert     =  require('assert')

describe('test authorization', function () {
	before(function () {
		sinon.stub(queryUtils.methods,"checkUserPermissionForAction").yields(null,['create']);
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

describe('test authorization', function () {
	before(function () {
		sinon.stub(queryUtils.methods,"checkUserPermissionForAction").yields(null,['view']);
	});
	it('test if user was not authorized', function (done) {
		 AuthorizationHelper.auth({'user':'testUser','action':'create'},function(err,result){
		 	assert.equal(result,false);
		 })
		 done();
	});
	after(function () {
		queryUtils.methods.checkUserPermissionForAction.restore();
	});
});

describe('test authorization', function () {
	before(function () {
		sinon.stub(queryUtils.methods,"checkUserPermissionForAction").yields("test error",null);
	});
	it('test if err', function (done) {
		 AuthorizationHelper.auth({'user':'testUser','action':'create'},function(err,result){
		 	assert.equal(err,"test error");
		 })
		 done();
	});
	after(function () {
		queryUtils.methods.checkUserPermissionForAction.restore();
	});
});