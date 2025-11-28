const { default: axios } = require("axios");
const PackerModel = require("../../Model/Packer/PackerModel");
const jwt = require('jsonwebtoken');

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
}

class Packer {
    async createpacker(req, res) {
        try {
            const { username, mobileNumber, hubs, locations } = req.body;
          console.log("pppp",mobileNumber);
          
            // Input validation
            if (!username) return res.status(400).json({ error: "Please enter username" });
            if (!mobileNumber) return res.status(400).json({ error: "Please enter mobile number" });
            if (!Array.isArray(hubs) || !hubs.length) return res.status(400).json({ error: "Please select at least one hub" });
            if (!Array.isArray(locations) || !locations.length) return res.status(400).json({ error: "Please select at least one location" });

            // Normalize mobile number to E.164 format (+91XXXXXXXXXX)
            let normalizedMobile = mobileNumber;
          
      // Check for existing mobile number
            const check = await PackerModel.findOne({ mobileNumber: normalizedMobile });
            if (check) return res.status(400).json({ error: "Mobile number already exists" });

            // Create new packer
            const packer = new PackerModel({
                username,
                mobileNumber: normalizedMobile,
                hubs,
                locations
            });
            await packer.save();
            res.status(201).json({ message: 'Packer added successfully', packer });
        } catch (error) {
            res.status(400).json({ message: 'Error adding packer', error: error.message });
        }
    }

    async sendPackerOtp(req, res) {
        try {
            let { mobileNumber } = req.body;
            const otp = generateOTP();

            if (!mobileNumber) {
                return res.status(400).json({ error: "Please provide mobile number" });
            }

            // Normalize mobile number
            if (!mobileNumber.startsWith('+91')) {
                const digits = mobileNumber.replace(/\D/g, '');
                if (digits.length === 10 && /^[6-9]/.test(digits)) {
                    mobileNumber = `+91${digits}`;
                } else {
                    return res.status(400).json({ error: "Invalid Indian mobile number. It must be 10 digits starting with 6, 7, 8, or 9." });
                }
            }

            // Check if packer exists
            const packer = await PackerModel.findOne({ mobileNumber });
            if (!packer) return res.status(401).json({ error: "Your mobile number is not registered" });

            // Prepare OTP payload
            const payload = {
                "apiKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NTJkNGI3ODU0MGZhN2FmOTQ1NzM5ZCIsIm5hbWUiOiJDSEVGIFNUVURJTyBJTk5PVkFUSU9OUyIsImFwcE5hbWUiOiJBaVNlbnN5IiwiY2xpZW50SWQiOiI2NzUyZDRiNzg1NDBmYTdhZjk0NTczOTciLCJhY3RpdmVQbGFuIjoiQkFTSUNfTU9OVEhMWSIsImlhdCI6MTczMzQ4MTY1NX0.HMTWJFXWW7I0KG8U24jYvY9CUMEEl0tP1W-2X18GnDI",
                "campaignName": "otp_send",
                "destination": mobileNumber.replace('+', ''), // e.g., 919876543210
                "userName": "CHEF STUDIO INNOVATIONS",
                "templateParams": [otp],
                "source": "new-landing-page form",
                "media": {},
                "buttons": [
                    {
                        "type": "button",
                        "sub_type": "url",
                        "index": 0,
                        "parameters": [
                            {
                                "type": "text",
                                "text": otp
                            }
                        ]
                    }
                ],
                "carouselCards": [],
                "location": {},
                "paramsFallbackValue": {
                    "FirstName": "user"
                }
            };

            // Send OTP
            const response = await axios.post("https://backend.aisensy.com/campaign/t1/api/v2", payload);
            if (response.status === 200) {
                packer.otp = otp;
                await packer.save();
                return res.status(200).json({ success: "OTP successfully sent to your WhatsApp number" });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error sending OTP', error: error.message });
        }
    }

    async verificationPacker(req, res) {
        try {
            const { mobileNumber, otp } = req.body;

            // Normalize mobile number
            let normalizedMobile = mobileNumber;
            if (!normalizedMobile.startsWith('+91')) {
                const digits = mobileNumber.replace(/\D/g, '');
                if (digits.length === 10 && /^[6-9]/.test(digits)) {
                    normalizedMobile = `+91${digits}`;
                } else {
                    return res.status(400).json({ error: "Invalid Indian mobile number. It must be 10 digits starting with 6, 7, 8, or 9." });
                }
            }

            // Verify OTP
            const packer = await PackerModel.findOne({ mobileNumber: normalizedMobile, otp });
            if (!packer) return res.status(400).json({ message: 'Invalid OTP' });

            // Clear OTP and generate JWT
            packer.otp = null;
            await packer.save();
            const token = jwt.sign(
                {
                    mobileNumber: packer.mobileNumber,
                    username: packer.username,
                    _id: packer._id,
                    packerId: packer.packerId,
                    hubs: packer.hubs,
                    locations: packer.locations
                },
                "DailyADish",
                { expiresIn: '1h' }
            );

            return res.status(200).json({ token, data: packer });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    async updatePacker(req, res) {
        try {
            const { packerId, username, mobileNumber, hubs, locations } = req.body;

            // Input validation
            
            
            if (!packerId) return res.status(400).json({ error: "Packer ID is required" });
            const packer = await PackerModel.findOne({ packerId });
            if (!packer) return res.status(404).json({ error: "Packer not found" });

            // Update fields if provided
            if (username) {
                const existingUser = await PackerModel.findOne({ username, _id: { $ne: packer._id } });
                if (existingUser) return res.status(400).json({ error: "Username already exists" });
                packer.username = username;
            }

            if (mobileNumber) {
                let normalizedMobile = mobileNumber;
                if (!normalizedMobile.startsWith('+91')) {
                    const digits = mobileNumber.replace(/\D/g, '');
                    if (digits.length === 10 && /^[6-9]/.test(digits)) {
                        normalizedMobile = `+91${digits}`;
                    } else {
                        return res.status(400).json({ error: "Invalid Indian mobile number. It must be 10 digits starting with 6, 7, 8, or 9." });
                    }
                }
                const existingMobile = await PackerModel.findOne({ mobileNumber: normalizedMobile, _id: { $ne: packer._id } });
                if (existingMobile) return res.status(400).json({ error: "Mobile number already exists" });
                packer.mobileNumber = normalizedMobile;
            }

            if (hubs && Array.isArray(hubs) && hubs.length) {
                packer.hubs = hubs;
            } else if (hubs && (!Array.isArray(hubs) || !hubs.length)) {
                return res.status(400).json({ error: "Please select at least one hub" });
            }

            if (locations && Array.isArray(locations) && locations.length) {
                packer.locations = locations;
            } else if (locations && (!Array.isArray(locations) || !locations.length)) {
                return res.status(400).json({ error: "Please select at least one location" });
            }

            await packer.save();
            return res.status(200).json({ success: "Packer successfully updated", data: packer });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error updating packer', error: error.message });
        }
    }

    async deletPacker(req, res) {
        try {
            const { packerId } = req.params;
            const packer = await PackerModel.findOneAndDelete({ packerId });
            if (!packer) return res.status(404).json({ message: 'Packer not found' });
            res.status(200).json({ message: 'Packer deleted successfully' });
        } catch (error) {
            res.status(400).json({ error: 'Error deleting packer', message: error.message });
        }
    }

    async getAllPacker(req, res) {
        try {
            const packers = await PackerModel.find().sort({ createdAt: -1 });
            return res.status(200).json(packers); // Match frontend expectation
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
}

module.exports = new Packer();