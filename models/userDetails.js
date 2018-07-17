var mongoose = require('mongoose');

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

mongoose.model('user_master',userSchema);

