// Closure Schema
const mongoose=require('mongoose');
const closureSchema = new mongoose.Schema({
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    banner: { type: String, required: true },
    description: { type: String, },
    createdAt: { type: Date, default: Date.now },
  });
  
module.exports = mongoose.model('Closure', closureSchema);