var mongoose = require('mongoose');

var batchSchema = new mongoose.Schema({
  batch_size: {
    type: Number,
    required: true,
    trim: true
  },
  batch_name:{
  	type: String,
  	trim:true,
  	required:true
  },
  origin:{
    type: String,
    trim:true,
    required:true
  }
});

mongoose.model('batch_master',batchSchema);
