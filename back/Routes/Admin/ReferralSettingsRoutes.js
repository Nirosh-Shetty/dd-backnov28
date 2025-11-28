const express = require("express");
const router = express.Router();
const referralSettingsController = require("../../Controller/Admin/ReferralSettings");

router.get("/referrers-list", referralSettingsController.getReferrersList);
router.get("/", referralSettingsController.getSettings);
router.post("/", referralSettingsController.updateSettings);
router.get("/stats", referralSettingsController.getReferralStats);
router.post("/user/:userId/custom-reward", referralSettingsController.setCustomReferralReward);
router.get("/export-referrers", referralSettingsController.exportReferrers);

module.exports = router;