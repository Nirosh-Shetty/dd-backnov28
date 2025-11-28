const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReferralSettingsSchema = new Schema(
  {
    friendRewardAmount: {
      type: Number,
      default: 25, // Default reward for the new user (friend)
    },
    referrerRewardAmount: {
      type: Number,
      default: 25, 
    },
      
    totalFriendPayout: {
      type: Number,
      default: 0,
    },
    totalReferrerPayout: {
      type: Number,
      default: 0, 
    },
  },
  { timestamps: true }
);

ReferralSettingsSchema.statics.getSettings = function () {
  return this.findOneAndUpdate({}, {}, { upsert: true, new: true });
};

const ReferralSettings = mongoose.model(
  "ReferralSettings",
  ReferralSettingsSchema
);
module.exports = ReferralSettings;