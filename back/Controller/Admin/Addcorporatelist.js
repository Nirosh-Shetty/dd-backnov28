const { uploadFile2 } = require("../../Midleware/AWS");
const Addcorparatemodal = require("../../Model/Admin/Addcorparatelist");
const axios = require("axios");

class Addcorporate {
  async addcorporate(req, res) {
    let {
      Apartmentname,
      Address,
      pincode,

      // old fields removed
      // apartmentdelivaryprice,
      // approximatetime,

      // new fields added
      sequentialDeliveryPrice,
      sequentialDeliveryTime,
      expressDeliveryTime,
      expressDeliveryPrice,

      prefixcode,
      mobile,
      lunchSlots,
      dinnerSlots,
      deliverypoint,
      locationType,
    } = req.body;

    let logo = req.file ? await uploadFile2(req.file, "Corporate") : "";

    if (mobile?.trim()) {
      let checkMobileno = await Addcorparatemodal.findOne({ mobile: mobile });
      if (checkMobileno) {
        return res.status(400).json({ error: "Mobile Number already exist" });
      }
    }

    try {
      // Parse slots if they exist and are strings
      let parsedLunchSlots = [];
      let parsedDinnerSlots = [];

      if (lunchSlots) {
        try {
          parsedLunchSlots =
            typeof lunchSlots === "string"
              ? JSON.parse(lunchSlots)
              : lunchSlots;
        } catch (error) {
          console.log("Error parsing lunch slots:", error);
          parsedLunchSlots = [];
        }
      }

      if (dinnerSlots) {
        try {
          parsedDinnerSlots =
            typeof dinnerSlots === "string"
              ? JSON.parse(dinnerSlots)
              : dinnerSlots;
        } catch (error) {
          console.log("Error parsing dinner slots:", error);
          parsedDinnerSlots = [];
        }
      }

      let Newuser = new Addcorparatemodal({
        Apartmentname,
        Address,
        pincode,
        // old fields removed
        // apartmentdelivaryprice,
        // approximatetime: parseInt(approximatetime),

        // new fields added
        sequentialDeliveryPrice,
        sequentialDeliveryTime,
        expressDeliveryTime,
        expressDeliveryPrice,
        prefixcode,
        mobile,
        logo,
        lunchSlots: parsedLunchSlots,
        dinnerSlots: parsedDinnerSlots,
        deliverypoint,
        locationType,
      });

      if (
        !Apartmentname ||
        !Address ||
        !pincode ||
        // old validation removed
        // !apartmentdelivaryprice ||
        // !approximatetime ||
        // new validation (add as needed
        !sequentialDeliveryPrice ||
        !sequentialDeliveryTime ||
        !expressDeliveryPrice ||
        !expressDeliveryTime ||
        !prefixcode
      ) {
        return res.status(501).json({ error: "Please fill all fields" });
      } else {
        Newuser.save().then((data) => {
          return res
            .status(200)
            .json({ success: "Corporate Detail Added Successfully" });
        });
      }
    } catch (error) {
      console.log("error=======>", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async getcorporate(req, res) {
    try {
      let corporatedata = await Addcorparatemodal.find({});
      if (corporatedata) {
        return res.status(200).json({ corporatedata: corporatedata });
      } else {
        return res.status(500).json({ error: "something went wrong" });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async updatecorporatelist(req, res) {
    let {
      id,
      Address,
      Apartmentname,
      pincode,

      // old fields removed
      // apartmentdelivaryprice,
      // approximatetime,
      // new fields added
      sequentialDeliveryPrice,
      sequentialDeliveryTime,
      expressDeliveryTime,
      expressDeliveryPrice,
      prefixcode,
      status,
      mobile,
      lunchSlots,
      dinnerSlots,
      deliverypoint,
      locationType,
    } = req.body;
    console.log(req.body);

    let logo = req.file ? await uploadFile2(req.file, "Corporate") : "";
    console.log(logo, req.file);

    let obj = {};
    if (logo) obj["logo"] = logo;
    if (Address) obj["Address"] = Address;
    if (Apartmentname) obj["Apartmentname"] = Apartmentname;
    if (pincode) obj["pincode"] = pincode;

    // old fields removed
    // if (apartmentdelivaryprice)
    //   obj["apartmentdelivaryprice"] = apartmentdelivaryprice;
    // if (approximatetime) obj["approximatetime"] = parseInt(approximatetime);
    // new fields added
    if (sequentialDeliveryPrice)
      obj["sequentialDeliveryPrice"] = sequentialDeliveryPrice;
    if (sequentialDeliveryTime)
      obj["sequentialDeliveryTime"] = sequentialDeliveryTime;
    if (expressDeliveryPrice)
      obj["expressDeliveryPrice"] = expressDeliveryPrice;
    if (expressDeliveryTime) obj["expressDeliveryTime"] = expressDeliveryTime;

    if (prefixcode) obj["prefixcode"] = prefixcode;
    if (status) obj["status"] = status;
    if (deliverypoint) obj["deliverypoint"] = deliverypoint;
    if (locationType) obj["locationType"] = locationType;
    // Handle lunch slots
    if (lunchSlots) {
      try {
        obj["lunchSlots"] =
          typeof lunchSlots === "string" ? JSON.parse(lunchSlots) : lunchSlots;
      } catch (error) {
        console.log("Error parsing lunch slots:", error);
        obj["lunchSlots"] = [];
      }
    }

    // Handle dinner slots
    if (dinnerSlots) {
      try {
        obj["dinnerSlots"] =
          typeof dinnerSlots === "string"
            ? JSON.parse(dinnerSlots)
            : dinnerSlots;
      } catch (error) {
        console.log("Error parsing dinner slots:", error);
        obj["dinnerSlots"] = [];
      }
    }

    try {
      let data = await Addcorparatemodal.findByIdAndUpdate(
        { _id: id },
        { $set: obj },
        { new: true }
      );

      if (!data) return res.status(400).json({ error: "Data not found" });

      if (mobile && mobile != data.mobile) {
        let checkMobileno = await Addcorparatemodal.findOne({ mobile: mobile });
        if (checkMobileno) {
          return res.status(500).json({ error: "Mobile Number already exist" });
        }
        data.mobile = mobile;
        await data.save();
      }

      return res.status(200).json({ success: "Successfully Updated" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async deletecorporate(req, res) {
    try {
      const id = req.params.id;
      if (!id) {
        return res.status(200).json("Data Not Found...");
      }
      await Addcorparatemodal.deleteOne({ _id: id });
      return res.status(200).json({ success: "Deleted Sucessfully..." });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async corporateItemStatus(req, res) {
    const { id } = req.params; // Restaurant ID from URL params
    const { status } = req.query; // Status query parameter to determine action

    // Check if the status query parameter is valid
    if (status !== "block" && status !== "unblock") {
      return res
        .status(400)
        .json({ error: "Invalid status parameter. Use 'block' or 'unblock'." });
    }

    try {
      // Determine the new status for the restaurant
      const isBlocked = status === "block";

      // Update the specific restaurant's 'blocked' field
      const updatedRestaurant = await Addcorparatemodal.findByIdAndUpdate(
        id,
        { $set: { blocked: isBlocked } },
        { new: true, runValidators: true } // Return the updated document
      );

      if (!updatedRestaurant) {
        return res.status(404).json({ error: "Restaurant not found" });
      }

      return res.status(200).json({
        success: `Restaurant ${status}ed successfully`,
        data: updatedRestaurant,
      });
    } catch (error) {
      console.error(`Error ${status}ing restaurant:`, error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async sendOtpCorprate(req, res) {
    try {
      let { mobile } = req.body;
      if (!mobile) {
        return res.status(501).json({ error: "Please provide mobile number" });
      }
      let check = await Addcorparatemodal.findOne({ mobile: mobile });
      if (!check) {
        return res
          .status(501)
          .json({ error: "Your mobile number is not register" });
      }

      let otp = (Math.floor(Math.random() * 1000000) + 1000000)
        .toString()
        .substring(1);

      const payload = {
        apiKey:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NTJkNGI3ODU0MGZhN2FmOTQ1NzM5ZCIsIm5hbWUiOiJDSEVGIFNUVURJTyBJTk5PVkFUSU9OUyIsImFwcE5hbWUiOiJBaVNlbnN5IiwiY2xpZW50SWQiOiI2NzUyZDRiNzg1NDBmYTdhZjk0NTczOTciLCJhY3RpdmVQbGFuIjoiQkFTSUNfTU9OVEhMWSIsImlhdCI6MTczMzQ4MTY1NX0.HMTWJFXWW7I0KG8U24jYvY9CUMEEl0tP1W-2X18GnDI",
        campaignName: "otp_send",
        destination: `91${mobile}`,
        userName: "CHEF STUDIO INNOVATIONS",
        templateParams: [`${otp}`],
        source: "new-landing-page form",
        media: {},
        buttons: [
          {
            type: "button",
            sub_type: "url",
            index: 0,
            parameters: [
              {
                type: "text",
                text: `${otp}`,
              },
            ],
          },
        ],
        carouselCards: [],
        location: {},
        paramsFallbackValue: {
          FirstName: "user",
        },
      };

      axios
        .post("https://backend.aisensy.com/campaign/t1/api/v2", payload)
        .then(async (data) => {
          // If OTP not present, create a new record
          check.otp = otp;
          await check.save();
          return res
            .status(200)
            .json({ success: "OTP Successfully sent your whatsapp number" });
        })
        .catch((error) => {
          console.error(error);
          return res.status(500).json({ error: "Error sending OTP" });
        });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async otpVarificationCorprate(req, res) {
    try {
      let { mobile, otp } = req.body;
      if (!mobile || !otp) {
        return res
          .status(501)
          .json({ error: "Please provide mobile number and OTP" });
      }
      let check = await Addcorparatemodal.findOne({ mobile: mobile });
      if (!check) {
        return res
          .status(501)
          .json({ error: "Your mobile number is not register" });
      }
      // console.log(check, otp);

      if (check.otp === Number(otp)) {
        return res
          .status(200)
          .json({ success: "OTP verified successfully", check: check });
      } else {
        return res.status(501).json({ error: "Incorrect OTP" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

const Corporatecontroller = new Addcorporate();
module.exports = Corporatecontroller;
