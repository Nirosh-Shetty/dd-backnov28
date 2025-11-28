// import React, { useState, useEffect } from "react";
// import { Card, Button, Spinner, Alert } from "react-bootstrap";
// import { useNavigate } from "react-router-dom";
// import {
//   FaEdit,
//   FaTrash,
//   FaCheckCircle,
//   FaMapMarkerAlt,
//   FaPlus,
//   FaTimesCircle,
// } from "react-icons/fa";
// import locationpng from "./../assets/deliverylocation.svg";
// import homeimg from "./../assets/ion_home-outline.png";
// import homeimg2 from "./../assets/ion_home-outline-white.svg";
// import apartmentimg from "./../assets/apartment.png";
// import apartmentimg2 from "./../assets/tabler_building-skyscraper-white.svg";
// import workimg from "./../assets/streamline-ultimate_work-from-home-user-sofa.png";
// import workimg2 from "./../assets/streamline-ultimate_work-from-home-user-sofa-white.svg";
// import schoolimg from "./../assets/streamline-ultimate-color_study-exam-math.png";
// import schoolimg2 from "./../assets/streamline-ultimate-color_study-exam-math-white.png";
// import "../Styles/wallet.css";
// import "./AddressManagement.css";

// const AddressManagement = () => {
//   const navigate = useNavigate();
//   const [addresses, setAddresses] = useState([]);
//   const [primaryAddressId, setPrimaryAddressId] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [actionLoading, setActionLoading] = useState(false);
//   const [alert, setAlert] = useState({ show: false, message: "", type: "" });
//   const [selectedType, setSelectedType] = useState("Home");

//   const isLargeScreen = window.innerWidth >= 768;

//   // Address type options - same as your location confirmation
//   const addressTypes = [
//     { key: "Home", label: "Home", icon: homeimg, icon2: homeimg2 },
//     {
//       key: "PG",
//       label: "PG/ Apartment",
//       icon: apartmentimg,
//       icon2: apartmentimg2,
//     },
//     { key: "School", label: "School", icon: schoolimg, icon2: schoolimg2 },
//     { key: "Work", label: "Work", icon: workimg, icon2: workimg2 },
//   ];

//   // Get customer ID from localStorage
//   const getCustomerId = () => {
//     return JSON.parse(localStorage.getItem("user"))?._id;
//   };

//   // Get auth headers
//   const getAuthHeaders = () => {
//     const token = localStorage.getItem("token");
//     return {
//       "Content-Type": "application/json",
//       ...(token && { Authorization: `Bearer ${token}` }),
//     };
//   };

//   // Fetch addresses from API
//   const fetchAddresses = async () => {
//     try {
//       setLoading(true);
//       const customerId = getCustomerId();

//       if (!customerId) {
//         throw new Error("Customer ID not found. Please login again.");
//       }

//       const response = await fetch(
//         `http://localhost:7013/api/User/customers/${customerId}/addresses`,
//         {
//           method: "GET",
//           headers: getAuthHeaders(),
//         }
//       );

//       if (!response.ok) {
//         throw new Error("Failed to fetch addresses");
//       }

//       const result = await response.json();

//       if (result.success) {
//         setAddresses(result.addresses || []);
//         setPrimaryAddressId(result.primaryAddress || null);
//       } else {
//         throw new Error(result.message || "Failed to fetch addresses");
//       }
//     } catch (error) {
//       console.error("Error fetching addresses:", error);
//       showAlert(error.message || "Failed to load addresses", "danger");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAddresses();
//   }, []);

//   const handleGoBack = () => {
//     navigate(-1);
//   };

//   const handleAddAddress = () => {
//     navigate("/location");
//   };

//   const handleEditAddress = (address) => {
//     console.log("edit address ", address);
//     navigate("/location", {
//       state: {
//         editingAddress: address,
//       },
//     });
//   };

//   const handleDeleteAddress = async (addressId) => {
//     if (!window.confirm("Are you sure you want to delete this address?")) {
//       return;
//     }

//     try {
//       setActionLoading(true);
//       const customerId = getCustomerId();

//       if (!customerId) {
//         throw new Error("Customer ID not found. Please login again.");
//       }

//       const response = await fetch(
//         `http://localhost:7013/api/User/customers/${customerId}/addresses/${addressId}`,
//         {
//           method: "DELETE",
//           headers: getAuthHeaders(),
//         }
//       );

//       if (!response.ok) {
//         throw new Error("Failed to delete address");
//       }

//       const result = await response.json();

//       if (result.success) {
//         // Update local state
//         setAddresses((prev) => prev.filter((addr) => addr._id !== addressId));

//         // If deleted address was primary, clear primary address
//         if (primaryAddressId === addressId) {
//           setPrimaryAddressId(null);
//         }

//         showAlert("Address deleted successfully!", "success");
//       } else {
//         throw new Error(result.message || "Failed to delete address");
//       }
//     } catch (error) {
//       console.error("Error deleting address:", error);
//       showAlert(error.message || "Failed to delete address", "danger");
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const handleSetPrimary = async (addressId) => {
//     try {
//       setActionLoading(true);
//       const customerId = getCustomerId();

//       if (!customerId) {
//         throw new Error("Customer ID not found. Please login again.");
//       }

//       const response = await fetch(
//         `http://localhost:7013/api/User/customers/${customerId}/addresses/${addressId}/primary`,
//         {
//           method: "PATCH",
//           headers: getAuthHeaders(),
//         }
//       );

//       if (!response.ok) {
//         throw new Error("Failed to set primary address");
//       }

//       const result = await response.json();

//       if (result.success) {
//         // Update primary address in local state
//         setPrimaryAddressId(addressId);
//         showAlert("Primary address set successfully!", "success");
//       } else {
//         throw new Error(result.message || "Failed to set primary address");
//       }
//     } catch (error) {
//       console.error("Error setting primary address:", error);
//       showAlert(error.message || "Failed to set primary address", "danger");
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const handleRemovePrimary = async () => {
//     try {
//       setActionLoading(true);
//       const customerId = getCustomerId();

//       if (!customerId) {
//         throw new Error("Customer ID not found. Please login again.");
//       }

//       const response = await fetch(
//         `http://localhost:7013/api/User/customers/${customerId}/primary-address/remove`,
//         {
//           method: "PATCH",
//           headers: getAuthHeaders(),
//         }
//       );

//       if (!response.ok) {
//         throw new Error("Failed to remove primary address");
//       }

//       const result = await response.json();

//       if (result.success) {
//         // Clear primary address in local state
//         setPrimaryAddressId(null);
//         showAlert("Primary address removed successfully!", "success");
//       } else {
//         throw new Error(result.message || "Failed to remove primary address");
//       }
//     } catch (error) {
//       console.error("Error removing primary address:", error);
//       showAlert(error.message || "Failed to remove primary address", "danger");
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const showAlert = (message, type) => {
//     setAlert({ show: true, message, type });
//     setTimeout(() => setAlert({ show: false, message: "", type: "" }), 3000);
//   };

//   // Get the primary name for each address type
//   const getPrimaryName = (address) => {
//     switch (address.addressType) {
//       case "Home":
//         return address.homeName || address.houseName;
//       case "PG":
//         return address.apartmentName || address.houseName;
//       case "School":
//         return address.schoolName || address.houseName;
//       case "Work":
//         return address.companyName || address.houseName;
//       default:
//         return address.houseName;
//     }
//   };

//   const formatAddressDetails = (address) => {
//     let details = [];

//     if (address.addressType === "Home") {
//       if (address.landmark) details.push(`Landmark: ${address.landmark}`);
//       if (address.floor) details.push(`Floor: ${address.floor}`);
//     } else if (address.addressType === "PG") {
//       if (address.towerBlock) details.push(`Block: ${address.towerBlock}`);
//       if (address.flat) details.push(`Flat: ${address.flat}`);
//       if (address.floor) details.push(`Floor: ${address.floor}`);
//     } else if (address.addressType === "School") {
//       if (address.studentInformation?.studentName)
//         details.push(`Student: ${address.studentInformation.studentName}`);
//       if (address.studentInformation?.studentClass)
//         details.push(`Class: ${address.studentInformation.studentClass}`);
//       if (address.studentInformation?.studentSection)
//         details.push(`Section: ${address.studentInformation.studentSection}`);
//     } else if (address.addressType === "Work") {
//       if (address.floorNo) details.push(`Floor: ${address.floorNo}`);
//     }

//     return details;
//   };

//   // Filter addresses by selected type
//   const filteredAddresses = addresses.filter(
//     (addr) => addr.addressType === selectedType
//   );

//   // Check if an address is primary
//   const isPrimaryAddress = (addressId) => {
//     return primaryAddressId === addressId;
//   };

//   return (
//     <div className="ban-containersd">
//       <div className="checkoutcontainer">
//         <div className="mobile-banner-updated">
//           <div className="screen-checkout mb-2">
//             <div>
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 width="36"
//                 height="36"
//                 viewBox="0 0 36 36"
//                 fill="none"
//                 onClick={handleGoBack}
//                 className="cursor-pointer"
//               >
//                 <path
//                   d="M11.7375 19.5002L19.0875 26.8502C19.3875 27.1502 19.5315 27.5002 19.5195 27.9002C19.5075 28.3002 19.351 28.6502 19.05 28.9502C18.75 29.2252 18.4 29.3692 18 29.3822C17.6 29.3952 17.25 29.2512 16.95 28.9502L7.05001 19.0502C6.90001 18.9002 6.79351 18.7377 6.73051 18.5627C6.66751 18.3877 6.63701 18.2002 6.63901 18.0002C6.64101 17.8002 6.67251 17.6127 6.73351 17.4377C6.79451 17.2627 6.90051 17.1002 7.05151 16.9502L16.9515 7.05019C17.2265 6.77519 17.5705 6.6377 17.9835 6.6377C18.3965 6.6377 18.7525 6.77519 19.0515 7.05019C19.3515 7.35019 19.5015 7.7067 19.5015 8.1197C19.5015 8.5327 19.3515 8.8887 19.0515 9.1877L11.7375 16.5002H28.5C28.925 16.5002 29.2815 16.6442 29.5695 16.9322C29.8575 17.2202 30.001 17.5762 30 18.0002C29.999 18.4242 29.855 18.7807 29.568 19.0697C29.281 19.3587 28.925 19.5022 28.5 19.5002H11.7375Z"
//                   fill="#FAFAFA"
//                 />
//               </svg>
//             </div>
//             <h3 className="checkout-title">My Addresses</h3>
//           </div>
//         </div>
//       </div>

//       <div
//         className="mobile-banner-updated container"
//         style={{ backgroundColor: "white" }}
//       >
//         {/* Alert */}
//         {alert.show && (
//           <Alert variant={alert.type} className="mb-3">
//             {alert.message}
//           </Alert>
//         )}

//         {/* Add Address Card */}
//         <div className="wallet-card mb-4">
//           <div className="card-content">
//             <div className="header-section">
//               <div className="wallet-icon">
//                 <FaMapMarkerAlt size={40} color="#6B8E23" />
//               </div>
//               <div className="card-title">
//                 <div className="title-textP">Manage Addresses</div>
//               </div>
//             </div>
//             <div className="balance-section">
//               <div className="balance-info">
//                 <div className="balance-label">
//                   <div className="label-text">Saved Addresses</div>
//                 </div>
//                 <div className="balance-amount">
//                   <div className="amount-text">
//                     {addresses.length} Addresses
//                   </div>
//                 </div>
//               </div>
//               <div className="transaction-summary" onClick={handleAddAddress}>
//                 <div className="summary-content">
//                   <div className="summary-label">
//                     <div className="summary-text">Add New Address</div>
//                   </div>
//                 </div>
//                 <FaPlus size={16} color="#6B8E23" />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Primary Address Actions */}
//         {primaryAddressId && (
//           <div className="mb-3 p-3" style={{
//             backgroundColor: "#f8f9fa",
//             borderRadius: "8px",
//             border: "1px solid #dee2e6"
//           }}>
//             <div className="d-flex justify-content-between align-items-center">
//               <div>
//                 <small className="text-muted">Current Primary Address</small>
//                 <div className="d-flex align-items-center mt-1">
//                   <FaCheckCircle className="text-success me-2" />
//                   <span style={{ fontWeight: "500" }}>
//                     {addresses.find(addr => addr._id === primaryAddressId)?.houseName || "Primary Address"}
//                   </span>
//                 </div>
//               </div>
//               <Button
//                 variant="outline-danger"
//                 size="sm"
//                 onClick={handleRemovePrimary}
//                 disabled={actionLoading}
//               >
//                 <FaTimesCircle className="me-1" />
//                 Remove Primary
//               </Button>
//             </div>
//           </div>
//         )}

//         {/* Address Type Selection - Same style as location confirmation */}
//         <div style={{ marginBottom: "20px" }}>
//           <div
//             style={{
//               display: "grid",
//               gridTemplateColumns: "repeat(4, 1fr)",
//               gap: "8px",
//             }}
//           >
//             {addressTypes.map((type) => (
//               <button
//                 key={type.key}
//                 type="button"
//                 onClick={() => setSelectedType(type.key)}
//                 style={{
//                   width: isLargeScreen ? "auto" : "75px",
//                   height: isLargeScreen ? "55px" : "43px",
//                   padding: "8px",
//                   borderRadius: "12px",
//                   border: "1.2px solid #F5DEB3",
//                   backgroundColor:
//                     selectedType === type.key ? "#6B8E23" : "#FFF8DC",
//                   cursor: "pointer",
//                   transition: "all 0.2s ease",
//                   display: "flex",
//                   flexDirection: "row",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   gap: "4px",
//                   opacity: 1,
//                 }}
//               >
//                 <img
//                   src={selectedType === type.key ? type.icon2 : type.icon}
//                   alt={type.label}
//                   style={{
//                     width: isLargeScreen ? "24px" : "16px",
//                     height: isLargeScreen ? "24px" : "16px",
//                     objectFit: "contain",
//                   }}
//                 />
//                 <span
//                   style={{
//                     fontSize: "12px",
//                     fontWeight: "500",
//                     fontFamily: "Inter",
//                     color: selectedType === type.key ? "#fff" : "#000",
//                   }}
//                 >
//                   {type.label}
//                 </span>
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Address List */}
//         {loading ? (
//           <div className="text-center py-4">
//             <Spinner animation="border" color="#6B8E23" />
//             <p className="mt-2">Loading addresses...</p>
//           </div>
//         ) : addresses.length === 0 ? (
//           <Card className="text-center py-5">
//             <Card.Body>
//               <FaMapMarkerAlt size={48} color="#6B8E23" className="mb-3" />
//               <h5>No Addresses Saved</h5>
//               <p className="text-muted">
//                 Add your first delivery address to get started
//               </p>
//               <Button
//                 variant="success"
//                 onClick={handleAddAddress}
//                 style={{ backgroundColor: "#6B8E23", border: "none" }}
//               >
//                 <FaPlus className="me-2" />
//                 Add Your First Address
//               </Button>
//             </Card.Body>
//           </Card>
//         ) : filteredAddresses.length === 0 ? (
//           <Card className="text-center py-5">
//             <Card.Body>
//               <FaMapMarkerAlt size={48} color="#6B8E23" className="mb-3" />
//               <h5>
//                 No {addressTypes.find((t) => t.key === selectedType)?.label}{" "}
//                 Addresses
//               </h5>
//               <p className="text-muted">
//                 No {selectedType.toLowerCase()} addresses saved yet
//               </p>
//               <Button
//                 variant="success"
//                 onClick={handleAddAddress}
//                 style={{ backgroundColor: "#6B8E23", border: "none" }}
//               >
//                 <FaPlus className="me-2" />
//                 Add {
//                   addressTypes.find((t) => t.key === selectedType)?.label
//                 }{" "}
//                 Address
//               </Button>
//             </Card.Body>
//           </Card>
//         ) : (
//           <div className="address-list">
//             {filteredAddresses.map((address) => (
//               <Card
//                 key={address._id}
//                 className={`mb-3 ${isPrimaryAddress(address._id) ? "border-success" : ""}`}
//                 style={{
//                   border: isPrimaryAddress(address._id) ? "2px solid #6B8E23" : "1px solid #e0e0e0",
//                   borderRadius: "12px",
//                   backgroundColor: isPrimaryAddress(address._id) ? "#f8fff8" : "white",
//                 }}
//               >
//                 <Card.Body>
//                   {/* Address Header */}
//                   <div className="d-flex justify-content-between align-items-start mb-3">
//                     <div className="d-flex align-items-start flex-grow-1">
//                       <div style={{ marginRight: "12px" }}>
//                         <img
//                           src={locationpng}
//                           alt=""
//                           style={{ width: "20px", height: "20px" }}
//                         />
//                       </div>
//                       <div className="flex-grow-1">
//                         <div className="d-flex align-items-center mb-1">
//                           <h6
//                             className="mb-0"
//                             style={{
//                               color: "#2c2c2c",
//                               fontFamily: "Inter",
//                               fontWeight: "600",
//                               fontSize: "16px",
//                             }}
//                           >
//                             {getPrimaryName(address)}
//                           </h6>
//                           {isPrimaryAddress(address._id) && (
//                             <span
//                               style={{
//                                 marginLeft: "8px",
//                                 fontSize: "10px",
//                                 color: "#6B8E23",
//                                 fontWeight: "500",
//                                 backgroundColor: "#f0f9f0",
//                                 padding: "2px 6px",
//                                 borderRadius: "4px",
//                               }}
//                             >
//                               PRIMARY
//                             </span>
//                           )}
//                         </div>
//                         <p
//                           style={{
//                             margin: 0,
//                             color: "#666",
//                             fontSize: "12px",
//                             fontFamily: "Inter",
//                             lineHeight: "1.4",
//                           }}
//                         >
//                           {address.fullAddress}
//                         </p>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Address Details */}
//                   <div className="address-details mb-3">
//                     {formatAddressDetails(address).map((detail, index) => (
//                       <div key={index} className="address-detail-item">
//                         <small
//                           className="text-muted"
//                           style={{ fontFamily: "Inter" }}
//                         >
//                           {detail}
//                         </small>
//                       </div>
//                     ))}
//                   </div>

//                   {/* Action Buttons */}
//                   <div className="d-flex justify-content-between align-items-center">
//                     <div>
//                       {!isPrimaryAddress(address._id) && (
//                         <Button
//                           variant="outline-success"
//                           size="sm"
//                           onClick={() => handleSetPrimary(address._id)}
//                           disabled={actionLoading}
//                           className="primary-btn"
//                         >
//                           <FaCheckCircle className="me-1" />
//                           Set as Primary
//                         </Button>
//                       )}
//                     </div>
//                     <div className="d-flex gap-2">
//                       <Button
//                         variant="outline-primary"
//                         size="sm"
//                         onClick={() => handleEditAddress(address)}
//                         disabled={actionLoading}
//                         className="edit-btn"
//                       >
//                         <FaEdit className="me-1" />
//                         Edit
//                       </Button>

//                       <Button
//                         variant="outline-danger"
//                         size="sm"
//                         onClick={() => handleDeleteAddress(address._id)}
//                         disabled={actionLoading}
//                         className="delete-btn"
//                       >
//                         <FaTrash className="me-1" />
//                         Delete
//                       </Button>
//                     </div>
//                   </div>
//                 </Card.Body>
//               </Card>
//             ))}
//           </div>
//         )}
//       </div>

//       <div className="mobile-banner"></div>
//     </div>
//   );
// };

// export default AddressManagement;

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, Button, Spinner, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaPlus,
  FaTimesCircle,
} from "react-icons/fa";
import locationpng from "./../assets/deliverylocation.svg";
import homeimg from "./../assets/ion_home-outline.png";
import homeimg2 from "./../assets/ion_home-outline-white.svg";
import apartmentimg from "./../assets/apartment.png";
import apartmentimg2 from "./../assets/tabler_building-skyscraper-white.svg";
import workimg from "./../assets/streamline-ultimate_work-from-home-user-sofa.png";
import workimg2 from "./../assets/streamline-ultimate_work-from-home-user-sofa-white.svg";
import schoolimg from "./../assets/streamline-ultimate-color_study-exam-math.png";
import schoolimg2 from "./../assets/streamline-ultimate-color_study-exam-math-white.png";
import "../Styles/wallet.css";
import "./AddressManagement.css";

const AddressManagement = () => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [primaryAddressId, setPrimaryAddressId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const [selectedType, setSelectedType] = useState("Home");

  const hasFetchedRef = useRef(false);
  const fetchAbortControllerRef = useRef(null);

  const isLargeScreen = window.innerWidth >= 768;

  // Address type options
  const addressTypes = [
    { key: "Home", label: "Home", icon: homeimg, icon2: homeimg2 },
    {
      key: "PG",
      label: "PG/ Apartment",
      icon: apartmentimg,
      icon2: apartmentimg2,
    },
    { key: "School", label: "School", icon: schoolimg, icon2: schoolimg2 },
    { key: "Work", label: "Work", icon: workimg, icon2: workimg2 },
  ];

  // Get customer ID from localStorage
  const getCustomerId = () => {
    return JSON.parse(localStorage.getItem("user"))?._id;
  };

  // Get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  // Background fetch to update cache
  const fetchAddressesInBackground = useCallback(async (customerId) => {
    try {
      const response = await fetch(
        `http://localhost:7013/api/User/customers/${customerId}/addresses`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const addresses = result.addresses || [];
          const primaryId = result.primaryAddress || null;

          // Update cache silently
          localStorage.setItem(
            `addresses_${customerId}`,
            JSON.stringify({ addresses, primaryAddress: primaryId })
          );
          localStorage.setItem(
            `addresses_timestamp_${customerId}`,
            Date.now().toString()
          );
        }
      }
    } catch (error) {
      console.error("Background fetch error:", error);
    }
  }, []);

  // OPTIMIZED: Fetch addresses with caching
  const fetchAddresses = useCallback(async () => {
    if (hasFetchedRef.current) return;

    try {
      setLoading(true);
      hasFetchedRef.current = true;

      const customerId = getCustomerId();

      if (!customerId) {
        throw new Error("Customer ID not found. Please login again.");
      }

      // Check localStorage cache first
      const cachedAddresses = localStorage.getItem(`addresses_${customerId}`);
      const cacheTimestamp = localStorage.getItem(
        `addresses_timestamp_${customerId}`
      );
      const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

      // Use cache if valid and recent
      if (cachedAddresses && cacheTimestamp) {
        const age = Date.now() - parseInt(cacheTimestamp);
        if (age < CACHE_DURATION) {
          const cached = JSON.parse(cachedAddresses);
          setAddresses(cached.addresses || []);
          setPrimaryAddressId(cached.primaryAddress || null);
          setLoading(false);

          // Fetch fresh data in background
          fetchAddressesInBackground(customerId);
          return;
        }
      }

      // Create AbortController for cancellation
      fetchAbortControllerRef.current = new AbortController();

      const response = await fetch(
        `http://localhost:7013/api/User/customers/${customerId}/addresses`,
        {
          method: "GET",
          headers: getAuthHeaders(),
          signal: fetchAbortControllerRef.current.signal,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch addresses");
      }

      const result = await response.json();

      if (result.success) {
        const addresses = result.addresses || [];
        const primaryId = result.primaryAddress || null;

        setAddresses(addresses);
        setPrimaryAddressId(primaryId);

        // Cache the results
        localStorage.setItem(
          `addresses_${customerId}`,
          JSON.stringify({ addresses, primaryAddress: primaryId })
        );
        localStorage.setItem(
          `addresses_timestamp_${customerId}`,
          Date.now().toString()
        );
      } else {
        throw new Error(result.message || "Failed to fetch addresses");
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error fetching addresses:", error);
        showAlert(error.message || "Failed to load addresses", "danger");
      }
    } finally {
      setLoading(false);
    }
  }, [fetchAddressesInBackground]);

  useEffect(() => {
    fetchAddresses();

    return () => {
      if (fetchAbortControllerRef.current) {
        fetchAbortControllerRef.current.abort();
      }
    };
  }, [fetchAddresses]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleAddAddress = () => {
    navigate("/location");
  };

  const handleEditAddress = (address) => {
    console.log("edit address ", address);
    navigate("/location", {
      state: {
        editingAddress: address,
      },
    });
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?")) {
      return;
    }

    try {
      setActionLoading(true);
      const customerId = getCustomerId();

      if (!customerId) {
        throw new Error("Customer ID not found. Please login again.");
      }

      const response = await fetch(
        `http://localhost:7013/api/User/customers/${customerId}/addresses/${addressId}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete address");
      }

      const result = await response.json();

      if (result.success) {
        // Update local state immediately
        const updatedAddresses = addresses.filter(
          (addr) => addr._id !== addressId
        );
        setAddresses(updatedAddresses);

        // If deleted address was primary, clear primary address
        let updatedPrimaryId = primaryAddressId;
        if (primaryAddressId === addressId) {
          updatedPrimaryId = null;
          setPrimaryAddressId(null);
          localStorage.removeItem("primaryAddress");
        }

        // Update cache
        localStorage.setItem(
          `addresses_${customerId}`,
          JSON.stringify({
            addresses: updatedAddresses,
            primaryAddress: updatedPrimaryId,
          })
        );
        localStorage.setItem(
          `addresses_timestamp_${customerId}`,
          Date.now().toString()
        );

        showAlert("Address deleted successfully!", "success");
      } else {
        throw new Error(result.message || "Failed to delete address");
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      showAlert(error.message || "Failed to delete address", "danger");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetPrimary = async (addressId) => {
    try {
      setActionLoading(true);
      const customerId = getCustomerId();

      if (!customerId) {
        throw new Error("Customer ID not found. Please login again.");
      }

      // Find the address being set as primary
      const primaryAddress = addresses.find((addr) => addr._id === addressId);

      // Update UI immediately
      setPrimaryAddressId(addressId);

      // Store primary address in localStorage
      if (primaryAddress) {
        localStorage.setItem("primaryAddress", JSON.stringify(primaryAddress));
      }

      // Update cache
      localStorage.setItem(
        `addresses_${customerId}`,
        JSON.stringify({
          addresses: addresses,
          primaryAddress: addressId,
        })
      );
      localStorage.setItem(
        `addresses_timestamp_${customerId}`,
        Date.now().toString()
      );

      showAlert("Primary address set successfully!", "success");

      // API call in background
      const response = await fetch(
        `http://localhost:7013/api/User/customers/${customerId}/addresses/${addressId}/primary`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        // Revert if API fails
        setPrimaryAddressId(null);
        localStorage.removeItem("primaryAddress");
        throw new Error("Failed to set primary address");
      }

      const result = await response.json();

      if (!result.success) {
        // Revert if API fails
        setPrimaryAddressId(null);
        localStorage.removeItem("primaryAddress");
        throw new Error(result.message || "Failed to set primary address");
      }
    } catch (error) {
      console.error("Error setting primary address:", error);
      showAlert(error.message || "Failed to set primary address", "danger");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemovePrimary = async () => {
    try {
      setActionLoading(true);
      const customerId = getCustomerId();

      if (!customerId) {
        throw new Error("Customer ID not found. Please login again.");
      }

      // Update UI immediately
      setPrimaryAddressId(null);
      localStorage.removeItem("primaryAddress");

      // Update cache
      localStorage.setItem(
        `addresses_${customerId}`,
        JSON.stringify({
          addresses: addresses,
          primaryAddress: null,
        })
      );
      localStorage.setItem(
        `addresses_timestamp_${customerId}`,
        Date.now().toString()
      );

      showAlert("Primary address removed successfully!", "success");

      // API call in background
      const response = await fetch(
        `http://localhost:7013/api/User/customers/${customerId}/primary-address/remove`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove primary address");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to remove primary address");
      }
    } catch (error) {
      console.error("Error removing primary address:", error);
      showAlert(error.message || "Failed to remove primary address", "danger");
    } finally {
      setActionLoading(false);
    }
  };

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "" }), 3000);
  };

  // Get the primary name for each address type
  const getPrimaryName = (address) => {
    switch (address.addressType) {
      case "Home":
        return address.homeName || address.houseName;
      case "PG":
        return address.apartmentName || address.houseName;
      case "School":
        return address.schoolName || address.houseName;
      case "Work":
        return address.companyName || address.houseName;
      default:
        return address.houseName;
    }
  };

  const formatAddressDetails = (address) => {
    let details = [];

    if (address.addressType === "Home") {
      if (address.landmark) details.push(`Landmark: ${address.landmark}`);
      if (address.floor) details.push(`Floor: ${address.floor}`);
    } else if (address.addressType === "PG") {
      if (address.towerBlock) details.push(`Block: ${address.towerBlock}`);
      if (address.flat) details.push(`Flat: ${address.flat}`);
      if (address.floor) details.push(`Floor: ${address.floor}`);
    } else if (address.addressType === "School") {
      if (address.studentInformation?.studentName)
        details.push(`Student: ${address.studentInformation.studentName}`);
      if (address.studentInformation?.studentClass)
        details.push(`Class: ${address.studentInformation.studentClass}`);
      if (address.studentInformation?.studentSection)
        details.push(`Section: ${address.studentInformation.studentSection}`);
    } else if (address.addressType === "Work") {
      if (address.floorNo) details.push(`Floor: ${address.floorNo}`);
    }

    return details;
  };

  // Filter addresses by selected type
  const filteredAddresses = addresses.filter(
    (addr) => addr.addressType === selectedType
  );

  // Check if an address is primary
  const isPrimaryAddress = (addressId) => {
    return primaryAddressId === addressId;
  };

  return (
    <div className="ban-containersd">
      <div className="checkoutcontainer">
        <div className="mobile-banner-updated">
          <div className="screen-checkout mb-2">
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="36"
                height="36"
                viewBox="0 0 36 36"
                fill="none"
                onClick={handleGoBack}
                className="cursor-pointer"
              >
                <path
                  d="M11.7375 19.5002L19.0875 26.8502C19.3875 27.1502 19.5315 27.5002 19.5195 27.9002C19.5075 28.3002 19.351 28.6502 19.05 28.9502C18.75 29.2252 18.4 29.3692 18 29.3822C17.6 29.3952 17.25 29.2512 16.95 28.9502L7.05001 19.0502C6.90001 18.9002 6.79351 18.7377 6.73051 18.5627C6.66751 18.3877 6.63701 18.2002 6.63901 18.0002C6.64101 17.8002 6.67251 17.6127 6.73351 17.4377C6.79451 17.2627 6.90051 17.1002 7.05151 16.9502L16.9515 7.05019C17.2265 6.77519 17.5705 6.6377 17.9835 6.6377C18.3965 6.6377 18.7525 6.77519 19.0515 7.05019C19.3515 7.35019 19.5015 7.7067 19.5015 8.1197C19.5015 8.5327 19.3515 8.8887 19.0515 9.1877L11.7375 16.5002H28.5C28.925 16.5002 29.2815 16.6442 29.5695 16.9322C29.8575 17.2202 30.001 17.5762 30 18.0002C29.999 18.4242 29.855 18.7807 29.568 19.0697C29.281 19.3587 28.925 19.5022 28.5 19.5002H11.7375Z"
                  fill="#FAFAFA"
                />
              </svg>
            </div>
            <h3 className="checkout-title">My Addresses</h3>
          </div>
        </div>
      </div>

      <div
        className="mobile-banner-updated container"
        style={{ backgroundColor: "white" }}
      >
        {/* Alert */}
        {alert.show && (
          <Alert variant={alert.type} className="mb-3">
            {alert.message}
          </Alert>
        )}

        {/* Add Address Card */}
        <div className="wallet-card mb-4">
          <div className="card-content">
            <div className="header-section">
              <div className="wallet-icon">
                <FaMapMarkerAlt size={40} color="#6B8E23" />
              </div>
              <div className="card-title">
                <div className="title-textP">Manage Addresses</div>
              </div>
            </div>
            <div className="balance-section">
              <div className="balance-info">
                <div className="balance-label">
                  <div className="label-text">Saved Addresses</div>
                </div>
                <div className="balance-amount">
                  <div className="amount-text">
                    {addresses.length} Addresses
                  </div>
                </div>
              </div>
              <div className="transaction-summary" onClick={handleAddAddress}>
                <div className="summary-content">
                  <div className="summary-label">
                    <div className="summary-text">Add New Address</div>
                  </div>
                </div>
                <FaPlus size={16} color="#6B8E23" />
              </div>
            </div>
          </div>
        </div>

        {/* Primary Address Actions */}
        {primaryAddressId && (
          <div
            className="mb-3 p-3"
            style={{
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
              border: "1px solid #dee2e6",
            }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <small className="text-muted">Current Primary Address</small>
                <div className="d-flex align-items-center mt-1">
                  <FaCheckCircle className="text-success me-2" />
                  <span style={{ fontWeight: "500" }}>
                    {addresses.find((addr) => addr._id === primaryAddressId)
                      ?.houseName || "Primary Address"}
                  </span>
                </div>
              </div>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={handleRemovePrimary}
                disabled={actionLoading}
              >
                <FaTimesCircle className="me-1" />
                Remove Primary
              </Button>
            </div>
          </div>
        )}

        {/* Address Type Selection */}
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "8px",
            }}
          >
            {addressTypes.map((type) => (
              <button
                key={type.key}
                type="button"
                onClick={() => setSelectedType(type.key)}
                style={{
                  width: isLargeScreen ? "auto" : "75px",
                  height: isLargeScreen ? "55px" : "43px",
                  padding: "8px",
                  borderRadius: "12px",
                  border: "1.2px solid #F5DEB3",
                  backgroundColor:
                    selectedType === type.key ? "#6B8E23" : "#FFF8DC",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                  opacity: 1,
                }}
              >
                <img
                  src={selectedType === type.key ? type.icon2 : type.icon}
                  alt={type.label}
                  style={{
                    width: isLargeScreen ? "24px" : "16px",
                    height: isLargeScreen ? "24px" : "16px",
                    objectFit: "contain",
                  }}
                />
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "500",
                    fontFamily: "Inter",
                    color: selectedType === type.key ? "#fff" : "#000",
                  }}
                >
                  {type.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Address List */}
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" style={{ color: "#6B8E23" }} />
            <p className="mt-2">Loading addresses...</p>
          </div>
        ) : addresses.length === 0 ? (
          <Card className="text-center py-5">
            <Card.Body>
              <FaMapMarkerAlt size={48} color="#6B8E23" className="mb-3" />
              <h5>No Addresses Saved</h5>
              <p className="text-muted">
                Add your first delivery address to get started
              </p>
              <Button
                variant="success"
                onClick={handleAddAddress}
                style={{ backgroundColor: "#6B8E23", border: "none" }}
              >
                <FaPlus className="me-2" />
                Add Your First Address
              </Button>
            </Card.Body>
          </Card>
        ) : filteredAddresses.length === 0 ? (
          <Card className="text-center py-5">
            <Card.Body>
              <FaMapMarkerAlt size={48} color="#6B8E23" className="mb-3" />
              <h5>
                No {addressTypes.find((t) => t.key === selectedType)?.label}{" "}
                Addresses
              </h5>
              <p className="text-muted">
                No {selectedType.toLowerCase()} addresses saved yet
              </p>
              <Button
                variant="success"
                onClick={handleAddAddress}
                style={{ backgroundColor: "#6B8E23", border: "none" }}
              >
                <FaPlus className="me-2" />
                Add {
                  addressTypes.find((t) => t.key === selectedType)?.label
                }{" "}
                Address
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <div className="address-list">
            {filteredAddresses.map((address) => (
              <Card
                key={address._id}
                className={`mb-3 ${
                  isPrimaryAddress(address._id) ? "border-success" : ""
                }`}
                style={{
                  border: isPrimaryAddress(address._id)
                    ? "2px solid #6B8E23"
                    : "1px solid #e0e0e0",
                  borderRadius: "12px",
                  backgroundColor: isPrimaryAddress(address._id)
                    ? "#f8fff8"
                    : "white",
                }}
              >
                <Card.Body>
                  {/* Address Header */}
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex align-items-start flex-grow-1">
                      <div style={{ marginRight: "12px" }}>
                        <img
                          src={locationpng}
                          alt=""
                          style={{ width: "20px", height: "20px" }}
                        />
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center mb-1">
                          <h6
                            className="mb-0"
                            style={{
                              color: "#2c2c2c",
                              fontFamily: "Inter",
                              fontWeight: "600",
                              fontSize: "16px",
                            }}
                          >
                            {getPrimaryName(address)}
                          </h6>
                          {isPrimaryAddress(address._id) && (
                            <span
                              style={{
                                marginLeft: "8px",
                                fontSize: "10px",
                                color: "#6B8E23",
                                fontWeight: "500",
                                backgroundColor: "#f0f9f0",
                                padding: "2px 6px",
                                borderRadius: "4px",
                              }}
                            >
                              PRIMARY
                            </span>
                          )}
                        </div>
                        <p
                          style={{
                            margin: 0,
                            color: "#666",
                            fontSize: "12px",
                            fontFamily: "Inter",
                            lineHeight: "1.4",
                          }}
                        >
                          {address.fullAddress}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Address Details */}
                  <div className="address-details mb-3">
                    {formatAddressDetails(address).map((detail, index) => (
                      <div key={index} className="address-detail-item">
                        <small
                          className="text-muted"
                          style={{ fontFamily: "Inter" }}
                        >
                          {detail}
                        </small>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      {!isPrimaryAddress(address._id) && (
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => handleSetPrimary(address._id)}
                          disabled={actionLoading}
                          className="primary-btn"
                        >
                          <FaCheckCircle className="me-1" />
                          Set as Primary
                        </Button>
                      )}
                    </div>
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleEditAddress(address)}
                        disabled={actionLoading}
                        className="edit-btn"
                      >
                        <FaEdit className="me-1" />
                        Edit
                      </Button>

                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteAddress(address._id)}
                        disabled={actionLoading}
                        className="delete-btn"
                      >
                        <FaTrash className="me-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="mobile-banner"></div>
    </div>
  );
};

export default AddressManagement;
