const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const customerorderSchema = new mongoose.Schema(
  {
    customerId: {
      type: ObjectId,
      ref: "Customer",
    },
    deliveryDate: {
      type: Date,
      default: null,
    },
    session: {
      type: String,
      enum: ["Lunch", "Dinner", null],
      default: null,
    },
    hubId: {
      type: ObjectId,
      ref: "Hub",
    },
    cartId: {
      type: String,
    },
    cart_id: {
      type: String,
    },
    allProduct: [
      {
        foodItemId: {
          type: ObjectId,
          ref: "Fooditem",
        },
        totalPrice: {
          type: Number,
        },
        quantity: {
          type: Number,
        },
        name: {
          type: String,
        },
         category: {
          type: String,
        },
        unit: {
          type: String,
        },
        packed: {
          type: Boolean,
          default: false,
        },
        missing: {
          type: Boolean, // Added to track missing items
          default: false,
        },
      },
    ],
    ratted: {
      type: Boolean,
      default: false,
    },
    // rate: {
    //   type: Number,
    //   default: 0,
    // },
    // comment: {
    //   type: String,
    // },
    ratingOnOrder: {
      type: Number,
      default: 0,
    },
    commentOnOrder: {
      type: String,
    },
    ratingOnDelivery: {
      type: Number,
      default: 0,
    },
    commentOnDelivery: {
      type: String,
    },
    Cutlery: {
      type: String,
    },
    Placedon: {
      type: String,
    },
    couponId: {
      type: String,
    },
    coupon: {
      type: Number,
      default: 0,
    },
    discountWallet: {
      type: Number,
      default: 0,
    },
    // deliveryType: {
    //   type: String,
    //   default: "slot",
    // },
    slot: {
      type: String,
    },
    ordertype: {
      type: String,
    },
    orderdelivarytype: {
      type: String,
    },
    approximatetime: {
      type: String,
    },
    delivarylocation: {
      type: String,
    },
  coordinates: {
  type: {
    type: String,
    enum: ['Point'],
    // required: true
  },
  coordinates: {
    type: [Number],
    required: true
  }
},

    addressType:{
      type:String
    },
    hubName:{
      type:String
    },
    hubId:{
      type:String 
    },
    username: {
      type: String,
    },
    Mobilenumber: {
      type: Number,
    },
    paymentmethod: {
      type: String,
    },
    orderstatus: {
      type: String,
    },
    delivarytype: {
      type: Number,
    },
    payid: {
      type: String,
    },
    addressline: {
      type: String,
    },
    subTotal: {
      type: Number,
    },
    allTotal: {
      type: Number,
    },
    foodtotal: {
      type: Number,
    },
    apartment: {
      type: String,
    },
    prefixcode: {
      type: String,
    },
    orderid: {
      type: String,
    },
    tax: {
      type: Number,
    },
    deliveryMethod: {
      type: String,
    },
    orderId: {
      type: String,
    },
    reasonforcancel: {
      type: String,
    },
    companyId: {
      type: String,
    },
    companyName: {
      type: String,
      default: "Normal User",
    },
    customerType: {
      type: String,
    },
    deliveryCharge: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      default: "Cooking",
      enum: [
        "inprocess",
        "Cooking",
        "Packing",
        "Ontheway",
        "Delivered",
        "Undelivered",
        "Returned",
        "Cancelled",
        "Pending",
        "Partially Packed",
        "Packed",
        "On the way",
      ],
    },
    bagNo: {
      type: String,
    },
    packer: {
      type: String,
    },
    packername: {
      type: String,
    },
    timeLeft: {
      type: String,
      default: "15 Mins", // Default to 15 minutes
    },
    reason: {
      type: String,
    },
    packBefore: {
      type: String,
    },
    packeTime: {
      type: String,
    },
    driver: {
      type: String,
    },
    totalOrder: {
      type: Number,
      default: 0,
    },
         studentName: { type: String },
  studentClass: { type: String },
  studentSection: { type: String },
  },
  { timestamps: true }
);

const customerorderModel = mongoose.model("Foodorder", customerorderSchema);
module.exports = customerorderModel;
