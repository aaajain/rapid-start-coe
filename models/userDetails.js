var mongoose = require('mongoose');
const mongoTenant = require('mongo-tenant');
var settings = require('../config/settings.js');

var userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
  },
  role:{
  	type: mongoose.Schema.ObjectId,
  	ref: 'role_master',
  	required: true,
  }
});

if(settings.is_mt_required){
    userSchema.plugin(mongoTenant);
} 


mongoose.model('user_master',userSchema);

