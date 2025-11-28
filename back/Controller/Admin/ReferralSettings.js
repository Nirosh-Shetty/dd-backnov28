const ReferralSettings = require("../../Model/Admin/ReferralSettingsModel");
const CustomerModel = require("../../Model/User/Userlist"); // Ensure correct path to Userlist model
const ExcelJS = require("exceljs");
const moment = require("moment");
class ReferralSettingsController {

  // Get global settings
  async getSettings(req, res) {
    try {
      let settings = await ReferralSettings.findOneAndUpdate( {}, { $setOnInsert: {} }, { upsert: true, new: true, setDefaultsOnInsert: true });
      return res.status(200).json({ success: true, settings });
    } catch (error) {
      console.error("Error fetching referral settings:", error);
      return res.status(500).json({ success: false, message: "Server Error fetching settings." });
    }
  }

  // Update global settings
  async updateSettings(req, res) {
    try {
      const { referrerRewardAmount, friendRewardAmount } = req.body;
      if (referrerRewardAmount == null || friendRewardAmount == null) {
        return res.status(400).json({ success: false, message: "Please provide both reward amounts." });
      }
      const updatedSettings = await ReferralSettings.findOneAndUpdate(
        {},
        { $set: { referrerRewardAmount: Number(referrerRewardAmount), friendRewardAmount: Number(friendRewardAmount) } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      return res.status(200).json({ success: true, message: "Settings updated successfully", settings: updatedSettings });
    } catch (error) {
      console.error("Error updating referral settings:", error);
      return res.status(500).json({ success: false, message: "Server Error updating settings." });
    }
  }

  // Set custom reward for a user
  async setCustomReferralReward(req, res) {
    try {
      const { userId } = req.params;
      const { rewardAmount } = req.body;
      const newRewardAmount = (rewardAmount === "" || rewardAmount === null || rewardAmount === undefined) ? null : Number(rewardAmount);

      const updatedUser = await CustomerModel.findByIdAndUpdate(
        userId,
        { $set: { customReferralReward: newRewardAmount } },
        { new: true } // Return the updated document
      );

      if (!updatedUser) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      return res.status(200).json({ success: true, message: "Custom reward updated", user: updatedUser });
    } catch (error) {
      console.error(`Error setting custom reward for user ${req.params.userId}:`, error);
      if (error.name === 'CastError') {
          return res.status(400).json({ success: false, message: "Invalid User ID format." });
      }
      return res.status(500).json({ success: false, message: "Server Error setting custom reward." });
    }
  }

  // Get KPI stats (Handles ties for top referrer)
  async getReferralStats(req, res) {
    try {
      const settings = await ReferralSettings.findOneAndUpdate({}, { $setOnInsert: {} }, { upsert: true, new: true, setDefaultsOnInsert: true });
      const successfulReferrals = await CustomerModel.countDocuments({ "referral.status": "success" });

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const thisMonthReferrals = await CustomerModel.countDocuments({
        "referral": { $ne: null },
        "createdAt": { $gte: startOfMonth },
      });

      // Find top referrer(s)
       const topReferrerGroups = await CustomerModel.aggregate([
         { $match: { "referral.status": "success" } }, // Only successful referrals count towards 'top'
         { $group: { _id: "$referral.referredBy", count: { $sum: 1 } } }, // Group by referrer and count
         { $group: { _id: "$count", referrers: { $push: "$_id" } } }, // Group again by count to find ties
         { $sort: { _id: -1 } }, // Sort counts descending
         { $limit: 1 }, // Take the group with the highest count
         { $lookup: { from: "customers", localField: "referrers", foreignField: "_id", as: "referrerDetails" } } // Lookup details for all tied referrers
       ]);

      let topReferrerData = { names: ["N/A"], count: 0 };
      if (topReferrerGroups.length > 0 && topReferrerGroups[0].referrerDetails.length > 0) {
        topReferrerData = {
          names: topReferrerGroups[0].referrerDetails.map(u => u.Fname || "Unnamed"),
          count: topReferrerGroups[0]._id // The count is the group _id
        };
      }

      const stats = {
        totalReferrals: successfulReferrals,
        thisMonthReferrals: thisMonthReferrals,
        topReferrer: topReferrerData,
        totalFriendPayout: settings?.totalFriendPayout || 0,
        totalReferrerPayout: settings?.totalReferrerPayout || 0,
      };
      return res.status(200).json({ success: true, stats });
    } catch (error) {
      console.error("Error getting referral stats:", error);
      return res.status(500).json({ success: false, message: "Server Error getting stats." });
    }
  }

  // --- UPDATED FUNCTION ---
  // Get the list of referrers for the table
  async getReferrersList(req, res) {
    try {
      const referrers = await CustomerModel.aggregate([
        // Stage 1: Match users who HAVE BEEN referred successfully (status: success)
        // We start here because only successful referrals contribute to the count
        {
          $match: {
            "referral.status": "success"
          }
        },
        // Stage 2: Group by the *referrer's ID* to count successful referrals
        {
          $group: {
            _id: "$referral.referredBy", // Group by the ID of the person who did the referring
            successfulReferralCount: { $sum: 1 } // Count how many successful referrals they have
          }
        },
         // Stage 3: Filter out any null referrer IDs (shouldn't happen with good data, but safe practice)
         {
           $match: {
             _id: { $ne: null }
           }
         },
        // Stage 4: Lookup the details *of the referrer* using the _id from the group stage
        {
          $lookup: {
            from: "customers", // <<<<<< IMPORTANT: Use your ACTUAL user collection name
            localField: "_id",       // ID from the group stage (referrer's ID)
            foreignField: "_id",    // Match the _id in the user collection
            as: "referrerInfo"
          }
        },
        // Stage 5: Deconstruct the referrerInfo array. If lookup fails, discard (shouldn't happen)
        {
          $unwind: "$referrerInfo"
        },
        // Stage 6: Project the final fields needed for the table
        {
          $project: {
            _id: "$referrerInfo._id", // Use the referrer's actual _id
            Fname: "$referrerInfo.Fname",
            Mobile: "$referrerInfo.Mobile",
            customReferralReward: "$referrerInfo.customReferralReward",
            referralEarnings: "$referrerInfo.referralEarnings",
            referralCount: "$successfulReferralCount" // Use the count from the group stage
          }
        },
        // Stage 7: Sort by the highest referral count
        {
          $sort: { referralCount: -1 }
        }
      ]);

      return res.status(200).json({ success: true, users: referrers });
    } catch (error) {
      console.error("Error getting referrers list:", error);
      return res.status(500).json({ success: false, message: "Server Error getting list." });
    }
  }
   async exportReferrers(req, res) {
    try {
      console.log("got till excel export")
      // 1. Get the same data as getReferrersList
      const referrers = await CustomerModel.aggregate([
        {
          $match: {
            "referral.referredBy": { $ne: null }
          }
        },
        {
          $group: {
            _id: "$referral.referredBy",
            successfulReferralCount: { $sum: { $cond: [{ $eq: ["$referral.status", "success"] }, 1, 0] } }
          }
        },
        { $match: { _id: { $ne: null } } }, // Filter out null IDs
        {
          $lookup: {
            from: "customers", // Use your actual user collection name
            localField: "_id",
            foreignField: "_id",
            as: "referrerInfo"
          }
        },
        { $unwind: "$referrerInfo" },
        {
          $project: {
            Fname: "$referrerInfo.Fname",
            Mobile: "$referrerInfo.Mobile",
            customReferralReward: "$referrerInfo.customReferralReward",
            referralEarnings: "$referrerInfo.referralEarnings",
            referralCount: "$successfulReferralCount"
          }
        },
        { $sort: { referralCount: -1 } }
      ]);

      // 2. Create Excel Workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Referrers");

      // 3. Define Columns
      worksheet.columns = [
        { header: "Referrer Name", key: "Fname", width: 30 },
        { header: "Phone Number", key: "Mobile", width: 20 },
        { header: "Successful Referrals", key: "referralCount", width: 25 },
        { header: "Total Earned (₹)", key: "referralEarnings", width: 20 },
        { header: "Custom Reward (₹)", key: "customReferralReward", width: 25 },
      ];
      
      // 4. Add Rows
      referrers.forEach(user => {
        worksheet.addRow({
          Fname: user.Fname || 'N/A',
          Mobile: user.Mobile,
          referralCount: user.referralCount,
          referralEarnings: user.referralEarnings || 0,
          customReferralReward: user.customReferralReward != null ? user.customReferralReward : 'Default'
        });
      });

      // 5. Set headers and send file
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="referrers_list_${moment().format("YYYY-MM-DD")}.xlsx"`
      );

      await workbook.xlsx.write(res);
      res.end();

    } catch (error) {
      console.error("Error exporting referrers:", error);
      res.status(500).json({ success: false, message: "Server Error exporting list." });
    }
  }
}

const referralSettingsController = new ReferralSettingsController();
module.exports = referralSettingsController;

