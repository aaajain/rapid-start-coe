var mongoose = require('mongoose');

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

mongoose.model('role_master',roleSchema);
//module.exports.roleSchema = roleSchema;