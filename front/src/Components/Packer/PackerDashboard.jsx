// import React, { useState, useEffect, useRef } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import {
//   FaPrint,
//   FaSignOutAlt,
//   FaArrowLeft,
//   FaArrowRight,
//   FaEye,
//   FaUser,
//   FaTable,
//   FaListAlt,
//   FaMapMarkerAlt,
//   FaTruck,
//   FaExclamationTriangle,
// } from "react-icons/fa";
// import Swal from "sweetalert2";
// import axios from "axios";
// import "./PackerDashboard.css";
// import PackerClock from "./PackerClock";
// import io from "socket.io-client";
// import moment from "moment";
// import { BsSearch } from "react-icons/bs";

// const socket = io("http://localhost:7013/", {
//   reconnection: true, // Enable reconnection
//   reconnectionAttempts: 5, // Retry up to 5 times
//   reconnectionDelay: 1000, // Start with 1-second delay
//   reconnectionDelayMax: 5000, // Max delay of 5 seconds
//   timeout: 20000, // Connection timeout of 20 seconds
// });
// const DashboardPage = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const Admin = JSON.parse(localStorage.getItem("admin")); // Expect array of orders
//   const [selectedSlot, setSelectedSlot] = useState("");
//   const [selectedLocation, setSelectedLocation] = useState("");
//   const [selectedDriver, setSelectedDriver] = useState("");
//   const [statusFilter, setStatusFilter] = useState("All");
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [currentOrderIndex, setCurrentOrderIndex] = useState(0);
//   const [slideDirection, setSlideDirection] = useState("");
//   const [orders, setOrders] = useState([]);
//   const [locations, setLocations] = useState([]);
//   const [drivers, setDrivers] = useState([]);
//   const touchStartX = useRef(null);
//   const Packer = JSON.parse(localStorage.getItem("packer"));
//   const [packerId] = useState(Packer?.packerId);
//   const [packerName] = useState(Packer?.username);
//   const [activeView, setActiveView] = useState("orders");
//   const [AllTimesSlote, setAllTimesSlote] = useState([]);
//   const [AllBags, setAllBags] = useState([]);
//   const [AllReason, setAllReason] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [loading, setLoading] = useState(false);

//   const checkLocation = (ele) => {
//     const locationpacker = Packer.locations || [];
//     // console.log("location",locationpacker,ele);

//     const findLocation = locationpacker.find(
//       (item) => item?.split(",")[0] == ele
//     );
//     if (findLocation) {
//       return true;
//     } else {
//       return false;
//     }
//   };
//   const [previousQuantities, setPreviousQuantities] = useState({});
//   const [OldOrder, setOldOrder] = useState([]);
//   const [lastReload, setLastReload] = useState(null);

//   const oldOders = async () => {
//     if (!Packer && !Admin) return;
//     setLoading(true);
//     try {
//       const orderResponse = await axios.get(
//         "http://localhost:7013/api/admin/getPackerOrders",
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("packer-token")}`,
//           },
//         }
//       );

//       if (orderResponse.status === 200) {
//         const allorder = Admin
//           ? orderResponse.data
//           : orderResponse.data?.filter((ele) =>
//               checkLocation(ele?.delivarylocation)
//             );

//         console.log("allorder", allorder);

//         const fetchedOrders = allorder?.map((order) => ({
//           ...order,
//           id: order.orderid || order._id,
//           timeLeft: order.timeLeft || "15 Mins",
//           items: order.allProduct.map((item) => ({
//             ...item,
//             foodItemId: item?.foodItemId?._id,
//             name: item?.foodItemId?.foodname,
//             unit: item?.foodItemId?.unit,
//             qty: item.quantity,
//             packed: item.packed,
//             missing: item.missing,
//           })),
//         }));

//         // Store current quantities as previous before updating
//         setOldOrder((prevOrders) => {
//           // Calculate previous quantities from current state
//           const currentQuantities = {};
//           prevOrders.forEach((order) => {
//             order.items.forEach((item) => {
//               if (currentQuantities[item.name]) {
//                 currentQuantities[item.name].ordered += item.qty || 0;
//                 currentQuantities[item.name].packed +=
//                   item.packed && !item.missing ? item.qty : 0;
//                 currentQuantities[item.name].unit = item.unit; // Fixed: assign to .unit property
//               } else {
//                 currentQuantities[item.name] = {
//                   ordered: item.qty || 0,
//                   packed: item.packed && !item.missing ? item.qty : 0,
//                   unit: item.unit,
//                 };
//               }
//             });
//           });
//           setPreviousQuantities(currentQuantities);

//           // Create a map of existing orders by ID for faster lookup
//           const existingOrdersMap = new Map();
//           prevOrders.forEach((order, index) => {
//             existingOrdersMap.set(order.id, { order, index });
//           });

//           // Start with a copy of previous orders
//           const mergedOrders = [...prevOrders];

//           fetchedOrders.forEach((newOrder) => {
//             const existingOrderData = existingOrdersMap.get(newOrder.id);

//             if (existingOrderData) {
//               // Order exists - REPLACE the entire order instead of merging quantities
//               mergedOrders[existingOrderData.index] = newOrder;
//             } else {
//               // New order - add it
//               mergedOrders.push(newOrder);
//             }
//           });

//           return mergedOrders;
//         });

//         setLastReload(new Date().toLocaleString());
//         setLoading(false);
//       }
//     } catch (error) {
//       console.log(error);
//       setLoading(false);
//     }
//   };

//   const fetchData = async (order) => {
//     try {
//       if (!Packer && !Admin) return;
//       setLoading(true);
//       // Fetch orders
//       if (order) {
//         if (checkLocation(order?.delivarylocation)) {
//           Swal.fire({
//             toast: true,
//             position: "bottom",
//             icon: "success",
//             title: `Successfully geting new order!`,
//             showConfirmButton: false,
//             timer: 3000,
//             timerProgressBar: true,
//             customClass: {
//               popup: "me-small-toast",
//               title: "me-small-toast-title",
//             },
//           });
//         }
//       }
//       const orderResponse = await axios.get(
//         "http://localhost:7013/api/admin/getPackerOrders",
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("packer-token")}`,
//           },
//         }
//       );
//       const allorder = Admin
//         ? orderResponse.data
//         : orderResponse.data?.filter((ele) =>
//             checkLocation(ele?.delivarylocation)
//           );
//       setAllTimesSlote([...new Set(allorder?.map((ele) => ele?.slot))]);
//       const fetchedOrders = allorder?.map((order) => ({
//         ...order,
//         id: order.orderid || order._id,
//         timeLeft: order.timeLeft || "15 Mins", // Fallback to default
//         items: order.allProduct.map((item) => ({
//           ...item,
//           foodItemId: item?.foodItemId?._id,
//           name: item?.foodItemId?.foodname,
//           unit: item?.foodItemId?.unit,
//           qty: item.quantity,
//           packed: item.packed,
//           missing: item.missing, // Include missing status
//         })),
//       }));

//       setOrders(fetchedOrders);

//       // Fetch locations

//       // Fetch drivers
//       setLocations([...new Set(allorder.map((ele) => ele?.delivarylocation))]);
//       // const driverResponse = await axios.get('http://localhost:7013/api/admin/getDrivers');
//       // setDrivers(driverResponse.data);
//       setLoading(false);
//     } catch (error) {
//       setLoading(false);
//       Swal.fire({
//         title: "Orders Info",
//         text: "No orders found for today.",
//         icon: "info",
//         showConfirmButton: false,
//         timer: 3000,
//         timerProgressBar: true,
//         toast: true,
//         position: "bottom",
//         customClass: {
//           popup: "me-small-toast",
//           title: "me-small-toast-title",
//         },
//       });
//     }
//   };

//   const getBegs = async () => {
//     try {
//       let res = await axios.get("http://localhost:7013/api/admin/getbags");
//       if (res.status == 200) {
//         setAllBags(res.data.bags);
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const getAllReason = async () => {
//     try {
//       let res = await axios.get(
//         "http://localhost:7013/api/admin/getdelayreasons"
//       );
//       if (res.status == 200) {
//         setAllReason(
//           res.data.reasons?.filter((ele) => ele.reasonType === "delay")
//         );
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const getStorageKey = (type) => {
//     const today = new Date().toISOString().split("T")[0];
//     return `${type}_${today}`;
//   };

//   const loadFromStorage = () => {
//     try {
//       const quantityKey = getStorageKey("quantityStats");
//       const previousKey = getStorageKey("previousQuantities");
//       const ordersKey = getStorageKey("orders");
//       const reloadKey = getStorageKey("lastReload");

//       const savedQuantity = localStorage.getItem(quantityKey);
//       const savedPrevious = localStorage.getItem(previousKey);
//       const savedOrders = localStorage.getItem(ordersKey);
//       const savedReload = localStorage.getItem(reloadKey);

//       if (savedQuantity) {
//         setQuantityStats(JSON.parse(savedQuantity));
//       }
//       if (savedPrevious) {
//         setPreviousQuantities(JSON.parse(savedPrevious));
//       }
//       if (savedOrders) {
//         setOldOrder(JSON.parse(savedOrders));
//       }
//       if (savedReload) {
//         setLastReload(savedReload);
//       }
//     } catch (error) {
//       console.error("Error loading from storage:", error);
//     }
//   };

//   // Save data to localStorage
//   const saveToStorage = (quantity, previous, orders) => {
//     try {
//       const quantityKey = getStorageKey("quantityStats");
//       const previousKey = getStorageKey("previousQuantities");
//       const ordersKey = getStorageKey("orders");
//       const reloadKey = getStorageKey("lastReload");

//       const timestamp = new Date().toLocaleString();

//       localStorage.setItem(quantityKey, JSON.stringify(quantity));
//       localStorage.setItem(previousKey, JSON.stringify(previous));
//       localStorage.setItem(ordersKey, JSON.stringify(orders));
//       localStorage.setItem(reloadKey, timestamp);

//       setLastReload(timestamp);
//     } catch (error) {
//       console.error("Error saving to storage:", error);
//     }
//   };

//   // Fetch orders, locations, and drivers
//   useEffect(() => {
//     socket.on("newOrder", (order) => {
//       fetchData(order);
//     });
//     oldOders();
//     getBegs();
//     getAllReason();
//     fetchData();
//     return () => {
//       socket.off("newOrder");
//     };
//   }, []);

//   function timeToDate(timeStr, baseDate) {
//     if (!timeStr) return null;
//     const [time, modifier] = timeStr?.trim()?.split(" ");
//     let [hours, minutes] = time.split(":").map(Number);
//     if (modifier === "PM" && hours !== 12) hours += 12;
//     if (modifier === "AM" && hours === 12) hours = 0;
//     const date = new Date(baseDate);
//     date.setHours(hours, minutes, 0, 0);
//     return date;
//   }

//   const [timeLeft, setTimeLeft] = useState([]);

//   const handleLogout = () => {
//     const check = orders.find(
//       (ele, i) =>
//         ele.packBefore !== "Yes" && timeLeft[i] == "Delay" && !ele.reason
//     );
//     if (check) {
//       Swal.fire({
//         title: "Session Waiting",
//         text: "You can not able to logout please give update order with reason.",
//         icon: "info",

//         showConfirmButton: false,
//         timer: 3000,
//         timerProgressBar: true,
//         toast: true,
//         position: "bottom",
//         customClass: {
//           popup: "me-small-toast",
//           title: "me-small-toast-title",
//         },
//       });
//       return;
//     } else {
//       localStorage.clear();
//       Swal.fire({
//         title: "Session Submitted",
//         text: "You have been logged out successfully.",
//         icon: "success",
//         confirmButtonColor: "#F81E0F",
//         timer: 2000,
//         timerProgressBar: true,
//       }).then(() => navigate("/packer-login"));
//     }
//   };
//   const [timeShow, setTimeSHow] = useState("");
//   const handleSlotChange = (slot) => {
//     setSelectedSlot(slot);
//     Swal.fire({
//       title: "Slot Selected",
//       text: `Showing orders for ${slot || "All Slots"}.`,
//       icon: "info",
//       showConfirmButton: false,
//       timer: 3000,
//       timerProgressBar: true,
//       toast: true,
//       position: "bottom",
//       customClass: {
//         popup: "me-small-toast",
//         title: "me-small-toast-title",
//       },
//     });
//   };

//   const handleLocationChange = (location) => {
//     setSelectedLocation(location);
//     Swal.fire({
//       title: "Location Selected",
//       text: `Showing orders for ${location || "All Locations"}.`,
//       icon: "info",
//       showConfirmButton: false,
//       timer: 3000,
//       timerProgressBar: true,
//       toast: true,
//       position: "bottom",
//       customClass: {
//         popup: "me-small-toast",
//         title: "me-small-toast-title",
//       },
//     });
//   };

//   const handleDriverChange = (driver) => {
//     setSelectedDriver(driver);
//     Swal.fire({
//       title: "Driver Selected",
//       text: `Showing orders for ${driver || "All Drivers"}.`,
//       icon: "info",
//       showConfirmButton: false,
//       timer: 3000,
//       timerProgressBar: true,
//       toast: true,
//       position: "bottom",
//       customClass: {
//         popup: "me-small-toast",
//         title: "me-small-toast-title",
//       },
//     });
//   };

//   const loadOrders = () => {
//     setLoading(true);

//     try {
//       // Store current quantities as previous before updating
//       const currentQuantities = {};
//       OldOrder.forEach((order) => {
//         order.items.forEach((item) => {
//           if (currentQuantities[item.name]) {
//             currentQuantities[item.name].ordered += item.qty || 0;
//             currentQuantities[item.name].packed +=
//               item.packed && !item.missing ? item.qty : 0;
//             currentQuantities[item.name].unit = item.unit;
//           } else {
//             currentQuantities[item.name] = {
//               ordered: item.qty || 0,
//               packed: item.packed && !item.missing ? item.qty : 0,
//               unit: item.unit,
//             };
//           }
//         });
//       });

//       // Update previous quantities
//       setPreviousQuantities(currentQuantities);

//       // Set new orders (in real app, this would come from API)
//       const newOrders = OldOrder.map((order) => ({
//         ...order,
//         id: order.orderid,
//         items: order.items || [],
//       }));

//       setOldOrder(newOrders);

//       // Calculate new quantity stats
//       const newStats = getQuantityStats({
//         selectedSlot,
//         selectedLocations,
//         selectedDriver,
//         statusFilter,
//         searchTerm,
//       });

//       setQuantityStats(newStats);

//       // Save to localStorage
//       saveToStorage(newStats, currentQuantities, newOrders);
//     } catch (error) {
//       console.error("Error loading orders:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleStatusFilter = (status) => {
//     setStatusFilter(status);
//     Swal.fire({
//       title: "Filter Applied",
//       text: `Showing ${status} orders.`,
//       icon: "info",
//       showConfirmButton: false,
//       timer: 3000,
//       timerProgressBar: true,
//       toast: true,
//       position: "bottom",
//       customClass: {
//         popup: "me-small-toast",
//         title: "me-small-toast-title",
//       },
//     });
//   };

//   const handlePrintAll = () => {
//     // Swal.fire({
//     //   title: 'Printing Orders',
//     //   text: 'All orders for the selected slot are being sent to the printer.',
//     //   icon: 'info',
//     //   confirmButtonColor: '#F81E0F',
//     //   timer: 2000,
//     //   timerProgressBar: true,
//     // })
//     navigate("/packer-thermal-print", { state: { items: filteredOrders } });
//   };

//   const handleOrderClick = (order, index, time) => {
//     setSelectedOrder({
//       ...order,
//       packer: packerId,
//       packername: packerName,
//       _id: order?._id,
//     });
//     setCurrentOrderIndex(index);
//     setTimeSHow(time);
//     setSlideDirection("");
//     updateOrder(order.id, { packer: packerId, _id: order?._id });
//   };

//   const handleViewProducts = (order, time, handleItemCheck) => {
//     // Validate order and order.items
//     if (!order || !order.items) {
//       Swal.fire({
//         title: "Error",
//         text: "Invalid order data",
//         icon: "error",
//         confirmButtonColor: "#F81E0F",
//       });
//       return;
//     }

//     Swal.fire({
//       title: `Order ${order.id} - Products`,
//       html: `
//             <div style="
//                 font-family: 'Arial', sans-serif;
//                 max-width: 100%;
//                 padding: 20px;
//                 background: #f9f9f9;
//                 border-radius: 10px;
//                 box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
//             ">
//                 <div style="
//                     display: flex;
//                     justify-content: space-between;
//                     align-items: center;
//                     margin-bottom: 20px;
//                     flex-wrap: wrap;
//                     gap: 10px;
//                 ">
//                     <h5 style="
//                         font-size: 18px;
//                         color: #333;
//                         margin: 0;
//                     ">Pack Time: ${
//                       order?.packeTime ? order?.packBefore : timeLeft[time]
//                     }</h5>
//                     <h5 style="
//                         font-size: 18px;
//                         color: #333;
//                         margin: 0;
//                     ">Bag No: ${order?.bagNo || "Not Assigned"}</h5>
//                     <p style="
//                         font-size: 16px;
//                         color: #555;
//                         margin: 0;
//                     ">Status: ${order.status}</p>
//                      <h5 style="
//                         font-size: 18px;
//                         color: #333;
//                         margin: 0;
//                     ">Cutlery: ${order?.Cutlery > 0 ? "Yes" : "No"}</h5>
//                 </div>

//                 <table style="
//                     width: 100%;
//                     border-collapse: collapse;
//                     background: #fff;
//                     border-radius: 8px;
//                     overflow: hidden;
//                     box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
//                 ">
//                     <thead style="
//                         background: #F81E0F;
//                         color: #fff;
//                         font-weight: 600;
//                         text-align: left;
//                     ">
//                         <tr>
//                             <th style="
//                                 padding: 12px 15px;
//                                 font-size: 16px;
//                             ">Item</th>
//                             <th style="
//                                 padding: 12px 15px;
//                                 font-size: 16px;
//                             ">Quantity</th>
//                             <th style="
//                                 padding: 12px 15px;
//                                 font-size: 16px;
//                             ">Packed</th>
//                             <th style="
//                                 padding: 12px 15px;
//                                 font-size: 16px;
//                             ">Missing</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         ${order.items
//                           .map(
//                             (item, index) => `
//                                     <tr style="
//                                         background: ${
//                                           index % 2 === 0 ? "#f8f8f8" : "#fff"
//                                         };
//                                         transition: background 0.2s;
//                                     ">
//                                         <td style="
//                                             padding: 12px 15px;
//                                             font-size: 15px;
//                                             color: #333;
//                                             border-bottom: 1px solid #eee;
//                                         ">${item.name || "Unknown"}  <br/>
//                                         <span style=" font-size: 10px;"> ${
//                                           item.unit
//                                         } </span>
//                                          </td>
//                                         <td style="
//                                             padding: 12px 15px;
//                                             font-size: 15px;
//                                             color: #333;
//                                             border-bottom: 1px solid #eee;
//                                         ">${item.qty || 0}</td>
//                                         <td style="
//                                             padding: 12px 15px;
//                                             font-size: 15px;
//                                             color: #333;
//                                             border-bottom: 1px solid #eee;
//                                             cursor: pointer;
//                                             text-align: center;
//                                             transition: background 0.2s;
//                                         " data-index="${index}" data-packed="${
//                               item.packed
//                             }">
//                                             ${item.packed ? "✅" : "⬜"}
//                                         </td>
//                                         <td style="
//                                             padding: 12px 15px;
//                                             font-size: 15px;
//                                             color: #333;
//                                             border-bottom: 1px solid #eee;
//                                             text-align: center;
//                                         ">${item.missing ? "⚠️" : "—"}</td>
//                                     </tr>
//                                 `
//                           )
//                           .join("")}
//                     </tbody>
//                 </table>
//             </div>
//         `,
//       confirmButtonColor: "#F81E0F",
//       width: "90%",
//       didOpen: () => {
//         const packedCells = document.querySelectorAll("td[data-index]");
//         packedCells.forEach((cell) => {
//           cell.addEventListener("click", () => {
//             const index = parseInt(cell.getAttribute("data-index"));
//             const packed = cell.getAttribute("data-packed") === "true";
//             if (Admin) return;
//             handleItemCheck(index, !packed, order, time);
//           });
//         });
//       },
//     });
//   };

//   const [viewOrder, setViewOrder] = useState({});
//   const updateOrder = async (orderId, updatedData) => {
//     setLoading(true);
//     try {
//       const response = await axios.put(
//         `http://localhost:7013/api/admin/updatePackerOrder`,
//         updatedData,
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("packer-token")}`,
//           },
//         }
//       );

//       fetchData();
//       if (response.status == 200) {
//         const order1 = response.data?.order;
//         console.log("order11", order1);

//         const items = order1.allProduct?.map((item) => ({
//           ...item,
//           foodItemId: item?.foodItemId,
//           name: item?.name,
//           qty: item.quantity,
//           packed: item.packed,
//           missing: item.missing,
//         }));

//         // console.log("fdfd",{...order1,items:items,id:order1?.orderid});

//         if (updatedData.view) {
//           handleViewProducts(
//             { ...order1, items: items, id: order1?.orderid },
//             updatedData.time,
//             handleItemCheck
//           );
//         }
//         setTimeout(() => {
//           setLoading(false);
//         }, 100);

//         return response.data?.order;
//       }
//     } catch (error) {
//       setTimeout(() => {
//         setLoading(false);
//       }, 1000);

//       Swal.fire({
//         title: "Error",
//         text: "Failed to update order.",
//         icon: "error",
//         showConfirmButton: false,
//         timer: 3000,
//         timerProgressBar: true,
//         toast: true,
//         position: "bottom",
//         customClass: {
//           popup: "me-small-toast",
//           title: "me-small-toast-title",
//         },
//       });
//     }
//   };

//   const handleOrderUpdate = async (orderId, updatedData, items, condition) => {
//     if (
//       updatedData.status &&
//       !updatedData.bagNo &&
//       !orders.find((o) => o.id === orderId).bagNo
//     ) {
//       Swal.fire({
//         title: "Bag Number Required",
//         text: "Please assign a bag number before updating the status.",
//         icon: "error",
//         showConfirmButton: false,
//         timer: 3000,
//         timerProgressBar: true,
//         toast: true,
//         position: "bottom",
//         customClass: {
//           popup: "me-small-toast",
//           title: "me-small-toast-title",
//         },
//       });
//       return;
//     }
//     const allProduct = items?.map((item) => ({
//       ...item,
//       packed: item.packed,
//       missing: item.missing,
//     }));
//     const response = await updateOrder(orderId, {
//       ...updatedData,
//       allProduct,
//       packer: packerId,
//       packername: packerName,
//       _id: updatedData?._id,
//     });
//     if (response) {
//       if (updatedData.status && !updatedData.view) {
//         Swal.fire({
//           title: "Order Updated",
//           text: `Order ${orderId} updated to ${updatedData.status}.`,
//           icon: "success",
//           showConfirmButton: false,
//           timer: 3000,
//           timerProgressBar: true,
//           toast: true,
//           position: "bottom",
//           customClass: {
//             popup: "me-small-toast",
//             title: "me-small-toast-title",
//           },
//         });
//       }
//       if (updatedData.bagNo && !updatedData.view) {
//         Swal.fire({
//           title: "Bag Assigned",
//           text: `Order ${orderId} assigned to Bag ${updatedData.bagNo}.`,
//           icon: "success",
//           showConfirmButton: false,
//           timer: 3000,
//           timerProgressBar: true,
//           toast: true,
//           position: "bottom",
//           customClass: {
//             popup: "me-small-toast",
//             title: "me-small-toast-title",
//           },
//         });
//       }
//       if (updatedData.driver && !updatedData.view) {
//         Swal.fire({
//           title: "Driver Assigned",
//           text: `Order ${orderId} assigned to Driver ${updatedData.driver}.`,
//           icon: "success",
//           showConfirmButton: false,
//           timer: 3000,
//           timerProgressBar: true,
//           toast: true,
//           position: "bottom",
//           customClass: {
//             popup: "me-small-toast",
//             title: "me-small-toast-title",
//           },
//         });
//       }
//       if (updatedData.reason && !updatedData.view) {
//         Swal.fire({
//           title: "Delay Reason Updated",
//           text: `Reason for delay updated for Order ${orderId}.`,
//           icon: "success",
//           showConfirmButton: false,
//           timer: 3000,
//           timerProgressBar: true,
//           toast: true,
//           position: "bottom",
//           customClass: {
//             popup: "me-small-toast",
//             title: "me-small-toast-title",
//           },
//         });
//       }
//     }
//   };

//   const handleMarkMissing = (index) => {
//     Swal.fire({
//       title: "Confirm Missing Item",
//       text: `Mark ${selectedOrder.items[index].name} as missing?`,
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#F81E0F",
//       cancelButtonColor: "#6c757d",
//     }).then((result) => {
//       if (result.isConfirmed) {
//         const updatedItems = [...selectedOrder.items];
//         updatedItems[index] = {
//           ...updatedItems[index],
//           missing: true,
//           packed: false,
//         }; // Unpack if marked missing
//         const updatedOrder = { ...selectedOrder, items: updatedItems };
//         setSelectedOrder(updatedOrder);
//         handleOrderUpdate(
//           selectedOrder.id,
//           { reason: "Food Missing", _id: selectedOrder?._id },
//           updatedItems
//         );
//       }
//     });
//   };

//   const handleTouchStart = (e, index, time) => {
//     touchStartX.current = e.touches[0].clientX;
//     setTimeSHow(time);
//   };
//   const [selectedLocations, setSelectedLocations] = useState([]);
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const dropdownRef = useRef(null);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setIsDropdownOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const handleLocationToggle = (location) => {
//     setSelectedLocations((prev) => {
//       if (prev.includes(location)) {
//         return prev.filter((loc) => loc !== location);
//       } else {
//         return [...prev, location];
//       }
//     });
//   };

//   // Handle select all/clear all
//   const handleSelectAll = () => {
//     if (selectedLocations.length === locations.length) {
//       setSelectedLocations([]);
//     } else {
//       setSelectedLocations([...locations]);
//     }
//   };

//   const filteredOrders = orders.filter((order) => {
//     const matchesSlot = selectedSlot ? order.slot === selectedSlot : true;
//     const matchesLocation =
//       selectedLocations.length > 0
//         ? selectedLocations.includes(order.delivarylocation)
//         : true;
//     const matchesDriver = selectedDriver
//       ? order.driver === selectedDriver
//       : true;
//     const matchesStatus =
//       statusFilter === "All" ? true : order.status === statusFilter;

//     // Search functionality - searches in multiple fields
//     const matchesSearch =
//       searchTerm === ""
//         ? true
//         : order.orderid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           order.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           order.delivarylocation
//             ?.toLowerCase()
//             .includes(searchTerm.toLowerCase()) ||
//           order.driver?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           order.items?.some((item) =>
//             item.name?.toLowerCase().includes(searchTerm.toLowerCase())
//           );

//     return (
//       matchesSlot &&
//       matchesLocation &&
//       matchesDriver &&
//       matchesStatus &&
//       matchesSearch
//     );
//   });

//   useEffect(() => {
//     if (filteredOrders.length == 0) return;
//     const interval = setInterval(() => {
//       const now = new Date();
//       const updated = filteredOrders.map((ele) => {
//         const createdDate = new Date(ele.createdAt);
//         const [startStr, endStr] = ele.slot.split(" - ");
//         const slotStart = timeToDate(startStr, createdDate);
//         const slotEnd = timeToDate(endStr, createdDate);

//         // If future date → just show packingtime
//         if (createdDate > now) {
//           return ele.timeLeft;
//         }

//         // If packed → freeze timer

//         // If before slot → countdown
//         if (now < slotStart) {
//           const diff = Math.floor((slotStart - now) / 1000);
//           const min = Math.floor(diff / 60);
//           const sec = diff % 60;
//           return `${min}m ${sec}s left`;
//         }

//         // If in progress
//         if (now >= slotStart && now <= slotEnd) {
//           return "In Progress";
//         }

//         // If slot is over
//         if (now > slotEnd) {
//           return "Delay";
//         }
//         return "-";
//       });

//       setTimeLeft(updated);
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [filteredOrders.length]);

//   const handleTouchEnd = (e, index, time) => {
//     const touchEndX = e.changedTouches[0].clientX;
//     const diffX = touchStartX.current - touchEndX;
//     if (Math.abs(diffX) > 50) {
//       if (diffX > 0) {
//         const nextIndex = index < filteredOrders.length - 1 ? index + 1 : 0;
//         setSelectedOrder({ ...filteredOrders[nextIndex], packer: packerId });
//         setCurrentOrderIndex(nextIndex);
//         setSlideDirection("slide-left");
//         setTimeSHow(time);
//       } else {
//         const prevIndex = index > 0 ? index - 1 : orders.length - 1;
//         setSelectedOrder({ ...filteredOrders[prevIndex], packer: packerId });
//         setCurrentOrderIndex(prevIndex);
//         setTimeSHow(time);
//         setSlideDirection("slide-right");
//       }
//     }
//   };
//   const [viewProduct, setViewPrduct] = useState({});
//   const getOrderStats = () => {
//     const filtered = orders.filter((o) => {
//       const matchesSlot = selectedSlot ? o.slot === selectedSlot : true;
//       const matchesLocation = selectedLocation
//         ? o.delivarylocation === selectedLocation
//         : true;
//       const matchesDriver = selectedDriver ? o.driver === selectedDriver : true;
//       return matchesSlot && matchesLocation && matchesDriver;
//     });
//     const total = filtered.length;
//     const pending = filtered.filter((o) => o.status === "Pending").length;
//     const packed = filtered.filter((o) => o.status === "Packed").length;
//     const partially = filtered.filter(
//       (o) => o.status === "Partially Packed"
//     ).length;
//     return { total, pending, packed, partially };
//   };

//   //   const getQuantityStats = (filterOptions = {}) => {
//   //     const {
//   //       selectedSlot = null,
//   //       selectedLocations = [],
//   //       selectedDriver = null,
//   //       statusFilter = 'All',
//   //       searchTerm = ''
//   //     } = filterOptions;

//   //     // First filter the orders based on the same criteria
//   //     const filteredOrders = OldOrder.filter((order) => {
//   //       const matchesSlot = selectedSlot ? order.slot === selectedSlot : true;
//   //       const matchesLocation = selectedLocations.length > 0
//   //         ? selectedLocations.includes(order.delivarylocation)
//   //         : true;
//   //       const matchesDriver = selectedDriver ? order.driver === selectedDriver : true;
//   //       const matchesStatus = statusFilter === 'All'
//   //         ? true
//   //         : order.status === statusFilter;

//   //       // Search functionality - searches in multiple fields
//   //       const matchesSearch = searchTerm === '' ? true : (
//   //         order.orderid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//   //         order.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//   //         order.delivarylocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//   //         order.driver?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//   //         order.items?.some(item =>
//   //           item.name?.toLowerCase().includes(searchTerm.toLowerCase())
//   //         )
//   //       );

//   //       return matchesSlot && matchesLocation && matchesDriver && matchesStatus && matchesSearch;
//   //     });

//   //     // Calculate quantities from filtered orders
//   //     const itemQuantities = {};
//   //     filteredOrders.forEach((order) => {
//   //       order.items.forEach((item) => {
//   //         if (itemQuantities[item.name]) {
//   //           itemQuantities[item.name].ordered += item.qty || 0;
//   //           itemQuantities[item.name].packed += item.packed && !item.missing ? item.qty : 0;
//   //           itemQuantities[item.name].unit = item?.unit;
//   //         } else {
//   //           itemQuantities[item.name] = {
//   //             ordered: item.qty || 0,
//   //             packed: item.packed && !item.missing ? item.qty : 0,
//   //             oldOrdered: 0,
//   //             newOrdered: 0,
//   //             unit: item?.unit
//   //           };
//   //         }
//   //       });
//   //     });

//   //     // Calculate old and new quantities for filtered items
//   //     Object.keys(itemQuantities).forEach((name) => {
//   //       const currentFiltered = itemQuantities[name].ordered;
//   //       const previousTotal = previousQuantities[name]?.ordered || 0;
//   //       const currentTotal = currentFiltered; // This is the total for this item from all filtered orders

//   //       // Calculate what the "new" quantity should be for this item
//   //       // This assumes you have a way to determine the total current quantity before filtering
//   //       // For now, I'll use a proportional approach

//   //       // If we don't have enough info, we need to calculate based on the original total
//   //       // You might need to calculate the total quantity for this item from ALL orders (not just filtered)
//   //       let totalCurrentQuantity = 0;

//   //       // Calculate total current quantity for this item from ALL orders
//   //       OldOrder.forEach((order) => {
//   //         order.items.forEach((item) => {
//   //           if (item.name === name) {
//   //             totalCurrentQuantity += item.qty || 0;
//   //           }
//   //         });
//   //       });

//   //       // Calculate the new quantity in the total
//   //       const totalNewQuantity = totalCurrentQuantity - previousTotal;

//   //       // Calculate the proportion of filtered orders relative to total
//   //       const filteredProportion = currentFiltered / totalCurrentQuantity;

//   //       // Apply the same proportion to old and new quantities
//   //       const filteredOldQuantity = Math.round(previousTotal * filteredProportion);
//   //       const filteredNewQuantity = Math.round(totalNewQuantity * filteredProportion);

//   //       // Ensure the sum matches the filtered total
//   //       const calculatedTotal = filteredOldQuantity + filteredNewQuantity;
//   //       if (calculatedTotal !== currentFiltered) {
//   //         // Adjust the new quantity to match the exact filtered total
//   //         itemQuantities[name].newOrdered = currentFiltered - filteredOldQuantity;
//   //         itemQuantities[name].oldOrdered = filteredOldQuantity;
//   //       } else {
//   //         itemQuantities[name].oldOrdered = filteredOldQuantity;
//   //         itemQuantities[name].newOrdered = filteredNewQuantity;
//   //       }

//   //       // Ensure no negative values
//   //       if (itemQuantities[name].oldOrdered < 0) {
//   //         itemQuantities[name].newOrdered += itemQuantities[name].oldOrdered;
//   //         itemQuantities[name].oldOrdered = 0;
//   //       }
//   //       if (itemQuantities[name].newOrdered < 0) {
//   //         itemQuantities[name].oldOrdered += itemQuantities[name].newOrdered;
//   //         itemQuantities[name].newOrdered = 0;
//   //       }
//   //     });

//   //     return Object.entries(itemQuantities).map(([name, quantities]) => ({
//   //       name,
//   //       ordered: `${quantities.oldOrdered}+${quantities.newOrdered}`,
//   //       packed: quantities.packed,
//   //       unit: quantities?.unit,
//   //     }));
//   // };

//   //   const quantityStats = getQuantityStats({
//   //     selectedSlot,
//   //     selectedLocations,
//   //     selectedDriver,
//   //     statusFilter,
//   //     searchTerm
//   //   });

//   // const stats = getOrderStats();

//   const getQuantityStats = (filterOptions = {}) => {
//     const {
//       selectedSlot = "",
//       selectedLocations = [],
//       selectedDriver = "",
//       statusFilter = "All",
//       searchTerm = "",
//     } = filterOptions;

//     // Filter orders based on criteria
//     const filteredOrders = OldOrder.filter((order) => {
//       const matchesSlot = selectedSlot ? order.slot === selectedSlot : true;
//       const matchesLocation =
//         selectedLocations.length > 0
//           ? selectedLocations.includes(order.delivarylocation)
//           : true;
//       const matchesDriver = selectedDriver
//         ? order.driver === selectedDriver
//         : true;
//       const matchesStatus =
//         statusFilter === "All" ? true : order.status === statusFilter;

//       const matchesSearch =
//         searchTerm === ""
//           ? true
//           : order.orderid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             order.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             order.delivarylocation
//               ?.toLowerCase()
//               .includes(searchTerm.toLowerCase()) ||
//             order.driver?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             order.items?.some((item) =>
//               item.name?.toLowerCase().includes(searchTerm.toLowerCase())
//             );

//       return (
//         matchesSlot &&
//         matchesLocation &&
//         matchesDriver &&
//         matchesStatus &&
//         matchesSearch
//       );
//     });

//     // Calculate quantities from filtered orders
//     const itemQuantities = {};
//     filteredOrders.forEach((order) => {
//       order.items.forEach((item) => {
//         if (itemQuantities[item.name]) {
//           itemQuantities[item.name].ordered += item.qty || 0;
//           itemQuantities[item.name].packed +=
//             item.packed && !item.missing ? item.qty : 0;
//           itemQuantities[item.name].unit = item?.unit;
//         } else {
//           itemQuantities[item.name] = {
//             ordered: item.qty || 0,
//             packed: item.packed && !item.missing ? item.qty : 0,
//             oldOrdered: 0,
//             newOrdered: 0,
//             unit: item?.unit,
//           };
//         }
//       });
//     });

//     // Calculate old and new quantities for filtered items
//     Object.keys(itemQuantities).forEach((name) => {
//       const currentFiltered = itemQuantities[name].ordered;
//       const previousTotal = previousQuantities[name]?.ordered || 0;

//       // Calculate total current quantity for this item from ALL orders
//       let totalCurrentQuantity = 0;
//       OldOrder.forEach((order) => {
//         order.items.forEach((item) => {
//           if (item.name === name) {
//             totalCurrentQuantity += item.qty || 0;
//           }
//         });
//       });

//       // Calculate the new quantity in the total
//       const totalNewQuantity = Math.max(
//         0,
//         totalCurrentQuantity - previousTotal
//       );

//       // Calculate the proportion of filtered orders relative to total
//       const filteredProportion =
//         totalCurrentQuantity > 0 ? currentFiltered / totalCurrentQuantity : 0;

//       // Apply the same proportion to old and new quantities
//       const filteredOldQuantity = Math.round(
//         previousTotal * filteredProportion
//       );
//       const filteredNewQuantity = Math.max(
//         0,
//         currentFiltered - filteredOldQuantity
//       );

//       itemQuantities[name].oldOrdered = filteredOldQuantity;
//       itemQuantities[name].newOrdered = filteredNewQuantity;

//       // Ensure no negative values
//       if (itemQuantities[name].oldOrdered < 0) {
//         itemQuantities[name].newOrdered += itemQuantities[name].oldOrdered;
//         itemQuantities[name].oldOrdered = 0;
//       }
//       if (itemQuantities[name].newOrdered < 0) {
//         itemQuantities[name].oldOrdered += itemQuantities[name].newOrdered;
//         itemQuantities[name].newOrdered = 0;
//       }
//     });

//     return Object.entries(itemQuantities).map(([name, quantities]) => ({
//       name,
//       ordered: `${quantities.oldOrdered}+${quantities.newOrdered}`,
//       packed: quantities.packed,
//       unit: quantities?.unit,
//       isPacked: quantities.packed > 0,
//       totalOrdered: quantities.oldOrdered + quantities.newOrdered,
//       isFullyPacked:
//         quantities.packed >= quantities.oldOrdered + quantities.newOrdered,
//     }));
//   };

//   const handleItemCheck = (index, checked, order, time) => {
//     if (order.items[index].missing) {
//       Swal.fire({
//         title: "Cannot Pack Item",
//         text: "This item is marked as missing.",
//         icon: "error",
//         showConfirmButton: false,
//         timer: 3000,
//         timerProgressBar: true,
//         toast: true,
//         position: "bottom",
//         customClass: {
//           popup: "me-small-toast",
//           title: "me-small-toast-title",
//         },
//       });
//       return;
//     }
//     const updatedItems = [...order.items];
//     updatedItems[index] = { ...updatedItems[index], packed: checked };
//     const allPacked = updatedItems.every((item) => item.packed || item.missing);
//     const somePacked = updatedItems.some(
//       (item) => item.packed && !item.missing
//     );
//     const status = allPacked
//       ? "Packed"
//       : somePacked
//       ? "Partially Packed"
//       : "Cooking";
//     const checkOntime = timeLeft[time] !== "Delay" && status == "Packed";

//     const updatedOrder = {
//       ...order,
//       items: updatedItems,
//       status,
//       view: true,
//       packBefore: checkOntime ? "Yes" : timeLeft[time],
//       time: time,
//       _id: order?._id,
//       packeTime: status === "Packed" ? moment().format("LT") : null,
//     };

//     // console.log("updart===>",updatedOrder);

//     setSelectedOrder(updatedOrder);
//     handleOrderUpdate(order.id, updatedOrder, updatedItems, true, time);
//   };

//   const handleBagAssign = (bagNo, order) => {
//     if (bagNo.trim()) {
//       const updatedOrder = { ...order, bagNo };
//       setSelectedOrder(updatedOrder);
//       handleOrderUpdate(order.id, { bagNo, _id: order._id }, order.items);
//     } else {
//       Swal.fire({
//         title: "Invalid Bag Number",
//         text: "Please enter a valid bag number.",
//         icon: "error",
//         showConfirmButton: false,
//         timer: 3000,
//         timerProgressBar: true,
//         toast: true,
//         position: "bottom",
//         customClass: {
//           popup: "me-small-toast",
//           title: "me-small-toast-title",
//         },
//       });
//     }
//   };

//   const handleDriverAssign = (driver) => {
//     if (driver) {
//       const updatedOrder = { ...selectedOrder, driver };
//       setSelectedOrder(updatedOrder);
//       handleOrderUpdate(
//         selectedOrder.id,
//         { driver, _id: selectedOrder?._id },
//         selectedOrder.items
//       );
//     } else {
//       Swal.fire({
//         title: "Invalid Driver",
//         text: "Please select a valid driver.",
//         icon: "error",
//         showConfirmButton: false,
//         timer: 3000,
//         timerProgressBar: true,
//         toast: true,
//         position: "bottom",
//         customClass: {
//           popup: "me-small-toast",
//           title: "me-small-toast-title",
//         },
//       });
//     }
//   };
//   // if (selectedOrder) {

//   //   const handleSwipe = (direction) => {

//   //     let newIndex;
//   //     if (direction === 'next') {
//   //       newIndex = currentOrderIndex < filteredOrders.length - 1 ? currentOrderIndex + 1 : 0;
//   //       setSlideDirection('slide-left');
//   //     } else {
//   //       newIndex = currentOrderIndex > 0 ? currentOrderIndex - 1 : filteredOrders.length - 1;
//   //       setSlideDirection('slide-right');
//   //     }
//   //     setSelectedOrder({ ...filteredOrders[newIndex], packer: packerId });
//   //     setCurrentOrderIndex(newIndex);
//   //     setTimeSHow(timeLeft[newIndex])
//   //   };

//   //   return (
//   //     <div className="modal fade show d-block packer-order-modal" style={{ background: 'rgba(0, 0, 0, 0.5)' }}>
//   //       <div className="modal-dialog modal-lg" style={{ display: "flex", alignItems: "center", height: "-webkit-fill-available" }}>
//   //         <div className={`modal-content packer-order-modal-content ${slideDirection}`}>
//   //           <div className="modal-header" style={{ backgroundColor: '#F81E0F', color: 'white' }}>
//   //             <h5 className="modal-title">Order Packer - {selectedOrder.id}</h5>
//   //             <button
//   //               type="button"
//   //               className="btn-close btn-close-white"
//   //               onClick={() => setSelectedOrder(null)}
//   //             />
//   //           </div>
//   //           <div className="modal-body">
//   //             <div className="d-flex justify-content-between mb-4">
//   //               <p><strong>Slot:</strong> {selectedOrder.slot}</p>
//   //               <p>
//   //                 <strong>Pack Status :</strong>{' '}
//   //                 <span className={timeShow == "Delay" ? 'text-danger fw-bold' : 'fw-bold'}>
//   //                   {timeShow}

//   //                 </span>
//   //               </p>
//   //             </div>
//   //             <div className="packer-items-list">
//   //               {selectedOrder.items.map((item, index) => (
//   //                 <div key={index} className="card packer-item-card mb-3 shadow-sm">
//   //                   <div className="card-body d-flex align-items-center justify-content-between">
//   //                     <div className="d-flex align-items-center">
//   //                       <input
//   //                         type="checkbox"
//   //                         checked={item.packed}
//   //                         onChange={(e) => handleItemCheck(index, e.target.checked)}
//   //                         className="packer-checkbox me-3"
//   //                         disabled={item.missing}
//   //                       />
//   //                       <div>
//   //                         <h6 className="mb-0">{item.name} {item.missing ? <span className="text-warning ms-2"><FaExclamationTriangle /></span> : ''}</h6>
//   //                         {/* <small className="text-muted">Quantity: {item.qty}</small> */}
//   //                       </div>
//   //                     </div>
//   //                     <h6 className="mb-0"> {item.qty}</h6>
//   //                     {item.missing ? <button
//   //                       className="btn btn-sm packer-missing-btn"
//   //                       onClick={() => handleMarkMissing(index)}
//   //                       disabled={!item.missing}
//   //                       style={{ backgroundColor: '#ffc107', color: 'black', fontWeight: 'bold' }}
//   //                     >
//   //                       <FaExclamationTriangle className="me-1" /> Mark Missing Done
//   //                     </button> : null}

//   //                   </div>
//   //                 </div>
//   //               ))}
//   //             </div>
//   //             <div className="mt-4">
//   //               <label className="form-label fw-bold">Assign to Bag:</label>
//   //               <input
//   //                 type="text"
//   //                 className="form-control packer-bag-input"
//   //                 onBlur={(e) => handleBagAssign(e.target.value)}
//   //                 defaultValue={selectedOrder.bagNo}
//   //                 placeholder="Enter bag number"
//   //                 required
//   //               />
//   //             </div>
//   //             <div className="mt-4">
//   //               <label className="form-label fw-bold">Assign Driver:</label>
//   //               <select
//   //                 className="form-select packer-driver-assign"
//   //                 value={selectedOrder.driver}
//   //                 onChange={(e) => handleDriverAssign(e.target.value)}
//   //               >
//   //                 <option value="">Select Driver</option>
//   //                 {drivers.map((driver) => (
//   //                   <option key={driver} value={driver}>{driver}</option>
//   //                 ))}
//   //               </select>
//   //             </div>
//   //             {timeShow == "Delay" && (
//   //               <div className="mt-4">
//   //                 <label className="form-label fw-bold">Reason for Delay:</label>
//   //                 <select
//   //                   className="form-select packer-delay-reason"
//   //                   onChange={(e) => {
//   //                     const updatedOrder = { ...selectedOrder, reason: e.target.value };
//   //                     setSelectedOrder(updatedOrder);
//   //                     handleOrderUpdate(selectedOrder.id, { reason: e.target.value, _id: selectedOrder?._id }, selectedOrder.items);
//   //                   }}
//   //                   value={selectedOrder.reason}
//   //                   required
//   //                 >
//   //                   <option value="">Select Reason</option>
//   //                   <option value="Food Missing">Food Missing</option>
//   //                   <option value="Shortage of Quantity">Shortage of Quantity</option>
//   //                   <option value="Food Yet Preparing">Food Yet Preparing</option>
//   //                   <option value="Other">Other</option>
//   //                 </select>
//   //               </div>
//   //             )}
//   //           </div>
//   //           <div className="modal-footer">
//   //             <button
//   //               className="btn btn-outline-secondary packer-nav-btn"
//   //               onClick={() => handleSwipe('prev')}
//   //               disabled={filteredOrders.length <= 1}
//   //             >
//   //               <FaArrowLeft className="me-2" /> Previous
//   //             </button>
//   //             <button
//   //               className="btn btn-outline-secondary packer-nav-btn"
//   //               onClick={() => handleSwipe('next')}
//   //               disabled={filteredOrders.length <= 1}
//   //             >
//   //               Next dish <FaArrowRight className="me-2" />
//   //             </button>
//   //             <button
//   //               className="btn packer-back-btn"
//   //               style={{ backgroundColor: '#F81E0F', color: 'white', fontWeight: 'bold' }}
//   //               onClick={() => navigate("/packer-thermal-print", { state: { items: [selectedOrder] } })}
//   //             >

//   //               <FaPrint className="me-2" />   Print
//   //             </button>
//   //           </div>
//   //         </div>
//   //       </div>
//   //     </div>
//   //   );
//   // }

//   const [packedFilter, setPackedFilter] = useState("all");

//   const [quantityStats, setQuantityStats] = useState([]);

//   // Filter stats based on packed status
//   const getFilteredStats = () => {
//     let filtered = quantityStats;

//     if (packedFilter === "packed") {
//       filtered = quantityStats.filter((item) => item.isPacked);
//     } else if (packedFilter === "unpacked") {
//       filtered = quantityStats.filter((item) => !item.isPacked);
//     } else if (packedFilter === "fully-packed") {
//       filtered = quantityStats.filter((item) => item.isFullyPacked);
//     } else if (packedFilter === "partially-packed") {
//       filtered = quantityStats.filter(
//         (item) => item.isPacked && !item.isFullyPacked
//       );
//     }

//     return filtered;
//   };

//   // Load data on component mount
//   useEffect(() => {
//     loadFromStorage();
//     if (OldOrder.length === 0) {
//       loadOrders();
//     }
//   }, []);

//   // Recalculate stats when filters change
//   useEffect(() => {
//     if (OldOrder.length > 0) {
//       const newStats = getQuantityStats({
//         selectedSlot,
//         selectedLocations,
//         selectedDriver,
//         statusFilter,
//         searchTerm,
//       });
//       setQuantityStats(newStats);
//     }
//   }, [
//     selectedSlot,
//     selectedLocations,
//     selectedDriver,
//     statusFilter,
//     searchTerm,
//     OldOrder,
//   ]);

//   const filteredStats = getFilteredStats();

//   if (!Packer && !Admin) {
//     navigate("/packer-login");
//   }
//   return (
//     <div className="packer-dashboard-container container-fluid p-0">
//       <div className="row g-0">
//         <div className="col-12 packer-main-content p-4">
//           <div className="packer-welcome-card mb-4 p-3 rounded shadow-sm">
//             <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
//               <PackerClock />
//               {Admin ? (
//                 <h4
//                   className="mb-3 mb-md-0"
//                   style={{ color: "#F81E0F", fontWeight: "bold" }}
//                 >
//                   Packer Tracking
//                 </h4>
//               ) : (
//                 <h4
//                   className="mb-3 mb-md-0"
//                   style={{ color: "#F81E0F", fontWeight: "bold" }}
//                 >
//                   <FaUser className="me-2" /> Welcome Back,{" "}
//                   {Admin ? "Admin" : `${packerName} (ID: ${packerId})`}
//                 </h4>
//               )}

//               <div className="d-flex flex-column flex-sm-row gap-2 w-100 w-sm-auto justify-content-end">
//                 <button
//                   className="btn packer-print-btn shadow-sm "
//                   style={{
//                     backgroundColor: "#F81E0F",
//                     color: "white",
//                     fontWeight: "bold",
//                   }}
//                   onClick={handlePrintAll}
//                 >
//                   <FaPrint className="me-2" /> Print All
//                 </button>
//                 {Packer ? (
//                   <button
//                     className="btn packer-logout-btn shadow-sm "
//                     style={{
//                       backgroundColor: "#F81E0F",
//                       color: "white",
//                       fontWeight: "bold",
//                     }}
//                     onClick={handleLogout}
//                   >
//                     <FaSignOutAlt className="me-2" /> Submit & Logout
//                   </button>
//                 ) : (
//                   <button
//                     className="btn packer-logout-btn shadow-sm "
//                     style={{
//                       backgroundColor: "#F81E0F",
//                       color: "white",
//                       fontWeight: "bold",
//                     }}
//                     onClick={() => navigate("/dashboard")}
//                   >
//                     <FaSignOutAlt className="me-2" /> Back
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>
//           <div className="mb-4 d-flex flex-column flex-md-row justify-content-end gap-3 align-items-center">
//             <select
//               className="form-select packer-slot-select shadow-sm"
//               value={selectedSlot}
//               onChange={(e) => handleSlotChange(e.target.value)}
//             >
//               <option value="">All Slots</option>
//               {AllTimesSlote?.map((ele) => (
//                 <option key={ele} value={ele}>
//                   {ele}
//                 </option>
//               ))}
//             </select>

//             <div className="dropdown btn" ref={dropdownRef}>
//               <button
//                 className="btn btn-outline-secondary dropdown-toggle form-select packer-location-select shadow-sm d-flex justify-content-between align-items-center"
//                 type="button"
//                 onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//                 style={{ textAlign: "left", minHeight: "38px" }}
//               >
//                 <span>
//                   {selectedLocations.length === 0
//                     ? "All Locations"
//                     : selectedLocations.length === 1
//                     ? selectedLocations[0]
//                     : `${selectedLocations.length} locations selected`}
//                 </span>
//               </button>

//               {isDropdownOpen && (
//                 <div
//                   className="dropdown-menu show w-100 shadow"
//                   style={{ maxHeight: "300px", overflowY: "auto" }}
//                 >
//                   {/* Select All / Clear All option */}
//                   <div className="dropdown-item">
//                     <div className="form-check">
//                       <input
//                         className="form-check-input"
//                         type="checkbox"
//                         id="select-all-locations"
//                         checked={selectedLocations.length === locations.length}
//                         onChange={handleSelectAll}
//                       />
//                       <label
//                         className="form-check-label fw-bold"
//                         htmlFor="select-all-locations"
//                       >
//                         {selectedLocations.length === locations.length
//                           ? "Clear All"
//                           : "Select All"}
//                       </label>
//                     </div>
//                   </div>

//                   <hr className="dropdown-divider" />

//                   {/* Individual location checkboxes */}
//                   {locations.map((location) => (
//                     <div key={location} className="dropdown-item">
//                       <div className="form-check">
//                         <input
//                           className="form-check-input"
//                           type="checkbox"
//                           value={location}
//                           id={`location-${location}`}
//                           checked={selectedLocations.includes(location)}
//                           onChange={() => handleLocationToggle(location)}
//                         />
//                         <label
//                           className="form-check-label"
//                           htmlFor={`location-${location}`}
//                         >
//                           {location}
//                         </label>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//             {/* <select
//               className="form-select packer-location-select shadow-sm"
//               value={selectedLocation}
//               onChange={(e) => handleLocationChange(e.target.value)}
//             >
//               <option value="">All Locations</option>
//               {locations.map((location) => (
//                 <option key={location} value={location}>{location}</option>
//               ))}
//             </select> */}
//             {/* <select
//               className="form-select packer-driver-select shadow-sm"
//               value={selectedDriver}
//               onChange={(e) => handleDriverChange(e.target.value)}
//             >
//               <option value="">All Drivers</option>
//               {drivers.map((driver) => (
//                 <option key={driver} value={driver}>{driver}</option>
//               ))}
//             </select> */}
//             <select
//               className="form-select packer-status-select shadow-sm"
//               value={statusFilter}
//               onChange={(e) => handleStatusFilter(e.target.value)}
//             >
//               <option value="All">All Status</option>
//               <option value="Cooking">Cooking</option>
//               <option value="Partially Packed">Partially Packed</option>
//               <option value="Packed">Packed</option>
//             </select>
//             <div className="d-flex gap-2">
//               <button
//                 className={`btn packer-toggle-btn ${
//                   activeView === "orders" ? "active" : ""
//                 }`}
//                 style={{
//                   backgroundColor:
//                     activeView === "orders" ? "#F81E0F" : "#6c757d",
//                   color: "white",
//                   fontWeight: "bold",
//                 }}
//                 onClick={() => setActiveView("orders")}
//               >
//                 <FaTable className="me-2" /> View Orders
//               </button>
//               <button
//                 className={`btn packer-toggle-btn ${
//                   activeView === "quantity" ? "active" : ""
//                 }`}
//                 style={{
//                   backgroundColor:
//                     activeView === "quantity" ? "#F81E0F" : "#6c757d",
//                   color: "white",
//                   fontWeight: "bold",
//                 }}
//                 onClick={() => setActiveView("quantity")}
//               >
//                 <FaListAlt className="me-2" /> View Quantity
//               </button>
//             </div>
//           </div>

//           {loading && (
//             <div className="container mt-5">
//               <div className={`loading-overlay ${loading ? "active" : ""}`}>
//                 <div className="loading-container">
//                   <div className="spinner-border text-orange" role="status">
//                     <span className="visually-hidden">Loading...</span>
//                   </div>
//                   <span>Loading...</span>
//                 </div>
//               </div>
//             </div>
//           )}
//           {activeView === "orders" && (
//             <>
//               <div className="d-flex justify-content-between align-items-center gap-2">
//                 <div className="col-lg-4 d-flex justify-content-center">
//                   <div class="input-group">
//                     <span class="input-group-text " id="basic-addon1">
//                       <BsSearch />
//                     </span>
//                     <input
//                       type="text"
//                       class="packer-slot-select shadow-sm"
//                       placeholder="Search..."
//                       aria-describedby="basic-addon1"
//                       onChange={(e) => setSearchTerm(e.target.value)}
//                       value={searchTerm}
//                     />
//                   </div>
//                 </div>

//                 <h6 className="fw-bold mb-3">
//                   Total Orders : {filteredOrders?.length}{" "}
//                 </h6>
//               </div>
//               <div className="d-flex justify-content-center gap-5 align-items-baseline">
//                 <p className="fw-bold mb-3">
//                   Pending :{" "}
//                   {
//                     filteredOrders?.filter((ele) => ele.status == "Cooking")
//                       ?.length
//                   }{" "}
//                 </p>
//                 <p className="fw-bold mb-3">
//                   Partially Packed :{" "}
//                   {
//                     filteredOrders?.filter(
//                       (ele) => ele.status == "Partially Packed"
//                     )?.length
//                   }{" "}
//                 </p>
//                 <p className="fw-bold mb-3">
//                   Packed :{" "}
//                   {
//                     filteredOrders?.filter((ele) => ele.status == "Packed")
//                       ?.length
//                   }{" "}
//                 </p>
//               </div>
//               <div className="packer-table-responsive shadow-lg rounded">
//                 <table className="table table-hover">
//                   <thead style={{ backgroundColor: "#F81E0F", color: "white" }}>
//                     <tr>
//                       <th>Order ID</th>
//                       <th>Order Time</th>
//                       <th>Location</th>
//                       <th>Bag No</th>
//                       {Admin && <th>Packer</th>}
//                       {Admin && <th>Packer Name</th>}
//                       <th>Slot</th>
//                       {Admin && <th>Packed Time</th>}
//                       {Admin && <th>On Time</th>}
//                       {Packer && <th>Pack Time Left</th>}

//                       <th>Cutlery</th>

//                       {Admin && <th>Reason</th>}
//                       <th>Status</th>
//                       {Admin && <th>Submit & Logout</th>}
//                       <th>Print</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {filteredOrders.map((order, index) => (
//                       <tr
//                         key={order._id}
//                         // className={order.status !== "Packed" ? 'table-danger' : ''}
//                         // onClick={() => handleOrderClick(order, index, timeLeft[index])}
//                         // onTouchStart={(e) => handleTouchStart(e, index, timeLeft[index])}
//                         // onTouchEnd={(e) => handleTouchEnd(e, index, timeLeft[index])}
//                       >
//                         <td>
//                           {order?.id} <br />
//                           <span style={{ fontSize: "small" }}>
//                             {order.username}
//                           </span>
//                           <br />
//                           <span style={{ fontSize: "small" }}>
//                             {order?.Mobilenumber}
//                           </span>
//                           <br />
//                           <span style={{ fontSize: "small" }}>
//                             Total :- {order?.totalOrder || 0}
//                           </span>
//                         </td>

//                         <td>{moment(order.createdAt).format("hh:mm A")}</td>
//                         <td>{order.delivarylocation}</td>
//                         <td>
//                           {" "}
//                           <select
//                             key={index}
//                             value={order.bagNo}
//                             onChange={(e) =>
//                               handleBagAssign(e.target.value, order)
//                             }
//                             className={
//                               order.bagNo
//                                 ? `btn btn-outline-success`
//                                 : "btn btn-outline-danger"
//                             }
//                             style={{ padding: "5px 10px" }}
//                             disabled={Admin ? true : false}
//                           >
//                             <option value={""}>N/A</option>
//                             {AllBags?.map((ele) => (
//                               <option value={`Bag ${ele.bagNo}`}>
//                                 Bag {ele.bagNo}
//                               </option>
//                             ))}
//                           </select>
//                         </td>
//                         {Admin && <td>{order.packer}</td>}
//                         {Admin && <td>{order.packername}</td>}
//                         <td>{order.slot}</td>
//                         {Admin && <td>{order?.packeTime}</td>}
//                         {Admin && <td>{order?.packBefore} </td>}
//                         {Packer && (
//                           <td>
//                             {order?.packeTime
//                               ? order?.packBefore
//                               : timeLeft[index]}{" "}
//                             {((order?.packeTime
//                               ? order?.packBefore
//                               : timeLeft[index]) == "Delay" ||
//                               order.reason) && (
//                               <select
//                                 key={index}
//                                 value={order.reason}
//                                 onChange={(e) =>
//                                   handleOrderUpdate(
//                                     order.id,
//                                     { reason: e.target.value, _id: order?._id },
//                                     order.items
//                                   )
//                                 }
//                                 className={
//                                   order.reason
//                                     ? `btn btn-outline-danger`
//                                     : "btn btn-outline-info"
//                                 }
//                                 style={{ padding: "5px 10px" }}
//                                 disabled={Admin ? true : false}
//                               >
//                                 <option value={"N/A"}>N/A</option>
//                                 {AllReason?.map((ele) => (
//                                   <option value={ele.reason}>
//                                     {" "}
//                                     {ele.reason}
//                                   </option>
//                                 ))}
//                               </select>
//                             )}
//                           </td>
//                         )}

//                         <td>{order?.Cutlery > 0 ? "Yes" : "No"}</td>

//                         {Admin && (
//                           <td>
//                             <select
//                               key={index}
//                               value={order.reason}
//                               onChange={(e) =>
//                                 handleOrderUpdate(
//                                   order.id,
//                                   { reason: e.target.value, _id: order?._id },
//                                   order.items
//                                 )
//                               }
//                               className={
//                                 order.reason
//                                   ? `btn btn-outline-danger`
//                                   : "btn btn-outline-info"
//                               }
//                               style={{ padding: "5px 10px" }}
//                               disabled={Admin ? true : false}
//                             >
//                               <option value={"N/A"}>N/A</option>
//                               {AllReason?.map((ele) => (
//                                 <option value={ele.reason}>
//                                   {" "}
//                                   {ele.reason}
//                                 </option>
//                               ))}
//                             </select>
//                           </td>
//                         )}
//                         <td>
//                           <button
//                             type="button"
//                             className={
//                               order.status == "Cooking" ||
//                               order.status == "Pending"
//                                 ? "btn btn-outline-danger"
//                                 : order.status == "Partially Packed"
//                                 ? "btn btn-outline-info"
//                                 : "btn btn-outline-success"
//                             }
//                             style={{ padding: "5px 10px" }}
//                             onClick={(e) => {
//                               e.stopPropagation();

//                               setSelectedOrder({
//                                 order,
//                                 packer: packerId,
//                                 packername: packerName,
//                                 _id: order?._id,
//                               });
//                               setTimeout(() => {
//                                 handleViewProducts(
//                                   order,
//                                   index,
//                                   handleItemCheck
//                                 );
//                               }, 100);
//                             }}
//                           >
//                             <FaEye className="me-1" /> {order.status}
//                           </button>
//                         </td>
//                         {Admin && (
//                           <td>
//                             {" "}
//                             {order.status == "Packed" ||
//                             order.status == "Partially Packed"
//                               ? moment(order.updatedAt).format("lll")
//                               : "  "}
//                           </td>
//                         )}

//                         <td>
//                           <button
//                             className="btn btn-sm packer-view-btn"
//                             style={{
//                               backgroundColor: "#F81E0F",
//                               color: "white",
//                             }}
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               navigate("/packer-thermal-print", {
//                                 state: { items: [order] },
//                               });
//                             }}
//                           >
//                             <FaPrint className="me-1" /> Print
//                           </button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </>
//           )}
//           {activeView === "quantity" && (
//             <>
//               <div className="d-flex justify-content-between align-items-end mb-3">
//                 <h5 className="fw-bold mb-3">Quantity View</h5>
//                 <div className="d-flex gap-4 align-items-end">
//                   {lastReload && (
//                     <h6 className="text-muted">Last Reload: {lastReload}</h6>
//                   )}
//                   <button
//                     className="btn btn-outline-success"
//                     onClick={oldOders}
//                   >
//                     Reload Orders
//                   </button>
//                 </div>
//               </div>
//               <div className="packer-table-responsive shadow-lg rounded">
//                 <table className="table table-hover">
//                   <thead style={{ backgroundColor: "#F81E0F", color: "white" }}>
//                     <tr>
//                       <th>Item</th>
//                       <th>Ordered Quantity</th>
//                       <th>Packed Quantity</th>
//                       <th>Pack Status</th>
//                       {/* <th>Progress</th> */}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {filteredStats.length > 0 ? (
//                       filteredStats.map((item, index) => {
//                         const packPercentage =
//                           item.totalOrdered > 0
//                             ? Math.round(
//                                 (item.packed / item.totalOrdered) * 100
//                               )
//                             : 0;
//                         return (
//                           <tr
//                             key={index}
//                             className={
//                               !item.isPacked
//                                 ? "table-warning"
//                                 : item.isFullyPacked
//                                 ? "table-success"
//                                 : ""
//                             }
//                           >
//                             <td>
//                               <strong>{item.name}</strong>
//                               {item.unit && (
//                                 <small className="text-muted">
//                                   ({item.unit})
//                                 </small>
//                               )}
//                             </td>
//                             <td>
//                               <span className="badge bg-secondary">
//                                 {item.ordered}
//                               </span>
//                             </td>
//                             <td>
//                               <span
//                                 className={`badge ${
//                                   item.packed > 0 ? "bg-success" : "bg-danger"
//                                 }`}
//                               >
//                                 {item.packed}
//                               </span>
//                             </td>
//                             <td>
//                               {item.isFullyPacked ? (
//                                 <span className="badge bg-success">
//                                   ✓ Fully Packed
//                                 </span>
//                               ) : item.isPacked ? (
//                                 <span className="badge bg-warning">
//                                   ⚡ Partially Packed
//                                 </span>
//                               ) : (
//                                 <span className="badge bg-danger">
//                                   ⏳ Not Packed
//                                 </span>
//                               )}
//                             </td>
//                             {/* <td>
//                               <div className="progress" style={{ width: '100px', height: '20px' }}>
//                                 <div
//                                   className={`progress-bar ${packPercentage === 100 ? 'bg-success' : packPercentage > 0 ? 'bg-warning' : 'bg-danger'}`}
//                                   role="progressbar"
//                                   style={{ width: `${packPercentage}%` }}
//                                   aria-valuenow={packPercentage}
//                                   aria-valuemin="0"
//                                   aria-valuemax="100"
//                                 >
//                                   {packPercentage}%
//                                 </div>
//                               </div>
//                             </td> */}
//                           </tr>
//                         );
//                       })
//                     ) : (
//                       <tr>
//                         <td colSpan="5" className="text-center text-muted py-4">
//                           No items found for the selected filters
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DashboardPage;

import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaPrint,
  FaSignOutAlt,
  FaArrowLeft,
  FaArrowRight,
  FaEye,
  FaUser,
  FaTable,
  FaListAlt,
  FaMapMarkerAlt,
  FaTruck,
  FaExclamationTriangle,
  FaCheckCircle,
  FaBox,
} from "react-icons/fa";
import Swal from "sweetalert2";
import axios from "axios";
import "./PackerDashboard.css";
import PackerClock from "./PackerClock";
import io from "socket.io-client";
import moment from "moment";
import { BsSearch } from "react-icons/bs";

const socket = io("http://localhost:7013/", {
  reconnection: true, // Enable reconnection
  reconnectionAttempts: 5, // Retry up to 5 times
  reconnectionDelay: 1000, // Start with 1-second delay
  reconnectionDelayMax: 5000, // Max delay of 5 seconds
  timeout: 20000, // Connection timeout of 20 seconds
});

const DashboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const Admin = JSON.parse(localStorage.getItem("admin")); // Expect array of orders

  // Load initial state from localStorage or use default values
  const loadInitialState = (key, defaultValue) => {
    try {
      const saved = localStorage.getItem(`packer_${key}`);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (error) {
      return defaultValue;
    }
  };

  // State with localStorage persistence
  const [selectedSlot, setSelectedSlot] = useState(() =>
    loadInitialState("selectedSlot", "")
  );
  const [selectedLocations, setSelectedLocations] = useState(() =>
    loadInitialState("selectedLocations", [])
  );
  const [selectedDriver, setSelectedDriver] = useState(() =>
    loadInitialState("selectedDriver", "")
  );
  const [statusFilter, setStatusFilter] = useState(() =>
    loadInitialState("statusFilter", "All")
  );
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentOrderIndex, setCurrentOrderIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState("");
  const [orders, setOrders] = useState([]);
  const [locations, setLocations] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const touchStartX = useRef(null);
  const Packer = JSON.parse(localStorage.getItem("packer"));
  const [packerId] = useState(Packer?.packerId);
  const [packerName] = useState(Packer?.username);
  const [activeView, setActiveView] = useState("orders");
  const [AllTimesSlote, setAllTimesSlote] = useState([]);
  const [AllBags, setAllBags] = useState([]);
  const [AllReason, setAllReason] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Save to localStorage whenever filter state changes
  useEffect(() => {
    localStorage.setItem("packer_selectedSlot", JSON.stringify(selectedSlot));
  }, [selectedSlot]);

  useEffect(() => {
    localStorage.setItem(
      "packer_selectedLocations",
      JSON.stringify(selectedLocations)
    );
  }, [selectedLocations]);

  useEffect(() => {
    localStorage.setItem(
      "packer_selectedDriver",
      JSON.stringify(selectedDriver)
    );
  }, [selectedDriver]);

  useEffect(() => {
    localStorage.setItem("packer_statusFilter", JSON.stringify(statusFilter));
  }, [statusFilter]);

  useEffect(() => {
    localStorage.setItem("packer_searchTerm", JSON.stringify(searchTerm));
  }, [searchTerm]);

  const checkLocation = (ele) => {
    const locationpacker = Packer.locations || [];
    const findLocation = locationpacker.find(
      (item) => item?.split(",")[0] == ele
    );
    if (findLocation) {
      return true;
    } else {
      return false;
    }
  };

  const [previousQuantities, setPreviousQuantities] = useState({});
  const [OldOrder, setOldOrder] = useState([]);
  const [lastReload, setLastReload] = useState(null);

  const packer = JSON.parse(localStorage.getItem("packer"));

  const oldOders = async () => {
    if (!Packer && !Admin) return;
    setLoading(true);
    try {
      const orderResponse = await axios.get(
        "http://localhost:7013/api/admin/getPackerOrders",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("packer-token")}`,
          },
        }
      );

      if (orderResponse.status === 200) {
        const allorder = Admin
          ? orderResponse.data
          : orderResponse.data?.filter((ele) =>
              checkLocation(ele?.delivarylocation)
            );

        const fetchedOrders = allorder?.map((order) => ({
          ...order,
          id: order.orderid || order._id,
          timeLeft: order.timeLeft || "15 Mins",
          items: order.allProduct.map((item) => ({
            ...item,
            foodItemId: item?.foodItemId?._id,
            category: item?.foodItemId?.categoryName,
            name: item?.foodItemId?.foodname,
            unit: item?.foodItemId?.unit,
            qty: item.quantity,
            packed: item.packed,
            missing: item.missing,
          })),
        }));

        setOldOrder((prevOrders) => {
          const currentQuantities = {};
          prevOrders.forEach((order) => {
            order.items.forEach((item) => {
              if (currentQuantities[item.name]) {
                currentQuantities[item.name].ordered += item.qty || 0;
                currentQuantities[item.name].packed +=
                  item.packed && !item.missing ? item.qty : 0;
                currentQuantities[item.name].unit = item.unit;
              } else {
                currentQuantities[item.name] = {
                  ordered: item.qty || 0,
                  packed: item.packed && !item.missing ? item.qty : 0,
                  unit: item.unit,
                };
              }
            });
          });
          setPreviousQuantities(currentQuantities);

          const existingOrdersMap = new Map();
          prevOrders.forEach((order, index) => {
            existingOrdersMap.set(order.id, { order, index });
          });

          const mergedOrders = [...prevOrders];

          fetchedOrders.forEach((newOrder) => {
            const existingOrderData = existingOrdersMap.get(newOrder.id);

            if (existingOrderData) {
              mergedOrders[existingOrderData.index] = newOrder;
            } else {
              mergedOrders.push(newOrder);
            }
          });

          return mergedOrders;
        });

        setLastReload(new Date().toLocaleString());
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const fetchData = async (order) => {
    try {
      if (!Packer && !Admin) return;
      setLoading(true);
      if (order) {
        if (checkLocation(order?.delivarylocation)) {
          Swal.fire({
            toast: true,
            position: "bottom",
            icon: "success",
            title: `Successfully geting new order!`,
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            customClass: {
              popup: "me-small-toast",
              title: "me-small-toast-title",
            },
          });
        }
      }
      const orderResponse = await axios.get(
        "http://localhost:7013/api/admin/getPackerOrders",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("packer-token")}`,
          },
        }
      );

      const allorder = Admin
        ? orderResponse.data
        : orderResponse.data?.filter((ele) =>
            checkLocation(ele?.delivarylocation)
          );
      setAllTimesSlote([...new Set(allorder?.map((ele) => ele?.slot))]);
      const fetchedOrders = allorder?.map((order) => ({
        ...order,
        id: order.orderid || order._id,
        timeLeft: order.timeLeft || "15 Mins",
        items: order.allProduct.map((item) => ({
          ...item,
          foodItemId: item?.foodItemId?._id,
          category: item?.foodItemId?.categoryName,
          name: item?.foodItemId?.foodname,
          unit: item?.foodItemId?.unit,
          qty: item.quantity,
          packed: item.packed,
          missing: item.missing,
        })),
      }));

      setOrders(fetchedOrders);
      setLocations([...new Set(allorder.map((ele) => ele?.delivarylocation))]);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      Swal.fire({
        title: "Orders Info",
        text: "No orders found for today.",
        icon: "info",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        toast: true,
        position: "bottom",
        customClass: {
          popup: "me-small-toast",
          title: "me-small-toast-title",
        },
      });
    }
  };

  const getBegs = async () => {
    try {
      let res = await axios.get("http://localhost:7013/api/admin/getbags");
      if (res.status == 200) {
        setAllBags(res.data.bags);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getAllReason = async () => {
    try {
      let res = await axios.get(
        "http://localhost:7013/api/admin/getdelayreasons"
      );
      if (res.status == 200) {
        setAllReason(
          res.data.reasons?.filter((ele) => ele.reasonType === "delay")
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getStorageKey = (type) => {
    const today = new Date().toISOString().split("T")[0];
    return `${type}_${today}`;
  };

  const loadFromStorage = () => {
    try {
      const quantityKey = getStorageKey("quantityStats");
      const previousKey = getStorageKey("previousQuantities");
      const ordersKey = getStorageKey("orders");
      const reloadKey = getStorageKey("lastReload");

      const savedQuantity = localStorage.getItem(quantityKey);
      const savedPrevious = localStorage.getItem(previousKey);
      const savedOrders = localStorage.getItem(ordersKey);
      const savedReload = localStorage.getItem(reloadKey);

      if (savedQuantity) {
        setQuantityStats(JSON.parse(savedQuantity));
      }
      if (savedPrevious) {
        setPreviousQuantities(JSON.parse(savedPrevious));
      }
      if (savedOrders) {
        setOldOrder(JSON.parse(savedOrders));
      }
      if (savedReload) {
        setLastReload(savedReload);
      }
    } catch (error) {
      console.error("Error loading from storage:", error);
    }
  };

  const saveToStorage = (quantity, previous, orders) => {
    try {
      const quantityKey = getStorageKey("quantityStats");
      const previousKey = getStorageKey("previousQuantities");
      const ordersKey = getStorageKey("orders");
      const reloadKey = getStorageKey("lastReload");

      const timestamp = new Date().toLocaleString();

      localStorage.setItem(quantityKey, JSON.stringify(quantity));
      localStorage.setItem(previousKey, JSON.stringify(previous));
      localStorage.setItem(ordersKey, JSON.stringify(orders));
      localStorage.setItem(reloadKey, timestamp);

      setLastReload(timestamp);
    } catch (error) {
      console.error("Error saving to storage:", error);
    }
  };

  useEffect(() => {
    socket.on("newOrder", (order) => {
      fetchData(order);
    });
    oldOders();
    getBegs();
    getAllReason();
    fetchData();
    return () => {
      socket.off("newOrder");
    };
  }, []);

  useEffect(() => {
    fetch("http://localhost:7013/api/packer/packing")
      .then((res) => res.json())
      .then((data) => setPackingStats(data.data));

    socket.on("packingUpdated", (updatedPacking) => {
      setPackingStats((prev) => {
        const exists = prev.find((p) => p._id === updatedPacking._id);
        if (exists) {
          return prev.map((p) =>
            p._id === updatedPacking._id ? updatedPacking : p
          );
        } else {
          return [...prev, updatedPacking];
        }
      });
    });

    return () => {
      socket.off("packingUpdated");
    };
  }, []);

  function timeToDate(timeStr, baseDate) {
    if (!timeStr) return null;
    const [time, modifier] = timeStr?.trim()?.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;
    const date = new Date(baseDate);
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  const [timeLeft, setTimeLeft] = useState([]);

  const handleLogout = () => {
    const check = orders.find(
      (ele, i) =>
        ele.packBefore !== "Yes" && timeLeft[i] == "Delay" && !ele.reason
    );
    if (check) {
      Swal.fire({
        title: "Session Waiting",
        text: "You can not able to logout please give update order with reason.",
        icon: "info",

        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        toast: true,
        position: "bottom",
        customClass: {
          popup: "me-small-toast",
          title: "me-small-toast-title",
        },
      });
      return;
    } else {
      localStorage.clear();
      Swal.fire({
        title: "Session Submitted",
        text: "You have been logged out successfully.",
        icon: "success",
        confirmButtonColor: "#F81E0F",
        timer: 2000,
        timerProgressBar: true,
      }).then(() => navigate("/packer-login"));
    }
  };

  const [timeShow, setTimeSHow] = useState("");

  const handleSlotChange = (slot) => {
    setSelectedSlot(slot);
    Swal.fire({
      title: "Slot Selected",
      text: `Showing orders for ${slot || "All Slots"}.`,
      icon: "info",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      toast: true,
      position: "bottom",
      customClass: {
        popup: "me-small-toast",
        title: "me-small-toast-title",
      },
    });
  };

  const handleLocationChange = (location) => {
    setSelectedLocation(location);
    Swal.fire({
      title: "Location Selected",
      text: `Showing orders for ${location || "All Locations"}.`,
      icon: "info",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      toast: true,
      position: "bottom",
      customClass: {
        popup: "me-small-toast",
        title: "me-small-toast-title",
      },
    });
  };

  const handleDriverChange = (driver) => {
    setSelectedDriver(driver);
    Swal.fire({
      title: "Driver Selected",
      text: `Showing orders for ${driver || "All Drivers"}.`,
      icon: "info",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      toast: true,
      position: "bottom",
      customClass: {
        popup: "me-small-toast",
        title: "me-small-toast-title",
      },
    });
  };

  const loadOrders = () => {
    setLoading(true);
    try {
      const currentQuantities = {};
      OldOrder.forEach((order) => {
        order.items.forEach((item) => {
          if (currentQuantities[item.name]) {
            currentQuantities[item.name].ordered += item.qty || 0;
            currentQuantities[item.name].packed +=
              item.packed && !item.missing ? item.qty : 0;
            currentQuantities[item.name].unit = item.unit;
          } else {
            currentQuantities[item.name] = {
              ordered: item.qty || 0,
              packed: item.packed && !item.missing ? item.qty : 0,
              unit: item.unit,
            };
          }
        });
      });

      setPreviousQuantities(currentQuantities);
      const newOrders = OldOrder.map((order) => ({
        ...order,
        id: order.orderid,
        items: order.items || [],
      }));

      setOldOrder(newOrders);
      const newStats = getQuantityStats({
        selectedSlot,
        selectedLocations,
        selectedDriver,
        statusFilter,
        searchTerm,
      });

      setQuantityStats(newStats);
      saveToStorage(newStats, currentQuantities, newOrders);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    Swal.fire({
      title: "Filter Applied",
      text: `Showing ${status} orders.`,
      icon: "info",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      toast: true,
      position: "bottom",
      customClass: {
        popup: "me-small-toast",
        title: "me-small-toast-title",
      },
    });
  };

  const handlePrintAll = () => {
    navigate("/packer-thermal-print", { state: { items: filteredOrders } });
  };

  const handleOrderClick = (order, index, time) => {
    setSelectedOrder({
      ...order,
      packer: packerId,
      packername: packerName,
      _id: order?._id,
    });
    setCurrentOrderIndex(index);
    setTimeSHow(time);
    setSlideDirection("");
    updateOrder(order.id, { packer: packerId, _id: order?._id });
  };

  const handleViewProducts = (order, time, handleItemCheck) => {
    if (!order || !order.items) {
      Swal.fire({
        title: "Error",
        text: "Invalid order data",
        icon: "error",
        confirmButtonColor: "#6b8e23",
      });
      return;
    }

    const allPacked = order.items.every((item) => item.packed);

    Swal.fire({
      title: `Order ${order.id} - Products`,
      html: `
      <div style="
        font-family: 'Arial', sans-serif;
        max-width: 100%;
        padding: 20px;
        background: #f9f9f9;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      ">
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 10px;
        ">
          <h5 style="font-size: 18px; color: #333; margin: 0;">
            Pack Time: ${order?.packeTime ? order?.packBefore : timeLeft[time]}
          </h5>
          <h5 style="font-size: 18px; color: #333; margin: 0;">
            Bag No: ${order?.bagNo || "Not Assigned"}
          </h5>
          <p style="font-size: 16px; color: #555; margin: 0;">
            Status: ${order.status}
          </p>
          <h5 style="font-size: 18px; color: #333; margin: 0;">
            Cutlery: ${order?.Cutlery > 0 ? "Yes" : "No"}
          </h5>
          ${
            allPacked
              ? `<div style="background: #28a745; color: white; padding: 5px 10px; border-radius: 5px; font-weight: bold;">All Packed ✓</div>`
              : ""
          }
        </div>

        <table style="
          width: 100%;
          border-collapse: collapse;
          background: #fff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        ">
          <thead style="
            background: #6b8e23;
            color: #fff;
            font-weight: 600;
            text-align: left;
          ">
            <tr>
              <th style="padding: 12px 15px; font-size: 16px;">Category</th>
              <th style="padding: 12px 15px; font-size: 16px;">Quantity</th>
              <th style="padding: 12px 15px; font-size: 16px;">Packed</th>
              <th style="padding: 12px 15px; font-size: 16px;">Missing</th>
            </tr>
          </thead>
          <tbody>
            ${order.items
              .map(
                (item, index) => `
                  <tr style="background: ${
                    index % 2 === 0 ? "#f8f8f8" : "#fff"
                  };"><td style="padding: 12px 15px; font-size: 20px; color: #333; border-bottom: 1px solid #eee;">
                      ${item.category || "Unknown"}<br/>
                      <span style="font-size: 14px;">${item.name}</span>
                    </td>
                    <td style="padding: 12px 15px; font-size: 15px; text-align: center;">
                      <span style="
                        background-color: #28a745;
                        color: #fff;
                        padding: 5px 10px;
                        border-radius: 12px;
                        font-size: 13px;
                        font-weight: 500;
                      ">
                        ${item.qty || 0}
                      </span>
                    </td>
                    <td style="
                      padding: 12px 15px;
                      font-size: 15px;
                      text-align: center;
                      cursor: pointer;
                    " data-index="${index}" data-packed="${item.packed}">
                      ${item.packed ? "✅" : "⬜"}
                    </td>
                    <td style="padding: 12px 15px; font-size: 15px; text-align: center;">
                      ${item.missing ? "⚠️" : "—"}
                    </td>
                  </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `,
      confirmButtonColor: "#6b8e23",
      width: "90%",
      didOpen: () => {
        const packedCells = document.querySelectorAll("td[data-index]");
        packedCells.forEach((cell) => {
          cell.addEventListener("click", () => {
            const index = parseInt(cell.getAttribute("data-index"));
            const packed = cell.getAttribute("data-packed") === "true";
            if (Admin) return;
            handleItemCheck(index, !packed, order, time);
          });
        });

        if (allPacked) {
          const printBtn = document.createElement("button");
          printBtn.innerHTML = "🖨️ Print";
          printBtn.style.backgroundColor = "#6B8E23";
          printBtn.style.color = "white";
          printBtn.style.padding = "8px 14px";
          printBtn.style.border = "none";
          printBtn.style.borderRadius = "6px";
          printBtn.style.cursor = "pointer";
          printBtn.style.fontSize = "15px";
          printBtn.style.marginLeft = "10px";

          const confirmBtn = Swal.getConfirmButton();
          confirmBtn.parentNode.insertBefore(printBtn, confirmBtn.nextSibling);

          printBtn.addEventListener("click", () => {
            Swal.close();
            navigate("/packer-thermal-print", {
              state: { items: [order] },
            });
          });
        }
      },
    });
  };

  const [viewOrder, setViewOrder] = useState({});
  const updateOrder = async (orderId, updatedData) => {
    setLoading(true);
    try {
      const response = await axios.put(
        `http://localhost:7013/api/admin/updatePackerOrder`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("packer-token")}`,
          },
        }
      );

      fetchData();
      if (response.status == 200) {
        const order1 = response.data?.order;
        const items = order1.allProduct?.map((item) => ({
          ...item,
          foodItemId: item?.foodItemId,
          name: item?.name,
          qty: item.quantity,
          packed: item.packed,
          missing: item.missing,
          hub: packer.hubs,
        }));

        if (updatedData.view) {
          handleViewProducts(
            { ...order1, items: items, id: order1?.orderid },
            updatedData.time,
            handleItemCheck
          );
        }
        setTimeout(() => {
          setLoading(false);
        }, 100);

        return response.data?.order;
      }
    } catch (error) {
      setTimeout(() => {
        setLoading(false);
      }, 1000);

      Swal.fire({
        title: "Error",
        text: "Failed to update order.",
        icon: "error",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        toast: true,
        position: "bottom",
        customClass: {
          popup: "me-small-toast",
          title: "me-small-toast-title",
        },
      });
    }
  };

  const handleOrderUpdate = async (orderId, updatedData, items, condition) => {
    if (
      updatedData.status &&
      !updatedData.bagNo &&
      !orders.find((o) => o.id === orderId).bagNo
    ) {
      Swal.fire({
        title: "Bag Number Required",
        text: "Please assign a bag number before updating the status.",
        icon: "error",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        toast: true,
        position: "bottom",
        customClass: {
          popup: "me-small-toast",
          title: "me-small-toast-title",
        },
      });
      return;
    }
    const allProduct = items?.map((item) => ({
      ...item,
      packed: item.packed,
      missing: item.missing,
    }));
    const response = await updateOrder(orderId, {
      ...updatedData,
      allProduct,
      packer: packerId,
      packername: packerName,
      _id: updatedData?._id,
    });
    if (response) {
      if (updatedData.status && !updatedData.view) {
        Swal.fire({
          title: "Order Updated",
          text: `Order ${orderId} updated to ${updatedData.status}.`,
          icon: "success",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          toast: true,
          position: "bottom",
          customClass: {
            popup: "me-small-toast",
            title: "me-small-toast-title",
          },
        });
      }
      if (updatedData.bagNo && !updatedData.view) {
        Swal.fire({
          title: "Bag Assigned",
          text: `Order ${orderId} assigned to Bag ${updatedData.bagNo}.`,
          icon: "success",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          toast: true,
          position: "bottom",
          customClass: {
            popup: "me-small-toast",
            title: "me-small-toast-title",
          },
        });
      }
      if (updatedData.driver && !updatedData.view) {
        Swal.fire({
          title: "Driver Assigned",
          text: `Order ${orderId} assigned to Driver ${updatedData.driver}.`,
          icon: "success",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          toast: true,
          position: "bottom",
          customClass: {
            popup: "me-small-toast",
            title: "me-small-toast-title",
          },
        });
      }
      if (updatedData.reason && !updatedData.view) {
        Swal.fire({
          title: "Delay Reason Updated",
          text: `Reason for delay updated for Order ${orderId}.`,
          icon: "success",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          toast: true,
          position: "bottom",
          customClass: {
            popup: "me-small-toast",
            title: "me-small-toast-title",
          },
        });
      }
    }
  };

  const handleMarkMissing = (index) => {
    Swal.fire({
      title: "Confirm Missing Item",
      text: `Mark ${selectedOrder.items[index].name} as missing?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#F81E0F",
      cancelButtonColor: "#6c757d",
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedItems = [...selectedOrder.items];
        updatedItems[index] = {
          ...updatedItems[index],
          missing: true,
          packed: false,
        };
        const updatedOrder = { ...selectedOrder, items: updatedItems };
        setSelectedOrder(updatedOrder);
        handleOrderUpdate(
          selectedOrder.id,
          { reason: "Food Missing", _id: selectedOrder?._id },
          updatedItems
        );
      }
    });
  };

  const handleTouchStart = (e, index, time) => {
    touchStartX.current = e.touches[0].clientX;
    setTimeSHow(time);
  };

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLocationToggle = (location) => {
    setSelectedLocations((prev) => {
      if (prev.includes(location)) {
        return prev.filter((loc) => loc !== location);
      } else {
        return [...prev, location];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedLocations.length === locations.length) {
      setSelectedLocations([]);
    } else {
      setSelectedLocations([...locations]);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSlot = selectedSlot ? order.slot === selectedSlot : true;
    const matchesLocation =
      selectedLocations.length > 0
        ? selectedLocations.includes(order.delivarylocation)
        : true;
    const matchesDriver = selectedDriver
      ? order.driver === selectedDriver
      : true;
    const matchesStatus =
      statusFilter === "All" ? true : order.status === statusFilter;

    const matchesSearch =
      searchTerm === ""
        ? true
        : order.orderid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.delivarylocation
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.driver?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.items?.some((item) =>
            item.name?.toLowerCase().includes(searchTerm.toLowerCase())
          );

    return (
      matchesSlot &&
      matchesLocation &&
      matchesDriver &&
      matchesStatus &&
      matchesSearch
    );
  });

  useEffect(() => {
    if (filteredOrders.length == 0) return;
    const interval = setInterval(() => {
      const now = new Date();
      const updated = filteredOrders.map((ele) => {
        const createdDate = new Date(ele.createdAt);
        const [startStr, endStr] = ele.slot.split(" - ");
        const slotStart = timeToDate(startStr, createdDate);
        const slotEnd = timeToDate(endStr, createdDate);

        if (createdDate > now) {
          return ele.timeLeft;
        }

        if (now < slotStart) {
          const diff = Math.floor((slotStart - now) / 1000);
          const min = Math.floor(diff / 60);
          const sec = diff % 60;
          return `${min}m ${sec}s left`;
        }

        if (now >= slotStart && now <= slotEnd) {
          return "In Progress";
        }

        if (now > slotEnd) {
          return "Delay";
        }
        return "-";
      });

      setTimeLeft(updated);
    }, 1000);

    return () => clearInterval(interval);
  }, [filteredOrders.length]);

  const handleTouchEnd = (e, index, time) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX.current - touchEndX;
    if (Math.abs(diffX) > 50) {
      if (diffX > 0) {
        const nextIndex = index < filteredOrders.length - 1 ? index + 1 : 0;
        setSelectedOrder({ ...filteredOrders[nextIndex], packer: packerId });
        setCurrentOrderIndex(nextIndex);
        setSlideDirection("slide-left");
        setTimeSHow(time);
      } else {
        const prevIndex = index > 0 ? index - 1 : orders.length - 1;
        setSelectedOrder({ ...filteredOrders[prevIndex], packer: packerId });
        setCurrentOrderIndex(prevIndex);
        setTimeSHow(time);
        setSlideDirection("slide-right");
      }
    }
  };

  const [viewProduct, setViewPrduct] = useState({});

  const getQuantityStats = (filterOptions = {}) => {
    const {
      selectedSlot = "",
      selectedLocations = [],
      selectedDriver = "",
      statusFilter = "All",
      searchTerm = "",
    } = filterOptions;

    const filteredOrders = OldOrder.filter((order) => {
      const matchesSlot = selectedSlot ? order.slot === selectedSlot : true;
      const matchesLocation =
        selectedLocations.length > 0
          ? selectedLocations.includes(order.delivarylocation)
          : true;
      const matchesDriver = selectedDriver
        ? order.driver === selectedDriver
        : true;
      const matchesStatus =
        statusFilter === "All" ? true : order.status === statusFilter;

      const matchesSearch =
        searchTerm === ""
          ? true
          : order.orderid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.delivarylocation
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            order.driver?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.items?.some((item) =>
              item.name?.toLowerCase().includes(searchTerm.toLowerCase())
            );

      return (
        matchesSlot &&
        matchesLocation &&
        matchesDriver &&
        matchesStatus &&
        matchesSearch
      );
    });

    const itemQuantities = {};
    filteredOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (itemQuantities[item.name]) {
          itemQuantities[item.name].ordered += item.qty || 0;
          itemQuantities[item.name].packed +=
            item.packed && !item.missing ? item.qty : 0;
          itemQuantities[item.name].unit = item?.unit;
          itemQuantities[item.name].category = item?.category;
        } else {
          itemQuantities[item.name] = {
            ordered: item.qty || 0,
            packed: item.packed && !item.missing ? item.qty : 0,
            oldOrdered: 0,
            newOrdered: 0,
            unit: item?.unit,
            category: item?.category,
          };
        }
      });
    });

    Object.keys(itemQuantities).forEach((name) => {
      const currentFiltered = itemQuantities[name].ordered;
      const previousTotal = previousQuantities[name]?.ordered || 0;

      let totalCurrentQuantity = 0;
      OldOrder.forEach((order) => {
        order.items.forEach((item) => {
          if (item.name === name) {
            totalCurrentQuantity += item.qty || 0;
          }
        });
      });

      const totalNewQuantity = Math.max(
        0,
        totalCurrentQuantity - previousTotal
      );

      const filteredProportion =
        totalCurrentQuantity > 0 ? currentFiltered / totalCurrentQuantity : 0;

      const filteredOldQuantity = Math.round(
        previousTotal * filteredProportion
      );
      const filteredNewQuantity = Math.max(
        0,
        currentFiltered - filteredOldQuantity
      );

      itemQuantities[name].oldOrdered = filteredOldQuantity;
      itemQuantities[name].newOrdered = filteredNewQuantity;

      if (itemQuantities[name].oldOrdered < 0) {
        itemQuantities[name].newOrdered += itemQuantities[name].oldOrdered;
        itemQuantities[name].oldOrdered = 0;
      }
      if (itemQuantities[name].newOrdered < 0) {
        itemQuantities[name].oldOrdered += itemQuantities[name].newOrdered;
        itemQuantities[name].newOrdered = 0;
      }
    });

    return Object.entries(itemQuantities).map(([name, quantities]) => ({
      name,
      ordered: `${quantities.oldOrdered}+${quantities.newOrdered}`,
      packed: quantities.packed,
      category: quantities.category,
      unit: quantities?.unit,
      isPacked: quantities.packed > 0,
      totalOrdered: quantities?.oldOrdered + quantities.newOrdered,
      isFullyPacked:
        quantities?.packed >= quantities.oldOrdered + quantities.newOrdered,
      hub: packer?.hubs,
    }));
  };

  const handleItemCheck = (index, checked, order, time) => {
    if (order.items[index].missing) {
      Swal.fire({
        title: "Cannot Pack Item",
        text: "This item is marked as missing.",
        icon: "error",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        toast: true,
        position: "bottom",
        customClass: {
          popup: "me-small-toast",
          title: "me-small-toast-title",
        },
      });
      return;
    }
    const updatedItems = [...order.items];
    updatedItems[index] = { ...updatedItems[index], packed: checked };
    const allPacked = updatedItems.every((item) => item.packed || item.missing);
    const somePacked = updatedItems.some(
      (item) => item.packed && !item.missing
    );
    const status = allPacked
      ? "Packed"
      : somePacked
      ? "Partially Packed"
      : "Cooking";
    const checkOntime = timeLeft[time] !== "Delay" && status == "Packed";

    const updatedOrder = {
      ...order,
      items: updatedItems,
      status,
      view: true,
      packBefore: checkOntime ? "Yes" : timeLeft[time],
      time: time,
      _id: order?._id,
      packeTime: status === "Packed" ? moment().format("LT") : null,
    };

    setSelectedOrder(updatedOrder);
    handleOrderUpdate(order.id, updatedOrder, updatedItems, true, time);
  };

  const handleBagAssign = (bagNo, order) => {
    if (bagNo.trim()) {
      const updatedOrder = { ...order, bagNo };
      setSelectedOrder(updatedOrder);
      handleOrderUpdate(order.id, { bagNo, _id: order._id }, order.items);
    } else {
      Swal.fire({
        title: "Invalid Bag Number",
        text: "Please enter a valid bag number.",
        icon: "error",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        toast: true,
        position: "bottom",
        customClass: {
          popup: "me-small-toast",
          title: "me-small-toast-title",
        },
      });
    }
  };

  const handleDriverAssign = (driver) => {
    if (driver) {
      const updatedOrder = { ...selectedOrder, driver };
      setSelectedOrder(updatedOrder);
      handleOrderUpdate(
        selectedOrder.id,
        { driver, _id: selectedOrder?._id },
        selectedOrder.items
      );
    } else {
      Swal.fire({
        title: "Invalid Driver",
        text: "Please select a valid driver.",
        icon: "error",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        toast: true,
        position: "bottom",
        customClass: {
          popup: "me-small-toast",
          title: "me-small-toast-title",
        },
      });
    }
  };

  const [packedFilter, setPackedFilter] = useState("all");
  const [quantityStats, setQuantityStats] = useState([]);

  const getFilteredStats = () => {
    let filtered = quantityStats;

    if (packedFilter === "packed") {
      filtered = quantityStats.filter((item) => item.isPacked);
    } else if (packedFilter === "unpacked") {
      filtered = quantityStats.filter((item) => !item.isPacked);
    } else if (packedFilter === "fully-packed") {
      filtered = quantityStats.filter((item) => item.isFullyPacked);
    } else if (packedFilter === "partially-packed") {
      filtered = quantityStats.filter(
        (item) => item.isPacked && !item.isFullyPacked
      );
    }

    return filtered;
  };

  useEffect(() => {
    loadFromStorage();
    if (OldOrder.length === 0) {
      loadOrders();
    }
  }, []);

  useEffect(() => {
    if (OldOrder.length > 0) {
      const newStats = getQuantityStats({
        selectedSlot,
        selectedLocations,
        selectedDriver,
        statusFilter,
        searchTerm,
      });
      setQuantityStats(newStats);
    }
  }, [
    selectedSlot,
    selectedLocations,
    selectedDriver,
    statusFilter,
    searchTerm,
    OldOrder,
  ]);

  const filteredStats = getFilteredStats();

  if (!Packer && !Admin) {
    navigate("/packer-login");
  }

  const [packingStats, setPackingStats] = useState([]);
  const [statusFilter2, setStatusFilter2] = useState("all");

  return (
    <div className="packer-dashboard-container container-fluid p-0">
      <div className="row g-0">
        <div className="col-12 packer-main-content p-4">
          <div className="packer-welcome-card mb-4 p-3 rounded shadow-sm">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
              <PackerClock />
              {Admin ? (
                <h4
                  className="mb-3 mb-md-0"
                  style={{ color: "#6B8E23", fontWeight: "bold" }}
                >
                  Packer Tracking
                </h4>
              ) : (
                <h4
                  className="mb-3 mb-md-0"
                  style={{ color: "#6B8E23", fontWeight: "bold" }}
                >
                  <FaUser className="me-2" /> Welcome Back,{" "}
                  {Admin ? "Admin" : `${packerName} (ID: ${packerId})`}
                </h4>
              )}

              <div className="d-flex flex-column flex-sm-row gap-2 w-100 w-sm-auto justify-content-end">
                <button
                  className="btn packer-print-btn shadow-sm "
                  style={{
                    backgroundColor: "#6B8E23",
                    color: "white",
                    fontWeight: "bold",
                  }}
                  onClick={handlePrintAll}
                >
                  <FaPrint className="me-2" /> Print All
                </button>
                {Packer ? (
                  <button
                    className="btn packer-logout-btn shadow-sm "
                    style={{
                      backgroundColor: "#F81E0F",
                      color: "white",
                      fontWeight: "bold",
                    }}
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt className="me-2" /> Submit & Logout
                  </button>
                ) : (
                  <button
                    className="btn packer-logout-btn shadow-sm "
                    style={{
                      backgroundColor: "#F81E0F",
                      color: "white",
                      fontWeight: "bold",
                    }}
                    onClick={() => navigate("/dashboard")}
                  >
                    <FaSignOutAlt className="me-2" /> Back
                  </button>
                )}
              </div>
            </div>
          </div>

          <div
            className="mb-4 d-flex flex-column flex-md-row justify-content-end gap-3 align-items-center"
            style={{ backgroundColor: "#fff8dc", padding: "40px" }}
          >
            <select
              className="form-select packer-slot-select shadow-sm"
              value={selectedSlot}
              onChange={(e) => handleSlotChange(e.target.value)}
            >
              <option value="">All Slots</option>
              {AllTimesSlote?.slice()
                .sort()
                .map((ele) => (
                  <option key={ele} value={ele}>
                    {ele}
                  </option>
                ))}
            </select>

            <div className="dropdown btn" ref={dropdownRef}>
              <button
                className="btn btn-outline-secondary dropdown-toggle form-select packer-location-select shadow-sm d-flex justify-content-between align-items-center"
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{ textAlign: "left", minHeight: "38px" }}
              >
                <span>
                  {selectedLocations.length === 0
                    ? "All Locations"
                    : selectedLocations.length === 1
                    ? selectedLocations[0]
                    : `${selectedLocations.length} locations selected`}
                </span>
              </button>

              {isDropdownOpen && (
                <div
                  className="dropdown-menu show w-100 shadow"
                  style={{
                    maxHeight: "300px",
                    overflowY: "auto",
                    zIndex: 2000,
                  }}
                >
                  <div className="dropdown-item">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="select-all-locations"
                        checked={selectedLocations.length === locations.length}
                        onChange={handleSelectAll}
                      />
                      <label
                        className="form-check-label fw-bold"
                        htmlFor="select-all-locations"
                      >
                        {selectedLocations.length === locations.length
                          ? "Clear All"
                          : "Select All"}
                      </label>
                    </div>
                  </div>

                  <hr className="dropdown-divider" />

                  {locations.map((location) => (
                    <div key={location} className="dropdown-item">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          value={location}
                          id={`location-${location}`}
                          checked={selectedLocations.includes(location)}
                          onChange={() => handleLocationToggle(location)}
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`location-${location}`}
                        >
                          {location}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <select
              className="form-select packer-status-select shadow-sm"
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Cooking">Cooking</option>
              <option value="Partially Packed">Partially Packed</option>
              <option value="Packed">Packed</option>
            </select>
          </div>

          {loading && (
            <div className="container mt-5">
              <div className={`loading-overlay ${loading ? "active" : ""}`}>
                <div className="loading-container">
                  <div className="spinner-border text-orange" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <span>Loading...</span>
                </div>
              </div>
            </div>
          )}

          {activeView === "orders" && (
            <>
              <div className="d-flex justify-content-between align-items-center gap-2">
                <div className="col-lg-4 d-flex justify-content-center">
                  <div className="input-group">
                    <span className="input-group-text " id="basic-addon1">
                      <BsSearch />
                    </span>
                    <input
                      type="text"
                      className="packer-slot-select shadow-sm"
                      placeholder="Search..."
                      aria-describedby="basic-addon1"
                      onChange={(e) => setSearchTerm(e.target.value)}
                      value={searchTerm}
                    />
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button
                    className={`btn packer-toggle-btn ${
                      activeView === "orders" ? "active" : ""
                    }`}
                    style={{
                      backgroundColor:
                        activeView === "orders" ? "#6B8E23" : "#6c757d",
                      color: "white",
                      fontWeight: "bold",
                    }}
                    onClick={() => setActiveView("orders")}
                  >
                    <FaTable className="me-2" /> View Orders
                  </button>
                  <Link to="/packers">
                    <button
                      className={`btn packer-toggle-btn ${
                        activeView === "quantity" ? "active" : ""
                      }`}
                      style={{
                        backgroundColor:
                          activeView === "quantity" ? "#6B8E23" : "#6c757d",
                        color: "white",
                        fontWeight: "bold",
                      }}
                    >
                      <FaListAlt className="me-2" /> View Quantity
                    </button>
                  </Link>
                </div>
              </div>

              <div className="container">
                <div
                  className="row text-center mt-3 sticky-top bg-white py-2"
                  style={{ zIndex: 1020 }}
                >
                  <div className="col-12 col-sm-3 mb-3">
                    <div
                      className={`p-3 border rounded shadow-sm text-black  d-flex justify-content-center align-items-center${
                        statusFilter2 === "all"
                          ? "border-secondary border-3"
                          : ""
                      }`}
                      onClick={() => setStatusFilter2("all")}
                      style={{
                        backgroundColor:
                          statusFilter2 === "all" ? "transparent" : "#aeaeae",
                        cursor: "pointer",
                        borderColor:
                          statusFilter2 === "all" ? "#374151" : "transparent",
                        height: "80px",
                      }}
                    >
                      <p className="fw-bold mb-0 fs-5">
                        Total Orders: {filteredOrders?.length}
                      </p>
                    </div>
                  </div>

                  <div className="col-12 col-sm-3 mb-3">
                    <div
                      className={`p-3 border rounded shadow-sm  d-flex justify-content-center align-items-center ${
                        statusFilter2 === "Cooking"
                          ? "border-danger border-3"
                          : ""
                      }`}
                      style={{
                        backgroundColor:
                          statusFilter2 === "Cooking"
                            ? "transparent"
                            : "#ef4444",
                        cursor: "pointer",
                        borderColor:
                          statusFilter2 === "Cooking"
                            ? "#dc2626"
                            : "transparent",
                        height: "80px",
                      }}
                      onClick={() => setStatusFilter2("Cooking")}
                    >
                      <p
                        className="fw-bold mb-0  fs-5"
                        style={{
                          color:
                            statusFilter2 === "Cooking" ? "#dc2626" : "white",
                        }}
                      >
                        Pending:{" "}
                        {
                          filteredOrders?.filter(
                            (ele) => ele.status === "Cooking"
                          )?.length
                        }
                      </p>
                    </div>
                  </div>

                  <div className="col-12 col-sm-3 mb-3">
                    <div
                      className={`p-3 border rounded shadow-sm  d-flex justify-content-center align-items-center ${
                        statusFilter2 === "Partially Packed"
                          ? "border-warning border-3"
                          : ""
                      }`}
                      style={{
                        backgroundColor:
                          statusFilter2 === "Partially Packed"
                            ? "transparent"
                            : "#fbbf24",
                        cursor: "pointer",
                        borderColor:
                          statusFilter2 === "Partially Packed"
                            ? "#d97706"
                            : "transparent",
                        height: "80px",
                      }}
                      onClick={() => setStatusFilter2("Partially Packed")}
                    >
                      <p
                        className="fw-bold mb-0 text-black fs-5"
                        style={{
                          color:
                            statusFilter2 === "Partially Packed"
                              ? "#d97706"
                              : "black",
                        }}
                      >
                        Partially Packed:{" "}
                        {
                          filteredOrders?.filter(
                            (ele) => ele.status === "Partially Packed"
                          )?.length
                        }
                      </p>
                    </div>
                  </div>

                  <div className="col-12 col-sm-3 mb-3">
                    <div
                      className={`p-3 border rounded shadow-sm  d-flex justify-content-center align-items-center ${
                        statusFilter2 === "Packed"
                          ? "border-success border-3"
                          : ""
                      }`}
                      style={{
                        backgroundColor:
                          statusFilter2 === "Packed"
                            ? "transparent"
                            : "#6B8E23",
                        cursor: "pointer",
                        borderColor:
                          statusFilter2 === "Packed"
                            ? "#6B8E23"
                            : "transparent",
                        height: "80px",
                      }}
                      onClick={() => setStatusFilter2("Packed")}
                    >
                      <p
                        className="fw-bold mb-0  fs-5"
                        style={{
                          color:
                            statusFilter2 === "Packed" ? "#6B8E23" : "white",
                        }}
                      >
                        Packed:{" "}
                        {
                          filteredOrders?.filter(
                            (ele) => ele.status === "Packed"
                          )?.length
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="packer-table-responsive shadow-lg rounded">
                <table className="table table-hover">
                  <thead style={{ backgroundColor: "#6B8E23", color: "white" }}>
                    <tr>
                      <th>Order ID</th>
                      <th>Order Time</th>
                      <th>Location</th>
                      <th>Bag No</th>
                      {Admin && <th>Packer</th>}
                      {Admin && <th>Packer Name</th>}
                      <th>Slot</th>
                      {Admin && <th>Packed Time</th>}
                      {Admin && <th>On Time</th>}
                      {Admin && <th>Reason</th>}
                      <th>Status</th>
                      {Admin && <th>Submit & Logout</th>}
                      {statusFilter2 === "Packed" && <th>Print</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders
                      .filter(
                        (order) =>
                          statusFilter2 === "all" ||
                          order.status === statusFilter2
                      )
                      .map((order, index) => (
                        <tr key={order._id}>
                          <td>
                            {order?.id} <br />
                            <span style={{ fontSize: "small" }}>
                              {order.username}
                            </span>
                            <br />
                            <span style={{ fontSize: "small" }}>
                              {order?.Mobilenumber}
                            </span>
                            <br />
                            <span style={{ fontSize: "small" }}>
                              Total :- {order?.totalOrder || 0}
                            </span>
                          </td>

                          <td>{moment(order.createdAt).format("hh:mm A")}</td>
                          <td>{order.delivarylocation}</td>
                          <td>
                            <select
                              key={index}
                              value={order.bagNo}
                              onChange={(e) =>
                                handleBagAssign(e.target.value, order)
                              }
                              className={
                                order.bagNo
                                  ? `btn btn-outline-success`
                                  : "btn btn-outline-danger"
                              }
                              style={{ padding: "5px 10px" }}
                              disabled={Admin ? true : false}
                            >
                              <option value={""}>N/A</option>
                              {AllBags?.map((ele) => (
                                <option value={`Bag ${ele.bagNo}`}>
                                  Bag {ele.bagNo}
                                </option>
                              ))}
                            </select>
                          </td>
                          {Admin && <td>{order.packer}</td>}
                          {Admin && <td>{order.packername}</td>}
                          <td>{order.slot}</td>
                          {Admin && <td>{order?.packeTime}</td>}
                          {Admin && <td>{order?.packBefore} </td>}

                          {Admin && (
                            <td>
                              <select
                                key={index}
                                value={order.reason}
                                onChange={(e) =>
                                  handleOrderUpdate(
                                    order.id,
                                    { reason: e.target.value, _id: order?._id },
                                    order.items
                                  )
                                }
                                className={
                                  order.reason
                                    ? `btn btn-outline-danger`
                                    : "btn btn-outline-info"
                                }
                                style={{ padding: "5px 10px" }}
                                disabled={Admin ? true : false}
                              >
                                <option value={"N/A"}>N/A</option>
                                {AllReason?.map((ele) => (
                                  <option value={ele.reason}>
                                    {ele.reason}
                                  </option>
                                ))}
                              </select>
                            </td>
                          )}
                          <td>
                            <button
                              type="button"
                              className={
                                order.status == "Cooking" ||
                                order.status == "Pending"
                                  ? "btn btn-outline-danger"
                                  : order.status == "Partially Packed"
                                  ? "btn btn-outline-info"
                                  : "btn btn-outline-success"
                              }
                              style={{ padding: "5px 10px" }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOrder({
                                  order,
                                  packer: packerId,
                                  packername: packerName,
                                  _id: order?._id,
                                });
                                setTimeout(() => {
                                  handleViewProducts(
                                    order,
                                    index,
                                    handleItemCheck
                                  );
                                }, 100);
                              }}
                            >
                              <FaEye className="me-1" /> {order.status}
                            </button>
                          </td>
                          {Admin && (
                            <td>
                              {order.status == "Packed" ||
                              order.status == "Partially Packed"
                                ? moment(order.updatedAt).format("lll")
                                : "  "}
                            </td>
                          )}
                          {statusFilter2 === "Packed" && (
                            <td>
                              <button
                                className="btn packer-back-btn"
                                style={{
                                  backgroundColor: "#F81E0F",
                                  color: "white",
                                  fontWeight: "bold",
                                }}
                                onClick={() =>
                                  navigate("/packer-thermal-print", {
                                    state: { items: [order] },
                                  })
                                }
                              >
                                <FaPrint className="me-2" /> Print
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
