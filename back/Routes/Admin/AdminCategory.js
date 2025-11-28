const express = require("express");
const router = express.Router();
const categoryController = require("./../../Controller/Admin/AdminCategory");

router.post("/addcategory", categoryController.createCategory);
router.get("/getcategory", categoryController.getCategories);
router.get("/getcategory/:id", categoryController.getCategoryById);
router.put("/updatecategory/:id", categoryController.updateCategory);
router.delete("/deletecategory/:id", categoryController.deleteCategory);

module.exports = router;
