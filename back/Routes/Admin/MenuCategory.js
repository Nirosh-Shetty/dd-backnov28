const express = require("express");
const router = express.Router();
const categoryController = require("./../../Controller/Admin/MenuCategory");

router.post("/addmenucategory", categoryController.createMenuCategory);
router.get("/getmenucategory", categoryController.getMenuCategories);
router.get("/getmenucategory/:id", categoryController.getMenuCategoryById);
router.put("/updatemenucategory/:id", categoryController.updateMenuCategory);
router.delete("/deletemenucategory/:id", categoryController.deleteMenuCategory);

module.exports = router;
