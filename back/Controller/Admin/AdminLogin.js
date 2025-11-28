const RegistrationModel = require("../../Model/Admin/AdminLogin");

class Registration {
async Registration(req, res) {
    let { REmail, RPassword } = req.body;

    try {
        // Validate input
        if (!REmail || !RPassword) {
            return res.status(400).json({ msg: "Please enter your email and password." });
        }

        // Create a new registration instance
        const newRegistration = new RegistrationModel({ REmail, RPassword });

        // Save to database
        const savedData = await newRegistration.save();
        return res.status(200).json({ success: true, data: savedData });

    } catch (error) {
        console.error("Error during registration:", error);
        return res.status(500).json({ msg: "Something went wrong." });
    }
}


  async adminLogin(req, res) {
    try {
      let { REmail, RPassword } = req.body;
      if (!REmail || !RPassword) {
        return res.status(400).json({ error: "Please fill all the field" });
      }
      const isAdminPresent = await RegistrationModel.findOne({
        REmail: REmail,
      });
      if (!isAdminPresent) {
        return res.status(400).json({ error: "Your Email Is Not register" });
      }


      if (RPassword!==isAdminPresent.RPassword) {
        return res.status(400).json({ error: "Password is In-Correct.." });
      }

      return res.status(200).json({
        success: "Admin Login Successfully",
        adminlogin: isAdminPresent,
      });
    } catch (error) {
      console.error(error);
    }
  }
}
const RegistrationController = new Registration();
module.exports = RegistrationController;
