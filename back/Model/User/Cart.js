const mongoose = require("mongoose");
const ObjectID = mongoose.Schema.Types.ObjectId;
// MongoDB Schema
const cartSchema = new mongoose.Schema(
  {
    cartId: { type: String }, // Auto-generated cart ID
    userId: { type: String, required: true },
    username: { type: String },
    mobile: { type: String },
    items: [{ 
      foodname: String, 
      totalPrice: Number, 
      Quantity: Number,
      image: String,
      unit:String,
      foodItemId:{
        type:ObjectID,
        ref: 'Fooditem'
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
    }],
    lastUpdated: { type: Date, default: Date.now },
    abandoned: { type: Boolean, default: false },
    emailSent: { type: Boolean, default: false },
    companId: { type: String },
    status: {
      type: String,
      default: "Added",
    },
  },
  { timestamps: true }
);

// Pre-save hook to generate a unique cart ID
cartSchema.pre("save", async function (next) {
  if (!this.cartId) {
    const lastCart = await mongoose
      .model("Cart")
      .findOne()
      .sort({ cartId: -1 });
    let newId = "DDAC0001"; // Default ID if no previous carts exist

    if (lastCart && lastCart.cartId) {
      const lastNumber = parseInt(lastCart.cartId.replace("DDAC", ""), 10);
      newId = `DDAC${(lastNumber + 1).toString().padStart(4, "0")}`;
    }

    this.cartId = newId;
  }
  next();
});

const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;
