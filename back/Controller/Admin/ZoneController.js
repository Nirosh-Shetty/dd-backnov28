const Zone = require("../../Model/Admin/Zone");
const Order = require("../../Model/Admin/Addorder");
const mongoose = require("mongoose");


// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

// Helper function to check if a point is inside a polygon (Ray casting algorithm)
function isPointInPolygon(point, polygon) {
  if (!polygon || polygon.length < 3) return false;
  
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng,
      yi = polygon[i].lat;
    const xj = polygon[j].lng,
      yj = polygon[j].lat;

    const intersect =
      yi > point.lng !== yj > point.lng &&
      point.lat < ((xj - xi) * (point.lng - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

// Save a new zone
exports.saveZone = async (req, res) => {
  try {
    const {
      name,
      paths,
      fillColor,
      strokeColor,
      fillOpacity,
      strokeOpacity,
      assignedRiders,
    } = req.body;

    if (!name || !paths || paths.length < 3) {
      return res.status(400).json({
        message: "Zone name and at least 3 polygon points are required",
      });
    }

    // Convert assignedRiders to ObjectIds if they're strings
    let riderIds = [];
    if (assignedRiders && Array.isArray(assignedRiders)) {
      riderIds = assignedRiders.map((id) => {
        if (mongoose.Types.ObjectId.isValid(id)) {
          return new mongoose.Types.ObjectId(id);
        }
        return null;
      }).filter(Boolean);
    }

    const zone = await Zone.create({
      name,
      paths,
      fillColor: fillColor || "#FF0000",
      strokeColor: strokeColor || "#FF0000",
      fillOpacity: fillOpacity || 0.35,
      strokeOpacity: strokeOpacity || 0.8,
      assignedRiders: riderIds,
    });

    res.status(201).json({
      message: "Zone saved successfully",
      zone: {
        id: zone._id,
        _id: zone._id,
        name: zone.name,
        paths: zone.paths,
        fillColor: zone.fillColor,
        strokeColor: zone.strokeColor,
        fillOpacity: zone.fillOpacity,
        strokeOpacity: zone.strokeOpacity,
        assignedRiders: zone.assignedRiders,
        createdAt: zone.createdAt,
      },
    });
  } catch (error) {
    console.error("Error saving zone:", error);
    res.status(500).json({
      message: "Failed to save zone",
      error: error.message,
    });
  }
};

// Get all zones
exports.getZones = async (req, res) => {
  try {
    const zones = await Zone.find({ isActive: true })
      .populate("assignedRiders", "name phone")
      .sort({ createdAt: -1 });

    const formattedZones = zones.map((zone) => ({
      id: zone._id,
      _id: zone._id,
      name: zone.name,
      paths: zone.paths,
      fillColor: zone.fillColor,
      strokeColor: zone.strokeColor,
      fillOpacity: zone.fillOpacity,
      strokeOpacity: zone.strokeOpacity,
      assignedRiders: zone.assignedRiders,
      createdAt: zone.createdAt,
    }));

    res.status(200).json(formattedZones);
  } catch (error) {
    console.error("Error fetching zones:", error);
    res.status(500).json({
      message: "Failed to fetch zones",
      error: error.message,
    });
  }
};

// Update a zone
exports.updateZone = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      paths,
      fillColor,
      strokeColor,
      fillOpacity,
      strokeOpacity,
      assignedRiders,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid zone ID" });
    }

    if (!name || !paths || paths.length < 3) {
      return res.status(400).json({
        message: "Zone name and at least 3 polygon points are required",
      });
    }

    // Convert assignedRiders to ObjectIds if they're strings
    let riderIds = [];
    if (assignedRiders && Array.isArray(assignedRiders)) {
      riderIds = assignedRiders.map((id) => {
        if (mongoose.Types.ObjectId.isValid(id)) {
          return new mongoose.Types.ObjectId(id);
        }
        return null;
      }).filter(Boolean);
    }

    const zone = await Zone.findByIdAndUpdate(
      id,
      {
        name,
        paths,
        fillColor: fillColor || "#FF0000",
        strokeColor: strokeColor || "#FF0000",
        fillOpacity: fillOpacity || 0.35,
        strokeOpacity: strokeOpacity || 0.8,
        assignedRiders: riderIds,
      },
      { new: true, runValidators: true }
    )
      .populate("assignedRiders", "name phone");

    if (!zone) {
      return res.status(404).json({ message: "Zone not found" });
    }

    res.status(200).json({
      message: "Zone updated successfully",
      zone: {
        id: zone._id,
        _id: zone._id,
        name: zone.name,
        paths: zone.paths,
        fillColor: zone.fillColor,
        strokeColor: zone.strokeColor,
        fillOpacity: zone.fillOpacity,
        strokeOpacity: zone.strokeOpacity,
        assignedRiders: zone.assignedRiders,
        createdAt: zone.createdAt,
        updatedAt: zone.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating zone:", error);
    res.status(500).json({
      message: "Failed to update zone",
      error: error.message,
    });
  }
};

// Get a single zone by ID
exports.getZoneById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid zone ID" });
    }

    const zone = await Zone.findById(id)
      .populate("assignedRiders", "name phone email hub vehicleType vehicleNumber status")
      .lean();

    if (!zone || !zone.isActive) {
      return res.status(404).json({ message: "Zone not found" });
    }

    res.status(200).json({
      id: zone._id,
      _id: zone._id,
      name: zone.name,
      paths: zone.paths,
      fillColor: zone.fillColor,
      strokeColor: zone.strokeColor,
      fillOpacity: zone.fillOpacity,
      strokeOpacity: zone.strokeOpacity,
      assignedRiders: zone.assignedRiders,
      createdAt: zone.createdAt,
      updatedAt: zone.updatedAt,
    });
  } catch (error) {
    console.error("Error fetching zone:", error);
    res.status(500).json({
      message: "Failed to fetch zone",
      error: error.message,
    });
  }
};

// Delete a zone
exports.deleteZone = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid zone ID" });
    }

    // Soft delete by setting isActive to false
    const zone = await Zone.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!zone) {
      return res.status(404).json({ message: "Zone not found" });
    }

    res.status(200).json({ message: "Zone deleted successfully" });
  } catch (error) {
    console.error("Error deleting zone:", error);
    res.status(500).json({
      message: "Failed to delete zone",
      error: error.message,
    });
  }
};



exports.getRiderOrders = async (req, res) => {
  try {
    const { riderId } = req.params;
    const { lat, lng } = req.query;

    if (!riderId) {
      return res.status(400).json({ message: "Rider ID is required" });
    }
    if (!lat || !lng) {
      return res.status(400).json({ message: "Rider location (lat,lng) is required" });
    }

    const riderLat = parseFloat(lat);
    const riderLng = parseFloat(lng);

    // ------------------------------
    // GET ZONES ASSIGNED TO RIDER
    // ------------------------------
    const zones = await Zone.find({
      assignedRiders: new mongoose.Types.ObjectId(riderId),
      isActive: true,
    });

    if (!zones.length) {
      return res.status(200).json({
        message: "No zones assigned to this rider",
        orders: [],
      });
    }

    // ------------------------------
    // INDIA DATE RANGE FIX (NO UTC BUG)
    // ------------------------------
    const now = new Date();
    const indiaOffset = 5.5 * 60 * 60 * 1000; // IST = +5:30
    const indiaTime = new Date(now.getTime() + indiaOffset);

    const y = indiaTime.getUTCFullYear();
    const m = indiaTime.getUTCMonth();
    const d = indiaTime.getUTCDate();

    const startOfDay = new Date(Date.UTC(y, m, d, 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(y, m, d, 23, 59, 59, 999));

    // ------------------------------
    // AUTO-CLOSE POLYGON
    // ------------------------------
    const normalizePolygon = (paths) => {
      const pts = paths.map(p => ({
        lat: parseFloat(p.lat),
        lng: parseFloat(p.lng),
      }));

      const first = pts[0];
      const last = pts[pts.length - 1];

      if (first.lat !== last.lat || first.lng !== last.lng) {
        pts.push({ lat: first.lat, lng: first.lng });
      }

      return pts;
    };

    zones.forEach(z => {
      z.formattedPaths = normalizePolygon(z.paths);
    });

    // ------------------------------
    // GET TODAY'S ORDERS
    // ------------------------------
    const allOrders = await Order.find({
      // createdAt: { $gte: startOfDay, $lte: endOfDay },
      coordinates: { $exists: true, $ne: null },
    })
      .populate("allProduct.foodItemId", "foodname")
      .populate("customerId", "name phone")
      .lean();

    // ------------------------------
    // CHECK POINT IN POLYGON
    // ------------------------------
    const isPointInPolygon = (point, polygon) => {
      let inside = false;

      for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].lng,
          yi = polygon[i].lat;
        const xj = polygon[j].lng,
          yj = polygon[j].lat;

        const intersect =
          yi > point.lat !== yj > point.lat &&
          point.lng <
          ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi;

        if (intersect) inside = !inside;
      }
      return inside;
    };

    // ------------------------------
    // FILTER ORDERS INSIDE ZONE
    // ------------------------------
    const assignedOrders = allOrders.filter(order => {
      if (!order.coordinates?.coordinates) return false;

      const [orderLng, orderLat] = order.coordinates.coordinates;
      const orderPoint = { lat: orderLat, lng: orderLng };

      return zones.some(zone =>
        isPointInPolygon(orderPoint, zone.formattedPaths)
      );
    });

    // ------------------------------
    // DISTANCE CALCULATION
    // ------------------------------
    const calculateDistance = (lat1, lng1, lat2, lng2) => {
      const R = 6371; // Earth radius in km
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLng = ((lng2 - lng1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) ** 2;

      return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
    };

    const ordersWithDistance = assignedOrders.map(order => {
      const [lng, lat] = order.coordinates.coordinates;

      const dist = calculateDistance(
        riderLat,
        riderLng,
        lat,
        lng
      );

      return {
        ...order,
        distance: dist,
        distanceFormatted: `${dist.toFixed(2)} km`,
      };
    });

    // Sort nearest first
    ordersWithDistance.sort((a, b) => a.distance - b.distance);

    // ------------------------------
    // SUCCESS RESPONSE
    // ------------------------------
    return res.status(200).json({
      message: "Orders fetched successfully",
      totalOrders: ordersWithDistance.length,
      orders: ordersWithDistance,
    });

  } catch (error) {
    console.error("Error fetching rider orders:", error);

    return res.status(500).json({
      message: "Failed to fetch rider orders",
      error: error.message,
    });
  }
};



