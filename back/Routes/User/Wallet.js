const express = require('express');
const router = express.Router();
const walletController = require('../../Controller/User/Wallet');
// const , authorize } = require('../middleware/auth');

// Get wallet for a user
router.get('/user/:userId', walletController.getWallet);

// Add free cash to a user's wallet (admin only)
router.post('/add-free-cash', walletController.addFreeCash);
router.post('/deduct-cash', walletController.deductAmout);
router.get('/all', walletController.getAllWallets);

// Apply wallet amount to an order
router.post('/apply-to-order', walletController.applyToOrder);

// Update wallet settings (admin only)
router.put('/settings', walletController.updateSettings);
router.get('/getsettings', walletController.getwalletsetting);

// Get transaction history
router.get('/transactions/:userId', walletController.getTransactionHistory);
router.get('/getAllWalletCompsny/:companyId', walletController.getAllWalletsByCompany);

// Export all wallets for Excel
router.get('/export-all', walletController.exportAllWallets);

module.exports = router;

// Webhook/Event handler for user registration
// middleware/userEvents.js
// const walletController = require('../../Controller/User/Wallet');

exports.handleUserRegistration = async (user) => {
  try {
    await walletController.initializeWallet(user._id);
    console.log(`Wallet initialized for new user: ${user._id}`);
  } catch (error) {
    console.error('Error in user registration handler:', error);
  }
};