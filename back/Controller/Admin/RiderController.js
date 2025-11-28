const Rider = require("../../Model/Admin/Rider");
const axios = require("axios");
const jwt = require("jsonwebtoken");

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
}

exports.createRider = async (req, res) => {
  try {
    const { name, phone } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ message: "Name and phone are required" });
    }

    const rider = await Rider.create(req.body);
    res
      .status(201)
      .json({ message: "Rider created successfully", rider });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Phone number already exists" });
    }
    res
      .status(500)
      .json({ message: "Failed to create rider", error: error.message });
  }
};

exports.getRiders = async (req, res) => {
  try {
    const { status, search } = req.query;
    const filters = {};

    if (status && status !== "all") {
      filters.status = status;
    }

    if (search) {
      const regex = new RegExp(search, "i");
      filters.$or = [
        { name: regex },
        { phone: regex },
        { alternatePhone: regex },
        { hub: regex },
        { email: regex },
        { vehicleNumber: regex },
      ];
    }

    const riders = await Rider.find(filters).sort({ createdAt: -1 });
    res.status(200).json({ riders });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch riders", error: error.message });
  }
};

exports.updateRider = async (req, res) => {
  try {
    const { id } = req.params;
    const rider = await Rider.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!rider) {
      return res.status(404).json({ message: "Rider not found" });
    }

    res
      .status(200)
      .json({ message: "Rider updated successfully", rider });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Phone number already exists" });
    }
    res
      .status(500)
      .json({ message: "Failed to update rider", error: error.message });
  }
};

exports.deleteRider = async (req, res) => {
  try {
    const { id } = req.params;
    const rider = await Rider.findByIdAndDelete(id);

    if (!rider) {
      return res.status(404).json({ message: "Rider not found" });
    }

    res.status(200).json({ message: "Rider deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete rider", error: error.message });
  }
};

// Send OTP to rider's phone
exports.sendRiderOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: "Please provide phone number" });
    }

    // Normalize phone number
    let normalizedPhone = phone;
   

    // Check if rider exists
    const rider = await Rider.findOne({ phone: normalizedPhone });
    if (!rider) {
      return res
        .status(401)
        .json({ error: "Your phone number is not registered as a rider" });
    }
    if (!normalizedPhone.startsWith("+91")) {
      const digits = phone.replace(/\D/g, "");
      if (digits.length === 10 && /^[6-9]/.test(digits)) {
        normalizedPhone = `+91${digits}`;
      } else {
        return res
          .status(400)
          .json({
            error:
              "Invalid Indian mobile number. It must be 10 digits starting with 6, 7, 8, or 9.",
          });
      }
    }
    // Check if rider is active
    if (rider.status !== "active") {
      return res
        .status(403)
        .json({
          error: `Your account is ${rider.status}. Please contact admin.`,
        });
    }

    // Generate OTP
    const otp = generateOTP();

    // Prepare OTP payload for WhatsApp
    const payload = {
      apiKey:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NTJkNGI3ODU0MGZhN2FmOTQ1NzM5ZCIsIm5hbWUiOiJDSEVGIFNUVURJTyBJTk5PVkFUSU9OUyIsImFwcE5hbWUiOiJBaVNlbnN5IiwiY2xpZW50SWQiOiI2NzUyZDRiNzg1NDBmYTdhZjk0NTczOTciLCJhY3RpdmVQbGFuIjoiQkFTSUNfTU9OVEhMWSIsImlhdCI6MTczMzQ4MTY1NX0.HMTWJFXWW7I0KG8U24jYvY9CUMEEl0tP1W-2X18GnDI",
      campaignName: "otp_send",
      destination: normalizedPhone.replace("+", ""), // e.g., 919876543210
      userName: "CHEF STUDIO INNOVATIONS",
      templateParams: [otp],
      source: "rider-login",
      media: {},
      buttons: [
        {
          type: "button",
          sub_type: "url",
          index: 0,
          parameters: [
            {
              type: "text",
              text: otp,
            },
          ],
        },
      ],
      carouselCards: [],
      location: {},
      paramsFallbackValue: {
        FirstName: rider.name || "Rider",
      },
    };

    // Send OTP via WhatsApp
    try {
      const response = await axios.post(
        "https://backend.aisensy.com/campaign/t1/api/v2",
        payload
      );
      if (response.status === 200) {
        rider.otp = otp;
        await rider.save();
        return res
          .status(200)
          .json({ success: "OTP successfully sent to your WhatsApp number" });
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      return res
        .status(500)
        .json({ error: "Failed to send OTP. Please try again." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error sending OTP", error: error.message });
  }
};

// Verify OTP and login rider
exports.verifyRiderOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res
        .status(400)
        .json({ error: "Phone number and OTP are required" });
    }

    // Normalize phone number
    let normalizedPhone = phone;
 
    // Verify OTP
    const rider = await Rider.findOne({
      phone: normalizedPhone,
      otp: otp,
    });

    if (!rider) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Check if rider is active
    if (rider.status !== "active") {
      return res
        .status(403)
        .json({
          error: `Your account is ${rider.status}. Please contact admin.`,
        });
    }

    // Clear OTP and generate JWT token
    rider.otp = null;
    await rider.save();

    const token = jwt.sign(
      {
        phone: rider.phone,
        name: rider.name,
        _id: rider._id,
        hub: rider.hub,
        status: rider.status,
        vehicleType: rider.vehicleType,
        vehicleNumber: rider.vehicleNumber,
      },
      "DailyADish",
      { expiresIn: "24h" }
    );

    return res.status(200).json({
      success: "Login successful",
      token,
      rider: {
        _id: rider._id,
        name: rider.name,
        phone: rider.phone,
        email: rider.email,
        hub: rider.hub,
        vehicleType: rider.vehicleType,
        vehicleNumber: rider.vehicleNumber,
        status: rider.status,
      },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

