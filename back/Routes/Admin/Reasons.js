
const express = require('express');
const router = express.Router();
const delayReasonController = require('../../Controller/Admin/Reasons');

router.post('/adddelayreason', delayReasonController.addDelayReason);
router.get('/getdelayreasons', delayReasonController.getDelayReasons);
router.put('/updatedelayreason/:id', delayReasonController.updateDelayReason);
router.delete('/deletedelayreason/:id', delayReasonController.deleteDelayReason);


module.exports = router;
