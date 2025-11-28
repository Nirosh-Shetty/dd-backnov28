const ServiceRequest = require('../../Model/User/ServiceRequest');
const User = require('../../Model/User/Userlist');

// @desc    Create new service request
// @route   POST /api/service-requests
// @access  Private
const createServiceRequest = async (req, res) => {
  try {
    const { customerId, name, phone, location, address } = req.body;

    // Validate required fields
    if (!customerId || !name || !phone || !location || !address) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: customerId, name, phone, location, address'
      });
    }

    // Validate location format
    if (!location.lat || !location.lng) {
      return res.status(400).json({
        success: false,
        message: 'Location must contain lat and lng coordinates'
      });
    }

    // Check if user exists
    const user = await User.findById(customerId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check for duplicate pending request from same user for same location
    const existingRequest = await ServiceRequest.findOne({
      customerId,
      'location.coordinates': [location.lng, location.lat],
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(409).json({
        success: false,
        message: 'You already have a pending request for this location'
      });
    }

    // Create new service request
    const serviceRequest = new ServiceRequest({
      customerId,
      name: name.trim(),
      phone: phone.toString().trim(), // Ensure phone is string
      location: {
        type: 'Point',
        coordinates: [location.lng, location.lat] // MongoDB uses [lng, lat]
      },
      address: address.trim(),
      status: 'pending'
    });

    await serviceRequest.save();

    res.status(201).json({
      success: true,
      message: 'Service request submitted successfully',
      data: {
        requestId: serviceRequest._id,
        name: serviceRequest.name,
        phone: serviceRequest.phone,
        address: serviceRequest.address,
        status: serviceRequest.status,
        requestedAt: serviceRequest.requestedAt
      }
    });

  } catch (error) {
    console.error('Create service request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

// @desc    Get service requests with filtering and pagination
// @route   GET /api/service-requests
// @access  Private/Admin
const getServiceRequests = async (req, res) => {
  try {
    const {
      status,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    if (status && ['pending', 'reviewed', 'approved', 'rejected'].includes(status)) {
      filter.status = status;
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get requests with customer details
    const requests = await ServiceRequest.find(filter)
      .populate('customerId', 'Fname Mobile email')
      .populate('reviewedBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count for pagination
    const total = await ServiceRequest.countDocuments(filter);
    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data: {
        requests,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalRequests: total,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1
        }
      }
    });

  } catch (error) {
    console.error('Get service requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

// @desc    Get service requests by customer
// @route   GET /api/service-requests/customer/:customerId
// @access  Private
const getServiceRequestsByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const requests = await ServiceRequest.find({ customerId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await ServiceRequest.countDocuments({ customerId });

    res.json({
      success: true,
      data: {
        requests,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalRequests: total
        }
      }
    });

  } catch (error) {
    console.error('Get customer service requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

// @desc    Update service request status
// @route   PUT /api/service-requests/:requestId
// @access  Private/Admin
const updateServiceRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, notes } = req.body;
    const adminId = req.user?.id; // Assuming admin user is attached to request

    // Validate status
    if (!['pending', 'reviewed', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: pending, reviewed, approved, rejected'
      });
    }

    const request = await ServiceRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found'
      });
    }

    // Update request
    const updateData = {
      status,
      notes: notes || request.notes
    };

    // If status is changing from pending, set reviewed info
    if (request.status === 'pending' && status !== 'pending') {
      updateData.reviewedAt = new Date();
      updateData.reviewedBy = adminId;
    }

    const updatedRequest = await ServiceRequest.findByIdAndUpdate(
      requestId,
      updateData,
      { new: true, runValidators: true }
    ).populate('customerId', 'Fname Mobile email')
     .populate('reviewedBy', 'name email');

    res.json({
      success: true,
      message: `Service request ${status} successfully`,
      data: updatedRequest
    });

  } catch (error) {
    console.error('Update service request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

// @desc    Get service request statistics
// @route   GET /api/service-requests/stats
// @access  Private/Admin
const getServiceRequestStats = async (req, res) => {
  try {
    const stats = await ServiceRequest.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await ServiceRequest.countDocuments();
    
    // Format stats
    const statusStats = {
      pending: 0,
      reviewed: 0,
      approved: 0,
      rejected: 0,
      total
    };

    stats.forEach(stat => {
      statusStats[stat._id] = stat.count;
    });

    // Get recent requests count (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recentCount = await ServiceRequest.countDocuments({
      createdAt: { $gte: oneWeekAgo }
    });

    res.json({
      success: true,
      data: {
        statusStats,
        recentRequests: recentCount
      }
    });

  } catch (error) {
    console.error('Get service request stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};


// @desc    Get all service request locations for map view
// @route   GET /api/service-requests/map-locations
// @access  Private/Admin
const getServiceRequestLocations = async (req, res) => {
  try {
    const { status } = req.query;

    // Build filter object
    const filter = {};
    if (status && ['pending', 'reviewed', 'approved', 'rejected'].includes(status)) {
      filter.status = status;
    }

    // Get requests with location data and customer info
    const requests = await ServiceRequest.find(filter)
      .populate('customerId', 'Fname Mobile email')
      .select('name phone address location status createdAt customerId')
      .lean();

    // Format response for map
    const locations = requests.map(request => ({
      id: request._id,
      customerName: request.customerId?.Fname || 'Unknown',
      name: request.name,
      phone: request.phone,
      address: request.address,
      status: request.status,
      coordinates: {
        lat: request.location.coordinates[1], // Convert back from [lng, lat] to lat
        lng: request.location.coordinates[0]
      },
      requestedAt: request.createdAt
    }));

    res.json({
      success: true,
      data: {
        locations,
        total: locations.length
      }
    });

  } catch (error) {
    console.error('Get service request locations error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

module.exports = {
  createServiceRequest,
  getServiceRequests,
  getServiceRequestsByCustomer,
  updateServiceRequest,
  getServiceRequestStats,
  getServiceRequestLocations
};