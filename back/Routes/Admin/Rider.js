const express = require("express");
const router = express.Router();
const riderController = require("../../Controller/Admin/RiderController");

router.post("/riders", riderController.createRider);
router.get("/riders", riderController.getRiders);
router.put("/riders/:id", riderController.updateRider);
router.delete("/riders/:id", riderController.deleteRider);
router.post("/riders/send-otp", riderController.sendRiderOtp);
router.post("/riders/verify-otp", riderController.verifyRiderOtp);

module.exports = router;

