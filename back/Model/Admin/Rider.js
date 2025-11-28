const mongoose = require("mongoose");

const riderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    alternatePhone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    hub: { type: String, trim: true },
    vehicleType: { type: String, trim: true },
    vehicleNumber: { type: String, trim: true },
    status: {
      type: String,
      enum: ["active", "inactive", "blocked"],
      default: "active",
    },
    onboardingDate: { type: Date, default: Date.now },
    documents: {
      aadhaarNumber: { type: String, trim: true },
      licenseNumber: { type: String, trim: true },
    },
    notes: { type: String, trim: true },
    otp: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Rider", riderSchema);

