// import React, { useState, useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   FaCrosshairs,
//   FaMapMarkerAlt,
//   FaCheckCircle,
//   FaSearch,
// } from "react-icons/fa";

// const LocationModal = ({ show, onClose }) => {
//   const navigate = useNavigate();
//   const [searchQuery, setSearchQuery] = useState("");
//   const [searchSuggestions, setSearchSuggestions] = useState([]);
//   const [showSearch, setShowSearch] = useState(false);
//   const [savedAddresses, setSavedAddresses] = useState([]);
//   const [defaultAddress, setDefaultAddress] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [scriptLoaded, setScriptLoaded] = useState(false);
//   const searchInputRef = useRef(null);
//   const autocompleteServiceRef = useRef(null);
//   const placesServiceRef = useRef(null);

//   const API_KEY = import.meta.env.VITE_MAP_KEY;

//   // Load Google Maps script when modal opens
//   useEffect(() => {
//     if (show) {
//       if (window.google && window.google.maps) {
//         setScriptLoaded(true);
//         initializeServices();
//         return;
//       }

//       // Check if script is already loading
//       if (document.querySelector(`script[src*="maps.googleapis.com"]`)) {
//         const checkGoogle = setInterval(() => {
//           if (window.google && window.google.maps) {
//             setScriptLoaded(true);
//             initializeServices();
//             clearInterval(checkGoogle);
//           }
//         }, 100);
//         return;
//       }

//       // Load Google Maps script
//       const script = document.createElement("script");
//       script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
//       script.async = true;
//       script.defer = true;

//       script.onload = () => {
//         setScriptLoaded(true);
//         initializeServices();
//       };

//       script.onerror = () => {
//         console.error("Failed to load Google Maps script");
//       };

//       document.head.appendChild(script);
//     }
//   }, [show]);

//   // Initialize services
//   const initializeServices = () => {
//     if (window.google && window.google.maps) {
//       if (!autocompleteServiceRef.current) {
//         autocompleteServiceRef.current =
//           new window.google.maps.places.AutocompleteService();
//       }
//       if (!placesServiceRef.current) {
//         placesServiceRef.current = new window.google.maps.places.PlacesService(
//           document.createElement("div")
//         );
//       }
//     }
//   };

//   // Focus search input when modal opens
//   useEffect(() => {
//     if (show && searchInputRef.current) {
//       setTimeout(() => {
//         searchInputRef.current.focus();
//       }, 300);
//     }
//   }, [show]);

//   // Fetch saved addresses
//   useEffect(() => {
//     if (show) {
//       fetchSavedAddresses();
//     }
//   }, [show]);

//   const fetchSavedAddresses = async () => {
//     try {
//       setLoading(true);
//       const user = JSON.parse(localStorage.getItem("user"));
//       const customerId = user?._id;

//       if (!customerId) return;

//       const response = await fetch(
//         `http://localhost:7013/api/User/customers/${customerId}/addresses`,
//         {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       if (response.ok) {
//         const result = await response.json();
//         if (result.success) {
//           setSavedAddresses(result.addresses || []);
//           const defaultAddr =
//             result.addresses.find((addr) => addr.isDefault) ||
//             result.addresses[0];
//           setDefaultAddress(defaultAddr);
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching addresses:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle search input changes
//   const handleSearchChange = (e) => {
//     const query = e.target.value;
//     setSearchQuery(query);

//     if (!scriptLoaded || !autocompleteServiceRef.current) {
//       console.warn("Google Maps service not ready");
//       return;
//     }

//     if (query.length > 2) {
//       autocompleteServiceRef.current.getPlacePredictions(
//         {
//           input: query,
//           types: ["geocode", "establishment"],
//           componentRestrictions: { country: "in" },
//         },
//         (predictions, status) => {
//           if (
//             status === window.google.maps.places.PlacesServiceStatus.OK &&
//             predictions
//           ) {
//             setSearchSuggestions(predictions);
//           } else {
//             setSearchSuggestions([]);
//           }
//         }
//       );
//     } else {
//       setSearchSuggestions([]);
//     }
//   };

//   // Handle location selection from search - Navigate to /location
//   const handleLocationSelect = (place) => {
//     if (!placesServiceRef.current) {
//       placesServiceRef.current = new window.google.maps.places.PlacesService(
//         document.createElement("div")
//       );
//     }

//     placesServiceRef.current.getDetails(
//       {
//         placeId: place.place_id,
//         fields: ["geometry", "name", "formatted_address", "vicinity"],
//       },
//       (placeResult, status) => {
//         if (status === window.google.maps.places.PlacesServiceStatus.OK) {
//           const locationData = {
//             lat: placeResult.geometry.location.lat(),
//             lng: placeResult.geometry.location.lng(),
//           };

//           // Close modal and navigate to /location with the selected place data
//           onClose();
//           navigate("/location", {
//             state: {
//               selectedPlace: {
//                 location: locationData,
//                 address: placeResult.formatted_address,
//                 name:
//                   placeResult.name ||
//                   placeResult.formatted_address.split(",")[0],
//                 vicinity: placeResult.vicinity,
//               },
//             },
//           });
//         }
//       }
//     );
//   };

//   const handleUseCurrentLocation = () => {
//     onClose();
//     navigate("/location");
//   };

//   const handleDeliverHere = async (address) => {
//     setLoading(true); // ✅ Show loader
//     try {
//       const user = JSON.parse(localStorage.getItem("user"));
//       const customerId = user?._id;

//       if (!customerId) return;

//       const response = await fetch(
//         `http://localhost:7013/api/User/customers/${customerId}/addresses/${address._id}/primary`,
//         {
//           method: "PATCH",
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       if (response.ok) {
//         setDefaultAddress(address);
//         localStorage.setItem("defaultAddress", JSON.stringify(address));
//         onClose();

//         // ✅ Wait briefly, then reload
//         setTimeout(() => {
//           window.location.reload();
//         }, 300);
//       }
//     } catch (error) {
//       console.error("Error setting default address:", error);
//     } finally {
//       setLoading(false); // ✅ Hide loader
//     }
//   };

//   {
//     loading && (
//       <div
//         className="d-flex justify-content-center align-items-center"
//         style={{
//           position: "fixed",
//           top: 0,
//           left: 0,
//           width: "100vw",
//           height: "100vh",
//           backgroundColor: "rgba(255, 255, 255, 0.6)",
//           zIndex: 2000,
//         }}
//       >
//         <div
//           className="spinner-border"
//           role="status"
//           style={{
//             width: "3rem",
//             height: "3rem",
//             color: "#6B8E23",
//           }}
//         >
//           <span className="visually-hidden">Loading...</span>
//         </div>
//       </div>
//     );
//   }

//   const getPrimaryName = (address) => {
//     if (!address) return "";

//     switch (address.addressType) {
//       case "Home":
//         return address.homeName || address.houseName || "";
//       case "PG":
//         return address.apartmentName || address.houseName || "";
//       case "School":
//         return address.schoolName || address.houseName || "";
//       case "Work":
//         return address.companyName || address.houseName || "";
//       default:
//         return address.houseName || "";
//     }
//   };

//   const getAddressIcon = (type) => {
//     switch (type) {
//       case "Home":
//         return "🏠";
//       case "PG":
//         return "🏢";
//       case "School":
//         return "🎓";
//       case "Work":
//         return "💼";
//       default:
//         return "📍";
//     }
//   };

//   if (!show) return null;

//   return (
//     <div
//       style={{
//         position: "fixed",
//         top: 0,
//         left: 0,
//         right: 0,
//         bottom: 0,
//         backgroundColor: "rgba(0,0,0,0.5)",
//         zIndex: 1050,
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         padding: "20px",
//       }}
//       onClick={onClose}
//     >
//       <div
//         style={{
//           width: "100%",
//           height: "100%",
//           maxWidth: "605px",
//           maxHeight: "100vh",
//           backgroundColor: "white",
//           borderRadius: "16px",
//           border: "none",
//           boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
//           overflow: "hidden",
//           display: "flex",
//           flexDirection: "column",
//         }}
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Header */}
//         <div
//           style={{
//             padding: "20px",
//             borderBottom: "1px solid #f0f0f0",
//             flexShrink: 0,
//           }}
//         >
//           <div className="d-flex justify-content-between align-items-center mb-3">
//             <h5
//               style={{
//                 margin: 0,
//                 color: "#2c2c2c",
//                 fontFamily: "Inter",
//                 fontWeight: "600",
//               }}
//             >
//               Search for your delivery location
//             </h5>
//             <button
//               type="button"
//               className="btn-close"
//               onClick={onClose}
//               style={{
//                 fontSize: "12px",
//                 border: "none",
//                 background: "none",
//                 cursor: "pointer",
//               }}
//             >
//               ×
//             </button>
//           </div>
//           <p
//             style={{
//               margin: 0,
//               color: "#666",
//               fontSize: "14px",
//               fontFamily: "Inter",
//             }}
//           >
//             Pin your exact location for seamless delivery
//           </p>
//         </div>

//         {/* Search Input */}
//         <div
//           style={{
//             padding: "20px",
//             position: "relative",
//             flexShrink: 0,
//           }}
//         >
//           <div
//             style={{
//               backgroundColor: "white",
//               borderRadius: "12px",
//               boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
//               border: "1px solid #e0e0e0",
//               zIndex: 1000,
//             }}
//           >
//             <div
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 padding: "12px 16px",
//                 gap: "8px",
//               }}
//             >
//               <FaSearch size={18} color="#666" />
//               <input
//                 ref={searchInputRef}
//                 type="text"
//                 value={searchQuery}
//                 onChange={handleSearchChange}
//                 onFocus={() => setShowSearch(true)}
//                 placeholder="Search for area, street, landmark..."
//                 style={{
//                   flex: 1,
//                   border: "none",
//                   outline: "none",
//                   fontSize: "16px",
//                   padding: "8px 0",
//                   backgroundColor: "transparent",
//                   fontFamily: "Inter",
//                 }}
//               />
//               {searchQuery && (
//                 <button
//                   onClick={() => {
//                     setSearchQuery("");
//                     setSearchSuggestions([]);
//                   }}
//                   style={{
//                     background: "none",
//                     border: "none",
//                     fontSize: "18px",
//                     color: "#666",
//                     cursor: "pointer",
//                     padding: "4px",
//                   }}
//                 >
//                   ×
//                 </button>
//               )}
//             </div>

//             {/* Search Suggestions */}
//             {showSearch && searchSuggestions.length > 0 && (
//               <div
//                 style={{
//                   borderTop: "1px solid #e0e0e0",
//                   maxHeight: "200px",
//                   overflowY: "auto",
//                 }}
//               >
//                 {searchSuggestions.map((place, index) => (
//                   <div
//                     key={place.place_id}
//                     onClick={() => handleLocationSelect(place)}
//                     style={{
//                       padding: "12px 16px",
//                       borderBottom:
//                         index < searchSuggestions.length - 1
//                           ? "1px solid #f0f0f0"
//                           : "none",
//                       cursor: "pointer",
//                       transition: "background-color 0.2s",
//                       fontSize: "14px",
//                     }}
//                     onMouseEnter={(e) => {
//                       e.target.style.backgroundColor = "#f8f9fa";
//                     }}
//                     onMouseLeave={(e) => {
//                       e.target.style.backgroundColor = "white";
//                     }}
//                   >
//                     <div style={{ fontWeight: "500", color: "#333" }}>
//                       {place.structured_formatting.main_text}
//                     </div>
//                     <div
//                       style={{
//                         fontSize: "12px",
//                         color: "#666",
//                         marginTop: "2px",
//                       }}
//                     >
//                       {place.structured_formatting.secondary_text}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Use Current Location */}
//         <div
//           style={{
//             padding: "0 20px 20px 20px",
//             flexShrink: 0,
//           }}
//         >
//           <button
//             onClick={handleUseCurrentLocation}
//             style={{
//               width: "100%",
//               padding: "12px 16px",
//               backgroundColor: "#6B8E23",
//               border: "1px solid #6B8E23",
//               borderRadius: "12px",
//               color: "#fff",
//               fontSize: "14px",
//               fontWeight: "500",
//               cursor: "pointer",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               gap: "8px",
//               fontFamily: "Inter",
//               transition: "all 0.2s ease",
//             }}
//             onMouseEnter={(e) => {
//               e.target.style.backgroundColor = "#6B8E23";
//               e.target.style.color = "white";
//             }}
//             onMouseLeave={(e) => {
//               e.target.style.backgroundColor = "#6B8E23";
//               e.target.style.color = "white";
//             }}
//           >
//             <FaCrosshairs size={16} />
//             Use current location
//           </button>
//         </div>

//         {/* Saved Addresses */}
//         <div
//           style={{
//             padding: "0 20px 20px 20px",
//             flex: 1,
//             overflow: "hidden",
//             display: "flex",
//             flexDirection: "column",
//           }}
//         >
//           <h6
//             style={{
//               color: "#2c2c2c",
//               fontFamily: "Inter",
//               fontWeight: "600",
//               marginBottom: "16px",
//               fontSize: "16px",
//             }}
//           >
//             Saved Addresses
//           </h6>

//           {loading ? (
//             <div className="text-center py-3">
//               <div className="spinner-border text-success" role="status">
//                 <span className="visually-hidden">Loading...</span>
//               </div>
//             </div>
//           ) : savedAddresses.length === 0 ? (
//             <div
//               style={{
//                 textAlign: "center",
//                 padding: "20px",
//                 color: "#666",
//                 fontFamily: "Inter",
//                 flex: 1,
//                 display: "flex",
//                 flexDirection: "column",
//                 alignItems: "center",
//                 justifyContent: "center",
//               }}
//             >
//               <FaMapMarkerAlt size={32} color="#ccc" className="mb-2" />
//               <p style={{ margin: 0, fontSize: "14px" }}>
//                 No saved addresses yet
//               </p>
//             </div>
//           ) : (
//             <div style={{ flex: 1, overflowY: "auto" }}>
//               {savedAddresses.map((address, index) => (
//                 <div
//                   key={address._id}
//                   style={{
//                     padding: "16px",
//                     border:
//                       defaultAddress?._id === address._id
//                         ? "2px solid #6B8E23"
//                         : "1px solid #e0e0e0",
//                     borderRadius: "12px",
//                     marginBottom:
//                       index < savedAddresses.length - 1 ? "12px" : "0",
//                     backgroundColor:
//                       defaultAddress?._id === address._id ? "#f8fff8" : "white",
//                     transition: "all 0.2s ease",
//                   }}
//                 >
//                   <div className="d-flex justify-content-between align-items-start">
//                     <div className="d-flex align-items-start flex-grow-1">
//                       <span
//                         style={{
//                           fontSize: "18px",
//                           marginRight: "12px",
//                           marginTop: "2px",
//                         }}
//                       >
//                         {getAddressIcon(address.addressType)}
//                       </span>
//                       <div className="flex-grow-1">
//                         <div className="d-flex align-items-center mb-1">
//                           <h6
//                             style={{
//                               margin: 0,
//                               color: "#2c2c2c",
//                               fontFamily: "Inter",
//                               fontWeight: "600",
//                               fontSize: "14px",
//                             }}
//                           >
//                             {getPrimaryName(address)}
//                           </h6>
//                           {defaultAddress?._id === address._id && (
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
//                               DEFAULT
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
//                     <button
//                       onClick={() => handleDeliverHere(address)}
//                       style={{
//                         backgroundColor:
//                           defaultAddress?._id === address._id
//                             ? "#6B8E23"
//                             : "transparent",
//                         border:
//                           defaultAddress?._id === address._id
//                             ? "none"
//                             : "1px solid #6B8E23",
//                         borderRadius: "8px",
//                         color:
//                           defaultAddress?._id === address._id
//                             ? "white"
//                             : "#6B8E23",
//                         fontSize: "12px",
//                         fontWeight: "500",
//                         padding: "6px 12px",
//                         cursor: "pointer",
//                         whiteSpace: "nowrap",
//                         marginLeft: "12px",
//                         fontFamily: "Inter",
//                         transition: "all 0.2s ease",
//                         minWidth: "100px",
//                       }}
//                       onMouseEnter={(e) => {
//                         if (defaultAddress?._id !== address._id) {
//                           e.target.style.backgroundColor = "#6B8E23";
//                           e.target.style.color = "white";
//                         }
//                       }}
//                       onMouseLeave={(e) => {
//                         if (defaultAddress?._id !== address._id) {
//                           e.target.style.backgroundColor = "transparent";
//                           e.target.style.color = "#6B8E23";
//                         }
//                       }}
//                     >
//                       {defaultAddress?._id === address._id ? (
//                         <>
//                           <FaCheckCircle size={12} className="me-1" />
//                           Selected
//                         </>
//                       ) : (
//                         "Deliver here"
//                       )}
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LocationModal;

// import React, { useState, useEffect, useRef, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   FaCrosshairs,
//   FaMapMarkerAlt,
//   FaCheckCircle,
//   FaSearch,
// } from "react-icons/fa";
// import { CircleCheck } from "lucide-react";
// import locationpng from "./../assets/deliverylocation.svg";
// import homeimg from "./../assets/ion_home-outline.png";
// import homeimg2 from "./../assets/ion_home-outline-white.svg";
// import apartmentimg from "./../assets/apartment.png";
// import apartmentimg2 from "./../assets/tabler_building-skyscraper-white.svg";
// import workimg from "./../assets/streamline-ultimate_work-from-home-user-sofa.png";
// import workimg2 from "./../assets/streamline-ultimate_work-from-home-user-sofa-white.svg";
// import schoolimg from "./../assets/streamline-ultimate-color_study-exam-math.png";
// import schoolimg2 from "./../assets/streamline-ultimate-color_study-exam-math-white.png";
// import cross from "./../assets/cross.png";
// import spilt from "./../assets/spilt.png";
// import secure from "./../assets/secure.png";
// import warning from "./../assets/warning.png";

// const LocationModal = ({ show, onClose }) => {
//   const navigate = useNavigate();
//   const [searchQuery, setSearchQuery] = useState("");
//   const [searchSuggestions, setSearchSuggestions] = useState([]);
//   const [showSearch, setShowSearch] = useState(false);
//   const [savedAddresses, setSavedAddresses] = useState([]);
//   const [primaryAddressId, setPrimaryAddressId] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [actionLoading, setActionLoading] = useState(null);
//   const [scriptLoaded, setScriptLoaded] = useState(false);
//   const isLargeScreen = window.innerWidth >= 768;

//   const searchInputRef = useRef(null);
//   const autocompleteServiceRef = useRef(null);
//   const placesServiceRef = useRef(null);
//   const debounceTimerRef = useRef(null);
//   const fetchAbortControllerRef = useRef(null);
//   const hasFetchedAddressesRef = useRef(false);
//   const isModalMountedRef = useRef(false);
//   const primaryAddress = JSON.parse(localStorage.getItem("primaryAddress"));

//      // Address form state
//       const [hub, setHub] = useState([]);
//       const [houseName, setHouseName] = useState("");
//       const [homeName, setHomeName] = useState("");
//       const [addressType, setAddressType] = useState("");
//       const [landmark, setLandmark] = useState("");
//       const [floor, setFloor] = useState("");

//       // PG specific fields
//       const [apartmentName, setApartmentName] = useState("");
//       const [towerBlock, setTowerBlock] = useState("");
//       const [flat, setFlat] = useState("");

//       // School specific fields
//       const [schoolName, setSchoolName] = useState("");
//       const [studentName, setStudentName] = useState("");
//       const [studentClass, setStudentClass] = useState("");
//       const [studentSection, setStudentSection] = useState("");

//       // Work specific field
//       const [companyName, setCompanyName] = useState("");
//       const [floorNo, setFloorNo] = useState("");

//   const API_KEY = import.meta.env.VITE_MAP_KEY;

//   // Optimized Google Maps script loading with caching check
//   useEffect(() => {
//     if (!show) return;

//     isModalMountedRef.current = true;

//     // Check if already loaded
//     if (window.google?.maps?.places) {
//       setScriptLoaded(true);
//       initializeServices();
//       return;
//     }

//     // Check if script element exists
//     const existingScript = document.querySelector(
//       `script[src*="maps.googleapis.com"]`
//     );

//     if (existingScript) {
//       // Script is loading, wait for it
//       const checkInterval = setInterval(() => {
//         if (window.google?.maps?.places) {
//           setScriptLoaded(true);
//           initializeServices();
//           clearInterval(checkInterval);
//         }
//       }, 50);

//       return () => clearInterval(checkInterval);
//     }

//     // Load new script
//     const script = document.createElement("script");
//     script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&loading=async`;
//     script.async = true;
//     script.defer = true;

//     script.onload = () => {
//       if (isModalMountedRef.current) {
//         setScriptLoaded(true);
//         initializeServices();
//       }
//     };

//     script.onerror = () => console.error("Failed to load Google Maps");
//     document.head.appendChild(script);

//     return () => {
//       isModalMountedRef.current = false;
//     };
//   }, [show, API_KEY]);

//   // Initialize Google Maps services
//   const initializeServices = useCallback(() => {
//     if (!window.google?.maps?.places) return;

//     if (!autocompleteServiceRef.current) {
//       autocompleteServiceRef.current =
//         new window.google.maps.places.AutocompleteService();
//     }
//     if (!placesServiceRef.current) {
//       placesServiceRef.current = new window.google.maps.places.PlacesService(
//         document.createElement("div")
//       );
//     }
//   }, []);

//   // Focus search input
//   useEffect(() => {
//     if (show && searchInputRef.current) {
//       const timer = setTimeout(() => searchInputRef.current?.focus(), 100);
//       return () => clearTimeout(timer);
//     }
//   }, [show]);

//   // OPTIMIZED: Fetch saved addresses with AbortController and caching
//   const fetchSavedAddresses = useCallback(async () => {
//     // Prevent duplicate fetches
//     if (hasFetchedAddressesRef.current) return;

//     try {
//       setLoading(true);
//       hasFetchedAddressesRef.current = true;

//       const user = JSON.parse(localStorage.getItem("user"));
//       const customerId = user?._id;

//       if (!customerId) {
//         setLoading(false);
//         return;
//       }

//       // Check localStorage cache first
//       const cachedAddresses = localStorage.getItem(`addresses_${customerId}`);
//       const cacheTimestamp = localStorage.getItem(`addresses_timestamp_${customerId}`);
//       const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

//       // Use cache if valid and recent
//       if (cachedAddresses && cacheTimestamp) {
//         const age = Date.now() - parseInt(cacheTimestamp);
//         if (age < CACHE_DURATION) {
//           const cached = JSON.parse(cachedAddresses);
//           setSavedAddresses(cached.addresses || []);
//           setPrimaryAddressId(cached.primaryAddress || null);
//           setLoading(false);

//           // Fetch fresh data in background
//           fetchAddressesInBackground(customerId);
//           return;
//         }
//       }

//       // Create AbortController for cancellation
//       fetchAbortControllerRef.current = new AbortController();

//       const response = await fetch(
//         `http://localhost:7013/api/User/customers/${customerId}/addresses`,
//         {
//           method: "GET",
//           headers: { "Content-Type": "application/json" },
//           signal: fetchAbortControllerRef.current.signal,
//         }
//       );

//       if (response.ok) {
//         const result = await response.json();
//         if (result.success) {
//           const addresses = result.addresses || [];
//           const primaryId = result.primaryAddress || null;

//           setSavedAddresses(addresses);
//           setPrimaryAddressId(primaryId);

//           // Cache the results
//           localStorage.setItem(
//             `addresses_${customerId}`,
//             JSON.stringify({ addresses, primaryAddress: primaryId })
//           );
//           localStorage.setItem(`addresses_timestamp_${customerId}`, Date.now().toString());
//         }
//       }
//     } catch (error) {
//       if (error.name !== "AbortError") {
//         console.error("Error fetching addresses:", error);
//       }
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // Background fetch to update cache
//   const fetchAddressesInBackground = async (customerId) => {
//     try {
//       const response = await fetch(
//         `http://localhost:7013/api/User/customers/${customerId}/addresses`,
//         {
//           method: "GET",
//           headers: { "Content-Type": "application/json" },
//         }
//       );

//       if (response.ok) {
//         const result = await response.json();
//         if (result.success) {
//           const addresses = result.addresses || [];
//           const primaryId = result.primaryAddress || null;

//           // Update cache silently
//           localStorage.setItem(
//             `addresses_${customerId}`,
//             JSON.stringify({ addresses, primaryAddress: primaryId })
//           );
//           localStorage.setItem(`addresses_timestamp_${customerId}`, Date.now().toString());
//         }
//       }
//     } catch (error) {
//       console.error("Background fetch error:", error);
//     }
//   };

//   // Fetch addresses when modal opens
//   useEffect(() => {
//     if (show) {
//       fetchSavedAddresses();
//     }

//     return () => {
//       // Cleanup: abort ongoing fetch
//       if (fetchAbortControllerRef.current) {
//         fetchAbortControllerRef.current.abort();
//       }
//       // Reset fetch flag when modal closes
//       if (!show) {
//         hasFetchedAddressesRef.current = false;
//       }
//     };
//   }, [show, fetchSavedAddresses]);

//   // OPTIMIZED: Debounced search with cleanup
//   const handleSearchChange = useCallback((e) => {
//     const query = e.target.value;
//     setSearchQuery(query);

//     // Clear previous timer
//     if (debounceTimerRef.current) {
//       clearTimeout(debounceTimerRef.current);
//     }

//     if (!window.google?.maps?.places || !autocompleteServiceRef.current) {
//       return;
//     }

//     if (query.length > 2) {
//       debounceTimerRef.current = setTimeout(() => {
//         autocompleteServiceRef.current.getPlacePredictions(
//           {
//             input: query,
//             types: ["geocode", "establishment"],
//             componentRestrictions: { country: "in" },
//           },
//           (predictions, status) => {
//             if (
//               status === window.google.maps.places.PlacesServiceStatus.OK &&
//               predictions
//             ) {
//               setSearchSuggestions(predictions);
//             } else {
//               setSearchSuggestions([]);
//             }
//           }
//         );
//       }, 300);
//     } else {
//       setSearchSuggestions([]);
//     }
//   }, []);

//   // Handle location selection
//   const handleLocationSelect = useCallback(
//     (place) => {
//       if (!placesServiceRef.current) {
//         placesServiceRef.current = new window.google.maps.places.PlacesService(
//           document.createElement("div")
//         );
//       }

//       setActionLoading("search");
//       setShowSearch(false);

//       placesServiceRef.current.getDetails(
//         {
//           placeId: place.place_id,
//           fields: ["geometry", "name", "formatted_address", "vicinity"],
//         },
//         (placeResult, status) => {
//           setActionLoading(null);
//           if (status === window.google.maps.places.PlacesServiceStatus.OK) {
//             const locationData = {
//               lat: placeResult.geometry.location.lat(),
//               lng: placeResult.geometry.location.lng(),
//             };

//             onClose();
//             navigate("/location", {
//               state: {
//                 selectedPlace: {
//                   location: locationData,
//                   address: placeResult.formatted_address,
//                   name:
//                     placeResult.name ||
//                     placeResult.formatted_address.split(",")[0],
//                   vicinity: placeResult.vicinity,
//                 },
//               },
//             });
//           }
//         }
//       );
//     },
//     [navigate, onClose]
//   );

//   // OPTIMIZED: Remove primary address with cache update
//   const removePrimaryAddress = useCallback(async () => {
//     try {
//       const user = JSON.parse(localStorage.getItem("user"));
//       const customerId = user?._id;

//       if (!customerId || !primaryAddressId) return;

//       // Update UI immediately
//       setPrimaryAddressId(null);
//       localStorage.removeItem("primaryAddress");

//       // Update cache
//       const cachedAddresses = localStorage.getItem(`addresses_${customerId}`);
//       if (cachedAddresses) {
//         const cached = JSON.parse(cachedAddresses);
//         cached.primaryAddress = null;
//         localStorage.setItem(`addresses_${customerId}`, JSON.stringify(cached));
//       }

//       // Background API call
//       fetch(
//         `http://localhost:7013/api/User/customers/${customerId}/primary-address/remove`,
//         {
//           method: "PATCH",
//           headers: { "Content-Type": "application/json" },
//         }
//       ).catch((error) => console.error("Error removing primary address:", error));
//     } catch (error) {
//       console.error("Error removing primary address:", error);
//     }
//   }, [primaryAddressId]);

//   // OPTIMIZED: Handle current location
//   const handleUseCurrentLocation = useCallback(async () => {
//     if (actionLoading) return; // Prevent double-click

//     setActionLoading("current-location");

//     try {
//       if (primaryAddressId) {
//         removePrimaryAddress();
//       }

//       // Navigate immediately
//       onClose();
//       navigate("/location");
//     } catch (error) {
//       console.error("Error handling current location:", error);
//       onClose();
//       navigate("/location");
//     } finally {
//       setActionLoading(null);
//     }
//   }, [primaryAddressId, removePrimaryAddress, navigate, onClose, actionLoading]);

//   // OPTIMIZED: Handle deliver here with cache update
//   const handleDeliverHere = useCallback(
//     async (address) => {
//       if (actionLoading) return; // Prevent double-click

//       setActionLoading(address._id);

//       try {
//         const user = JSON.parse(localStorage.getItem("user"));
//         const customerId = user?._id;

//         if (!customerId) return;

//         // Update UI immediately
//         setPrimaryAddressId(address._id);
//         localStorage.setItem("primaryAddress", JSON.stringify(address));

//         // Update cache
//         const cachedAddresses = localStorage.getItem(`addresses_${customerId}`);
//         if (cachedAddresses) {
//           const cached = JSON.parse(cachedAddresses);
//           cached.primaryAddress = address._id;
//           localStorage.setItem(`addresses_${customerId}`, JSON.stringify(cached));
//         }

//         // Close modal first
//         onClose();

//         // API call in background
//         const response = await fetch(
//           `http://localhost:7013/api/User/customers/${customerId}/addresses/${address._id}/primary`,
//           {
//             method: "PATCH",
//             headers: { "Content-Type": "application/json" },
//           }
//         );

//         if (response.ok) {
//           // Reload after a short delay
//           setTimeout(() => {
//             window.location.reload();
//           }, 100);
//         }
//       } catch (error) {
//         console.error("Error setting primary address:", error);
//       } finally {
//         setActionLoading(null);
//       }
//     },
//     [onClose, actionLoading]
//   );

//   // Helper functions
//   const getPrimaryName = useCallback((address) => {
//     if (!address) return "";

//     switch (address.addressType) {
//       case "Home":
//         return address.homeName || address.houseName || "";
//       case "PG":
//         return address.apartmentName || address.houseName || "";
//       case "School":
//         return address.schoolName || address.houseName || "";
//       case "Work":
//         return address.companyName || address.houseName || "";
//       default:
//         return address.houseName || "";
//     }
//   }, []);

//   const getAddressIcon = useCallback((type) => {
//     switch (type) {
//       case "Home":
//         return "🏠";
//       case "PG":
//         return "🏢";
//       case "School":
//         return "🎓";
//       case "Work":
//         return "💼";
//       default:
//         return "📍";
//     }
//   }, []);

//   const isPrimaryAddress = useCallback(
//     (addressId) => primaryAddressId === addressId,
//     [primaryAddressId]
//   );

//   const getPrimaryAddress = useCallback(
//     () => savedAddresses.find((addr) => addr._id === primaryAddressId),
//     [savedAddresses, primaryAddressId]
//   );

//   // Cleanup on unmount
//   useEffect(() => {
//     return () => {
//       if (debounceTimerRef.current) {
//         clearTimeout(debounceTimerRef.current);
//       }
//       if (fetchAbortControllerRef.current) {
//         fetchAbortControllerRef.current.abort();
//       }
//     };
//   }, []);

//   if (!show) return null;

//     // Address type options
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

//   const renderTypeSpecificFields = () => {
//     const commonInputStyle = {
//       width: "100%",
//       height: "44px",
//       borderRadius: "12px",
//       padding: "8px 16px",
//       border: "0.4px solid #6B8E23",
//       background: "#FAFAFA",
//       fontSize: "14px",
//       marginBottom: "10px",
//     };

//     switch (addressType) {
//       case "Home":
//         return (
//           <div
//             className="d-flex flex-column align-items-start mt-2"
//             style={{
//               gap: "12px",
//               borderRadius: "12px",
//               width: "100%",
//               maxWidth: window.innerWidth > 768 ? "500px" : "354px",
//               margin: "0 auto 20px auto",
//             }}
//           >
//             <input
//               type="text"
//               value={homeName}
//               onChange={(e) => setHomeName(e.target.value)}
//               placeholder="Home Name *"
//               style={commonInputStyle}
//             />
//             <input
//               type="text"
//               value={landmark}
//               onChange={(e) => setLandmark(e.target.value)}
//               placeholder="Landmark, building, floor"
//               style={{ ...commonInputStyle, marginBottom: "0" }}
//             />
//           </div>
//         );

//       case "PG":
//         return (
//           <div
//             className="d-flex flex-column align-items-start mt-2"
//             style={{
//               gap: "12px",
//               borderRadius: "12px",
//               width: "100%",
//               maxWidth: window.innerWidth > 768 ? "500px" : "354px",
//               margin: "0 auto 20px auto",
//             }}
//           >
//             <input
//               type="text"
//               value={apartmentName}
//               onChange={(e) => setApartmentName(e.target.value)}
//               placeholder="Apartment Name *"
//               style={commonInputStyle}
//             />
//             <input
//               type="text"
//               value={towerBlock}
//               onChange={(e) => setTowerBlock(e.target.value)}
//               placeholder="Tower/Block name *"
//               style={commonInputStyle}
//             />
//             <div
//               className="d-flex"
//               style={{
//                 width: "100%",
//                 gap: "12px",
//               }}
//             >
//               <input
//                 type="text"
//                 value={flat}
//                 onChange={(e) => setFlat(e.target.value)}
//                 placeholder="Flat *"
//                 style={commonInputStyle}
//               />
//               <input
//                 type="text"
//                 value={floor}
//                 onChange={(e) => setFloor(e.target.value)}
//                 placeholder="Floor"
//                 style={commonInputStyle}
//               />
//             </div>
//           </div>
//         );

//       case "School":
//         return (
//           <div
//             className="d-flex flex-column align-items-start mt-2"
//             style={{
//               gap: "12px",
//               borderRadius: "12px",
//               width: "100%",
//               maxWidth: window.innerWidth > 768 ? "500px" : "354px",
//               margin: "0 auto 20px auto",
//             }}
//           >
//             <div className="d-flex gap-2 align-items-start">
//               <img
//                 src={spilt}
//                 alt=""
//                 style={{ width: "20px", height: "20px", marginTop: "2px" }}
//               />
//               <p
//                 className="mb-0"
//                 style={{
//                   color: "#2c2c2c",
//                   fontSize: "14px",
//                   fontFamily: "Inter",
//                   fontWeight: "500",
//                 }}
//               >
//                 Later you can split the order
//               </p>
//               <img
//                 src={warning}
//                 alt=""
//                 style={{ width: "10px", height: "10px", marginTop: "6px" }}
//               />
//             </div>

//             <div className="d-flex gap-2 align-items-start">
//               <img
//                 src={secure}
//                 alt=""
//                 style={{ width: "12px", height: "12px", marginTop: "2px" }}
//               />
//               <p
//                 className="mb-0"
//                 style={{
//                   color: "#2c2c2c",
//                   fontSize: "10px",
//                   fontFamily: "Inter",
//                   fontWeight: "500",
//                 }}
//               >
//                 Safe & Private: details are only used to deliver correctly.
//               </p>
//             </div>

//             <input
//               type="text"
//               value={schoolName}
//               onChange={(e) => setSchoolName(e.target.value)}
//               placeholder="School Name *"
//               style={commonInputStyle}
//             />

//             <input
//               type="text"
//               placeholder="Student's full name *"
//               value={studentName}
//               onChange={(e) => setStudentName(e.target.value)}
//               style={commonInputStyle}
//             />

//             <div
//               className="d-flex justify-content-between"
//               style={{
//                 width: "100%",
//                 gap: "12px",
//               }}
//             >
//               <input
//                 type="text"
//                 placeholder="Class *"
//                 value={studentClass}
//                 onChange={(e) => setStudentClass(e.target.value)}
//                 style={commonInputStyle}
//               />
//               <input
//                 type="text"
//                 placeholder="Section *"
//                 value={studentSection}
//                 onChange={(e) => setStudentSection(e.target.value)}
//                 style={commonInputStyle}
//               />
//             </div>
//           </div>
//         );

//       case "Work":
//         return (
//           <div
//             className="d-flex flex-column align-items-start mt-2"
//             style={{
//               gap: "12px",
//               borderRadius: "12px",
//               width: "100%",
//               maxWidth: window.innerWidth > 768 ? "500px" : "354px",
//               margin: "0 auto 20px auto",
//             }}
//           >
//             <input
//               type="text"
//               value={companyName}
//               onChange={(e) => setCompanyName(e.target.value)}
//               placeholder="Company Name *"
//               style={commonInputStyle}
//             />
//             <input
//               type="text"
//               value={floorNo}
//               onChange={(e) => setFloorNo(e.target.value)}
//               placeholder="Floor no *"
//               style={{ ...commonInputStyle, marginBottom: "0" }}
//             />
//           </div>
//         );

//       default:
//         return null;
//     }
//   };

//     const handleCancel = () => {
//     setShowAddressForm(false);
//     setIsConfirmed(false);
//   };

//     const handleSaveAddress = async (e) => {
//     e.preventDefault();
//     if (!isFormValid()) {
//       setError("Please fill all required fields");
//       return;
//     }

//     const addressData = {
//       location: selectedLocation,
//       address: address,
//       houseName: houseName,
//       addressType: addressType,
//       homeName: homeName,
//       apartmentName: apartmentName,
//       schoolName: schoolName,
//       companyName: companyName,
//       hubName: hub[0]?.hubName || "",
//       hubId: hub[0]?.hub || "",
//       ...(addressType === "Home" && { landmark, floor }),
//       ...(addressType === "PG" && { towerBlock, flat, floor }),
//       ...(addressType === "School" && {
//         studentName,
//         studentClass,
//         studentSection,
//       }),
//       ...(addressType === "Work" && { floorNo }),
//       fullAddress: generateFullAddress(),
//     };

//     console.log("Saving address:", addressData);

//     try {
//       setIsLoading(true);

//       const user = JSON.parse(localStorage.getItem("user"));
//       const customerId = user._id;

//       if (!customerId) {
//         setError("Customer ID not found. Please login again.");
//         return;
//       }

//       const requestPayload = {
//         customerId: customerId,
//         addressType: addressData.addressType,
//         houseName: addressData.houseName,
//         fullAddress: addressData.fullAddress,
//         location: {
//           lat: addressData.location.lat,
//           lng: addressData.location.lng,
//         },
//         landmark: addressData.landmark || "",
//         floor: addressData.floor || "",
//         towerBlock: addressData.towerBlock || "",
//         flat: addressData.flat || "",
//         studentName: addressData.studentName || "",
//         studentClass: addressData.studentClass || "",
//         studentSection: addressData.studentSection || "",
//         floorNo: addressData.floorNo || "",
//         homeName: addressData.homeName || "",
//         apartmentName: addressData.apartmentName || "",
//         schoolName: addressData.schoolName || "",
//         companyName: addressData.companyName || "",
//         isDefault: true,
//         hubName: addressData.hubName || "",
//         hubId: addressData.hubId || "",
//       };

//       // If editing existing address, include addressId for update
//       if (location.state?.editingAddress?._id) {
//         requestPayload.addressId = location.state.editingAddress._id;
//       }

//       const endpoint = location.state?.editingAddress?._id
//         ? `http://localhost:7013/api/User/customers/${user._id}/addresses/${location.state.editingAddress._id}`
//         : "http://localhost:7013/api/User/addresses";
//       const method = location.state?.editingAddress?._id ? "PUT" : "POST";

//       const response = await fetch(endpoint, {
//         method: method,
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(requestPayload),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || "Failed to save address");
//       }

//       const result = await response.json();

//       if (result.success) {
//         setShowAddressForm(false);
//         resetForm();

//         navigate("/home", {
//           state: {
//             userLocation: selectedLocation,
//             userAddress: address,
//             addressData: addressData,
//           },
//         });
//       } else {
//         throw new Error(result.message || "Failed to save address");
//       }
//     } catch (error) {
//       console.error("Error saving address:", error);
//       setError(error.message || "Failed to save address. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div
//       style={{
//         position: "fixed",
//         top: 0,
//         left: 0,
//         right: 0,
//         bottom: 0,
//         backgroundColor: "rgba(0,0,0,0.5)",
//         zIndex: 1050,
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         padding: "20px",
//       }}
//       onClick={onClose}
//     >
//       <div
//         style={{
//           width: "100%",
//           height: "100%",
//           maxWidth: "605px",
//           maxHeight: "100vh",
//           backgroundColor: "white",
//           borderRadius: "16px",
//           border: "none",
//           boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
//           overflow: "hidden",
//           display: "flex",
//           flexDirection: "column",
//           position: "relative",
//         }}
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Minimal Loading Overlay */}
//         {loading && (
//           <div
//             style={{
//               position: "absolute",
//               top: "50%",
//               left: "50%",
//               transform: "translate(-50%, -50%)",
//               zIndex: 20,
//             }}
//           >
//             <div
//               className="spinner-border"
//               role="status"
//               style={{
//                 width: "2.5rem",
//                 height: "2.5rem",
//                 color: "#6B8E23",
//               }}
//             >
//               <span className="visually-hidden">Loading...</span>
//             </div>
//           </div>
//         )}

//         {/* Header */}
//         <div
//           style={{
//             padding: "20px",
//             borderBottom: "1px solid #f0f0f0",
//             flexShrink: 0,
//           }}
//         >
//           <div className="d-flex justify-content-between align-items-center mb-3">
//             <h5
//               style={{
//                 margin: 0,
//                 color: "#2c2c2c",
//                 fontFamily: "Inter",
//                 fontWeight: "600",
//               }}
//             >
//               Search for your delivery location
//             </h5>
//             <button
//               type="button"
//               className="btn-close"
//               onClick={onClose}
//               style={{
//                 fontSize: "12px",
//                 border: "none",
//                 background: "none",
//                 cursor: "pointer",
//               }}
//             />
//           </div>
//           <p
//             style={{
//               margin: 0,
//               color: "#666",
//               fontSize: "14px",
//               fontFamily: "Inter",
//             }}
//           >
//             Pin your exact location for seamless delivery
//           </p>
//         </div>

//         {/* Search Input */}
//         <div
//           style={{
//             padding: "20px",
//             position: "relative",
//             flexShrink: 0,
//           }}
//         >
//           <div
//             style={{
//               backgroundColor: "white",
//               borderRadius: "12px",
//               boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
//               border: "1px solid #e0e0e0",
//               zIndex: 1000,
//             }}
//           >
//             <div
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 padding: "12px 16px",
//                 gap: "8px",
//               }}
//             >
//               <FaSearch size={18} color="#666" />
//               <input
//                 ref={searchInputRef}
//                 type="text"
//                 value={searchQuery}
//                 onChange={handleSearchChange}
//                 onFocus={() => setShowSearch(true)}
//                 placeholder="Search for area, street, landmark..."
//                 style={{
//                   flex: 1,
//                   border: "none",
//                   outline: "none",
//                   fontSize: "16px",
//                   padding: "8px 0",
//                   backgroundColor: "transparent",
//                   fontFamily: "Inter",
//                 }}
//               />
//               {searchQuery && (
//                 <button
//                   onClick={() => {
//                     setSearchQuery("");
//                     setSearchSuggestions([]);
//                   }}
//                   style={{
//                     background: "none",
//                     border: "none",
//                     fontSize: "18px",
//                     color: "#666",
//                     cursor: "pointer",
//                     padding: "4px",
//                   }}
//                 >
//                   ×
//                 </button>
//               )}
//             </div>

//             {/* Search Suggestions */}
//             {showSearch && searchSuggestions.length > 0 && (
//               <div
//                 style={{
//                   borderTop: "1px solid #e0e0e0",
//                   maxHeight: "200px",
//                   overflowY: "auto",
//                 }}
//               >
//                 {searchSuggestions.map((place, index) => (
//                   <div
//                     key={place.place_id}
//                     onClick={() => handleLocationSelect(place)}
//                     style={{
//                       padding: "12px 16px",
//                       borderBottom:
//                         index < searchSuggestions.length - 1
//                           ? "1px solid #f0f0f0"
//                           : "none",
//                       cursor: "pointer",
//                       transition: "background-color 0.2s",
//                       fontSize: "14px",
//                     }}
//                     onMouseEnter={(e) => {
//                       e.target.style.backgroundColor = "#f8f9fa";
//                     }}
//                     onMouseLeave={(e) => {
//                       e.target.style.backgroundColor = "white";
//                     }}
//                   >
//                     <div style={{ fontWeight: "500", color: "#333" }}>
//                       {place.structured_formatting.main_text}
//                     </div>
//                     <div
//                       style={{
//                         fontSize: "12px",
//                         color: "#666",
//                         marginTop: "2px",
//                       }}
//                     >
//                       {place.structured_formatting.secondary_text}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Use Current Location Button */}
//         <div
//           style={{
//             padding: "0 20px 20px 20px",
//             flexShrink: 0,
//           }}
//         >
//           <button
//             onClick={handleUseCurrentLocation}
//             disabled={actionLoading === "current-location"}
//             style={{
//               width: "100%",
//               padding: "12px 16px",
//               backgroundColor: "#6B8E23",
//               border: "1px solid #6B8E23",
//               borderRadius: "12px",
//               color: "#fff",
//               fontSize: "14px",
//               fontWeight: "500",
//               cursor:
//                 actionLoading === "current-location"
//                   ? "not-allowed"
//                   : "pointer",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               gap: "8px",
//               fontFamily: "Inter",
//               transition: "all 0.2s ease",
//               opacity: actionLoading === "current-location" ? 0.7 : 1,
//             }}
//             onMouseEnter={(e) => {
//               if (!actionLoading) {
//                 e.target.style.backgroundColor = "#5a7a1c";
//               }
//             }}
//             onMouseLeave={(e) => {
//               if (!actionLoading) {
//                 e.target.style.backgroundColor = "#6B8E23";
//               }
//             }}
//           >
//             {actionLoading === "current-location" ? (
//               <>
//                 <div
//                   className="spinner-border spinner-border-sm"
//                   role="status"
//                 >
//                   <span className="visually-hidden">Loading...</span>
//                 </div>
//                 Getting location...
//               </>
//             ) : (
//               <>
//                 <FaCrosshairs size={16} />
//                 Use current location
//                 {primaryAddressId && " (Clear primary)"}
//               </>
//             )}
//           </button>
//         </div>

//         {/* Saved Addresses */}
//         <div
//           style={{
//             padding: "0 20px 20px 20px",
//             flex: 1,
//             overflow: "hidden",
//             display: "flex",
//             flexDirection: "column",
//             opacity: loading ? 0.5 : 1,
//             transition: "opacity 0.3s",
//           }}
//         >
//           <h6
//             style={{
//               color: "#2c2c2c",
//               fontFamily: "Inter",
//               fontWeight: "600",
//               marginBottom: "16px",
//               fontSize: "16px",
//             }}
//           >
//             Saved Addresses
//             {primaryAddressId &&
//               ` (Primary: ${getPrimaryName(getPrimaryAddress())})`}
//           </h6>

//           {savedAddresses.length === 0 && !loading ? (
//             <div
//               style={{
//                 textAlign: "center",
//                 padding: "20px",
//                 color: "#666",
//                 fontFamily: "Inter",
//                 flex: 1,
//                 display: "flex",
//                 flexDirection: "column",
//                 alignItems: "center",
//                 justifyContent: "center",
//               }}
//             >
//               <FaMapMarkerAlt size={32} color="#ccc" className="mb-2" />
//               <p style={{ margin: 0, fontSize: "14px" }}>
//                 No saved addresses yet
//               </p>
//             </div>
//           ) : (
//             <div style={{ flex: 1, overflowY: "auto" }}>
//               {savedAddresses.map((address, index) => (
//                 <div
//                   key={address._id}
//                   style={{
//                     padding: "16px",
//                     border: isPrimaryAddress(address._id)
//                       ? "2px solid #6B8E23"
//                       : "1px solid #e0e0e0",
//                     borderRadius: "12px",
//                     marginBottom:
//                       index < savedAddresses.length - 1 ? "12px" : "0",
//                     backgroundColor: isPrimaryAddress(address._id)
//                       ? "#f8fff8"
//                       : "white",
//                     transition: "all 0.2s ease",
//                   }}
//                 >
//                   <div className="d-flex justify-content-between align-items-start">
//                     <div className="d-flex align-items-start flex-grow-1">
//                       <span
//                         style={{
//                           fontSize: "18px",
//                           marginRight: "12px",
//                           marginTop: "2px",
//                         }}
//                       >
//                         {getAddressIcon(address.addressType)}
//                       </span>
//                       <div className="flex-grow-1">
//                         <div className="d-flex align-items-center mb-1">
//                           <h6
//                             style={{
//                               margin: 0,
//                               color: "#2c2c2c",
//                               fontFamily: "Inter",
//                               fontWeight: "600",
//                               fontSize: "14px",
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
//                     <button
//                       onClick={() => handleDeliverHere(address)}
//                       disabled={actionLoading === address._id}
//                       style={{
//                         backgroundColor: isPrimaryAddress(address._id)
//                           ? "#6B8E23"
//                           : "transparent",
//                         border: isPrimaryAddress(address._id)
//                           ? "none"
//                           : "1px solid #6B8E23",
//                         borderRadius: "8px",
//                         color: isPrimaryAddress(address._id)
//                           ? "white"
//                           : "#6B8E23",
//                         fontSize: "12px",
//                         fontWeight: "500",
//                         padding: "6px 12px",
//                         cursor:
//                           actionLoading === address._id
//                             ? "not-allowed"
//                             : "pointer",
//                         whiteSpace: "nowrap",
//                         marginLeft: "12px",
//                         fontFamily: "Inter",
//                         transition: "all 0.2s ease",
//                         minWidth: "100px",
//                         opacity: actionLoading === address._id ? 0.7 : 1,
//                       }}
//                       onMouseEnter={(e) => {
//                         if (
//                           !isPrimaryAddress(address._id) &&
//                           !actionLoading
//                         ) {
//                           e.target.style.backgroundColor = "#6B8E23";
//                           e.target.style.color = "white";
//                         }
//                       }}
//                       onMouseLeave={(e) => {
//                         if (
//                           !isPrimaryAddress(address._id) &&
//                           !actionLoading
//                         ) {
//                           e.target.style.backgroundColor = "transparent";
//                           e.target.style.color = "#6B8E23";
//                         }
//                       }}
//                     >
//                       {actionLoading === address._id ? (
//                         <div
//                           className="spinner-border spinner-border-sm"
//                           role="status"
//                         >
//                           <span className="visually-hidden">Loading...</span>
//                         </div>
//                       ) : isPrimaryAddress(address._id) ? (
//                         <>
//                           <FaCheckCircle size={12} className="me-1" />
//                           Selected
//                         </>
//                       ) : (
//                         "Deliver here"
//                       )}
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}

//             {
//           !primaryAddress &&
//           (
//             <div>
//               <h6 style={{
//               color: "#2c2c2c",
//               fontFamily: "Inter",
//               fontWeight: "600",
//               marginBottom: "16px",
//               fontSize: "16px",
//             }}>Add Address</h6>
//              <div
//                           className="modal show fade d-block"
//                           tabIndex="-1"
//                           role="dialog"
//                           style={{
//                             position: "absolute",
//                             top: 0,
//                             left: 0,
//                             right: 0,
//                             bottom: 0,
//                             backgroundColor: "rgba(0,0,0,0.5)",
//                             boxShadow: "1px 0px 4px 0px #00000040",
//                             zIndex: 2000,
//                             display: "flex",
//                             alignItems: "center",
//                             justifyContent: "center",
//                           }}
//                         >
//                           <div
//                             className="modal-dialog"
//                             role="document"
//                             style={{
//                               maxWidth: window.innerWidth > 768 ? "605px" : "402px",
//                               height: "auto",
//                               margin: "auto",
//                               width: "90%",
//                             }}
//                           >
//                             <div
//                               className="modal-content"
//                               style={{
//                                 backgroundColor: "#F8F6F0",
//                                 borderRadius: "16px",
//                                 padding: window.innerWidth > 768 ? "30px 40px" : "20px",
//                                 position: "relative",
//                               }}
//                             >
//                               {/* Close Button */}
//                               <button
//                                 type="button"
//                                 onClick={handleCancel}
//                                 style={{
//                                   position: "absolute",
//                                   top: "16px",
//                                   right: "16px",
//                                   background: "none",
//                                   border: "none",
//                                   fontSize: "24px",
//                                   color: "#666",
//                                   cursor: "pointer",
//                                   width: "32px",
//                                   height: "32px",
//                                   display: "flex",
//                                   alignItems: "center",
//                                   justifyContent: "center",
//                                   borderRadius: "50%",
//                                   transition: "background-color 0.2s",
//                                 }}
//                                 onMouseEnter={(e) => {
//                                   e.target.style.backgroundColor = "rgba(0,0,0,0.1)";
//                                 }}
//                                 onMouseLeave={(e) => {
//                                   e.target.style.backgroundColor = "transparent";
//                                 }}
//                               >
//                                 ×
//                               </button>

//                               <form onSubmit={handleSaveAddress}>
//                                 {/* Address Details Section */}
//                                 <div style={{ marginBottom: "20px" }}>
//                                   {addressType ? (
//                                     <div
//                                       style={{
//                                         fontSize: "12px",
//                                         color: "#2c2c2c",
//                                       }}
//                                     >
//                                       <img src={locationpng} alt="" />
//                                       {address}
//                                     </div>
//                                   ) : (
//                                     <div
//                                       style={{
//                                         fontSize: "12px",
//                                       }}
//                                     >
//                                       <img src={locationpng} alt="" />
//                                       <span
//                                         style={{
//                                           fontFamily: "Inter",
//                                           fontSize: "14px",
//                                           fontWeight: "500",
//                                           color: "#2c2c2c",
//                                         }}
//                                       >
//                                         Select Delivery Address Type
//                                       </span>
//                                     </div>
//                                   )}
//                                 </div>

//                                 {/* Address Type Selection */}
//                                 <div style={{ marginBottom: "20px" }}>
//                                   <div
//                                     style={{
//                                       display: "grid",
//                                       gridTemplateColumns: "repeat(4, 1fr)",
//                                       gap: "8px",
//                                     }}
//                                   >
//                                     {addressTypes.map((type) => (
//                                       <button
//                                         key={type.key}
//                                         type="button"
//                                         onClick={() => setAddressType(type.key)}
//                                         style={{
//                                           width: isLargeScreen ? "auto" : "75px",
//                                           height: isLargeScreen ? "55px" : "43px",
//                                           padding: "8px",
//                                           borderRadius: "12px",
//                                           border:
//                                             addressType === type.key
//                                               ? "1.2px solid #F5DEB3"
//                                               : "1.2px solid #F5DEB3",
//                                           backgroundColor:
//                                             addressType === type.key
//                                               ? "#6B8E23"
//                                               : "#FFF8DC",
//                                           cursor: "pointer",
//                                           transition: "all 0.2s ease",
//                                           display: "flex",
//                                           flexDirection: "row",
//                                           alignItems: "center",
//                                           justifyContent: "center",
//                                           gap: "4px",
//                                           opacity: 1,
//                                         }}
//                                       >
//                                         <img
//                                           src={
//                                             addressType === type.key
//                                               ? type.icon2
//                                               : type.icon
//                                           }
//                                           alt={type.label}
//                                           style={{
//                                             width: isLargeScreen ? "24px" : "16px",
//                                             height: isLargeScreen ? "24px" : "16px",
//                                             objectFit: "contain",
//                                           }}
//                                         />
//                                         <span
//                                           style={{
//                                             fontSize: "12px",
//                                             fontWeight: "500",
//                                             fontFamily: "Inter",
//                                             color:
//                                               addressType === type.key ? "#fff" : "#000",
//                                           }}
//                                         >
//                                           {type.label}
//                                         </span>
//                                       </button>
//                                     ))}
//                                   </div>
//                                 </div>

//                                 {/* Type Specific Fields */}
//                                 {renderTypeSpecificFields()}

//                                 {/* Footer Buttons */}
//                                 {addressType && (
//                                   <div
//                                     className="d-flex flex-wrap justify-content-center align-items-center mt-4 gap-3"
//                                     style={{
//                                       width: "100%",
//                                       margin: "0 auto",
//                                     }}
//                                   >
//                                     {/* Cancel Button */}
//                                     <button
//                                       type="button"
//                                       className="btn"
//                                       onClick={handleCancel}
//                                       style={{
//                                         backgroundColor: "transparent",
//                                         border: "1px solid #d5c5b0",
//                                         borderRadius: "12px",
//                                         width: window.innerWidth > 768 ? "160px" : "120px", // smaller on mobile
//                                         height: "45px",
//                                         fontWeight: "600",
//                                         textAlign: "center",
//                                         fontSize: window.innerWidth > 768 ? "16px" : "14px",
//                                         padding: "0 10px",
//                                         display: "flex",
//                                         justifyContent: "center",
//                                         alignItems: "center",
//                                         gap: "6px",
//                                       }}
//                                     >
//                                       Cancel
//                                       <img
//                                         src={cross}
//                                         alt=""
//                                         style={{ width: "14px", height: "14px" }}
//                                       />
//                                     </button>

//                                     {/* Save Button */}
//                                     <button
//                                       type="submit"
//                                       className="btn d-flex justify-content-center align-items-center"
//                                       disabled={!isFormValid() || isLoading}
//                                       style={{
//                                         backgroundColor:
//                                           isFormValid() && !isLoading
//                                             ? "#E6B800"
//                                             : "#C0C0C0",
//                                         borderRadius: "12px",
//                                         border: "1px solid #c0c0c0",
//                                         width: window.innerWidth > 768 ? "200px" : "160px",
//                                         height: "45px",
//                                         fontWeight: "600",
//                                         color: "black",
//                                         cursor:
//                                           isFormValid() && !isLoading
//                                             ? "pointer"
//                                             : "not-allowed",
//                                         fontSize: window.innerWidth > 768 ? "16px" : "14px",
//                                         padding: "0 12px",
//                                         gap: "6px",
//                                       }}
//                                     >
//                                       {isLoading
//                                         ? "Saving..."
//                                         : location.state?.editingAddress
//                                         ? "Update Address"
//                                         : "Save Address"}
//                                       {!isLoading && (
//                                         <CircleCheck
//                                           style={{
//                                             width: "16px",
//                                             height: "16px",
//                                             marginTop: "1px",
//                                           }}
//                                         />
//                                       )}
//                                     </button>
//                                   </div>
//                                 )}
//                               </form>
//                             </div>
//                           </div>
//                         </div>
//             </div>
//           )
//         }
//         </div>

//         {/* Search Action Loading */}
//         {actionLoading === "search" && (
//           <div
//             style={{
//               position: "absolute",
//               top: 0,
//               left: 0,
//               width: "100%",
//               height: "100%",
//               backgroundColor: "rgba(255, 255, 255, 0.8)",
//               zIndex: 10,
//               borderRadius: "16px",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//             }}
//           >
//             <div
//               className="spinner-border"
//               role="status"
//               style={{
//                 width: "3rem",
//                 height: "3rem",
//                 color: "#6B8E23",
//               }}
//             >
//               <span className="visually-hidden">Loading...</span>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default LocationModal;

// import React, { useState, useEffect, useRef, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   FaCrosshairs,
//   FaMapMarkerAlt,
//   FaCheckCircle,
//   FaSearch,
//   FaPlus,
//   FaChevronDown,
//   FaTimesCircle,
// } from "react-icons/fa";
// import { CircleCheck } from "lucide-react";
// import locationpng from "./../assets/deliverylocation.svg";
// import homeimg from "./../assets/ion_home-outline.png";
// import homeimg2 from "./../assets/ion_home-outline-white.svg";
// import apartmentimg from "./../assets/apartment.png";
// import apartmentimg2 from "./../assets/tabler_building-skyscraper-white.svg";
// import workimg from "./../assets/streamline-ultimate_work-from-home-user-sofa.png";
// import workimg2 from "./../assets/streamline-ultimate_work-from-home-user-sofa-white.svg";
// import schoolimg from "./../assets/streamline-ultimate-color_study-exam-math.png";
// import schoolimg2 from "./../assets/streamline-ultimate-color_study-exam-math-white.png";
// import cross from "./../assets/cross.png";
// import spilt from "./../assets/spilt.png";
// import secure from "./../assets/secure.png";

// const LocationModal = ({ show, onClose }) => {
//   const navigate = useNavigate();
//   const [searchQuery, setSearchQuery] = useState("");
//   const [searchSuggestions, setSearchSuggestions] = useState([]);
//   const [showSearch, setShowSearch] = useState(false);
//   const [savedAddresses, setSavedAddresses] = useState([]);
//   const [primaryAddressId, setPrimaryAddressId] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [actionLoading, setActionLoading] = useState(null);
//   const [scriptLoaded, setScriptLoaded] = useState(false);
//   const [showAddressDropdown, setShowAddressDropdown] = useState(false);

//   // Address form states
//   const [addressType, setAddressType] = useState("");
//   const [houseName, setHouseName] = useState("");
//   const [homeName, setHomeName] = useState("");
//   const [landmark, setLandmark] = useState("");
//   const [floor, setFloor] = useState("");
//   const [apartmentName, setApartmentName] = useState("");
//   const [towerBlock, setTowerBlock] = useState("");
//   const [flat, setFlat] = useState("");
//   const [schoolName, setSchoolName] = useState("");
//   const [studentName, setStudentName] = useState("");
//   const [studentClass, setStudentClass] = useState("");
//   const [studentSection, setStudentSection] = useState("");
//   const [companyName, setCompanyName] = useState("");
//   const [floorNo, setFloorNo] = useState("");

//   const searchInputRef = useRef(null);
//   const autocompleteServiceRef = useRef(null);
//   const placesServiceRef = useRef(null);
//   const debounceTimerRef = useRef(null);
//   const fetchAbortControllerRef = useRef(null);
//   const hasFetchedAddressesRef = useRef(false);
//   const isModalMountedRef = useRef(false);
//   const dropdownRef = useRef(null);

//   const API_KEY = import.meta.env.VITE_MAP_KEY;
//   const primaryAddress = JSON.parse(localStorage.getItem("primaryAddress"));
//   const currentLocation = JSON.parse(localStorage.getItem("currentLocation"));
//   const isLargeScreen = window.innerWidth >= 768;

//   const addressTypes = [
//     { key: "Home", label: "Home", icon: homeimg, icon2: homeimg2 },
//     { key: "PG", label: "PG/ Apartment", icon: apartmentimg, icon2: apartmentimg2 },
//     { key: "School", label: "School", icon: schoolimg, icon2: schoolimg2 },
//     { key: "Work", label: "Work", icon: workimg, icon2: workimg2 },
//   ];

//   // Google Maps script loading
//   useEffect(() => {
//     if (!show) return;
//     isModalMountedRef.current = true;

//     if (window.google?.maps?.places) {
//       setScriptLoaded(true);
//       initializeServices();
//       return;
//     }

//     const existingScript = document.querySelector(
//       `script[src*="maps.googleapis.com"]`
//     );

//     if (existingScript) {
//       const checkInterval = setInterval(() => {
//         if (window.google?.maps?.places) {
//           setScriptLoaded(true);
//           initializeServices();
//           clearInterval(checkInterval);
//         }
//       }, 50);
//       return () => clearInterval(checkInterval);
//     }

//     const script = document.createElement("script");
//     script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&loading=async`;
//     script.async = true;
//     script.defer = true;

//     script.onload = () => {
//       if (isModalMountedRef.current) {
//         setScriptLoaded(true);
//         initializeServices();
//       }
//     };

//     script.onerror = () => console.error("Failed to load Google Maps");
//     document.head.appendChild(script);

//     return () => {
//       isModalMountedRef.current = false;
//     };
//   }, [show, API_KEY]);

//   const initializeServices = useCallback(() => {
//     if (!window.google?.maps?.places) return;

//     if (!autocompleteServiceRef.current) {
//       autocompleteServiceRef.current =
//         new window.google.maps.places.AutocompleteService();
//     }
//     if (!placesServiceRef.current) {
//       placesServiceRef.current = new window.google.maps.places.PlacesService(
//         document.createElement("div")
//       );
//     }
//   }, []);

//   useEffect(() => {
//     if (show && searchInputRef.current) {
//       const timer = setTimeout(() => searchInputRef.current?.focus(), 100);
//       return () => clearTimeout(timer);
//     }
//   }, [show]);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setShowAddressDropdown(false);
//       }
//     };

//     if (show) {
//       document.addEventListener("mousedown", handleClickOutside);
//       return () => document.removeEventListener("mousedown", handleClickOutside);
//     }
//   }, [show]);

//   const fetchAddressesInBackground = async (customerId) => {
//     try {
//       const response = await fetch(
//         `http://localhost:7013/api/User/customers/${customerId}/addresses`,
//         { method: "GET", headers: { "Content-Type": "application/json" } }
//       );

//       if (response.ok) {
//         const result = await response.json();
//         if (result.success) {
//           const addresses = result.addresses || [];
//           const primaryId = result.primaryAddress || null;

//           localStorage.setItem(
//             `addresses_${customerId}`,
//             JSON.stringify({ addresses, primaryAddress: primaryId })
//           );
//           localStorage.setItem(
//             `addresses_timestamp_${customerId}`,
//             Date.now().toString()
//           );
//         }
//       }
//     } catch (error) {
//       console.error("Background fetch error:", error);
//     }
//   };

//   const fetchSavedAddresses = useCallback(async () => {
//     if (hasFetchedAddressesRef.current) return;

//     try {
//       setLoading(true);
//       hasFetchedAddressesRef.current = true;

//       const user = JSON.parse(localStorage.getItem("user"));
//       const customerId = user?._id;

//       if (!customerId) {
//         setLoading(false);
//         return;
//       }

//       const cachedAddresses = localStorage.getItem(`addresses_${customerId}`);
//       const cacheTimestamp = localStorage.getItem(
//         `addresses_timestamp_${customerId}`
//       );
//       const CACHE_DURATION = 5 * 60 * 1000;

//       if (cachedAddresses && cacheTimestamp) {
//         const age = Date.now() - parseInt(cacheTimestamp);
//         if (age < CACHE_DURATION) {
//           const cached = JSON.parse(cachedAddresses);
//           setSavedAddresses(cached.addresses || []);
//           setPrimaryAddressId(cached.primaryAddress || null);
//           setLoading(false);
//           fetchAddressesInBackground(customerId);
//           return;
//         }
//       }

//       fetchAbortControllerRef.current = new AbortController();

//       const response = await fetch(
//         `http://localhost:7013/api/User/customers/${customerId}/addresses`,
//         {
//           method: "GET",
//           headers: { "Content-Type": "application/json" },
//           signal: fetchAbortControllerRef.current.signal,
//         }
//       );

//       if (response.ok) {
//         const result = await response.json();
//         if (result.success) {
//           const addresses = result.addresses || [];
//           const primaryId = result.primaryAddress || null;

//           setSavedAddresses(addresses);
//           setPrimaryAddressId(primaryId);

//           localStorage.setItem(
//             `addresses_${customerId}`,
//             JSON.stringify({ addresses, primaryAddress: primaryId })
//           );
//           localStorage.setItem(
//             `addresses_timestamp_${customerId}`,
//             Date.now().toString()
//           );
//         }
//       }
//     } catch (error) {
//       if (error.name !== "AbortError") {
//         console.error("Error fetching addresses:", error);
//       }
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (show) {
//       fetchSavedAddresses();
//     }

//     return () => {
//       if (fetchAbortControllerRef.current) {
//         fetchAbortControllerRef.current.abort();
//       }
//       if (!show) {
//         hasFetchedAddressesRef.current = false;
//       }
//     };
//   }, [show, fetchSavedAddresses]);

//   const handleSearchChange = useCallback((e) => {
//     const query = e.target.value;
//     setSearchQuery(query);

//     if (debounceTimerRef.current) {
//       clearTimeout(debounceTimerRef.current);
//     }

//     if (!window.google?.maps?.places || !autocompleteServiceRef.current) {
//       return;
//     }

//     if (query.length > 2) {
//       debounceTimerRef.current = setTimeout(() => {
//         autocompleteServiceRef.current.getPlacePredictions(
//           {
//             input: query,
//             types: ["geocode", "establishment"],
//             componentRestrictions: { country: "in" },
//           },
//           (predictions, status) => {
//             if (
//               status === window.google.maps.places.PlacesServiceStatus.OK &&
//               predictions
//             ) {
//               setSearchSuggestions(predictions);
//             } else {
//               setSearchSuggestions([]);
//             }
//           }
//         );
//       }, 300);
//     } else {
//       setSearchSuggestions([]);
//     }
//   }, []);

//   const handleLocationSelect = useCallback(
//     (place) => {
//       if (!placesServiceRef.current) {
//         placesServiceRef.current = new window.google.maps.places.PlacesService(
//           document.createElement("div")
//         );
//       }

//       setActionLoading("search");
//       setShowSearch(false);

//       placesServiceRef.current.getDetails(
//         {
//           placeId: place.place_id,
//           fields: ["geometry", "name", "formatted_address", "vicinity"],
//         },
//         (placeResult, status) => {
//           setActionLoading(null);
//           if (status === window.google.maps.places.PlacesServiceStatus.OK) {
//             const locationData = {
//               lat: placeResult.geometry.location.lat(),
//               lng: placeResult.geometry.location.lng(),
//             };

//             onClose();
//             navigate("/location", {
//               state: {
//                 selectedPlace: {
//                   location: locationData,
//                   address: placeResult.formatted_address,
//                   name:
//                     placeResult.name ||
//                     placeResult.formatted_address.split(",")[0],
//                   vicinity: placeResult.vicinity,
//                 },
//               },
//             });
//           }
//         }
//       );
//     },
//     [navigate, onClose]
//   );

//   const handleSelectSavedAddress = useCallback(
//     (address) => {
//       let locationCoords = { lat: 40.7128, lng: -74.006 };

//       if (address.location) {
//         if (
//           address.location.coordinates &&
//           address.location.coordinates.length >= 2
//         ) {
//           locationCoords = {
//             lng: parseFloat(address.location.coordinates[0]),
//             lat: parseFloat(address.location.coordinates[1]),
//           };
//         } else if (address.location.lat && address.location.lng) {
//           locationCoords = {
//             lat: parseFloat(address.location.lat),
//             lng: parseFloat(address.location.lng),
//           };
//         }
//       }

//       onClose();
//       navigate("/location", {
//         state: {
//           selectedPlace: {
//             location: locationCoords,
//             address: address.fullAddress || address.address || "",
//             name: address.houseName || "",
//           },
//           editingAddress: address,
//         },
//       });
//     },
//     [navigate, onClose]
//   );

//   const handleAddNewAddress = useCallback(() => {
//     onClose();
//     navigate("/location");
//   }, [navigate, onClose]);

//   const removePrimaryAddress = useCallback(async () => {
//     try {
//       const user = JSON.parse(localStorage.getItem("user"));
//       const customerId = user?._id;

//       if (!customerId || !primaryAddressId) return;

//       setPrimaryAddressId(null);
//       localStorage.removeItem("primaryAddress");

//       const cachedAddresses = localStorage.getItem(`addresses_${customerId}`);
//       if (cachedAddresses) {
//         const cached = JSON.parse(cachedAddresses);
//         cached.primaryAddress = null;
//         localStorage.setItem(`addresses_${customerId}`, JSON.stringify(cached));
//       }

//       fetch(
//         `http://localhost:7013/api/User/customers/${customerId}/primary-address/remove`,
//         {
//           method: "PATCH",
//           headers: { "Content-Type": "application/json" },
//         }
//       ).catch((error) =>
//         console.error("Error removing primary address:", error)
//       );
//     } catch (error) {
//       console.error("Error removing primary address:", error);
//     }
//   }, [primaryAddressId]);

//   const handleUseCurrentLocation = useCallback(async () => {
//     if (actionLoading) return;

//     setActionLoading("current-location");

//     try {
//       if (primaryAddressId) {
//         removePrimaryAddress();
//       }

//       onClose();
//       navigate("/location");
//     } catch (error) {
//       console.error("Error handling current location:", error);
//       onClose();
//       navigate("/location");
//     } finally {
//       setActionLoading(null);
//     }
//   }, [primaryAddressId, removePrimaryAddress, navigate, onClose, actionLoading]);

//   const handleDeliverHere = useCallback(
//     async (address) => {
//       if (actionLoading) return;

//       setActionLoading(address._id);

//       try {
//         const user = JSON.parse(localStorage.getItem("user"));
//         const customerId = user?._id;

//         if (!customerId) return;

//         setPrimaryAddressId(address._id);
//         localStorage.setItem("primaryAddress", JSON.stringify(address));

//         const cachedAddresses = localStorage.getItem(`addresses_${customerId}`);
//         if (cachedAddresses) {
//           const cached = JSON.parse(cachedAddresses);
//           cached.primaryAddress = address._id;
//           localStorage.setItem(
//             `addresses_${customerId}`,
//             JSON.stringify(cached)
//           );
//         }

//         onClose();

//         const response = await fetch(
//           `http://localhost:7013/api/User/customers/${customerId}/addresses/${address._id}/primary`,
//           {
//             method: "PATCH",
//             headers: { "Content-Type": "application/json" },
//           }
//         );

//         if (response.ok) {
//           setTimeout(() => {
//             window.location.reload();
//           }, 100);
//         }
//       } catch (error) {
//         console.error("Error setting primary address:", error);
//       } finally {
//         setActionLoading(null);
//       }
//     },
//     [onClose, actionLoading]
//   );

//   // Form validation
//   const isFormValid = () => {

//     switch (addressType) {
//       case "Home":
//         return homeName.trim();
//       case "PG":
//         return apartmentName.trim() && towerBlock.trim() && flat.trim();
//       case "School":
//         return (
//           schoolName.trim() &&
//           studentName.trim() &&
//           studentClass.trim() &&
//           studentSection.trim()
//         );
//       case "Work":
//         return companyName.trim() && floorNo.trim();
//       default:
//         return false;
//     }
//   };

//   // Handle save address
//  const handleSaveAddress = async (e) => {
//     e.preventDefault();
//     if (!isFormValid()) {
//       setError("Please fill all required fields");
//       return;
//     }

//     const addressData = {
//       location: selectedLocation,
//       address: address,
//       houseName: houseName,
//       addressType: addressType,
//       homeName: homeName,
//       apartmentName: apartmentName,
//       schoolName: schoolName,
//       companyName: companyName,
//       hubName: hub[0]?.hubName || "",
//       hubId: hub[0]?.hub || "",
//       ...(addressType === "Home" && { landmark, floor }),
//       ...(addressType === "PG" && { towerBlock, flat, floor }),
//       ...(addressType === "School" && {
//         studentName,
//         studentClass,
//         studentSection,
//       }),
//       ...(addressType === "Work" && { floorNo }),
//       fullAddress: generateFullAddress(),
//     };

//     console.log("Saving address:", addressData);

//     try {
//       setIsLoading(true);

//       const user = JSON.parse(localStorage.getItem("user"));
//       const customerId = user._id;

//       if (!customerId) {
//         setError("Customer ID not found. Please login again.");
//         return;
//       }

//       const requestPayload = {
//         customerId: customerId,
//         addressType: addressData.addressType,
//         houseName: addressData.houseName,
//         fullAddress: addressData.fullAddress,
//         location: {
//           lat: addressData.location.lat,
//           lng: addressData.location.lng,
//         },
//         landmark: addressData.landmark || "",
//         floor: addressData.floor || "",
//         towerBlock: addressData.towerBlock || "",
//         flat: addressData.flat || "",
//         studentName: addressData.studentName || "",
//         studentClass: addressData.studentClass || "",
//         studentSection: addressData.studentSection || "",
//         floorNo: addressData.floorNo || "",
//         homeName: addressData.homeName || "",
//         apartmentName: addressData.apartmentName || "",
//         schoolName: addressData.schoolName || "",
//         companyName: addressData.companyName || "",
//         isDefault: true,
//         hubName: addressData.hubName || "",
//         hubId: addressData.hubId || "",
//       };

//       // If editing existing address, include addressId for update
//       if (location.state?.editingAddress?._id) {
//         requestPayload.addressId = location.state.editingAddress._id;
//       }

//       const endpoint = location.state?.editingAddress?._id
//         ? `http://localhost:7013/api/User/customers/${user._id}/addresses/${location.state.editingAddress._id}`
//         : "http://localhost:7013/api/User/addresses";
//       const method = location.state?.editingAddress?._id ? "PUT" : "POST";

//       const response = await fetch(endpoint, {
//         method: method,
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(requestPayload),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || "Failed to save address");
//       }

//       const result = await response.json();

//       if (result.success) {
//         setShowAddressForm(false);
//         resetForm();

//         navigate("/home", {
//           state: {
//             userLocation: selectedLocation,
//             userAddress: address,
//             addressData: addressData,
//           },
//         });
//       } else {
//         throw new Error(result.message || "Failed to save address");
//       }
//     } catch (error) {
//       console.error("Error saving address:", error);
//       setError(error.message || "Failed to save address. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleCancel = () => {
//     setAddressType("");
//     setHouseName("");
//     setHomeName("");
//     setLandmark("");
//     setFloor("");
//     setApartmentName("");
//     setTowerBlock("");
//     setFlat("");
//     setSchoolName("");
//     setStudentName("");
//     setStudentClass("");
//     setStudentSection("");
//     setCompanyName("");
//     setFloorNo("");
//   };

//   // Render type-specific fields
//   const renderTypeSpecificFields = () => {
//     const commonInputStyle = {
//       width: "100%",
//       height: "44px",
//       borderRadius: "12px",
//       padding: "8px 16px",
//       border: "0.4px solid #6B8E23",
//       background: "#FAFAFA",
//       fontSize: "14px",
//       marginBottom: "10px",
//     };

//     switch (addressType) {
//       case "Home":
//         return (
//           <div
//             className="d-flex flex-column align-items-start mt-2"
//             style={{
//               gap: "12px",
//               borderRadius: "12px",
//               width: "100%",
//               maxWidth: isLargeScreen ? "500px" : "354px",
//               margin: "0 auto 20px auto",
//             }}
//           >
//             <input
//               type="text"
//               value={homeName}
//               onChange={(e) => setHomeName(e.target.value)}
//               placeholder="Home Name *"
//               style={commonInputStyle}
//             />
//             <input
//               type="text"
//               value={landmark}
//               onChange={(e) => setLandmark(e.target.value)}
//               placeholder="Landmark, building, floor"
//               style={{ ...commonInputStyle, marginBottom: "0" }}
//             />
//           </div>
//         );

//       case "PG":
//         return (
//           <div
//             className="d-flex flex-column align-items-start mt-2"
//             style={{
//               gap: "12px",
//               borderRadius: "12px",
//               width: "100%",
//               maxWidth: isLargeScreen ? "500px" : "354px",
//               margin: "0 auto 20px auto",
//             }}
//           >
//             <input
//               type="text"
//               value={apartmentName}
//               onChange={(e) => setApartmentName(e.target.value)}
//               placeholder="Apartment Name *"
//               style={commonInputStyle}
//             />
//             <input
//               type="text"
//               value={towerBlock}
//               onChange={(e) => setTowerBlock(e.target.value)}
//               placeholder="Tower/Block name *"
//               style={commonInputStyle}
//             />
//             <div
//               className="d-flex"
//               style={{
//                 width: "100%",
//                 gap: "12px",
//               }}
//             >
//               <input
//                 type="text"
//                 value={flat}
//                 onChange={(e) => setFlat(e.target.value)}
//                 placeholder="Flat *"
//                 style={commonInputStyle}
//               />
//               <input
//                 type="text"
//                 value={floor}
//                 onChange={(e) => setFloor(e.target.value)}
//                 placeholder="Floor"
//                 style={commonInputStyle}
//               />
//             </div>
//           </div>
//         );

//       case "School":
//         return (
//           <div
//             className="d-flex flex-column align-items-start mt-2"
//             style={{
//               gap: "12px",
//               borderRadius: "12px",
//               width: "100%",
//               maxWidth: isLargeScreen ? "500px" : "354px",
//               margin: "0 auto 20px auto",
//             }}
//           >
//             <div className="d-flex gap-2 align-items-start">
//               <img
//                 src={spilt}
//                 alt=""
//                 style={{ width: "20px", height: "20px", marginTop: "2px" }}
//               />
//               <p
//                 className="mb-0"
//                 style={{
//                   color: "#2c2c2c",
//                   fontSize: "14px",
//                   fontFamily: "Inter",
//                   fontWeight: "500",
//                 }}
//               >
//                 Later you can split the order
//               </p>
//             </div>

//             <div className="d-flex gap-2 align-items-start">
//               <img
//                 src={secure}
//                 alt=""
//                 style={{ width: "12px", height: "12px", marginTop: "2px" }}
//               />
//               <p
//                 className="mb-0"
//                 style={{
//                   color: "#2c2c2c",
//                   fontSize: "10px",
//                   fontFamily: "Inter",
//                   fontWeight: "500",
//                 }}
//               >
//                 Safe & Private: details are only used to deliver correctly.
//               </p>
//             </div>

//             <input
//               type="text"
//               value={schoolName}
//               onChange={(e) => setSchoolName(e.target.value)}
//               placeholder="School Name *"
//               style={commonInputStyle}
//             />

//             <input
//               type="text"
//               placeholder="Student's full name *"
//               value={studentName}
//               onChange={(e) => setStudentName(e.target.value)}
//               style={commonInputStyle}
//             />

//             <div
//               className="d-flex justify-content-between"
//               style={{
//                 width: "100%",
//                 gap: "12px",
//               }}
//             >
//               <input
//                 type="text"
//                 placeholder="Class *"
//                 value={studentClass}
//                 onChange={(e) => setStudentClass(e.target.value)}
//                 style={commonInputStyle}
//               />
//               <input
//                 type="text"
//                 placeholder="Section *"
//                 value={studentSection}
//                 onChange={(e) => setStudentSection(e.target.value)}
//                 style={commonInputStyle}
//               />
//             </div>
//           </div>
//         );

//       case "Work":
//         return (
//           <div
//             className="d-flex flex-column align-items-start mt-2"
//             style={{
//               gap: "12px",
//               borderRadius: "12px",
//               width: "100%",
//               maxWidth: isLargeScreen ? "500px" : "354px",
//               margin: "0 auto 20px auto",
//             }}
//           >
//             <input
//               type="text"
//               value={houseName}
//               onChange={(e) => setHouseName(e.target.value)}
//               placeholder="House / Flat / Block No. *"
//               style={commonInputStyle}
//             />
//             <input
//               type="text"
//               value={companyName}
//               onChange={(e) => setCompanyName(e.target.value)}
//               placeholder="Company Name *"
//               style={commonInputStyle}
//             />
//             <input
//               type="text"
//               value={floorNo}
//               onChange={(e) => setFloorNo(e.target.value)}
//               placeholder="Floor no *"
//               style={{ ...commonInputStyle, marginBottom: "0" }}
//             />
//           </div>
//         );

//       default:
//         return null;
//     }
//   };

//   const getPrimaryName = useCallback((address) => {
//     if (!address) return "";

//     switch (address.addressType) {
//       case "Home":
//         return address.homeName ||  "";
//       case "PG":
//         return address.apartmentName ||  "";
//       case "School":
//         return address.schoolName ||  "";
//       case "Work":
//         return address.companyName ||  "";
//       default:
//         return address.houseName || "";
//     }
//   }, []);

//   const getAddressIcon = useCallback((type) => {
//     switch (type) {
//       case "Home":
//         return "🏠";
//       case "PG":
//         return "🏢";
//       case "School":
//         return "🎓";
//       case "Work":
//         return "💼";
//       default:
//         return "📍";
//     }
//   }, []);

//   const isPrimaryAddress = useCallback(
//     (addressId) => primaryAddressId === addressId,
//     [primaryAddressId]
//   );

//   const getPrimaryAddress = useCallback(
//     () => savedAddresses.find((addr) => addr._id === primaryAddressId),
//     [savedAddresses, primaryAddressId]
//   );

//   useEffect(() => {
//     return () => {
//       if (debounceTimerRef.current) {
//         clearTimeout(debounceTimerRef.current);
//       }
//       if (fetchAbortControllerRef.current) {
//         fetchAbortControllerRef.current.abort();
//       }
//     };
//   }, []);

//   if (!show) return null;

//   return (
//     <div
//       style={{
//         position: "fixed",
//         top: 0,
//         left: 0,
//         right: 0,
//         bottom: 0,
//         backgroundColor: "rgba(0,0,0,0.5)",
//         zIndex: 1050,
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         padding: "20px",
//       }}
//       onClick={onClose}
//     >
//       <div
//         style={{
//           width: "100%",
//           height: "100%",
//           maxWidth: "605px",
//           maxHeight: "100vh",
//           backgroundColor: "white",
//           borderRadius: "16px",
//           border: "none",
//           boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
//           overflow: "hidden",
//           display: "flex",
//           flexDirection: "column",
//           position: "relative",
//         }}
//         onClick={(e) => e.stopPropagation()}
//       >
//         {loading && (
//           <div
//             style={{
//               position: "absolute",
//               top: "50%",
//               left: "50%",
//               transform: "translate(-50%, -50%)",
//               zIndex: 20,
//             }}
//           >
//             <div
//               className="spinner-border"
//               role="status"
//               style={{
//                 width: "2.5rem",
//                 height: "2.5rem",
//                 color: "#6B8E23",
//               }}
//             >
//               <span className="visually-hidden">Loading...</span>
//             </div>
//           </div>
//         )}

//         {/* Header */}
//         <div
//           style={{
//             padding: "20px",
//             borderBottom: "1px solid #f0f0f0",
//             flexShrink: 0,
//           }}
//         >
//           <div className="d-flex justify-content-between align-items-center mb-3">
//             <h5
//               style={{
//                 margin: 0,
//                 color: "#2c2c2c",
//                 fontFamily: "Inter",
//                 fontWeight: "600",
//               }}
//             >
//               Search for your delivery location
//             </h5>
//             <button
//               type="button"
//               onClick={onClose}
//               style={{
//                 fontSize: "20px",
//                 border: "none",
//                 background: "none",
//                 cursor: "pointer",
//                 color: "#555",
//                 lineHeight: "1",
//               }}
//             >
//               &times;
//             </button>
//           </div>
//           <p
//             style={{
//               margin: 0,
//               color: "#666",
//               fontSize: "14px",
//               fontFamily: "Inter",
//             }}
//           >
//             Pin your exact location for seamless delivery
//           </p>
//         </div>

//           <>
//             {/* Search Input */}
//             <div
//               style={{
//                 padding: "20px",
//                 position: "relative",
//                 flexShrink: 0,
//               }}
//             >
//               <div
//                 style={{
//                   backgroundColor: "white",
//                   borderRadius: "12px",
//                   boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
//                   border: "1px solid #e0e0e0",
//                   zIndex: 1000,
//                 }}
//               >
//                 <div
//                   style={{
//                     display: "flex",
//                     alignItems: "center",
//                     padding: "12px 16px",
//                     gap: "8px",
//                   }}
//                 >
//                   <FaSearch size={18} color="#666" />
//                   <input
//                     ref={searchInputRef}
//                     type="text"
//                     value={searchQuery}
//                     onChange={handleSearchChange}
//                     onFocus={() => setShowSearch(true)}
//                     placeholder="Search for area, street, landmark..."
//                     style={{
//                       flex: 1,
//                       border: "none",
//                       outline: "none",
//                       fontSize: "16px",
//                       padding: "8px 0",
//                       backgroundColor: "transparent",
//                       fontFamily: "Inter",
//                     }}
//                   />
//                   {searchQuery && (
//                     <button
//                       onClick={() => {
//                         setSearchQuery("");
//                         setSearchSuggestions([]);
//                       }}
//                       style={{
//                         background: "none",
//                         border: "none",
//                         fontSize: "18px",
//                         color: "#666",
//                         cursor: "pointer",
//                         padding: "4px",
//                       }}
//                     >
//                       ×
//                     </button>
//                   )}
//                 </div>

//                 {showSearch && searchSuggestions.length > 0 && (
//                   <div
//                     style={{
//                       borderTop: "1px solid #e0e0e0",
//                       maxHeight: "200px",
//                       overflowY: "auto",
//                     }}
//                   >
//                     {searchSuggestions.map((place, index) => (
//                       <div
//                         key={place.place_id}
//                         onClick={() => handleLocationSelect(place)}
//                         style={{
//                           padding: "12px 16px",
//                           borderBottom:
//                             index < searchSuggestions.length - 1
//                               ? "1px solid #f0f0f0"
//                               : "none",
//                           cursor: "pointer",
//                           transition: "background-color 0.2s",
//                           fontSize: "14px",
//                         }}
//                         onMouseEnter={(e) => {
//                           e.target.style.backgroundColor = "#f8f9fa";
//                         }}
//                         onMouseLeave={(e) => {
//                           e.target.style.backgroundColor = "white";
//                         }}
//                       >
//                         <div style={{ fontWeight: "500", color: "#333" }}>
//                           {place.structured_formatting.main_text}
//                         </div>
//                         <div
//                           style={{
//                             fontSize: "12px",
//                             color: "#666",
//                             marginTop: "2px",
//                           }}
//                         >
//                           {place.structured_formatting.secondary_text}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Use Current Location Button */}
//             <div
//               style={{
//                 padding: "0 20px 20px 20px",
//                 flexShrink: 0,
//               }}
//             >
//               <button
//                 onClick={handleUseCurrentLocation}
//                 disabled={actionLoading === "current-location"}
//                 style={{
//                   width: "100%",
//                   padding: "12px 16px",
//                   backgroundColor: "#6B8E23",
//                   border: "1px solid #6B8E23",
//                   borderRadius: "12px",
//                   color: "#fff",
//                   fontSize: "14px",
//                   fontWeight: "500",
//                   cursor:
//                     actionLoading === "current-location"
//                       ? "not-allowed"
//                       : "pointer",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   gap: "8px",
//                   fontFamily: "Inter",
//                   transition: "all 0.2s ease",
//                   opacity: actionLoading === "current-location" ? 0.7 : 1,
//                 }}
//                 onMouseEnter={(e) => {
//                   if (!actionLoading) {
//                     e.target.style.backgroundColor = "#5a7a1c";
//                   }
//                 }}
//                 onMouseLeave={(e) => {
//                   if (!actionLoading) {
//                     e.target.style.backgroundColor = "#6B8E23";
//                   }
//                 }}
//               >
//                 {actionLoading === "current-location" ? (
//                   <>
//                     <div
//                       className="spinner-border spinner-border-sm"
//                       role="status"
//                     >
//                       <span className="visually-hidden">Loading...</span>
//                     </div>
//                     Getting location...
//                   </>
//                 ) : (
//                   <>
//                     <FaCrosshairs size={16} />
//                     Use current location
//                     {primaryAddressId && " (Clear primary)"}
//                   </>
//                 )}
//               </button>
//             </div>

//             {/* Current Location Display */}
//             {currentLocation && currentLocation.address && (
//               <div
//                 style={{
//                   padding: "0 20px 10px 20px",
//                   flexShrink: 0,
//                 }}
//               >
//                 <div
//                   style={{
//                     padding: "12px",
//                     backgroundColor: "#f0f9f0",
//                     border: "1px solid #6B8E23",
//                     borderRadius: "8px",
//                   }}
//                 >
//                   <div
//                     style={{
//                       fontSize: "12px",
//                       color: "#666",
//                       marginBottom: "4px",
//                       fontFamily: "Inter",
//                     }}
//                   >
//                     Current Location:
//                   </div>
//                   <div
//                     style={{
//                       fontSize: "14px",
//                       color: "#2c2c2c",
//                       fontWeight: "500",
//                       fontFamily: "Inter",
//                     }}
//                   >
//                     {currentLocation.address}
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Saved Addresses Dropdown */}
//             <div
//               style={{
//                 padding: "0 20px 20px 20px",
//                 flex: 1,
//                 overflow: "hidden",
//                 display: "flex",
//                 flexDirection: "column",
//                 opacity: loading ? 0.5 : 1,
//                 transition: "opacity 0.3s",
//               }}
//             >
//               <div ref={dropdownRef} style={{ position: "relative" }}>
//                 <button
//                   onClick={() => setShowAddressDropdown(!showAddressDropdown)}
//                   disabled={loading}
//                   style={{
//                     width: "100%",
//                     backgroundColor: "white",
//                     border: "1px solid #e0e0e0",
//                     borderRadius: "12px",
//                     padding: "12px 16px",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "space-between",
//                     cursor: loading ? "default" : "pointer",
//                     boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
//                     fontSize: "14px",
//                     fontWeight: "500",
//                     color: "#333",
//                     fontFamily: "Inter",
//                     marginBottom: "8px",
//                   }}
//                 >
//                   <div
//                     style={{ display: "flex", alignItems: "center", gap: "8px" }}
//                   >
//                     <FaMapMarkerAlt color="#6B8E23" />
//                     <span>
//                       {loading
//                         ? "Loading addresses..."
//                         : savedAddresses.length > 0
//                         ? `${savedAddresses.length} Saved Addresses`
//                         : "No Saved Addresses"}
//                     </span>
//                   </div>
//                   <FaChevronDown
//                     style={{
//                       transform: showAddressDropdown
//                         ? "rotate(180deg)"
//                         : "rotate(0)",
//                       transition: "transform 0.2s",
//                     }}
//                   />
//                 </button>

//                 {showAddressDropdown && (
//                   <div
//                     style={{
//                       position: "absolute",
//                       top: "calc(100% + 4px)",
//                       left: 0,
//                       right: 0,
//                       backgroundColor: "white",
//                       borderRadius: "12px",
//                       boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
//                       border: "1px solid #e0e0e0",
//                       maxHeight: "300px",
//                       overflowY: "auto",
//                       zIndex: 2000,
//                     }}
//                   >
//                     <button
//                       onClick={handleAddNewAddress}
//                       style={{
//                         width: "100%",
//                         padding: "12px 16px",
//                         backgroundColor: "#6B8E23",
//                         color: "white",
//                         border: "none",
//                         borderRadius: "12px 12px 0 0",
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         gap: "8px",
//                         cursor: "pointer",
//                         fontSize: "14px",
//                         fontWeight: "600",
//                         fontFamily: "Inter",
//                         transition: "background-color 0.2s",
//                       }}
//                       onMouseEnter={(e) => {
//                         e.target.style.backgroundColor = "#5a7a1c";
//                       }}
//                       onMouseLeave={(e) => {
//                         e.target.style.backgroundColor = "#6B8E23";
//                       }}
//                     >
//                       <FaPlus size={14} />
//                       Add New Address
//                     </button>

//                     {savedAddresses.length > 0 ? (
//                       <div style={{ borderTop: "1px solid #e0e0e0" }}>
//                         {savedAddresses.map((address, index) => (
//                           <div
//                             key={address._id}
//                             style={{
//                               padding: "12px 16px",
//                               borderBottom:
//                                 index < savedAddresses.length - 1
//                                   ? "1px solid #f0f0f0"
//                                   : "none",
//                               cursor: "pointer",
//                               transition: "background-color 0.2s",
//                               backgroundColor:
//                                 primaryAddressId === address._id
//                                   ? "#f8fff8"
//                                   : "white",
//                             }}
//                             onMouseEnter={(e) => {
//                               if (primaryAddressId !== address._id) {
//                                 e.target.style.backgroundColor = "#f8f9fa";
//                               }
//                             }}
//                             onMouseLeave={(e) => {
//                               if (primaryAddressId !== address._id) {
//                                 e.target.style.backgroundColor = "white";
//                               }
//                             }}
//                           >
//                             <div
//                               style={{
//                                 display: "flex",
//                                 alignItems: "start",
//                                 gap: "8px",
//                               }}
//                             >
//                               <span
//                                 style={{ fontSize: "16px", marginTop: "2px" }}
//                               >
//                                 {getAddressIcon(address.addressType)}
//                               </span>
//                               <div style={{ flex: 1 }}>
//                                 <div
//                                   style={{
//                                     display: "flex",
//                                     alignItems: "center",
//                                     gap: "8px",
//                                     marginBottom: "4px",
//                                   }}
//                                 >
//                                   <span
//                                     style={{
//                                       fontWeight: "600",
//                                       fontSize: "14px",
//                                       color: "#333",
//                                       fontFamily: "Inter",
//                                     }}
//                                   >
//                                     {getPrimaryName(address)}
//                                   </span>
//                                   {primaryAddressId === address._id && (
//                                     <span
//                                       style={{
//                                         fontSize: "10px",
//                                         color: "#6B8E23",
//                                         backgroundColor: "#f0f9f0",
//                                         padding: "2px 6px",
//                                         borderRadius: "4px",
//                                         fontWeight: "500",
//                                       }}
//                                     >
//                                       PRIMARY
//                                     </span>
//                                   )}
//                                 </div>
//                                 <div
//                                   style={{
//                                     fontSize: "12px",
//                                     color: "#666",
//                                     lineHeight: "1.4",
//                                     fontFamily: "Inter",
//                                     marginBottom: "8px",
//                                   }}
//                                 >
//                                   {address.fullAddress}
//                                 </div>
//                                 <div
//                                   style={{
//                                     display: "flex",
//                                     gap: "8px",
//                                     flexWrap: "wrap",
//                                   }}
//                                 >
//                                   <button
//                                     onClick={(e) => {
//                                       e.stopPropagation();
//                                       handleSelectSavedAddress(address);
//                                     }}
//                                     style={{
//                                       padding: "6px 12px",
//                                       backgroundColor: "transparent",
//                                       border: "1px solid #6B8E23",
//                                       borderRadius: "6px",
//                                       color: "#6B8E23",
//                                       fontSize: "11px",
//                                       fontWeight: "500",
//                                       cursor: "pointer",
//                                       fontFamily: "Inter",
//                                       transition: "all 0.2s",
//                                     }}
//                                     onMouseEnter={(e) => {
//                                       e.target.style.backgroundColor = "#f0f9f0";
//                                     }}
//                                     onMouseLeave={(e) => {
//                                       e.target.style.backgroundColor =
//                                         "transparent";
//                                     }}
//                                   >
//                                     Edit
//                                   </button>
//                                   {isPrimaryAddress(address._id) ? (
//                                     <button
//                                       onClick={(e) => {
//                                         e.stopPropagation();
//                                         removePrimaryAddress();
//                                       }}
//                                       style={{
//                                         padding: "6px 12px",
//                                         backgroundColor: "transparent",
//                                         border: "1px solid #d9534f",
//                                         borderRadius: "6px",
//                                         color: "#d9534f",
//                                         fontSize: "11px",
//                                         fontWeight: "500",
//                                         cursor: "pointer",
//                                         fontFamily: "Inter",
//                                         transition: "all 0.2s",
//                                       }}
//                                       onMouseEnter={(e) => {
//                                         e.target.style.backgroundColor =
//                                           "#f8d7da";
//                                       }}
//                                       onMouseLeave={(e) => {
//                                         e.target.style.backgroundColor =
//                                           "transparent";
//                                       }}
//                                     >
//                                       <FaTimesCircle
//                                         size={10}
//                                         style={{ marginRight: "4px" }}
//                                       />
//                                       Remove Primary
//                                     </button>
//                                   ) : (
//                                     <button
//                                       onClick={(e) => {
//                                         e.stopPropagation();
//                                         handleDeliverHere(address);
//                                       }}
//                                       disabled={actionLoading === address._id}
//                                       style={{
//                                         padding: "6px 12px",
//                                         backgroundColor: "transparent",
//                                         border: "1px solid #6B8E23",
//                                         borderRadius: "6px",
//                                         color: "#6B8E23",
//                                         fontSize: "11px",
//                                         fontWeight: "500",
//                                         cursor:
//                                           actionLoading === address._id
//                                             ? "not-allowed"
//                                             : "pointer",
//                                         fontFamily: "Inter",
//                                         transition: "all 0.2s",
//                                         opacity:
//                                           actionLoading === address._id ? 0.7 : 1,
//                                       }}
//                                       onMouseEnter={(e) => {
//                                         e.target.style.backgroundColor =
//                                           "#f0f9f0";
//                                       }}
//                                       onMouseLeave={(e) => {
//                                         e.target.style.backgroundColor =
//                                           "transparent";
//                                       }}
//                                     >
//                                       {actionLoading === address._id ? (
//                                         <div
//                                           className="spinner-border spinner-border-sm"
//                                           role="status"
//                                           style={{
//                                             width: "12px",
//                                             height: "12px",
//                                           }}
//                                         >
//                                           <span className="visually-hidden">
//                                             Loading...
//                                           </span>
//                                         </div>
//                                       ) : (
//                                         "Set Primary"
//                                       )}
//                                     </button>
//                                   )}
//                                 </div>
//                               </div>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     ) : (
//                       <div
//                         style={{
//                           padding: "20px",
//                           textAlign: "center",
//                           color: "#666",
//                           fontSize: "14px",
//                           fontFamily: "Inter",
//                         }}
//                       >
//                         No saved addresses yet. Add your first address!
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>

//               {primaryAddressId && !showAddressDropdown && (
//                 <div
//                   style={{
//                     marginTop: "12px",
//                     padding: "12px",
//                     backgroundColor: "#f8fff8",
//                     border: "1px solid #6B8E23",
//                     borderRadius: "8px",
//                   }}
//                 >
//                   <div
//                     style={{
//                       fontSize: "12px",
//                       color: "#666",
//                       marginBottom: "4px",
//                       fontFamily: "Inter",
//                     }}
//                   >
//                     Current Primary Address:
//                   </div>
//                   <div
//                     style={{
//                       fontSize: "14px",
//                       color: "#2c2c2c",
//                       fontWeight: "600",
//                       fontFamily: "Inter",
//                     }}
//                   >
//                     {getPrimaryName(getPrimaryAddress())}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </>

//           {
//             !primaryAddress &&
//                <div
//             style={{
//               padding: "20px",
//               flex: 1,
//               overflowY: "auto",
//             }}
//           >
//             <h6
//               style={{
//                 color: "#2c2c2c",
//                 fontFamily: "Inter",
//                 fontWeight: "600",
//                 marginBottom: "16px",
//                 fontSize: "16px",
//               }}
//             >
//               Add Address
//             </h6>

//             <form onSubmit={handleSaveAddress}>
//               {/* Address Details Section */}
//               <div style={{ marginBottom: "20px" }}>
//                 {addressType ? (
//                   <div
//                     style={{
//                       fontSize: "12px",
//                       color: "#2c2c2c",
//                     }}
//                   >
//                     <img src={locationpng} alt="" />
//                     {currentLocation?.fullAddress || "Select location"}
//                   </div>
//                 ) : (
//                   <div
//                     style={{
//                       fontSize: "12px",
//                     }}
//                   >
//                     <img src={locationpng} alt="" />
//                     <span
//                       style={{
//                         fontFamily: "Inter",
//                         fontSize: "14px",
//                         fontWeight: "500",
//                         color: "#2c2c2c",
//                       }}
//                     >
//                       Select Delivery Address Type
//                     </span>
//                   </div>
//                 )}
//               </div>

//               {/* Address Type Selection */}
//               <div style={{ marginBottom: "20px" }}>
//                 <div
//                   style={{
//                     display: "grid",
//                     gridTemplateColumns: "repeat(4, 1fr)",
//                     gap: "8px",
//                   }}
//                 >
//                   {addressTypes.map((type) => (
//                     <button
//                       key={type.key}
//                       type="button"
//                       onClick={() => setAddressType(type.key)}
//                       style={{
//                         width: isLargeScreen ? "auto" : "75px",
//                         height: isLargeScreen ? "55px" : "43px",
//                         padding: "8px",
//                         borderRadius: "12px",
//                         border:
//                           addressType === type.key
//                             ? "1.2px solid #F5DEB3"
//                             : "1.2px solid #F5DEB3",
//                         backgroundColor:
//                           addressType === type.key ? "#6B8E23" : "#FFF8DC",
//                         cursor: "pointer",
//                         transition: "all 0.2s ease",
//                         display: "flex",
//                         flexDirection: "row",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         gap: "4px",
//                         opacity: 1,
//                       }}
//                     >
//                       <img
//                         src={
//                           addressType === type.key ? type.icon2 : type.icon
//                         }
//                         alt={type.label}
//                         style={{
//                           width: isLargeScreen ? "24px" : "16px",
//                           height: isLargeScreen ? "24px" : "16px",
//                           objectFit: "contain",
//                         }}
//                       />
//                       <span
//                         style={{
//                           fontSize: "12px",
//                           fontWeight: "500",
//                           fontFamily: "Inter",
//                           color: addressType === type.key ? "#fff" : "#000",
//                         }}
//                       >
//                         {type.label}
//                       </span>
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               {/* Type Specific Fields */}
//               {renderTypeSpecificFields()}

//               {/* Footer Buttons */}
//               {addressType && (
//                 <div
//                   className="d-flex flex-wrap justify-content-center align-items-center mt-4 gap-3"
//                   style={{
//                     width: "100%",
//                     margin: "0 auto",
//                   }}
//                 >
//                   {/* Cancel Button */}
//                   <button
//                     type="button"
//                     className="btn"
//                     onClick={handleCancel}
//                     style={{
//                       backgroundColor: "transparent",
//                       border: "1px solid #d5c5b0",
//                       borderRadius: "12px",
//                       width: isLargeScreen ? "160px" : "120px",
//                       height: "45px",
//                       fontWeight: "600",
//                       textAlign: "center",
//                       fontSize: isLargeScreen ? "16px" : "14px",
//                       padding: "0 10px",
//                       display: "flex",
//                       justifyContent: "center",
//                       alignItems: "center",
//                       gap: "6px",
//                     }}
//                   >
//                     Cancel
//                     <img
//                       src={cross}
//                       alt=""
//                       style={{ width: "14px", height: "14px" }}
//                     />
//                   </button>

//                   {/* Save Button */}
//                   <button
//                     type="submit"
//                     className="btn d-flex justify-content-center align-items-center"
//                     disabled={!isFormValid() || loading}
//                     style={{
//                       backgroundColor:
//                         isFormValid() && !loading ? "#E6B800" : "#C0C0C0",
//                       borderRadius: "12px",
//                       border: "1px solid #c0c0c0",
//                       width: isLargeScreen ? "200px" : "160px",
//                       height: "45px",
//                       fontWeight: "600",
//                       color: "black",
//                       cursor:
//                         isFormValid() && !loading ? "pointer" : "not-allowed",
//                       fontSize: isLargeScreen ? "16px" : "14px",
//                       padding: "0 12px",
//                       gap: "6px",
//                     }}
//                   >
//                     {loading ? "Saving..." : "Save Address"}
//                     {!loading && (
//                       <CircleCheck
//                         style={{
//                           width: "16px",
//                           height: "16px",
//                           marginTop: "1px",
//                         }}
//                       />
//                     )}
//                   </button>
//                 </div>
//               )}
//             </form>
//           </div>
//           }

//         {actionLoading === "search" && (
//           <div
//             style={{
//               position: "absolute",
//               top: 0,
//               left: 0,
//               width: "100%",
//               height: "100%",
//               backgroundColor: "rgba(255, 255, 255, 0.8)",
//               zIndex: 10,
//               borderRadius: "16px",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//             }}
//           >
//             <div
//               className="spinner-border"
//               role="status"
//               style={{
//                 width: "3rem",
//                 height: "3rem",
//                 color: "#6B8E23",
//               }}
//             >
//               <span className="visually-hidden">Loading...</span>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default LocationModal;

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCrosshairs,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaSearch,
  FaPlus,
  FaChevronDown,
  FaTimesCircle,
} from "react-icons/fa";
import { CircleCheck } from "lucide-react";
import locationpng from "./../assets/deliverylocation.svg";
import homeimg from "./../assets/ion_home-outline.png";
import homeimg2 from "./../assets/ion_home-outline-white.svg";
import apartmentimg from "./../assets/apartment.png";
import apartmentimg2 from "./../assets/tabler_building-skyscraper-white.svg";
import workimg from "./../assets/streamline-ultimate_work-from-home-user-sofa.png";
import workimg2 from "./../assets/streamline-ultimate_work-from-home-user-sofa-white.svg";
import schoolimg from "./../assets/streamline-ultimate-color_study-exam-math.png";
import schoolimg2 from "./../assets/streamline-ultimate-color_study-exam-math-white.png";
import cross from "./../assets/cross.png";
import spilt from "./../assets/spilt.png";
import secure from "./../assets/secure.png";

const LocationModal = ({ show, onClose }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [primaryAddressId, setPrimaryAddressId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [error, setError] = useState("");

  // Address form states
  const [addressType, setAddressType] = useState("Home");
  const [houseName, setHouseName] = useState("");
  const [homeName, setHomeName] = useState("");
  const [landmark, setLandmark] = useState("");
  const [floor, setFloor] = useState("");
  const [apartmentName, setApartmentName] = useState("");
  const [towerBlock, setTowerBlock] = useState("");
  const [flat, setFlat] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [studentSection, setStudentSection] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [floorNo, setFloorNo] = useState("");

  const searchInputRef = useRef(null);
  const autocompleteServiceRef = useRef(null);
  const placesServiceRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const fetchAbortControllerRef = useRef(null);
  const hasFetchedAddressesRef = useRef(false);
  const isModalMountedRef = useRef(false);
  const dropdownRef = useRef(null);

  const API_KEY = import.meta.env.VITE_MAP_KEY;
  const primaryAddress = JSON.parse(localStorage.getItem("primaryAddress"));
  const currentLocation = JSON.parse(localStorage.getItem("currentLocation"));
  const isLargeScreen = window.innerWidth >= 768;

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

  // Google Maps script loading
  useEffect(() => {
    if (!show) return;
    isModalMountedRef.current = true;

    if (window.google?.maps?.places) {
      setScriptLoaded(true);
      initializeServices();
      return;
    }

    const existingScript = document.querySelector(
      `script[src*="maps.googleapis.com"]`
    );

    if (existingScript) {
      const checkInterval = setInterval(() => {
        if (window.google?.maps?.places) {
          setScriptLoaded(true);
          initializeServices();
          clearInterval(checkInterval);
        }
      }, 50);
      return () => clearInterval(checkInterval);
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (isModalMountedRef.current) {
        setScriptLoaded(true);
        initializeServices();
      }
    };

    script.onerror = () => console.error("Failed to load Google Maps");
    document.head.appendChild(script);

    return () => {
      isModalMountedRef.current = false;
    };
  }, [show, API_KEY]);

  const initializeServices = useCallback(() => {
    if (!window.google?.maps?.places) return;

    if (!autocompleteServiceRef.current) {
      autocompleteServiceRef.current =
        new window.google.maps.places.AutocompleteService();
    }
    if (!placesServiceRef.current) {
      placesServiceRef.current = new window.google.maps.places.PlacesService(
        document.createElement("div")
      );
    }
  }, []);

  useEffect(() => {
    if (show && searchInputRef.current) {
      const timer = setTimeout(() => searchInputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [show]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowAddressDropdown(false);
      }
    };

    if (show) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [show]);

  const fetchAddressesInBackground = async (customerId) => {
    try {
      const response = await fetch(
        `http://localhost:7013/api/User/customers/${customerId}/addresses`,
        { method: "GET", headers: { "Content-Type": "application/json" } }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const addresses = result.addresses || [];
          const primaryId = result.primaryAddress || null;

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
  };

  const fetchSavedAddresses = useCallback(async () => {
    if (hasFetchedAddressesRef.current) return;

    try {
      setLoading(true);
      hasFetchedAddressesRef.current = true;

      const user = JSON.parse(localStorage.getItem("user"));
      const customerId = user?._id;

      if (!customerId) {
        setLoading(false);
        return;
      }

      const cachedAddresses = localStorage.getItem(`addresses_${customerId}`);
      const cacheTimestamp = localStorage.getItem(
        `addresses_timestamp_${customerId}`
      );
      const CACHE_DURATION = 5 * 60 * 1000;

      if (cachedAddresses && cacheTimestamp) {
        const age = Date.now() - parseInt(cacheTimestamp);
        if (age < CACHE_DURATION) {
          const cached = JSON.parse(cachedAddresses);
          setSavedAddresses(cached.addresses || []);
          setPrimaryAddressId(cached.primaryAddress || null);
          setLoading(false);
          fetchAddressesInBackground(customerId);
          return;
        }
      }

      fetchAbortControllerRef.current = new AbortController();

      const response = await fetch(
        `http://localhost:7013/api/User/customers/${customerId}/addresses`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          signal: fetchAbortControllerRef.current.signal,
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const addresses = result.addresses || [];
          const primaryId = result.primaryAddress || null;

          setSavedAddresses(addresses);
          setPrimaryAddressId(primaryId);

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
      if (error.name !== "AbortError") {
        console.error("Error fetching addresses:", error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (show) {
      fetchSavedAddresses();
    }

    return () => {
      if (fetchAbortControllerRef.current) {
        fetchAbortControllerRef.current.abort();
      }
      if (!show) {
        hasFetchedAddressesRef.current = false;
      }
    };
  }, [show, fetchSavedAddresses]);

  const handleSearchChange = useCallback((e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!window.google?.maps?.places || !autocompleteServiceRef.current) {
      return;
    }

    if (query.length > 2) {
      debounceTimerRef.current = setTimeout(() => {
        autocompleteServiceRef.current.getPlacePredictions(
          {
            input: query,
            types: ["geocode", "establishment"],
            componentRestrictions: { country: "in" },
          },
          (predictions, status) => {
            if (
              status === window.google.maps.places.PlacesServiceStatus.OK &&
              predictions
            ) {
              setSearchSuggestions(predictions);
            } else {
              setSearchSuggestions([]);
            }
          }
        );
      }, 300);
    } else {
      setSearchSuggestions([]);
    }
  }, []);

  const handleLocationSelect = useCallback(
    (place) => {
      if (!placesServiceRef.current) {
        placesServiceRef.current = new window.google.maps.places.PlacesService(
          document.createElement("div")
        );
      }

      setActionLoading("search");
      setShowSearch(false);

      placesServiceRef.current.getDetails(
        {
          placeId: place.place_id,
          fields: ["geometry", "name", "formatted_address", "vicinity"],
        },
        (placeResult, status) => {
          setActionLoading(null);
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            const locationData = {
              lat: placeResult.geometry.location.lat(),
              lng: placeResult.geometry.location.lng(),
            };

            onClose();
            navigate("/location", {
              state: {
                selectedPlace: {
                  location: locationData,
                  address: placeResult.formatted_address,
                  name:
                    placeResult.name ||
                    placeResult.formatted_address.split(",")[0],
                  vicinity: placeResult.vicinity,
                },
              },
            });
          }
        }
      );
    },
    [navigate, onClose]
  );

  const handleSelectSavedAddress = useCallback(
    (address) => {
      let locationCoords = { lat: 40.7128, lng: -74.006 };

      if (address.location) {
        if (
          address.location.coordinates &&
          address.location.coordinates.length >= 2
        ) {
          locationCoords = {
            lng: parseFloat(address.location.coordinates[0]),
            lat: parseFloat(address.location.coordinates[1]),
          };
        } else if (address.location.lat && address.location.lng) {
          locationCoords = {
            lat: parseFloat(address.location.lat),
            lng: parseFloat(address.location.lng),
          };
        }
      }

      onClose();
      navigate("/location", {
        state: {
          editingAddress: address,
        },
      });
    },
    [navigate, onClose]
  );

  const handleAddNewAddress = useCallback(() => {
    onClose();
    navigate("/location");
  }, [navigate, onClose]);

  const removePrimaryAddress = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const customerId = user?._id;

      if (!customerId || !primaryAddressId) return;

      setPrimaryAddressId(null);
      localStorage.removeItem("primaryAddress");

      const cachedAddresses = localStorage.getItem(`addresses_${customerId}`);
      if (cachedAddresses) {
        const cached = JSON.parse(cachedAddresses);
        cached.primaryAddress = null;
        localStorage.setItem(`addresses_${customerId}`, JSON.stringify(cached));
      }

      fetch(
        `http://localhost:7013/api/User/customers/${customerId}/primary-address/remove`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
        }
      ).catch((error) =>
        console.error("Error removing primary address:", error)
      );
    } catch (error) {
      console.error("Error removing primary address:", error);
    }
  }, [primaryAddressId]);

  const handleUseCurrentLocation = useCallback(async () => {
    if (actionLoading) return;

    setActionLoading("current-location");

    try {
      if (primaryAddressId) {
        removePrimaryAddress();
      }

      onClose();
      navigate("/current-location");
    } catch (error) {
      console.error("Error handling current location:", error);
      onClose();
      navigate("/current-`location");
    } finally {
      setActionLoading(null);
    }
  }, [
    primaryAddressId,
    removePrimaryAddress,
    navigate,
    onClose,
    actionLoading,
  ]);

  const handleDeliverHere = useCallback(
    async (address) => {
      if (actionLoading) return;

      setActionLoading(address._id);

      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const customerId = user?._id;

        if (!customerId) return;

        setPrimaryAddressId(address._id);
        localStorage.setItem("primaryAddress", JSON.stringify(address));

        const cachedAddresses = localStorage.getItem(`addresses_${customerId}`);
        if (cachedAddresses) {
          const cached = JSON.parse(cachedAddresses);
          cached.primaryAddress = address._id;
          localStorage.setItem(
            `addresses_${customerId}`,
            JSON.stringify(cached)
          );
        }

        onClose();

        const response = await fetch(
          `http://localhost:7013/api/User/customers/${customerId}/addresses/${address._id}/primary`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (response.ok) {
          setTimeout(() => {
            window.location.reload();
          }, 100);
        }
      } catch (error) {
        console.error("Error setting primary address:", error);
      } finally {
        setActionLoading(null);
      }
    },
    [onClose, actionLoading]
  );

  // Form validation - UPDATED WITH LOCATION CHECK
  const isFormValid = () => {
    if (
      !currentLocation?.location?.coordinates ||
      currentLocation.location.coordinates.length !== 2
    ) {
      setError("Please select a valid location first");
      return false;
    }

    switch (addressType) {
      case "Home":
        return !!(homeName && homeName.trim() !== "");
      case "PG":
        return !!(
          apartmentName &&
          apartmentName.trim() !== "" &&
          towerBlock &&
          towerBlock.trim() !== "" &&
          flat &&
          flat.trim() !== ""
        );
      case "School":
        return !!(
          schoolName &&
          schoolName.trim() !== "" &&
          studentName &&
          studentName.trim() !== "" &&
          studentClass &&
          studentClass.trim() !== "" &&
          studentSection &&
          studentSection.trim() !== ""
        );
      case "Work":
        return !!(
          companyName &&
          companyName.trim() !== "" &&
          houseName &&
          houseName.trim() !== "" &&
          floorNo &&
          floorNo.trim() !== ""
        );
      default:
        return false;
    }
  };

  // Handle save address
  const handleSaveAddress = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);

      const user = JSON.parse(localStorage.getItem("user"));
      const customerId = user?._id;

      if (!customerId) {
        setError("Customer ID not found. Please login again.");
        return;
      }

      // Validate that we have a proper location
      if (
        !currentLocation?.location?.coordinates ||
        currentLocation.location.coordinates.length !== 2
      ) {
        setError("Please select a valid location first");
        return;
      }

      // Validate required fields based on address type
      let houseNameValue = "";
      let fullAddressValue = "";

      switch (addressType) {
        case "Home":
          if (!homeName || homeName.trim() === "") {
            setError("Home name is required");
            return;
          }
          houseNameValue = homeName;
          fullAddressValue = `${homeName}, ${landmark || ""}`;
          break;

        case "PG":
          if (!apartmentName || !towerBlock || !flat) {
            setError("Apartment name, tower/block, and flat are required");
            return;
          }
          houseNameValue = apartmentName;
          fullAddressValue = `${apartmentName}, ${towerBlock}, Flat ${flat}${
            floor ? `, Floor ${floor}` : ""
          }`;
          break;

        case "School":
          if (!schoolName || !studentName || !studentClass || !studentSection) {
            setError(
              "School name, student name, class, and section are required"
            );
            return;
          }
          houseNameValue = schoolName;
          fullAddressValue = `${schoolName}, ${studentName}, Class ${studentClass}, Section ${studentSection}`;
          break;

        case "Work":
          if (!companyName || !houseName || !floorNo) {
            setError("Company name, house/flat number, and floor are required");
            return;
          }
          houseNameValue = companyName;
          fullAddressValue = `${companyName}, ${houseName}${
            floorNo ? `, Floor ${floorNo}` : ""
          }`;
          break;

        default:
          setError("Please select an address type");
          return;
      }

      // Get location in the format expected by backend API
      const getLocation = () => {
        if (
          currentLocation?.location?.coordinates &&
          currentLocation.location.coordinates.length === 2
        ) {
          // Convert from [lng, lat] to { lat, lng } format
          return {
            lat: currentLocation.location.coordinates[1], // latitude is second element
            lng: currentLocation.location.coordinates[0], // longitude is first element
          };
        } else {
          throw new Error("Invalid location data");
        }
      };

      const location = getLocation();

      const addressData = {
        customerId: customerId,
        addressType: addressType,
        houseName: houseNameValue,
        fullAddress: fullAddressValue,
        location: location,
        landmark: landmark || "",
        floor: floor || "",
        towerBlock: towerBlock || "",
        flat: flat || "",
        studentName: studentName || "",
        studentClass: studentClass || "",
        studentSection: studentSection || "",
        floorNo: floorNo || "",
        homeName: homeName || "",
        apartmentName: apartmentName || "",
        schoolName: schoolName || "",
        companyName: companyName || "",
        isDefault: true,
        hubName: currentLocation?.hubName || "",
        hubId: currentLocation?.hubId || "",
      };

      console.log("Final address data being sent:", addressData);

      const response = await fetch("http://localhost:7013/api/User/addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(addressData),
      });

      const result = await response.json();
      console.log("API Response:", result);

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to save address");
      }

      // Get the newly created address from response
      const newAddress = result.address;

      // Set as primary address in backend
      try {
        const primaryResponse = await fetch(
          `http://localhost:7013/api/User/customers/${customerId}/addresses/${newAddress._id}/primary`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (primaryResponse.ok) {
          console.log("Address set as primary successfully");
        }
      } catch (primaryError) {
        console.error("Error setting address as primary:", primaryError);
        // Continue anyway as the address was saved successfully
      }

      // Save to localStorage as primary address
      const primaryAddressData = {
        _id: newAddress._id,
        addressType: addressType,
        houseName: houseNameValue,
        fullAddress: fullAddressValue,
        location: {
          coordinates: currentLocation.location.coordinates,
          type: "Point",
        },
        landmark: landmark || "",
        floor: floor || "",
        towerBlock: towerBlock || "",
        flat: flat || "",
        studentName: studentName || "",
        studentClass: studentClass || "",
        studentSection: studentSection || "",
        floorNo: floorNo || "",
        homeName: homeName || "",
        apartmentName: apartmentName || "",
        schoolName: schoolName || "",
        companyName: companyName || "",
        hubName: currentLocation?.hubName || "",
        hubId: currentLocation?.hubId || "",
      };

      // Save to localStorage
      localStorage.setItem(
        "primaryAddress",
        JSON.stringify(primaryAddressData)
      );

      // Also update the addresses cache in localStorage
      const cachedAddresses = localStorage.getItem(`addresses_${customerId}`);
      if (cachedAddresses) {
        const cached = JSON.parse(cachedAddresses);
        // Add new address to cached addresses
        const updatedAddresses = [
          ...(cached.addresses || []),
          primaryAddressData,
        ];
        cached.addresses = updatedAddresses;
        cached.primaryAddress = newAddress._id;
        localStorage.setItem(`addresses_${customerId}`, JSON.stringify(cached));
        localStorage.setItem(
          `addresses_timestamp_${customerId}`,
          Date.now().toString()
        );
      }

      // Update state
      setPrimaryAddressId(newAddress._id);
      setSavedAddresses((prev) => [...prev, primaryAddressData]);

      // Success - reset form
      setAddressType("");
      setHouseName("");
      setHomeName("");
      setLandmark("");
      setFloor("");
      setApartmentName("");
      setTowerBlock("");
      setFlat("");
      setSchoolName("");
      setStudentName("");
      setStudentClass("");
      setStudentSection("");
      setCompanyName("");
      setFloorNo("");
      setError(""); // Clear any errors

      // Refresh addresses
      hasFetchedAddressesRef.current = false;
      await fetchSavedAddresses();

      // Show success message and close modal
      setTimeout(() => {
        onClose();
        // Optional: reload the page to reflect changes everywhere
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error saving address:", error);
      setError(error.message || "Failed to save address. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setAddressType("");
    setHouseName("");
    setHomeName("");
    setLandmark("");
    setFloor("");
    setApartmentName("");
    setTowerBlock("");
    setFlat("");
    setSchoolName("");
    setStudentName("");
    setStudentClass("");
    setStudentSection("");
    setCompanyName("");
    setFloorNo("");
    setError("");
  };

  // Render type-specific fields
  const renderTypeSpecificFields = () => {
    const commonInputStyle = {
      width: "100%",
      height: "44px",
      borderRadius: "12px",
      padding: "8px 16px",
      border: "0.4px solid #6B8E23",
      background: "#FAFAFA",
      fontSize: "14px",
      marginBottom: "10px",
    };

    switch (addressType) {
      case "Home":
        return (
          <div
            className="d-flex flex-column align-items-start mt-2"
            style={{
              gap: "12px",
              borderRadius: "12px",
              width: "100%",
              maxWidth: isLargeScreen ? "500px" : "354px",
              margin: "0 auto 20px auto",
            }}
          >
            <input
              type="text"
              value={homeName}
              onChange={(e) => setHomeName(e.target.value)}
              placeholder="Home Name *"
              style={commonInputStyle}
            />
            <input
              type="text"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="Landmark, building, floor"
              style={{ ...commonInputStyle, marginBottom: "0" }}
            />
          </div>
        );

      case "PG":
        return (
          <div
            className="d-flex flex-column align-items-start mt-2"
            style={{
              gap: "12px",
              borderRadius: "12px",
              width: "100%",
              maxWidth: isLargeScreen ? "500px" : "354px",
              margin: "0 auto 20px auto",
            }}
          >
            <input
              type="text"
              value={apartmentName}
              onChange={(e) => setApartmentName(e.target.value)}
              placeholder="Apartment Name *"
              style={commonInputStyle}
            />
            <input
              type="text"
              value={towerBlock}
              onChange={(e) => setTowerBlock(e.target.value)}
              placeholder="Tower/Block name *"
              style={commonInputStyle}
            />
            <div
              className="d-flex"
              style={{
                width: "100%",
                gap: "12px",
              }}
            >
              <input
                type="text"
                value={flat}
                onChange={(e) => setFlat(e.target.value)}
                placeholder="Flat *"
                style={commonInputStyle}
              />
              <input
                type="text"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                placeholder="Floor"
                style={commonInputStyle}
              />
            </div>
          </div>
        );

      case "School":
        return (
          <div
            className="d-flex flex-column align-items-start mt-2"
            style={{
              gap: "12px",
              borderRadius: "12px",
              width: "100%",
              maxWidth: isLargeScreen ? "500px" : "354px",
              margin: "0 auto 20px auto",
            }}
          >
            <div className="d-flex gap-2 align-items-start">
              <img
                src={spilt}
                alt=""
                style={{ width: "20px", height: "20px", marginTop: "2px" }}
              />
              <p
                className="mb-0"
                style={{
                  color: "#2c2c2c",
                  fontSize: "14px",
                  fontFamily: "Inter",
                  fontWeight: "500",
                }}
              >
                Later you can split the order
              </p>
            </div>

            <div className="d-flex gap-2 align-items-start">
              <img
                src={secure}
                alt=""
                style={{ width: "12px", height: "12px", marginTop: "2px" }}
              />
              <p
                className="mb-0"
                style={{
                  color: "#2c2c2c",
                  fontSize: "10px",
                  fontFamily: "Inter",
                  fontWeight: "500",
                }}
              >
                Safe & Private: details are only used to deliver correctly.
              </p>
            </div>

            <input
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="School Name *"
              style={commonInputStyle}
            />

            <input
              type="text"
              placeholder="Student's full name *"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              style={commonInputStyle}
            />

            <div
              className="d-flex justify-content-between"
              style={{
                width: "100%",
                gap: "12px",
              }}
            >
              <input
                type="text"
                placeholder="Class *"
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
                style={commonInputStyle}
              />
              <input
                type="text"
                placeholder="Section *"
                value={studentSection}
                onChange={(e) => setStudentSection(e.target.value)}
                style={commonInputStyle}
              />
            </div>
          </div>
        );

      case "Work":
        return (
          <div
            className="d-flex flex-column align-items-start mt-2"
            style={{
              gap: "12px",
              borderRadius: "12px",
              width: "100%",
              maxWidth: isLargeScreen ? "500px" : "354px",
              margin: "0 auto 20px auto",
            }}
          >
            <input
              type="text"
              value={houseName}
              onChange={(e) => setHouseName(e.target.value)}
              placeholder="House / Flat / Block No. *"
              style={commonInputStyle}
            />
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Company Name *"
              style={commonInputStyle}
            />
            <input
              type="text"
              value={floorNo}
              onChange={(e) => setFloorNo(e.target.value)}
              placeholder="Floor no *"
              style={{ ...commonInputStyle, marginBottom: "0" }}
            />
          </div>
        );

      default:
        return null;
    }
  };

  const getPrimaryName = useCallback((address) => {
    if (!address) return "";

    switch (address.addressType) {
      case "Home":
        return address.homeName || "";
      case "PG":
        return address.apartmentName || "";
      case "School":
        return address.schoolName || "";
      case "Work":
        return address.companyName || "";
      default:
        return address.houseName || "";
    }
  }, []);

  const getAddressIcon = useCallback((type) => {
    switch (type) {
      case "Home":
        return "🏠";
      case "PG":
        return "🏢";
      case "School":
        return "🎓";
      case "Work":
        return "💼";
      default:
        return "📍";
    }
  }, []);

  const isPrimaryAddress = useCallback(
    (addressId) => primaryAddressId === addressId,
    [primaryAddressId]
  );

  const getPrimaryAddress = useCallback(
    () => savedAddresses.find((addr) => addr._id === primaryAddressId),
    [savedAddresses, primaryAddressId]
  );

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (fetchAbortControllerRef.current) {
        fetchAbortControllerRef.current.abort();
      }
    };
  }, []);

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 1050,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          maxWidth: "605px",
          maxHeight: "100vh",
          backgroundColor: "white",
          borderRadius: "16px",
          border: "none",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {loading && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 20,
            }}
          >
            <div
              className="spinner-border"
              role="status"
              style={{
                width: "2.5rem",
                height: "2.5rem",
                color: "#6B8E23",
              }}
            >
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div
          style={{
            padding: "20px",
            borderBottom: "1px solid #f0f0f0",
            flexShrink: 0,
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5
              style={{
                margin: 0,
                color: "#2c2c2c",
                fontFamily: "Inter",
                fontWeight: "600",
              }}
            >
              Search for your delivery location
            </h5>
            <button
              type="button"
              onClick={onClose}
              style={{
                fontSize: "20px",
                border: "none",
                background: "none",
                cursor: "pointer",
                color: "#555",
                lineHeight: "1",
              }}
            >
              &times;
            </button>
          </div>
          <p
            style={{
              margin: 0,
              color: "#666",
              fontSize: "14px",
              fontFamily: "Inter",
            }}
          >
            Pin your exact location for seamless delivery
          </p>
        </div>

        <div
          style={{
            flex: 1,
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Search Input */}
          {/* <div
            style={{
              padding: "20px",
              position: "relative",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                border: "1px solid #e0e0e0",
                zIndex: 1000,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 16px",
                  gap: "8px",
                }}
              >
                <FaSearch size={18} color="#666" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setShowSearch(true)}
                  placeholder="Search for area, street, landmark..."
                  style={{
                    flex: 1,
                    border: "none",
                    outline: "none",
                    fontSize: "16px",
                    padding: "8px 0",
                    backgroundColor: "transparent",
                    fontFamily: "Inter",
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSearchSuggestions([]);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      fontSize: "18px",
                      color: "#666",
                      cursor: "pointer",
                      padding: "4px",
                    }}
                  >
                    ×
                  </button>
                )}
              </div>

              {showSearch && searchSuggestions.length > 0 && (
                <div
                  style={{
                    borderTop: "1px solid #e0e0e0",
                    maxHeight: "200px",
                    overflowY: "auto",
                  }}
                >
                  {searchSuggestions.map((place, index) => (
                    <div
                      key={place.place_id}
                      onClick={() => handleLocationSelect(place)}
                      style={{
                        padding: "12px 16px",
                        borderBottom:
                          index < searchSuggestions.length - 1
                            ? "1px solid #f0f0f0"
                            : "none",
                        cursor: "pointer",
                        transition: "background-color 0.2s",
                        fontSize: "14px",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "#f8f9fa";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "white";
                      }}
                    >
                      <div style={{ fontWeight: "500", color: "#333" }}>
                        {place.structured_formatting.main_text}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#666",
                          marginTop: "2px",
                        }}
                      >
                        {place.structured_formatting.secondary_text}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div> */}

          {/* Use Current Location Button */}
          <div
            style={{
              padding: "0 20px 20px 20px",
              flexShrink: 0,
            }}
          >
            <button
              onClick={handleUseCurrentLocation}
              disabled={actionLoading === "current-location"}
              style={{
                width: "100%",
                padding: "12px 16px",
                backgroundColor: "#6B8E23",
                border: "1px solid #6B8E23",
                borderRadius: "12px",
                color: "#fff",
                fontSize: "14px",
                fontWeight: "500",
                cursor:
                  actionLoading === "current-location"
                    ? "not-allowed"
                    : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                fontFamily: "Inter",
                transition: "all 0.2s ease",
                opacity: actionLoading === "current-location" ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!actionLoading) {
                  e.target.style.backgroundColor = "#5a7a1c";
                }
              }}
              onMouseLeave={(e) => {
                if (!actionLoading) {
                  e.target.style.backgroundColor = "#6B8E23";
                }
              }}
            >
              {actionLoading === "current-location" ? (
                <>
                  <div
                    className="spinner-border spinner-border-sm"
                    role="status"
                  >
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  Getting location...
                </>
              ) : (
                <>
                  <FaCrosshairs size={16} />
                  Use current location
                  {primaryAddressId && " (Clear primary)"}
                </>
              )}
            </button>
          </div>

          {/* Current Location Display */}
          {currentLocation && currentLocation.address && (
            <div
              style={{
                padding: "0 20px 10px 20px",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  padding: "12px",
                  backgroundColor: "#f0f9f0",
                  border: "1px solid #6B8E23",
                  borderRadius: "8px",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    marginBottom: "4px",
                    fontFamily: "Inter",
                  }}
                >
                  Current Location:
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#2c2c2c",
                    fontWeight: "500",
                    fontFamily: "Inter",
                  }}
                >
                  {currentLocation.address}
                </div>
              </div>
            </div>
          )}

          {/* Saved Addresses Section */}
          <div
            style={{
              padding: "0 20px 20px 20px",
              flexShrink: 0,
              opacity: loading ? 0.5 : 1,
              transition: "opacity 0.3s",
            }}
          >
            <div ref={dropdownRef} style={{ position: "relative" }}>
              <button
                onClick={() => setShowAddressDropdown(!showAddressDropdown)}
                disabled={loading}
                style={{
                  width: "100%",
                  backgroundColor: "white",
                  border: "1px solid #e0e0e0",
                  borderRadius: "12px",
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: loading ? "default" : "pointer",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#333",
                  fontFamily: "Inter",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <FaMapMarkerAlt color="#6B8E23" />
                  <span>
                    {loading
                      ? "Loading addresses..."
                      : savedAddresses.length > 0
                      ? `${savedAddresses.length} Saved Addresses`
                      : "No Saved Addresses"}
                  </span>
                </div>
                <FaChevronDown
                  style={{
                    transform: showAddressDropdown
                      ? "rotate(180deg)"
                      : "rotate(0)",
                    transition: "transform 0.2s",
                  }}
                />
              </button>

              {showAddressDropdown && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    backgroundColor: "white",
                    borderRadius: "0 0 12px 12px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                    border: "1px solid #e0e0e0",
                    borderTop: "none",
                    maxHeight: "300px",
                    overflowY: "auto",
                    zIndex: 2000,
                  }}
                >
                  {savedAddresses.length > 0 ? (
                    <div>
                      {savedAddresses.map((address, index) => (
                        <div
                          key={address._id}
                          style={{
                            padding: "12px 16px",
                            borderBottom:
                              index < savedAddresses.length - 1
                                ? "1px solid #f0f0f0"
                                : "none",
                            cursor: "pointer",
                            transition: "background-color 0.2s",
                            backgroundColor:
                              primaryAddressId === address._id
                                ? "#f8fff8"
                                : "white",
                          }}
                          onMouseEnter={(e) => {
                            if (primaryAddressId !== address._id) {
                              e.target.style.backgroundColor = "#f8f9fa";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (primaryAddressId !== address._id) {
                              e.target.style.backgroundColor = "white";
                            }
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "start",
                              gap: "8px",
                            }}
                          >
                            <span
                              style={{ fontSize: "16px", marginTop: "2px" }}
                            >
                              {getAddressIcon(address.addressType)}
                            </span>
                            <div style={{ flex: 1 }}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  marginBottom: "4px",
                                }}
                              >
                                <span
                                  style={{
                                    fontWeight: "600",
                                    fontSize: "14px",
                                    color: "#333",
                                    fontFamily: "Inter",
                                  }}
                                >
                                  {getPrimaryName(address)}
                                </span>
                                {primaryAddressId === address._id && (
                                  <span
                                    style={{
                                      fontSize: "10px",
                                      color: "#6B8E23",
                                      backgroundColor: "#f0f9f0",
                                      padding: "2px 6px",
                                      borderRadius: "4px",
                                      fontWeight: "500",
                                    }}
                                  >
                                    PRIMARY
                                  </span>
                                )}
                              </div>
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: "#666",
                                  lineHeight: "1.4",
                                  fontFamily: "Inter",
                                  marginBottom: "8px",
                                }}
                              >
                                {address.fullAddress}
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  gap: "8px",
                                  flexWrap: "wrap",
                                }}
                              >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectSavedAddress(address);
                                  }}
                                  style={{
                                    padding: "6px 12px",
                                    backgroundColor: "transparent",
                                    border: "1px solid #6B8E23",
                                    borderRadius: "6px",
                                    color: "#6B8E23",
                                    fontSize: "11px",
                                    fontWeight: "500",
                                    cursor: "pointer",
                                    fontFamily: "Inter",
                                    transition: "all 0.2s",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = "#f0f9f0";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.backgroundColor =
                                      "transparent";
                                  }}
                                >
                                  Edit
                                </button>
                                {isPrimaryAddress(address._id) ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removePrimaryAddress();
                                    }}
                                    style={{
                                      padding: "6px 12px",
                                      backgroundColor: "transparent",
                                      border: "1px solid #d9534f",
                                      borderRadius: "6px",
                                      color: "#d9534f",
                                      fontSize: "11px",
                                      fontWeight: "500",
                                      cursor: "pointer",
                                      fontFamily: "Inter",
                                      transition: "all 0.2s",
                                    }}
                                    onMouseEnter={(e) => {
                                      e.target.style.backgroundColor =
                                        "#f8d7da";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.target.style.backgroundColor =
                                        "transparent";
                                    }}
                                  >
                                    <FaTimesCircle
                                      size={10}
                                      style={{ marginRight: "4px" }}
                                    />
                                    Remove Primary
                                  </button>
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeliverHere(address);
                                    }}
                                    disabled={actionLoading === address._id}
                                    style={{
                                      padding: "6px 12px",
                                      backgroundColor: "transparent",
                                      border: "1px solid #6B8E23",
                                      borderRadius: "6px",
                                      color: "#6B8E23",
                                      fontSize: "11px",
                                      fontWeight: "500",
                                      cursor:
                                        actionLoading === address._id
                                          ? "not-allowed"
                                          : "pointer",
                                      fontFamily: "Inter",
                                      transition: "all 0.2s",
                                      opacity:
                                        actionLoading === address._id ? 0.7 : 1,
                                    }}
                                    onMouseEnter={(e) => {
                                      e.target.style.backgroundColor =
                                        "#f0f9f0";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.target.style.backgroundColor =
                                        "transparent";
                                    }}
                                  >
                                    {actionLoading === address._id ? (
                                      <div
                                        className="spinner-border spinner-border-sm"
                                        role="status"
                                        style={{
                                          width: "12px",
                                          height: "12px",
                                        }}
                                      >
                                        <span className="visually-hidden">
                                          Loading...
                                        </span>
                                      </div>
                                    ) : (
                                      "Set Primary"
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: "20px",
                        textAlign: "center",
                        color: "#666",
                        fontSize: "14px",
                        fontFamily: "Inter",
                      }}
                    >
                      No saved addresses yet. Add your first address!
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Add New Address Button - Always visible below saved addresses */}
            {/* <button
              onClick={handleAddNewAddress}
              style={{
                width: "100%",
                padding: "12px 16px",
                backgroundColor: "#6B8E23",
                color: "white",
                border: "none",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
                fontFamily: "Inter",
                transition: "background-color 0.2s",
                marginTop: "8px",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#5a7a1c";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "#6B8E23";
              }}
            >
              <FaPlus size={14} />
              Add New Address
            </button> */}

            {primaryAddressId && !showAddressDropdown && (
              <div
                style={{
                  marginTop: "12px",
                  padding: "12px",
                  backgroundColor: "#f8fff8",
                  border: "1px solid #6B8E23",
                  borderRadius: "8px",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    marginBottom: "4px",
                    fontFamily: "Inter",
                  }}
                >
                  Current Primary Address:
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#2c2c2c",
                    fontWeight: "600",
                    fontFamily: "Inter",
                  }}
                >
                  {getPrimaryName(getPrimaryAddress())}
                </div>
              </div>
            )}
          </div>

          {/* Add Address Form Section - Only show if no primary address */}
          {!primaryAddress && (
            <div
              style={{
                padding: "20px",
                borderTop: "1px solid #f0f0f0",
                flexShrink: 0,
              }}
            >
              <h6
                style={{
                  color: "#2c2c2c",
                  fontFamily: "Inter",
                  fontWeight: "600",
                  marginBottom: "16px",
                  fontSize: "16px",
                }}
              >
                Add Address
              </h6>

              {error && (
                <div
                  style={{
                    color: "#d9534f",
                    fontSize: "14px",
                    marginBottom: "16px",
                    padding: "8px 12px",
                    backgroundColor: "#f8d7da",
                    border: "1px solid #f5c6cb",
                    borderRadius: "4px",
                  }}
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSaveAddress}>
                {/* Address Details Section */}
                {/* Address Details Section */}
                <div style={{ marginBottom: "20px" }}>
                  {addressType ? (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#2c2c2c",
                      }}
                    >
                      <img src={locationpng} alt="" />
                      {currentLocation?.fullAddress || "Select location"}
                      {/* {currentLocation?.location?.coordinates && (
        <div style={{ fontSize: "10px", color: "#666", marginTop: "4px" }}>
          Coordinates: Lat: {currentLocation.location.coordinates[1]?.toFixed(6)}, Lng: {currentLocation.location.coordinates[0]?.toFixed(6)}
        </div>
      )} */}
                    </div>
                  ) : (
                    <div
                      style={{
                        fontSize: "12px",
                      }}
                    >
                      <img src={locationpng} alt="" />
                      <span
                        style={{
                          fontFamily: "Inter",
                          fontSize: "14px",
                          fontWeight: "500",
                          color: "#2c2c2c",
                        }}
                      >
                        Select Delivery Address Type
                      </span>
                    </div>
                  )}
                </div>

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
                        onClick={() => setAddressType(type.key)}
                        style={{
                          width: isLargeScreen ? "auto" : "75px",
                          height: isLargeScreen ? "55px" : "43px",
                          padding: "8px",
                          borderRadius: "12px",
                          border:
                            addressType === type.key
                              ? "1.2px solid #F5DEB3"
                              : "1.2px solid #F5DEB3",
                          backgroundColor:
                            addressType === type.key ? "#6B8E23" : "#FFF8DC",
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
                          src={
                            addressType === type.key ? type.icon2 : type.icon
                          }
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
                            color: addressType === type.key ? "#fff" : "#000",
                          }}
                        >
                          {type.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Type Specific Fields */}
                {renderTypeSpecificFields()}

                {/* Footer Buttons */}
                {addressType && (
                  <div
                    className="d-flex flex-wrap justify-content-center align-items-center mt-4 gap-3"
                    style={{
                      width: "100%",
                      margin: "0 auto",
                    }}
                  >
                    {/* Cancel Button */}
                    <button
                      type="button"
                      className="btn"
                      onClick={handleCancel}
                      style={{
                        backgroundColor: "transparent",
                        border: "1px solid #d5c5b0",
                        borderRadius: "12px",
                        width: isLargeScreen ? "160px" : "120px",
                        height: "45px",
                        fontWeight: "600",
                        textAlign: "center",
                        fontSize: isLargeScreen ? "16px" : "14px",
                        padding: "0 10px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      Cancel
                      <img
                        src={cross}
                        alt=""
                        style={{ width: "14px", height: "14px" }}
                      />
                    </button>

                    {/* Save Button */}
                    <button
                      type="submit"
                      className="btn d-flex justify-content-center align-items-center"
                      disabled={!isFormValid() || loading}
                      style={{
                        backgroundColor:
                          isFormValid() && !loading ? "#E6B800" : "#C0C0C0",
                        borderRadius: "12px",
                        border: "1px solid #c0c0c0",
                        width: isLargeScreen ? "200px" : "160px",
                        height: "45px",
                        fontWeight: "600",
                        color: "black",
                        cursor:
                          isFormValid() && !loading ? "pointer" : "not-allowed",
                        fontSize: isLargeScreen ? "16px" : "14px",
                        padding: "0 12px",
                        gap: "6px",
                      }}
                    >
                      {loading ? "Saving..." : "Save Address"}
                      {!loading && (
                        <CircleCheck
                          style={{
                            width: "16px",
                            height: "16px",
                            marginTop: "1px",
                          }}
                        />
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}
        </div>

        {actionLoading === "search" && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              zIndex: 10,
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              className="spinner-border"
              role="status"
              style={{
                width: "3rem",
                height: "3rem",
                color: "#6B8E23",
              }}
            >
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationModal;
