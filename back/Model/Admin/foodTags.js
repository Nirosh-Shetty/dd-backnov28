const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const foodTagsSchema = new Schema(
    {
        tagName: {
            type: String,
            required: true,
            unique: true,
        },
        description: {
            type: String,
        },
        tagColor: {
            type: String,
        },
    },
    { timestamps: true }
);

const FoodTagsModel = mongoose.model("FoodTags", foodTagsSchema);
module.exports = FoodTagsModel;