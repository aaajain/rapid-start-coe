var mongoose = require('mongoose');
var multitenancy = require('mongoose-multitenancy');
 
multitenancy.setup();

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

mongoose.mtModel('role_master',roleSchema);
//module.exports.roleSchema = roleSchema;