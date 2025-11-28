const express = require('express');
const router = express.Router();
const HubController = require('../../Controller/Packer/HubList');

router.post('/hubs', HubController.createHub);
router.put('/hubs/:hubId', HubController.updateHub);
router.delete('/hubs/:hubId', HubController.deleteHub);
router.get('/hubs', HubController.getAllHubs);
router.post('/validate-location', HubController.validateLocation);

module.exports = router;