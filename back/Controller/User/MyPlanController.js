const MyPlanModel = require("../../Model/User/MyPlan");
const CartModel = require("../../Model/User/Cart");
const OrderModel = require("../../Model/Admin/Addorder");
const WalletModel = require("../../Model/User/Wallet");
const CouponModel = require("../../Model/Admin/Coupon");
const moment = require("moment");

class MyPlanController {
  async addToPlan(req, res) {
    try {
      const { userId, mobile, username, items, addressDetails } = req.body;

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
            hubId: addressDetails?.hubId || "UNKNOWN",
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

          // const finalPrice = Number(p.price); 
          const finalPrice = type === "Reserved"
            ? Number(p.preOrderPrice || p.hubPrice || p.basePrice || 0)
            : Number(p.hubPrice || p.basePrice || 0);
          const pTotal = finalPrice * qty;

          slotTotalAmount += pTotal;

          return {
            foodItemId: p.foodItemId,
            foodName: p.foodname,
            foodImage: p.image,
            foodCategory: p.foodcategory,
            basePrice: p.basePrice || 0,
            hubPrice: p.hubPrice || 0, 
            preOrderPrice: p.preOrderPrice || 0, 
            // price: finalPrice,
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
              mobileNumber: mobile,
              username: username,
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

    // Do NOT allow edits if status is not pending
    if (plan.status !== "Pending Payment") {
      return res
        .status(400)
        .json({ error: "Cannot edit this plan. It is not in Pending Payment state." });
    }

    // Check cutoff
    if (new Date() > new Date(plan.paymentDeadline)) {
      return res
        .status(400)
        .json({ error: "Cutoff time passed. Cannot edit." });
    }

    const prodIndex = plan.products.findIndex(
      (p) => p.foodItemId.toString() === foodItemId
    );

    if (prodIndex === -1) {
      return res.status(404).json({ error: "Product not found in plan" });
    }

    const prod = plan.products[prodIndex];
    const unitPrice =
      prod.preOrderPrice && prod.preOrderPrice > 0
        ? prod.preOrderPrice
        : prod.hubPrice && prod.hubPrice > 0
        ? prod.hubPrice
        : prod.basePrice || 0;

    if (quantity <= 0) {
      plan.products.splice(prodIndex, 1);
    } else {
      prod.quantity = quantity;
      prod.totalPrice = unitPrice * quantity;
    }

    plan.slotTotalAmount = plan.products.reduce(
      (sum, item) => sum + (item.totalPrice || 0),
      0
    );

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
            await OrderModel.findByIdAndUpdate(plan.orderId, { status: "Cancelled" });
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
              await OrderModel.findByIdAndUpdate(plan.orderId, {
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
  async createOrderFromSinglePlan(req, res) {
    try {
      const {
        userId,
        planId,
        discountWallet = 0,
        coupon = 0,
        couponId = null,
        companyId,
        companyName,
        customerType,
        studentName,
        studentClass,
        studentSection,
        addressType,
        coordinates,
        hubName,
        username,
        mobile,
        deliveryNotes="",
      } = req.body;

      if (!userId || !planId) {
        return res
          .status(400)
          .json({ success: false, message: "userId and planId are required" });
      }

      const plan = await MyPlanModel.findOne({
        _id: planId,
        userId,
        status: "Pending Payment",
      });

      if (!plan) {
        return res
          .status(400)
          .json({ success: false, message: "Plan not found or not payable" });
      }

      // Build order from plan
      const allProduct = (plan.products || []).map((p) => ({
        foodItemId: p.foodItemId,
        totalPrice: p.totalPrice,
        quantity: p.quantity,
        name: p.foodName,
        category: p.foodCategory,
        unit: "portion",
      }));

      const newOrderData = {
        customerId: plan.userId || userId,
        deliveryDate: plan.deliveryDate,
        session: plan.session,
        hubId: plan.hubId,
        allProduct,
        subTotal: plan.slotTotalAmount,
        foodtotal: plan.slotTotalAmount,
        delivarylocation: plan.delivarylocation,
        coordinates: plan.coordinates,
        addressType: plan.addressType,
        studentName: plan.studentName || studentName,
        studentClass: plan.studentClass || studentClass,
        studentSection: plan.studentSection || studentSection,
        hubName,
        username: plan.username || "No Name",
        Mobilenumber: plan.mobile || null,
        paymentmethod: "Online",
        ordertype: plan.orderType, // "Instant" | "Reserved"
        // orderdelivarytype: "slot",
        slot: plan.session,
        orderstatus: "Cooking",
        status: "Cooking",
        discountWallet,
        coupon,
        couponId,
        // companyId,
        // companyName,
        // customerType,
        deliveryNotes: deliveryNotes || "",
      };

      const newOrder = new OrderModel(newOrderData);
      const savedOrder = await newOrder.save();

      // update stock, whatsapp, referral if you want (same as addfoodorder)
      // await updateStockFromHubMenu(plan.hubId, allProduct, plan.deliveryDate, plan.session);
      // sendorderwhatsapp(savedOrder?.orderid, savedOrder.username, savedOrder.Mobilenumber, savedOrder.slot, savedOrder.delivarylocation);
      // await handleReferralRewards(savedOrder);

      // wallet update if any
      if (discountWallet > 0 && userId) {
        try {
          const wallet = await WalletModel.findOne({ userId });
          if (wallet) {
            wallet.transactions.push({
              amount: discountWallet,
              type: "debit",
              description: `Applied to order: ${savedOrder.orderid}`,
              isFreeCash: false,
              expiryDate: null,
            });
            wallet.balance -= Number(discountWallet);
            wallet.updatedAt = Date.now();
            await wallet.save();
          }
        } catch (walletError) {
          console.error("Wallet update error:", walletError);
        }
      }

      // coupon usage if needed
      if (couponId && mobile) {
        try {
          const coupons = await CouponModel.find({
            couponName: couponId?.toLowerCase(),
          });
          for (let couponDoc of coupons) {
            let userExists = couponDoc.applyUser.find(
              (ele) => ele?.MobileNumber === mobile
            );
            if (!userExists) {
              couponDoc.applyUser.push({
                Name: username,
                MobileNumber: mobile,
              });
              await couponDoc.save();
              break;
            }
          }
        } catch (couponError) {
          console.error("Coupon update error:", couponError);
        }
      }

      // Link plan to order and mark Confirmed
      plan.status = "Confirmed";
      plan.orderId = savedOrder._id;
      await plan.save();

      return res.status(200).json({
        success: true,
        message: "Order created from plan successfully",
        data: savedOrder,
      });
    } catch (err) {
      console.error("createOrderFromSinglePlan error:", err);
      return res
        .status(500)
        .json({ success: false, message: "Server Error", error: err.message });
    }
  }
}

module.exports = new MyPlanController();
