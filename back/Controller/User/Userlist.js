const CustomerModel = require("../../Model/User/Userlist");
const OrderModel = require("../../Model/Admin/Addorder");
const WalletModel = require("../../Model/User/Wallet");
// const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const randomstring = require("randomstring");
const mongoose = require("mongoose");
const otpModel = require("../../Model/User/Otp");
const cron = require("node-cron");
const walletController = require("./Wallet");
const ReferralSettings = require("../../Model/Admin/ReferralSettingsModel");
const SelectAddressModel = require("../../Model/User/SelectedAddress");
const phonepayModel = require("../../Model/User/phonepay");
const { default: axios } = require("axios");
const { uploadFile2 } = require("../../Midleware/AWS");
const HubMenuModel = require("../../Model/Admin/HubMenu");
const AddproductModel = require("../../Model/Admin/Addproduct");
class Customer {
  async loginWithOtp(req, res) {
    const { Mobile } = req.body;

    try {
      // Check if the mobile number is already registered

      // Generate OTP
      console.log("mobilee", Mobile);
      let otp = (Math.floor(Math.random() * 1000000) + 1000000)
        .toString()
        .substring(1);

      // Checking if the OTP is already present in the DB or not.
      const existingOtp = await otpModel.findOne({ Mobile: Mobile });

      const key = "Ae97f7ad9d6c2647071d78b6e94a3c87e";
      const sid = "RDABST";
      const to = Mobile;
      const body = `Hi, Your OTP  is ${otp}. Regards, Team DailyDish`;

      const payload = {
        apiKey:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NTJkNGI3ODU0MGZhN2FmOTQ1NzM5ZCIsIm5hbWUiOiJDSEVGIFNUVURJTyBJTk5PVkFUSU9OUyIsImFwcE5hbWUiOiJBaVNlbnN5IiwiY2xpZW50SWQiOiI2NzUyZDRiNzg1NDBmYTdhZjk0NTczOTciLCJhY3RpdmVQbGFuIjoiQkFTSUNfTU9OVEhMWSIsImlhdCI6MTczMzQ4MTY1NX0.HMTWJFXWW7I0KG8U24jYvY9CUMEEl0tP1W-2X18GnDI",
        campaignName: "otp_send",
        destination: `91${Mobile}`,
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
          if (!existingOtp) {
            let newOtp = new otpModel({
              Mobile,
              otp,
            });

            newOtp
              .save()
              .then((data) => {
                return res.status(200).json({
                  success: `OTP sent: ${data.otp}`,
                  message: "Login successful, OTP sent",
                });
              })
              .catch((error) => {
                return res.status(402).json({ error: "Error saving OTP" });
              });
          } else {
            // Update the existing OTP
            await otpModel.findOneAndUpdate(
              { Mobile: Mobile },
              { $set: { otp: otp } },
              { new: true }
            );

            return res.status(200).json({
              success: "OTP sent successfully",
              message: "Login successful, OTP sent",
            });
          }
        })
        .catch((error) => {
          console.error(error);
          return res.status(500).json({ error: "Error sending OTP" });
        });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // OTP Varification==========================
  async otpVarification(req, res) {
    const { Mobile, otp, Fname, referralCode } = req.body;
    console.log("OTP Verification for:", Mobile, "Ref Code:", referralCode);

    try {
      const varify = await otpModel.findOne({ Mobile, otp });
      if (!varify) {
        return res.status(401).json({ error: "Otp is invalid!" });
      }

      let user = await CustomerModel.findOne({ Mobile });
      let isNewUser = false;

      if (!user) {
        isNewUser = true;
        const newUniqueCode = await generateUniqueReferralCode();
        const newUserPayload = {
          Mobile,
          Fname,
          referral: null,
          acquisition_channel: "organic",
          referralCode: newUniqueCode,
        };

        if (referralCode) {
          const referrer = await CustomerModel.findOne({
            referralCode: referralCode,
          });
          if (referrer) {
            newUserPayload.referral = {
              referredBy: referrer._id,
              status: "pending",
              successDate: null,
            };
            newUserPayload.acquisition_channel = "refer";
            console.log(
              `New user ${Mobile} has a pending referral from ${referralCode}.`
            );
          } else {
            console.warn(`Referrer ${referralCode} not found.`);
          }
        }

        user = await CustomerModel.create(newUserPayload);
        await walletController.initializeWallet(user._id);

        // Give FRIEND Bonus after ensuring wallet is created
        if (user.referral) {
          try {
            // 1. Get settings with default values
            const settings = await ReferralSettings.findOne();
            const friendReward = settings?.friendRewardAmount || 25; // Default to 25 if not set

            // 2. Find friend's wallet - wait for it to be created
            const friendWallet = await WalletModel.findOne({
              userId: user._id,
            });

            if (friendWallet) {
              // 3. Add reward to friend's wallet
              friendWallet.balance += friendReward;
              friendWallet.transactions.push({
                amount: friendReward,
                type: "credit",
                description: "Welcome referral bonus!",
                createdAt: new Date(),
              });
              await friendWallet.save();
              console.log(
                `Credited ₹${friendReward} welcome bonus to friend ${user._id}`
              );

              // 4. Update settings with atomic operation
              await ReferralSettings.findOneAndUpdate(
                {},
                {
                  $inc: { totalFriendPayout: friendReward },
                },
                { upsert: true }
              );

              console.log(`Updated total friend payout with ₹${friendReward}`);
            } else {
              console.error("Friend wallet not found after initialization");
            }
          } catch (err) {
            console.error("Error applying friend reward:", err);
          }
        }
      } else {
        if (Fname && !user.Fname) {
          user.Fname = Fname;
          await user.save();
        }
        if (!user.referralCode) {
          user.referralCode = await generateUniqueReferralCode();
          console.log(user.referralCode, " generated for user ");

          await user.save();
        }
      }

      if (user.BlockCustomer === false) {
        return res
          .status(400)
          .json({ error: "Your Account Is Blocked! Please Contact Admin" });
      }

      return res
        .status(200)
        .json({ success: "OTP verified...", details: user });
    } catch (error) {
      console.error("Error during OTP verification:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async AddCustomer(req, res) {
    try {
      let {
        Fname,
        Mobile,
        Address,
        Flatno,
        companyId,
        companyName,
        status,
        employeeId,
        subsidyAmount,
      } = req.body;

      const checkMobileno = await CustomerModel.findOne({ Mobile: Mobile });
      if (checkMobileno) {
        return res.status(302).json({ message: "User already Exist" });
      }

      const Adddata = new CustomerModel({
        Fname,
        Mobile,
        Address,
        Flatno,
        // ApartmentId
        companyId,
        employeeId,
        subsidyAmount,
        companyName,
        status: status || "Normal",
      });
      const savedCustomer = await Adddata.save();
      if (status === "Employee") {
        const wallet = new WalletModel({
          userId: savedCustomer._id,
          companyId,
          balance: subsidyAmount,
          transactions: [
            {
              amount: subsidyAmount,
              type: "credit",
              description: "Initial employee subsidy",
              expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
              isFreeCash: true,
            },
          ],
        });
        await wallet.save();
      }
      return res.status(200).json({
        success: "Register Successfully..!",
        details: savedCustomer,
      });
    } catch (error) {
      console.log("ffhdfdff", error);
      return res
        .status(401)
        .json({ error: "Registration Unsuccessfull", error });
    }
  }

  async loginCustomer(req, res) {
    let { Email, Password, token } = req.body;

    try {
      if (!Email || !Password) {
        return res.status(400).json({ error: "Please fill all the field" });
      }

      let isUserPresent = await CustomerModel.findOne({
        Email: Email,
      }).populate("ApartmentId");
      if (!isUserPresent) {
        return res
          .status(400)
          .json({ error: "Please Enter Registered Email Id..." });
      }

      const isCorrectPassword = await compare(Password, isUserPresent.Password);

      if (!isCorrectPassword) {
        return res
          .status(400)
          .json({ error: "Authentication is failed!!! password is wrong" });
      }

      if (isUserPresent.BlockCustomer === false) {
        return res.status(400).json({
          error: "Authentication is failed!!! Your Account is Blocked by Admin",
        });
      }
      isUserPresent.token = token;
      isUserPresent = await isUserPresent.save();

      return res
        .status(200)
        .json({ success: "Login Successfully...", details: isUserPresent });
    } catch (error) {
      console.error(error);
    }
  }

  async sendMail(req, res) {
    try {
      let { Email } = req.body;
      const isUserPresent = await CustomerModel.findOne({ Email: Email });
      if (!isUserPresent) {
        return res
          .status(400)
          .json({ error: "Please Enter Registered Email Id..." });
      }
      // Create a transporter
      const transporter = nodemailer.createTransport({
        service: "gmail", // Replace with your email service provider
        auth: {
          user: "amitparnets@gmail.com", // Replace with your email
          pass: "yzbzpllsthbvrdal", // Replace with your password or app-specific password
        },
        port: 465,
        host: "gsmtp.gmail.com",
      });

      // Generate a random OTP
      const otp = randomstring.generate({
        length: 6,
        charset: "numeric",
      });

      // Save the OTP to the user document in MongoDB
      isUserPresent.otp = otp;

      // Set a timer to clear the OTP after the expiration time
      setTimeout(() => {
        isUserPresent.otp = null; // Clear the OTP
        isUserPresent.save(); // Save the user document with the cleared OTP
      }, 60 * 1000); // Convert OTP_EXPIRATION_TIME to milliseconds

      await isUserPresent.save();

      // Email configuration
      const mailOptions = {
        from: "amitparnets@gmail.com",
        to: Email,
        subject: "OTP Verification",
        text: `Your OTP is: ${otp}`,
      };

      // Send the OTP via email
      const info = await transporter.sendMail(mailOptions);

      console.log("OTP sent:", info.response);
      res.json({ success: "OTP sent successfully" });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: "Failed to send OTP" });
    }
  }

  async Otpverification(req, res) {
    try {
      let { otp, Email } = req.body;

      const user = await CustomerModel.findOne({ Email: Email });
      if (user.otp == otp) {
        return res.status(200).json({ success: " OTP verified successfully" });
      } else {
        // OTPs do not match
        return res.status(400).json({ error: "Invalid OTP" });
      }
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async NewPassword(req, res) {
    try {
      const { Password, Email } = req.body;
      // Check if the email exists in the database
      const user = await CustomerModel.findOne({ Email: Email });

      if (user) {
        // Hash the new password if provided
        if (Password) {
          const hashedPassword = await hash(Password, 10);
          user.Password = hashedPassword; // Update the user's password
        }

        // Save the updated user document
        const updatedUser = await user.save();

        return res.status(200).json({
          success: "Password updated successfully",
          data: updatedUser,
        });
      } else {
        return res.status(404).json({ error: "User not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async updatedUser(req, res) {
    try {
      let {
        userId,
        Fname,
        Mobile,
        Email,
        Address,

        employeeId,
        subsidyAmount,
      } = req.body;

      let obj = {};
      if (Fname) {
        obj["Fname"] = Fname;
      }
      if (employeeId) {
        obj["employeeId"] = employeeId;
      }
      if (subsidyAmount || subsidyAmount == 0) {
        obj["subsidyAmount"] = subsidyAmount;
      }
      if (Mobile) {
        obj["Mobile"] = Mobile;
      }
      if (Email) {
        obj["Email"] = Email;
      }

      if (Address) {
        obj["Address"] = Address;
      }
      //   if (Nooforders) {
      //     obj["Nooforders"] = Nooforders;
      //   }
      //   if (Lastorderdate) {
      //     obj["Lastorderdate"] = Lastorderdate;
      //   }
      //   if (lastorderamount) {
      //     obj["lastorderamount"] = lastorderamount;
      //   }
      //   if (Password) {
      //     Password = await hash(Password, 10);
      //     obj["Password"] = Password;
      //   }
      let data = await CustomerModel.findByIdAndUpdate(
        userId,
        { $set: obj },
        { new: true }
      );

      if (!data) return res.status(500).json({ error: "Something went wrong" });
      return res
        .status(200)
        .json({ success: "update successfully", userdata: data });
    } catch (error) {
      console.log(error);
    }
  }

  async profileimg(req, res) {
    try {
      const { userid } = req.body;
      let profileImage = req.files;
      if (!profileImage) {
        return res.status(400).json({ error: "No profile image provided" });
      } else if (profileImage.length > 0) {
        profileImage = await uploadFile2(profileImage[0], "profileImages");
      }

      if (!mongoose.Types.ObjectId.isValid(userid)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      const updatedUser = await CustomerModel.findByIdAndUpdate(
        userid,
        { $set: { profileImage: profileImage } },
        { new: true }
      );

      if (updatedUser) {
        return res
          .status(200)
          .json({ success: updatedUser, msg: "Image uploaded successfully" });
      } else {
        return res.status(404).json({ error: "User not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getRegisterUser(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        startDate = "",
        endDate = "",
        sortBy = "_id",
        sortOrder = "desc",
      } = req.query;

      // Convert page and limit to numbers
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      // Build query object
      let query = {};

      // Add search functionality - Fixed search to handle number conversion
      if (search) {
        const searchConditions = [
          { Fname: { $regex: search, $options: "i" } },
          { Email: { $regex: search, $options: "i" } },
        ];

        // Add mobile search - handle both numeric and string inputs
        const numericSearch = parseFloat(search);
        if (!isNaN(numericSearch) && isFinite(numericSearch)) {
          // Search for exact mobile number match
          searchConditions.push({ Mobile: numericSearch });
          // Also search for mobile numbers containing the search term (convert to string for regex)
          searchConditions.push({
            $expr: {
              $regexMatch: {
                input: { $toString: "$Mobile" },
                regex: search,
                options: "i",
              },
            },
          });
        } else {
          // For non-numeric search, search mobile as string using $expr
          searchConditions.push({
            $expr: {
              $regexMatch: {
                input: { $toString: "$Mobile" },
                regex: search,
                options: "i",
              },
            },
          });
        }

        query.$or = searchConditions;
      }

      // Add date range filter
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // End of day
        query.createdAt = { $gte: start, $lte: end };
      }

      // Build sort object
      const sortObj = {};
      sortObj[sortBy] = sortOrder === "desc" ? -1 : 1;

      // Get total count for pagination
      const totalCount = await CustomerModel.countDocuments(query);

      // Get paginated data
      const users = await CustomerModel.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean();

      // Get orders and wallets data for these users

      // Get all orders for these users
      const userIds = users.map((user) => user._id);
      console.log("User IDs for orders:", userIds);

      const orders = await OrderModel.find({ customerId: { $in: userIds } })
        .select("customerId allTotal Placedon status")
        .sort({ Placedon: -1 })
        .lean();

      console.log("Found orders:", orders.length);

      // Get all wallets for these users
      const wallets = await WalletModel.find({ userId: { $in: userIds } })
        .select("userId balance transactions")
        .lean();

      console.log("Found wallets:", wallets.length);

      // Process and enrich user data
      const enrichedUsers = users.map((user) => {
        // Find user's orders
        const userOrders = orders.filter(
          (order) => order.customerId.toString() === user._id.toString()
        );

        // Find user's wallet - Fixed wallet lookup
        const userWallet = wallets.find(
          (wallet) => wallet.userId.toString() === user._id.toString()
        );

        console.log(
          `User ${user._id}: Orders=${userOrders.length}, Wallet=${
            userWallet ? "Found" : "Not Found"
          }`
        );

        // Calculate order statistics
        const totalOrders = userOrders.length;
        const totalAmount = userOrders.reduce(
          (sum, order) => sum + (order.allTotal || 0),
          0
        );
        const lastOrder = userOrders.length > 0 ? userOrders[0] : null;

        // Calculate wallet statistics
        const walletBalance = userWallet ? userWallet.balance : 0;
        let walletExpiry = "N/A";

        if (
          userWallet &&
          userWallet.transactions &&
          userWallet.transactions.length > 0
        ) {
          const validExpiry = userWallet.transactions
            .filter(
              (txn) => txn.expiryDate && new Date(txn.expiryDate) > new Date()
            )
            .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))[0];

          if (validExpiry) {
            walletExpiry = new Date(validExpiry.expiryDate).toLocaleString();
          }
        }

        return {
          ...user,
          totalOrders,
          totalAmount: totalAmount.toFixed(2),
          lastOrder: lastOrder
            ? {
                date: new Date(lastOrder.Placedon).toLocaleString(),
                amount: lastOrder.allTotal,
              }
            : null,
          walletBalance: walletBalance.toFixed(2),
          walletExpiry,
        };
      });

      // Calculate pagination info
      const totalPages = Math.ceil(totalCount / limitNum);
      const hasNextPage = pageNum < totalPages;
      const hasPrevPage = pageNum > 1;

      return res.status(200).json({
        success: enrichedUsers,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCount,
          limit: limitNum,
          hasNextPage,
          hasPrevPage,
        },
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  // Alternative version with more detailed population
// async getCustomerByIdDetailed  (req, res) {
//   try {
//     const { id } = req.params;

//     if (!id || !mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({
//         success: false,
//         message: "Valid customer ID is required"
//       });
//     }

//     const customer = await CustomerModel.findById(id)
//       .populate({
//         path: 'referral.referredBy',
//         select: 'Fname Mobile Email profileImage',
//         model: 'Customer'
//       })
//       .populate({
//         path: 'addresses.hubId',
//         select: 'name location address contactNumber',
//         model: 'Hub'
//       })
//       .populate('primaryAddress')
//       .select('-otp -token -__v') // Exclude sensitive and unnecessary fields
//       .lean(); // Use lean() for better performance if you don't need mongoose document features

//     if (!customer) {
//       return res.status(404).json({
//         success: false,
//         message: "Customer not found"
//       });
//     }

//     // Transform the data if needed (optional)
//     const transformedCustomer = {
//       ...customer,
//       // You can add any data transformations here
//       fullName: customer.Fname,
//       // Calculate derived fields if needed
//       hasReferral: customer.referral && customer.referral.status === "success",
//       activeAddresses: customer.addresses ? customer.addresses.filter(addr => addr.isActive) : []
//     };

//     return res.status(200).json({
//       success: true,
//       message: "Customer retrieved successfully",
//       data: transformedCustomer
//     });

//   } catch (error) {
//     console.error("Error in getCustomerByIdDetailed:", error);
    
//     return res.status(500).json({
//       success: false,
//       message: "Failed to retrieve customer",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };


async getCustomerByIdDetailed(req, res) {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Valid customer ID is required"
      });
    }

    const customer = await CustomerModel.findById(id)
      .populate({
        path: 'referral.referredBy',
        select: 'Fname Mobile Email profileImage',
        model: 'Customer'
      })
      .populate({
        path: 'addresses.hubId',
        select: 'name location address contactNumber',
        model: 'Hub'
      })
      .select('-otp -token -__v')
      .lean();

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }

    // Sort addresses by createdAt in descending order (newest first)
    let sortedAddresses = [];
    if (customer.addresses && customer.addresses.length > 0) {
      sortedAddresses = customer.addresses.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(a._id.getTimestamp());
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(b._id.getTimestamp());
        return dateB - dateA; // Newest first
      });
    }

    // Find primary address
    let primaryAddress = null;
    if (customer.primaryAddress && sortedAddresses.length > 0) {
      primaryAddress = sortedAddresses.find(
        addr => addr._id.toString() === customer.primaryAddress.toString()
      );
    }

    // If no primary address found but there are addresses, use the first one as default
    if (!primaryAddress && sortedAddresses.length > 0) {
      primaryAddress = sortedAddresses[0];
    }

    // Transform the data
    const transformedCustomer = {
      ...customer,
      addresses: sortedAddresses,
      fullName: customer.Fname,
      hasReferral: customer.referral && customer.referral.status === "success",
      activeAddresses: sortedAddresses.filter(addr => addr.isActive !== false),
      primaryAddress: primaryAddress
    };

    return res.status(200).json({
      success: true,
      message: "Customer retrieved successfully",
      data: transformedCustomer
    });

  } catch (error) {
    console.error("Error in getCustomerByIdDetailed:", error);
    
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve customer",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

  // Export all users for Excel (chunked for large datasets)
  async exportAllUsers(req, res) {
    try {
      const {
        search = "",
        startDate = "",
        endDate = "",
        page = 1,
        limit = 1000,
      } = req.query;

      // Build query object
      let query = {};

      // Add search functionality - Fixed search to handle number conversion
      if (search) {
        const searchConditions = [
          { Fname: { $regex: search, $options: "i" } },
          { Email: { $regex: search, $options: "i" } },
        ];

        // Add mobile search - handle both numeric and string inputs
        const numericSearch = parseFloat(search);
        if (!isNaN(numericSearch) && isFinite(numericSearch)) {
          // Search for exact mobile number match
          searchConditions.push({ Mobile: numericSearch });
          // Also search for mobile numbers containing the search term (convert to string for regex)
          searchConditions.push({
            $expr: {
              $regexMatch: {
                input: { $toString: "$Mobile" },
                regex: search,
                options: "i",
              },
            },
          });
        } else {
          // For non-numeric search, search mobile as string using $expr
          searchConditions.push({
            $expr: {
              $regexMatch: {
                input: { $toString: "$Mobile" },
                regex: search,
                options: "i",
              },
            },
          });
        }

        query.$or = searchConditions;
      }

      // Add date range filter
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt = { $gte: start, $lte: end };
      }

      // Get total count first
      const totalCount = await CustomerModel.countDocuments(query);

      // Calculate pagination
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;
      const totalPages = Math.ceil(totalCount / limitNum);

      // Get chunked data
      const users = await CustomerModel.find(query)
        .select(
          "_id Fname Mobile Email Address status employeeId BlockCustomer createdAt updatedAt profileImage"
        )
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean();

      // Get orders and wallets data

      // Get all orders for these users
      const userIds = users.map((user) => user._id);
      const orders = await OrderModel.find({ customerId: { $in: userIds } })
        .select("customerId allTotal Placedon status")
        .sort({ Placedon: -1 })
        .lean();

      // Get all wallets for these users
      const wallets = await WalletModel.find({ userId: { $in: userIds } })
        .select("userId balance transactions")
        .lean();

      // Process and enrich user data
      const enrichedUsers = users.map((user) => {
        // Find user's orders
        const userOrders = orders.filter(
          (order) => order.customerId.toString() === user._id.toString()
        );

        // Find user's wallet - Fixed wallet lookup
        const userWallet = wallets.find(
          (wallet) => wallet.userId.toString() === user._id.toString()
        );

        // Calculate order statistics
        const totalOrders = userOrders.length;
        const totalAmount = userOrders.reduce(
          (sum, order) => sum + (order.allTotal || 0),
          0
        );
        const lastOrder = userOrders.length > 0 ? userOrders[0] : null;

        // Calculate wallet statistics
        const walletBalance = userWallet ? userWallet.balance : 0;
        let walletExpiry = "N/A";

        if (
          userWallet &&
          userWallet.transactions &&
          userWallet.transactions.length > 0
        ) {
          const validExpiry = userWallet.transactions
            .filter(
              (txn) => txn.expiryDate && new Date(txn.expiryDate) > new Date()
            )
            .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))[0];

          if (validExpiry) {
            walletExpiry = new Date(validExpiry.expiryDate).toLocaleString();
          }
        }

        return {
          ...user,
          totalOrders,
          totalAmount: totalAmount.toFixed(2),
          lastOrder: lastOrder
            ? {
                date: new Date(lastOrder.Placedon).toLocaleString(),
                amount: lastOrder.allTotal,
              }
            : null,
          walletBalance: walletBalance.toFixed(2),
          walletExpiry,
        };
      });

      res.status(200).json({
        success: enrichedUsers,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCount,
          limit: limitNum,
          hasNextPage: pageNum < totalPages,
        },
      });
    } catch (error) {
      console.error("Error exporting users:", error);
      res.status(500).json({
        success: false,
        message: "Failed to export users",
      });
    }
  }

  // Block & unBlock User
  async BlockUser(req, res) {
    const BlockId = req.params.id;
    try {
      const User = await CustomerModel.findById({ _id: BlockId });
      if (User.BlockCustomer === false) {
        await CustomerModel.findByIdAndUpdate(
          { _id: User._id },
          { $set: { BlockCustomer: true } },
          { new: true }
        );
        return res.status(200).json({ msg: "Customer Unblocked " });
      } else {
        await CustomerModel.findByIdAndUpdate(
          { _id: User._id },
          { $set: { BlockCustomer: false } },
          { new: true }
        );
        return res.status(200).json({ success: "Customer Blocked" });
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getUserByCompany(req, res) {
    const companyId = req.params.companyId;
    try {
      const users = await CustomerModel.find({ companyId: companyId }).sort({
        createdAt: -1,
      });

      return res.status(200).json({ success: users });
    } catch (error) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async deleteUser(req, res) {
    const userId = req.params.id;
    try {
      const user = await CustomerModel.findByIdAndDelete({ _id: userId });
      if (user) {
        await WalletModel.deleteOne({ userId: userId });
        await SelectAddressModel.deleteMany({ userId: userId });
        await phonepayModel.deleteMany({ userId: userId });
        return res.status(200).json({ success: "User deleted successfully" });
      } else {
        return res.status(404).json({ error: "User not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getMyReferralCode(req, res) {
    try {
      const { userId } = req.params;
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid User ID" });
      }

      let user = await CustomerModel.findById(userId).select("referralCode");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // If user has no code, create one and save it
      if (!user.referralCode) {
        console.log(`Generating code on-demand for old user: ${userId}`);
        user.referralCode = await generateUniqueReferralCode();
        console.log(user.referralCode, " generated for user ", userId);
        await user.save();
      }

      // Return the code
      return res.status(200).json({
        success: true,
        referralCode: user.referralCode,
      });
    } catch (error) {
      console.error("Error in getMyReferralCode:", error);
      return res.status(500).json({ message: "Server Error" });
    }
  }

  async getReferralSettings(req, res) {
    try {
      // Find the single settings document
      const settings = await ReferralSettings.findOne();

      if (!settings) {
        // Return default values if no settings are configured yet
        return res.status(200).json({
          success: true,
          data: {
            friendRewardAmount: 25, // Your default
            referrerRewardAmount: 25, // Your default
          },
        });
      }

      // Return the found settings
      return res.status(200).json({
        success: true,
        data: {
          friendRewardAmount: settings.friendRewardAmount,
          referrerRewardAmount: settings.referrerRewardAmount,
          // Add any other settings you want the frontend to know
        },
      });
    } catch (error) {
      console.error("Error fetching referral settings:", error);
      return res.status(500).json({ success: false, message: "Server Error" });
    }
  }
  async getMyReferralData(req, res) {
    try {
      const { userId } = req.params; // Get the logged-in user's ID from the URL parameter

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid User ID format." });
      }

      // 1. Find the logged-in user to get their earnings
      const user = await CustomerModel.findById(userId).select(
        "referralEarnings"
      );
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found." });
      }

      // 2. Find all users who were referred by this user
      const referredUsers = await CustomerModel.find({
        "referral.referredBy": userId,
      }).select("Fname referral.status referral.successDate createdAt"); // Select necessary fields

      // 3. Separate users into pending and successful lists
      const pendingReferrals = referredUsers
        .filter((u) => u.referral?.status === "pending")
        .map((u) => ({
          name: u.Fname || `User (${u.Mobile || u._id.toString().slice(-4)})`, // Use Name or fallback
          date: u.createdAt ? u.createdAt.toLocaleDateString("en-GB") : "N/A", // Format date as DD/MM/YYYY
        }));

      const successfulReferrals = referredUsers
        .filter((u) => u.referral?.status === "success")
        .map((u) => ({
          name: u.Fname || `User (${u.Mobile || u._id.toString().slice(-4)})`,
          date: u.referral.successDate
            ? u.referral.successDate.toLocaleDateString("en-GB")
            : "N/A", // Use success date
        }));

      // 4. Send the response
      return res.status(200).json({
        success: true,
        data: {
          earnings: user.referralEarnings || 0,
          pending: pendingReferrals,
          successful: successfulReferrals,
        },
      });
    } catch (error) {
      console.error(
        `Error getting referral data for user ${req.params.userId}:`,
        error
      );
      return res.status(500).json({
        success: false,
        message: "Server Error getting referral data.",
      });
    }
  }

  async addOrUpdateStudentInfo(req, res) {
    try {
      const { customerId, studentName, studentClass, studentSection } =
        req.body;

      if (!customerId || !studentName || !studentClass || !studentSection) {
        return res.status(400).json({
          success: false,
          message: "All fields are required",
        });
      }

      const updatedCustomer = await CustomerModel.findByIdAndUpdate(
        customerId,
        {
          studentInformation: {
            studentName,
            studentClass,
            studentSection,
          },
        },
        { new: true } // return updated document
      );

      if (!updatedCustomer) {
        return res.status(404).json({
          success: false,
          message: "Customer not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Student information added/updated successfully",
        data: updatedCustomer.studentInformation,
      });
    } catch (error) {
      console.error("Error adding/updating student info:", error);
      res.status(500).json({
        success: false,
        message: "Server error while updating student info",
        error: error.message,
      });
    }
  }



// Add addresses for a customer
// async addAddress(req, res) {
//   try {
//     const {
//       customerId,
//       addressType,
//       houseName,
//       apartmentName,
//       schoolName,
//       companyName,
//       homeName,
//       landmark,
//       floor,
//       towerBlock,
//       flat,
//       studentName,
//       studentClass,
//       studentSection,
//       floorNo,
//       location,
//       fullAddress,
//       hubName,
//       hubId,
//       // isDefault = false
//     } = req.body;

//     // Validate required fields
//     if (!customerId || !addressType || !houseName || !fullAddress || !location) {
//       return res.status(400).json({
//         success: false,
//         message: "Customer ID, address type, house name, full address, and location are required"
//       });
//     }

//     // Validate location coordinates
//     if (!location.lat || !location.lng) {
//       return res.status(400).json({
//         success: false,
//         message: "Location coordinates (lat and lng) are required"
//       });
//     }

//     // Find customer
//     const customer = await CustomerModel.findById(customerId);
//     if (!customer) {
//       return res.status(404).json({
//         success: false,
//         message: "Customer not found"
//       });
//     }

//     // Prepare address data
//     const addressData = {
//       addressType,
//       houseName,
//       fullAddress,
//       location: {
//         type: 'Point',
//         coordinates: [location.lng, location.lat]
//       },
//       landmark: landmark || "",
//       floor: floor || "",
//       // isDefault,
//       hubName: hubName || "",
//       hubId: (hubId && hubId.trim() !== "") ? hubId : null
//     };

//     // Add type-specific fields
//     switch (addressType) {
//       case "Home":
//         if (!homeName) {
//           return res.status(400).json({
//             success: false,
//             message: "Home name is required for Home address"
//           });
//         }
//         addressData.homeName = homeName;
//         break;

//       case "PG":
//         if (!apartmentName || !towerBlock || !flat) {
//           return res.status(400).json({
//             success: false,
//             message: "Apartment name, Tower/Block and Flat are required for PG address"
//           });
//         }
//         addressData.apartmentName = apartmentName;
//         addressData.towerBlock = towerBlock;
//         addressData.flat = flat;
//         break;

//       case "School":
//         if (!schoolName || !studentName || !studentClass || !studentSection) {
//           return res.status(400).json({
//             success: false,
//             message: "School name, student name, class, and section are required for School address"
//           });
//         }
//         addressData.schoolName = schoolName;
//         addressData.studentInformation = {
//           studentName,
//           studentClass,
//           studentSection
//         };
//         break;

//       case "Work":
//         if (!companyName || !floorNo) {
//           return res.status(400).json({
//             success: false,
//             message: "Company name and floor number are required for Work address"
//           });
//         }
//         addressData.companyName = companyName;
//         addressData.floorNo = floorNo;
//         break;

//       default:
//         return res.status(400).json({
//           success: false,
//           message: "Invalid address type. Must be Home, PG, School, or Work"
//         });
//     }

//     // If setting as default, unset other defaults
//     // if (isDefault) {
//     //   customer.addresses.forEach(addr => {
//     //     addr.isDefault = false;
//     //   });
//     // }

//     // Add new address
//     customer.addresses.push(addressData);

//     // Get the newly added address
//     const newAddress = customer.addresses[customer.addresses.length - 1];

//     // If this is the first address OR if it's set as default, set it as primary
//     if (customer.addresses.length === 1 || isDefault) {
//       customer.primaryAddress = newAddress._id;
//       newAddress.isDefault = true;
//     }

//     await customer.save();

//     return res.status(201).json({
//       success: true,
//       message: "Address added successfully",
//       address: newAddress
//     });

//   } catch (error) {
//     console.error("Add address error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message
//     });
//   }
// }


// async addAddress(req, res) {
//   try {
//     const {
//       customerId,
//       addressType,
//       houseName,
//       apartmentName,
//       schoolName,
//       companyName,
//       homeName,
//       landmark,
//       floor,
//       towerBlock,
//       flat,
//       studentName,
//       studentClass,
//       studentSection,
//       floorNo,
//       location,
//       fullAddress,
//       hubName,
//       hubId
//     } = req.body;

//     // Validate required fields
//     if (!customerId || !addressType || !houseName || !fullAddress || !location) {
//       return res.status(400).json({
//         success: false,
//         message: "Customer ID, address type, house name, full address, and location are required"
//       });
//     }

//     // Validate location coordinates
//     if (!location.lat || !location.lng) {
//       return res.status(400).json({
//         success: false,
//         message: "Location coordinates (lat and lng) are required"
//       });
//     }

//     // Find customer
//     const customer = await CustomerModel.findById(customerId);
//     if (!customer) {
//       return res.status(404).json({
//         success: false,
//         message: "Customer not found"
//       });
//     }

//     // Prepare address data
//     const addressData = {
//       addressType,
//       houseName,
//       fullAddress,
//       location: {
//         type: 'Point',
//         coordinates: [location.lng, location.lat]
//       },
//       landmark: landmark || "",
//       floor: floor || "",
//       hubName: hubName || "",
//       hubId: (hubId && hubId.trim() !== "") ? hubId : null
//     };

//     // Add type-specific fields
//     switch (addressType) {
//       case "Home":
//         if (!homeName) {
//           return res.status(400).json({
//             success: false,
//             message: "Home name is required for Home address"
//           });
//         }
//         addressData.homeName = homeName;
//         break;

//       case "PG":
//         if (!apartmentName || !towerBlock || !flat) {
//           return res.status(400).json({
//             success: false,
//             message: "Apartment name, Tower/Block and Flat are required for PG address"
//           });
//         }
//         addressData.apartmentName = apartmentName;
//         addressData.towerBlock = towerBlock;
//         addressData.flat = flat;
//         break;

//       case "School":
//         if (!schoolName || !studentName || !studentClass || !studentSection) {
//           return res.status(400).json({
//             success: false,
//             message: "School name, student name, class, and section are required for School address"
//           });
//         }
//         addressData.schoolName = schoolName;
//         addressData.studentInformation = {
//           studentName,
//           studentClass,
//           studentSection
//         };
//         break;

//       case "Work":
//         if (!companyName || !floorNo) {
//           return res.status(400).json({
//             success: false,
//             message: "Company name and floor number are required for Work address"
//           });
//         }
//         addressData.companyName = companyName;
//         addressData.floorNo = floorNo;
//         break;

//       default:
//         return res.status(400).json({
//           success: false,
//           message: "Invalid address type. Must be Home, PG, School, or Work"
//         });
//     }

//     // Add new address
//     customer.addresses.push(addressData);

//     // Get the newly added address
//     const newAddress = customer.addresses[customer.addresses.length - 1];

//     // If this is the first address, set it as primary
//     if (customer.addresses.length === 1) {
//       customer.primaryAddress = newAddress._id;
//     }

//     await customer.save();

//     return res.status(201).json({
//       success: true,
//       message: "Address added successfully",
//       address: newAddress
//     });

//   } catch (error) {
//     console.error("Add address error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message
//     });
//   }
// }


// // Get addresses
// async getAddresses(req, res) {
//   try {
//     const { customerId } = req.params;

//     const customer = await CustomerModel.findById(customerId);
//     if (!customer) {
//       return res.status(404).json({
//         success: false,
//         message: "Customer not found"
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       addresses: customer.addresses,
//       primaryAddress: customer.primaryAddress
//     });

//   } catch (error) {
//     console.error("Get addresses error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message
//     });
//   }
// }

// // Set primary address - FIXED VERSION
// async setPrimaryAddress(req, res) {
//   try {
//     const { customerId, addressId } = req.params;

//     const customer = await CustomerModel.findById(customerId);
//     if (!customer) {
//       return res.status(404).json({
//         success: false,
//         message: "Customer not found"
//       });
//     }

//     const address = customer.addresses.find(
//       addr => addr._id.toString() === addressId
//     );

//     if (!address) {
//       return res.status(404).json({
//         success: false,
//         message: "Address not found"
//       });
//     }

//     // Update all addresses to not default
//     customer.addresses.forEach(addr => {
//       addr.isDefault = false;
//     });

//     // Set the selected address as default and primary
//     address.isDefault = true;
//     customer.primaryAddress = address._id;

//     await customer.save();

//     return res.status(200).json({
//       success: true,
//       message: "Primary address set successfully",
//       primaryAddress: address
//     });

//   } catch (error) {
//     console.error("Set primary address error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message
//     });
//   }
// }

// // Remove default address - FIXED VERSION
// async removeDefaultAddress(req, res) {
//   try {
//     const { customerId, addressId } = req.params;

//     const customer = await CustomerModel.findById(customerId);
//     if (!customer) {
//       return res.status(404).json({
//         success: false,
//         message: "Customer not found"
//       });
//     }

//     const address = customer.addresses.find(
//       addr => addr._id.toString() === addressId
//     );

//     if (!address) {
//       return res.status(404).json({
//         success: false,
//         message: "Address not found"
//       });
//     }

//     // Remove default status from this address
//     address.isDefault = false;

//     // If this was the primary address, set it to null
//     if (customer.primaryAddress?.toString() === addressId) {
//       customer.primaryAddress = null;
//     }

//     await customer.save();

//     return res.status(200).json({
//       success: true,
//       message: "Default address removed successfully",
//       primaryAddress: customer.primaryAddress
//     });

//   } catch (error) {
//     console.error("Remove default address error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message
//     });
//   }
// }

// async updateAddress(req, res) {
//   try {
//     const { customerId, addressId } = req.params;
//     const updateData = req.body;

//     const customer = await CustomerModel.findById(customerId);
//     if (!customer) {
//       return res.status(404).json({
//         success: false,
//         message: "Customer not found"
//       });
//     }

//     const addressIndex = customer.addresses.findIndex(
//       addr => addr._id.toString() === addressId
//     );

//     if (addressIndex === -1) {
//       return res.status(404).json({
//         success: false,
//         message: "Address not found"
//       });
//     }

//     // Validate type-specific fields if address type is being updated
//     if (updateData.addressType) {
//       const addressType = updateData.addressType;
//       switch (addressType) {
//         case "Home":
//           if (!updateData.homeName) {
//             return res.status(400).json({
//               success: false,
//               message: "Home name is required for Home address"
//             });
//           }
//           break;
//         case "PG":
//           if (!updateData.apartmentName || !updateData.towerBlock || !updateData.flat) {
//             return res.status(400).json({
//               success: false,
//               message: "Apartment name, Tower/Block and Flat are required for PG address"
//             });
//           }
//           break;
//         case "School":
//           if (!updateData.schoolName || !updateData.studentInformation?.studentName || 
//               !updateData.studentInformation?.studentClass || !updateData.studentInformation?.studentSection) {
//             return res.status(400).json({
//               success: false,
//               message: "School name, student name, class, and section are required for School address"
//             });
//           }
//           break;
//         case "Work":
//           if (!updateData.companyName || !updateData.floorNo) {
//             return res.status(400).json({
//               success: false,
//               message: "Company name and floor number are required for Work address"
//             });
//           }
//           break;
//       }
//     }

//     // Handle isDefault update
//     if (updateData.isDefault === true) {
//       customer.addresses.forEach(addr => {
//         addr.isDefault = false;
//       });
//       customer.addresses[addressIndex].isDefault = true;
//       customer.primaryAddress = customer.addresses[addressIndex]._id;
//     } else if (updateData.isDefault === false) {
//       customer.addresses[addressIndex].isDefault = false;
//       if (customer.primaryAddress?.toString() === addressId) {
//         customer.primaryAddress = null;
//       }
//     }

//     // Update other fields
//     Object.keys(updateData).forEach(key => {
//       if (key !== 'isDefault' && key !== '_id') {
//         if (key === 'studentInformation' && updateData[key]) {
//           customer.addresses[addressIndex].studentInformation = {
//             ...customer.addresses[addressIndex].studentInformation,
//             ...updateData.studentInformation
//           };
//         } else if (key === 'location' && updateData[key]) {
//           customer.addresses[addressIndex].location = {
//             type: 'Point',
//             coordinates: [updateData.location.lng, updateData.location.lat]
//           };
//         } else if (key === 'hubId') {
//           customer.addresses[addressIndex].hubId = (updateData.hubId && updateData.hubId.trim() !== "") ? updateData.hubId : null;
//         } else if (key !== 'hubId') {
//           customer.addresses[addressIndex][key] = updateData[key];
//         }
//       }
//     });

//     await customer.save();

//     return res.status(200).json({
//       success: true,
//       message: "Address updated successfully",
//       address: customer.addresses[addressIndex]
//     });

//   } catch (error) {
//     console.error("Update address error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message
//     });
//   }
// }

// async getAddresses(req, res) {
//   try {
//     const { customerId } = req.params;

//     const customer = await CustomerModel.findById(customerId);
//     if (!customer) {
//       return res.status(404).json({
//         success: false,
//         message: "Customer not found"
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       addresses: customer.addresses,
//       primaryAddress: customer.primaryAddress
//     });

//   } catch (error) {
//     console.error("Get addresses error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message
//     });
//   }
// }

// // Update address
// async updateAddress(req, res) {
//   try {
//     const { customerId, addressId } = req.params;
//     const updateData = req.body;

//     const customer = await CustomerModel.findById(customerId);
//     if (!customer) {
//       return res.status(404).json({
//         success: false,
//         message: "Customer not found"
//       });
//     }

//     const addressIndex = customer.addresses.findIndex(
//       addr => addr._id.toString() === addressId
//     );

//     if (addressIndex === -1) {
//       return res.status(404).json({
//         success: false,
//         message: "Address not found"
//       });
//     }

//     // Validate type-specific fields if address type is being updated
//     if (updateData.addressType) {
//       const addressType = updateData.addressType;
//       switch (addressType) {
//         case "Home":
//           if (!updateData.homeName) {
//             return res.status(400).json({
//               success: false,
//               message: "Home name is required for Home address"
//             });
//           }
//           break;
//         case "PG":
//           if (!updateData.apartmentName || !updateData.towerBlock || !updateData.flat) {
//             return res.status(400).json({
//               success: false,
//               message: "Apartment name, Tower/Block and Flat are required for PG address"
//             });
//           }
//           break;
//         case "School":
//           if (!updateData.schoolName || !updateData.studentInformation?.studentName || 
//               !updateData.studentInformation?.studentClass || !updateData.studentInformation?.studentSection) {
//             return res.status(400).json({
//               success: false,
//               message: "School name, student name, class, and section are required for School address"
//             });
//           }
//           break;
//         case "Work":
//           if (!updateData.companyName || !updateData.floorNo) {
//             return res.status(400).json({
//               success: false,
//               message: "Company name and floor number are required for Work address"
//             });
//           }
//           break;
//       }
//     }

//     // Handle isDefault update
//     if (updateData.isDefault) {
//       customer.addresses.forEach(addr => {
//         addr.isDefault = false;
//       });
//     }

//     // Handle hubName and hubId updates - FIXED: use updateData.hubName instead of hubName
//     if (updateData.hubName !== undefined) {
//       customer.addresses[addressIndex].hubName = updateData.hubName;
//     }

//     // Handle hubId - ensure it's properly handled (null if empty)
//     if (updateData.hubId !== undefined) {
//       customer.addresses[addressIndex].hubId = (updateData.hubId && updateData.hubId.trim() !== "") ? updateData.hubId : null;
//     }

//     // Update address - use a more controlled approach to avoid overwriting
//     const currentAddress = customer.addresses[addressIndex].toObject();
    
//     // Update only the fields that are provided in updateData
//     Object.keys(updateData).forEach(key => {
//       // Skip hubName and hubId as they are handled separately above
//       if (key !== 'hubName' && key !== 'hubId') {
//         if (key === 'studentInformation' && updateData[key]) {
//           // Handle nested studentInformation object
//           customer.addresses[addressIndex].studentInformation = {
//             ...currentAddress.studentInformation,
//             ...updateData.studentInformation
//           };
//         } else if (key === 'location' && updateData[key]) {
//           // Handle location update
//           customer.addresses[addressIndex].location = {
//             type: 'Point',
//             coordinates: [updateData.location.lng, updateData.location.lat]
//           };
//         } else {
//           customer.addresses[addressIndex][key] = updateData[key];
//         }
//       }
//     });

//     await customer.save();

//     return res.status(200).json({
//       success: true,
//       message: "Address updated successfully",
//       address: customer.addresses[addressIndex]
//     });

//   } catch (error) {
//     console.error("Update address error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message
//     });
//   }
// }



// // Delete address
// async deleteAddress(req, res) {
//   try {
//     const { customerId, addressId } = req.params;

//     const customer = await CustomerModel.findById(customerId);
//     if (!customer) {
//       return res.status(404).json({
//         success: false,
//         message: "Customer not found"
//       });
//     }

//     const addressIndex = customer.addresses.findIndex(
//       addr => addr._id.toString() === addressId
//     );

//     if (addressIndex === -1) {
//       return res.status(404).json({
//         success: false,
//         message: "Address not found"
//       });
//     }

//     // Check if this is the primary address
//     const isPrimary = customer.primaryAddress?.toString() === addressId;

//     // Remove address
//     customer.addresses.splice(addressIndex, 1);

//     // Clean up any invalid hubId values in remaining addresses
//     customer.addresses.forEach(addr => {
//       if (addr.hubId === "" || !addr.hubId) {
//         addr.hubId = null;
//       }
//     });

//     // If primary address was deleted, set a new one
//     if (isPrimary && customer.addresses.length > 0) {
//       customer.primaryAddress = customer.addresses[0]._id;
//       customer.addresses[0].isDefault = true;
//     } else if (customer.addresses.length === 0) {
//       customer.primaryAddress = null;
//     }

//     await customer.save();

//     return res.status(200).json({
//       success: true,
//       message: "Address deleted successfully"
//     });

//   } catch (error) {
//     console.error("Delete address error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message
//     });
//   }
// }

// // Set primary address
// async setPrimaryAddress(req, res) {
//   try {
//     const { customerId, addressId } = req.params;

//     const customer = await CustomerModel.findById(customerId);
//     if (!customer) {
//       return res.status(404).json({
//         success: false,
//         message: "Customer not found"
//       });
//     }

//     const address = customer.addresses.find(
//       addr => addr._id.toString() === addressId
//     );

//     if (!address) {
//       return res.status(404).json({
//         success: false,
//         message: "Address not found"
//       });
//     }

//     // Update all addresses to not default
//     customer.addresses.forEach(addr => {
//       addr.isDefault = false;
//     });

//     // Set the selected address as default and primary
//     address.isDefault = true;
//     customer.primaryAddress = address._id;

//     await customer.save();

//     return res.status(200).json({
//       success: true,
//       message: "Primary address set successfully",
//       primaryAddress: address
//     });

//   } catch (error) {
//     console.error("Set primary address error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message
//     });
//   }
// }

// // Get address by ID
async getAddressById(req, res) {
  try {
    const { customerId, addressId } = req.params;

    const customer = await CustomerModel.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }

    const address = customer.addresses.find(
      addr => addr._id.toString() === addressId
    );

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found"
      });
    }

    return res.status(200).json({
      success: true,
      address
    });

  } catch (error) {
    console.error("Get address by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
}

// // Get addresses by type
async getAddressesByType(req, res) {
  try {
    const { customerId, addressType } = req.params;

    const customer = await CustomerModel.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }

    const filteredAddresses = customer.addresses.filter(
      addr => addr.addressType === addressType
    );

    return res.status(200).json({
      success: true,
      addresses: filteredAddresses,
      count: filteredAddresses.length
    });

  } catch (error) {
    console.error("Get addresses by type error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
}

// // Get default address
async getDefaultAddress(req, res) {
  try {
    const { customerId } = req.params;

    const customer = await CustomerModel.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }

    const defaultAddress = customer.addresses.find(addr => addr.isDefault);

    if (!defaultAddress) {
      return res.status(404).json({
        success: false,
        message: "No default address found"
      });
    }

    return res.status(200).json({
      success: true,
      address: defaultAddress
    });

  } catch (error) {
    console.error("Get default address error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
}

// // Remove default address
async removeDefaultAddress(req, res) {
  try {
    const { customerId, addressId } = req.params;

    const customer = await CustomerModel.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }

    const address = customer.addresses.find(
      addr => addr._id.toString() === addressId
    );

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found"
      });
    }

    // Remove default status from this address
    address.isDefault = false;

    // If this was the primary address, set a new primary if available
    if (customer.primaryAddress?.toString() === addressId) {
      const otherAddress = customer.addresses.find(addr => 
        addr._id.toString() !== addressId
      );
      
      if (otherAddress) {
        customer.primaryAddress = otherAddress._id;
        otherAddress.isDefault = true;
      } else {
        customer.primaryAddress = null;
      }
    }

    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Default address removed successfully",
      primaryAddress: customer.primaryAddress
    });

  } catch (error) {
    console.error("Remove default address error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
}










// Add address - SIMPLIFIED
async addAddress(req, res) {
  try {
    const {
      customerId,
      addressType,
      houseName,
      apartmentName,
      schoolName,
      companyName,
      homeName,
      landmark,
      floor,
      towerBlock,
      flat,
      studentName,
      studentClass,
      studentSection,
      floorNo,
      location,
      fullAddress,
      hubName,
      hubId
    } = req.body;

    // Validate required fields
    if (!customerId || !addressType  || !fullAddress || !location) {
      return res.status(400).json({
        success: false,
        message: "Customer ID, address type,  full address, and location are required"
      });
    }

    // Validate location coordinates
    if (!location.lat || !location.lng) {
      return res.status(400).json({
        success: false,
        message: "Location coordinates (lat and lng) are required"
      });
    }

    // Find customer
    const customer = await CustomerModel.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }

    // Prepare address data
    const addressData = {
      addressType,
      houseName,
      fullAddress,
      location: {
        type: 'Point',
        coordinates: [location.lng, location.lat]
      },
      landmark: landmark || "",
      floor: floor || "",
      hubName: hubName || "",
      hubId: (hubId && hubId.trim() !== "") ? hubId : null
    };

    // Add type-specific fields
    switch (addressType) {
      case "Home":
        if (!houseName) {
          return res.status(400).json({
            success: false,
            message: "Home name is required for Home address"
          });
        }
        addressData.houseName = houseName;
        break;

      case "PG":
        if (!apartmentName || !towerBlock || !flat) {
          return res.status(400).json({
            success: false,
            message: "Apartment name, Tower/Block and Flat are required for PG address"
          });
        }
        addressData.apartmentName = apartmentName;
        addressData.towerBlock = towerBlock;
        addressData.flat = flat;
        break;

      case "School":
        if (!schoolName || !studentName || !studentClass || !studentSection) {
          return res.status(400).json({
            success: false,
            message: "School name, student name, class, and section are required for School address"
          });
        }
        addressData.schoolName = schoolName;
        addressData.studentInformation = {
          studentName,
          studentClass,
          studentSection
        };
        break;

      case "Work":
        if (!companyName || !floorNo) {
          return res.status(400).json({
            success: false,
            message: "Company name and floor number are required for Work address"
          });
        }
        addressData.companyName = companyName;
        addressData.floorNo = floorNo;
        break;

      default:
        return res.status(400).json({
          success: false,
          message: "Invalid address type. Must be Home, PG, School, or Work"
        });
    }

    // Add new address
    customer.addresses.push(addressData);

    // Get the newly added address
    const newAddress = customer.addresses[customer.addresses.length - 1];

    // If this is the first address, set it as primary
    if (customer.addresses.length === 1) {
      customer.primaryAddress = newAddress._id;
    }

    await customer.save();

    return res.status(201).json({
      success: true,
      message: "Address added successfully",
      address: newAddress
    });

  } catch (error) {
    console.error("Add address error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
}

// Set primary address - SIMPLIFIED
async setPrimaryAddress(req, res) {
  try {
    const { customerId, addressId } = req.params;

    const customer = await CustomerModel.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }

    const address = customer.addresses.find(
      addr => addr._id.toString() === addressId
    );

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found"
      });
    }

    // Simply set the primary address
    customer.primaryAddress = address._id;

    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Primary address set successfully",
      primaryAddress: address
    });

  } catch (error) {
    console.error("Set primary address error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
}

// Remove primary address - SIMPLIFIED (just set to null)
async removePrimaryAddress(req, res) {
  try {
    const { customerId } = req.params;

    const customer = await CustomerModel.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }

    // Simply remove the primary address (set to null)
    customer.primaryAddress = null;

    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Primary address removed successfully",
      primaryAddress: null
    });

  } catch (error) {
    console.error("Remove primary address error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
}

// Get addresses - SIMPLIFIED
async getAddresses(req, res) {
  try {
    const { customerId } = req.params;

    const customer = await CustomerModel.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }

    // Sort addresses by createdAt descending (newest first)
    const sortedAddresses = customer.addresses.sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      // Fallback to _id timestamp if createdAt doesn't exist
      return b._id.getTimestamp() - a._id.getTimestamp();
    });

    return res.status(200).json({
      success: true,
      addresses: sortedAddresses,
      primaryAddress: customer.primaryAddress
    });

  } catch (error) {
    console.error("Get addresses error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
}

// Update address - SIMPLIFIED (no isDefault handling)
async updateAddress(req, res) {
  try {
    const { customerId, addressId } = req.params;
    const updateData = req.body;

    const customer = await CustomerModel.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }

    const addressIndex = customer.addresses.findIndex(
      addr => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Address not found"
      });
    }

    // Validate type-specific fields if address type is being updated
    if (updateData.addressType) {
      const addressType = updateData.addressType;
      switch (addressType) {
        case "Home":
          if (!updateData.homeName) {
            return res.status(400).json({
              success: false,
              message: "Home name is required for Home address"
            });
          }
          break;
        case "PG":
          if (!updateData.apartmentName || !updateData.towerBlock || !updateData.flat) {
            return res.status(400).json({
              success: false,
              message: "Apartment name, Tower/Block and Flat are required for PG address"
            });
          }
          break;
        case "School":
          if (!updateData.schoolName || !updateData.studentInformation?.studentName || 
              !updateData.studentInformation?.studentClass || !updateData.studentInformation?.studentSection) {
            return res.status(400).json({
              success: false,
              message: "School name, student name, class, and section are required for School address"
            });
          }
          break;
        case "Work":
          if (!updateData.companyName || !updateData.floorNo) {
            return res.status(400).json({
              success: false,
              message: "Company name and floor number are required for Work address"
            });
          }
          break;
      }
    }

    // Update address fields
    Object.keys(updateData).forEach(key => {
      if (key !== '_id') {
        if (key === 'studentInformation' && updateData[key]) {
          customer.addresses[addressIndex].studentInformation = {
            ...customer.addresses[addressIndex].studentInformation,
            ...updateData.studentInformation
          };
        } else if (key === 'location' && updateData[key]) {
          customer.addresses[addressIndex].location = {
            type: 'Point',
            coordinates: [updateData.location.lng, updateData.location.lat]
          };
        } else if (key === 'hubId') {
          customer.addresses[addressIndex].hubId = (updateData.hubId && updateData.hubId.trim() !== "") ? updateData.hubId : null;
        } else {
          customer.addresses[addressIndex][key] = updateData[key];
        }
      }
    });

    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      address: customer.addresses[addressIndex]
    });

  } catch (error) {
    console.error("Update address error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
}

// Delete address - SIMPLIFIED
async deleteAddress(req, res) {
  try {
    const { customerId, addressId } = req.params;

    const customer = await CustomerModel.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }

    const addressIndex = customer.addresses.findIndex(
      addr => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Address not found"
      });
    }

    // Check if this is the primary address
    const isPrimary = customer.primaryAddress?.toString() === addressId;

    // Remove address
    customer.addresses.splice(addressIndex, 1);

    // If primary address was deleted, set primary to null
    if (isPrimary) {
      customer.primaryAddress = null;
    }

    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully"
    });

  } catch (error) {
    console.error("Delete address error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
}

// Get primary address
async getPrimaryAddress(req, res) {
  try {
    const { customerId } = req.params;

    const customer = await CustomerModel.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }

    if (!customer.primaryAddress) {
      return res.status(404).json({
        success: false,
        message: "No primary address set"
      });
    }

    const primaryAddress = customer.addresses.find(
      addr => addr._id.toString() === customer.primaryAddress.toString()
    );

    if (!primaryAddress) {
      return res.status(404).json({
        success: false,
        message: "Primary address not found in addresses"
      });
    }

    return res.status(200).json({
      success: true,
      address: primaryAddress
    });

  } catch (error) {
    console.error("Get primary address error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
}
async getHubMenu(req, res) {
    try {
      const { hubId } = req.query;

      if (!hubId) {
        return res
          .status(400)
          .json({ error: "Missing required parameter: hubId." });
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today

      const sevenDaysLater = new Date(today);
      sevenDaysLater.setDate(sevenDaysLater.getDate() + 7); // Up to the end of the 7th day

      // 1. Find all menu items for the next 7 days for the specific hub
      const menuItems = await HubMenuModel.find({
        hubId: hubId,
        menuDate: {
          $gte: today, // Greater than or equal to today
          $lt: sevenDaysLater // Less than the start of the 8th day
        },
        isActive: true, 
        // remainingQuantity: { $gt: 0 },
      })
      .sort({ menuDate: 1, hubPriority: 1 }) // Sort by date, then by priority
      
      // 2. Populate product details
      .populate({
        path: "productId",
        model: AddproductModel,
        select: "foodname Foodgallery foodcategory unit fooddescription foodmealtype menuCategory aggregatedPrice ", 
      });

      // 3. Re-format the data to match your Home.jsx structure, grouped by slot for easy frontend filtering
      const formattedMenu = menuItems.map(item => ({
          // Critical fields from Product Master
          _id: item.productId._id,
          foodname: item.productId.foodname,
          unit: item.productId.unit,
          fooddescription: item.productId.fooddescription,
          foodcategory: item.productId.foodcategory,
          foodType: item.productId.foodmealtype,
          Foodgallery: [
             { image2: item.productId.Foodgallery?.[0]?.image2 || "" }
          ],
          menuCategory: item.productId.menuCategory,
          aggregatedPrice: item.productId.aggregatedPrice,
          
          // Critical fields for slot identification and pricing
          deliveryDate: item.menuDate.toISOString(), // Store the date here
          session: item.session, // Store the session here
          
          locationPrice: [{ 
             foodprice: item.hubPrice,
             basePrice: item.basePrice,
             Remainingstock: item.remainingQuantity,
             Priority: item.hubPriority,
          }]
      }));
      // NOTE: We return a single, large array. The frontend will filter this.
      console.log("formattedMenu", formattedMenu[0].locationPrice);
      return res.status(200).json({ menu: formattedMenu });
    } catch (error) {
      console.error("Error fetching hub menu:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}

async function generateUniqueReferralCode() {
  let code;
  let isUnique = false;
  while (!isUnique) {
    // Generates an 8-character uppercase alphanumeric code
    code = randomstring.generate({
      //TODO: neeed to increse length to 8 later when user base is increased
      length: 7,
      charset: 'alphanumeric',
      capitalization: 'uppercase'
    });
    // Check if this code already exists
    const existingUser = await CustomerModel.findOne({ referralCode: code });
    if (!existingUser) {
      isUnique = true;
    }
  }
  return code;
}

function formatDate(date) {
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
}

cron.schedule("0 0 * * *", async () => {
  // Runs at 12:00 AM every day
  try {
    const today = formatDate(new Date());
    console.log(`[${today}] Running subsidy expiration job...`);

    const employeeIds = await CustomerModel.find({
      status: "Employee",
    }).distinct("_id");
    const wallets = await WalletModel.find({ userId: { $in: employeeIds } });

    for (const wallet of wallets) {
      let expiredAmount = 0;
      const now = new Date();

      let alreadyExpiredToday = wallet.transactions.some(
        (tx) =>
          tx.description === "Expired subsidy" &&
          formatDate(tx.createdAt) === today
      );

      if (alreadyExpiredToday) {
        console.log(
          `Wallet ${wallet._id} already processed for expiration today.`
        );
        continue;
      }

      wallet.transactions.forEach((tx) => {
        if (
          tx.isFreeCash &&
          tx.expiryDate &&
          (tx.expiryDate <= now ||
            tx.description == "Initial employee subsidy") &&
          !tx.expiredProcessed
        ) {
          expiredAmount += tx.amount;
          tx.expiredProcessed = true;
        }
      });

      if (expiredAmount > 0) {
        wallet.balance = Math.max(0, wallet.balance - expiredAmount);

        wallet.transactions.push({
          amount: expiredAmount,
          type: "debit",
          description: "Expired subsidy",
          isFreeCash: true,
          createdAt: now,
        });
      }

      // Also mark all expired as processed, even if amount is 0
      wallet.transactions.forEach((tx) => {
        if (tx.isFreeCash && tx.expiryDate && tx.expiryDate <= now) {
          tx.expiredProcessed = true;
        }
      });

      await wallet.save();
    }
  } catch (error) {
    console.error("Error in subsidy expiration job:", error);
  }
});

cron.schedule("2 0 * * *", async () => {
  try {
    const today = formatDate(new Date());
    console.log(`[${today}] Running subsidy addition job...`);

    const employeeIds = await CustomerModel.find({
      status: "Employee",
    }).distinct("_id");
    const wallets = await WalletModel.find({ userId: { $in: employeeIds } });

    for (const wallet of wallets) {
      const customer = await CustomerModel.findById(wallet.userId);
      const subsidy = customer?.subsidyAmount || 0;

      // Check if already added today
      const alreadyAdded = wallet.transactions.some(
        (tx) =>
          (tx.description === "Daily employee subsidy" ||
            tx.description === "Initial employee subsidy") &&
          formatDate(tx.createdAt) === today
      );

      if (alreadyAdded) {
        console.log(`Wallet ${wallet._id} already received subsidy today.`);
        continue;
      }

      wallet.balance += subsidy;

      wallet.transactions.push({
        amount: subsidy,
        type: "credit",
        description: "Daily employee subsidy",
        expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        isFreeCash: true,
        createdAt: new Date(),
      });

      await wallet.save();
    }
  } catch (error) {
    console.error("Error in subsidy addition job:", error);
  }
});

const CutomerController = new Customer();
module.exports = CutomerController;
