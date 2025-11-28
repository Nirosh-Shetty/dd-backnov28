const { uploadFile2 } = require("../../Midleware/AWS");
const BannerModel = require("../../Model/Admin/HomeBanner");

class Banner {
  // post method
  async banner(req, res) {
    try {
      let { BannerImage, BannerText, BannerDesc} = req.body;
      let file = req.files?.length ? await uploadFile2(req.files[0],"Banner"):""

      const newbanner = new BannerModel({
        BannerText,
        BannerImage: file ||BannerImage,
        BannerDesc,
  
      });
      newbanner.save().then((data) => {
        return res.status(200).json({ success: "Data Added Successfully" });
      });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ msg: "Data Cannot be added" });
    }
  }
  // get method
  async getbanner(req, res) {
    try {
      const getbanner = await BannerModel.find({});
      if (getbanner) {
        return res.status(200).json({ getbanner: getbanner });
      }
    } catch (error) {
      console.log(error);
    }
  }
  //delete method
  async Deletebanner(req, res) {
    try {
      const deletebanner = req.params.Id;
      await BannerModel.deleteOne({ _id: deletebanner });
      return res.status(200).json({ success: "Deleted Successfully" });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ msg: "Cannot be Deleted" });
    }
  }
  //update method
  async editbanner(req, res) {
    let id=req.params.id;
    let { BannerImage, BannerText,BannerDesc } = req.body;
   let file = req.files?.length ? await uploadFile2(req.files[0],"Banner"):""
    let obj = {};
   
      obj["BannerText"] = BannerText;
  
    if(BannerImage){
      obj["BannerImage"] = BannerImage;
    }
    if (file) {
      obj["BannerImage"] = file;
    }
  

    obj["BannerDesc"] = BannerDesc;

    try {
      let data = await BannerModel.findByIdAndUpdate(
        { _id: id },
        { $set: obj },
        { new: true }
      );
      if (!data) return res.status(400).json({ error: "Data not found" });
      return res.status(200).json({ success: "Successfully Updated" });
    } catch (error) {
      console.log(error);
    }
  }

  async getBannerImages  (req, res) {
    try {
      const banners = await BannerModel.find({}, 'BannerImage').sort({ createdAt: -1 });
      const images = banners.map(banner => banner.BannerImage);
      res.status(200).json({ images });
    } catch (error) {
      console.error('Error fetching banner images:', error.message);
      res.status(500).json({ message: 'Error fetching banner images' });
    }
  };
}

const bannerController = new Banner();
module.exports = bannerController;
