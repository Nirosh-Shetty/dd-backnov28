const express = require('express');
const router = express.Router();
const FoodTagController = require('../../Controller/Admin/FoodTagController');

router.post('/food-tags', FoodTagController.createTag);
router.get('/food-tags', FoodTagController.listTags);
router.put('/food-tags/:id', FoodTagController.updateTag);
router.delete('/food-tags/:id', FoodTagController.deleteTag);

module.exports = router;
