const bannerController = require("../../Controller/Admin/HomeBanner");
const express = require("express");
const router = express.Router();
const multer = require("multer");
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "Public/HomeBanner");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname);
  },
});
const upload = multer();
router.post("/banners", upload.any(), bannerController.banner);
router.get("/banners", upload.any(), bannerController.getbanner);
router.delete("/Deletebanner/:Id", bannerController.Deletebanner);
router.put("/editbanner/:id", upload.any(),bannerController.editbanner);
router.get('/banners/images', bannerController.getBannerImages);
module.exports = router;
