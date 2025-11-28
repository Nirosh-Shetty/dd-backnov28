const mongoose = require("mongoose");

const menuCategorySchema = new mongoose.Schema(
  {
    menuCategory: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
  },
  { timestamps: true }
);

const CategoryModel = mongoose.model("MenuCategory", menuCategorySchema);
module.exports = CategoryModel;
