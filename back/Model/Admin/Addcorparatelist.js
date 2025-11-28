const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema.Types;

const Addcorporateaddress = new Schema(
  {
    Apartmentname: {
      type: String,
    },
    logo: {
      type: String,
    },
    mobile: {
      type: Number,
    },
    Address: {
      type: String,
    },
    pincode: {
      type: Number,
    },
    //TODO: remove the apartmentDeliveryPrice anf time field if not needed
    apartmentdelivaryprice: {
      type: Number,
    },
    approximatetime: {
      type: String,
    },
    sequentialDeliveryPrice: {
      type: Number,
      default: 0,
    },
    sequentialDeliveryTime: {
      type: String,
      default: "0",
    },
    expressDeliveryPrice: {
      type: Number,
      default: 0,
    },
    expressDeliveryTime: {
      type: String,
      default: "0",
    },

    prefixcode: {
      type: String,
    },
    otp: {
      type: Number,
    },
    hubID: {
        type: ObjectId,
        ref: "Hub",
        required: false,
    },
    // New optional time slots fields
    lunchSlots: {
      type: [
        {
          time: {
            type: String,
            required: true,
          },
          active: {
            type: Boolean,
            default: true,
          },
        },
      ],
      default: [],
    },
    dinnerSlots: {
      type: [
        {
          time: {
            type: String,
            required: true,
          },
          active: {
            type: Boolean,
            default: true,
          },
        },
      ],
      default: [],
    },
    deliverypoint: {
      type: String,
    },
    locationType: {
      type: String,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const userAddcorporateaddress = mongoose.model(
  "Addcorporateaddress",
  Addcorporateaddress
);
module.exports = userAddcorporateaddress;
