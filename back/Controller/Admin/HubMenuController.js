const HubMenuModel = require("../../Model/Admin/HubMenu"); 

class HubMenuController {
  async createOrUpdateMenu(req, res) {
    try {
      const { menuDate, session, productId, basePrice, hubData } = req.body;
      if (!menuDate || !session || !productId || !hubData || hubData.length === 0) {
        return res.status(400).json({ error: "Missing required fields." });
      }
      // console.log( "hubData", hubData);

      const operations = hubData.map((hubItem) => ({
        updateOne: {
          filter: {
            productId: productId,
            hubId: hubItem.hubId,
            menuDate: new Date(menuDate),
            session: session,
          },
          update: {
            $set: {
              basePrice: basePrice,
              hubPrice: hubItem.hubPrice,
              preOrderPrice: hubItem.preOrderPrice,
              totalQuantity: hubItem.totalQuantity,
              remainingQuantity: hubItem.totalQuantity, 
              hubPriority: hubItem.hubPriority,
              isActive: hubItem.isActive,
            },
          },
          upsert: true,
        },
      }));

      const result = await HubMenuModel.bulkWrite(operations);

      return res.status(200).json({
        success: "Menu updated successfully",
        result: result,
      });
    } catch (error) {
      console.error("Error in createOrUpdateMenu:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
  async getHubMenuForAdmin(req, res) {
    try {
      const { hubId, menuDate, session } = req.query;

      if (!hubId || !menuDate || !session) {
        return res
          .status(400)
          .json({ error: "Hub, Date, and Session are required." });
      }

      // Find all menu items that match the admin's filter
      const menuItems = await HubMenuModel.find({
        hubId: hubId,
        menuDate: new Date(menuDate),
        session: session,
      })
      .populate("productId", "foodname foodcategory Foodgallery basePrice menuCategory aggregatedPrice") // Get product details
      .populate("hubId", "hubName") // Get hub name
      .sort({ hubPriority: 1 }); // Sort by priority
      //  console.log("menuItems", menuItems);
      return res.status(200).json({ menu: menuItems });

    } catch (error){
      console.error("Error fetching hub menu for admin:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
  async updateHubMenuItem(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body; // { hubPrice, totalQuantity, remainingQuantity, hubPriority, isActive }

      // Build the $set object dynamically from what's provided
      const fieldsToUpdate = {};
      if (updateData.hubPrice !== undefined) fieldsToUpdate.hubPrice = Number(updateData.hubPrice);
      if (updateData.totalQuantity !== undefined) fieldsToUpdate.totalQuantity = Number(updateData.totalQuantity);
      if (updateData.remainingQuantity !== undefined) fieldsToUpdate.remainingQuantity = Number(updateData.remainingQuantity);
      if (updateData.hubPriority !== undefined) fieldsToUpdate.hubPriority = Number(updateData.hubPriority);
      if (updateData.isActive !== undefined) fieldsToUpdate.isActive = Boolean(updateData.isActive);

      if (Object.keys(fieldsToUpdate).length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: "No valid fields to update." 
        });
      }

      const updatedItem = await HubMenuModel.findByIdAndUpdate(
        id,
        { $set: fieldsToUpdate },
        { new: true } // Return the updated document
      );

      if (!updatedItem) {
        return res.status(404).json({ 
          success: false, 
          message: "Menu item not found." 
        });
      }

      return res.status(200).json({
        success: true,
        message: "Menu item updated successfully.",
        data: updatedItem,
      });

    } catch (error) {
      console.error("Error updating hub menu item:", error);
      return res.status(500).json({ 
        success: false, 
        message: "Internal server error", 
        error: error.message 
      });
    }
  }

  /**
   * CONTROLLER for:
   * - Delete Button
   */
  async deleteHubMenuItem(req, res) {
    try {
      const { id } = req.params;

      const deletedItem = await HubMenuModel.findByIdAndDelete(id);

      if (!deletedItem) {
        return res.status(404).json({ 
          success: false, 
          message: "Menu item not found." 
        });
      }

      return res.status(200).json({
        success: true,
        message: "Menu item deleted successfully.",
      });

    } catch (error) {
      console.error("Error deleting hub menu item:", error);
      return res.status(500).json({ 
        success: false, 
        message: "Internal server error", 
        error: error.message 
      });
    }
  }

  /**
   * CONTROLLER for:
   * - Mark All Sold Out Button
   */
  async bulkMarkSoldOut(req, res) {
    try {
      const { hubId, menuDate, session } = req.body;

      if (!hubId || !menuDate || !session) {
        return res.status(400).json({ 
          success: false, 
          message: "Hub, Date, and Session are required for bulk update." 
        });
      }

      const updateResult = await HubMenuModel.updateMany(
        {
          hubId: hubId,
          menuDate: new Date(menuDate),
          session: session,
        },
        {
          $set: { remainingQuantity: 0 },
        }
      );

      return res.status(200).json({
        success: true,
        message: `Updated ${updateResult.modifiedCount} items to sold out.`,
        data: updateResult,
      });

    } catch (error) {
      console.error("Error in bulk sold out:", error);
      return res.status(500).json({ 
        success: false, 
        message: "Internal server error", 
        error: error.message 
      });
    }
  }
  async bulkPriceUpdate(req, res) {
    try {
      const { hubId, menuDate, session, percentage, operation } = req.body;

      if (!hubId || !menuDate || !session || !percentage || !operation) {
        return res.status(400).json({ 
          success: false, 
          message: "Hub, Date, Session, Percentage, and Operation are required." 
        });
      }

      // 1. Find all items matching the filter
      const itemsToUpdate = await HubMenuModel.find({
        hubId: hubId,
        menuDate: new Date(menuDate),
        session: session,
      });

      if (itemsToUpdate.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: "No menu items found for this filter." 
        });
      }

      const bulkOps = itemsToUpdate.map(item => {
        // 2. Calculate the new price for each item
        const currentPrice = item.hubPrice;
        const percentValue = Number(percentage) / 100;
        const newPrice =
          operation === "increase"
            ? Math.round(currentPrice * (1 + percentValue))
            : Math.round(currentPrice * (1 - percentValue));

        // 3. Return an update operation for the bulkWrite
        return {
          updateOne: {
            filter: { _id: item._id },
            update: { $set: { hubPrice: newPrice } },
          },
        };
      });

      // 4. Execute all updates in a single batch
      const updateResult = await HubMenuModel.bulkWrite(bulkOps);

      return res.status(200).json({
        success: true,
        message: `Updated prices for ${updateResult.modifiedCount} items.`,
        data: updateResult,
      });

    } catch (error) {
      console.error("Error in bulk price update:", error);
      return res.status(500).json({ 
        success: false, 
        message: "Internal server error", 
        error: error.message 
      });
    }
  }

  // Bulk create / upsert many items (items: [{ productId, menuDate, session, basePrice, hubData:[{hubId,hubPrice,preOrderPrice,totalQuantity,hubPriority,isActive}] }])
  async bulkCreate(req, res) {
    try {
      const { items } = req.body;
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, message: "items array required" });
      }

      const operations = [];
      items.forEach((it) => {
        const menuDate = new Date(it.menuDate);
        const basePrice = Number(it.basePrice || 0);
        (it.hubData || []).forEach((h) => {
          operations.push({
            updateOne: {
              filter: {
                productId: it.productId,
                hubId: h.hubId,
                menuDate,
                session: it.session,
              },
              update: {
                $set: {
                  basePrice,
                  hubPrice: Number(h.hubPrice || 0),
                  preOrderPrice: Number(h.preOrderPrice || 0),
                  totalQuantity: Number(h.totalQuantity || 0),
                  remainingQuantity: Number(h.totalQuantity || 0),
                  hubPriority: Number(h.hubPriority || 0),
                  isActive: h.isActive !== undefined ? Boolean(h.isActive) : true,
                },
              },
              upsert: true,
            },
          });
        });
      });

      if (operations.length === 0) {
        return res.status(400).json({ success: false, message: "No hubData provided" });
      }

      const bulkResult = await HubMenuModel.bulkWrite(operations);

      // Optionally return the saved docs for client-side mapping
      // Build query to fetch relevant docs (unique combos)
      const queries = [];
      items.forEach((it) => {
        (it.hubData || []).forEach((h) => {
          queries.push({
            productId: it.productId,
            hubId: h.hubId,
            menuDate: new Date(it.menuDate),
            session: it.session,
          });
        });
      });
      const orQuery = queries.length > 0 ? { $or: queries } : {};
      const savedDocs = orQuery.$or ? await HubMenuModel.find(orQuery).lean() : [];

      return res.status(200).json({ success: true, data: savedDocs, result: bulkResult });
    } catch (error) {
      console.error("Error in bulkCreate:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
}

module.exports = new HubMenuController();