const mongoose = require('mongoose');

const walletSettingsSchema = new mongoose.Schema({
  newUserBonus: {
    type: Number,
    default: 0
  },
  minCartValueForWallet: {
    type: Number,
    default: 0
  },
  maxWalletUsagePerOrder: {
    type: Number,
    default: 0
  },
  defaultFreeCashExpiryDays: {
    type: Number,
    default: 30
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('WalletSettings', walletSettingsSchema);