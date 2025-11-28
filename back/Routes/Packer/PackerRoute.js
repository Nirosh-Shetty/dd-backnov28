const express=require("express");
const router=express.Router();

const PackerController=require("../../Controller/Packer/PackerController");

router.post("/createpacker",PackerController.createpacker);
router.post("/sendPackerOtp",PackerController.sendPackerOtp);
router.post("/verificationPacker",PackerController.verificationPacker);
router.put("/updatePacker",PackerController.updatePacker);
router.get("/getAllPacker",PackerController.getAllPacker);
router.delete("/deletPacker/:packerId",PackerController.deletPacker)

module.exports=router;