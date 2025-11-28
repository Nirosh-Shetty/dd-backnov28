


// const mongoose = require("mongoose");

// const orderItemSchema = new mongoose.Schema({
//   id: { type: String, required: true },
//   orderSlot: { type: String, required: true },
//   isPacked: { type: Boolean, default: false },
//   quantity: { type: Number, default: 1 },
//   customerName: { type: String, default: 'Unknown Customer' },
//   orderId: { type: String },
//   productId: { type: String },
//   itemIndex: { type: Number, default: 0 }
// });

// const hubDetailsSchema = new mongoose.Schema({
//   hubId: { type: String },
//   hubName: { type: String },
//   locationAddress: [{ type: String }]
// });

// const packingSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true, index: true },
//     category: { type: String },
//     categoryName: { type: String },
//     unit: { type: String },
//     ordered: { type: String },
//     totalOrdered: { type: Number, default: 0 },
//     packed: { type: Number, default: 0 },
//     isPacked: { type: Boolean, default: false },
//     isFullyPacked: { type: Boolean, default: false },
//     orders: [orderItemSchema],
//     hub: { type: [String], default: [] },
//     slot: { type: String, required: true },
//     hubDetails: hubDetailsSchema,
//     // New fields for individual item tracking
//     originalOrderId: { type: String },
//     originalProductId: { type: String },
//     itemSequence: { type: Number, default: 1 },
//     totalItemsInOrder: { type: Number, default: 1 },
//     individualPackingId: { type: mongoose.Schema.Types.ObjectId } // Reference to individual item
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Packing", packingSchema);



















const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  orderSlot: { type: String, required: true },
  isPacked: { type: Boolean, default: false },
  quantity: { type: Number, default: 1 },
  customerName: { type: String, default: 'Unknown Customer' },
  deliveryLocation: { type: String, default: 'Unknown Location' }, // Added delivery location
  orderId: { type: String },
  productId: { type: String },
  itemIndex: { type: Number, default: 0 }
});

const hubDetailsSchema = new mongoose.Schema({
  hubId: { type: String },
  hubName: { type: String },
  locationAddress: [{ type: String }],
  deliveryLocation: { type: String } // Added delivery location
});

const packingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    category: { type: String },
    categoryName: { type: String },
    unit: { type: String },
    ordered: { type: String },
    totalOrdered: { type: Number, default: 0 },
    packed: { type: Number, default: 0 },
    isPacked: { type: Boolean, default: false },
    isFullyPacked: { type: Boolean, default: false },
    orders: [orderItemSchema],
    hub: { type: [String], default: [] },
    slot: { type: String, required: true },
    hubDetails: hubDetailsSchema,
    // New fields for individual item tracking
    originalOrderId: { type: String },
    originalProductId: { type: String },
    itemSequence: { type: Number, default: 1 },
    totalItemsInOrder: { type: Number, default: 1 },
    individualPackingId: { type: mongoose.Schema.Types.ObjectId },
    // Added delivery location fields
    deliveryLocation: { type: String, default: 'Unknown Location', index: true } // Main delivery location field
  },
  { timestamps: true }
);

// Index for better query performance
packingSchema.index({ deliveryLocation: 1, createdAt: 1 });
packingSchema.index({ hub: 1, deliveryLocation: 1 });
packingSchema.index({ slot: 1, deliveryLocation: 1 });

module.exports = mongoose.model("Packing", packingSchema);