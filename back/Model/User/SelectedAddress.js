const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SelectedAdress = new Schema(
  {
   
    Name:{
      type: String,  
    },

    Number: {
      type: Number,
    },
    fletNumber: {
      type: String,
    },
    ApartmentName: {
      type: String,
    },
    addressid:{
      type:String  
    },
    addresstype:{
      type:String
    },
 towerName:{
     type:String
 },
     userId: {
      type: String,
    },
    isSelected:{
        type:Boolean,
        default:true
    }
  },
  { timestamps: true }
);
const EnquiryModal = mongoose.model("selectedaddress", SelectedAdress);
module.exports = EnquiryModal;
