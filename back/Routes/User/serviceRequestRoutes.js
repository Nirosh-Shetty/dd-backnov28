const express = require('express');
const router = express.Router();
const {
  createServiceRequest,
  getServiceRequests,
  getServiceRequestsByCustomer,
  updateServiceRequest,
  getServiceRequestStats,
  getServiceRequestLocations
} = require('.././../Controller/User/serviceRequestController');



// Public routes (if any) would go here

// Protected routes
router.post('/', createServiceRequest);
router.get('/customer/:customerId',  getServiceRequestsByCustomer);

// Admin only routes
router.get('/',  getServiceRequests);
router.put('/:requestId',  updateServiceRequest);
router.get('/stats',  getServiceRequestStats);
router.get('/map-locations', getServiceRequestLocations)

module.exports = router;