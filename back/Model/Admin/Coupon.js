const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  couponName: {
    type: String,
    required: true,
     lowercase: true 
  },
  image: {
    type: String, // URL of the coupon image
    required: false,
  },
  shortDescription: {
    type: String,
    required: true,
  },
  applyUser: [{
      Name:{
          type:String
      },
      MobileNumber:{
           type:Number
      },
        AppliedDate: {
        type: Date,
        default: Date.now // Optional: Automatically sets the current date
    }
  }],
  discountPrice: {
    type: Number,
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the product collection
    ref: "Fooditem",
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("Coupon", couponSchema);
