import React, { useState, useEffect, useMemo, useContext, useRef } from "react";
import "../Styles/Banner.css";

import { Button, Modal, Form, Dropdown, InputGroup } from "react-bootstrap";
import { FaUser, FaEye, FaEyeSlash, FaWallet } from "react-icons/fa";

import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import ApartmentIcon from "@mui/icons-material/Apartment"; // Icon to represent apartments
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Nav from "react-bootstrap/Nav";
import { MdAccountCircle } from "react-icons/md";
import { MdOutlineLogout } from "react-icons/md";
import { FaLock } from "react-icons/fa";
import { BiMessageDetail } from "react-icons/bi";
import { IoLogoYoutube, IoSearchCircleOutline } from "react-icons/io5";
import { ImSpoonKnife } from "react-icons/im";
import Offcanvas from "react-bootstrap/Offcanvas";
import { IoMdHeart } from "react-icons/io";
import { GrDocumentUser } from "react-icons/gr";
import Swal2 from "sweetalert2";
import swal from "sweetalert";

import { FaSquareWhatsapp } from "react-icons/fa6";
import { WalletContext } from "../WalletContext";

import Selectlocation from "../assets/selectlocation.svg";
import UserIcons from "../assets/userp.svg";

import SearchIcon from "../assets/search.svg";
import Logo from "../assets/logo-container.svg";
import UserBanner from "./UserBanner";
import ProfileOffcanvas from "./Navbar2";
import LocationModal from "./LocationModal";
import LocationModal2 from "./LocationModal2";

// const Banner = ({ Carts, getAllOffer, hubName, setHubName }) => {
const Banner = ({ Carts, getAllOffer }) => {
  const addresstype = localStorage.getItem("addresstype");
  const corporateaddress = JSON.parse(localStorage.getItem("coporateaddress"));
  const user = JSON.parse(localStorage.getItem("user"));

  const navigate = useNavigate("");
  const [OTP, setOTP] = useState(["", "", "", ""]);
  const [PasswordShow, setPasswordShow] = useState(false);

  const { wallet, walletSeting, rateorder, rateMode } =
    useContext(WalletContext);
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [show2, setShow2] = useState(false);
  const handleClose2 = () => setShow2(false);
  const handleShow2 = () => setShow2(true);
  const [showCart, setShowCart] = useState(false);

  const [show3, setShow3] = useState(false);
  const handleClose3 = () => setShow3(false);
  const handleShow3 = () => {
    handleClose4();
    setShow3(true);
  };

  const [show4, setShow4] = useState(false);
  const handleShow4 = () => setShow4(true);
  const handleClose4 = () => setShow4(false);

  const [show5, setShow5] = useState(false);
  const handleClose5 = () => setShow5(false);
  const handleShow5 = () => setShow5(true);

  const [show7, setShow7] = useState(false);
  const handleClose7 = () => setShow7(false);
  const handleShow7 = () => setShow7(true);
  const [Mobile, setMobile] = useState("");

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

  const userLogin = async () => {
    if (!Mobile) {
      return Swal2.fire({
        toast: true,
        position: "bottom",
        icon: "info",
        title: `Enter Your Mobile Number`,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: "me-small-toast",
          title: "me-small-toast-title",
        },
      });
    }
    try {
      const config = {
        url: "/User/Sendotp",
        method: "post",
        baseURL: "http://localhost:7013/api",
        headers: { "content-type": "application/json" },
        data: {
          Mobile: Mobile,
        },
      };

      const res = await axios(config);
      if (res.status === 401) {
        return Swal2.fire({
          toast: true,
          position: "bottom",
          icon: "error",
          title: `Invalid Mobile Number`,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          customClass: {
            popup: "me-small-toast",
            title: "me-small-toast-title",
          },
        });
      }
      if (res.status === 402) {
        return Swal2.fire({
          toast: true,
          position: "bottom",
          icon: "error",
          title: `Error sending OTP`,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          customClass: {
            popup: "me-small-toast",
            title: "me-small-toast-title",
          },
        });
      }
      if (res.status === 200) {
        handleClose3();
        handleShow7();
      }
    } catch (error) {
      Swal2.fire({
        toast: true,
        position: "bottom",
        icon: "error",
        title: error.response.data.error || `Something went wrong!`,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: "me-small-toast",
          title: "me-small-toast-title",
        },
      });
    }
  };

  const [show8, setShow8] = useState(false);
  const handleClose8 = () => setShow8(false);
  const handleShow8 = () => setShow8(true);

  const handleShowCart = () => setShowCart(true);

  const phoneNumber = "7204188504";
  const message = "Hello! I need assistance.";
  const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    message
  )}`;

  const logOut = () => {
    swal({
      title: "Yeah!",
      text: "Successfully Logged Out",
      icon: "success",
      button: "Ok!",
    });
    setTimeout(() => {
      window.location.assign("/");
    }, 5000);
    localStorage.clear();
  };

  const [apartmentdata, setapartmentdata] = useState([]);
  const getapartmentd = async () => {
    try {
      let res = await axios.get(
        "http://localhost:7013/api/admin/getapartment"
      );
      if (res.status === 200) {
        setapartmentdata(res.data.corporatedata);
      }
    } catch (error) {
      // console.log(error);
    }
  };

  useEffect(() => {
    getapartmentd();
  }, []);

  const [corporatedata, setcorporatedata] = useState([]);
  const getcorporate = async () => {
    try {
      let res = await axios.get(
        "http://localhost:7013/api/admin/getcorporate"
      );
      if (res.status === 200) {
        setcorporatedata(res.data.corporatedata);
      }
    } catch (error) {
      // console.log(error);
    }
  };

  useEffect(() => {
    getcorporate();
  }, []);

  const [storyLength, setStoryLength] = useState(0);

  useEffect(() => {
    const getAddWebstory = async () => {
      try {
        let res = await axios.get(
          "http://localhost:7013/api/admin/getstories"
        );
        if (res.status === 200) {
          setStoryLength(res.data.getbanner.length);
        }
      } catch (error) {
        // console.log(error);
      }
    };
    getAddWebstory();
  }, []);

  const address = JSON.parse(
    localStorage.getItem(
      addresstype === "apartment" ? "address" : "coporateaddress"
    )
  );

  const Handeledata = (ab, def) => {
    try {
      if (ab) {
        if (!user) return navigate("/", { replace: true });
        let data = JSON.parse(ab);
        const addressData = {
          Address: data?.Address,
          Delivarycharge: data?.apartmentdelivaryprice,
          doordelivarycharge: data?.doordelivaryprice,
          apartmentname: data?.Apartmentname,
          pincode: data?.pincode,
          approximatetime: data?.approximatetime,
          prefixcode: data?.prefixcode,
          name: ab?.Name || user?.Fname || "",
          flatno: ab?.fletNumber || "",
          mobilenumber: ab?.Number || user?.Mobile || "",
          towerName: ab?.towerName ? ab?.towerName : "",
          lunchSlots: data?.lunchSlots ? data?.lunchSlots : [],
          dinnerSlots: data?.dinnerSlots ? data?.dinnerSlots : [],
          deliverypoint: data?.deliverypoint ? data?.deliverypoint : "",
          locationType: data?.locationType || "",
        };
        if (!def) {
          saveSelectedAddress(data);
        }

        if (addresstype === "apartment") {
          localStorage.setItem("address", JSON.stringify(addressData));
        } else {
          localStorage.setItem("coporateaddress", JSON.stringify(addressData));
        }
      }
    } catch (error) {
      // console.log(error);
    }
  };

  //Request Location
  const [Name, setName] = useState("");
  const [Number, setNumber] = useState("");
  const [ApartmentName, setApartmentName] = useState("");
  const [Message, setMessage] = useState("");

  function validateIndianMobileNumber(mobileNumber) {
    const regex = /^[6-9]\d{9}$/;
    return regex.test(mobileNumber);
  }

  const Requestaddress = async () => {
    try {
      if (!Name) {
        return alert("Please Add Your Name");
      }
      if (!Number) {
        return alert("Please Add Your Contact Number");
      }
      if (!ApartmentName) {
        return alert("Please Add Apartment Name");
      }
      if (!Message) {
        return alert("Please Add Your Address");
      }
      if (!validateIndianMobileNumber(Number)) {
        return Swal2.fire({
          toast: true,
          position: "bottom",
          icon: "error",
          title: `Invalid Mobile Number`,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          customClass: {
            popup: "me-small-toast",
            title: "me-small-toast-title",
          },
        });
      }
      const config = {
        url: "User/EnquiryEnquiry",
        method: "post",
        baseURL: "http://localhost:7013/api/",
        header: { "content-type": "application/json" },
        data: {
          Name: Name,
          Number: Number,
          ApartmentName: ApartmentName,
          Message: Message,
        },
      };
      const res = await axios(config);
      if (res.status === 200) {
        toast.success("Request Submitted Successfully.");
        handleClose2();
        setName("");
        setNumber("");
        setApartmentName("");
        setMessage("");
      }
    } catch (error) {
      // console.log(error);
    }
  };

  const verifyOTP = async () => {
    try {
      if (!OTP) {
        return Swal2.fire({
          toast: true,
          position: "bottom",
          icon: "error",
          title: `Enter a valid OTP`,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          customClass: {
            popup: "me-small-toast",
            title: "me-small-toast-title",
          },
        });
      }
      const config = {
        url: "User/mobileotpverification",
        method: "post",
        baseURL: "http://localhost:7013/api/",
        header: { "content-type": "application/json" },
        data: {
          Mobile: Mobile,
          otp: OTP,
        },
      };
      const res = await axios(config);
      if (res.status === 200) {
        localStorage.setItem("user", JSON.stringify(res.data.details));
        sessionStorage.setItem("user", JSON.stringify(res.data.details));
        Swal2.fire({
          toast: true,
          position: "bottom",
          icon: "success",
          title: `OTP verified successfully`,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          customClass: {
            popup: "me-small-toast",
            title: "me-small-toast-title",
          },
        });
        window.location.reload();
      }
    } catch (error) {
      Swal2.fire({
        toast: true,
        position: "bottom",
        icon: "error",
        title: error.response.data.error || `Something went wrong!`,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: "me-small-toast",
          title: "me-small-toast-title",
        },
      });
    }
  };

  const [selectedAddress, setSelectedAddress] = useState({});

  const getSelectedAddress = async () => {
    try {
      let res = await axios.get(
        `http://localhost:7013/api/user/getSelectedAddressByUserIDAddType/${user?._id}/${addresstype}`
      );
      if (res.status === 200) {
        setSelectedAddress(res.data.getdata);
      }
    } catch (error) {
      // console.log(error);
    }
  };

  useEffect(() => {
    if (user) {
      getSelectedAddress();
    }
  }, []);

  useEffect(() => {
    if (selectedAddress) {
      if (addresstype === "apartment") {
        const am = apartmentdata.find(
          (ele) => ele?._id?.toString() === selectedAddress?.addressid
        );
        if (am) {
          Handeledata(JSON.stringify({ ...am, ...selectedAddress }), "def");
        }
      } else {
        const co = corporatedata.find(
          (ele) => ele?._id?.toString() === selectedAddress?.addressid
        );
        if (co) {
          Handeledata(JSON.stringify({ ...co, ...selectedAddress }), "def");
        }
      }
    }
  }, [selectedAddress, addresstype, apartmentdata, corporatedata]);

  const saveSelectedAddress = async (data) => {
    try {
      if (!user) return;
      let res = await axios.post(
        `http://localhost:7013/api/user/addressadd`,
        {
          Name: user?.Fname,
          Number: user?.Mobile,
          userId: user?._id,
          ApartmentName: data?.Apartmentname,
          addresstype: addresstype,
          addressid: data?._id,
        }
      );
    } catch (error) {
      // console.log(error);
    }
  };

  const inputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // Get customer ID from localStorage
  const getCustomerId = () => {
    return user?._id;
  };

  // Get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  const [userData, setUserData] = useState([]);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "" }), 3000);
  };

  const [primaryAddressId, setPrimaryAddressId] = useState(null);
  const [primaryAddress, setPrimaryAddress] = useState(null);

  // 1. Wrap fetchAddresses in useCallback to keep the function stable
  const fetchAddresses = React.useCallback(async () => {
    try {
      setLoading(true);
      const customerId = user?._id; // Safe access

      if (!customerId) {
        // Don't throw error here, just return, allows for smoother logout/no-user state
        return;
      }

      const response = await fetch(
        `http://localhost:7013/api/User/customers/${customerId}/addresses`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch addresses");
      }

      const result = await response.json();

      if (result.success) {
        const addresses = result.addresses || [];
        setAddresses(addresses);
        setPrimaryAddressId(result.primaryAddress || null);

        const primaryAddr = addresses.find(
          (addr) => addr._id === result.primaryAddress
        );
        setPrimaryAddress(primaryAddr || null);
        // if (primaryAddr) {
        //         localStorage.setItem("primaryAddress", JSON.stringify(primaryAddr));
        //     }
        //      else {
        //         localStorage.removeItem("primaryAddress"); // Clean up if no primary exists
        //     }

        if (addresses && addresses.length > 0) {
          const firstType = addresses[0].addressType;
          setExpandedSections({ [firstType]: true });
        }
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setLoading(false);
    }
  }, [user?._id]); // Re-create function only if ID changes

  // 2. Update the useEffect to depend on user._id (or the memoized function)
  useEffect(() => {
    if (user?._id) {
      fetchAddresses();
    }
  }, [fetchAddresses]);

  // ... existing code ...

  // Handle location click - show toast and redirect if not logged in
  const handleLocationClick = () => {
    if (!user) {
      Swal2.fire({
        toast: true,
        position: "bottom",
        icon: "info",
        title: `Please login!`,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: "me-small-toast",
          title: "me-small-toast-title",
        },
      });
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 1000);
      return;
    }
    // If user is logged in, open location modal
    setShowLocationModal(true);
  };

  const [currentLocation, setCurrentLocation] = useState(null);

  // ✅ Load from localStorage on component mount
  useEffect(() => {
    const savedLocation = localStorage.getItem("currentLocation");
    if (savedLocation) {
      try {
        setCurrentLocation(JSON.parse(savedLocation));
      } catch (e) {
        console.error("Invalid JSON in localStorage:", e);
      }
    }
  }, []);

  // ✅ Save to localStorage when currentLocation changes
  useEffect(() => {
    if (currentLocation) {
      localStorage.setItem("currentLocation", JSON.stringify(currentLocation));
    }
  }, [currentLocation]);

  // Set hubName when addresses are loaded
  // ✅ Set hubName from primaryAddress or currentLocation
  // useEffect(() => {
  //   if (setHubName) {
  //     if (primaryAddress?.hubName) {
  //       // Use hubName from primaryAddress if available
  //       setHubName(primaryAddress.hubName
  // );
  //     } else if (currentLocation?.hubName) {
  //       // Fall back to hubName from currentLocation
  //       setHubName(currentLocation.hubName);
  //     }
  //     // If neither has hubName, don't set anything (or set to empty string if needed)
  //   }
  // }, [primaryAddress, currentLocation, setHubName]);

  // Get display name for address
  const getDisplayName = (address) => {
    if (!address) return "";

    switch (address.addressType) {
      case "Home":
        return address.homeName || address.houseName || "";
      case "PG":
        return address.apartmentName || address.houseName || "";
      case "School":
        return address.schoolName || address.houseName || "";
      case "Work":
        return address.companyName || address.houseName || "";
      default:
        return address.houseName || "";
    }
  };

  // Get display address text
  const getDisplayAddress = () => {
    // Priority 1: Primary address (selected by user)
    if (primaryAddress) {
      return getDisplayName(primaryAddress);
    }

    // Priority 2: Current location (temporary selection)
    if (currentLocation?.fullAddress) {
      return currentLocation.fullAddress;
    }

    // Priority 3: Any saved address (fallback)
    if (addresses.length > 0) {
      return getDisplayName(addresses[0]);
    }

    // Default fallback
    return "Select Location";
  };

  return (
    <div>
      <div className="ban-container">
        <div className="mobile-banner-updated">
          <div className="screen-2 mb-3">
            <div className="w-100">
              <div className="d-flex flex-column align-items-start mt-2 gap-3">
                <div
                  className="d-flex align-items-center gap-2 w-100"
                  onClick={handleLocationClick}
                  style={{ cursor: "pointer" }}
                >
                  <img
                    src={Selectlocation}
                    alt="select-location"
                    className="flex-shrink-0"
                    style={{ width: "32px", height: "32px" }}
                  />

                  <div className="d-flex flex-column cursor-pointer flex-grow-1">
                    <p
                      className="select-location-text fw-semibold text-truncate mb-0"
                      style={{ maxWidth: "220px" }}
                      title={getDisplayAddress()}
                    >
                      {getDisplayAddress()}
                    </p>

                    {user && (
                      <p
                        className="select-location-text-small mb-0"
                        style={{
                          color: "rgba(255, 255, 255, 0.8)",
                        }}
                      >
                        {user?.Fname} | {user?.Mobile}
                        {primaryAddress && ""}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="d-flex gap-1 justify-content-between align-items-center">
              {user && ( // Only show if user is logged in
                <button
                  className="refer-earn-btn"
                  onClick={() => navigate("/refer")}
                >
                  <img
                    src="/Assets/gifticon.svg"
                    alt="refer"
                    className="refer-icon"
                  />
                  <span className="refer-earn-text">Refer & Earn</span>
                </button>
              )}

              <img
                src={UserIcons}
                alt="user-icon"
                onClick={handleShow8}
                className="p-2"
              />
            </div>
          </div>

          {!user && (
            <div className="benifits-container mb-3">
              <ul className="benifits-item">
                <li className="benifits-text">
                  ✨ Unlock more with an account:
                </li>
                <li className="benifits-text">Wallet bonuses 💰</li>
                <li className="benifits-text">Loyalty discounts 🎁</li>
                <li className="benifits-text">Special member pricing 💡</li>
                <li className="benifits-text">
                  👉 Sign up to redeem (new users only)
                </li>
              </ul>

              <button
                className="signup-button"
                onClick={() => navigate("/", { replace: true })}
              >
                Signup
              </button>
            </div>
          )}
        </div>

        {/* Request Aprtment modal */}
        <Modal show={show2} onHide={handleClose2} style={{ zIndex: "99999" }}>
          <Modal.Header closeButton>
            <Modal.Title>Request Add {addresstype}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                Requestaddress();
              }}
            >
              <Form.Control
                type="text"
                placeholder="Enter Name"
                style={{ marginTop: "18px" }}
                required
                onChange={(e) => setName(e.target.value)}
              />
              <Form.Control
                type="number"
                placeholder="Enter Contact Number"
                style={{ marginTop: "18px" }}
                required
                onChange={(e) => setNumber(e.target.value)}
                className="numberremove"
              />

              <Form.Control
                type="text"
                placeholder="Enter Apartment Name"
                style={{ marginTop: "18px" }}
                required
                onChange={(e) => setApartmentName(e.target.value)}
              />

              <Form.Control
                type="text"
                placeholder="Enter Address "
                style={{ marginTop: "18px" }}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button
                style={{
                  width: "100%",
                  marginTop: "24px",
                  color: "white",
                  textAlign: "center",
                  height: "30px",
                  borderRadius: "6px",
                  backgroundColor: "orangered",
                }}
                type="submit"
              >
                Send Request
              </button>
            </Form>
          </Modal.Body>
        </Modal>
        <ProfileOffcanvas show={show8} handleClose={handleClose8} />

        <Modal show={show3} backdrop="static" onHide={handleClose3}>
          <Modal.Header closeButton>
            <Modal.Title className="d-flex align-items-center gap-1">
              <FaLock color="#6B8E23" /> <span>Welcome to Dailydish</span>{" "}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <div className="login-whatsappwithicon">
                <FaSquareWhatsapp size={42} color="green" />

                <Form.Control
                  type="number"
                  placeholder="Enter Your WhatsApp Number"
                  value={Mobile}
                  onChange={(e) => setMobile(e.target.value)}
                />
              </div>

              <Button
                variant=""
                style={{
                  width: "100%",
                  marginTop: "24px",
                  backgroundColor: "#6B8E23",
                  color: "white",
                  textAlign: "center",
                }}
                onClick={() => {
                  if (!validateIndianMobileNumber(Mobile)) {
                    return Swal2.fire({
                      toast: true,
                      position: "bottom",
                      icon: "error",
                      title: `Invalid Mobile Number`,
                      showConfirmButton: false,
                      timer: 3000,
                      timerProgressBar: true,
                      customClass: {
                        popup: "me-small-toast",
                        title: "me-small-toast-title",
                      },
                    });
                  }
                  userLogin();
                }}
              >
                Send otp
              </Button>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose3}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal
          show={show7}
          onHide={handleClose7}
          size="sm"
          style={{
            zIndex: "99999",
            position: "absolute",
            top: "30%",
            left: "0%",
          }}
        >
          <Modal.Header closeButton>
            <Modal.Title>Enter OTP</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <span style={{ fontSize: "13px" }}>
              An OTP has been sent to your whatsapp
            </span>
            <div className="d-flex gap-1 mt-3 mb-3">
              <InputGroup className="mb-2" style={{ background: "white" }}>
                <Form.Control
                  type={PasswordShow ? "text" : "password"}
                  className="login-input"
                  placeholder="Enter OTP"
                  aria-describedby="basic-addon1"
                  onChange={(e) => setOTP(e.target.value)}
                />
                <Button
                  variant=""
                  style={{ borderRadius: "0px", border: "1px solid black" }}
                  onClick={() => setPasswordShow(!PasswordShow)}
                  className="passbtn"
                >
                  {PasswordShow ? <FaEye /> : <FaEyeSlash />}
                </Button>
              </InputGroup>
            </div>
            <div>
              <Button
                variant=""
                onClick={verifyOTP}
                style={{
                  width: "100%",
                  marginTop: "24px",
                  backgroundColor: "#6B8E23",
                  color: "white",
                  textAlign: "center",
                }}
              >
                Continue
              </Button>
            </div>
          </Modal.Body>
        </Modal>
      </div>
      <div className="ban-container">
        <div className="mobile-banner" style={{ position: "relative" }}>
          {user && !address && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "#f9f8f6",
                zIndex: 10,
                pointerEvents: "none",
                opacity: 0.8,
              }}
            ></div>
          )}
          <UserBanner />
        </div>
      </div>
      <LocationModal2
        show={showLocationModal}
        onClose={() => {
          setShowLocationModal(false);
          // Refresh addresses when modal closes to get updated primary address
          if (user) {
            fetchAddresses();
          }
        }}
      />
    </div>
  );
};

export default Banner;
