const FoodTagsModel = require("../../Model/Admin/foodTags");

class FoodTagController {
    async createTag(req, res) {
        try {
            const { tagName, description, tagColor } = req.body;
            if (!tagName) return res.status(400).json({ error: "tagName is required" });

            const existing = await FoodTagsModel.findOne({ tagName });
            if (existing) return res.status(400).json({ error: "Tag already exists" });

            const tag = new FoodTagsModel({ tagName, description, tagColor });
            await tag.save();
            return res.status(201).json({ success: true, data: tag });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }

    async listTags(req, res) {
        try {
            const tags = await FoodTagsModel.find({}).sort({ tagName: 1 });
            return res.status(200).json({ success: true, data: tags });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }

    async updateTag(req, res) {
        try {
            const { id } = req.params;
            const { tagName, description, tagColor } = req.body;
            const updated = await FoodTagsModel.findByIdAndUpdate(
                id,
                { $set: { tagName, description, tagColor } },
                { new: true }
            );
            if (!updated) return res.status(404).json({ error: "Tag not found" });
            return res.status(200).json({ success: true, data: updated });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }

    async deleteTag(req, res) {
        try {
            const { id } = req.params;
            const deleted = await FoodTagsModel.findByIdAndDelete(id);
            if (!deleted) return res.status(404).json({ error: "Tag not found" });
            return res.status(200).json({ success: true, message: "Tag deleted" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }
}

module.exports = new FoodTagController();
