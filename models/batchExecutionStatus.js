var mongoose = require('mongoose');

var batchExecutionStatusSchema = new mongoose.Schema({
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
  is_success:{
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

mongoose.model('batch_execution_status',batchExecutionStatusSchema);
