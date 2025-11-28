const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  products: [{
    foodItemId: { type: String, required: true },
    price: { type: Number, required: true },
    customerType: { type: Number, required: true },
    minCart: { type: Number, required: true },
    foodname: { type: String },
    image: { type: String },
    unit: { type: String },
    quantity: { type: Number, default: 1 },
    Quantity: { type: Number, default: 1 },
    gst: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    foodcategory: { type: String },
    remainingstock: { type: Number, default: 0 },
    totalPrice: { type: Number },
  }],
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  hubId:{type:String},hubName:{type:String},locations:[],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Offer', offerSchema);