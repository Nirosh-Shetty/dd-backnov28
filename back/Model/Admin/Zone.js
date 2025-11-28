const mongoose = require("mongoose");

const zoneSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    paths: [
      {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
      },
    ],
    fillColor: {
      type: String,
      default: "#FF0000",
    },
    strokeColor: {
      type: String,
      default: "#FF0000",
    },
    fillOpacity: {
      type: Number,
      default: 0.35,
    },
    strokeOpacity: {
      type: Number,
      default: 0.8,
    },
    assignedRiders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Rider",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for better query performance
zoneSchema.index({ assignedRiders: 1 });
zoneSchema.index({ isActive: 1 });

module.exports = mongoose.model("Zone", zoneSchema);

