const express = require('express');
const router = express.Router();
const reportController = require('../../Controller/Admin/OfferReport');
router.post('/createreports', reportController.createReport);
router.get('/reports', reportController.getReports);
router.get('/reports/export', reportController.exportReports);

module.exports = router;