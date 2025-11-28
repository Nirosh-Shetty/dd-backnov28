const express = require("express");
const router = express.Router();
const Restocontroller = require("../../Controller/Admin/Addproduct");
const multer = require("multer");

// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "Public/Products");
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname);
//   },
// });

const upload = multer();
router.post("/addFoodItem",upload.any(), Restocontroller.addFoodItem);
router.put("/updateFoodItem",upload.any(), Restocontroller.updateFoodItem);
router.put("/updatefoodstocks", Restocontroller.updateFoodStocks);
router.get("/getFoodItems", Restocontroller.getFoodItems);
router.get("/getFoodItemsUnBlocks", Restocontroller.getFoodItemsUnBlocks);
router.delete("/deleteFoodItem/:id", Restocontroller.deleteFoodItem);

router.delete("/deleteFoodItemImage", Restocontroller.deleteFoodItemImage);
router.put("/updateFoodItemImage",upload.any(), Restocontroller.updateFoodItemImage);
router.put("/addFoodItemnewImage",upload.any(), Restocontroller.addFoodItemnewImage);

router.put("/toggleFoodItemStatus/:id", Restocontroller.toggleFoodItemStatus);
router.put("/toggleFoodItemApproval/:id", Restocontroller.toggleFoodItemApproval);
router.put("/makeSoldout",Restocontroller.makeSoldout);


router.post('/addProductHubWise/:productId',Restocontroller.addProductHubWise)
router.put("/updatepruducthub/:productId/:hubId", Restocontroller.updatepruducthub);
router.delete("/deleteHubPruduct/:productId/:hubId", Restocontroller.deleteHubPruduct);
router.put("/makeSoldout",Restocontroller.makeSoldout);

module.exports = router;