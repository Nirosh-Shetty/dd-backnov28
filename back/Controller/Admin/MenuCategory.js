const MenuCategoryModel = require("../../Model/Admin/MenuCategory");

// ✅ Create Category
exports.createMenuCategory = async (req, res) => {
  try {
    const { menuCategory } = req.body;

    if (!menuCategory) {
      return res.status(400).json({ success: false, message: "Menu Category name is required" });
    }

    const existingCategory = await MenuCategoryModel.findOne({ menuCategory });
    if (existingCategory) {
      return res.status(400).json({ success: false, message: "Menu Category already exists" });
    }

    const category = new MenuCategoryModel({ menuCategory });
    await category.save();

    res.status(201).json({ success: true, message: "Menu Category created successfully", category });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// ✅ Get All Categories
exports.getMenuCategories = async (req, res) => {
  try {
    const categories = await MenuCategoryModel.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// ✅ Get Single Category
exports.getMenuCategoryById = async (req, res) => {
  try {
    const category = await MenuCategoryModel.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Menu Category not found" });
    }
    res.status(200).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// ✅ Update Category
exports.updateMenuCategory = async (req, res) => {
  try {
    const { CategoryName } = req.body;

    const category = await MenuCategoryModel.findByIdAndUpdate(
      req.params.id,
      { CategoryName },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ success: false, message: "Menu Category not found" });
    }

    res.status(200).json({ success: true, message: "Menu Category updated successfully", category });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// ✅ Delete Category
exports.deleteMenuCategory = async (req, res) => {
  try {
    const category = await MenuCategoryModel.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.status(200).json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};
