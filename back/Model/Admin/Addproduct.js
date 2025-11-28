const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

const AddRestaurants = new Schema(
  {
    foodname: {
      type: String,
    },
    foodcategory: {
      type: String,
    },
     categoryName:{
       type: String,
    },
      menuCategory:{
       type: String,
    },
    fooddescription: {
      type: String,
    },
    foodprice: {
      type: String,
    },
    foodTags: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "FoodTags"
    }],
    foodmealtype: {
      type: String,
    },
    recommended: {
      type: Boolean,
      default: false,
    },
    approved: {
      type: Boolean,
      default: false,
    },
    blocked: {
      type: Boolean,
      default: false,
    },
    // TODO:// need to remove totalstock and Remaining stock from here
    totalstock: {
      type: Number,
    },
    Remainingstock: {
      type: Number,
    },
    Priority:{
     type: Number, 
     default:0
    },
    Foodgallery: [
      {
        image2: {
          type: String,
        },
      },
    ],
    Status: {
        type: String,
          },
    gst: {
      type: Number,
    },
    discount: {
      type: Number,
    },

    offerprice: {
      type: Number,
    },
      aggregatedPrice: {
      type: Number,
    },
    totalprice: {
      type: Number,
    },
    unit: {
      type: String,
    },
    quantity: {
      type: String,
    },
    loaddate: {
      type: String,
    },
    loadtime: {
      type: String,
    },
    locationPrice:[{
      hubId:{
        type:String,
      },
      foodprice:{
        type:Number,
        default:0
      },
      totalstock:{
        type:Number,
        default:0
      },
      hubName:{
        type:String,
      },
      loccationAdreess:[],
      Remainingstock:{
        type:Number,
        default:0
      },
      Priority:{
        type: Number, 
        default:0
       },
       offerprice: {
        type: Number,
      },
      basePrice:{
        type: Number,
        default:0
      }
      
    }]

  },
  { timestamps: true }
);

const AddRestaurantsmodel = mongoose.model("Fooditem", AddRestaurants);
module.exports = AddRestaurantsmodel;