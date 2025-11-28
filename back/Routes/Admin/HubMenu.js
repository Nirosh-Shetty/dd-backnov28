const express = require("express");
const router = express.Router();
const HubMenuController = require("../../Controller/Admin/HubMenuController");

router.post("/create", HubMenuController.createOrUpdateMenu);
router.post("/bulk", HubMenuController.bulkCreate);

router.get("/get-menu", HubMenuController.getHubMenuForAdmin);
router.put("/update/:id", HubMenuController.updateHubMenuItem);
router.delete("/delete/:id", HubMenuController.deleteHubMenuItem);
router.post("/bulk-sold-out", HubMenuController.bulkMarkSoldOut);
router.post("/bulk-price-update", HubMenuController.bulkPriceUpdate);
module.exports = router;