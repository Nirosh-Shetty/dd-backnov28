const express = require("express");
const multer = require("multer");
const {
  setClosure,
  getClosureDetails,

  clearClosure,

} = require("../../Controller/Admin/Resturant");

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
router.post("/setClosure", upload.any(), setClosure); // Create with image upload
router.get("/getClosureDetails", getClosureDetails); // Get all coupons

router.delete("/clearClosure", clearClosure); // Delete by ID


module.exports = router;
