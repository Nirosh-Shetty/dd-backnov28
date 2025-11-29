const express = require("express");
const router = express.Router();
const OrderController = require("../../Controller/Admin/Addorder");

router.post("/addfoodorder", OrderController.addfoodorder);
router.get("/getfoodorder/:id", OrderController.getfoodorder);
router.get("/getfoodorderId/:id", OrderController.getfoodorderId);
router.get("/getallordersbyUserId/:id", OrderController.getallordersbyUserId);
router.get("/getallorders", OrderController.getallorders);
router.get("/getallordersfilterold", OrderController.getallordersfilterOld);
router.get("/getallordersfilter", OrderController.getallordersfilter);
router.put("/updateOrderStatus/:id", OrderController.updateOrderStatus);
router.delete("/deletefoodorder/:id", OrderController.deletefoodorder);
router.get("/getorderNotRatedByUserID/:customerId",
  OrderController.getorderNotRatedByUserID);
// router.put("/makeRateOfOrder",OrderController.makeRateOfOrder);
router.put("/submitOrderRating", OrderController.submitOrderRating);
router.get(
  "/getAllOrdersByCompanyId/:companyId",
  OrderController.getAllOrderByCompany
);
router.get("/getPackerOrders", OrderController.getPackerOrders);
router.get('/getPackerOrders2',OrderController.getPackerOrders2);

router.put("/updatePackerOrder", OrderController.updatePackerOrder);
router.get("/getDrivers", OrderController.getDrivers);
router.put(
  "/updateMultipleOrderStatus",
  OrderController.updateMultipleOrderStatus
);
router.get("/exportExcelOrder", OrderController.exportExcelOrder);
router.get("/getAllOrderCount", OrderController.getAllOrderCount);
router.get("/getAllAppartmentOrder", OrderController.getAllAppartmentOrder);

router.get("/getallorderssales", OrderController.getallorderssales);
router.get("/getSalesReport", OrderController.getSalesReport);
router.get("/getOrderByOrderId/:orderId", OrderController.getOrderById);

module.exports = router;
