const express = require('express');
const router = express.Router();
const offerController = require('../../Controller/Admin/OfferController');

router.post('/offers', offerController.createOffer);
router.get('/offers', offerController.getOffers);
router.delete('/offers/:id', offerController.deleteOffer);
router.put('/offers/:id', offerController.updateOffer);
router.put("/getuseroffer",offerController.getUserOffers);

module.exports = router;