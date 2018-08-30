process.env.NODE_ENV = 'test';
var sinon = require('sinon');
var jwt = require('jsonwebtoken');
var fs = require('fs');
var queryUtils = require('../dao/query-utils.js');
var AuthorizationHelper = require('../helper/authorization.js');
var assert     =  require('assert');

describe('test authorization', function () {
	before(function () {
		sinon.stub(jwt,"verify").yields(null,{username:'testUser',permissions:['create']});
		sinon.stub(fs,"readFileSync").returns(new Object());
		queryUtils['tenantData'] = [{tenant_name:'test',cert:'/test/path'}]
	});
	it('test if user was authorized', function (done) {
		 AuthorizationHelper.authorizeInterceptor({'user':'testUser','action':'create',tenant_name:'test',authToken:'test'},function(err,result){
		 	assert.equal(result,true);
		 });
		 done();
	});
	after(function () {
		queryUtils['tenantData'] = [];
		fs.readFileSync.restore();
		jwt.verify.restore();
	});
});

describe('test authorization', function () {
	before(function () {
		sinon.stub(jwt,"verify").yields(null,{username:'testUser',permissions:['view']});
		sinon.stub(fs,"readFileSync").returns(new Object());
		queryUtils['tenantData'] = [{tenant_name:'test',cert:'/test/path'}]
	});
	it('test if user was not authorized, invalid role', function (done) {
		 AuthorizationHelper.authorizeInterceptor({'user':'testUser','action':'create',tenant_name:'test',authToken:'test'},function(err,result){
		 	assert.equal(result,false);
		 })
		 done();
	});
	after(function () {
		queryUtils['tenantData'] = [];
		fs.readFileSync.restore();
		jwt.verify.restore();
	});
});

describe('test authorization', function () {
	before(function () {
		sinon.stub(jwt,"verify").yields(null,{username:'testUser1',permissions:['view']});
		sinon.stub(fs,"readFileSync").returns(new Object());
		queryUtils['tenantData'] = [{tenant_name:'test',cert:'/test/path'}]
	});
	it('test if user was not authorised, invalid user', function (done) {
		 AuthorizationHelper.authorizeInterceptor({'user':'testUser','action':'create',tenant_name:'test',authToken:'test'},function(err,result){
		 	assert.equal(result,false);
		 })
		 done();
	});
	after(function () {
		queryUtils['tenantData'] = [];
		fs.readFileSync.restore();
		jwt.verify.restore();
	});
});


describe('test authorization', function () {
	before(function () {
		sinon.stub(jwt,"verify").yields("test error",{username:'testUser',permissions:['create']});
		sinon.stub(fs,"readFileSync").returns(new Object());
		queryUtils['tenantData'] = [{tenant_name:'test',cert:'/test/path'}]
	});
	it('test if err', function (done) {
		 AuthorizationHelper.authorizeInterceptor({'user':'testUser','action':'create',tenant_name:'test',authToken:'test'},function(err,result){
		 	assert.equal(err,"test error");
		 })
		 done();
	});
	after(function () {
		queryUtils['tenantData'] = [];
		fs.readFileSync.restore();
		jwt.verify.restore();
	});
});