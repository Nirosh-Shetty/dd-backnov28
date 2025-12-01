const MyPlanModel = require("../../Model/User/MyPlan");
const CartModel = require("../../Model/User/Cart");
const OrderModel = require("../../Model/Admin/Addorder");
const WalletModel = require("../../Model/User/Wallet");
const CouponModel = require("../../Model/Admin/Coupon");
const moment = require("moment");

class MyPlanController {
 // ... imports remain same
  async addToPlan(req, res) {
    try {
      const { userId, items, addressDetails } = req.body;

      if (!userId || !items || items.length === 0) {
        return res.status(400).json({ error: "Invalid data" });
      }

      // 1. Group Items by "Date|Session" locally
      const groupedSlots = items.reduce((acc, item) => {
        const key = `${item.deliveryDate}|${item.session}`;
        if (!acc[key]) {
          acc[key] = {
            deliveryDate: item.deliveryDate,
            session: item.session,
            hubId: item.locationInfo?.hubId || "UNKNOWN",
            products: [],
          };
        }
        acc[key].products.push(item);
        return acc;
      }, {});

      const now = new Date();

      // 2. Process Each Group Separately
      for (const key in groupedSlots) {
        const group = groupedSlots[key];
        const deliveryDateObj = new Date(group.deliveryDate);

        // A. Calculate Deadline & Type (Same logic as before)
        const isToday = moment(deliveryDateObj).isSame(now, "day");
        let deadline, type;

        if (isToday) {
          type = "Instant";
          deadline = moment(now).add(15, "minutes").toDate();
        } else {
          type = "Reserved";
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

        // B. Prepare the NEW items from the cart
        const newItems = group.products.map((p) => ({
          foodItemId: p.foodItemId,
          foodName: p.foodname,
          foodImage: p.image,
          foodCategory: p.foodcategory,
          basePrice: p.basePrice || 0,
          hubPrice: p.actualPrice || 0,
          preOrderPrice: p.offerPrice || 0,
          price: Number(p.price),
          quantity: Number(p.Quantity),
          totalPrice: Number(p.price) * Number(p.Quantity),
        }));

        // C. Find Existing Plan for this User+Date+Session
        let plan = await MyPlanModel.findOne({
          userId: userId,
          deliveryDate: group.deliveryDate,
          session: group.session,
        });

        if (plan) {
          // --- MERGE LOGIC ---
          // If plan exists, we must merge 'newItems' into 'plan.products'
          
          // 1. Update Status logic: If it was skipped/cancelled, reset to Pending so they can pay
          if(plan.status === 'Skipped' || plan.status === 'Cancelled') {
              plan.status = "Pending Payment";
              plan.paymentDeadline = deadline; // Reset deadline
          }

          newItems.forEach((newItem) => {
            const existingItemIndex = plan.products.findIndex(
              (p) => p.foodItemId.toString() === newItem.foodItemId.toString()
            );

            if (existingItemIndex > -1) {
              // Product exists: Update quantity and total price
              plan.products[existingItemIndex].quantity += newItem.quantity;
              plan.products[existingItemIndex].totalPrice += newItem.totalPrice;
            } else {
              // Product does not exist: Push to array
              plan.products.push(newItem);
            }
          });

          // 2. Recalculate Slot Total
          plan.slotTotalAmount = plan.products.reduce(
            (sum, p) => sum + p.totalPrice,
            0
          );
          
          // Note: We DO NOT update address/hubId here. 
          // Logic: If you are adding to an existing plan, you adhere to that plan's existing location.
          // If user wants to change location, they use the "Change Address" button.

          await plan.save();
        } else {
          // --- CREATE NEW LOGIC ---
          // If no plan exists, create one with the address details provided
          const slotTotal = newItems.reduce(
            (sum, p) => sum + p.totalPrice,
            0
          );

          const newPlan = new MyPlanModel({
            userId,
            deliveryDate: group.deliveryDate,
            session: group.session,
            hubId: group.hubId,
            products: newItems,
            slotTotalAmount: slotTotal,
            status: "Pending Payment",
            orderType: type,
            paymentDeadline: deadline,
            // Address details only set on creation
            delivarylocation: addressDetails?.addressline || "",
            coordinates: {
              type: "Point",
              coordinates: addressDetails?.coordinates || [0, 0],
            },
            addressType: addressDetails?.addressType || "",
            studentName: addressDetails?.studentName || "",
            studentClass: addressDetails?.studentClass || "",
            studentSection: addressDetails?.studentSection || "",
            schoolName: addressDetails?.schoolName || "",
            houseName: addressDetails?.houseName || "",
            apartmentName: addressDetails?.apartmentName || "",
            companyName: addressDetails?.companyName || "",
            customerType: addressDetails?.customerType || "",
            companyId: addressDetails?.companyId || "",
          });

          await newPlan.save();
        }
      }

      // 4. Clear Cart
      await CartModel.deleteMany({ userId: userId });

      return res.status(200).json({
        success: true,
        message: "Items added/merged to My Plan successfully",
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
