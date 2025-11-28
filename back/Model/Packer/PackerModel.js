const mongoose = require('mongoose');

// Packer Schema with auto-generated ID
const packerSchema = new mongoose.Schema({
    packerId: { type: String, unique: true },
    username: { type: String, required: true },
    mobileNumber: {
        type: String,
        required: true,
        unique: true,
        match: [/^\+91[6-9]\d{9}$/, 'Please provide a valid Indian mobile number in E.164 format (e.g., +919876543210)']
    },
    hubs: [{ type: String, required: true }],
    locations: [{ type: String, required: true }],
    otp: { type: Number },
    createdAt: { type: Date, default: Date.now }
});

// Solution 1: Find the highest existing packerId and increment
packerSchema.pre('save', async function (next) {
    if (!this.packerId) {
        try {
            // Find the document with the highest packerId
            const lastPacker = await this.constructor.findOne(
                { packerId: { $regex: /^DDPA\d+$/ } },
                { packerId: 1 }
            ).sort({ packerId: -1 });

            let nextNumber = 1;
            if (lastPacker && lastPacker.packerId) {
                // Extract the number from the last packerId (e.g., "DDPA001" -> 1)
                const lastNumber = parseInt(lastPacker.packerId.replace('DDPA', ''));
                nextNumber = lastNumber + 1;
            }

            // Format the new packerId
            this.packerId = `DDPA${String(nextNumber).padStart(3, '0')}`;
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});

module.exports = mongoose.model('Packer', packerSchema);