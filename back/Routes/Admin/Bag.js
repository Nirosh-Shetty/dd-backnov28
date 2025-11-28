
const express = require('express');
const router = express.Router();
const bagController = require('../../Controller/Admin/Bag');

router.post('/addbag', bagController.addBag);
router.get('/getbags', bagController.getBags);
router.put('/updatebag/:id', bagController.updateBag);
router.delete('/deletebag/:id', bagController.deleteBag);

module.exports = router;
