import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-datepicker/dist/react-datepicker.css";
import "react-multi-carousel/lib/styles.css";

import Navbar1 from "./Components/Navbar1";
import Home from "./Components/Home";
import Footer from "./Components/Footer";
import Checkout from "./Components/Checkout";
import Invoice from "./Components/Invoice";
import Profile from "./Components/Profile";
import LiveStreams from "./Components/LiveStream";
import Dashboard from "./Components/Admin/Dashboard";
import Main from "./Components/Admin/Main";
import HomeBanner from "./Components/Admin/HomeBanner";
import Add_Products from "./Components/Admin/Add_Products";
import DeliveryCharge from "./Components/Admin/DeliveryCharge";
import BookingList from "./Components/Admin/BookingList";
import UserList from "./Components/Admin/UserList";
import AdminContactus from "./Components/Admin/AdminContactus";
import AdminLogin from "./Components/Admin/AdminLogin";
import ProductDescription from "./Components/ProductDescription";
import LandingPage from "./Components/LandingPage";
import OrderHistory from "./Components/OrderHistory";
import Slot from "./Components/Admin/Slot";
import SalesReport from "./Components/Admin/SalesReport";
import WebStory from "./Components/Admin/WebStory";
import Statusbar from "./Components/Statusbar";
import CorporateBookings from "./Components/Admin/CorporateBookings";
import CorporateBookingsOld from "./Components/Admin/CorporateBookingsOld";
import ApartmentList from "./Components/Admin/ApartmentList";
import CorporateList from "./Components/Admin/CorporateList";
import LocationAddRequest from "./Components/Admin/LocationAddRequest";
import ChatWithUs from "./Components/ChatWithUs";
import Livestreams from "./Components/Admin/LiveStream";
import AdminInvoice from "./Components/Admin/AdminInvoice";
import Gst from "./Components/Admin/Gst";
import PrivacyPolicy from "./Components/PrivacyPolicy";
import TermsAndConditions from "./Components/TermsAndCondition";
import PaymentSuccess from "./Components/PaymentSuccess";
import AdminCoupon from "./Components/Admin/AdminCoupon";
import AddonedCart from "./Components/Admin/AddonedCart";
import AdminWalletSettings from "./Components/Admin/AdminWalletSettings";
import AdminWalletManagement from "./Components/Admin/AdminWalletMangement";
import UserWallet from "./Components/UserWallet";
import ThermalInvoice from "./Components/Admin/ThermalInvoice";
import FeedbackPage from "./Components/Feedback";
import RestaurantClosure from "./Components/Admin/ResturentCloser";
import CorporateLogin from "./Components/Corprate/CorprateLogin";
import CorporateDashboard from "./Components/Corprate/CorporateDashboard";
import CorporateLayout from "./Components/Corprate/CorprateLayout";
import EmployeeList from "./Components/Corprate/EmployeeList";
import EmployeeOrders from "./Components/Corprate/EmployeeOrders";
import EmployeeCart from "./Components/Corprate/EmployeeCart";
import OfferManagement from "./Components/Admin/OfferManagement";
import PackerDashboard from "./Components/Packer/PackerDashboard";
import PackerLogin from "./Components/Packer/PackerLogin";
import PackerList from "./Components/Packer/PackerList";
import HubList from "./Components/Packer/HubList";
import ZoneMap from "./Components/Admin/ZoneMap";
import MultipleInvoice from "./Components/Packer/MultipleInvoice";
import Bag from "./Components/Admin/Bag";
import RiderManagement from "./Components/Admin/RiderManagement";
import DelayReason from "./Components/Admin/Dailyreason";
import HubWiseProductManagement from "./Components/Admin/HubWiseProductManagement";
import LeafWithLogo from "./Components/LeafWithLogo";
import Validate from "./Components/Validate";
// import { LoginPage } from "./Components/LoginPage";
import ReferalZone from "./Components/ReferalScreen";
import AdminReferralDashboard from "./Components/Admin/AdminReferralDashboard";
import LegalPage from "./Components/LegalPage";
import AdminCategory from "./Components/Admin/AdminCategory";
import PackerOrdersEnhanced from "./Components/Packer/Packers";
import Location from "./Components/Location";
import MenuUpload from "./Components/Admin/MenuUpload"
import AddressManagement from "./Components/AddressManagement";
import LocationRequest from "./Components/Admin/LocationRequest";
import LocationConfirmationSimple from "./Components/CurrentLocation";
import AdminOrderAssignment from "./Components/Admin/AdminOrderAssignment";
import MyPlan from "./Components/MyPlan";





// Component to handle dynamic theme colors
const ThemeColorHandler = () => {
  const location = useLocation();

  useEffect(() => {
    const updateThemeColor = () => {
      let themeColor = "#6B8E23"; // Default green color

      // Change theme color based on current route
      if (location.pathname.includes("/home")) {
        themeColor = "#6B8E23"; // Red for admin pages
      } else if (location.pathname.includes("/wallet")) {
        themeColor = "#6B8E23"; // Red for admin pages
      } else if (location.pathname.includes("/orders")) {
        themeColor = "#6B8E23"; // Red for admin pages
      } else if (location.pathname.includes("/profile")) {
        themeColor = "#6B8E23"; // Red for admin pages
      } else if (location.pathname.includes("/admin")) {
        themeColor = "#DC3545"; // Red for admin pages
      } else if (location.pathname.includes("/corporate")) {
        themeColor = "#0D6EFD"; // Blue for corporate pages
      } else if (location.pathname.includes("/packer")) {
        themeColor = "#FFC107"; // Yellow for packer pages
      } else if (location.pathname.includes("/checkout")) {
        themeColor = "#6B8E23"; // Dark green for checkout
      } else if (location.pathname.includes("/profile")) {
        themeColor = "#6F42C1"; // Purple for profile
      } else if (location.pathname.includes("/")) {
        themeColor = "#e6b800"; // Red for admin pages
      }

      // Update meta theme-color
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute("content", themeColor);
      }

      // Update msapplication-navbutton-color for Windows
      const metaNavButton = document.querySelector(
        'meta[name="msapplication-navbutton-color"]'
      );
      if (metaNavButton) {
        metaNavButton.setAttribute("content", themeColor);
      }
    };

    updateThemeColor();
  }, [location.pathname]);

  return null;
};

function App() {
  const [selectArea, setSelectArea] = useState("");
  const address = localStorage.getItem("address");
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  let [Carts, setCarts] = useState([]);
  useEffect(() => {
    if (address) {
      setSelectArea(address);
    }
    if (cart) {
      setCarts(cart);
    }
  }, []);
  return (
    <div className="App no-select">
      <Router>
        <ThemeColorHandler />
        <Routes>
          {/* <Route path="/" element={<LandingPage />} /> */}
          <Route path="/" element={<LeafWithLogo />} />
           <Route path="/:referralCode" element={<LeafWithLogo />} />
          <Route path="/otp-varification" element={<Validate />} />
          <Route
            path="/home"
            element={
              <>
                {/* <Navbar1
                  selectArea={selectArea}
                  Carts={Carts}
                  setCarts={setCarts}
                /> */}
                <Home
                  selectArea={selectArea}
                  setSelectArea={setSelectArea}
                  Carts={Carts}
                  setCarts={setCarts}
                />
              </>
            }
          />
          <Route
            path="/wallet"
            element={
              <>
                {/* <Navbar1
                  selectArea={selectArea}
                  Carts={Carts}
                  setCarts={setCarts}
                /> */}
                <UserWallet />
                <Footer />
              </>
            }
          />
              <Route
            path="/addresses"
            element={
              <>
                {/* <Navbar1
                  selectArea={selectArea}
                  Carts={Carts}
                  setCarts={setCarts}
                /> */}
                <AddressManagement />
                <Footer />
              </>
            }
          />
            <Route
            path="/my-plan"
            element={
              <>
                <MyPlan />
                <Footer />
              </>
            }
          />
          <Route
            path="/feedback"
            element={
              <>
                {/* <Navbar1
                  selectArea={selectArea}
                  Carts={Carts}
                  setCarts={setCarts}
                /> */}
                <FeedbackPage />
                <Footer />
              </>
            }
          />
          <Route
            path="/product-description"
            element={
              <>
                <Navbar1
                  selectArea={selectArea}
                  Carts={Carts}
                  setCarts={setCarts}
                />
                <ProductDescription />
                <Footer />
              </>
            }
          />
          <Route
            path="/refer"
            element={
              <>
                <ReferalZone />
              </>
            }
          />
          <Route
            path="/checkout"
            element={
              <>
                <Checkout />
                <Footer />
              </>
            }
          />
          <Route
            path="/invoice"
            element={
              <>
                <Invoice />
                <Footer />
              </>
            }
          />
          <Route
            path="/AdminInvoice"
            element={
              <>
                <AdminInvoice />
                <Footer />
              </>
            }
          />

          <Route
            path="/thermalinvoice"
            element={
              <>
                <ThermalInvoice />
                <Footer />
              </>
            }
          />
          <Route
            path="/termsconditions"
            element={
              <>
                <TermsAndConditions />
                <Footer />
              </>
            }
          />
          <Route path="/legal-page" element={<LegalPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/chats" element={<ChatWithUs />} />
          <Route
            path="/profile"
            element={
              <>
                <Profile />
                <Footer />
              </>
            }
          />
          <Route
            path="/orders"
            element={
              <>
                <OrderHistory />
                <Footer />
              </>
            }
          />
          <Route
            path="/livestreams"
            element={
              <>
                <LiveStreams />
                <Footer />
              </>
            }
          />
          <Route
            path="/payment-success"
            element={
              <>
                <PaymentSuccess />
                <Footer />
              </>
            }
          />
          <Route path="/foodstatus" element={<Statusbar />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route
            path="admin/referral-dashboard"
            element={<Main children={<AdminReferralDashboard />} />}
          />
            <Route
            path="admin/menu-upload"
            element={<Main children={<MenuUpload />} />}
          />
          <Route
            path="/dashboard"
            element={<Main children={<Dashboard />} />}
          />
          <Route
            path="/home_banner"
            element={<Main children={<HomeBanner />} />}
          />
          <Route
            path="/apartmentlist"
            element={<Main children={<ApartmentList />} />}
          />
          <Route
            path="/admin/walletseting"
            element={<Main children={<AdminWalletSettings />} />}
          />
          <Route
            path="/admin/walletmangement"
            element={<Main children={<AdminWalletManagement />} />}
          />

          <Route
            path="/corporatelist"
            element={<Main children={<CorporateList />} />}
          />
          <Route path="/gst" element={<Main children={<Gst />} />} />
          <Route
            path="/all-products"
            element={<Main children={<Add_Products />} />}
          />
          <Route
            path="/available-slots"
            element={<Main children={<Slot />} />}
          />
          <Route
            path="/shop-closer"
            element={<Main children={<RestaurantClosure />} />}
          />
          <Route
            path="/delivery-charge"
            element={<Main children={<DeliveryCharge />} />}
          />
          <Route
            path="/coupon-list"
            element={<Main children={<AdminCoupon />} />}
          />
          <Route
            path="/apartment-booking-list"
            element={<Main children={<BookingList />} />}
          />
          <Route
            path="/corporate-booking-list"
            element={<Main children={<CorporateBookings />} />}
          />
           <Route
            path="/corporate-booking-list-old"
            element={<Main children={<CorporateBookingsOld />} />}
          />
          <Route
            path="/sales-report"
            element={<Main children={<SalesReport />} />}
          />
          <Route
            path="/abandoned-cart"
            element={<Main children={<AddonedCart />} />}
          />
          <Route path="/webstory" element={<Main children={<WebStory />} />} />
          <Route path="/user-list" element={<Main children={<UserList />} />} />
          <Route path="/category" element={<Main children={<AdminCategory />} />} />

          <Route
            path="/admin-live-stream"
            element={<Main children={<Livestreams />} />}
          />
          <Route path="/admin-bag" element={<Main children={<Bag />} />} />
          <Route
            path="/admin/riders"
            element={<Main children={<RiderManagement />} />}
          />
          <Route
            path="/admin-reason-management"
            element={<Main children={<DelayReason />} />}
          />
          <Route
            path="/contact-us"
            element={<Main children={<AdminContactus />} />}
          />
          <Route
            path="/offer-mangement"
            element={<Main children={<OfferManagement />} />}
          />
          <Route
            path="/hub-product-mangement"
            element={<Main children={<HubWiseProductManagement />} />}
          />
          <Route
            path="/location-add-request"
            element={<Main children={<LocationAddRequest />} />}
          />
           <Route
            path="/location-request"
            element={<Main children={<LocationRequest />} />}
          />
          <Route
            path="/admin/hub-list"
            element={<Main children={<HubList />} />}
          />
          <Route
            path="/admin/zone-map"
            element={<Main children={<ZoneMap />} />}
          />
          <Route
            path="/admin/packer-track"
            element={<Main children={<PackerDashboard />} />}
          />
          {/* corporate Route */}
          <Route path="/corporate-login" element={<CorporateLogin />} />
          <Route
            path="/corporate-dashboard"
            element={<CorporateLayout children={<CorporateDashboard />} />}
          />
          <Route
            path="/employees-orders"
            element={<CorporateLayout children={<EmployeeOrders />} />}
          />
          <Route
            path="/corporate-employees"
            element={<CorporateLayout children={<EmployeeList />} />}
          />
          <Route
            path="/employees-cart"
            element={<CorporateLayout children={<EmployeeCart />} />}
          />
          <Route
            path="/corporate/profile"
            element={<div>Profile Page (Placeholder)</div>}
          />
          <Route path="/location" element={<Location />} />
          <Route path="/current-location" element={<LocationConfirmationSimple />} />
          <Route path="/order-assignment" element={<AdminOrderAssignment />} />


          {/* Packer Routes */}
          <Route path="/packer-login" element={<PackerLogin />} />
          <Route path="/packers" element={<PackerOrdersEnhanced />} />
          
          <Route path="/packer-dashboard" element={<PackerDashboard />} />
          <Route path="/packer-thermal-print" element={<MultipleInvoice />} />

          <Route
            path="/packer-list"
            element={<Main children={<PackerList />} />}
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
