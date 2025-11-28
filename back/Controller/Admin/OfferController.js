const Offer = require('../../Model/Admin/OfferModel');
const customerCartModel = require('../../Model/Admin/Addorder');
const UserModel = require('../../Model/User/Userlist')
// Helper function to check date overlap
const checkDateOverlap = async (startDate, endDate, excludeOfferId = null) => {
    const query = {
        $or: [
            // New offer starts within an existing offer
            { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
            // New offer ends within an existing offer
            { startDate: { $lte: endDate }, endDate: { $gte: endDate } },
            // New offer completely covers an existing offer
            { startDate: { $gte: startDate }, endDate: { $lte: endDate } },
        ],
    };

    if (excludeOfferId) {
        query._id = { $ne: excludeOfferId }; // Exclude the offer being updated
    }

    const overlappingOffers = await Offer.find(query);
    return overlappingOffers.length > 0;
};

exports.createOffer = async (req, res) => {
    try {
        const { products, startDate, endDate,hubId,hubName,locations } = req.body;

        // Validate input
        if (!products || !Array.isArray(products) || !startDate || !endDate) {
            return res.status(400).json({ message: 'Invalid input data' });
        }

        // Convert string dates to Date objects
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Check if dates are valid
        if (isNaN(start) || isNaN(end) || start > end) {
            return res.status(400).json({ message: 'Invalid start or end date' });
        }

        // Check for overlapping offers
        const hasOverlap = await checkDateOverlap(start, end);
        if (hasOverlap) {
            return res.status(400).json({ message: 'An offer already exists for the specified date range' });
        }

        // Create and save new offer
        const offer = new Offer({ products, startDate: start, endDate: end ,hubId,hubName,locations });
        await offer.save();
        res.status(201).json({ message: 'Offer created successfully', offer });
    } catch (error) {
        console.error('Error creating offer:', error.message);
        res.status(500).json({ message: 'Error creating offer' });
    }
};

exports.getOffers = async (req, res) => {
    try {
        const offers = await Offer.find().sort({ createdAt: -1 });
        res.status(200).json({ data: offers });
    } catch (error) {
        console.error('Error fetching offers:', error.message);
        res.status(500).json({ message: 'Error fetching offers' });
    }
};

exports.getUserOffers = async (req, res) => {
    try {
        const currentDate = new Date();
        let id = req.body.id;
        let location = req.body.location;
        console.log("location", req.body)

        if (!id) return res.status(200).json({
            success: true,
            data: [],
        })
        if (id === "undefined") return res.status(200).json({
            success: true,
            data: [],
        })
        // Find active offers (current date is between startDate and endDate)
        const offers = await Offer.findOne({
            startDate: { $lte: currentDate },
            endDate: { $gte: currentDate },
            locations: { $in: [location] }
        }).select('products startDate endDate'); // Select only necessary fields

        if (!offers) {
            return res.status(404).json({ message: 'No active offers available' });
        }

        // Format response for user
        if (id && id !== "undefined") {
            const checkUser = await UserModel.findById(id);
            if (checkUser.employeeId) {
                return res.status(200).json({
                    success: true,
                    data: [],
                })
            }
            let check = await customerCartModel.find({ customerId: id })
            offers.products = offers.products.filter((ele) => ele.customerType > check.length).slice(0, 1);
        }

        res.status(200).json({
            success: true,
            data: offers?.products,
        });
    } catch (error) {
        console.error('Error fetching user offers:', error.message);
        res.status(500).json({ message: 'Server error, please try again later' });
    }
};

exports.deleteOffer = async (req, res) => {
    try {
        const offerId = req.params.id;
        const offer = await Offer.findByIdAndDelete(offerId);
        if (!offer) {
            return res.status(404).json({ message: 'Offer not found' });
        }
        res.status(200).json({ message: 'Offer deleted successfully' });
    } catch (error) {
        console.error('Error deleting offer:', error.message);
        res.status(500).json({ message: 'Error deleting offer' });
    }
};

exports.updateOffer = async (req, res) => {
    try {
        const offerId = req.params.id;
        const { products, startDate, endDate ,hubId,hubName,locations } = req.body;

        // Validate input
        if (!products || !Array.isArray(products) || !startDate || !endDate) {
            return res.status(400).json({ message: 'Invalid input data' });
        }

        // Convert string dates to Date objects
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Check if dates are valid
        if (isNaN(start) || isNaN(end) || start > end) {
            return res.status(400).json({ message: 'Invalid start or end date' });
        }

        // Check for overlapping offers, excluding the current offer
        const hasOverlap = await checkDateOverlap(start, end, offerId);
        if (hasOverlap) {
            return res.status(400).json({ message: 'An offer already exists for the specified date range' });
        }

        // Update offer
        const updatedOffer = await Offer.findByIdAndUpdate(
            offerId,
            { products, startDate: start, endDate: end ,hubId,hubName,locations },
            { new: true }
        );
        if (!updatedOffer) {
            return res.status(404).json({ message: 'Offer not found' });
        }
        res.status(200).json({ message: 'Offer updated successfully', offer: updatedOffer });
    } catch (error) {
        console.error('Error updating offer:', error.message);
        res.status(500).json({ message: 'Error updating offer' });
    }
};