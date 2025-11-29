const express = require("express");
const router = express.Router();
const MyPlanController = require("../../Controller/User/MyPlanController");

router.post("/add-to-plan", MyPlanController.addToPlan);
router.get("/get-plan/:userId", MyPlanController.getMyPlan);
router.post("/skip-cancel", MyPlanController.skipOrCancelPlan);
router.post("/update-address", MyPlanController.updatePlanAddress);
router.post("/update-product", MyPlanController.updatePlanProduct);
router.post("/create-from-plan", MyPlanController.createOrderFromSinglePlan);

module.exports = router;