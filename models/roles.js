var mongoose = require('mongoose');
const mongoTenant = require('mongo-tenant');
var settings = require('../config/settings.js');

var roleSchema = new mongoose.Schema({
  role_name: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  permissions:{
  	type: [String],
  	trim:true,
  	required:true
  }
});

if(settings.is_mt_required){
    roleSchema.plugin(mongoTenant);
}

mongoose.model('role_master',roleSchema);
//module.exports.roleSchema = roleSchema;