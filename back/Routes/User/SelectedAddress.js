
const express = require("express");
const router = express.Router();
const SelectedAddressController = require("../../Controller/User/SelectedAdress.js")


router.post("/addressadd", SelectedAddressController.addressadd)
router.get("/getSelectedAddressByUserID/:userId", SelectedAddressController.getSelectedAddressByUserID)
router.delete("/DeleteSelectedAddress/:id", SelectedAddressController.DeleteSelectedAddress);
router.get("/getSelectedAddressByUserIDAddressID/:userId/:addressid", SelectedAddressController.getSelectedAddressByUserIDAddressID)
router.get("/getSelectedAddressByUserIDAddType/:userId/:addtype", SelectedAddressController.getSelectedAddressByUserIDAddType)
module.exports = router;