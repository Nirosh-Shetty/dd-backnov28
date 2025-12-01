const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const myPlanSchema = new mongoose.Schema(
  {
    userId: { type: ObjectId, ref: "Customer", required: true },
    deliveryDate: { type: Date, required: true },
    session: { type: String, enum: ["Lunch", "Dinner"], required: true },
    hubId: { type: String, required: true },
    username: { type: String },
    mobileNumber: { type: String },
    products: [
      {
        foodItemId: { type: ObjectId, ref: "addproduct" },
        foodName: { type: String },
        foodImage: { type: String },
        foodCategory: { type: String },
        basePrice: { type: Number },
        hubPrice: { type: Number },
        preOrderPrice: { type: Number },
        // price: { type: Number }, // Unit Price (Discounted if reserved)
        quantity: { type: Number },
        totalPrice: { type: Number },
      },
    ],

    slotTotalAmount: { type: Number, required: true }, // Total to pay for this card

    status: {
      type: String,
      // Pending: Waiting for payment
      // Confirmed: Paid
      // Skipped: Deadline passed without payment
      // Cancelled: Paid, but cancelled by user
      enum: [
        "Pending Payment",
        "Confirmed",
        "Skipped",
        "Cancelled",
        "Delivered",
      ],
      default: "Pending Payment",
    },
    orderType: {
      type: String,
      enum: ["Instant", "Reserved"], // Instant = Today, Reserved = Future
      required: true,
    },
    paymentDeadline: { type: Date, required: true },

    orderId: { type: ObjectId, ref: "Order", default: null },
    delivarylocation: {
      type: String,
    },
    coordinates: {
      type: {
        type: String,
        enum: ["Point"],
        // required: true
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },

    // deliveryNotes: { type: String },
    studentName: { type: String },
    studentClass: { type: String },
    studentSection: { type: String },
    addressType: {
      type: String,
    },
    schoolName: String,
    houseName: String,
    apartmentName: String,
    companyName: {
      type: String,
      default: "Normal User",
    },
    customerType: {
      type: String,
    },
    companyId: {
      type: String,
    },
  },
  { timestamps: true }
);

// Compound index to ensure 1 plan document per User+Date+Session
myPlanSchema.index(
  { userId: 1, deliveryDate: 1, session: 1 },
  { unique: true }
);

const MyPlanModel = mongoose.model("MyPlan", myPlanSchema);
module.exports = MyPlanModel;
