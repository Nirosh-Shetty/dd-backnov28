const mongoose = require('mongoose');

const delayReasonSchema = new mongoose.Schema({
  reason: { type: String, required: true },
  reasonType:{
    type:String
  }
});

module.exports = mongoose.model('Reason', delayReasonSchema);