
const mongoose = require('mongoose');

const bagSchema = new mongoose.Schema({
  bagNo: { type: Number, required: true, unique: true },
});

module.exports = mongoose.model('Bag', bagSchema);
