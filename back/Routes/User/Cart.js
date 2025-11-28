
const express = require("express");
const router = express.Router();
const CartController = require("../../Controller/User/Cart")


router.post("/addCart", CartController.addCart)
router.get("/getCartbyuser/:userId", CartController.getCartbyuser)
router.get("/getAllcartaddon", CartController.getAllcartaddon);
router.get("/getCartCampleted/:userId", CartController.getCartCampleted);
router.get("/getCartBycompany/:companId", CartController.getCartBycompany);
module.exports = router;