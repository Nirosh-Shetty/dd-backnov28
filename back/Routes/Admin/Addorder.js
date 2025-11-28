const express = require("express");
const router = express.Router();
const CartController = require("../../Controller/Admin/Addorder");

router.post("/addfoodorder", CartController.addfoodorder);
router.get("/getfoodorder/:id", CartController.getfoodorder);
router.get("/getfoodorderId/:id", CartController.getfoodorderId);
router.get("/getallordersbyUserId/:id", CartController.getallordersbyUserId);
router.get("/getallorders", CartController.getallorders);
router.get("/getallordersfilterold", CartController.getallordersfilterOld);
router.get("/getallordersfilter", CartController.getallordersfilter);
router.put("/updateOrderStatus/:id", CartController.updateOrderStatus);
router.delete("/deletefoodorder/:id", CartController.deletefoodorder);
router.get("/getorderNotRatedByUserID/:customerId",
  CartController.getorderNotRatedByUserID);
// router.put("/makeRateOfOrder",CartController.makeRateOfOrder);
router.put("/submitOrderRating", CartController.submitOrderRating);
router.get(
  "/getAllOrdersByCompanyId/:companyId",
  CartController.getAllOrderByCompany
);
router.get("/getPackerOrders", CartController.getPackerOrders);
router.get('/getPackerOrders2',CartController.getPackerOrders2);

router.put("/updatePackerOrder", CartController.updatePackerOrder);
router.get("/getDrivers", CartController.getDrivers);
router.put(
  "/updateMultipleOrderStatus",
  CartController.updateMultipleOrderStatus
);
router.get("/exportExcelOrder", CartController.exportExcelOrder);
router.get("/getAllOrderCount", CartController.getAllOrderCount);
router.get("/getAllAppartmentOrder", CartController.getAllAppartmentOrder);

router.get("/getallorderssales", CartController.getallorderssales);
router.get("/getSalesReport", CartController.getSalesReport);

module.exports = router;
