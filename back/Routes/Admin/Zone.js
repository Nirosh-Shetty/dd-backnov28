const express = require("express");
const router = express.Router();
const zoneController = require("../../Controller/Admin/ZoneController");

// Admin routes for zone management
router.post("/saveZone", zoneController.saveZone);
router.get("/getZones", zoneController.getZones);
router.get("/getZone/:id", zoneController.getZoneById);
router.put("/updateZone/:id", zoneController.updateZone);
router.delete("/deleteZone/:id", zoneController.deleteZone);

// Rider route to get assigned orders sorted by distance
router.get("/rider/:riderId/orders", zoneController.getRiderOrders);

module.exports = router;

