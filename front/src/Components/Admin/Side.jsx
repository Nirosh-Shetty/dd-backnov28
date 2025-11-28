import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  MdDiscount,
  MdOutlineSmartScreen,
  MdOutlineSupportAgent,
  MdSubject,
} from "react-icons/md";
import { LuAlignHorizontalJustifyStart } from "react-icons/lu";
import "../Admin/Admin.css";
import Navbar from "react-bootstrap/Navbar";
import { GiGymBag, GiHamburgerMenu, GiWallet } from "react-icons/gi";
import { AiOutlineClose } from "react-icons/ai";
import { BsFillBuildingsFill } from "react-icons/bs";
import {
  FaHubspot,
  FaProductHunt,
  FaWeightHanging,
  FaGift,
  FaLocationArrow,
  FaMotorcycle,
} from "react-icons/fa";
import { CiDiscount1 } from "react-icons/ci";
import { MdProductionQuantityLimits } from "react-icons/md";
import axios from "axios";
import { HiMiniWallet } from "react-icons/hi2";
import { BiSolidOffer } from "react-icons/bi";
import { GoPackageDependents } from "react-icons/go";
import { TbBrandReason } from "react-icons/tb";
const Side = () => {
  // Responsive sidebar
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);

  //integrating get method Apartment
  const [AddApartment, setAddApartment] = useState([]);
  const getAddApartment = async () => {
    try {
      let res = await axios.get("http://localhost:7013/api/admin/getapartment");
      if (res.status === 200) {
        setAddApartment(res.data.corporatedata.reverse());
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAddApartment();
  }, []);

  const [ApartmentOrder, setApartmentOrder] = useState({});
  const getApartmentOrder = async () => {
    try {
      let res = await axios.get(
        "http://localhost:7013/api/admin/getAllOrderCount"
      );
      if (res.status === 200) {
        setApartmentOrder(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getApartmentOrder();
  }, []);
  //integrating get  method corporate
  const [AddCorporate, setAddCorporate] = useState([]);
  const getAddCorporate = async () => {
    try {
      let res = await axios.get("http://localhost:7013/api/admin/getcorporate");
      if (res.status === 200) {
        setAddCorporate(res.data.corporatedata.reverse());
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAddCorporate();
  }, []);

  // get method Integration location request
  const [Enquiry, setEnquiry] = useState([]);
  const getEnquiry = async () => {
    try {
      let res = await axios.get(
        "http://localhost:7013/api/User/getEnquiryenquiry"
      );
      if (res.status === 200) {
        setEnquiry(res.data.getdata.reverse());
      }
    } catch (error) {
      console.log(error);
    }
  };

  // useEffect(() => {
  //   getEnquiry();
  // }, []);

  //User list get method Integration
  const [Adduser, setAdduser] = useState([]);
  const getAdduser = async () => {
    try {
      let res = await axios.get("http://localhost:7013/api/User/registeruser");
      if (res.status === 200) {
        setAdduser(res.data.success.reverse());
      }
    } catch (error) {
      console.log(error);
    }
  };

  // useEffect(() => {
  //   getAdduser();
  // }, []);

  return (
    <div>
      <Navbar expand="lg" className=" p-0">
        <button
          class="custom-toggler navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarsExample09"
          aria-controls="navbarsExample09"
          aria-expanded={!isNavCollapsed ? true : false}
          aria-label="Toggle navigation"
          onClick={handleNavCollapse}
          style={{ margin: "10px" }}
        >
          <span>
            <GiHamburgerMenu style={{ color: "white" }} />
          </span>
        </button>
        <div
          class={`${isNavCollapsed ? "collapse" : ""} navbar-collapse`}
          id="navbarsExample09"
        >
          <div className="si09">
            <div style={{ width: "100%", justifyContent: "space-between" }}>
              <div
                className="lo-ad"
                style={{ background: "white", borderBottom: "1px solid white" }}
              >
                <div className="">
                  <a href="/" className="tail-text">
                    <img
                      src="../Assets/dailydishlogo.jpeg"
                      alt="Logo"
                      className="admin-logo-img"
                      style={{ width: "300px", height: "65px", padding: "5px" }}
                    />
                  </a>
                </div>
              </div>
              <div className="sidebar-close-icon" onClick={handleNavCollapse}>
                <AiOutlineClose />
              </div>
            </div>
            <ul>
              <Link to="/dashboard" onClick={handleNavCollapse}>
                <li className="a-ele ">
                  <span>
                    <MdOutlineSupportAgent style={{ fontSize: "20px" }} />
                  </span>
                  <span className="ms-2">Dashboard</span>
                </li>
              </Link>

              <Link to="/shop-closer" onClick={handleNavCollapse}>
                <li className="a-ele ">
                  <span>
                    <MdOutlineSmartScreen style={{ fontSize: "20px" }} />
                  </span>
                  <span className="ms-2">Shop Closer</span>
                </li>
              </Link>

              <Link to="/apartmentlist" onClick={handleNavCollapse}>
                <li className="a-ele ">
                  <span>
                    <BsFillBuildingsFill style={{ fontSize: "20px" }} />
                  </span>
                  <span className="ms-2">
                    Pg/Apartment List{" "}
                    <span className="sidebar-count">
                      {AddApartment?.length}
                    </span>
                  </span>
                </li>
              </Link>

              <Link to="/corporatelist" onClick={handleNavCollapse}>
                <li className="a-ele ">
                  <span>
                    <BsFillBuildingsFill style={{ fontSize: "20px" }} />
                  </span>
                  <span className="ms-2">
                    Corporate List{" "}
                    <span className="sidebar-count">
                      {AddCorporate?.length}
                    </span>
                  </span>
                </li>
              </Link>
              <Link to="/admin/hub-list" onClick={handleNavCollapse}>
                <li className="a-ele ">
                  <span>
                    <FaHubspot style={{ fontSize: "20px" }} />
                  </span>
                  <span className="ms-2">Hub List </span>
                </li>
              </Link>
              <Link to="/admin-bag" onClick={handleNavCollapse}>
                <li className="a-ele ">
                  <span>
                    <GiGymBag style={{ fontSize: "20px" }} />
                  </span>
                  <span className="ms-2">Bags</span>
                </li>
              </Link>
              <Link to="/admin/riders" onClick={handleNavCollapse}>
                <li className="a-ele ">
                  <span>
                    <FaMotorcycle style={{ fontSize: "20px" }} />
                  </span>
                  <span className="ms-2">Rider Management</span>
                </li>
              </Link>
              <Link to="/admin-reason-management" onClick={handleNavCollapse}>
                <li className="a-ele ">
                  <span>
                    <TbBrandReason style={{ fontSize: "20px" }} />
                  </span>
                  <span className="ms-2">Reason Management</span>
                </li>
              </Link>
              <Link to="/packer-list" onClick={handleNavCollapse}>
                <li className="a-ele ">
                  <span>
                    <GoPackageDependents style={{ fontSize: "20px" }} />
                  </span>
                  <span className="ms-2">Packer List </span>
                </li>
              </Link>
              <Link to="/order-assignment" onClick={handleNavCollapse}>
                <li className="a-ele ">
                  <span>
                    <GoPackageDependents style={{ fontSize: "20px" }} />
                  </span>
                  <span className="ms-2">Delivery Assignment </span>
                </li>
              </Link>
              <Link
                to="/packer-dashboard?user=Admin"
                onClick={() => {
                  localStorage.removeItem("packer");
                  handleNavCollapse();
                }}
              >
                <li className="a-ele ">
                  <span>
                    <GoPackageDependents style={{ fontSize: "20px" }} />
                  </span>
                  <span className="ms-2">Packer Tracking </span>
                </li>
              </Link>

              <Link to="/gst" onClick={handleNavCollapse}>
                <li className="a-ele ">
                  <span>
                    <LuAlignHorizontalJustifyStart
                      style={{ fontSize: "20px" }}
                    />
                  </span>
                  <span className="ms-2">Gst </span>
                </li>
              </Link>

              <Link to="/category" onClick={handleNavCollapse}>
                <li className="a-ele ">
                  <span>
                    <LuAlignHorizontalJustifyStart
                      style={{ fontSize: "20px" }}
                    />
                  </span>
                  <span className="ms-2">Category </span>
                </li>
              </Link>

              <Link to="/all-products" onClick={handleNavCollapse}>
                <li className="a-ele ">
                  <span>
                    <MdProductionQuantityLimits style={{ fontSize: "20px" }} />
                  </span>
                  <span className="ms-2">Products </span>
                </li>
              </Link>

              <Link to="/hub-product-mangement" onClick={handleNavCollapse}>
                <li className="a-ele ">
                  <span>
                    <FaProductHunt style={{ fontSize: "20px" }} />
                  </span>
                  <span className="ms-2">Hub Menu Management</span>
                </li>
              </Link>
              <Link to="/admin/menu-upload" onClick={handleNavCollapse}>
                <li className="a-ele ">
                  <span>
                    <FaProductHunt style={{ fontSize: "20px" }} />
                  </span>
                  <span className="ms-2">Menu Upload</span>
                </li>
              </Link>
              <Link to="/offer-mangement" onClick={handleNavCollapse}>
                <li className="a-ele ">
                  <span>
                    <BiSolidOffer style={{ fontSize: "20px" }} />
                  </span>
                  <span className="ms-2">Offer Mangement </span>
                </li>
              </Link>
              <Link to="/coupon-list" onClick={handleNavCollapse}>
                <li className="a-ele ">
                  <span>
                    <MdDiscount style={{ fontSize: "20px" }} />
                  </span>
                  <span className="ms-2">Coupon Mangement </span>
                </li>
              </Link>
              <Link to="/admin/referral-dashboard" onClick={handleNavCollapse}>
                <li className="a-ele ">
                  <span>
                    <FaGift style={{ fontSize: "20px" }} />
                  </span>
                  <span className="ms-2">Referral Dashboard</span>
                </li>
              </Link>
              <Link to="/apartment-booking-list" onClick={handleNavCollapse}>
                <li className="a-ele ">
                  <span>
                    <LuAlignHorizontalJustifyStart
                      style={{ fontSize: "20px" }}
                    />
                  </span>
                  <span className="ms-2">
                    Pg/Apartment Orders{" "}
                    <span className="sidebar-count">
                      {ApartmentOrder?.apartment}
                    </span>
                  </span>
                </li>
              </Link>

              <Link to="/corporate-booking-list" onClick={handleNavCollapse}>
                <li className="a-ele ">
                  <span>
                    <LuAlignHorizontalJustifyStart
                      style={{ fontSize: "20px" }}
                    />
                  </span>
                  <span className="ms-2">
                    Corporate Orders{" "}
                    <span className="sidebar-count">
                      {ApartmentOrder?.corporate}
                    </span>
                  </span>
                </li>
              </Link>
              <Link
                to="/corporate-booking-list-old"
                onClick={handleNavCollapse}
              >
                <li className="a-ele ">
                  <span>
                    <LuAlignHorizontalJustifyStart
                      style={{ fontSize: "20px" }}
                    />
                  </span>
                  <span className="ms-2">
                    Corporate Orders(old){" "}
                    <span className="sidebar-count">
                      {ApartmentOrder?.corporate}
                    </span>
                  </span>
                </li>
              </Link>
              <Link to="/abandoned-cart" onClick={handleNavCollapse}>
                <li className="a-ele ">
                  <span>
                    <MdProductionQuantityLimits style={{ fontSize: "20px" }} />
                  </span>
                  <span className="ms-2">Abandoned Cart </span>
                </li>
              </Link>

              <Link to="/admin/walletseting" onClick={handleNavCollapse}>
                <li className="a-ele ">
                  <span>
                    <GiWallet style={{ fontSize: "20px" }} />
                  </span>
                  <span className="ms-2">Wallet Setting </span>
                </li>
              </Link>

              <Link to="/admin/walletmangement" onClick={handleNavCollapse}>
                <li className="a-ele ">
                  <span>
                    <HiMiniWallet style={{ fontSize: "20px" }} />
                  </span>
                  <span className="ms-2">User Wallets </span>
                </li>
              </Link>
              {/* <Link to="">
                <li
                  className={`a-ele ${acc3 ? "active-0" : "null"}`}
                  onClick={() => {
                    setHome(!Home);
                  }}
                >
                  <span>
                    <AiOutlineHome style={{ fontSize: "20px" }} />
                  </span>{" "}
                  <span>Order History </span>{" "}
                  {Home ? (
                    <>
                      {" "}
                      <span style={{ float: "right" }}>
                        <MdOutlineKeyboardArrowUp />
                      </span>
                    </>
                  ) : (
                    <>
                      <span style={{ float: "right" }}>
                        <MdOutlineKeyboardArrowDown />
                      </span>
                    </>
                  )}
                </li>
              </Link>
              <Link to="">
                {Home ? (
                  <>
                    <div className="webmanagement">
                
         
                    </div>
                  </>
                ) : (
                  ""
                )}
              </Link> */}

              {/* <Link to="/available-slots" onClick={handleNavCollapse}>
                <li className="a-ele ">
                  <span>
                    <LuAlignHorizontalJustifyStart
                      style={{ fontSize: "20px" }}
                    />
                  </span>
                  <span className="ms-2">Slots </span>
                </li>
              </Link> */}

              {/* <Link to="/delivery-charge" onClick={handleNavCollapse}>
                <li className="a-ele ">
                  <span>
                    <LuAlignHorizontalJustifyStart
                      style={{ fontSize: "20px" }}
                    />
                  </span>
                  <span className="ms-2">Delivery Charge </span>
                </li>
              </Link> */}

              <Link to="/sales-report" onClick={handleNavCollapse}>
                <li className="a-ele ">
                  <span>
                    <LuAlignHorizontalJustifyStart
                      style={{ fontSize: "20px" }}
                    />
                  </span>
                  <span className="ms-2">Sales Report </span>
                </li>
              </Link>

              <Link to="/webstory" onClick={handleNavCollapse}>
                <li className="a-ele">
                  <span>
                    <LuAlignHorizontalJustifyStart
                      style={{ fontSize: "20px" }}
                    />
                  </span>
                  <span className="ms-2">Web Story </span>
                </li>
              </Link>

              <Link to="/user-list" onClick={handleNavCollapse}>
                <li className="a-ele ">
                  <span>
                    <MdSubject style={{ fontSize: "20px" }} />
                  </span>
                  <span className="ms-2">
                    User List{" "}
                    <span className="sidebar-count">
                      {ApartmentOrder?.user}
                    </span>
                  </span>
                </li>
              </Link>

              <Link to="/admin-live-stream" onClick={handleNavCollapse}>
                <li className="a-ele ">
                  <span>
                    <MdSubject style={{ fontSize: "20px" }} />
                  </span>
                  <span className="ms-2">Live Stream</span>
                </li>
              </Link>

              <Link to="/location-add-request" onClick={handleNavCollapse}>
                <li className="a-ele ">
                  <span>
                    <FaWeightHanging style={{ fontSize: "20px" }} />
                  </span>
                  <span className="ms-2">Location Request </span>
                </li>
              </Link>

              <Link to="/location-request" onClick={handleNavCollapse}>
                <li className="a-ele ">
                  <span>
                    <FaLocationArrow style={{ fontSize: "20px" }} />
                  </span>
                  <span className="ms-2">Add Location Request </span>
                </li>
              </Link>

              {/* <Link to="/contact-us" onClick={handleNavCollapse}>
                <li className="a-ele ">
                  <span>
                    <MdSubject style={{ fontSize: "20px" }} />
                  </span>
                  <span className="ms-2">Contact Us</span>
                </li>
              </Link> */}

              {/* <Link to="/live-stream" onClick={handleNavCollapse}>
                <li
                  className="a-ele "                >
                  <span>
                    <FaWeightHanging style={{ fontSize: "20px" }} />
                  </span>
                  <span className="ms-2">Live Stream</span>
                </li>
              </Link>  */}

              {/* <Link to="/categoryenquiry" onClick={handleNavCollapse}>
                <li
                  className="a-ele "                >
                  <span>
                    <FaWeightHanging style={{ fontSize: "20px" }} />
                  </span>
                  <span className="ms-2">Products Enquiries</span>
                </li>
              </Link> */}

              {/* <Link to="/bookinglist" onClick={handleNavCollapse}>
                <li className="a-ele ">
                  <span>
                    <FaWeightHanging style={{ fontSize: "20px" }} />
                  </span>
                  <span className="ms-2">Booking Service List</span>
                </li>
              </Link>
              */}
            </ul>
          </div>
        </div>
      </Navbar>
    </div>
  );
};

export default Side;
