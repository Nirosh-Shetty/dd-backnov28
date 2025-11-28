
const Packing = require("../../Model/Packer/Packing");



// ✅ Update individual packing item status


exports.updateIndividualPacked = async (req, res) => {
  try {
    const { packingId, isPacked , packed} = req.body;
    
    // First find the item to get current orders
    const existingItem = await Packing.findById(packingId);
    
    if (!existingItem) {
      return res.status(404).json({ 
        success: false, 
        message: "Packing item not found" 
      });
    }

    // Update both the main fields AND the orders array
    const updatedItem = await Packing.findByIdAndUpdate(
      packingId,
      { 
        isPacked: isPacked,
        packed: isPacked ? 1 : 0,
        isFullyPacked: isPacked,
        // Also update the isPacked status in the orders array
        $set: {
          "orders.0.isPacked": isPacked
        },
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ 
        success: false, 
        message: "Packing item not found" 
      });
    }

    console.log('Updated packing item:', {
      id: updatedItem._id,
      name: updatedItem.name,
      packed: updatedItem.packed,
      isPacked: updatedItem.isPacked,
      orderIsPacked: updatedItem.orders[0]?.isPacked
    });

    // Emit socket event
    if (global.io) {
      global.io.emit("packingUpdated", updatedItem);
    }

    res.json({ 
      success: true, 
      message: "Item packing status updated",
      data: updatedItem 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: "Server error",
      error: error.message 
    });
  }
};




// ✅ Get individual packing items for a specific food item
exports.getIndividualPackingItems = async (req, res) => {
  try {
    const { name, hub, slot } = req.query;
    
    if (!name || !hub || !slot) {
      return res.status(400).json({ 
        success: false, 
        message: "Name, hub, and slot are required" 
      });
    }

    const individualItems = await Packing.find({
      name: name,
      hub: { $in: [hub] },
      slot: slot
    }).sort({ itemSequence: 1 });

    res.json({ 
      success: true, 
      data: individualItems 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: "Server error",
      error: error.message 
    });
  }
};


// ✅ Update packing status for an item by name and hub
exports.updatePacked = async (req, res) => {
  try {
    const { packingName, hub, orderId, isPacked } = req.body;

    // Find by name AND hub to make items distinct by hub
    const packing = await Packing.findOne({ 
      name: packingName,
      hub: { $in: hub } // Using $in to match arrays
    });
    
    if (!packing) {
      return res.status(404).json({ success: false, message: "Packing not found for this hub" });
    }

    // find the order item
    const orderItem = packing.orders.find((o) => o.id === orderId);
    if (!orderItem) {
      return res.status(404).json({ success: false, message: "Order item not found" });
    }

    // update order item
    orderItem.isPacked = isPacked;

    // recalculate packed count
    packing.packed = packing.orders.filter((o) => o.isPacked).length;

    // update flags
    packing.isPacked = packing.packed > 0;
    packing.isFullyPacked = packing.packed === packing.totalOrdered;

    await packing.save();

    // Emit socket event
    global.io.emit("packingUpdated", packing);

    res.status(200).json({
      success: true,
      message: "Packing updated successfully",
      data: packing,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Update packing status in bulk with hub support
exports.updatePackedBulk = async (req, res) => {
  try {
    const { packingName, hub, orders, unit, totalOrdered, ordered, category ,categoryName } = req.body;

    // Find by name AND hub to make items distinct by hub
    let packing = await Packing.findOne({ 
      name: packingName,
      hub: { $in: hub }
    });
    
    if (!packing) {
      // Create new packing if it doesn't exist for this hub
      packing = new Packing({
        name: packingName,
        hub: hub || ['HUB001'], // Default to HUB001 if not provided
        unit: unit || "",
        totalOrdered: totalOrdered || orders.length,
        category: category,
        categoryName:categoryName,
        ordered: ordered,
        orders: orders,
        packed: 0,
        isPacked: false,
        isFullyPacked: false
      });
    } else {
      // Update existing packing
      packing.orders = orders;
    }

    // Recalculate counts
    const packedCount = orders.filter(o => o.isPacked).length;
    packing.totalOrdered = totalOrdered || orders.length;
    packing.ordered = ordered;
    packing.packed = packedCount;
    packing.isPacked = packedCount > 0;
    packing.isFullyPacked = packedCount === packing.totalOrdered;
    packing.category = category;
    packing.categoryName = categoryName;
    packing.unit = unit || packing.unit;

    await packing.save();

    // Emit socket event with updated packing data
    global.io.emit("packingUpdated", packing);

    res.json({
      success: true,
      message: packing.isNew ? "Packing created successfully" : "Packing updated successfully",
      data: packing,
    });
  } catch (error) {
    console.error("Error updating packing:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Get all packing data (with optional hub filter)
exports.getAllPacking = async (req, res) => {
  try {
    const { hub } = req.query; // Get hub from query parameters
    
    console.log("Fetching packing data for hub:", hub);
    
    let filter = {};
    
    // If hub is provided, filter by hub
    if (hub) {
      filter.hub = { $in: [hub] }; // Using $in to match arrays
    }
    
    const packing = await Packing.find(filter);
        
    res.status(200).json({ 
      success: true, 
      data: packing 
    });
  } catch (error) {
    console.error("Error in getAllPacking:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server Error",
      error: error.message 
    });
  }
};

// ✅ Get packing data by specific hub (alternative endpoint)
exports.getPackingByHub = async (req, res) => {
  try {
    const { hub } = req.params; // Get hub from route parameters
    
    if (!hub) {
      return res.status(400).json({ 
        success: false, 
        message: "Hub parameter is required" 
      });
    }

       // Fix hub data if it's nested
    if (packingData.hub && Array.isArray(packingData.hub) && packingData.hub.length > 0) {
      if (Array.isArray(packingData.hub[0])) {
        packingData.hub = packingData.hub[0]; // Extract the inner array
      }
    }
    
    console.log("Fetching packing data for hub:", hub);
    
    const packing = await Packing.find({ 
      hub: { $in: [hub] } 
    });
        
    res.status(200).json({ 
      success: true, 
      data: packing 
    });
  } catch (error) {
    console.error("Error in getPackingByHub:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server Error",
      error: error.message 
    });
  }
};

// ✅ Get unique hubs available in the system
exports.getAvailableHubs = async (req, res) => {
  try {
    const hubs = await Packing.distinct("hub");
    
    // Flatten the array of arrays and get unique values
    const uniqueHubs = [...new Set(hubs.flat())];
    
    res.status(200).json({ 
      success: true, 
      data: uniqueHubs 
    });
  } catch (error) {
    console.error("Error in getAvailableHubs:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server Error",
      error: error.message 
    });
  }
};





// // ✅ Get today's packing data with filters
// exports.getTodayPacking = async (req, res) => {
//   try {
//     const { hub, slot, category, name } = req.query;
    
//     // Get today's date range
//     const startOfDay = new Date();
//     startOfDay.setHours(0, 0, 0, 0);
//     const endOfDay = new Date();
//     endOfDay.setHours(23, 59, 59, 999);

//     // Build filter for today's data
//     let filter = {
//       createdAt: { 
//         $gte: startOfDay, 
//         $lte: endOfDay 
//       }
//     };

//     // Add hub filter if provided
//     if (hub && hub !== 'all') {
//       filter.hub = { $in: [hub] };
//     }

//     // Add slot filter if provided
//     if (slot && slot !== 'all') {
//       filter.slot = slot;
//     }

//     // Add category filter if provided
//     if (category && category !== 'all') {
//       filter.category = category;
//     }

//     // Add name filter if provided
//     if (name && name !== 'all') {
//       filter.name = { $regex: name, $options: 'i' }; // Case-insensitive search
//     }

//     console.log('Fetching today\'s packing with filter:', JSON.stringify(filter, null, 2));

//     // Fetch packing data
//     const packingData = await Packing.find(filter)
//       .sort({ 
//         hub: 1, 
//         slot: 1, 
//         name: 1 
//       });

//     // Calculate summary statistics
//     const summary = {
//       totalItems: packingData.length,
//       totalOrdered: packingData.reduce((sum, item) => sum + item.totalOrdered, 0),
//       totalPacked: packingData.reduce((sum, item) => sum + item.packed, 0),
//       fullyPacked: packingData.filter(item => item.isFullyPacked).length,
//       partiallyPacked: packingData.filter(item => item.isPacked && !item.isFullyPacked).length,
//       notPacked: packingData.filter(item => !item.isPacked).length
//     };

//     // Get unique values for filters
//     const uniqueHubs = [...new Set(packingData.flatMap(item => item.hub))];
//     const uniqueSlots = [...new Set(packingData.map(item => item.slot))];
//     const uniqueCategories = [...new Set(packingData.map(item => item.category).filter(Boolean))];

//     res.status(200).json({
//       success: true,
//       message: `Found ${packingData.length} packing items for today`,
//       data: {
//         summary,
//         filters: {
//           hubs: uniqueHubs,
//           slots: uniqueSlots,
//           categories: uniqueCategories
//         },
//         packingData
//       }
//     });

//   } catch (error) {
//     console.error('Error in getTodayPacking:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch today\'s packing data',
//       error: error.message
//     });
//   }
// };

// // ✅ Get today's packing data grouped by item name (for summary view)
// exports.getTodayPackingGrouped = async (req, res) => {
//   try {
//     const { hub, slot } = req.query;
    
//     // Get today's date range
//     const startOfDay = new Date();
//     startOfDay.setHours(0, 0, 0, 0);
//     const endOfDay = new Date();
//     endOfDay.setHours(23, 59, 59, 999);

//     // Build filter for today's data
//     let filter = {
//       createdAt: { 
//         $gte: startOfDay, 
//         $lte: endOfDay 
//       }
//     };

//     // Add hub filter if provided
//     if (hub && hub !== 'all') {
//       filter.hub = { $in: [hub] };
//     }

//     // Add slot filter if provided
//     if (slot && slot !== 'all') {
//       filter.slot = slot;
//     }

//     // Fetch packing data
//     const packingData = await Packing.find(filter);

//     // Group by item name, hub, and slot
//     const groupedData = packingData.reduce((acc, item) => {
//       const key = `${item.name}-${item.hub[0]}-${item.slot}`;
      
//       if (!acc[key]) {
//         acc[key] = {
//           name: item.name,
//           category: item.category,
//           categoryName: item.categoryName,
//           unit: item.unit,
//           hub: item.hub,
//           slot: item.slot,
//           totalOrdered: 0,
//           totalPacked: 0,
//           individualItems: [],
//           orders: []
//         };
//       }

//       acc[key].totalOrdered += item.totalOrdered;
//       acc[key].totalPacked += item.packed;
//       acc[key].individualItems.push({
//         _id: item._id,
//         isPacked: item.isPacked,
//         packed: item.packed,
//         itemSequence: item.itemSequence,
//         totalItemsInOrder: item.totalItemsInOrder,
//         originalOrderId: item.originalOrderId
//       });

//       // Merge orders (avoid duplicates)
//       item.orders.forEach(order => {
//         const orderExists = acc[key].orders.some(o => 
//           o.id === order.id && o.itemIndex === order.itemIndex
//         );
//         if (!orderExists) {
//           acc[key].orders.push(order);
//         }
//       });

//       return acc;
//     }, {});

//     // Convert to array and calculate status
//     const groupedArray = Object.values(groupedData).map(group => ({
//       ...group,
//       isPacked: group.totalPacked > 0,
//       isFullyPacked: group.totalPacked === group.totalOrdered,
//       remaining: group.totalOrdered - group.totalPacked
//     }));

//     // Sort by hub -> slot -> name
//     groupedArray.sort((a, b) => {
//       if (a.hub[0] !== b.hub[0]) return a.hub[0].localeCompare(b.hub[0]);
//       if (a.slot !== b.slot) return a.slot.localeCompare(b.slot);
//       return a.name.localeCompare(b.name);
//     });

//     // Calculate summary
//     const summary = {
//       totalGroups: groupedArray.length,
//       totalOrdered: groupedArray.reduce((sum, group) => sum + group.totalOrdered, 0),
//       totalPacked: groupedArray.reduce((sum, group) => sum + group.totalPacked, 0),
//       fullyPackedGroups: groupedArray.filter(group => group.isFullyPacked).length,
//       partiallyPackedGroups: groupedArray.filter(group => group.isPacked && !group.isFullyPacked).length,
//       notPackedGroups: groupedArray.filter(group => !group.isPacked).length
//     };

//     res.status(200).json({
//       success: true,
//       message: `Found ${groupedArray.length} grouped items for today`,
//       data: {
//         summary,
//         groupedData: groupedArray
//       }
//     });

//   } catch (error) {
//     console.error('Error in getTodayPackingGrouped:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch today\'s grouped packing data',
//       error: error.message
//     });
//   }
// };

// // ✅ Get today's packing statistics (for dashboard)
// exports.getTodayPackingStats = async (req, res) => {
//   try {
//     const { hub } = req.query;
    
//     // Get today's date range
//     const startOfDay = new Date();
//     startOfDay.setHours(0, 0, 0, 0);
//     const endOfDay = new Date();
//     endOfDay.setHours(23, 59, 59, 999);

//     // Build filter for today's data
//     let filter = {
//       createdAt: { 
//         $gte: startOfDay, 
//         $lte: endOfDay 
//       }
//     };

//     // Add hub filter if provided
//     if (hub && hub !== 'all') {
//       filter.hub = { $in: [hub] };
//     }

//     // Get all packing data for today
//     const packingData = await Packing.find(filter);

//     // Calculate detailed statistics
//     const stats = {
//       totalItems: packingData.length,
//       totalOrdered: packingData.reduce((sum, item) => sum + item.totalOrdered, 0),
//       totalPacked: packingData.reduce((sum, item) => sum + item.packed, 0),
//       packingEfficiency: 0,
//       byStatus: {
//         fullyPacked: packingData.filter(item => item.isFullyPacked).length,
//         partiallyPacked: packingData.filter(item => item.isPacked && !item.isFullyPacked).length,
//         notPacked: packingData.filter(item => !item.isPacked).length
//       },
//       byHub: {},
//       bySlot: {},
//       byCategory: {}
//     };

//     // Calculate packing efficiency
//     if (stats.totalOrdered > 0) {
//       stats.packingEfficiency = Math.round((stats.totalPacked / stats.totalOrdered) * 100);
//     }

//     // Group by hub
//     packingData.forEach(item => {
//       const hubName = item.hub[0] || 'Unknown';
//       if (!stats.byHub[hubName]) {
//         stats.byHub[hubName] = {
//           total: 0,
//           packed: 0,
//           ordered: 0
//         };
//       }
//       stats.byHub[hubName].total++;
//       stats.byHub[hubName].packed += item.packed;
//       stats.byHub[hubName].ordered += item.totalOrdered;
//     });

//     // Group by slot
//     packingData.forEach(item => {
//       const slot = item.slot || 'Unknown';
//       if (!stats.bySlot[slot]) {
//         stats.bySlot[slot] = {
//           total: 0,
//           packed: 0,
//           ordered: 0
//         };
//       }
//       stats.bySlot[slot].total++;
//       stats.bySlot[slot].packed += item.packed;
//       stats.bySlot[slot].ordered += item.totalOrdered;
//     });

//     // Group by category
//     packingData.forEach(item => {
//       const category = item.category || 'Unknown';
//       if (!stats.byCategory[category]) {
//         stats.byCategory[category] = {
//           total: 0,
//           packed: 0,
//           ordered: 0
//         };
//       }
//       stats.byCategory[category].total++;
//       stats.byCategory[category].packed += item.packed;
//       stats.byCategory[category].ordered += item.totalOrdered;
//     });

//     res.status(200).json({
//       success: true,
//       message: 'Today\'s packing statistics retrieved successfully',
//       data: stats
//     });

//   } catch (error) {
//     console.error('Error in getTodayPackingStats:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch today\'s packing statistics',
//       error: error.message
//     });
//   }
// };

// // ✅ Get individual packing items for a specific food item
// exports.getIndividualPackingItems = async (req, res) => {
//   try {
//     const { name, hub, slot } = req.query;
    
//     if (!name) {
//       return res.status(400).json({
//         success: false,
//         message: 'Item name is required'
//       });
//     }

//     // Get today's date range
//     const startOfDay = new Date();
//     startOfDay.setHours(0, 0, 0, 0);
//     const endOfDay = new Date();
//     endOfDay.setHours(23, 59, 59, 999);

//     // Build filter
//     let filter = {
//       name: name,
//       createdAt: {
//         $gte: startOfDay,
//         $lte: endOfDay
//       }
//     };

//     // Add hub filter if provided
//     if (hub && hub !== 'all') {
//       filter.hub = { $in: [hub] };
//     }

//     // Add slot filter if provided
//     if (slot && slot !== 'all') {
//       filter.slot = slot;
//     }

//     const individualItems = await Packing.find(filter)
//       .sort({ itemSequence: 1 });

//     if (individualItems.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: `No individual packing items found for ${name}`
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: `Found ${individualItems.length} individual items for ${name}`,
//       data: individualItems
//     });

//   } catch (error) {
//     console.error('Error in getIndividualPackingItems:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch individual packing items',
//       error: error.message
//     });
//   }
// };













// ✅ Get today's packing data with filters (Updated with delivery location)
exports.getTodayPacking = async (req, res) => {
  try {
    const { hub, slot, category, name, deliveryLocation } = req.query;
    
    // Get today's date range
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Build filter for today's data
    let filter = {
      createdAt: { 
        $gte: startOfDay, 
        $lte: endOfDay 
      }
    };

    // Add hub filter if provided
    if (hub && hub !== 'all') {
      filter.hub = { $in: [hub] };
    }

    // Add slot filter if provided
    if (slot && slot !== 'all') {
      filter.slot = slot;
    }

    // Add category filter if provided
    if (category && category !== 'all') {
      filter.category = category;
    }

    // Add name filter if provided
    if (name && name !== 'all') {
      filter.name = { $regex: name, $options: 'i' };
    }

    // Add delivery location filter if provided
    if (deliveryLocation && deliveryLocation !== 'all') {
      filter.deliveryLocation = { $regex: deliveryLocation, $options: 'i' };
    }

    console.log('Fetching today\'s packing with filter:', JSON.stringify(filter, null, 2));

    // Fetch packing data
    const packingData = await Packing.find(filter)
      .sort({ 
        hub: 1, 
        slot: 1, 
        deliveryLocation: 1,
        name: 1 
      });

    // Calculate summary statistics
    const summary = {
      totalItems: packingData.length,
      totalOrdered: packingData.reduce((sum, item) => sum + item.totalOrdered, 0),
      totalPacked: packingData.reduce((sum, item) => sum + item.packed, 0),
      fullyPacked: packingData.filter(item => item.isFullyPacked).length,
      partiallyPacked: packingData.filter(item => item.isPacked && !item.isFullyPacked).length,
      notPacked: packingData.filter(item => !item.isPacked).length
    };

    // Get unique values for filters
    const uniqueHubs = [...new Set(packingData.flatMap(item => item.hub))];
    const uniqueSlots = [...new Set(packingData.map(item => item.slot))];
    const uniqueCategories = [...new Set(packingData.map(item => item.category).filter(Boolean))];
    const uniqueDeliveryLocations = [...new Set(packingData.map(item => item.deliveryLocation).filter(Boolean))];

    res.status(200).json({
      success: true,
      message: `Found ${packingData.length} packing items for today`,
      data: {
        summary,
        filters: {
          hubs: uniqueHubs,
          slots: uniqueSlots,
          categories: uniqueCategories,
          deliveryLocations: uniqueDeliveryLocations
        },
        packingData
      }
    });

  } catch (error) {
    console.error('Error in getTodayPacking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch today\'s packing data',
      error: error.message
    });
  }
};

// ✅ Get today's packing data grouped by item name (Updated with delivery location)
exports.getTodayPackingGrouped = async (req, res) => {
  try {
    const { hub, slot, deliveryLocation } = req.query;
    
    // Get today's date range
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Build filter for today's data
    let filter = {
      createdAt: { 
        $gte: startOfDay, 
        $lte: endOfDay 
      }
    };

    // Add hub filter if provided
    if (hub && hub !== 'all') {
      filter.hub = { $in: [hub] };
    }

    // Add slot filter if provided
    if (slot && slot !== 'all') {
      filter.slot = slot;
    }

    // Add delivery location filter if provided
    if (deliveryLocation && deliveryLocation !== 'all') {
      filter.deliveryLocation = { $regex: deliveryLocation, $options: 'i' };
    }

    // Fetch packing data
    const packingData = await Packing.find(filter);

    // Group by item name, hub, slot, and delivery location
    const groupedData = packingData.reduce((acc, item) => {
      const key = `${item.name}-${item.hub[0]}-${item.slot}-${item.deliveryLocation}`;
      
      if (!acc[key]) {
        acc[key] = {
          name: item.name,
          category: item.category,
          categoryName: item.categoryName,
          unit: item.unit,
          hub: item.hub,
          slot: item.slot,
          deliveryLocation: item.deliveryLocation, // Added delivery location
          totalOrdered: 0,
          totalPacked: 0,
          individualItems: [],
          orders: []
        };
      }

      acc[key].totalOrdered += item.totalOrdered;
      acc[key].totalPacked += item.packed;
      acc[key].individualItems.push({
        _id: item._id,
        isPacked: item.isPacked,
        packed: item.packed,
        itemSequence: item.itemSequence,
        totalItemsInOrder: item.totalItemsInOrder,
        originalOrderId: item.originalOrderId,
        deliveryLocation: item.deliveryLocation // Added to individual items
      });

      // Merge orders (avoid duplicates)
      item.orders.forEach(order => {
        const orderExists = acc[key].orders.some(o => 
          o.id === order.id && o.itemIndex === order.itemIndex
        );
        if (!orderExists) {
          acc[key].orders.push({
            ...order,
            deliveryLocation: item.deliveryLocation // Add delivery location to orders
          });
        }
      });

      return acc;
    }, {});

    // Convert to array and calculate status
    const groupedArray = Object.values(groupedData).map(group => ({
      ...group,
      isPacked: group.totalPacked > 0,
      isFullyPacked: group.totalPacked === group.totalOrdered,
      remaining: group.totalOrdered - group.totalPacked
    }));

    // Sort by hub -> slot -> delivery location -> name
    groupedArray.sort((a, b) => {
      if (a.hub[0] !== b.hub[0]) return a.hub[0].localeCompare(b.hub[0]);
      if (a.slot !== b.slot) return a.slot.localeCompare(b.slot);
      if (a.deliveryLocation !== b.deliveryLocation) return a.deliveryLocation.localeCompare(b.deliveryLocation);
      return a.name.localeCompare(b.name);
    });

    // Calculate summary
    const summary = {
      totalGroups: groupedArray.length,
      totalOrdered: groupedArray.reduce((sum, group) => sum + group.totalOrdered, 0),
      totalPacked: groupedArray.reduce((sum, group) => sum + group.totalPacked, 0),
      fullyPackedGroups: groupedArray.filter(group => group.isFullyPacked).length,
      partiallyPackedGroups: groupedArray.filter(group => group.isPacked && !group.isFullyPacked).length,
      notPackedGroups: groupedArray.filter(group => !group.isPacked).length
    };

    res.status(200).json({
      success: true,
      message: `Found ${groupedArray.length} grouped items for today`,
      data: {
        summary,
        groupedData: groupedArray
      }
    });

  } catch (error) {
    console.error('Error in getTodayPackingGrouped:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch today\'s grouped packing data',
      error: error.message
    });
  }
};

// ✅ Get today's packing statistics (Updated with delivery location)
exports.getTodayPackingStats = async (req, res) => {
  try {
    const { hub, deliveryLocation } = req.query;
    
    // Get today's date range
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Build filter for today's data
    let filter = {
      createdAt: { 
        $gte: startOfDay, 
        $lte: endOfDay 
      }
    };

    // Add hub filter if provided
    if (hub && hub !== 'all') {
      filter.hub = { $in: [hub] };
    }

    // Add delivery location filter if provided
    if (deliveryLocation && deliveryLocation !== 'all') {
      filter.deliveryLocation = { $regex: deliveryLocation, $options: 'i' };
    }

    // Get all packing data for today
    const packingData = await Packing.find(filter);

    // Calculate detailed statistics
    const stats = {
      totalItems: packingData.length,
      totalOrdered: packingData.reduce((sum, item) => sum + item.totalOrdered, 0),
      totalPacked: packingData.reduce((sum, item) => sum + item.packed, 0),
      packingEfficiency: 0,
      byStatus: {
        fullyPacked: packingData.filter(item => item.isFullyPacked).length,
        partiallyPacked: packingData.filter(item => item.isPacked && !item.isFullyPacked).length,
        notPacked: packingData.filter(item => !item.isPacked).length
      },
      byHub: {},
      bySlot: {},
      byCategory: {},
      byDeliveryLocation: {} // Added delivery location stats
    };

    // Calculate packing efficiency
    if (stats.totalOrdered > 0) {
      stats.packingEfficiency = Math.round((stats.totalPacked / stats.totalOrdered) * 100);
    }

    // Group by hub
    packingData.forEach(item => {
      const hubName = item.hub[0] || 'Unknown';
      if (!stats.byHub[hubName]) {
        stats.byHub[hubName] = {
          total: 0,
          packed: 0,
          ordered: 0
        };
      }
      stats.byHub[hubName].total++;
      stats.byHub[hubName].packed += item.packed;
      stats.byHub[hubName].ordered += item.totalOrdered;
    });

    // Group by slot
    packingData.forEach(item => {
      const slot = item.slot || 'Unknown';
      if (!stats.bySlot[slot]) {
        stats.bySlot[slot] = {
          total: 0,
          packed: 0,
          ordered: 0
        };
      }
      stats.bySlot[slot].total++;
      stats.bySlot[slot].packed += item.packed;
      stats.bySlot[slot].ordered += item.totalOrdered;
    });

    // Group by category
    packingData.forEach(item => {
      const category = item.category || 'Unknown';
      if (!stats.byCategory[category]) {
        stats.byCategory[category] = {
          total: 0,
          packed: 0,
          ordered: 0
        };
      }
      stats.byCategory[category].total++;
      stats.byCategory[category].packed += item.packed;
      stats.byCategory[category].ordered += item.totalOrdered;
    });

    // Group by delivery location
    packingData.forEach(item => {
      const location = item.deliveryLocation || 'Unknown Location';
      if (!stats.byDeliveryLocation[location]) {
        stats.byDeliveryLocation[location] = {
          total: 0,
          packed: 0,
          ordered: 0
        };
      }
      stats.byDeliveryLocation[location].total++;
      stats.byDeliveryLocation[location].packed += item.packed;
      stats.byDeliveryLocation[location].ordered += item.totalOrdered;
    });

    res.status(200).json({
      success: true,
      message: 'Today\'s packing statistics retrieved successfully',
      data: stats
    });

  } catch (error) {
    console.error('Error in getTodayPackingStats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch today\'s packing statistics',
      error: error.message
    });
  }
};

// ✅ Get individual packing items for a specific food item (Updated with delivery location)
exports.getIndividualPackingItems = async (req, res) => {
  try {
    const { name, hub, slot, deliveryLocation } = req.query;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Item name is required'
      });
    }

    // Get today's date range
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Build filter
    let filter = {
      name: name,
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    };

    // Add hub filter if provided
    if (hub && hub !== 'all') {
      filter.hub = { $in: [hub] };
    }

    // Add slot filter if provided
    if (slot && slot !== 'all') {
      filter.slot = slot;
    }

    // Add delivery location filter if provided
    if (deliveryLocation && deliveryLocation !== 'all') {
      filter.deliveryLocation = { $regex: deliveryLocation, $options: 'i' };
    }

    const individualItems = await Packing.find(filter)
      .sort({ deliveryLocation: 1, itemSequence: 1 });

    if (individualItems.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No individual packing items found for ${name}`
      });
    }

    res.status(200).json({
      success: true,
      message: `Found ${individualItems.length} individual items for ${name}`,
      data: individualItems
    });

  } catch (error) {
    console.error('Error in getIndividualPackingItems:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch individual packing items',
      error: error.message
    });
  }
};

// ✅ Update individual packed status (Updated to handle delivery location)
exports.updateIndividualPacked = async (req, res) => {
  try {
    const { packingId, isPacked, packed } = req.body;
    
    // First find the item to get current orders
    const existingItem = await Packing.findById(packingId);
    
    if (!existingItem) {
      return res.status(404).json({ 
        success: false, 
        message: "Packing item not found" 
      });
    }

    // Update both the main fields AND the orders array
    const updatedItem = await Packing.findByIdAndUpdate(
      packingId,
      { 
        isPacked: isPacked,
        packed: isPacked ? 1 : 0,
        isFullyPacked: isPacked,
        // Also update the isPacked status in the orders array
        $set: {
          "orders.0.isPacked": isPacked
        },
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ 
        success: false, 
        message: "Packing item not found" 
      });
    }

    console.log('Updated packing item:', {
      id: updatedItem._id,
      name: updatedItem.name,
      deliveryLocation: updatedItem.deliveryLocation, // Log delivery location
      packed: updatedItem.packed,
      isPacked: updatedItem.isPacked,
      orderIsPacked: updatedItem.orders[0]?.isPacked
    });

    // Emit socket event
    if (global.io) {
      global.io.emit("packingUpdated", updatedItem);
    }

    res.json({ 
      success: true, 
      message: "Item packing status updated",
      data: updatedItem 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: "Server error",
      error: error.message 
    });
  }
};