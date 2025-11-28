const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let RegistrationSchema = new Schema(
  {
    REmail: {
      type: String,
      required: true, // Optional: ensure an email is provided
    },
    RPassword: {
      type: String,
      required: true, // Optional: ensure a password is provided
    },
  },
  { timestamps: true }
);

const RegistrationModel = mongoose.model("Registration", RegistrationSchema);
module.exports = RegistrationModel;
