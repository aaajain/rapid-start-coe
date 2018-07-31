var mongoose = require('mongoose');

var batchExceptionSchema = new mongoose.Schema({
  parameter_name: {
    type: String,
    required: true,
    trim: true
  },
  parameter_value:{
  	type: String,
  	trim:true,
  	required:true
  },
  exception_reason:{
    type: String,
    trim:true,
    required:true
  },
  exception_desc:{
    type: String,
    trim:true,
    required:true
  },
  origin:{
    type: String,
    trim:true,
    required:true
  },
  batch_id:{
    type: mongoose.Schema.ObjectId,
    ref: 'batch_master',
    required: true,
  }
});

mongoose.model('batch_exception',batchExceptionSchema);
