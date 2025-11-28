const path = require("path");
const AddRestaurants = require("../../Model/Admin/Addproduct");
const HubMenuModel = require("../../Model/Admin/HubMenu");
const { uploadFile2 } = require("../../Midleware/AWS");
class AddRestaurantdata {
   async addFoodItem(req, res) {
    const {
      foodname,
      foodcategory,
      categoryName,
      menuCategory,
      fooddescription,
      foodprice,
      foodmealtype,
      recommended,
      approved,
      blocked,
      totalstock,
      Remainingstock,
      gst,
      discount,
      offerprice,
      totalprice,
      aggregatedPrice,
      unit,
      quantity,
      loaddate,
      loadtime,
      Priority
    } = req.body;

    let Foodgallery = [];

    // Check if files are uploaded and process them for Foodgallery
    if (req.files && req.files.length > 0) {
      let files = req.files
      for (let i = 0; i < files.length; i++) {

        if (files[i].fieldname.startsWith("Foodgallery")) {
          Foodgallery.push({ image2: await uploadFile2(files[i], "Product"), });
        }

      }
    }

    try {
      // parse incoming foodTags (if any) from multipart/form-data
      let parsedFoodTags = [];
      if (req.body.foodTags) {
        try {
          parsedFoodTags = typeof req.body.foodTags === 'string' ? JSON.parse(req.body.foodTags) : req.body.foodTags;
        } catch (e) {
          // if not JSON, try comma separated
          parsedFoodTags = String(req.body.foodTags).split(',').map(s => s.trim()).filter(Boolean);
        }
      }
      // Create new food item instance
      const foodItem = new AddRestaurants({
        foodname,
        foodcategory,
        categoryName,
        menuCategory,
        fooddescription,
        foodprice,
        foodmealtype,
        recommended,
        approved,
        blocked,
        totalstock,
        Remainingstock,
        gst,
        discount,
        offerprice,
        totalprice,
        aggregatedPrice,
        unit,
        quantity,
        loaddate,
        loadtime,
        Foodgallery,  // Add gallery images
        foodTags: parsedFoodTags,

      });

      // Save the new food item in the database
      const savedFoodItem = await foodItem.save();

      return res.status(200).json({
        message: "Food item added successfully!",
        data: savedFoodItem,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error adding food item",
        error: error.message,
      });
    }
  }

  async updateFoodItem(req, res) {
    try {
      const {
        foodname,
        foodcategory,
        categoryName,
        menuCategory,
        fooddescription,
        foodprice,
        foodmealtype,
        recommended,
        approved,
        blocked,
        totalstock,
        Remainingstock,
        gst,
        discount,
        offerprice,
        totalprice,
        aggregatedPrice,
        unit,
        quantity,
        loaddate,
        loadtime,
        userid,
        Priority
      } = req.body;
      if (!userid) {
        return res.status(400).json({ error: "User ID is required" });
      }

      // Object to hold update fields
      let obj = {};
      let Foodgallery = [];

      // Check if files are uploaded and process them for Foodgallery
      if (req.files && req.files.length > 0) {
        let files = req.files
        for (let i = 0; i < files.length; i++) {

          if (files[i].fieldname.startsWith("Foodgallery")) {
            Foodgallery.push({ image2: await uploadFile2(files[i], "Product"), });
          }

        }
      }

      if (Foodgallery.length > 0) {
        obj["Foodgallery"] = Foodgallery
      }
      // parse incoming foodTags
      if (req.body.foodTags) {
        try {
          const parsed = typeof req.body.foodTags === 'string' ? JSON.parse(req.body.foodTags) : req.body.foodTags;
          obj["foodTags"] = parsed;
        } catch (e) {
          obj["foodTags"] = String(req.body.foodTags).split(',').map(s => s.trim()).filter(Boolean);
        }
      }
      // Dynamically add fields to the update object if they are provided
      if (foodname) obj["foodname"] = foodname;
      if (foodcategory) obj["foodcategory"] = foodcategory;
      if (categoryName) obj["categoryName"] = categoryName;
      if (menuCategory) obj["menuCategory"] = menuCategory;
      if (fooddescription) obj["fooddescription"] = fooddescription;
      if (foodprice) obj["foodprice"] = foodprice;
      // if (aggregatedPrice) obj["aggregatedPrice"] = aggregatedPrice;
      if (foodmealtype) obj["foodmealtype"] = foodmealtype;
      if (typeof recommended !== "undefined") obj["recommended"] = recommended;
      if (typeof approved !== "undefined") obj["approved"] = approved;
      if (typeof blocked !== "undefined") obj["blocked"] = blocked;
      // if (totalstock !== undefined) obj["totalstock"] = totalstock;
      // if (Remainingstock !== undefined) obj["Remainingstock"] = Remainingstock;
      if (aggregatedPrice !== undefined) obj["aggregatedPrice"] = aggregatedPrice;
      if (gst !== undefined) obj["gst"] = gst;
      if (discount !== undefined) obj["discount"] = discount;
      if (offerprice !== undefined) obj["offerprice"] = offerprice;
      if (totalprice !== undefined) obj["totalprice"] = totalprice;
      if (unit) obj["unit"] = unit;
      if (quantity) obj["quantity"] = quantity;
      if (loaddate) obj["loaddate"] = loaddate;
      if (loadtime) obj["loadtime"] = loadtime;

      console.log(obj);


      // Find food item by ID and update
      let data = await AddRestaurants.findByIdAndUpdate(
        { _id: userid },
        { $set: obj },
        { new: true }
      );
      console.log("data", data);

      // If the food item is not found
      if (!data) {
        return res.status(400).json({ error: "Food item not found or update failed" });
      }

      // Return success response with the updated food item data
      return res.status(200).json({
        success: "Update successfully",
        userdata: data,
      });
    } catch (error) {
      console.log("Error updating food item:", error);
      return res.status(500).json({
        error: "Internal Server Error",
        details: error.message,
      });
    }
  }

  async makeSoldout(req, res) {
    try {
      let data = await AddRestaurants.updateMany({ $set: { Remainingstock: 0 } });
      return res.status(200).json({ success: "Successfully sold out" })

    } catch (error) {
      console.log(error);

    }
  }

  async getFoodItems(req, res) {
    try {
      const restaurant = await AddRestaurants.find({}).populate('foodTags', 'tagName tagColor').sort({ _id: -1 })

      if (!restaurant) {
        return res.status(404).json({ error: "Restaurant not found" });
      }

      return res.status(200).json({ success: "Food items retrieved successfully", data: restaurant });
    } catch (error) {
      console.error("Error retrieving food items:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  // async getFoodItemsUnBlocks(req, res) {
  //   try {
  //     const restaurant = await AddRestaurants.find({ blocked: false }).sort({ Priority: 1 })

  //     if (!restaurant) {
  //       return res.status(404).json({ error: "Restaurant not found" });
  //     }

  //     return res.status(200).json({ success: "Food items retrieved successfully", data: restaurant });
  //   } catch (error) {
  //     console.error("Error retrieving food items:", error);
  //     return res.status(500).json({ error: "Internal Server Error" });
  //   }
  // }
  //   async getFoodItemsUnBlocks(req, res) {
  //     try {
  //       const restaurant = await AddRestaurants.aggregate([
  //         { $match: { blocked: false } },
  //         {
  //           $addFields: {
  //             minLocationPriority: {
  //               $min: {
  //                 $map: {
  //                   input: "$locationPrice",
  //                   as: "location",
  //                   in: { $ifNull: ["$$location.Priority", 0] }
  //                 }
  //               }
  //             }
  //           }
  //         },
  //         { $sort: { minLocationPriority: 1 } },
  //         {
  //           $addFields: {
  //             locationPrice: {
  //               $sortArray: {
  //                 input: "$locationPrice",
  //                 sortBy: { Priority: 1 }
  //               }
  //             }
  //           }
  //         }
  //       ]);

  //       // if (!restaurant || restaurant.length === 0) {
  //       //   return res.status(404).json({ error: "Restaurant not found" });
  //       // }

  //       return res.status(200).json({ 
  //         success: "Food items retrieved successfully", 
  //         data: restaurant 
  //       });
  //     } catch (error) {
  //       console.error("Error retrieving food items:", error);
  //       return res.status(500).json({ error: "Internal Server Error" });
  //     }
  // }


  async getFoodItemsUnBlocks(req, res) {
    try {
      const restaurant = await AddRestaurants.aggregate([
        {
          $match: {
            blocked: false,
            locationPrice: { $exists: true, $ne: null, $not: { $size: 0 } }
          }
        },
        {
          $addFields: {
            minLocationPriority: {
              $min: {
                $map: {
                  input: "$locationPrice",
                  as: "location",
                  in: { $ifNull: ["$$location.Priority", 0] }
                }
              }
            }
          }
        },
        { $sort: { minLocationPriority: 1 } },
        {
          $addFields: {
            locationPrice: {
              $sortArray: {
                input: "$locationPrice",
                sortBy: { Priority: 1 }
              }
            }
          }
        }
      ]);

      // if (!restaurant || restaurant.length === 0) {
      //   return res.status(404).json({ error: "No restaurants found with location pricing" });
      // }

      // populate foodTags for aggregate result
      const FoodTagsModel = require("../../Model/Admin/foodTags");
      const tagMap = {};
      const allTags = await FoodTagsModel.find({});
      allTags.forEach(t => { tagMap[t._id.toString()] = { tagName: t.tagName, tagColor: t.tagColor, _id: t._id } });
      const restaurantWithTags = restaurant.map(r => {
        if (r.foodTags && Array.isArray(r.foodTags)) {
          r.foodTags = r.foodTags.map(ft => (typeof ft === 'object' ? ft : tagMap[String(ft)])).filter(Boolean);
        }
        return r;
      });

      return res.status(200).json({
        success: "Food items retrieved successfully",
        data: restaurantWithTags
      });
    } catch (error) {
      console.error("Error retrieving food items:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
  async deleteFoodItem(req, res) {
    try {
      const id = req.params.id;
      console.log("id", id);
      if (!id) {
        return res.status(200).json('Data Not Found...');
      }
      // Delete the product
      const deleteResult = await AddRestaurants.deleteOne({ _id: id });

      // Also remove any HubMenu entries that reference this product
      try {
        const hubMenuDelete = await HubMenuModel.deleteMany({ productId: id });
        console.log(`Deleted ${hubMenuDelete.deletedCount} HubMenu entries for product ${id}`);
      } catch (err) {
        console.error('Error deleting HubMenu entries for product:', err.message);
      }

      return res.status(200).json({ success: 'Deleted Sucessfully...' });
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  };
  // Delete a food item image
  async deleteFoodItemImage(req, res) {
    try {
      const { id, packid } = req.body;



      const deletegallery = await AddRestaurants.findByIdAndUpdate(
        { _id: packid },
        { $pull: { Foodgallery: { _id: id } } },
        { new: true }
      );
      if (deletegallery) {
        return res.status(200).json({ sucess: "Deleted Sucessfully", deletegallery: deletegallery });
      }
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  }
  async updateFoodItemImage(req, res) {
    try {
      const { galleryid, id } = req.body;
      let file = req.files ? req.files[0].filename : "";

      console.log("gggg", galleryid, id, file);
      let images = await AddRestaurants.findById(id);
      if (!images) {
        return res.status(400).json({ error: "Data not found" });
      }
      let perticulargallery = images?.Foodgallery?.id(galleryid);

      if (!perticulargallery) {
        return res.status(400).json({ error: "Image not found" });
      }
      if (file) {
        perticulargallery.image2 = file;
      }
      let updateimagedata = await images.save();
      return res.status(200).json({ msg: "Updated succcessfully", success: updateimagedata });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
  async addFoodItemnewImage(req, res) {
    try {
      const { restorentid } = req.body;
      let file = req.files[0]?.filename;
      let data = await AddRestaurants.findOneAndUpdate(
        { _id: restorentid },
        { $push: { Foodgallery: { image2: file } } }
      );
      if (data) {
        return res.status(200).json({ sucess: "Sucessfully Uploaded", updeteddata: data });
      } else {
        return res.status(400).json({ error: "Something went wrong" });
      }
    } catch (error) {
      return res.status(200).json({ error: "Internal Server Error" });
    }
  }
  async toggleFoodItemStatus(req, res) {
    const BlockId = req.params.id;
    try {
      const User = await AddRestaurants.findById({ _id: BlockId });
      if (User.blocked === false) {
        await AddRestaurants.findByIdAndUpdate(
          { _id: User._id },
          { $set: { blocked: true } },
          { new: true }
        );
        return res.status(200).json({ msg: " Unblocked " });
      } else {
        await AddRestaurants.findByIdAndUpdate(
          { _id: User._id },
          { $set: { blocked: false } },
          { new: true }
        );
        return res.status(200).json({ success: " Blocked" });
      }
    } catch (error) {
      console.log(error);
    }
  }

  async toggleFoodItemApproval(req, res) {
    const { id } = req.params; // Restaurant ID from URL params
    const { status } = req.query; // Status query parameter to determine action

    // Check if the status query parameter is valid
    if (status !== "approve" && status !== "disapprove") {
      return res.status(400).json({ error: "Invalid status parameter. Use 'approve' or 'disapprove'." });
    }

    try {
      // Determine the new approval status for the restaurant
      const isApproved = status === "approve";

      // Update the specific restaurant's 'approved' field
      const updatedRestaurant = await AddRestaurants.findByIdAndUpdate(
        id,
        { $set: { approved: isApproved } },
        { new: true, runValidators: true } // Return the updated document
      );

      if (!updatedRestaurant) {
        return res.status(404).json({ error: "Restaurant not found" });
      }

      return res.status(200).json({ success: `Restaurant ${status}d successfully`, data: updatedRestaurant });
    } catch (error) {
      console.error(`Error ${status}ing restaurant:`, error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }


  async updateFoodStocks(req, res) {
    try {
      const { data } = req.body;
      console.log("parsed", data)

      if (!data || !Array.isArray(data)) {
        return res.status(400).json({ error: "Invalid data format. Expecting an array." });
      }

      const bulkOps = data.map((item) => ({
        updateOne: {
          filter: { _id: item._id }, // Match by _id
          update: { $set: item }, // Update with the new data
        },
      }));

      // Execute the bulk write
      const result = await AddRestaurants.bulkWrite(bulkOps);

      return res.status(200).json({
        success: "Food stocks updated successfully",
        result, // Information about the operation
      });


    } catch (error) {
      console.log("Error updating food item:", error);
      return res.status(500).json({
        error: "Internal Server Error",
        details: error.message,
      });
    }
  }

  async addProductHubWise(req, res) {
    try {
      const { productId } = req.params;
      const {
        hubId,
        foodprice,
        totalstock,
        hubName,
        loccationAdreess,
        Remainingstock,
        Priority,
        offerprice,
        basePrice
      } = req.body;

      // Validate required fields
      if (!hubId || !hubName) {
        return res.status(400).json({
          success: false,
          message: 'hubId and hubName are required fields'
        });
      }

      // Find the food item
      const foodItem = await AddRestaurants.findById(productId);
      if (!foodItem) {
        return res.status(404).json({
          success: false,
          message: 'Food item not found'
        });
      }

      // Check if location already exists
      const existingLocation = foodItem.locationPrice.find(
        location => location.hubId === hubId
      );

      if (existingLocation) {
        return res.status(400).json({
          success: false,
          message: 'Location price already exists for this hub'
        });
      }

      // Add new location price
      const newLocationPrice = {
        hubId,
        foodprice: foodprice || 0,
        totalstock: totalstock || 0,
        hubName,
        loccationAdreess: loccationAdreess || [],
        Remainingstock: Remainingstock || 0,
        Priority: Priority || 0,
        offerprice: offerprice || 0,
        basePrice: basePrice || 0
      };

      foodItem.locationPrice.push(newLocationPrice);
      await foodItem.save();

      res.status(201).json({
        success: true,
        message: 'Location price added successfully',
        data: newLocationPrice
      });

    } catch (error) {
      console.error('Error adding location price:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
  async getProductHubPrudctByUsing(req, res) {
    const { productId } = req.params;

    const foodItem = await AddRestaurants.findById(productId);
    if (!foodItem) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Location prices retrieved successfully',
      data: foodItem.locationPrice
    });

  } catch(error) {
    console.error('Error fetching location prices:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }

  async getProductByHubId(req, res) {
    try {
      const { productId, hubId } = req.params;

      const foodItem = await AddRestaurants.findById(productId);
      if (!foodItem) {
        return res.status(404).json({
          success: false,
          message: 'Food item not found'
        });
      }

      const locationPrice = foodItem.locationPrice.find(
        location => location.hubId === hubId
      );

      if (!locationPrice) {
        return res.status(404).json({
          success: false,
          message: 'Location price not found for this hub'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Location price retrieved successfully',
        data: locationPrice
      });

    } catch (error) {
      console.error('Error fetching location price:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
  async updatepruducthub(req, res) {
    try {
      const { productId, hubId } = req.params;
      const updateData = req.body;

      const foodItem = await AddRestaurants.findById(productId);
      if (!foodItem) {
        return res.status(404).json({
          success: false,
          message: 'Food item not found'
        });
      }

      const locationIndex = foodItem.locationPrice.findIndex(
        location => location.hubId === hubId
      );

      if (locationIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Location price not found for this hub'
        });
      }

      // Update the location price with new data
      const currentLocation = foodItem.locationPrice[locationIndex];

      // Update only provided fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          currentLocation[key] = updateData[key];
        }
      });

      await foodItem.save();

      res.status(200).json({
        success: true,
        message: 'Location price updated successfully',
        data: currentLocation
      });

    } catch (error) {
      console.error('Error updating location price:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  async deleteHubPruduct(req, res) {
    try {
      const { productId, hubId } = req.params;

      const foodItem = await AddRestaurants.findById(productId);
      if (!foodItem) {
        return res.status(404).json({
          success: false,
          message: 'Food item not found'
        });
      }

      const locationIndex = foodItem.locationPrice.findIndex(
        location => location.hubId === hubId
      );

      if (locationIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Location price not found for this hub'
        });
      }

      // Remove the location price
      foodItem.locationPrice.splice(locationIndex, 1);
      await foodItem.save();

      res.status(200).json({
        success: true,
        message: 'Location price deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting location price:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

}

const Restocontroller = new AddRestaurantdata();
module.exports = Restocontroller;