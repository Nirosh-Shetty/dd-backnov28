const Coupon = require("../../Model/Admin/Coupon");
const path = require("path");
const fs = require("fs");
const { uploadFile2 } = require("../../Midleware/AWS");

// Create a new coupon
exports.createCoupon = async (req, res) => {
  try {
    const { couponName, shortDescription, applyUser, discountPrice, productId } = req.body;

    // Handle image upload
    let imagePath = null;
    if (req.file) {
      imagePath =await uploadFile2(req.file,"Coupon");
    }

    const newCoupon = new Coupon({
      couponName,
      image: imagePath,
      shortDescription,
   
      discountPrice,
      productId,
    });

    const savedCoupon = await newCoupon.save();
    res.status(201).json(savedCoupon);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all coupons
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({_id:-1}).populate("productId");
    res.status(200).json(coupons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a coupon by ID
exports.getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    res.status(200).json(coupon);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a coupon
exports.updateCoupon = async (req, res) => {
  try {
    const { couponName, shortDescription, applyUser, discountPrice, productId } = req.body;

    const updatedData = {
      couponName,
      shortDescription,
  
      discountPrice,
      productId,
    };

    // Handle image update
    if (req.file) {
      updatedData.image = await uploadFile2(req.file,"Coupon");
    }

    const updatedCoupon = await Coupon.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    if (!updatedCoupon) return res.status(404).json({ message: "Coupon not found" });
    res.status(200).json(updatedCoupon);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a coupon
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });

    // Remove associated image file if exists
    if (coupon.image) {
      const imagePath = path.join(__dirname, "../../Public/Coupon", coupon.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Coupon.deleteOne({_id:coupon?._id})
    res.status(200).json({ message: "Coupon deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.applyCoupon = async (req, res) => {
  try {
    const { couponName, mobileNumber, cards } = req.body;

    // Check if cart items are present
    if (!cards || cards.length === 0) {
      return res.status(404).json({ message: 'No items in cart.' });
    }

    // Find all coupons with the given name
    const coupons = await Coupon.find({ couponName: couponName?.toLowerCase() });

    if (!coupons || coupons.length === 0) {
      return res.status(404).json({ message: 'Coupon code not found or invalid.' });
    }

    let discountApplied = false;
    let totalDiscount = 0; // Track the total discount amount

    const updatedCards = cards.map((cardItem) => {
      // Iterate through all matching coupons to find a valid match
      const matchingCoupon = coupons.find(
        (coupon) =>
          cardItem.foodItemId === coupon.productId?.toString() &&
          !coupon.applyUser.some((user) => user.MobileNumber === mobileNumber)
      );

      if (matchingCoupon && !discountApplied) {
        // Apply the coupon discount to the first matching product
        discountApplied = true;
        const discountAmount = matchingCoupon.discountPrice || 0;
        totalDiscount += discountAmount;

        return {
          ...cardItem,
          discountedPrice:  discountAmount,
          couponApplied: matchingCoupon.couponName,
        };
      }

      return cardItem; // Return the product unchanged if no coupon applies
    });

    if (!discountApplied) {
      return res.status(400).json({
        message: 'This coupon code is not valid for your cart items or has already been used.',
      });
    }

    // Return success response with the total discount and updated cart
    return res.status(200).json({
      message: 'Coupon applied successfully!',
      discountPrice: totalDiscount, // Total discount applied
    });
  } catch (error) {
    // Handle server errors
    res.status(500).json({ message: 'Server error.', error });
  }
};


// Validate and apply a coupon
// exports.applyCoupon = async (req, res) => {
//   try {
//     const { couponName, mobileNumber, cards } = req.body;
// if(!cards||cards.length==0)  return res.status(404).json({ message: 'No items in cart' });

    
//     // Find the coupon
//     const coupon = await Coupon.findOne({ couponName:couponName?.toLowerCase() });
//     if (!coupon) {
//       return res.status(404).json({ message: 'Coupon code not found or invalid.' });
//     }

//   const checkproduct = cards.some(
//       (item) => item.foodItemId === coupon?.productId?.toString()
//     );

//     if (!checkproduct) {
//       return res.status(400).json({
//         message: 'This coupon code not valid for your carts items',
//       });
//     }

//     // Check if the user has already applied the coupon
//     const userAlreadyApplied = coupon.applyUser.some(
//       (user) => user.MobileNumber === mobileNumber
//     );

//     if (userAlreadyApplied) {
//       return res.status(400).json({
//         message: 'This coupon code has already been used. Kindly enter a new one to proceed.',
//       });
//     }

//     // Apply the coupon for the user
//     // coupon.applyUser.push({ Name: userName, MobileNumber: mobileNumber });
//     // await coupon.save();

//     res.status(200).json({
//       message: 'Coupon applied successfully!',
//       discountPrice: coupon.discountPrice,
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error.', error });
//   }
// };
