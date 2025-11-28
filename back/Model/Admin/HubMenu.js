const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

// This schema is built to match your 'MenuUpload.jsx' UI and requirement doc
const hubMenuSchema = new mongoose.Schema(
  {
    productId: {
      type: ObjectId,
      ref: "Fooditem", // Refers to your existing Addproduct.js model
      required: true,
    },
    hubId: {
      type: ObjectId,
      ref: "Hub", // Refers to your existing HubModel.js model
      required: true,
    },
    menuDate: {
      type: Date, // The specific date this menu item is for
      required: true,
    },
    session: {
      type: String, // "Lunch" or "Dinner"
      enum: ["Lunch", "Dinner"],
      required: true,
    },
    basePrice: {
      type: Number, // The product's default price
      required: true,
    },
    hubPrice: { type: Number, required: true },
    preOrderPrice: {
      type: Number,
      required: true,
    },
    totalQuantity: {
      type: Number, // The stock for this hub/date/session ("Quantity")
      required: true,
    },
    remainingQuantity: {
      type: Number, // This will be reduced as orders come in
    },
    hubPriority: {
      type: Number, // "Hub Priority" from your doc
      default: 0,
    },
    isActive: {
      type: Boolean, // For the "Option to close (X/+)" button
      default: true,
    },
  },
  { timestamps: true }
);

// This automatically sets remainingQuantity = totalQuantity when a new entry is created
hubMenuSchema.pre("save", function (next) {
  if (this.isNew) {
    this.remainingQuantity = this.totalQuantity;
  }
  next();
});

// Add a compound index for fast menu lookups
hubMenuSchema.index({ hubId: 1, menuDate: 1, session: 1 });

const HubMenuModel = mongoose.model("HubMenu", hubMenuSchema);
module.exports = HubMenuModel;
