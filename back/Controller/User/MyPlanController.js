const MyPlanModel = require("../../Model/User/MyPlan");
const CartModel = require("../../Model/User/Cart");
const moment = require("moment");

class MyPlanController {
  async addToPlan(req, res) {
    try {
      const { userId, items, addressDetails } = req.body;

      if (!userId || !items || items.length === 0) {
        return res.status(400).json({ error: "Invalid data" });
      }

      // 2. Group Items by "Date|Session"
      const groupedSlots = items.reduce((acc, item) => {
        const key = `${item.deliveryDate}|${item.session}`;
        if (!acc[key]) {
          acc[key] = {
            deliveryDate: item.deliveryDate,
            session: item.session,
            // Hub ID comes from the item (assuming locationInfo is attached in frontend)
            hubId: item.locationInfo?.hubId || "UNKNOWN",
            products: [],
          };
        }
        acc[key].products.push(item);
        return acc;
      }, {});

      const now = new Date();
      const bulkOps = [];

      // 3. Process Each Slot
      for (const key in groupedSlots) {
        const group = groupedSlots[key];
        const deliveryDateObj = new Date(group.deliveryDate);

        // --- A. Deadline & Type Logic ---
        const isToday = moment(deliveryDateObj).isSame(now, "day");
        let deadline, type;

        if (isToday) {
          type = "Instant";
          deadline = moment(now).add(15, "minutes").toDate();
        } else {
          type = "Reserved"; // Changed from "Preorder" to match your Model enum
          // Lunch Cutoff: 11:00 AM, Dinner Cutoff: 6:00 PM
          if (group.session === "Lunch") {
            deadline = moment(deliveryDateObj)
              .set({ hour: 11, minute: 0, second: 0 })
              .toDate();
          } else {
            deadline = moment(deliveryDateObj)
              .set({ hour: 18, minute: 0, second: 0 })
              .toDate();
          }
        }

        let slotTotalAmount = 0;

        const formattedProducts = group.products.map((p) => {
          const qty = Number(p.Quantity);

          // Logic: If Reserved, use preOrderPrice (if available), else hubPrice
          // Note: The frontend should ideally send these specific prices.
          // For now, we map what we have.
          const finalPrice = Number(p.price); // This comes from frontend cart state
          const pTotal = finalPrice * qty;

          slotTotalAmount += pTotal;

          return {
            foodItemId: p.foodItemId,
            foodName: p.foodname,
            foodImage: p.image,
            foodCategory: p.foodcategory,

            // Mapping the 3 price types (Ensure frontend sends these if they exist)
            basePrice: p.basePrice || 0,
            hubPrice: p.actualPrice || 0, // usually actualPrice in cart is hubPrice
            preOrderPrice: p.offerPrice || 0, // assuming offerPrice maps to pre-order

            price: finalPrice,
            quantity: qty,
            totalPrice: pTotal,
          };
        });

        const planUpdate = {
          hubId: group.hubId,
          products: formattedProducts,
          slotTotalAmount: slotTotalAmount,
          status: "Pending Payment",
          orderType: type,
          paymentDeadline: deadline,
          delivarylocation: addressDetails?.addressline || "",
          addressType: addressDetails?.addressType || "",
          coordinates: {
            type: "Point",
            coordinates: addressDetails?.coordinates || [0, 0],
          },

          studentName: addressDetails?.studentName || "",
          studentClass: addressDetails?.studentClass || "",
          studentSection: addressDetails?.studentSection || "",
        };

        bulkOps.push({
          updateOne: {
            filter: {
              userId: userId,
              deliveryDate: group.deliveryDate,
              session: group.session,
            },
            update: { $set: planUpdate },
            upsert: true,
          },
        });
      }

      if (bulkOps.length > 0) {
        await MyPlanModel.bulkWrite(bulkOps);
      }

      await CartModel.deleteMany({ userId: userId });

      return res.status(200).json({
        success: true,
        message: "Items moved to My Plan successfully",
      });
    } catch (error) {
      console.error("Error adding to plan:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  /**
   * 2. Get User's Plan
   * Fetches plans and auto-updates status to "Skipped" if deadline passed.
   */
  async getMyPlan(req, res) {
    try {
      const { userId } = req.params;
      const now = new Date();

      // Fetch all plans sorted by date
      let plans = await MyPlanModel.find({ userId: userId }).sort({
        deliveryDate: 1,
        session: 1,
      });

      // --- Skip Logic ---
      const updates = [];
      plans = plans.map((plan) => {
        const p = plan.toObject();

        // If Pending AND Deadline Passed -> Mark Skipped
        if (
          p.status === "Pending Payment" &&
          new Date(p.paymentDeadline) < now
        ) {
          p.status = "Skipped";
          updates.push({
            updateOne: {
              filter: { _id: p._id },
              update: { $set: { status: "Skipped" } },
            },
          });
        }
        return p;
      });

      // Execute status updates in background
      if (updates.length > 0) {
        await MyPlanModel.bulkWrite(updates);
      }

      return res.status(200).json({ success: true, data: plans });
    } catch (error) {
      console.error("Error fetching plan:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  /**
   * 3. Update Quantity of a specific product in a Plan
   * Used for editing quantity directly in the "My Plan" page.
   */
  async updatePlanProduct(req, res) {
    try {
      const { planId, foodItemId, quantity } = req.body;

      const plan = await MyPlanModel.findById(planId);
      if (!plan) return res.status(404).json({ error: "Plan not found" });

      // Check if editing is allowed (Cutoff time)
      if (new Date() > new Date(plan.paymentDeadline)) {
        return res
          .status(400)
          .json({ error: "Cutoff time passed. Cannot edit." });
      }

      // Find product index
      const prodIndex = plan.products.findIndex(
        (p) => p.foodItemId.toString() === foodItemId
      );

      if (prodIndex === -1) {
        return res.status(404).json({ error: "Product not found in plan" });
      }

      if (quantity <= 0) {
        // Remove item if quantity 0
        plan.products.splice(prodIndex, 1);
      } else {
        // Update quantity and price
        plan.products[prodIndex].quantity = quantity;
        plan.products[prodIndex].totalPrice =
          plan.products[prodIndex].price * quantity;
      }

      // Recalculate Slot Total
      plan.slotTotalAmount = plan.products.reduce(
        (sum, item) => sum + item.totalPrice,
        0
      );

      // If plan is empty, delete the plan document entirely
      if (plan.products.length === 0) {
        await MyPlanModel.findByIdAndDelete(planId);
        return res
          .status(200)
          .json({ success: true, message: "Plan removed as it is empty" });
      }

      await plan.save();
      return res.status(200).json({ success: true, data: plan });
    } catch (error) {
      console.error("Error updating plan item:", error);
      return res.status(500).json({ error: "Server Error" });
    }
  }

  /**
   * 4. Get Specific Plans for Checkout
   * Used by Checkout.jsx to fetch details for selected Plan IDs
   */
  async getPlanDetailsForCheckout(req, res) {
    try {
      const { planIds } = req.body; // Expected array of strings

      if (!planIds || !Array.isArray(planIds)) {
        return res.status(400).json({ error: "Invalid plan IDs" });
      }

      const plans = await MyPlanModel.find({
        _id: { $in: planIds },
        status: "Pending Payment", // Security: Only allow paying for pending items
      });

      return res.status(200).json({ success: true, data: plans });
    } catch (error) {
      console.error("Checkout fetch error:", error);
      return res.status(500).json({ error: "Server Error" });
    }
  }
  async skipOrCancelPlan(req, res) {
    try {
      const { planId, userId } = req.body;

      const plan = await MyPlanModel.findOne({ _id: planId, userId });
      if (!plan) {
        return res.status(404).json({ error: "Plan not found" });
      }

      const now = new Date();

      // CASE 1: SKIP (Unpaid)
      if (plan.status === "Pending Payment") {
        plan.status = "Skipped";
        await plan.save();
        return res.status(200).json({ success: true, message: "Plan skipped successfully" });
      }

      // CASE 2: CANCEL (Paid/Confirmed)
      if (plan.status === "Confirmed") {
        // 1. Check Deadline
        if (now > new Date(plan.paymentDeadline)) {
            return res.status(400).json({ error: "Cutoff time passed. Cannot cancel this order." });
        }

        // 2. Process Refund to Wallet
        if (plan.slotTotalAmount > 0) {
            await WalletModel.findOneAndUpdate(
                { userId: userId },
                {
                    $inc: { balance: plan.slotTotalAmount },
                    $push: {
                        transactions: {
                            amount: plan.slotTotalAmount,
                            type: "credit",
                            description: `Refund for cancelled plan (${new Date(plan.deliveryDate).toLocaleDateString()} - ${plan.session})`,
                            date: new Date()
                        }
                    }
                },
                { upsert: true }
            );
        }

        // 3. Update Linked Order Status (if exists)
        if (plan.orderId) {
            await AddorderModel.findByIdAndUpdate(plan.orderId, { status: "Cancelled" });
        }

        // 4. Update Plan Status
        plan.status = "Cancelled";
        await plan.save();

        return res.status(200).json({ success: true, message: "Order cancelled and amount refunded to wallet." });
      }

      return res.status(400).json({ error: "Cannot cancel plan in current status" });

    } catch (error) {
      console.error("Error skipping/cancelling plan:", error);
      return res.status(500).json({ error: "Server Error" });
    }
  }

  /**
   * 6. Change Address for a Plan
   */
  async updatePlanAddress(req, res) {
      try {
          const { planId, addressDetails } = req.body; // addressDetails contains the new location info

          const plan = await MyPlanModel.findById(planId);
          if (!plan) return res.status(404).json({ error: "Plan not found" });

          // If order is confirmed, strict deadline check applies
          if (plan.status === "Confirmed" && new Date() > new Date(plan.paymentDeadline)) {
              return res.status(400).json({ error: "Cutoff time passed. Cannot change address." });
          }

          // Update Fields
          plan.delivarylocation = addressDetails.addressline || plan.delivarylocation;
          plan.addressType = addressDetails.addressType || plan.addressType;
          
          if (addressDetails.coordinates) {
             plan.coordinates = {
                 type: "Point",
                 coordinates: addressDetails.coordinates
             };
          }

          // Update Student Info if present
          if (addressDetails.studentName) plan.studentName = addressDetails.studentName;
          if (addressDetails.studentClass) plan.studentClass = addressDetails.studentClass;
          if (addressDetails.studentSection) plan.studentSection = addressDetails.studentSection;

          // Note: If the new address belongs to a different HUB, logic gets complex (Inventory check).
          // For now, we assume address changes are within the same service area/Hub.
          
          // If there is a linked Order, update that too
          if (plan.orderId) {
              await AddorderModel.findByIdAndUpdate(plan.orderId, {
                  delivarylocation: addressDetails.addressline,
                  // Update other address fields in AddOrder if they exist there
              });
          }

          await plan.save();
          return res.status(200).json({ success: true, message: "Address updated successfully", data: plan });

      } catch (error) {
          console.error("Error updating address:", error);
          return res.status(500).json({ error: "Server Error" });
      }
  }
}

module.exports = new MyPlanController();
