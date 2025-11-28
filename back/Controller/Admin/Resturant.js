
// API Endpoints
// Set Closure
const Closure=require("../../Model/Admin/Resturant");
class RestaurantCloser{
 async setClosure(req, res) {
    try {
      const { startDate, endDate, startTime, endTime } = req.body;
  
      // Validation
      if (!startDate || !endDate || !startTime || !endTime || !req.file) {
        return res.status(400).json({ error: 'All fields are required' });
      }
  
      // Validate date/time
      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = new Date(`${endDate}T${endTime}`);
      if (endDateTime <= startDateTime) {
        return res.status(400).json({ error: 'End date/time must be after start date/time' });
      }
      let banner
      if (req.files && req.files.length > 0) {
        let files = req.files
        for (let i = 0; i < files.length; i++) {
  
          if (files[i].fieldname.startsWith("Foodgallery")) {
            banner= await uploadFile2(files[i], "Banner");
          }
  
        }
      }else return res.status(400).json({error:"Please select your banner."})
  
      // Delete existing closure (only one closure at a time)
      await Closure.deleteMany({});
  
      // Save new closure
      const closure = new Closure({
        startDate,
        endDate,
        startTime,
        endTime,
        banner: banner,
      });
  
      await closure.save();
      res.status(200).json({ data: closure });
    } catch (error) {
      console.error('Error setting closure:', error);
      res.status(500).json({ error: error.message || 'Failed to set closure' });
    }
  };
  
  // Get Closure Details
 async getClosureDetails(req, res) {
    try {
      const closure = await Closure.findOne();
      if (!closure) {
        return res.status(404).json({ data: null });
      }
      res.status(200).json({ data: closure });
    } catch (error) {
      console.error('Error fetching closure:', error);
      res.status(500).json({ error: 'Failed to fetch closure details' });
    }
  };
  
  // Clear Closure
 async clearClosure(req, res) {
    try {
      await Closure.deleteMany({});
      res.status(200).json({ message: 'Closure cleared successfully' });
    } catch (error) {
      console.error('Error clearing closure:', error);
      res.status(500).json({ error: 'Failed to clear closure' });
    }
  };
}
module.exports=new RestaurantCloser()

