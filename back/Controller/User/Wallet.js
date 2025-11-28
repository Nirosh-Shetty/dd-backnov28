// controllers/walletController.js
const Wallet = require("../../Model/User/Wallet");
const WalletSettings = require("../../Model/User/WalletSetting");

// Create or initialize a wallet for a new user
exports.initializeWallet = async (userId) => {
  try {
    // Check if settings exist, create default if not
    let settings = await WalletSettings.findOne();
    if (!settings) {
      settings = await WalletSettings.create({
        newUserBonus: 10,
        minCartValueForWallet: 50,
        maxWalletUsagePerOrder: 100,
        defaultFreeCashExpiryDays: 30,
      });
    }

    // Check if wallet already exists
    let wallet = await Wallet.findOne({ userId });

    if (wallet) {
      return wallet;
    }

    // Calculate expiry date for initial bonus
    const expiryDate = new Date();
    expiryDate.setDate(
      expiryDate.getDate() + settings.defaultFreeCashExpiryDays
    );

    // Create new wallet with initial bonus
    wallet = await Wallet.create({
      userId,
      balance: settings.newUserBonus,
      transactions: [
        {
          amount: settings.newUserBonus,
          type: "credit",
          description: "Welcome bonus",
          isFreeCash: true,
          expiryDate,
        },
      ],
    });

    return wallet;
  } catch (error) {
    console.error("Error initializing wallet:", error);
    throw error;
  }
};

// Get wallet for a user
// exports.getWallet = async (req, res) => {
//   try {
//     const userId = req.params.userId;

//     let wallet = await Wallet.findOne({ userId });


//     if (!wallet) {
//     //   wallet = await this.initializeWallet(userId);
//     return res.status(200).json({
//       success: true,
//       data: {
//         wallet:{balance:0},

//       },
//     });

//     } else {
//       // Check for expired free cash and update balance
//       const currentDate = new Date();
//       let expiredAmount = 0;

//       wallet.transactions.forEach((transaction) => {
//         if (
//           transaction.isFreeCash &&
//           transaction.type === "credit" &&
//           transaction.expiryDate &&
//           transaction.expiryDate < currentDate
//         ) {
//           expiredAmount += transaction.amount;
//         }
//       });

//      if (expiredAmount > 0 && wallet.balance >= expiredAmount) {
//   wallet.balance -= expiredAmount;
//   wallet.transactions.push({
//     amount: expiredAmount,
//     type: "debit",
//     description: "Expired free cash",
//     isFreeCash: true,
//   });


//         await wallet.save();
//       }
//     }

//     // Get wallet settings
//     const settings = await WalletSettings.findOne();

//     res.status(200).json({
//       success: true,
//       data: {
//         wallet,
//         settings: {
//           minCartValueForWallet: settings.minCartValueForWallet,
//           maxWalletUsagePerOrder: settings.maxWalletUsagePerOrder,
//         },
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching wallet:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch wallet",
//     });
//   }
// };

exports.getWallet = async (req, res) => {
  try {
    const userId = req.params.userId;


    if (!userId) {
      return res.status(200).json({
        success: true,
        data: {
          wallet: { balance: 0, transactions: [] },
        },
      });
    }

    let wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      return res.status(200).json({
        success: true,
        data: {
          wallet: { balance: 0, transactions: [] },
        },
      });
    }

    const settings = await WalletSettings.findOne() || {
      minCartValueForWallet: 0,
      maxWalletUsagePerOrder: 100,
    };

    if(wallet.companyId){
      return res.status(200).json({
        success: true,
        data: {
          wallet,
          settings: {
            minCartValueForWallet: settings.minCartValueForWallet,
            maxWalletUsagePerOrder: settings.maxWalletUsagePerOrder,
          },
        },
      });
    }else {

    const currentDate = new Date();

    // Filter expired free cash transactions that haven't been processed
    const expiredTransactions = wallet.transactions.filter(
      (transaction) =>
        transaction.isFreeCash &&
        transaction.type === "credit" &&
        transaction.expiryDate &&
        new Date(transaction.expiryDate) < currentDate &&
        !transaction.expiredProcessed
    );

    // Calculate total expired amount
    const expiredAmount = expiredTransactions.reduce(
      (total, transaction) => total + Math.abs(transaction.amount),
      0
    );

    console.log("Expired Amount:", expiredAmount);

    // Process expired transactions if any exist
    if (expiredAmount > 0) {
      // Only deduct what's available to prevent negative balance
      const deductibleAmount = Math.min(expiredAmount, wallet.balance);

      if (deductibleAmount > 0) {
        // Mark expired transactions as processed
        expiredTransactions.forEach((transaction) => {
          transaction.expiredProcessed = true;
        });

        // Add debit transaction for expired amount
        wallet.balance -= deductibleAmount;
        wallet.transactions.push({
          amount: deductibleAmount,
          type: "debit",
          description: "Expired free cash",
          isFreeCash: true,
          createdAt: currentDate,
          expiredProcessed: true,
        });

        // Save updated wallet
        await wallet.save();

        // Refresh wallet data
        wallet = await Wallet.findOne({ userId });
      }
    }

    // Get wallet settings
 

    // Format balance to avoid floating-point issues
    wallet.balance = Number.isInteger(wallet.balance)
      ? wallet.balance
      : Number(wallet.balance.toFixed(2));

    return res.status(200).json({
      success: true,
      data: {
        wallet,
        settings: {
          minCartValueForWallet: settings.minCartValueForWallet,
          maxWalletUsagePerOrder: settings.maxWalletUsagePerOrder,
        },
      },
    });
  }
  } catch (error) {
    console.error("Error fetching wallet:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to fetch wallet",
    });
  }
};


exports.getAllWallets = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortBy = "_id",
      sortOrder = "desc"
    } = req.query;

    // Convert page and limit to numbers
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query object
    let query = {};

    // Add search functionality - Fixed to handle populated user data
    if (search) {
      // First, find users matching the search criteria
      const CustomerModel = require('../../Model/User/Userlist');
      const searchConditions = [
        { Fname: { $regex: search, $options: "i" } },
        { Email: { $regex: search, $options: "i" } }
      ];
      
      // Add mobile search - handle both numeric and string inputs
      const numericSearch = parseFloat(search);
      if (!isNaN(numericSearch) && isFinite(numericSearch)) {
        // Search for exact mobile number match
        searchConditions.push({ Mobile: numericSearch });
        // Also search for mobile numbers containing the search term (convert to string for regex)
        searchConditions.push({ 
          $expr: { 
            $regexMatch: { 
              input: { $toString: "$Mobile" }, 
              regex: search, 
              options: "i" 
            } 
          } 
        });
      } else {
        // For non-numeric search, search mobile as string using $expr
        searchConditions.push({ 
          $expr: { 
            $regexMatch: { 
              input: { $toString: "$Mobile" }, 
              regex: search, 
              options: "i" 
            } 
          } 
        });
      }
      
      const matchingUsers = await CustomerModel.find({ $or: searchConditions })
        .select('_id')
        .lean();
      
      const userIds = matchingUsers.map(user => user._id);
      
      if (userIds.length > 0) {
        query.userId = { $in: userIds };
      } else {
        // If no users found, return empty result
        query.userId = { $in: [] };
      }
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Get total count for pagination
    const totalCount = await Wallet.countDocuments(query);

    // Get paginated data
    let data = await Wallet.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .populate("userId");

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.status(200).json({
      success: data,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        limit: limitNum,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (error) {
    console.error("Error fetching wallets:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch wallets"
    });
  }
};

exports.addwalletSetiitn = async (req, res) => {
  try {
    const {
      newUserBonus,
      minCartValueForWallet,
      maxWalletUsagePerOrder,
      defaultFreeCashExpiryDays,
    } = req.body;

    let data = await WalletSettings.findOne();
    if (data) {
      data.newUserBonus = newUserBonus;
      data.minCartValueForWallet = minCartValueForWallet;
      data.defaultFreeCashExpiryDays = defaultFreeCashExpiryDays;
      data.maxWalletUsagePerOrder = maxWalletUsagePerOrder;
      data = await data.save();
    } else {
      data = await WalletSettings.create({
        newUserBonus,
        minCartValueForWallet,
        maxWalletUsagePerOrder,
        defaultFreeCashExpiryDays,
      });
    }

    return res.status(200).json({ success: "data" });
  } catch (error) {
    console.error("Error fetching wallet:", error);
  }
};

// Add free cash to a user's wallet
exports.addFreeCash = async (req, res) => {
  try {
    const { userId, amount, description, expiryDays, companyId } = req.body;

    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid input parameters",
      });
    }

    // Get wallet settings
    let expiryDate
    if (expiryDays) {
      expiryDate = new Date(expiryDays);
    } else {
      const settings = await WalletSettings.findOne();

      // Calculate expiry date
      expiryDate = new Date();

      expiryDate.setDate(
        expiryDate.getDate() + (expiryDays || settings.defaultFreeCashExpiryDays)
      );
    }


    // Find or create wallet
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = await Wallet.create({ userId: userId, companyId: companyId || "" });
    }


    // Add transaction
    wallet.transactions.push({
      amount,
      type: "credit",
      description: description || "Free cash bonus",
      isFreeCash: true,
      expiryDate,
    });

    // Update balance
    wallet.balance += Number(amount);
    wallet.updatedAt = Date.now();

    await wallet.save();

    res.status(200).json({
      success: true,
      data: wallet,
    });
  } catch (error) {
    console.error("Error adding free cash:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add free cash",
    });
  }
};

exports.deductAmout = async (req, res) => {
  try {
    const { userId, amount, description, expiryDays } = req.body;

    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid input parameters",
      });
    }

    // Find or create wallet
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = await Wallet.create({ userId });
    }

    // Add transaction
    wallet.transactions.push({
      amount,
      type: "debit",
      description: description || "Wallet deduction",
      isFreeCash: false,
      expiryDate: null,
    });

    // Update balance
    wallet.balance -= Number(amount);
    wallet.updatedAt = Date.now();

    await wallet.save();

    res.status(200).json({
      success: true,
      data: wallet,
    });
  } catch (error) {
    console.error("Error adding free cash:", error);
    res.status(500).json({
      success: false,
      message: "Failed to deduct cash",
    });
  }
};

// Apply wallet amount to an order
exports.applyToOrder = async (req, res) => {
  try {
    const { userId, orderId, amount, cartTotal } = req.body;

    if (!userId || !orderId || !amount || amount <= 0 || !cartTotal) {
      return res.status(400).json({
        success: false,
        message: "Invalid input parameters",
      });
    }

    // Get wallet settings
    const settings = await WalletSettings.findOne();

    // Check if cart meets minimum value requirement
    if (cartTotal < settings.minCartValueForWallet) {
      return res.status(400).json({
        success: false,
        message: `Cart total must be at least ${settings.minCartValueForWallet} to use wallet`,
      });
    }

    // Check if amount exceeds max allowed per order
    const maxAllowed = Math.min(settings.maxWalletUsagePerOrder, cartTotal);
    const amountToUse = Math.min(amount, maxAllowed);

    // Get wallet
    const wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found",
      });
    }


    // Check if enough balance
    if (wallet.balance < amountToUse) {
      return res.status(400).json({
        success: false,
        message: "Insufficient wallet balance",
      });
    }

    // Deduct from wallet
    wallet.balance -= amountToUse;
    wallet.transactions.push({
      amount: amountToUse,
      type: "debit",
      description: `Applied to order ${orderId}`,
      orderId,
    });

    wallet.updatedAt = Date.now();
    await wallet.save();

    res.status(200).json({
      success: true,
      data: {
        appliedAmount: amountToUse,
        remainingBalance: wallet.balance,
      },
    });
  } catch (error) {
    console.error("Error applying wallet to order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to apply wallet to order",
    });
  }
};
exports.getwalletsetting = async (req, res) => {
  try {
    let data = await WalletSettings.findOne();

    return res.status(200).json({ success: data });
  } catch (error) {
    console.error("Error getting wallet setting:", error);
  }
};
// Update wallet settings
exports.updateSettings = async (req, res) => {
  try {
    const {
      newUserBonus,
      minCartValueForWallet,
      maxWalletUsagePerOrder,
      defaultFreeCashExpiryDays,
    } = req.body;

    // Find settings or create default
    let settings = await WalletSettings.findOne();

    if (!settings) {
      settings = new WalletSettings({});
    }

    // Update fields if provided
    if (newUserBonus !== undefined) settings.newUserBonus = newUserBonus;
    if (minCartValueForWallet !== undefined)
      settings.minCartValueForWallet = minCartValueForWallet;
    if (maxWalletUsagePerOrder !== undefined)
      settings.maxWalletUsagePerOrder = maxWalletUsagePerOrder;
    if (defaultFreeCashExpiryDays !== undefined)
      settings.defaultFreeCashExpiryDays = defaultFreeCashExpiryDays;

    settings.updatedAt = Date.now();
    await settings.save();

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Error updating wallet settings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update wallet settings",
    });
  }
};

// Get transaction history
exports.getTransactionHistory = async (req, res) => {
  try {
    const userId = req.params.userId;
    if(!userId) {
      
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    const wallet = await Wallet.findOne({ userId });

    if (!wallet) {
     return res.status(200).json({
        success: true,
        data: [],
      });
    }

    // Sort transactions by date (newest first)
    const transactions = wallet.transactions.sort(
      (a, b) => b.createdAt - a.createdAt
    );

    res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    console.log("Error fetching transaction history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch transaction history",
    });
  }
};

exports.getAllWalletsByCompany = async (req, res) => {
  try {
let companyId = req.params.companyId;
    let wallets = await Wallet.find({ companyId }).sort({ _id: -1 }).populate("userId");;
    res.status(200).json({
      success: true,
      data: wallets,
    });
  } catch (error) {

  }
}

// Export all wallets for Excel (chunked for large datasets)
exports.exportAllWallets = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 1000 } = req.query;

    // Build query object
    let query = {};

    // Add search functionality - Fixed to handle populated user data
    if (search) {
      // First, find users matching the search criteria
      const CustomerModel = require('../../Model/User/Userlist');
      const searchConditions = [
        { Fname: { $regex: search, $options: "i" } },
        { Email: { $regex: search, $options: "i" } }
      ];
      
      // Add mobile search - handle both numeric and string inputs
      const numericSearch = parseFloat(search);
      if (!isNaN(numericSearch) && isFinite(numericSearch)) {
        // Search for exact mobile number match
        searchConditions.push({ Mobile: numericSearch });
        // Also search for mobile numbers containing the search term (convert to string for regex)
        searchConditions.push({ 
          $expr: { 
            $regexMatch: { 
              input: { $toString: "$Mobile" }, 
              regex: search, 
              options: "i" 
            } 
          } 
        });
      } else {
        // For non-numeric search, search mobile as string using $expr
        searchConditions.push({ 
          $expr: { 
            $regexMatch: { 
              input: { $toString: "$Mobile" }, 
              regex: search, 
              options: "i" 
            } 
          } 
        });
      }
      
      const matchingUsers = await CustomerModel.find({ $or: searchConditions })
        .select('_id')
        .lean();
      
      const userIds = matchingUsers.map(user => user._id);
      
      if (userIds.length > 0) {
        query.userId = { $in: userIds };
      } else {
        // If no users found, return empty result
        query.userId = { $in: [] };
      }
    }

    // Get total count first
    const totalCount = await Wallet.countDocuments(query);
    
    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    const totalPages = Math.ceil(totalCount / limitNum);

    // Get chunked data
    let data = await Wallet.find(query)
      .select('userId balance companyId createdAt updatedAt transactions')
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("userId", "Mobile Fname Lname Email")
      .lean();

    // Transform data to include only essential fields for export
    const exportData = data.map(wallet => ({
      _id: wallet._id,
      userId: wallet.userId,
      balance: wallet.balance,
      companyId: wallet.companyId,
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt,
      transactions: wallet.transactions || []
    }));

    res.status(200).json({
      success: exportData,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        limit: limitNum,
        hasNextPage: pageNum < totalPages
      }
    });
  } catch (error) {
    console.error("Error exporting wallets:", error);
    res.status(500).json({
      success: false,
      message: "Failed to export wallets"
    });
  }
};
