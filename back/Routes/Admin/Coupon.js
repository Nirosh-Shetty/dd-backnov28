const express = require("express");
const multer = require("multer");
const {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  applyCoupon
} = require("../../Controller/Admin/Coupon");

const router = express.Router();

// Multer configuration for image upload
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "Public/Coupon");
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

const upload = multer();

// Routes
router.post("/coupons", upload.single("image"), createCoupon); // Create with image upload
router.get("/coupons", getAllCoupons); // Get all coupons
router.get("/coupons/:id", getCouponById); // Get by ID
router.put("/coupons/:id", upload.single("image"), updateCoupon); // Update with image upload
router.delete("/coupons/:id", deleteCoupon); // Delete by ID
router.post("/applyCoupon", applyCoupon);

module.exports = router;
