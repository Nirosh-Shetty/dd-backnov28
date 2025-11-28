const GstController = require("../../Controller/Admin/Gst");
const express = require("express");
const router = express.Router();

router.post("/addgst",  GstController.addGst);
router.get("/getgst", GstController.getGst);
router.delete("/deletegst/:Id", GstController.DeletedeGst);
router.put("/editdelivarycharge/:id",GstController.editGst);
module.exports = router;
