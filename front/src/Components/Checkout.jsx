import { useContext, useEffect, useMemo, useState, useRef } from "react";
import { Button, Form, Modal, Spinner } from "react-bootstrap";
import { MdRemoveShoppingCart } from "react-icons/md";
import "../Styles/Checkout.css";
import { FaCheck } from "react-icons/fa";
import { PiWarningCircleBold } from "react-icons/pi";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import { WalletContext } from "../WalletContext";
import { BiSolidOffer } from "react-icons/bi";
import Swal2 from "sweetalert2";
import IsVeg from "../assets/isVeg=yes.svg";
import IsNonVeg from "../assets/isVeg=no.svg";
import "../Styles/Normal.css";
import { CircleCheck, ShieldAlert } from "lucide-react";
import cross from "../assets/cross.png";
import LocationModal from "./LocationModal";

// --- NEW: Import the new component and its CSS ---
import CheckoutDateStrip from "./CheckoutDateStrip";
import "../Styles/CheckoutDateStrip.css"; // Make sure this CSS file exists
// --- END NEW ---

const Checkout = () => {
  const navigate = useNavigate();
  const { wallet, walletSeting } = useContext(WalletContext);
  const location = useLocation();
  const data = location?.state;
  const addresstype = localStorage.getItem("addresstype");
  // const [address, setAddress] = useState(
  //   JSON.parse(
  //     localStorage.getItem(
  //       addresstype === "apartment" ? "address" : "coporateaddress"
  //     )
  //   ) || {}
  // );
  const [address, setAddress] = useState(
    JSON.parse(localStorage.getItem("coporateaddress")) || {}
  );

  const [expandedSections, setExpandedSections] = useState({});

  console.log(data, "checkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk");
  // --- NEW: State for individual date and session filters ---
  const [activeDateKey, setActiveDateKey] = useState(null); // e.g., "2025-11-09T00:00:00.000Z"
  const [activeSession, setActiveSession] = useState(null); // e.g., "Lunch"
  // --- END NEW ---

  const [showModal, setShowModal] = useState(false);
  const [childName, setChildName] = useState("");
  const [childClass, setChildClass] = useState("");
  const [childSection, setChildSection] = useState("");
  const storedInfo =
    JSON.parse(localStorage.getItem("studentInformation")) || {};
  const [showLocationModal, setShowLocationModal] = useState(false);
  useEffect(() => {
    const storedInfo = localStorage.getItem("studentInformation");
    if (storedInfo) {
      const info = JSON.parse(storedInfo);
      setChildName(info.studentName || "");
      setChildClass(info.studentClass || "");
      setChildSection(info.studentSection || "");
    }

    if (address?.locationType === "school") {
      setShowModal(true);
    }
  }, [address]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newInfo = {
      studentName: childName.trim(),
      studentClass: childClass.trim(),
      studentSection: childSection.trim(),
    };

    const storedInfo = localStorage.getItem("studentInformation");
    if (
      storedInfo &&
      JSON.stringify(JSON.parse(storedInfo)) === JSON.stringify(newInfo)
    ) {
      setShowModal(false);
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:7013/api/User/addStudentInformation",
        {
          customerId: user._id,
          ...newInfo,
        }
      );

      if (res.status === 200 && res.data.success) {
        localStorage.setItem("studentInformation", JSON.stringify(newInfo));
        setShowModal(false);
      } else {
        alert(res.data.message || "Failed to add student information.");
      }
    } catch (error) {
      console.error("Error adding student info:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  const Carts = JSON.parse(localStorage.getItem("cart")) || [];
  const [cartdata, setCartData] = useState([]);
  // small ref to avoid repeated JSON.parse when nothing changed
  const lastCartRawRef = useRef(null);

  // Sync cartdata with localStorage:
  // - read on mount
  // - poll (1s) for same-tab updates (storage event doesn't fire in same tab)
  // - listen to storage event for other tabs
  useEffect(() => {
    const readCart = () => {
      try {
        const raw = localStorage.getItem("cart") || "[]";
        if (raw !== lastCartRawRef.current) {
          lastCartRawRef.current = raw;
          const parsed = JSON.parse(raw);
          setCartData(Array.isArray(parsed) ? parsed : []);
        }
      } catch (err) {
        console.error("Failed to parse cart from localStorage", err);
      }
    };

    readCart();
    const intervalId = setInterval(readCart, 1000);
    const onStorage = (e) => {
      if (e.key === "cart") readCart();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      clearInterval(intervalId);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const user = JSON.parse(localStorage.getItem("user"));
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [apartmentdata, setapartmentdata] = useState([]);

  const getapartmentd = async () => {
    try {
      let res = await axios.get("http://localhost:7013/api/admin/getapartment");
      if (res.status === 200) {
        setapartmentdata(res.data.corporatedata);
        // console.log("apartmentdata", res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const [corporatedata, setcorporatedata] = useState([]);
  const getCorporatedata = async () => {
    try {
      let res = await axios.get("http://localhost:7013/api/admin/getcorporate");
      if (res.status === 200) {
        setcorporatedata(res.data.corporatedata);
        // console.log("corporatedata", res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getcartData = () => {
    const getc = JSON.parse(localStorage.getItem("cart")) || [];
    setCartData(getc);
    console.log(getc);
  };

  useEffect(() => {
    getapartmentd();
    getCorporatedata();
    setCartData(Carts);
  }, []);

  const updateCartData = (updatedCart) => {
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    getcartData();
    setDiscountWallet(
      calculateTaxPrice + subtotal + Cutlery <=
        walletSeting.minCartValueForWallet
        ? discountWallet
        : 0
    );
  };

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  let isProcessing = false;

  const increaseQuantity = (itemdata) => {
    if (isProcessing) return;
    isProcessing = true;

    try {
      if (!itemdata?.offerProduct) {
        const updatedCart = cartdata.map((item) => {
          if (item.foodItemId === itemdata?.foodItemId && !item.offerProduct) {
            if (item.Quantity < item.remainingstock) {
              item.Quantity += 1;
              item.totalPrice = Number(item.price) * Number(item.Quantity);
            } else {
              Swal2.fire({
                toast: true,
                position: "bottom",
                icon: "error",
                title: "Stock Alert",
                text: `No more stock available!`,
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
          return item;
        });
        updateCartData(updatedCart);
        return;
      } else {
        const offerPrXt = cartdata?.find(
          (ele) => ele.foodItemId === itemdata?.foodItemId && ele.extra == true
        );
        if (offerPrXt) {
          const updatedCart = cartdata.map((item) => {
            if (
              item.foodItemId === itemdata?.foodItemId &&
              item.extra === true
            ) {
              if (item.Quantity < item.remainingstock) {
                item.Quantity += 1;
                item.totalPrice = Number(item.price) * Number(item.Quantity);
              } else {
                Swal2.fire({
                  toast: true,
                  position: "bottom",
                  icon: "error",
                  title: "Stock Alert",
                  text: `No more stock available!`,
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
            return item;
          });

          updateCartData(updatedCart);
        } else {
          const offerPr2 = cartdata?.find(
            (ele) => ele.foodItemId === itemdata?.foodItemId && !ele.extra
          );
          if (offerPr2.offerQ > offerPr2.Quantity) {
            const updatedCart = cartdata.map((item) => {
              if (item.foodItemId === itemdata?.foodItemId && !item.extra) {
                if (item.Quantity < item.remainingstock) {
                  item.Quantity += 1;
                  item.totalPrice = Number(item.price) * Number(item.Quantity);
                } else {
                  Swal2.fire({
                    toast: true,
                    position: "bottom",
                    icon: "error",
                    title: "Stock Alert",
                    text: `No more stock available!`,
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
              return item;
            });
            updateCartData(updatedCart);
          } else {
            updateCartData([
              ...cartdata,
              {
                ...itemdata,
                Quantity: 1,
                remainingstock: itemdata.remainingstock - itemdata.Quantity,
                extra: true,
                price: itemdata.actualPrice,
                offerProduct: false,
                totalPrice: Number(itemdata.actualPrice) * 1,
              },
            ]);
          }
        }
      }
    } finally {
      setTimeout(() => {
        isProcessing = false;
      }, 100);
    }
  };

  const decreaseQuantity = (itemdata) => {
    if (isProcessing) return;
    isProcessing = true;

    try {
      if (itemdata?.offerProduct) {
        const updatedCart = cartdata
          .map((item) => {
            if (item.foodItemId === itemdata?.foodItemId && item.offerProduct) {
              if (item.Quantity > 0) {
                item.Quantity -= 1;
                item.totalPrice = Number(item.price) * Number(item.Quantity);
              }
            }
            return item;
          })
          .filter((item) => item.Quantity > 0);
        updateCartData(updatedCart);
      } else {
        const offerPrXt = cartdata?.find(
          (ele) => ele.foodItemId === itemdata?.foodItemId && ele.extra === true
        );
        if (offerPrXt) {
          const updatedStoredCart = cartdata
            .map((item) => {
              if (
                item.foodItemId === itemdata?.foodItemId &&
                item.extra === true
              ) {
                if (item.Quantity > 0) {
                  item.Quantity -= 1;
                  item.totalPrice = Number(item.price) * Number(item.Quantity);
                }
              }
              return item;
            })
            .filter((item) => item.Quantity > 0);
          updateCartData(updatedStoredCart);
        } else {
          const updatedExtraCart = cartdata
            .map((item) => {
              if (
                item.foodItemId === itemdata?.foodItemId &&
                !item.extra &&
                item.offerProduct === (itemdata?.offerProduct || false)
              ) {
                if (item.Quantity > 0) {
                  item.Quantity -= 1;
                  item.totalPrice = Number(item.price) * Number(item.Quantity);
                }
              }
              return item;
            })
            .filter((item) => item.Quantity > 0);

          updateCartData(updatedExtraCart);
        }
      }
    } finally {
      setTimeout(() => {
        isProcessing = false;
      }, 100);
    }
  };

  const debouncedIncreaseQuantity = debounce(increaseQuantity, 300);
  const debouncedDecreaseQuantity = debounce(decreaseQuantity, 300);

  const [delivarychargetype, setdelivarychargetype] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const handleFAQClick = () => {
    setShowFAQModal(true);
  };
  const handleSelection = (deliveryCharge, option) => {
    setdelivarychargetype(deliveryCharge);
    setSelectedOption(option);
  };

  const [slotdata, setslotdata] = useState("");
  const [Cutlery, setCutlery] = useState(0);
  const [paymentmethod] = useState("Online");
  const [name, setname] = useState("");
  const [buildingaddress, setbuildingaddress] = useState("");
  const [mobilenumber, setmobilenumber] = useState("");
  const [flat, setFlat] = useState("");
  const [towerName, setTowerName] = useState("");
  const [apartmentname, setApartmentname] = useState("");
  const [couponId, setCouponId] = useState("");
  const [coupon, setCoupon] = useState(0);
  const [discountWallet, setDiscountWallet] = useState(0);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [deliveryMethod, setDeliveryMethod] = useState("slot");

  const applycoupon = async () => {
    try {
      if (!couponId) {
        Swal2.fire({
          toast: true,
          position: "bottom",
          icon: "error",
          title: "Coupon Alert",
          text: `Please enter coupon code!`,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          customClass: {
            popup: "me-small-toast",
            title: "me-small-toast-title",
          },
        });
        return;
      }
      const config = {
        url: "/admin/applyCoupon",
        method: "post",
        baseURL: "http://localhost:7013/api/",
        headers: { "content-type": "application/json" },
        data: {
          mobileNumber: user?.Mobile,
          couponName: couponId,
          cards: cartdata,
        },
      };
      const response = await axios(config);
      if (response.status === 200) {
        setCoupon(response.data.discountPrice);
        Swal2.fire({
          toast: true,
          position: "bottom",
          icon: "success",
          title: "Applied",
          text: `Coupon Applied Successfully`,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          customClass: {
            popup: "me-small-toast",
            title: "me-small-toast-title",
          },
        });
      }
    } catch (error) {
      Swal2.fire({
        toast: true,
        position: "bottom",
        icon: "error",
        title: "Warning",
        text: error?.response?.data.message || "Something went wrong",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: "me-small-toast",
          title: "me-small-toast-title",
        },
      });

      setCoupon(0);
      setCouponId("");
    }
  };

  const [adcartId, setAdCartId] = useState({});
  useEffect(() => {
    const addonedCarts = async () => {
      try {
        let res = await axios.post("http://localhost:7013/api/cart/addCart", {
          userId: user?._id,
          items: Carts,
          lastUpdated: Date.now(),
          username: address?.name,
          mobile: user?.Mobile,
          companId: user?.companyId,
        });
        if (res.status === 200) {
          setAdCartId(res.data);
        }
      } catch (error) {
        console.log(error);
      }
    };
    if (Carts.length > 0) {
      addonedCarts();
    }
  }, [JSON.stringify(Carts)]);

  const validateSlotAndCart = async () => {
    try {
      const cartResponse = await axios.get(
        "http://localhost:7013/api/admin/getFoodItemsUnBlocks",
        {
          cartItems: cartdata,
          slot: slotdata,
        }
      );

      // console.log("Cart validation response:", cartResponse);
      if (!cartResponse.status === 200) {
        let soldOutItems = cartResponse.data.data || [];
        let card = cartdata.map((prevCart) =>
          updateCartDataWithStock(prevCart, soldOutItems)
        );
        if (card.length > 0) {
          Swal2.fire({
            toast: true,
            position: "bottom",
            icon: "error",
            title: "Items Sold Out",
            text: `The following items are sold out: ${card
              .map((item) => item.foodname)
              .join(", ")}. Please remove them from your cart.`,
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            customClass: {
              popup: "me-small-toast",
              title: "me-small-toast-title",
            },
          });

          return false;
        }
      }
      return true;
    } catch (error) {
      Swal2.fire({
        toast: true,
        position: "bottom",
        icon: "info",
        title: "Slot",
        text: `Failed to validate slot or cart. Please try again.`,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: "me-small-toast",
          title: "me-small-toast-title",
        },
      });

      return false;
    }
  };

  const appLyOffferCustome = async (
    customerName,
    phone,
    totalOrders,
    product,
    cartValue,
    offerPrice,
    location
  ) => {
    try {
      await axios.post("http://localhost:7013/api/admin/createreports", {
        customerName,
        phone,
        totalOrders,
        product,
        cartValue,
        offerPrice,
        location,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const formatTime12Hour = (date) => {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // The hour '0' should be '12'
    minutes = minutes < 10 ? "0" + minutes : minutes;
    const strTime = `${hours}:${minutes} ${ampm}`;
    return strTime;
  };
  const [loading, setLoading] = useState(false);
  const placeorder = async () => {
    try {
      setLoading(true);
      if (Carts.length < 1) {
        setLoading(false);
        Swal2.fire({
          toast: true,
          position: "bottom",
          icon: "info",
          title: "Cart Alert",
          text: `Please add items to cart`,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          customClass: {
            popup: "me-small-toast",
            title: "me-small-toast-title",
          },
        });
        return;
      }

      if (!selectedOption && addresstype !== "corporate") {
        setLoading(false);
        Swal2.fire({
          toast: true,
          position: "bottom",
          icon: "info",
          title: "Delivery Type",
          text: `Please select the delivery type!`,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          customClass: {
            popup: "me-small-toast",
            title: "me-small-toast-title",
          },
        });
        return;
      }

      if (!defaultAddress) {
        setLoading(false);
        Swal2.fire({
          toast: true,
          position: "bottom",
          icon: "info",
          title: "Cart Alert",
          text: `Please add address`,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          customClass: {
            popup: "me-small-toast",
            title: "me-small-toast-title",
          },
        });
        return;
      }

      if (!address?.name) {
        setLoading(false);
        Swal2.fire({
          toast: true,
          position: "bottom",
          icon: "info",
          title: "Address",
          text: `Please enter your address`,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          customClass: {
            popup: "me-small-toast",
            title: "me-small-toast-title",
          },
        });
        return;
      }

      // if (!address?.name) {
      //   setLoading(false);
      //   Swal2.fire({
      //     toast: true,
      //     position: "bottom",
      //     icon: "info",
      //     title: "Address",
      //     text: `Please enter your address`,
      //     showConfirmButton: false,
      //     timer: 3000,
      //     timerProgressBar: true,
      //     customClass: {
      //       popup: "me-small-toast",
      //       title: "me-small-toast-title",
      //     },
      //   });
      //   return;
      // }
      if (!addresstype) {
        setLoading(false);
        Swal2.fire({
          toast: true,
          position: "bottom",
          icon: "info",
          title: "Address type",
          text: `Please select the address type!`,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          customClass: {
            popup: "me-small-toast",
            title: "me-small-toast-title",
          },
        });
        return;
      }

      const isValid = await validateSlotAndCart();
      if (!isValid) {
        setLoading(false);
        return;
      }

      let deliveryCharge = 0;
      if (deliveryMethod === "express") {
        deliveryCharge = address.expressDeliveryPrice || 0;
      } else if (deliveryMethod === "slot") {
        deliveryCharge = address.sequentialDeliveryPrice || 0;
      }
      const totalP = (
        calculateTaxPrice +
        subtotal +
        Cutlery +
        deliveryCharge -
        delivarychargetype -
        discountWallet -
        coupon
      ).toFixed(2);
      if (totalP < 0) {
        setLoading(false);
        Swal2.fire({
          toast: true,
          position: "bottom",
          icon: "error",
          title: "Order Amount",
          text: `Invalid order amount`,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          customClass: {
            popup: "me-small-toast",
            title: "me-small-toast-title",
          },
        });
        return;
      }

      const checkMin = cartdata.find((ele) => ele.offerProduct === true);

      if (checkMin && checkMin.minCart && checkMin.minCart > subtotal) {
        setLoading(false);

        return Swal2.fire({
          toast: true,
          position: "bottom",
          icon: "info",
          title: "Cart",
          text: `₹${checkMin.minCart} needed - ${checkMin.foodname} | Cart: ₹${subtotal}`,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          customClass: {
            popup: "me-small-toast",
            title: "me-small-toast-title",
          },
        });
      }

      const generateUniqueId = () => {
        const timestamp = Date.now().toString().slice(-4);
        const randomNumber = Math.floor(1000 + Math.random() * 9000);
        return `${address?.prefixcode}${timestamp}${randomNumber}`;
      };

      let finalSlotValue;
      if (deliveryMethod === "express") {
        const etaMinutes = address.expressDeliveryTime || 15;
        const now = new Date();
        const arrivalDate = new Date(now.getTime() + etaMinutes * 60000); // Add minutes
        const arrivalTime = formatTime12Hour(arrivalDate); // Use the new helper function
        finalSlotValue = `Express (ETA: ${arrivalTime})`;
      } else {
        finalSlotValue = slotdata;
      }

      const orderGroups = groupedCart.map((group) => {
        const groupFormattedProducts = group.items.map((item) => ({
          foodItemId: item.foodItemId,
          totalPrice: item.totalPrice,
          quantity: item.Quantity,
        }));

        const groupTax = (gstlist[0]?.TotalGst / 100) * group.groupSubtotal;

        const groupSlotValue = `${new Date(
          group.date
        ).toLocaleDateString()} - ${group.session}`;

        return {
          allProduct: groupFormattedProducts,
          subTotal: group.groupSubtotal,
          tax: groupTax,
          allTotal: group.groupSubtotal + groupTax,
          slot: groupSlotValue,
          deliveryDate: group.date,
          session: group.session,
          orderid: generateUniqueId(),
          hubId: group.items[0]?.locationInfo?.hubId || address?.hubId || null,
          customerId: user?._id,
          Placedon: new Date(),
          delivarylocation: defaultAddress?.fullAddress,
          username: address?.name,
          Mobilenumber: Number(user?.Mobile),
          paymentmethod: paymentmethod,
          delivarytype: Number(delivarychargetype || 0),
          deliveryMethod: deliveryMethod || "slot",
          payid: "pay001",
          addressline: `${address?.name} ${
            addresstype === "apartment" ? `${address?.flatno},` : ""
          } ${addresstype === "apartment" ? `${address?.towerName},` : ""} ${
            address?.mobilenumber
          }`,
          status: "Cooking",
          approximatetime:
            deliveryMethod === "express"
              ? address?.expressDeliveryTime
              : address?.sequentialDeliveryTime,
          deliveryCharge: 0,
          Cutlery: 0,
          orderdelivarytype: addresstype,
          orderstatus: "Scheduled",
          apartment: address?.apartmentname,
          prefixcode: address?.prefixcode,
          companyId: user?.companyId,
          companyName: user?.companyName,
          customerType: user?.status,
          studentName: storedInfo?.studentName,
          studentClass: storedInfo?.studentClass,
          studentSection: storedInfo?.studentSection,
          addressType: defaultAddress?.addressType,
          hubName: defaultAddress?.hubName,
          hubId: defaultAddress?.hubId,
          coordinates: defaultAddress?.location,
        };
      });

      console.log(orderGroups, "ordergroups.................");

      const config = {
        url: "/admin/addfoodorder",
        method: "post",
        baseURL: "http://localhost:7013/api/",
        headers: { "content-type": "application/json" },
        data: {
          orderGroups: orderGroups,
          hubId: address?.hubId || null,
          mainCustomerId: user?._id,
          mainUsername: address?.name,
          mainMobile: Number(user?.Mobile),
          grandSubTotal: subtotal,
          grandTax: calculateTaxPrice,
          grandDeliveryCharge: deliveryCharge,
          grandCutlery: Number(Cutlery),
          grandAllTotal: totalP,
          coupon: coupon,
          couponId: couponId,
          discountWallet: discountWallet,
          cartId: adcartId?.cartId,
          cart_id: adcartId?.data,
          companyId: user?.companyId,
          companyName: user?.companyName,
          customerType: user?.status,
          studentName: storedInfo?.studentName,
          studentClass: storedInfo?.studentClass,
          studentSection: storedInfo?.studentSection,
          addressType: defaultAddress?.addressType,
          hubName: defaultAddress?.hubName,
          hubId: defaultAddress?.hubId,
          coordinates: defaultAddress?.location,
        },
      };

      const offerconfig = {
        url: "/admin/createreports",
        method: "post",
        baseURL: "http://localhost:7013/api/",
        headers: { "content-type": "application/json" },
        data: {
          customerName: address?.name,
          phone: user?.Mobile,
          totalOrders: totalP,
          product: checkMin?.foodname,
          cartValue: subtotal,
          offerPrice: checkMin?.totalPrice,
          location: address?.apartmentname,
        },
      };

      const config1 = {
        url: "/user/addpaymentphonepay",
        method: "post",
        baseURL: "http://localhost:7013/api/",
        headers: { "content-type": "application/json" },
        data: {
          userId: user?._id,
          username: address?.name,
          Mobile: user?.Mobile,
          amount: totalP,
          config: JSON.stringify(config),
          cartId: adcartId?.cartId,
          cart_id: adcartId?.data,
          offerconfig: checkMin ? JSON.stringify(offerconfig) : null,
        },
      };
      const res = await axios(config);

      if (res.status === 200) {
        if (checkMin) {
          appLyOffferCustome(
            address?.name,
            user?.Mobile,
            totalP,
            checkMin?.foodname,
            subtotal,
            checkMin?.totalPrice,
            address?.apartmentname
          );
        }
        Swal2.fire({
          toast: true,
          position: "bottom",
          icon: "success",
          title: "Order",
          text: "Order Successfully Done",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          customClass: {
            popup: "me-small-toast",
            title: "me-small-toast-title",
          },
        });

        setLoading(false);
        localStorage.removeItem("cart");
        setTimeout(() => {
          navigate("/orders", { replace: true });
        }, 600);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
      Swal2.fire({
        toast: true,
        position: "bottom",
        icon: "error",
        title: "Warning",
        text: "Order not complete",
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

  const handleSecurityClick = () => {
    setShowSecurityModal(true);
  };
  const getSelectedAddress = async (id) => {
    setApartmentname(id);
    try {
      let res = await axios.get(
        `http://localhost:7013/api/user/getSelectedAddressByUserIDAddressID/${user?._id}/${id}`
      );
      if (res.status === 200) {
        let am = res.data.getdata;
        // console.log("selected address", am);
        setname(am?.Name || "");
        setmobilenumber(am?.Number || "");
        setTowerName(am?.towerName || "");
        setFlat(am?.fletNumber || "");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const saveSelectedAddress = async (data) => {
    try {
      if (!user) return;
      await axios.post(`http://localhost:7013/api/user/addressadd`, {
        Name: name,
        Number: mobilenumber,
        userId: user?._id,
        ApartmentName: data?.apartmentname,
        addresstype: addresstype,
        addressid: data?._id,
        fletNumber: flat,
        towerName: towerName,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const Handeledata = () => {
    if (!apartmentname) {
      return alert("Please Select Apartment");
    }
    if (!name) {
      return alert("Please Enter Name!");
    }
    if (!mobilenumber) {
      return alert("Please Enter Mobile Number!");
    }
    if (addresstype === "apartment" && !flat) {
      return alert("Please Enter flat number");
    }
    if (addresstype === "apartment" && !towerName) {
      return alert("Please Enter Tower Name");
    }
    const selectedLocationData = (
      addresstype === "apartment" ? apartmentdata : corporatedata
    )?.find((data) => data?.Apartmentname === apartmentname);
    const Savedaddress = {
      _id: (addresstype === "apartment" ? apartmentdata : corporatedata)?.find(
        (data) => data?.Apartmentname === apartmentname
      )?._id,
      apartmentname: (addresstype === "apartment"
        ? apartmentdata
        : corporatedata
      )?.find((data) => data?.Apartmentname === apartmentname)?.Apartmentname,
      doordelivarycharge: (addresstype === "apartment"
        ? apartmentdata
        : corporatedata
      )?.find((data) => data?.Apartmentname === apartmentname)
        ?.doordelivaryprice,

      sequentialDeliveryPrice: selectedLocationData?.sequentialDeliveryPrice,
      sequentialDeliveryTime: selectedLocationData?.sequentialDeliveryTime,
      expressDeliveryPrice: selectedLocationData?.expressDeliveryPrice,
      expressDeliveryTime: selectedLocationData?.expressDeliveryTime,

      buildingaddress: buildingaddress,
      flatno: flat,
      name: name,
      towerName: towerName,
      mobilenumber: mobilenumber,
      prefixcode: (addresstype === "apartment"
        ? apartmentdata
        : corporatedata
      )?.find((data) => data?.Apartmentname === apartmentname)?.prefixcode,
      lunchSlots: (addresstype === "apartment"
        ? apartmentdata
        : corporatedata
      )?.find((data) => data?.Apartmentname === apartmentname)?.lunchSlots,
      dinnerSlots: (addresstype === "apartment"
        ? apartmentdata
        : corporatedata
      )?.find((data) => data?.Apartmentname === apartmentname)?.dinnerSlots,
      deliverypoint: (addresstype === "apartment"
        ? apartmentdata
        : corporatedata
      )?.find((data) => data?.Apartmentname === apartmentname)?.deliverypoint,
      locationType: (addresstype === "apartment"
        ? apartmentdata
        : corporatedata
      )?.find((data) => data?.Apartmentname === apartmentname)?.locationType,
    };

    addresstype === "apartment"
      ? localStorage.setItem("address", JSON.stringify(Savedaddress))
      : sessionStorage.setItem("coporateaddress", JSON.stringify(Savedaddress));

    setAddress(Savedaddress);
    // console.log("saved adsdas", Savedaddress);
    sessionStorage.setItem("Savedaddress", JSON.stringify(Savedaddress));
    saveSelectedAddress(Savedaddress);

    handleClose();
  };

  const updateCartDataWithStock = (cartData, foodItemData, address) => {
    const location = `${address?.apartmentname}, ${address?.Address}, ${address?.pincode}`;

    const updatedCart = cartData
      .map((cartItem) => {
        const matchedFood = foodItemData.find(
          (food) => food._id === cartItem.foodItemId
        );

        if (matchedFood) {
          const matchedLocation = matchedFood.locationPrice?.find((loc) =>
            loc.loccationAdreess?.includes(location)
          );

          if (matchedLocation) {
            return {
              ...cartItem,
              price: cartItem.offerProduct
                ? cartItem.price
                : matchedLocation.foodprice,
              remainingstock: matchedLocation.Remainingstock,
              locationInfo: {
                hubId: matchedLocation.hubId,
                hubName: matchedLocation.hubName,
              },
            };
          }
        }

        return null; // remove items that don't match any location
      })
      .filter(Boolean);

    localStorage.setItem("cart", JSON.stringify(updatedCart));
    return updatedCart;
  };

  const filterOutLowStockItems = (foodItemData) => {
    setCartData((prevCart) => {
      const updatedCart = updateCartDataWithStock(
        prevCart,
        foodItemData,
        address
      );
      return updatedCart;
    });
  };

  const getfooditems = async (shouldValidate = false) => {
    try {
      let res = await axios.get(
        "http://localhost:7013/api/admin/getFoodItemsUnBlocks"
      );
      if (res.status === 200) {
        const foodItemData = res.data.data;
        // console.log("Fetched food items:", foodItemData);
        filterOutLowStockItems(foodItemData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const [previousAddress, setPreviousAddress] = useState("");

  const subtotal = useMemo(() => {
    return cartdata?.reduce((acc, item) => {
      return Number(acc) + Number(item.price) * Number(item.Quantity);
    }, 0);
  }, [cartdata]);

  const groupedCart = useMemo(() => {
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    };

    const groups = cartdata.reduce((acc, item) => {
      const groupKey = `${item.deliveryDate}-${item.session}`;

      if (!acc[groupKey]) {
        acc[groupKey] = {
          id: groupKey,
          date: item.deliveryDate,
          session: item.session,
          displayDate: formatDate(item.deliveryDate),
          items: [],
          groupSubtotal: 0,
        };
      }

      acc[groupKey].items.push(item);
      acc[groupKey].groupSubtotal += Number(item.price) * Number(item.Quantity);
      return acc;
    }, {});

    return Object.values(groups).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  }, [cartdata]);

  const [gstlist, setGstList] = useState([]);
  const getGst = async () => {
    try {
      let res = await axios.get("http://localhost:7013/api/admin/getgst");
      if (res.status === 200) {
        setGstList(res.data.gst);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getGst();
  }, []);

  const calculateTaxPrice = useMemo(() => {
    return (gstlist[0]?.TotalGst / 100) * subtotal;
  }, [subtotal, gstlist]);

  // --- NEW: A Set of all dates that have items in the cart ---
  const cartDates = useMemo(() => {
    const dateSet = new Set();
    cartdata.forEach((item) => {
      dateSet.add(item.deliveryDate);
    });
    return dateSet;
  }, [cartdata]);

  // --- NEW: Memo to find available sessions for the *selected date* ---
  const sessionsForActiveDate = useMemo(() => {
    const sessions = new Set();
    cartdata.forEach((item) => {
      if (item.deliveryDate === activeDateKey) {
        sessions.add(item.session);
      }
    });
    return Array.from(sessions);
  }, [cartdata, activeDateKey]);

  // --- NEW: useEffect to set default active filters ---
  useEffect(() => {
    // Find the first date in the cart, starting from today
    if (cartDates.size > 0 && !activeDateKey) {
      // Find the earliest date that is in the cart
      const sortedCartDates = Array.from(cartDates).sort(
        (a, b) => new Date(a) - new Date(b)
      );
      const firstAvailableDateKey = sortedCartDates[0];

      if (firstAvailableDateKey) {
        setActiveDateKey(firstAvailableDateKey);
        // Find the first session for that first date
        const firstSession = cartdata.find(
          (item) => item.deliveryDate === firstAvailableDateKey
        )?.session;
        if (firstSession) {
          setActiveSession(firstSession);
        }
      }
    }
  }, [cartDates, cartdata, activeDateKey]);

  const [isHandleShowCalled, setIsHandleShowCalled] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const isDataIncomplete =
        !address?.name ||
        !addresstype ||
        !corporatedata?.length ||
        !apartmentdata?.length;

      if (!isHandleShowCalled && isDataIncomplete) {
        getSelectedAddress(address?.apartmentname);
        setIsHandleShowCalled(true);
        if (address?.locationType === "school" && !address?.name) {
          handleShow();
        }
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [address, addresstype, corporatedata, apartmentdata, isHandleShowCalled]);

  useEffect(() => {
    if (user?.status == "Employee" && wallet && subtotal) {
      let maxUsableAmount = calculateTaxPrice + subtotal + Cutlery;
      let walletBalance = wallet?.balance || 0;
      let maxWalletUsage = Infinity;

      let finalAmount = Math.min(
        walletBalance,
        maxUsableAmount,
        maxWalletUsage
      );
      setDiscountWallet(finalAmount);
    }
  }, [calculateTaxPrice, wallet?.balance, subtotal, Cutlery, user]);

  const handleApplyWallet = (e) => {
    if (
      user?.status == "Employee"
        ? false
        : calculateTaxPrice + subtotal + Cutlery <=
          walletSeting.minCartValueForWallet
    ) {
      Swal2.fire({
        toast: true,
        position: "bottom",
        icon: "info",
        text: `Minimum cart value for wallet use is ₹ ${walletSeting.minCartValueForWallet}`,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: "me-small-toast",
          title: "me-small-toast-title",
        },
      });
      e.target.checked = false;
      return;
    }
    if (wallet?.balance === 0) {
      Swal2.fire({
        toast: true,
        position: "bottom",
        icon: "info",
        text: `Wallet balance is 0`,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: "me-small-toast",
          title: "me-small-toast-title",
        },
      });
      e.target.checked = false;
      return;
    }
    if (e.target.checked) {
      let maxUsableAmount = calculateTaxPrice + subtotal + Cutlery;
      let walletBalance = wallet?.balance || 0;
      let maxWalletUsage =
        user?.status == "Employee"
          ? Infinity
          : walletSeting?.maxWalletUsagePerOrder || Infinity;
      let finalAmount = Math.min(
        walletBalance,
        maxUsableAmount,
        maxWalletUsage
      );
      setDiscountWallet(finalAmount);
      Swal2.fire({
        toast: true,
        position: "bottom",
        icon: "success",
        text: `Wallet Applied Successfully`,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: "me-small-toast",
          title: "me-small-toast-title",
        },
      });
    } else {
      Swal2.fire({
        toast: true,
        position: "bottom",
        icon: "success",
        text: `Wallet Removed Successfully`,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: "me-small-toast",
          title: "me-small-toast-title",
        },
      });
      setDiscountWallet(0);
    }
  };

  const [showApplyWalletAlert, setShowApplyWalletAlert] = useState(false);
  const [isBillingOpen, setIsBillingOpen] = useState(true);
  const toggleBillingDetails = () => {
    setIsBillingOpen(!isBillingOpen);
  };
  const [addresses, setAddresses] = useState([]);
  const [userData, setUserData] = useState([]);

  const [alert, setAlert] = useState({ show: false, message: "", type: "" });

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "" }), 3000);
  };
  // Clear all cart items for the active date+session (Delete slot)
  const clearSlot = () => {
    if (!activeDateKey || !activeSession) return;
    const removed = cartdata.filter(
      (it) => it.deliveryDate === activeDateKey && it.session === activeSession
    );
    if (removed.length === 0) return;
    const newCart = cartdata.filter(
      (it) =>
        !(it.deliveryDate === activeDateKey && it.session === activeSession)
    );
    localStorage.setItem("cart", JSON.stringify(newCart));
    // update local state immediately
    setCartData(newCart);
    // optional: let other listeners know
    try {
      window.dispatchEvent(new Event("cart_updated"));
    } catch (e) {
      /* noop */
    }
    console.log("Cleared slot items:", removed);
  };
  const primaryAddress =
    JSON.parse(localStorage.getItem("primaryAddress")) || {};
  // const primaryAddress=JSON.parse(localStorage.getItem("currentLocation")??localStorage.getItem("primaryAddress"))

  const defaultAddress = primaryAddress;
  console.log("sfssssssssssssssssssss", defaultAddress);

  return (
    <div className="mainbg">
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
                onClick={() => navigate(-1)}
                className="cursor-pointer"
              >
                <path
                  d="M11.7375 19.5002L19.0875 26.8502C19.3875 27.1502 19.5315 27.5002 19.5195 27.9002C19.5075 28.3002 19.351 28.6502 19.05 28.9502C18.75 29.2252 18.4 29.3692 18 29.3822C17.6 29.3952 17.25 29.2512 16.95 28.9502L7.05001 19.0502C6.90001 18.9002 6.79351 18.7377 6.73051 18.5627C6.66751 18.3877 6.63701 18.2002 6.63901 18.0002C6.64101 17.8002 6.67251 17.6127 6.73351 17.4377C6.79451 17.2627 6.90051 17.1002 7.05151 16.9502L16.9515 7.05019C17.2265 6.77519 17.5705 6.6377 17.9835 6.6377C18.3965 6.6377 18.7525 6.77519 19.0515 7.05019C19.3515 7.35019 19.5015 7.7067 19.5015 8.1197C19.5015 8.5327 19.3515 8.8887 19.0515 9.1877L11.7375 16.5002H28.5C28.925 16.5002 29.2815 16.6442 29.5695 16.9322C29.8575 17.2202 30.001 17.5762 30 18.0002C29.999 18.4242 29.855 18.7807 29.568 19.0697C29.281 19.3587 28.925 19.5022 28.5 19.5002H11.7375Z"
                  fill="#FAFAFA"
                />
              </svg>
            </div>
            <h3 className="checkout-title">Checkout</h3>
          </div>
        </div>

        <div className="mobile-checkout">
          <div className="cartHead mb-1">My Meal</div>

          {/* --- MODIFIED: Add the new Date Strip --- */}
          <CheckoutDateStrip
            cartDates={cartDates}
            activeDateKey={activeDateKey}
            onDateSelect={(dateKey) => {
              setActiveDateKey(dateKey);
              // When date changes, auto-select the first available session for that date
              const firstSession = cartdata.find(
                (item) => item.deliveryDate === dateKey
              )?.session;
              setActiveSession(firstSession || null);
            }}
          />

          {/* Delete slot button (shows number of distinct items in the active slot) */}
          <div className="delete-slot-wrapper">
            <button
              onClick={clearSlot}
              disabled={
                !activeDateKey ||
                !activeSession ||
                cartdata.filter(
                  (it) =>
                    it.deliveryDate === activeDateKey &&
                    it.session === activeSession
                ).length === 0
              }
              className="delete-slot-button"
            >
              <img
                src="/Assets/deleteBrown.svg"
                style={{ marginRight: "5px" }}
                alt="delete"
              />
              Delete slot (
              {
                cartdata.filter(
                  (it) =>
                    it.deliveryDate === activeDateKey &&
                    it.session === activeSession
                ).length
              }{" "}
              items)
            </button>
          </div>

          <div className="checkoutcontainer">
            <div class="cart-container">
              <div class="cart-section">
                <div class="cart-content">
                  <div className="checkout-session-selector">
                    <div
                      className={`checkout-session-btn-wrapper ${
                        activeSession === "Lunch" ? "active" : ""
                      }`}
                    >
                      <button
                        className={`checkout-session-btn ${
                          activeSession === "Lunch" ? "active" : ""
                        }`}
                        onClick={() => setActiveSession("Lunch")}
                        disabled={!sessionsForActiveDate.includes("Lunch")}
                      >
                        <span>Lunch</span>
                        <span>12:00pm to 04:00pm</span>
                      </button>
                    </div>
                    <div
                      className={`checkout-session-btn-wrapper  ${
                        activeSession === "Dinner" ? "active" : ""
                      }`}
                    >
                      <button
                        className={`checkout-session-btn ${
                          activeSession === "Dinner" ? "active" : ""
                        }`}
                        onClick={() => setActiveSession("Dinner")}
                        disabled={!sessionsForActiveDate.includes("Dinner")}
                      >
                        <span>Dinner</span>
                        <span>06:00pm to 08:00pm</span>
                      </button>
                    </div>
                  </div>

                  <div class="cart-header">
                    <div class="header-content">
                      <div class="header-left">
                        <div class="header-title">
                          <div class="title-text">
                            <div class="title-label">From Kitchen</div>
                          </div>
                        </div>
                        <div class="header-right">
                          <div class="qty-header">
                            <div class="qty-text">
                              <div class="title-label">Qty</div>
                            </div>
                          </div>
                          <div class="price-text">
                            <div class="title-label">Price</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* --- MODIFIED: Loop over cartdata and FILTER --- */}
                  {cartdata
                    .filter(
                      (item) =>
                        item.deliveryDate === activeDateKey &&
                        item.session === activeSession
                    )
                    .map((item, i) => (
                      <div className="cart-item" key={i}>
                        <div className="veg-indicator">
                          {item?.foodcategory === "Veg" ? (
                            <img
                              src={IsVeg}
                              alt="veg"
                              className="indicator-icon"
                            />
                          ) : (
                            <img
                              src={IsNonVeg}
                              alt="non-veg"
                              className="indicator-icon"
                            />
                          )}
                        </div>
                        <div className="item-content">
                          <div className="item-details">
                            <div className="item-name">
                              <div className="item-name-text">
                                {item.offerProduct && (
                                  <BiSolidOffer color="green" />
                                )}
                                {item?.foodname}
                              </div>
                            </div>
                            <div className="item-tags">
                              <div className="portion-tag">
                                <div className="portion-text">
                                  <div className="portion-label">
                                    {item?.Quantity} Portion
                                    {item?.Quantity > 1 ? "s" : ""}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="item-controls">
                            <div className="quantity-control">
                              <div
                                className="quantity-btn"
                                onClick={() => debouncedDecreaseQuantity(item)}
                              >
                                <div className="btn-text">-</div>
                              </div>
                              <div className="quantity-display">
                                <div className="quantity-text">
                                  {item?.Quantity}
                                </div>
                              </div>
                              <div
                                className="quantity-btn"
                                onClick={() => debouncedIncreaseQuantity(item)}
                              >
                                <div className="btn-text">+</div>
                              </div>
                            </div>
                            <div className="price-container vertical">
                              {item.originalPrice &&
                                item.originalPrice > item.price && (
                                  <div className="original-price">
                                    <div className="price-line"></div>
                                    <div className="original-price-content">
                                      <div className="original-currency">
                                        <div className="original-currency-text">
                                          ₹
                                        </div>
                                      </div>
                                      <div className="original-amount">
                                        <div className="original-amount-text">
                                          {item.originalPrice * item.Quantity}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              <div className="current-price">
                                <div className="current-currency">
                                  <div className="current-currency-text">₹</div>
                                </div>
                                <div className="current-amount">
                                  <div className="current-amount-text">
                                    {item?.price * item.Quantity}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  {/* --- END OF MODIFIED LOOP --- */}

                  {/* Show if cart is completely empty */}
                  {cartdata?.length === 0 && (
                    <div className="text-center">
                      <MdRemoveShoppingCart style={{ fontSize: "18px" }} /> No
                      items in cart
                    </div>
                  )}

                  {/* --- NEW: Show if cart has items, but not for this filter --- */}
                  {cartdata?.length > 0 &&
                    cartdata.filter(
                      (item) =>
                        item.deliveryDate === activeDateKey &&
                        item.session === activeSession
                    ).length === 0 && (
                      <div className="text-center p-3">
                        <MdRemoveShoppingCart style={{ fontSize: "18px" }} />
                        No items in cart for this date and session.
                      </div>
                    )}
                  {/* --- END NEW --- */}
                </div>
              </div>

              <div class="cart-footer">
                <div class="add-more-section">
                  <div class="add-more-btn">
                    <div class="add-more-content">
                      <div class="add-more-text-container">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                        >
                          <path
                            d="M9 3C12.3082 3 15 5.69175 15 9C15 12.3082 12.3082 15 9 15C5.69175 15 3 12.3082 3 9C3 5.69175 5.69175 3 9 3ZM9 1.5C4.85775 1.5 1.5 4.85775 1.5 9C1.5 13.1423 4.85775 16.5 9 16.5C13.1423 16.5 16.5 13.1423 16.5 9C16.5 4.85775 13.1423 1.5 9 1.5ZM12.75 8.25H9.75V5.25H8.25V8.25H5.25V9.75H8.25V12.75H9.75V9.75H12.75V8.25Z"
                            fill="black"
                          />
                        </svg>

                        <div class="add-more-text">
                          <Link to="/home" replace>
                            <div class="add-more-label">Add More</div>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="total-section">
                  <div class="total-label-container">
                    <div class="total-label">Total</div>
                  </div>
                  <div class="total-price-section">
                    <div class="total-price-content d-flex align-items-center justify-content-center gap-4">
                      {/* <div class='total-original-price d-flex align-items-center justify-content-center'>
                        <div class='price-line'></div>
                        <div class='original-price-content d-flex align-items-center'>
                          <div class='original-currency'>
                            <div class='original-currency-text'>₹</div>
                          </div>
                          <div class='original-amount'>
                            <div class='original-amount-text'>
                              {subtotal?.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div> */}

                      <div class="total-current-price d-flex align-items-center">
                        <div class="current-currency">
                          <div class="current-currency-text">₹</div>
                        </div>
                        <div class="current-amount">
                          <div class="current-amount-text">
                            {subtotal?.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="delivery-details mt-3">Delivery Details</h4>
          </div>
          {addresstype !== "corporate" && (
            <div className="deliverycard">
              <div className="deliveryHead">
                <span style={{ fontWeight: 700 }}>Choose Delivery Type</span>
              </div>
              <div className="maincard">
                {addresstype === "apartment" ? (
                  <>
                    <div
                      className={`leftcard ${
                        selectedOption === "Door" ? "active" : ""
                      }`}
                      onClick={() =>
                        handleSelection(address?.doordelivarycharge, "Door")
                      }
                    >
                      {selectedOption === "Door" && (
                        <div className="top-right-icon">
                          <FaCheck />
                        </div>
                      )}
                      <div className="top">
                        <div className="icon">
                          <img src="/Assets/door2.png" alt="" />
                        </div>
                      </div>
                      <div className="center mt-1">
                        {address?.doordelivarycharge > 0 ? (
                          <b>₹ {address?.doordelivarycharge}</b>
                        ) : (
                          <b
                            style={{
                              backgroundColor: "#355f2e",
                              borderRadius: "5px",
                              padding: "1px 8px",
                              color: "white",
                              marginTop: "5px",
                            }}
                          >
                            FREE
                          </b>
                        )}
                      </div>
                      <div className="bottom">
                        <div className="icon">
                          <h6>Deliver to Doors</h6>
                        </div>
                      </div>
                    </div>
                    <div
                      className={`rightcard ${
                        selectedOption === "Gate/Tower" ? "active" : ""
                      }`}
                      onClick={() =>
                        handleSelection(address?.Delivarycharge, "Gate/Tower")
                      }
                    >
                      {selectedOption === "Gate/Tower" && (
                        <div className="top-right-icon">
                          <FaCheck />
                        </div>
                      )}
                      <div className="top">
                        <div className="icon">
                          <img src="/Assets/guard.png" alt="" />
                        </div>
                      </div>
                      <div className="center mt-1">
                        {address?.Delivarycharge > 0 ? (
                          <b>₹ {address?.Delivarycharge}</b>
                        ) : (
                          <b
                            style={{
                              backgroundColor: "#355f2e",
                              borderRadius: "5px",
                              padding: "1px 8px",
                              color: "white",
                              marginTop: "5px",
                            }}
                          >
                            FREE
                          </b>
                        )}
                      </div>
                      <div className="bottom">
                        <div className="icon">
                          <h6>Deliver to Gate</h6>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div
                    className={`rightcard ${
                      selectedOption === "Gate/Tower" ? "active" : ""
                    }`}
                    onClick={() =>
                      handleSelection(address?.Delivarycharge, "Gate/Tower")
                    }
                  >
                    {selectedOption === "Gate/Tower" && (
                      <div className="top-right-icon">
                        <FaCheck />
                      </div>
                    )}
                    <div className="top">
                      <div className="icon">
                        <img src="/Assets/guard.png" alt="" />
                      </div>
                    </div>
                    <div className="center mt-1">
                      {address?.Delivarycharge > 0 ? (
                        <b>₹ {address?.Delivarycharge}</b>
                      ) : (
                        <b
                          style={{
                            backgroundColor: "#355f2e",
                            borderRadius: "5px",
                            padding: "1px 8px",
                            color: "white",
                            marginTop: "5px",
                          }}
                        >
                          FREE
                        </b>
                      )}
                    </div>
                    <div className="bottom">
                      <div className="icon">
                        <h6>Deliver to Gate</h6>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* <div className="delivery-details-card">
            <div class="profile-containerss">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <div class="avatar-section">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="24"
                    viewBox="0 0 18 24"
                    fill="none"
                  >
                    <path
                      />
                    </svg>
                  </div>
                  <div class="change-badge" data-text-role="Badge/Chip">
                    <div class="change-text">
                      <span
                        onClick={() => {
                          setFlat(
                            addresstype === 'apartment' ? address?.flatno : ''
                          );
                          setTowerName(
                            addresstype === 'apartment'
                              ? address?.towerName
                              : ''
                          );
                          setname(address?.name);
                          setApartmentname(address?.apartmentname);
                          setmobilenumber(address?.mobilenumber);
                          handleShow();
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        Change
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DeliverySlots
              availableSlots={availableSlots}
              setAvailableSlots={setAvailableSlots}
              slotdata={slotdata}
              address={address}
              setSlotdata={setslotdata}
              deliveryMethod={deliveryMethod}
              setDeliveryMethod={setDeliveryMethod}
            />

            <div className="icon-p">
              {/* <div>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="26"
                          height="26"
                          viewBox="0 0 26 26"
                          fill="none"
                        >
                          <path
                            d="M10.6 13.8H1.85333C1.62702 13.8 1.40997 13.7101 1.24994 13.5501C1.0899 13.39 1 13.173 1 12.9467V1.85333C1 1.62702 1.0899 1.40997 1.24994 1.24994C1.40997 1.0899 1.62702 1 1.85333 1H13M16.2 4.2C16.2 3.35131 16.5371 2.53737 17.1373 1.93726C17.7374 1.33714 18.5513 1 19.4 1C20.2487 1 21.0626 1.33714 21.6627 1.93726C22.2629 2.53737 22.6 3.35131 22.6 4.2H13.5333M22.024 7.144C21.7276 7.56395 21.3344 7.90631 20.8776 8.14212C20.4209 8.37792 19.914 8.50022 19.4 8.49867C18.885 8.49902 18.3776 8.37508 17.9208 8.13738C17.464 7.89969 17.0712 7.55525 16.776 7.13333M25 15.6667C25 14.9313 24.8552 14.2031 24.5737 13.5236C24.2923 12.8442 23.8798 12.2269 23.3598 11.7069C22.8398 11.1869 22.2225 10.7744 21.543 10.4929C20.8636 10.2115 20.1354 10.0667 19.4 10.0667C18.6646 10.0667 17.9364 10.2115 17.257 10.4929C16.5775 10.7744 15.9602 11.1869 15.4402 11.7069C14.9202 12.2269 14.5077 12.8442 14.2263 13.5236C13.9448 14.2031 13.8 14.9313 13.8 15.6667V17H16.2L17 25H21.8L22.6 17H25V15.6667Z"
                            stroke="black"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </svg>
                      </div> */}

          {/* <div className="ypt-0">
                        <input
                          className="fehew"
                          type="text"
                          placeholder="Enter delivery instructions ..."
                        />
                        <div className="tip-rider">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 18 18"
                            fill="none"
                          >
                            <path
                              d="M9 3C12.3083 3 15 5.69175 15 9C15 12.3083 12.3083 15 9 15C5.69175 15 3 12.3083 3 9C3 5.69175 5.69175 3 9 3ZM9 1.5C4.85775 1.5 1.5 4.85775 1.5 9C1.5 13.1423 4.85775 16.5 9 16.5C13.1423 16.5 16.5 13.1423 16.5 9C16.5 4.85775 13.1423 1.5 9 1.5ZM12.75 8.25H9.75V5.25H8.25V8.25H5.25V9.75H8.25V12.75H9.75V9.75H12.75V8.25Z"
                              fill="#FAFAFA"
                            />
                          </svg>
                          <div className="p-rider">Tip your rider</div>
                        </div>
                      </div> 
            </div>
          </div> */}
          <div className="delivery-details-container">
            <div className="delivery-details-row">
              {/* Icon */}
              <div className="delivery-icon-wrapper">
                <img
                  style={{
                    filter:
                      "invert(40%) sepia(88%) saturate(390%) hue-rotate(36deg) brightness(94%) contrast(89%)",
                  }}
                  src="/Assets/selectlocation.svg"
                  alt="Location"
                  className="delivery-icon"
                />
              </div>

              {/* Content */}
              <div className="delivery-content-wrapper">
                <p
                  className="select-location-text fw-semibold text-truncate mb-0"
                  style={{ maxWidth: "220px", color: "black" }}
                  title={
                    defaultAddress?.addressType === "Home"
                      ? defaultAddress?.homeName
                      : defaultAddress?.addressType === "PG"
                      ? defaultAddress?.apartmentName
                      : defaultAddress?.addressType === "School"
                      ? defaultAddress?.schoolName
                      : defaultAddress?.addressType === "Work"
                      ? defaultAddress?.companyName
                      : defaultAddress?.houseName || "No default address"
                  }
                >
                  {defaultAddress?.addressType === "Home"
                    ? defaultAddress?.homeName
                    : defaultAddress?.addressType === "PG"
                    ? defaultAddress?.apartmentName
                    : defaultAddress?.addressType === "School"
                    ? defaultAddress?.schoolName
                    : defaultAddress?.addressType === "Work"
                    ? defaultAddress?.companyName
                    : defaultAddress?.houseName || "No default address"}
                </p>
                <p
                  className="small text-truncate mb-0"
                  style={{
                    maxWidth: "280px",
                    color: "black", // ✅ 80% white
                  }}
                  title={defaultAddress?.fullAddress}
                >
                  {defaultAddress?.fullAddress || ""}
                </p>

                <div class="caption-section" data-text-role="Caption">
                  <div class="user-detailss mt-1">
                    {address?.name || address?.Fname} | {user.Mobile}
                  </div>
                  <div class="user-detailss mt-1  ">
                    {defaultAddress?.addressType === "School" ? (
                      <div className="d-flex gap-1">
                        <p>{defaultAddress?.studentInformation?.schoolName}</p>
                        <p>{defaultAddress?.studentInformation?.studentName}</p>
                        <p>
                          {defaultAddress?.studentInformation?.studentClass}
                        </p>
                        <p>
                          {defaultAddress?.studentInformation?.studentSection}
                        </p>
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
                {address.locationType === "school" && (
                  <div class="caption-section" data-text-role="Caption">
                    <div class="user-detailss mt-1">
                      {storedInfo?.studentName || ""} | class -{" "}
                      {storedInfo?.studentClass || ""}{" "}
                      {storedInfo?.studentSection
                        ? `| section - ${storedInfo.studentSection}`
                        : ""}
                    </div>
                  </div>
                )}
              </div>

              <div class="change-button">
                <div class="change-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      d="M12.7869 4.06006C13.0026 4.06408 13.197 4.13649 13.3679 4.27393L13.4402 4.3374L13.4421 4.33936L14.0691 4.96729H14.0701C14.2584 5.15512 14.3562 5.37816 14.3562 5.63135C14.3561 5.88443 14.2583 6.10722 14.0701 6.29541L8.06909 12.2964L8.12964 12.356L7.97827 12.3872L7.92847 12.437L7.89526 12.4038L6.14429 12.7642L6.14331 12.7632C5.99732 12.7977 5.86495 12.7583 5.75757 12.6509C5.6507 12.5438 5.61079 12.4117 5.64526 12.2661L6.00366 10.5142L5.97144 10.4819L6.02124 10.4312L6.05249 10.2798L6.11304 10.3394L12.1277 4.33936C12.3159 4.15164 12.537 4.05551 12.7869 4.06006ZM3.90894 4.93896C4.82094 5.04553 5.51534 5.25975 5.98022 5.59033L6.14624 5.72217C6.50712 6.04333 6.68917 6.46017 6.68921 6.96631C6.68921 7.46798 6.48149 7.87559 6.07202 8.18018C5.66644 8.48179 5.09567 8.65629 4.37183 8.71533L4.3728 8.71631C3.56599 8.78862 2.97488 8.95356 2.58765 9.20166C2.20735 9.44537 2.02278 9.7739 2.02319 10.1958L2.03003 10.3452C2.06267 10.6821 2.20957 10.9385 2.46753 11.1235C2.76926 11.3398 3.255 11.4829 3.93921 11.5415L4.03296 11.5493L4.03101 11.6431L4.01538 12.3101L4.01245 12.4146L3.90894 12.4077C3.02682 12.3515 2.34286 12.14 1.86987 11.7622C1.39341 11.3812 1.15698 10.8553 1.15698 10.1958C1.15698 9.53364 1.4429 8.99511 2.00562 8.5874C2.56435 8.18297 3.33478 7.93994 4.3064 7.8501C4.8365 7.80039 5.22055 7.69624 5.46948 7.54639C5.71114 7.40131 5.823 7.21012 5.823 6.96631C5.82295 6.63775 5.67929 6.38651 5.37964 6.20361C5.07099 6.01541 4.55566 5.87468 3.82104 5.7915L3.72241 5.78076L3.73218 5.68213L3.79761 5.02881L3.80835 4.92725L3.90894 4.93896ZM12.7771 4.99463C12.7176 4.99466 12.671 5.01448 12.6306 5.05518H12.6296L7.20581 10.4771L7.9314 11.2026L13.3542 5.78076C13.3953 5.73967 13.4148 5.69221 13.4148 5.6333C13.4148 5.58902 13.4041 5.55139 13.3816 5.51807L13.3552 5.48584L12.9236 5.05518C12.883 5.01429 12.8361 4.99463 12.7771 4.99463Z"
                      fill="#6B6B6B"
                      stroke="#6B6B6B"
                      stroke-width="0.2"
                    />
                  </svg>
                </div>
                <div class="change-badge" data-text-role="Badge/Chip">
                  <div class="change-text">
                    <span
                      onClick={() => setShowLocationModal(true)}
                      style={{ cursor: "pointer" }}
                    >
                      Change
                    </span>
                  </div>
                </div>
              </div>
              {/* Action */}
              {/* <button className="delivery-change-btn">
      <img src="/Assets/edit-icon.svg" alt="Edit" className="delivery-icon-small" />
      <span>Change</span>
    </button> */}
            </div>

            {/* --- Dotted Line --- */}
            <div className="dotted-divider"></div>

            {/* --- Reaching You Row --- */}
            <div className="delivery-details-row">
              {/* Icon */}
              <div className="delivery-icon-wrapper">
                <img
                  style={{
                    scale: "1.5",
                  }}
                  src="/Assets/homeIcon.svg"
                  alt="Delivery"
                  className="delivery-icon"
                />
              </div>

              {/* Content */}
              <div className="delivery-content-wrapper">
                <h5 className="delivery-title">
                  Reaching you fresh by 1:00 PM 🌱♻️
                </h5>
                <p className="delivery-time-subtitle">
                  Arriving{" "}
                  <span className="delivery-slot-time">12:15–12:30 PM</span>, on
                  our low-mile mindful route
                </p>
              </div>

              {/* Action */}
            </div>
            <div className="delivery-details-row" style={{}}>
              <button className="delivery-how-link" onClick={handleFAQClick}>
                How our delivery works
                <sup>
                  <PiWarningCircleBold color="#F91D0F" height={24} width={6} />
                </sup>
              </button>
            </div>

            {/* --- Handover Row --- */}
            <div className="delivery-details-row">
              {/* Icon */}
              <div className="delivery-icon-wrapper">
                <img
                  style={{
                    scale: "1.5",
                  }}
                  src="/Assets/securityIcon.svg"
                  alt="Handover"
                  className="delivery-icon"
                />
              </div>

              {/* Content */}
              <div className="delivery-content-wrapper">
                <h5 className="delivery-title">
                  Handover at :{" "}
                  <button
                    className="delivery-security-link"
                    onClick={handleSecurityClick}
                  >
                    Security entry Point
                    <sup>
                      <PiWarningCircleBold
                        color="#F91D0F"
                        height={24}
                        width={6}
                      />
                    </sup>
                  </button>
                </h5>
                <input
                  type="text"
                  className="delivery-notes-input"
                  placeholder="Enter any notes for delivery"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="spply-s">Apply & Save</h4>

            <div className="promo-wallet-container">
              {/* Promo Code Section */}
              <div className="promo-section">
                {/* Discount Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="36"
                  height="36"
                  viewBox="0 0 36 36"
                  fill="none"
                >
                  <path
                    d="M28.5123 18L29.8387 15.7076C29.9982 15.4318 30.0415 15.104 29.9593 14.7962C29.877 14.4885 29.6759 14.226 29.4002 14.0665L27.1054 12.7401V10.0969C27.1054 9.77825 26.9789 9.47265 26.7535 9.24734C26.5282 9.02203 26.2226 8.89545 25.904 8.89545H23.262L21.9368 6.60189C21.7776 6.32596 21.5152 6.12457 21.2075 6.04202C21.0551 6.00117 20.8961 5.99076 20.7396 6.01137C20.5832 6.03199 20.4323 6.08323 20.2956 6.16216L18.0009 7.48856L15.7061 6.16096C15.4301 6.00165 15.1022 5.95847 14.7944 6.04094C14.4867 6.1234 14.2242 6.32475 14.0649 6.60069L12.7385 8.89545H10.0965C9.77788 8.89545 9.47229 9.02203 9.24697 9.24734C9.02166 9.47265 8.89508 9.77825 8.89508 10.0969V12.7389L6.60031 14.0653C6.46362 14.1442 6.34384 14.2494 6.24781 14.3747C6.15178 14.5 6.08139 14.643 6.04067 14.7956C5.99994 14.9481 5.98967 15.1071 6.01045 15.2636C6.03124 15.4201 6.08266 15.571 6.16178 15.7076L7.48818 18L6.16178 20.2923C6.00317 20.5684 5.96014 20.896 6.04207 21.2036C6.12399 21.5113 6.32422 21.7741 6.59911 21.9347L8.89388 23.2611V25.9031C8.89388 26.2217 9.02046 26.5273 9.24577 26.7526C9.47109 26.9779 9.77668 27.1045 10.0953 27.1045H12.7385L14.0649 29.3993C14.1713 29.5811 14.3231 29.7321 14.5056 29.8374C14.688 29.9428 14.8947 29.9988 15.1054 30C15.3144 30 15.5223 29.9447 15.7073 29.8378L17.9997 28.5114L20.2944 29.8378C20.5702 29.9972 20.8981 30.0406 21.2058 29.9583C21.5136 29.8761 21.7761 29.675 21.9356 29.3993L23.2608 27.1045H25.9028C26.2214 27.1045 26.527 26.9779 26.7523 26.7526C26.9777 26.5273 27.1042 26.2217 27.1042 25.9031V23.2611L29.399 21.9347C29.5357 21.8557 29.6555 21.7506 29.7515 21.6253C29.8475 21.4999 29.9179 21.3569 29.9587 21.2044C29.9994 21.0519 30.0096 20.8928 29.9889 20.7363C29.9681 20.5798 29.9167 20.429 29.8375 20.2923L28.5123 18ZM14.996 11.9808C15.4742 11.9809 15.9326 12.171 16.2706 12.5092C16.6086 12.8474 16.7984 13.306 16.7982 13.7841C16.798 14.2622 16.608 14.7207 16.2698 15.0587C15.9316 15.3967 15.473 15.5864 14.9948 15.5863C14.5167 15.5861 14.0582 15.396 13.7203 15.0578C13.3823 14.7196 13.1925 14.261 13.1927 13.7829C13.1928 13.3048 13.3829 12.8463 13.7211 12.5083C14.0593 12.1704 14.5179 11.9806 14.996 11.9808ZM15.3565 23.5146L13.4342 22.0741L20.6428 12.4625L22.5652 13.9031L15.3565 23.5146ZM21.0033 23.9952C20.7665 23.9951 20.5321 23.9484 20.3134 23.8577C20.0947 23.7671 19.8961 23.6342 19.7287 23.4667C19.5614 23.2993 19.4286 23.1005 19.3381 22.8818C19.2476 22.663 19.201 22.4286 19.2011 22.1918C19.2012 21.9551 19.2479 21.7207 19.3386 21.502C19.4292 21.2833 19.5621 21.0846 19.7296 20.9172C19.897 20.7499 20.0958 20.6172 20.3145 20.5267C20.5333 20.4361 20.7677 20.3896 21.0045 20.3897C21.4826 20.3898 21.9411 20.5799 22.2791 20.9181C22.617 21.2563 22.8068 21.7149 22.8067 22.193C22.8065 22.6711 22.6164 23.1296 22.2782 23.4676C21.94 23.8056 21.4814 23.9953 21.0033 23.9952Z"
                    fill="#6B8E23"
                  />
                </svg>

                {/* Input Field */}
                <div className="input-container">
                  <input
                    type="text"
                    placeholder="Enter your promo code"
                    value={couponId}
                    onChange={(e) => setCouponId(e.target.value)}
                    className="promo-input"
                  />
                  {/* <Search className="search-icon" /> */}
                  <div className="search-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path
                        d="M13.0667 14L8.86667 9.8C8.53333 10.0667 8.15 10.2778 7.71667 10.4333C7.28333 10.5889 6.82222 10.6667 6.33333 10.6667C5.12222 10.6667 4.09733 10.2471 3.25867 9.408C2.42 8.56889 2.00044 7.544 2 6.33333C1.99956 5.12267 2.41911 4.09778 3.25867 3.25867C4.09822 2.41956 5.12311 2 6.33333 2C7.54356 2 8.56867 2.41956 9.40867 3.25867C10.2487 4.09778 10.668 5.12267 10.6667 6.33333C10.6667 6.82222 10.5889 7.28333 10.4333 7.71667C10.2778 8.15 10.0667 8.53333 9.8 8.86667L14 13.0667L13.0667 14ZM6.33333 9.33333C7.16667 9.33333 7.87511 9.04178 8.45867 8.45867C9.04222 7.87556 9.33378 7.16711 9.33333 6.33333C9.33289 5.49956 9.04133 4.79133 8.45867 4.20867C7.876 3.626 7.16756 3.33422 6.33333 3.33333C5.49911 3.33244 4.79089 3.62422 4.20867 4.20867C3.62644 4.79311 3.33467 5.50133 3.33333 6.33333C3.332 7.16533 3.62378 7.87378 4.20867 8.45867C4.79356 9.04356 5.50178 9.33511 6.33333 9.33333Z"
                        fill="#6B6B6B"
                      />
                    </svg>
                  </div>
                </div>

                {/* Apply Button */}
                <button className="apply-btn" onClick={() => applycoupon()}>
                  Apply
                </button>
              </div>

              {/* Wallet Credit Section */}
              <div className="wallet-section">
                <input
                  type="checkbox"
                  className="form-check-input wallet-checkbox"
                  // id="customCheckbox1"
                  name="Apply Wallet"
                  checked={discountWallet ? true : false}
                  onChange={(e) => handleApplyWallet(e)}
                  style={{
                    border: discountWallet
                      ? "1px solid #6B8E23 !important"
                      : "1px solid #6B6B6B !important",
                    backgroundColor: discountWallet ? "#6B8E23" : "white",
                  }}
                />
                {/* Wallet Credit Text */}
                <div className="wallet-text">
                  <div className="wallet-header">
                    <span className="wallet-title">Apply Wallet Credit</span>
                    <span className="wallet-amount">
                      (₹{(wallet?.balance - discountWallet)?.toFixed(2)}{" "}
                      available)
                    </span>
                  </div>
                  {user?.status === "Employee" ? (
                    <p className="wallet-subtext">
                      Now you can pay with wallet
                    </p>
                  ) : (
                    <p className="wallet-subtext">
                      Add ₹
                      {Math.max(
                        0,
                        Math.min(
                          walletSeting?.minCartValueForWallet || 0,
                          (walletSeting?.minCartValueForWallet || 0) -
                            (Number(calculateTaxPrice) +
                              Number(subtotal) +
                              Number(Cutlery) || 0)
                        )
                      )}{" "}
                      more to use
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="belling-head">
            <span className="billinf">Billing Details</span>
            <span onClick={toggleBillingDetails}>
              <span
                onClick={toggleBillingDetails}
                style={{ cursor: "pointer", display: "inline-block" }}
              >
                <img
                  src="/Assets/expanddown.svg"
                  alt="Toggle"
                  className={`expandable-chevron ${
                    isBillingOpen ? "open" : ""
                  }`}
                />
              </span>
            </span>
          </div>

          {isBillingOpen && (
            <div className="deliverycard">
              <div className="maincard2 p-3">
                <div
                  className="billdetail d-flex justify-content-between align-items-start w-100 flex-wrap"
                  style={{ gap: "20px" }}
                >
                  {/* Left Column */}
                  <div className="label-column">
                    <div className="toatal-va">Total Order Value</div>
                    <div className="toatal-va">
                      Tax ({gstlist[0]?.TotalGst}%)
                    </div>
                    {deliveryMethod === "express" && (
                      <div className="toatal-va">Express Delivery</div>
                    )}
                    {deliveryMethod === "slot" && (
                      <div className="toatal-va">Slot Delivery</div>
                    )}
                    {Cutlery !== 0 && <div className="toatal-va">Cutlery</div>}
                    {coupon !== 0 && (
                      <div className="toatal-va">Coupon Discount</div>
                    )}
                    {selectedOption && (
                      <div className="toatal-va">{`${selectedOption} Delivery`}</div>
                    )}
                    {discountWallet !== 0 && (
                      <div className="toatal-va">Wallet Pay</div>
                    )}
                    <div>
                      <b className="toatal-va">Total Payable</b>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="value-column">
                    <div className="toatal-va">₹ {subtotal?.toFixed(2)}</div>
                    <div className="toatal-va">
                      ₹ {calculateTaxPrice.toFixed(2)}
                    </div>
                    {Cutlery !== 0 && (
                      <div className="toatal-va">₹ {Cutlery}</div>
                    )}
                    {coupon !== 0 && (
                      <div className="toatal-va" style={{ color: "green" }}>
                        - ₹ {coupon}
                      </div>
                    )}
                    {selectedOption && (
                      <div className="toatal-va">₹ {delivarychargetype}</div>
                    )}
                    {deliveryMethod === "express" && (
                      <div className="toatal-va">
                        ₹ {address.expressDeliveryPrice?.toFixed(2) || "0.00"}
                      </div>
                    )}
                    {deliveryMethod === "slot" && (
                      <div className="toatal-va">
                        ₹{" "}
                        {address.sequentialDeliveryPrice?.toFixed(2) || "0.00"}
                      </div>
                    )}
                    {discountWallet !== 0 && (
                      <div className="toatal-va" style={{ color: "green" }}>
                        - ₹ {discountWallet}
                      </div>
                    )}
                    <div className="toatal-va">
                      <b>
                        ₹{" "}
                        {(
                          calculateTaxPrice +
                          subtotal +
                          Cutlery +
                          (deliveryMethod === "express"
                            ? address.expressDeliveryPrice || 0
                            : address.sequentialDeliveryPrice || 0) -
                          discountWallet -
                          coupon
                        ).toFixed(2)}
                      </b>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Button
              variant=""
              style={{
                width: "100%",
                borderRadius: "12px",
                border: "1px solid var(--steel_light, #E8E8E8)",
                background: " var(--success-green, #6B8E23)",
                display: "flex",
                height: "48px",
                padding: "8px",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px",
                marginTop: "8px",
              }}
              onClick={() => placeorder()}
              className="placeorder-bill"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Ordering...
                </>
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <div className="paybutton">Pay with UPI | </div>
                  <p className="price-pay">
                    ₹
                    {(
                      calculateTaxPrice +
                      subtotal +
                      Cutlery +
                      (deliveryMethod === "express"
                        ? address.expressDeliveryPrice || 0
                        : address.sequentialDeliveryPrice || 0) +
                      (delivarychargetype || 0) -
                      discountWallet -
                      coupon
                    ).toFixed(2)}
                  </p>
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* <Modal show={show} style={{ zIndex: "99999" }}>
        <Modal.Header>
          <Modal.Title>Add Address</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {addresstype === "apartment" ? (
              <select
                value={apartmentname}
                onChange={(e) => getSelectedAddress(e.target.value)}
                className="vi_0 slot"
                style={{
                  color: "black",
                  width: "180px",
                  backgroundColor: "transparent",
                }}
              >
                <option value="" style={{ color: "black" }} className="option">
                  Select Pg/Apartment
                </option>
                {apartmentdata?.map((data, index) => (
                  <option
                    key={index}
                    value={data?.Apartmentname}
                    style={{ color: "black" }}
                    className="option"
                  >
                    {data?.Apartmentname}
                  </option>
                ))}
              </select>
            ) : (
              <select
                value={apartmentname}
                onChange={(e) => getSelectedAddress(e.target.value)}
                className="vi_0 slot"
                style={{
                  color: "black",
                  width: "180px",
                  backgroundColor: "transparent",
                }}
              >
                <option value="" style={{ color: "black" }} className="option">
                  Select Corporate
                </option>
                {corporatedata?.map((data, index) => (
                  <option
                    key={index}
                    value={data?.Apartmentname}
                    style={{ color: "black" }}
                    className="option"
                  >
                    {data?.Apartmentname}
                  </option>
                ))}
              </select>
            )}
            <Form.Control
              type="text"
              placeholder="Enter Full Name"
              style={{ marginTop: "18px" }}
              value={name}
              onChange={(e) => setname(e.target.value)}
            />
            <span style={{ fontSize: "small" }}>
              Note:- For School enter Name & Class/Section
            </span>
            <Form.Control
              type="number"
              placeholder="Enter Phone Number"
              style={{ marginTop: "18px" }}
              value={mobilenumber}
              onChange={(e) => setmobilenumber(e.target.value)}
            />

            {addresstype === "apartment" ? (
              <Form.Control
                type="text"
                value={flat}
                placeholder="Enter Flat No"
                style={{ marginTop: "18px" }}
                onChange={(e) => setFlat(e.target.value)}
              />
            ) : null}
            {addresstype === "apartment" ? (
              <Form.Control
                type="text"
                value={towerName}
                placeholder="Enter tower name"
                style={{ marginTop: "18px" }}
                onChange={(e) => setTowerName(e.target.value)}
              />
            ) : null}

            <Button
              variant=""
              className="modal-add-btn2"
              style={{ width: "100%", marginTop: "24px", textAlign: "center" }}
              onClick={() => Handeledata()}
            >
              Save
            </Button>
          </Form>
        </Modal.Body>
      </Modal> */}
      <Modal
        show={showSecurityModal}
        onHide={() => setShowSecurityModal(false)}
        centered
        dialogClassName="info-modal"
      >
        <Modal.Body>
          <h5>Why here?</h5>
          <p>
            Building policy requires handover at the Security Gate. Our riders
            are not allowed beyond this point.
          </p>
          <button
            className="got-it-btn"
            onClick={() => setShowSecurityModal(false)}
          >
            Got it
          </button>
        </Modal.Body>
      </Modal>

      {/* --- UPDATED FAQ Modal --- */}
      <Modal
        show={showFAQModal}
        onHide={() => setShowFAQModal(false)}
        centered
        dialogClassName="faq-modal-updated" // This class will be reused
      >
        <Modal.Header closeButton className="faq-modal-header">
          <Modal.Title as="h5">
            🍲 Your neighbourhood eats better together 🌿
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="faq-item">
            <p>
              <strong>1. Why this time?</strong>
            </p>
            <p>
              🧑‍🍳 We cook right before lunch and send meals together to you and
              nearby homes. A short, smart route keeps every plate hot and on
              time.
            </p>
          </div>
          <div className="faq-item">
            <p>
              <strong>2. Why routes, not instant delivery?</strong>
            </p>
            <p>
              ♻️ Instant meals are often reheated. We plan our routes so food
              travels less, stays fresh, and reaches your area as one run.
            </p>
          </div>
          <div className="faq-item">
            <p>
              <strong>3. How are you different from other apps?</strong>
            </p>
            <p>
              💚 We make food for daily living, not delivery races. We cook with
              care and pride, the same way we feed our families.
            </p>
          </div>
          <div className="faq-item">
            <p>
              <strong>4. What makes this good for me?</strong>
            </p>
            <p>
              🧑‍🌾 You get meals made nearby, served warm and real, with less
              waste and fewer delivery miles.
            </p>
          </div>
          <div className="faq-item">
            <p>
              <strong>5. What if the rider is late?</strong>
            </p>
            <p>
              ⏰ We respect your time. If your meal reaches after 1 PM, we'll
              credit ₹100 or your order value (whichever is lower) to your
              wallet.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button className="got-it-btn" onClick={() => setShowFAQModal(false)}>
            I'm with you
          </button>
        </Modal.Footer>
      </Modal>

      {/* Modal */}
      {showModal && (
        <div
          className="modal show fade d-block"
          tabIndex="-1"
          role="dialog"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            boxShadow: "1px 0px 4px 0px #00000040",
          }}
        >
          <div
            className="modal-dialog"
            role="document"
            style={{
              maxWidth: window.innerWidth > 768 ? "605px" : "402px", // ✅ Responsive width
              height: "auto",
              margin: "auto",
            }}
          >
            <div
              className="modal-content"
              style={{
                backgroundColor: "#F8F6F0",
                borderRadius: "16px",
                padding: window.innerWidth > 768 ? "30px 40px" : "20px", // ✅ More padding on large screen
              }}
            >
              <p
                style={{
                  fontSize: window.innerWidth > 768 ? "14px" : "13px",
                  marginBottom: "12px",
                  textAlign: "start",
                  color: "#6B6B6B",
                  padding: "15px",
                }}
              >
                <ShieldAlert
                  style={{ width: "13px", height: "13px" }}
                  className="mb-1"
                />{" "}
                Safe & private: details are only used to deliver correctly.
              </p>

              <form onSubmit={handleSubmit}>
                <div
                  className="d-flex flex-column align-items-center mt-2"
                  style={{
                    gap: "12px",
                    backgroundColor: "#FFF8DC",
                    padding: "20px",
                    borderRadius: "12px",
                    border: "0.4px solid #B87333",
                    width: "100%",
                    maxWidth: window.innerWidth > 768 ? "500px" : "354px", // ✅ Keep consistent alignment
                    margin: "0 auto",
                  }}
                >
                  {/* Student Name */}
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Student’s full name *"
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    required
                    style={{
                      width: "100%", // ✅ auto adjusts for both screens
                      height: "44px",
                      borderRadius: "12px",
                      padding: "8px 16px",
                      border: "0.4px solid #6B8E23",
                    }}
                  />

                  {/* Class and Section Row */}
                  <div
                    className="d-flex justify-content-between"
                    style={{
                      width: "100%", // ✅ uniform width for both inputs
                      gap: "12px",
                    }}
                  >
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Class/ Room number *"
                      value={childClass}
                      onChange={(e) => setChildClass(e.target.value)}
                      required
                      style={{
                        flex: 1, // ✅ both inputs share space evenly
                        height: "44px",
                        borderRadius: "12px",
                        padding: "8px 16px",
                        border: "0.4px solid #6B8E23",
                      }}
                    />
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Section *"
                      value={childSection}
                      onChange={(e) => setChildSection(e.target.value)}
                      required
                      style={{
                        flex: 1,
                        height: "44px",
                        borderRadius: "12px",
                        padding: "8px 16px",
                        border: "0.4px solid #6B8E23",
                      }}
                    />
                  </div>
                </div>

                {/* Footer Buttons */}
                <div
                  className="d-flex justify-content-between align-items-center mt-4"
                  style={{
                    padding: window.innerWidth > 768 ? "0 15px" : "0 10px",
                  }}
                >
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setShowModal(false)}
                    style={{
                      backgroundColor: "transparent",
                      border: "1px solid #d5c5b0",
                      borderRadius: "12px",
                      width: window.innerWidth > 768 ? "160px" : "120px",
                      height: "48px",
                      fontWeight: "600",
                      textAlign: "center",
                    }}
                  >
                    Cancel <img src={cross} alt="" />
                  </button>

                  <button
                    type="submit"
                    className="btn"
                    style={{
                      backgroundColor:
                        childName && childClass && childSection
                          ? "#E6B800"
                          : "#C0C0C0",
                      borderRadius: "12px",
                      textAlign: "center",
                      width: window.innerWidth > 768 ? "200px" : "160px",
                      height: "48px",
                      fontWeight: "600",
                      color:
                        childName && childClass && childSection
                          ? "black"
                          : "black",
                      cursor:
                        childName && childClass && childSection
                          ? "pointer"
                          : "not-allowed",
                    }}
                    disabled={!childName || !childClass || !childSection}
                  >
                    Save Address{" "}
                    <CircleCheck style={{ width: "17px", height: "17px" }} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      <LocationModal
        show={showLocationModal}
        onClose={() => setShowLocationModal(false)}
      />
    </div>
  );
};

export default Checkout;
