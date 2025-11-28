
const Bag = require('../../Model/Admin/BagModel');

exports.addBag = async (req, res) => {
  try {
    const { bagNo } = req.body;
    if (!bagNo) return res.status(400).json({ message: 'Bag number is required' });
    const bag = new Bag({ bagNo });
    await bag.save();
    res.status(200).json({ message: 'Bag added successfully', bag });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Bag number already exists' });
    } else {
      res.status(500).json({ message: 'Error adding bag', error: error.message });
    }
  }
};

exports.getBags = async (req, res) => {
  try {
    const bags = await Bag.find();
    res.status(200).json({ bags });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bags', error: error.message });
  }
};

exports.updateBag = async (req, res) => {
  try {
    const { id } = req.params;
    const { bagNo } = req.body;
    if (!bagNo) return res.status(400).json({ message: 'Bag number is required' });
    const bag = await Bag.findByIdAndUpdate(id, { bagNo }, { new: true });
    if (!bag) return res.status(404).json({ message: 'Bag not found' });
    res.status(200).json({ message: 'Bag updated successfully', bag });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Bag number already exists' });
    } else {
      res.status(500).json({ message: 'Error updating bag', error: error.message });
    }
  }
};

exports.deleteBag = async (req, res) => {
  try {
    const { id } = req.params;
    const bag = await Bag.findByIdAndDelete(id);
    if (!bag) return res.status(404).json({ message: 'Bag not found' });
    res.status(200).json({ message: 'Bag deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting bag', error: error.message });
  }
};
