const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  orderDate: { type: Date, default: Date.now  },
  totalOrders: { type: Number, required: true },
  product: { type: String, required: true },
  location: { type: String, },
  cartValue: { type: Number, required: true },
  offerPrice: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('OfferReport', reportSchema);