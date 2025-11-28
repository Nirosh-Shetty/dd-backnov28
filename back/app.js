// const morgan = require("morgan");
const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const http = require('http');
const { Server } = require('socket.io');
const path = require("path");

// Middleware
app.use(express.json());
app.use(cors());
// app.use(morgan("dev"));
app.use(express.static("Public"));

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const dbUri = process.env.DB;
if (!dbUri) {
  console.error("MongoDB connection string missing. Please set the DB variable in your .env file.");
  process.exit(1);
}
mongoose
  .connect(dbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB is Connected"))
  .catch((error) => {
    console.error("DB is not Connected", error);
    process.exit(1);
  });

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});
// require('./Controller/migration')
//Admin
const login = require("./Routes/Admin/AdminLogin");
const HomeBanner = require("./Routes/Admin/HomeBanner");
const Addapartmentlist = require("./Routes/Admin/Addapartmentlist");
const Addcorparatelist = require("./Routes/Admin/Addcorparatelist");
const Addproduct = require("./Routes/Admin/Addproduct");
const adminaddcart = require("./Routes/Admin/Addcart");
const Addorder = require("./Routes/Admin/Addorder");
const Addslots = require("./Routes/Admin/Addslots");
const Addavailableslot = require("./Routes/Admin/Addavailableslot");
const Addwebstories = require("./Routes/Admin/Addwebstories");
const Deletedelivarycharge = require("./Routes/Admin/DelivaryCharge");
const Contactus = require("./Routes/Admin/Contactus");
const Social = require("./Routes/Admin/SocialMedia");
const LiveStream = require("./Routes/Admin/Livestream")
const Gst = require("./Routes/Admin/Gst");
const Coupon = require("./Routes/Admin/Coupon");
const offerRoutes = require('./Routes/Admin/OfferRoute');
const reportRoutes = require('./Routes/Admin/OfferReport');
const referralSettingsRoutes = require('./Routes/Admin/ReferralSettingsRoutes')
const FoodTagsRoutes = require('./Routes/Admin/FoodTags');
//User
const GeneralEnquiry = require("./Routes/User/GeneralEnquiry");
const Userlist = require("./Routes/User/Userlist");
const BookingList = require("./Routes/User/BookingList");
const Addrequestaddress = require("./Routes/User/Addrequestaddress");
const SelectedAddress = require("./Routes/User/SelectedAddress");
const paymentRoute = require("./Routes/User/phonepay");
const Addcart = require("./Routes/User/Cart");
const Wallet = require('./Routes/User/Wallet');
const CloseShop = require('./Routes/Admin/Resturant')
const PackerRoutes = require("./Routes/Packer/PackerRoute")
const HubRoute = require('./Routes/Packer/HubRoute')
const BagRoutes = require('./Routes/Admin/Bag');
const ReasonRoutes = require('./Routes/Admin/Reasons')
const CategoryRoutes = require('./Routes/Admin/AdminCategory')
const PackingRoutes = require('./Routes/Packer/Packing')
const serviceRequestRoutes = require('./Routes/User/serviceRequestRoutes')
const RiderRoutes = require('./Routes/Admin/Rider')
const myPlanRoutes = require("./Routes/User/MyPlanRoute");

const hubMenuRoutes = require("./Routes/Admin/HubMenu");
const MenuCategoryRoutes = require("./Routes/Admin/MenuCategory");

//Admin
app.use("/api/admin", login);
app.use("/api/admin", HomeBanner);
app.use("/api/admin", Addapartmentlist);
app.use("/api/admin", Addcorparatelist);
app.use("/api/admin", Addproduct);
app.use("/api/admin", adminaddcart);
app.use("/api/admin", Addorder);
app.use("/api/admin", Addslots);
app.use("/api/admin", Addavailableslot);
app.use("/api/admin", Addwebstories);
app.use("/api/admin", Deletedelivarycharge);
app.use("/api/admin", Contactus);
app.use("/api/admin", Social);
app.use("/api/admin", LiveStream);
app.use("/api/admin", Gst);
app.use("/api/admin", Coupon);
app.use("/api/admin", CloseShop);
app.use('/api/admin', offerRoutes);
// app.use('/api/admin', bannerRoutes);
app.use('/api/admin', reportRoutes);
app.use('/api/Hub',HubRoute)
app.use('/api/admin',BagRoutes)
app.use('/api/admin',ReasonRoutes)
app.use('/api/admin',RiderRoutes)
app.use("/api/admin/referral-settings", referralSettingsRoutes);
app.use('/api/admin', CategoryRoutes)
app.use("/api/admin/hub-menu", hubMenuRoutes);
app.use('/api/admin/menuCategory', MenuCategoryRoutes)
app.use('/api/admin/', FoodTagsRoutes);


//User
app.use("/api/user", paymentRoute);
app.use("/api/User", GeneralEnquiry);
app.use("/api/User", Userlist);
app.use("/api/User", BookingList);
app.use("/api/User", Addrequestaddress);
app.use("/api/User", SelectedAddress);
app.use("/api/cart", Addcart);
app.use("/api/wallet", Wallet);
app.use("/api/packer", PackerRoutes);
app.use("/api/packer/packing", PackingRoutes);
app.use('/api/service-requests', serviceRequestRoutes);
app.use("/api/user/plan", myPlanRoutes);


app.use('/flyer', (req, res) => {
  return res.redirect('/')
})
io.on('connection', (socket) => {
  console.log('Admin connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Admin disconnected:', socket.id);
  });
});

global.io = io;

const PORT = process.env.PORT || 7013;
app.use(express.static(path.join(__dirname, 'build'))); // Change 'build' to your frontend folder if needed

// Redirect all requests to the index.html file

app.get("*", (req, res) => {
  return res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

server.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});
