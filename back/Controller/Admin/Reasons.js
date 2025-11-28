
const ReasonModel = require('../../Model/Admin/ReasonsModel');

exports.addDelayReason = async (req, res) => {
  try {
    const { reason ,reasonType} = req.body;
    if (!reason||!reasonType) return res.status(400).json({ message: 'Reason and type is required' });
    const delayReason = new ReasonModel({ reason ,reasonType});
    await delayReason.save();
    res.status(200).json({ message: 'Delay reason added successfully', delayReason });
  } catch (error) {
    res.status(500).json({ message: 'Error adding delay reason', error: error.message });
  }
};

exports.getDelayReasons = async (req, res) => {
  try {
    const reasons = await ReasonModel.find();
    res.status(200).json({ reasons });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching delay reasons', error: error.message });
  }
};

exports.updateDelayReason = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason ,reasonType} = req.body;
    if (!reason) return res.status(400).json({ message: 'Reason is required' });
    const delayReason = await ReasonModel.findByIdAndUpdate(id, { reason ,reasonType}, { new: true });
    if (!delayReason) return res.status(404).json({ message: 'Delay reason not found' });
    res.status(200).json({ message: 'Delay reason updated successfully', delayReason });
  } catch (error) {
    res.status(500).json({ message: 'Error updating delay reason', error: error.message });
  }
};

exports.deleteDelayReason = async (req, res) => {
  try {
    const { id } = req.params;
    const delayReason = await ReasonModel.findByIdAndDelete(id);
    if (!delayReason) return res.status(404).json({ message: 'Delay reason not found' });
    res.status(200).json({ message: 'Delay reason deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting delay reason', error: error.message });
  }
};
