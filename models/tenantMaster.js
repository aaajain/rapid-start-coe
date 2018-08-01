var mongoose = require('mongoose');

var tenantSchema = new mongoose.Schema({
  tenant_name: {
    type: String,
    required: true,
    trim: true
  },
  status:{
  	type: String,
  	trim:true,
  	required:true
  }
});

mongoose.model('tenant_master',tenantSchema);
