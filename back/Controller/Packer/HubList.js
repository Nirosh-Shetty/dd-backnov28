const HubModel = require("../../Model/Packer/HubModel");
const HubMenuModel = require("../../Model/Admin/HubMenu");
const ProductModel = require('../../Model/Admin/Addproduct');
const pointInPolygon = require('point-in-polygon');

class Hub {
  async createHub(req, res) {
    try {
      const { hubName, locations, geometry } = req.body;
      // Input validation
      if (!hubName) return res.status(400).json({ error: "Please enter hub name" });

      // if (!Array.isArray(locations) || !locations.length) return res.status(400).json({ error: "Please select at least one location" });

      if (!geometry) return res.status(400).json({ error: "Please draw a service area polygon on the map" });

      // Check for existing hub
      const existingHub = await HubModel.findOne({ hubName });
      if (existingHub) return res.status(400).json({ error: "Hub name already exists" });

      // Create new hub with geometry
      const hub = new HubModel({ hubName, locations, geometry });
      await hub.save();
      res.status(201).json({ message: "Hub added successfully", hub });
    } catch (error) {
      console.log("error", error);

      res.status(400).json({ message: "Error adding hub", error: error.message });
    }
  }

  async updateHub(req, res) {
    try {
      const { hubId } = req.params;
      const { hubName, geometry } = req.body;

      // Input validation
      if (!hubId) return res.status(400).json({ error: "Hub ID is required" });
      if (!hubName) return res.status(400).json({ error: "Please enter hub name" });
      // if (!Array.isArray(locations) || !locations.length) return res.status(400).json({ error: "Please select at least one location" });

      // Find hub
      const hub = await HubModel.findOne({ hubId });
      if (!hub) return res.status(404).json({ error: "Hub not found" });
      // console.log("hubid",hubId);

      // Check for duplicate hub name
      const existingHub = await HubModel.findOne({ hubName, hubId: { $ne: hubId } });
      if (existingHub) return res.status(400).json({ error: "Hub name already exists" });

      // Update hub
      hub.hubName = hubName;
      // hub.locations = locations;
      // Update geometry if provided
      if (geometry) {
        hub.geometry = geometry;
      }
      await ProductModel.updateMany(
        { "locationPrice.hubId": hubId },
        {
          $set: {
            "locationPrice.$.hubName": hubName,
            "locationPrice.$.loccationAdreess": locations
          }
        }
      );
      await hub.save();
      res.status(200).json({ message: "Hub updated successfully", hub });
    } catch (error) {
      res.status(400).json({ message: "Error updating hub", error: error.message });
    }
  }

  async deleteHub(req, res) {
    try {
      const { hubId } = req.params;
      const hub = await HubModel.findOneAndDelete({ hubId });
      if (!hub) return res.status(404).json({ message: "Hub not found" });
      // console.log();

      // Remove hub references from products' locationPrice arrays
      const productUpdateResult = await ProductModel.updateMany(
        { "locationPrice.hubId": hubId },
        {
          $pull: {
            locationPrice: { hubId: hubId }
          }
        }
      );

      // Also delete any HubMenu entries that reference this hub (cascade delete)
      try {
        const hubMenuDeleteResult = await HubMenuModel.deleteMany({ hubId: hub._id });
        console.log(`Deleted ${hubMenuDeleteResult.deletedCount} HubMenu entries for hubId ${hubId}`);
      } catch (err) {
        console.error('Error deleting HubMenu entries for hub:', err.message);
      }

      console.log(`Removed hubId ${hubId} from ${productUpdateResult.modifiedCount} products`);
      res.status(200).json({ message: "Hub deleted successfully" });
    } catch (error) {
      res.status(400).json({ message: "Error deleting hub", error: error.message });
    }
  }

  async getAllHubs(req, res) {
    try {
      const hubs = await HubModel.find().sort({ createdAt: -1 });
      res.status(200).json(hubs);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  async validateLocation(req, res) {
    try {
      const { lat, lng } = req.body;

      // Input validation
      if (!lat || !lng) {
        return res.status(400).json({
          success: false,
          message: "Latitude and longitude are required",
          error: "Missing coordinates"
        });
      }

      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);

      // Validate coordinate ranges
      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({
          success: false,
          message: "Invalid coordinates",
          error: "Coordinates must be valid numbers"
        });
      }

      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        return res.status(400).json({
          success: false,
          message: "Coordinates out of valid range",
          error: "Latitude must be between -90 and 90, longitude must be between -180 and 180"
        });
      }

      // Get all hubs with geometry
      const hubs = await HubModel.find({ geometry: { $exists: true, $ne: null } });

      const servingHubs = [];

      // Check each hub's polygon to see if point is inside
      for (const hub of hubs) {
        if (!hub.geometry) continue;

        // Handle GeoJSON Feature format (most common from frontend)
        let geometry = null;
        if (hub.geometry.type === 'Feature' && hub.geometry.geometry) {
          geometry = hub.geometry.geometry;
        } else if (hub.geometry.type === 'Polygon' || hub.geometry.type === 'MultiPolygon') {
          // Direct geometry object
          geometry = hub.geometry;
        } else if (hub.geometry.geometry && (hub.geometry.geometry.type === 'Polygon' || hub.geometry.geometry.type === 'MultiPolygon')) {
          // Nested geometry
          geometry = hub.geometry.geometry;
        } else {
          continue; // Skip if geometry format is not recognized
        }

        const coordinates = geometry.coordinates;

        // Handle Polygon (single polygon)
        if (geometry.type === 'Polygon' && coordinates && coordinates.length > 0) {
          const polygon = coordinates[0]; // First ring is the outer boundary
          if (pointInPolygon([longitude, latitude], polygon)) {
            servingHubs.push({
                hub: hub._id,
              hubId: hub.hubId,
              hubName: hub.hubName,
              locations: hub.locations
            });
          }
        }
        // Handle MultiPolygon
        else if (geometry.type === 'MultiPolygon' && coordinates && coordinates.length > 0) {
          for (const polygon of coordinates) {
            if (polygon && polygon.length > 0 && this.isPointInPolygon([longitude, latitude], polygon[0])) {
              servingHubs.push({
                hub: hub._id,
                hubId: hub.hubId,
                hubName: hub.hubName,
                locations: hub.locations
              });
              break; // Point found in this multi-polygon, no need to check other polygons
            }
          }
        }
      }

      if (servingHubs.length > 0) {
        return res.status(200).json({
          success: true,
          message: "Location is serviceable",
          serviceable: true,
          hubs: servingHubs
        });
      } else {
        return res.status(200).json({
          success: true,
          message: "Location is not serviceable",
          serviceable: false,
          hubs: []
        });
      }
    } catch (error) {
      console.error("Location validation error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during location validation",
        error: error.message
      });
    }
  }

  // Point-in-polygon algorithm (Ray casting algorithm)
  // isPointInPolygon(point, polygon) {
  //   const [x, y] = point;
  //   let inside = false;

  //   for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
  //     const [xi, yi] = polygon[i];
  //     const [xj, yj] = polygon[j];

  //     const intersect = ((yi > y) !== (yj > y)) && 
  //                      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
  //     if (intersect) inside = !inside;
  //   }

  //   return inside;
  // }
}

// Move outside the class as a standalone function
function isPointInPolygon(point, polygon) {
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];

    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }

  return inside;
}

module.exports = new Hub();