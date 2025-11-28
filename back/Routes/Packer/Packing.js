const express = require("express");
const { updatePacked, updatePackedBulk, getAllPacking ,getPackingByHub, updateIndividualPacked, getIndividualPackingItems, getTodayPacking, getTodayPackingGrouped, getTodayPackingStats } = require("../../Controller/Packer/Packing");

const router = express.Router();

router.put("/update-packed", updatePacked);
router.put("/update-packed-bulk", updatePackedBulk); // bulk update
router.get("/all", getAllPacking); // bulk update
router.get('/hub/:hub', getPackingByHub); // /api/packer/packing/hub/HUB001
router.put('/update-individual-packed', updateIndividualPacked);
router.get('/individual-items', getIndividualPackingItems);



// Today's packing routes
router.get('/today', getTodayPacking);
router.get('/today/grouped', getTodayPackingGrouped);
router.get('/today/stats', getTodayPackingStats);
router.get('/today/individual', getIndividualPackingItems);

module.exports = router;
