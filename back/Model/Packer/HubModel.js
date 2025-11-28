const mongoose = require('mongoose');

const hubSchema = new mongoose.Schema({
  hubId: { type: String, unique: true },
  hubName: { type: String, required: true, unique: true },
  locations: [{ type: String, required: true }],
  geometry: {
    type: mongoose.Schema.Types.Mixed, // Store GeoJSON Feature format
    default: null
  },
  createdAt: { type: Date, default: Date.now }
});

// Auto-generate hubId based on the highest existing hubId
hubSchema.pre('save', async function (next) {
  if (!this.hubId) {
    try {
      // Find the hub with the highest hubId
      const lastHub = await this.constructor.findOne({}, {}, { sort: { hubId: -1 } });
      
      let nextNumber = 1;
      if (lastHub && lastHub.hubId) {
        // Extract number from hubId (e.g., "HUB003" -> 3)
        const lastNumber = parseInt(lastHub.hubId.replace('HUB', ''));
        nextNumber = lastNumber + 1;
      }
      
      this.hubId = `HUB${String(nextNumber).padStart(3, '0')}`;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model('Hub', hubSchema);