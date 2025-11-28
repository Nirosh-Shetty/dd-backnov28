const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let Gst = new Schema(
  {
    Cgst: {
        type: Number,
    },
    Sgst: {
      type: Number,
    },
    TotalGst:{
        type:Number
    }
  
  },
  { timestamps: true }
);
const GstModel = mongoose.model("Gst", Gst);
module.exports = GstModel;
