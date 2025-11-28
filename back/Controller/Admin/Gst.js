const GstModel = require("../../Model/Admin/Gst");

class Gst {
  // post method
  async addGst(req, res) {
    try {
      let { Sgst, Cgst,TotalGst } = req.body;
      const newGst = new GstModel({
       Sgst, Cgst,TotalGst
      });
      newGst.save().then((data) => {
        return res.status(200).json({ success: "Data Added Successfully" });
      });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ msg: "Data Cannot be added" });
    }
  }
  // get method
  async getGst(req, res) {
    try {
      const gstgst = await GstModel.find({});
      if (gstgst) {
        return res.status(200).json({ gst: gstgst });
      }
    } catch (error) {
      console.log(error);
    }
  }
  //delete method
  async DeletedeGst(req, res) {
    try {
      const gstid = req.params.Id;
      await GstModel.deleteOne({ _id: gstid });
      return res.status(200).json({ success: "Deleted Successfully" });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ msg: "Cannot be Deleted" });
    }
  }
  //update method
  async editGst(req, res) {
     const gstid = req.params.id;
    // let file = req.files[0]?.filename;
    let obj = {};
    if (Sgst) {
      obj["Sgst"] = Sgst;
    }
    if (Cgst) {
      obj["Cgst"] = Cgst;
    }
        if (TotalGst) {
      obj["TotalGst"] = TotalGst;
    }

    try {
      let data = await GstModel.findByIdAndUpdate(
        { _id: gstid },
        { $set: obj },
        { new: true }
      );
      if (!data) return res.status(400).json({ error: "Data not found" });
      return res.status(200).json({ success: "Successfully Updated" });
    } catch (error) {
      console.log(error);
    }
  }
}


const GstController = new Gst();
module.exports = GstController;