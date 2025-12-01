// front/src/Pages/MyPlan.jsx (or wherever this file is)

import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button, Modal } from "react-bootstrap";
import name from "./../assets/successGroup.png";
import myplanlocation from "./../assets/myplanlocation.png";
import myplancalender from "./../assets/myplancalender.png";
import IsNonVeg from "./../assets/isVeg=no.svg";
import IsVeg from "./../assets/isVeg=yes.svg";
import myplancancelicon from "./../assets/myplancancelicon.png";
// import myplandrop from "./../assets/myplandrop.png";
import myplanseparator from "./../assets/myplanseparator.png";
import myplanskip from "./../assets/myplanskip.png";
import myplancancel2 from "./../assets/myplancancelicon.png";
// import myplanblackedit from "./../assets/myplanblackedit.png";

import "../Styles/MyPlan.css";

const formatDate = (isoString) => {
  const d = new Date(isoString);
  return `${d.getDate().toString().padStart(2, "0")} ${d.toLocaleString(
    "en-US",
    { month: "short" }
  )}`;
};

const formatDay = (isoString) => {
  return new Date(isoString)
    .toLocaleString("en-US", { weekday: "short" })
    .toUpperCase();
};

const ViewPlanModal = ({
  isOpen,
  onClose,
  plan,
  userId,
  onPlanUpdated,
  handlePayPlan,
  handleTrackOrder,
}) => {
  const navigate = useNavigate();
  const [localPlan, setLocalPlan] = useState(plan);
  console.log("Viewing plan:", plan);

  const [deliveryNotes, setDeliveryNotes] = useState(plan.deliveryNotes || "");
  useEffect(() => {
    setLocalPlan(plan);
    // setDeliveryNotes(plan.deliveryNotes || "");
  }, [plan]);

  const isEditable =
    localPlan.status === "Pending Payment" &&
    new Date() < new Date(localPlan.paymentDeadline);

  async function changeQuantity(foodItemId, delta) {
    if (!isEditable) return;

    const product = localPlan.products.find(
      (p) => p.foodItemId === foodItemId || p.foodItemId?._id === foodItemId
    );
    if (!product) return;

    const newQty = (product.quantity || 0) + delta;
    if (newQty < 0) return;

    try {
      const res = await axios.post(
        "http://localhost:7013/api/user/plan/update-product",
        {
          planId: localPlan._id,
          foodItemId:
            typeof product.foodItemId === "string"
              ? product.foodItemId
              : product.foodItemId?._id,
          quantity: newQty,
        }
      );

      if (res.data.success) {
        const updatedPlan = res.data.data;
        setLocalPlan(updatedPlan);
        // also inform parent to refresh main list if needed
        onPlanUpdated && onPlanUpdated();
      } else {
        alert(res.data.error || "Failed to update quantity");
      }
    } catch (e) {
      alert(e.response?.data?.error || "Failed to update quantity");
    }
  }
  // Find this function in MyPlan.jsx
  const handleAddMore = () => {
    // We need to find the plan to get its address details
    // Since this function is called inside the modal (ViewPlanModal), 'localPlan' or 'plan' is available

    // If this is inside ViewPlanModal component:
    const targetAddress = {
      // We reconstruct the address object structure your Home/LocationModal expects
      addressType: localPlan.addressType,
      fullAddress: localPlan.delivarylocation,
      hubId: localPlan.hubId,
      location: { coordinates: localPlan.coordinates?.coordinates },
      // Add any other fields your Home.jsx needs to "setAddress" correctly
      studentInformation: {
        studentName: localPlan.studentName,
        studentClass: localPlan.studentClass,
        studentSection: localPlan.studentSection,
      },
    };

    navigate("/home", {
      state: {
        targetDate: localPlan.deliveryDate,
        targetSession: localPlan.session,
        overrideAddress: targetAddress, // <--- PASSING THE ADDRESS
      },
    });
  };
  const [isBillingOpen, setIsBillingOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !localPlan) return null;

  const toggleBillingDetails = () => setIsBillingOpen((p) => !p);

  const now = new Date();
  const deadline = new Date(localPlan.paymentDeadline);

  const isBeforeDeadline = now < deadline;
  const isUnpaidEditable =
    localPlan.status === "Pending Payment" && isBeforeDeadline;
  const isPaidEditable = localPlan.status === "Confirmed" && isBeforeDeadline;
  const isPaidLocked = localPlan.status === "Confirmed" && !isBeforeDeadline;

  const getTimeRemainingToDeadline = () => {
    const diff = deadline - now;
    if (diff <= 0) return { days: 0, hours: 0 };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return { days, hours };
  };

  const { days, hours } = getTimeRemainingToDeadline();

  const handleSkipOrCancel = async () => {
    try {
      setLoading(true);
      await axios.post("http://localhost:7013/api/user/plan/skip-cancel", {
        planId: plan._id,
        userId,
      });
      onPlanUpdated && onPlanUpdated();
      onClose();
    } catch (err) {
      alert(err?.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handlePay = () => {
    // You can replace with your actual checkout navigation
    // For example: navigate("/checkout", { state: { selectedPlanIds: [plan._id] } })
    onPlanUpdated && onPlanUpdated("pay", plan);
  };

  return (
    <div className="plan-modal-overlay" onClick={onClose}>
      <div className="close-button-container">
        <button onClick={onClose} className="close-modal-btn">
          <img src={myplancancel2} alt="" style={{ width: 24 }} />
        </button>
      </div>

      <div className="view-plan-top">
        <div className="view-plan-time">
          {formatDate(localPlan.deliveryDate)}{" "}
          {formatDay(localPlan.deliveryDate)}
        </div>
        <div className="reminder-banner">
          {localPlan.status === "Pending Payment" && isBeforeDeadline && (
            <>
              Confirm plan within {days} days, {hours} hours
            </>
          )}
        </div>
      </div>
      <div
        className="plan-modal-content"
        onClick={(e) => {
          e.stopPropagation();
        }}
        style={
          localPlan.status === "Pending Payment" && isBeforeDeadline
            ? {
                borderTopRightRadius: 0,
              }
            : {}
        }
      >
        {/* Header */}
        <div className="modal-header-section">
          <div className="plan-header">
            <div className="plan-session-info">
              <h3 className="session-title">{localPlan.session}</h3>
              <div className="delivery-time-text">
                {/* static for now; optionally store slot time in DB later */}
                Arrives fresh between 12:00 to 01:00PM
              </div>
            </div>
            {localPlan.status === "Confirmed" && (
              <div className="status-badge-confirmed">✓ Confirmed</div>
            )}
            {localPlan.status === "Skipped" && (
              <div className="status-badge-skipped">Skipped</div>
            )}
            {localPlan.status === "Cancelled" && (
              <div className="status-badge-canceled">Cancelled</div>
            )}
            {localPlan.status === "Pending Payment" && (
              <div className="status-badge-pending">Pending</div>
            )}
          </div>
        </div>

        {/* Products list */}
        <div className="checkoutcontainer">
          <div className="cart-container">
            <div className="plans-item-section">
              <div className="plans-item-content">
                {/* Header row */}
                {/* <div className="cart-header"> */}
                {/* <div className="header-content"> */}
                <div className="plan-item-header">
                  <div className="header-title">
                    <div className="title-text">
                      <div className="title-label">From Kitchen</div>
                    </div>
                  </div>
                  <div className="header-right">
                    <div className="qty-header">
                      <div className="qty-text">
                        <div className="title-label">Qty</div>
                      </div>
                    </div>
                    <div className="price-text">
                      <div className="title-label">Price</div>
                    </div>
                  </div>
                </div>
                {/* </div> */}
                {/* </div> */}

                {(localPlan.products || []).map((product, index) => (
                  <div className="plan-item" key={product._id || index}>
                    {/* <div className="plan-item-content"> */}
                    <div className="plan-item-details">
                      <div className="plan-left-left">
                        {index + 1}.
                        <img
                          src={
                            product?.foodCategory === "Veg" ? IsVeg : IsNonVeg
                          }
                          alt="type"
                          className="indicator-icon"
                        />
                      </div>
                      <div className="plan-left-right">
                        <div className="plan-item-name">
                          {/* <div className="item-name-text"> */}
                          {product.foodName}
                          {/* </div> */}
                        </div>
                        {/* <div className="item-tags"> */}
                        <div className="portion-tag">
                          {/* <div className="portion-text"> */}
                          <div className="plan-portion-label">
                            {product.quantity} Portion
                            {product.quantity > 1 ? "s" : ""}
                          </div>
                          {/* </div> */}
                        </div>
                      </div>
                      {/* </div> */}
                    </div>
                    <div className="plan-item-controls">
                      {/* qty +/- disabled for now; can be wired to updatePlanProduct API */}
                      <div className="quantity-control">
                        <div className="quantity-control">
                          <button
                            className="quantity-btn"
                            disabled={!isEditable}
                            onClick={() =>
                              changeQuantity(
                                product.foodItemId?.toString?.() ||
                                  product.foodItemId,
                                -1
                              )
                            }
                          >
                            <div className="btn-text">-</div>
                          </button>
                          <div className="quantity-display">
                            <div className="quantity-text">
                              {product.quantity}
                            </div>
                          </div>
                          <button
                            className="quantity-btn"
                            disabled={!isEditable}
                            onClick={() =>
                              changeQuantity(
                                product.foodItemId?.toString?.() ||
                                  product.foodItemId,
                                1
                              )
                            }
                          >
                            <div className="btn-text">+</div>
                          </button>
                        </div>
                      </div>
                      <div className="price-container vertical">
                        <div className="plan-current-price">
                          <div className="plan-current-currency">
                            <div className="current-currency-text">₹</div>
                          </div>
                          <div className="plan-current-amount">
                            <div className="current-amount-text">
                              {product.totalPrice?.toFixed(0)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* </div> */}
                  </div>
                ))}

                {/* Total row */}
                <div className="plan-cart-footer">
                  <div className="add-more-section">
                    <div className="plan-add-more-btn">
                      {/* <div className="add-more-content"> */}
                      {/* <div className="add-more-text-container"> */}
                      {/* you can wire this to "add more items for this slot" */}
                      <span className="add-more-label" onClick={handleAddMore}>
                        Add More
                      </span>
                      {/* </div> */}
                      {/* </div> */}
                    </div>
                  </div>
                  <div className="plan-total-container">
 <div className="plan-total-section">
                    <div className="total-label-container">
                      <div className="total-label">Total</div>
                    </div>
                    <div className="total-price-section">
                      <div className="current-currency">
                        <div className="current-currency-text">₹</div>
                      </div>
                      <div className="current-amount">
                        <div className="current-amount-text">
                          {localPlan.slotTotalAmount?.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                  </div>
                 
                </div>
              </div>
            </div>

            {/* Delivery Details */}

            <div className="plan-delivery-details-container">
              {/* --- Address Row --- */}
              <div className="plan-delivery-details-row">
                {/* Icon */}
                <div className="delivery-icon-wrapper">
                  <img
                    style={{
                      filter:
                        "invert(40%) sepia(88%) saturate(390%) hue-rotate(36deg) brightness(94%) contrast(89%)",
                    }}
                    // You might need to import this image or check if the path is correct
                    src="/Assets/selectlocation.svg"
                    alt="Location"
                    className="delivery-icon"
                  />
                </div>

                {/* Content */}
                <div className="plan-delivery-content-wrapper">
                  {/* 1. Location Name (e.g. Work, Home, School Name) */}
                  <p
                    className="text-truncate plan-location-name"
                    style={{ maxWidth: "220px", color: "black" }}
                    title={
                      localPlan?.addressType === "Home"
                        ? localPlan?.homeName || "Home"
                        : localPlan?.addressType === "PG"
                        ? localPlan?.apartmentName || "PG"
                        : localPlan?.addressType === "School"
                        ? localPlan?.schoolName || "School"
                        : localPlan?.addressType === "Work" ||
                          localPlan?.addressType === "corporate"
                        ? localPlan?.companyName
                        : localPlan?.addressType || "Delivery Location"
                    }
                  >
                    {localPlan?.addressType === "Home"
                      ? localPlan?.homeName || "Home"
                      : localPlan?.addressType === "PG"
                      ? localPlan?.apartmentName || "PG"
                      : localPlan?.addressType === "School"
                      ? localPlan?.schoolName || "School"
                      : localPlan?.addressType === "Work" ||
                        localPlan?.addressType === "corporate"
                      ? localPlan?.companyName
                      : localPlan?.addressType || "Delivery Location"}
                  </p>

                  {/* 2. Full Address */}
                  <p
                    className="text-truncate plan-full-address"
                    style={{
                      maxWidth: "280px",
                      color: "black",
                    }}
                    title={localPlan?.delivarylocation}
                  >
                    {localPlan?.delivarylocation || ""}
                  </p>

                  {/* 3. User Name & Mobile */}
                  <div className="plan-user-mobile" data-text-role="Caption">
                    <div className="user-detailss mt-1">
                      {localPlan?.username} | {localPlan?.mobileNumber}
                    </div>
                  </div>

                  {/* 4. Student Details (Only shows if School or student data exists) */}
                  {(localPlan?.addressType === "School" ||
                    localPlan?.studentName) && (
                    <div className="caption-section" data-text-role="Caption">
                      <div className="user-detailss mt-1">
                        {localPlan?.studentName}
                        {localPlan?.studentClass
                          ? ` | Class - ${localPlan.studentClass}`
                          : ""}
                        {localPlan?.studentSection
                          ? ` | Section - ${localPlan.studentSection}`
                          : ""}
                      </div>
                    </div>
                  )}
                </div>

                {/* Change Button */}
                <div className="change-button">
                  <div className="change-icon">
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
                        strokeWidth="0.2"
                      />
                    </svg>
                  </div>
                  <div className="change-badge" data-text-role="Badge/Chip">
                    <div className="change-text">
                      <span
                        // If you don't have setShowLocationModal, change this to: onClick={() => {}}
                        onClick={() => {}}
                        style={{ cursor: "pointer" }}
                      >
                        Change
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <img className="separator-line" src={myplanseparator} alt="" />

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
                <div className="plan-delivery-content-wrapper">
                  <input
                    type="text"
                    className="delivery-notes-input"
                    placeholder="Enter any notes for delivery"
                    // Mapped to your existing state logic from the old code
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer-actions">
          {isUnpaidEditable && (
            <>
              <button
                className="skip-btn"
                onClick={handleSkipOrCancel}
                disabled={loading}
              >
                Skip Order
                <img
                  src={myplanskip}
                  alt=""
                  style={{ marginLeft: 6, width: 16 }}
                />
              </button>
              <button
                className="confirm-pay-btn"
                // className="pay-btn"
                onClick={() => handlePayPlan(localPlan, deliveryNotes)}
                disabled={loading}
              >
                Confirm & Pay
                <span className="pay-amount-badge">
                  ₹{localPlan.slotTotalAmount?.toFixed(2)}
                </span>
              </button>
            </>
          )}

          {isPaidEditable && (
            <button
              className="skip-btn"
              onClick={handleSkipOrCancel}
              disabled={loading}
            >
              Cancel Order
              <img
                src={myplancancelicon}
                alt=""
                style={{ marginLeft: 6, width: 16 }}
              />
            </button>
          )}
          {isPaidLocked && (
            <button
              className="track-order-btn"
              onClick={() => handleTrackOrder(plan)}
            >
              <span> Track Order</span>

              <img
                style={{
                  scale: "0.8",
                }}
                src="/Assets/tracker.svg"
                alt=""
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const MyPlan = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("today");
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trackModalVisible, setTrackModalVisible] = useState(false);
  const [currentTrackedOrder, setCurrentTrackedOrder] = useState(null);
  // TODO: wire this to your auth/user context
  // parse stored user once so we can access properties safely
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch (e) {
    user = null;
  }
  const userId = user ? user._id : null;
  // console.log('UW3MR',JSON.stringify(userId))

  const fetchPlans = async () => {
    if (!userId) return;
    try {
      const res = await axios.get(
        `http://localhost:7013/api/user/plan/get-plan/${userId}`
      );
      if (res.data.success) setPlans(res.data.data || []);
    } catch (err) {
      console.error("fetch plans error", err);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [userId]);

  // categorize plans
  const categorizedOrders = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    const todayOrders = [];
    const tomorrowOrders = [];
    const upcomingOrders = [];

    plans.forEach((plan) => {
      const d = new Date(plan.deliveryDate);
      d.setHours(0, 0, 0, 0);
      if (d.getTime() === today.getTime()) todayOrders.push(plan);
      else if (d.getTime() === tomorrow.getTime()) tomorrowOrders.push(plan);
      else if (d >= dayAfterTomorrow) upcomingOrders.push(plan);
    });

    return { todayOrders, tomorrowOrders, upcomingOrders };
  }, [plans]);

  const getCurrentTabOrders = () => {
    switch (selectedTab) {
      case "today":
        return categorizedOrders.todayOrders;
      case "tomorrow":
        return categorizedOrders.tomorrowOrders;
      case "upcoming":
        return categorizedOrders.upcomingOrders;
      default:
        return [];
    }
  };

  const getTimeRemaining = (deadlineStr) => {
    const deadline = new Date(deadlineStr);
    const now = new Date();
    const diff = deadline - now;
    if (diff <= 0) return { days: 0, hours: 0 };
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return { days, hours };
  };

  const handleViewPlan = (plan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };
  async function handleTrackOrder(plan) {
    if (!plan.orderId) return;
    try {
      const res = await axios.get(
        `http://localhost:7013/api/admin/getOrderByOrderId/${plan.orderId}`
      );
      if (res.data.success) {
        const order = res.data.data;

        // map API order to the shape your modal logic expects
        const items = (order.allProduct || []).map((p) => ({
          name: p.name,
          quantity: p.quantity,
        }));
        const total = order.subTotal || 0;
        const rawStatus = order.status || order.orderstatus || "Cooking";
        const orderId = order.orderid || order._id;
        const deliveryDate = new Date(order.deliveryDate);
        const session = order.session;

        // simple ETA string; you can refine as needed
        const eta =
          deliveryDate.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          }) + ` (${session})`;

        setCurrentTrackedOrder({ items, total, rawStatus, orderId, eta });
        setTrackModalVisible(true);
      } else {
        alert(res.data.message || "Failed to fetch order details");
      }
    } catch (err) {
      console.error("track order error", err);
      alert("Failed to fetch order details");
    }
  }
  const closeModal = () => {
    setSelectedPlan(null);
    setIsModalOpen(false);
  };

  const onPlanUpdated = () => {
    fetchPlans();
  };

  const getTabDateDisplay = (tabName) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    switch (tabName) {
      case "today":
        return {
          date: formatDate(today.toISOString()),
          day: formatDay(today.toISOString()),
        };
      case "tomorrow":
        return {
          date: formatDate(tomorrow.toISOString()),
          day: formatDay(tomorrow.toISOString()),
        };
      case "upcoming":
        return {
          date: formatDate(dayAfterTomorrow.toISOString()),
          day: formatDay(dayAfterTomorrow.toISOString()),
        };
      default:
        return { date: "", day: "" };
    }
  };

  const currentTabOrders = getCurrentTabOrders();
  const mobile = user?.Mobile;
  const username = user?.Fname;

  async function handlePayPlan(plan, deliveryNotes = "") {
    try {
      const amount = plan.slotTotalAmount; // single plan only

      const configObj = {
        method: "post",
        baseURL: "http://localhost:7013/api/",
        url: "/user/plan/create-from-plan",
        headers: { "content-type": "application/json" },
        data: {
          userId,
          planId: plan._id,
          // optional discounts:
          discountWallet: 0,
          coupon: 0,
          // couponId: null,
          // companyId: null,
          // companyName: "Normal User",
          // customerType: "Individual",
          studentName: plan.studentName,
          studentClass: plan.studentClass,
          studentSection: plan.studentSection,
          addressType: plan.addressType,
          coordinates: plan.coordinates,
          hubName: plan?.hubName, // if you have
          username: username,
          mobile: mobile,
          deliveryNotes: deliveryNotes,
        },
      };
      const config1 = {
        url: "/user/addpaymentphonepay",
        method: "post",
        baseURL: "http://localhost:7013/api/",
        headers: { "content-type": "application/json" },
        data: {
          userId,
          username,
          Mobile: mobile,
          amount,
          transactionid: null, // or generate
          orderId: plan._id, // optional for reference
          config: JSON.stringify(configObj),
          cartId: null,
          offerconfig: null,
          cart_id: null,
        },
      };

      const res = await axios(configObj);
      const redirectInfo = res.data?.url;
      if (redirectInfo?.url) {
        window.location.href = redirectInfo.url;
      } else if (redirectInfo?.redirectUrl) {
        window.location.href = redirectInfo.redirectUrl;
      }
    } catch (err) {
      console.error("pay plan error", err);
      alert("Failed to start payment");
    }
  }
  return (
    <div className="my-plan-container mainbg">
      <div className="checkoutcontainer">
        {/* Header */}
        <div className="mobile-banner-updated">
          <div className="screen-checkout mb-2 checkout-header">
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
            <h3 className="checkout-title">My Plans</h3>
            <div style={{ width: 36 }}></div>
          </div>
        </div>

        {/* Tabs */}
        <div className="myplan-mid-section">
 <div className="tabs-container">
          {["today", "tomorrow", "upcoming"].map((tab) => {
            const isActive = selectedTab === tab;
            const display = getTabDateDisplay(tab);
            const label = tab.charAt(0).toUpperCase() + tab.slice(1);
            return (
              <div
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`tab-btn ${isActive ? "active" : ""}`}
              >
                {/* <div className="tab-btn-content">
                  <span>{display.date}</span>
                  <div className="tab-divider" />
                  <span>{display.day}</span>
                </div>
                <div className="tab-line" /> */}
                <h1 className={`tab-label ${isActive ? "active" : ""}`}>
                  {label}
                </h1>
              </div>
            );
          })}
        </div>

        {/* Cards */}
        <div className="plans-list">
          {currentTabOrders.length === 0 ? (
            <div className="no-plans-text">No plans for this day yet</div>
          ) : (
            currentTabOrders.map((plan) => {
              const { days, hours } = getTimeRemaining(plan.paymentDeadline);
              const now = new Date();
              const deadline = new Date(plan.paymentDeadline);
              const isBeforeDeadline = now < deadline;

              const isUnpaidEditable =
                plan.status === "Pending Payment" && isBeforeDeadline;

              const isPaidEditable =
                plan.status === "Confirmed" && isBeforeDeadline;
              const isPaidLocked =
                plan.status === "Confirmed" && !isBeforeDeadline;

              {
                /* const isConfirmed = plan.status === "Confirmed"; */
              }

              return (
                <>
                  {isUnpaidEditable && (
                    <div className="reminder-banner">
                      Confirm plan within {days} days, {hours} hours
                    </div>
                  )}
                  <div
                    key={plan._id}
                    className="plan-card"
                    style={
                      isUnpaidEditable
                        ? {
                            borderTopRightRadius: 0,
                          }
                        : {}
                    }
                  >
                    {/* reminder for unpaid before cutoff */}

                    <div className="plan-header">
                      <div className="plan-session-info">
                        <h3 className="session-title">{plan.session}</h3>
                        <div className="delivery-time-text">
                          {/* static for now; optionally store slot time in DB later */}
                          Arrives fresh between 12:00 to 01:00PM
                        </div>
                      </div>
                      {plan.status === "Confirmed" && (
                        <div className="status-badge-confirmed">
                          ✓ Confirmed
                        </div>
                      )}
                      {plan.status === "Skipped" && (
                        <div className="status-badge-skipped">Skipped</div>
                      )}
                      {plan.status === "Cancelled" && (
                        <div className="status-badge-canceled">Cancelled</div>
                      )}
                    </div>

                    <div className="location-row">
                      <img
                        src={myplanlocation}
                        alt=""
                        style={{ width: 16, height: 16 }}
                      />
                      <div className="location-text">
                        <h1 className="addressLine1">
                          {plan?.addressType === "Home"
                            ? plan?.homeName || "Home"
                            : plan?.addressType === "PG"
                            ? plan?.apartmentName || "PG"
                            : plan?.addressType === "School"
                            ? plan?.schoolName || "School"
                            : plan?.addressType === "Company"
                            ? plan?.companyName || "Company"
                            : "Unknown"}
                        </h1>
                        <p className="addressLine2 text-truncate">
                          {plan.delivarylocation}
                        </p>
                      </div>
                    </div>

                    <div className="card-actions">
                      <div className="view-plan-btn-container">
                        <button
                          onClick={() => handleViewPlan(plan)}
                          className="view-plan-btn"
                        >
                          <span>View Plan</span>

                          <img
                            src={myplancalender}
                            alt=""
                            style={{ width: 18 }}
                          />
                        </button>
                      </div>

                      {isUnpaidEditable && (
                        <button
                          className="pay-btn"
                          onClick={() => handlePayPlan(plan)}
                        >
                          Pay
                          <span className="price-pill">
                            ₹{plan.slotTotalAmount?.toFixed(2)}
                          </span>
                        </button>
                      )}

                      {isPaidEditable && (
                        <button
                          className="btn-base btn-primary"
                          onClick={async () => {
                            await axios.post(
                              "http://localhost:7013/api/user/plan/skip-cancel",
                              {
                                planId: plan._id,
                                userId,
                              }
                            );
                            fetchPlans();
                          }}
                        >
                          Cancel
                        </button>
                      )}
                      {/* {true && ( */}
                      {isPaidLocked && (
                        <button
                          className="track-order-btn"
                          onClick={() => handleTrackOrder(plan)}
                        >
                          <span> Track Order</span>

                          <img
                            style={{
                              scale: "0.8",
                            }}
                            src="/Assets/tracker.svg"
                            alt=""
                          />
                        </button>
                      )}
                    </div>
                  </div>
                </>
              );
            })
          )}
        </div>
        </div>
       
      </div>

      {selectedPlan && (
        <ViewPlanModal
          isOpen={isModalOpen}
          onClose={closeModal}
          plan={selectedPlan}
          userId={userId}
          onPlanUpdated={onPlanUpdated}
          handlePayPlan={handlePayPlan}
          handleTrackOrder={handleTrackOrder}
        />
      )}

      <Modal
        className="tarck-order"
        show={trackModalVisible}
        onHide={() => {
          setTrackModalVisible(false);
          setCurrentTrackedOrder(null);
        }}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Tracking your meal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentTrackedOrder &&
            (() => {
              const progressSteps = [
                "Cooking",
                "Packing",
                "Ontheway",
                "Delivered",
              ];
              const statusMap = { inprocess: "Cooking" };
              const currentStatus =
                statusMap[currentTrackedOrder.rawStatus] ||
                currentTrackedOrder.rawStatus;
              const currentStatusIndex = progressSteps.indexOf(currentStatus);

              // (If not found, fallback to first step)
              const displayStatus =
                progressSteps[currentStatusIndex] || progressSteps[0];

              const totalItems = (currentTrackedOrder.items || []).reduce(
                (acc, item) => acc + (item.quantity || 0),
                0
              );

              const getStepIconStyle = (stepIndex) => ({
                backgroundColor:
                  currentStatusIndex >= stepIndex ? "#6B8E23" : "#FFFFFF",
              });
              const getIconFill = (stepIndex) =>
                currentStatusIndex >= stepIndex ? "#FFFFFF" : "#2C2C2C";
              const getConnectorFill = (stepIndex) =>
                currentStatusIndex >= stepIndex ? "#6B8E23" : "#C0C0C0";

              return (
                <div className="card" style={{ paddingTop: 10 }}>
                  <div className="trackingTopRow">
                    <div>
                      <div className="detailsorder" style={{ fontWeight: 700 }}>
                        ORDER ID : <span>{currentTrackedOrder.orderId}</span>
                      </div>
                      <div className="detailsorder" style={{ color: "#888" }}>
                        Summary: {totalItems} items, ₹
                        {currentTrackedOrder.total}
                      </div>
                      <div className="detailsorder" style={{ marginTop: 5 }}>
                        Status: <b>{displayStatus}</b>
                      </div>
                    </div>
                    {/* Help link if needed */}
                  </div>
                  {/* Progress bar as in your UI */}
                  <div className="progressRow">
                    {/* Step 1: In the Kitchen */}
                    <div className="stepContainer">
                      <div
                        className="stepIconCircle"
                        style={getStepIconStyle(0)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="32"
                          height="30"
                          viewBox="0 0 32 30"
                          fill="none"
                        >
                          <path
                            d="M1 12H31M11.5 3V6M19 1.5V6M26.5 3V6M29.5 24V12H8.5V24C8.5 25.1935 8.97411 26.3381 9.81802 27.182C10.6619 28.0259 11.8065 28.5 13 28.5H25C26.1935 28.5 27.3381 28.0259 28.182 27.182C29.0259 26.3381 29.5 25.1935 29.5 24Z"
                            stroke={getIconFill(0)}
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <div className="stepLabel">In the Kitchen</div>
                    </div>
                    <div className="stepConnector">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="37"
                        height="10"
                        viewBox="0 0 37 10"
                        fill="none"
                      >
                        <path
                          d="M7 4.3L0 0.958548V9.04145L7 5.7V4.3ZM36 5.7C36.3866 5.7 36.7 5.3866 36.7 5C36.7 4.6134 36.3866 4.3 36 4.3V5V5.7ZM6.3 5V5.7H36V5V4.3H6.3V5Z"
                          fill={getConnectorFill(1)}
                        />
                      </svg>
                    </div>
                    {/* Step 2: Packing */}
                    <div className="stepContainer">
                      <div
                        className="stepIconCircle"
                        style={getStepIconStyle(1)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="32"
                          height="30"
                          viewBox="0 0 32 30"
                          fill="none"
                        >
                          <path
                            d="M6.09995 4.2001C6.09995 3.24532 6.47924 2.32964 7.15437 1.65451C7.8295 0.979382 8.74517 0.600098 9.69995 0.600098H22.3C23.2547 0.600098 24.1704 0.979382 24.8455 1.65451C25.5207 2.32964 25.9 3.24532 25.9 4.2001V16.8001H31.3V20.4001C31.3 21.8323 30.731 23.2058 29.7183 24.2185C28.7056 25.2312 27.3321 25.8001 25.9 25.8001H16.9V24.0001H24.1V4.2001C24.1 3.72271 23.9103 3.26487 23.5727 2.92731C23.2352 2.58974 22.7773 2.4001 22.3 2.4001H9.69995C9.22256 2.4001 8.76473 2.58974 8.42716 2.92731C8.08959 3.26487 7.89995 3.72271 7.89995 4.2001V9.9079C7.32178 9.70385 6.71307 9.59977 6.09995 9.6001V4.2001ZM19.6 13.2001H14.794C14.5584 12.5361 14.1952 11.9246 13.7248 11.4001H19.6C19.8386 11.4001 20.0676 11.4949 20.2363 11.6637C20.4051 11.8325 20.5 12.0614 20.5 12.3001C20.5 12.5388 20.4051 12.7677 20.2363 12.9365C20.0676 13.1053 19.8386 13.2001 19.6 13.2001ZM25.9 18.6001V24.0001C26.8547 24.0001 27.7704 23.6208 28.4455 22.9457C29.1207 22.2706 29.5 21.3549 29.5 20.4001V18.6001H25.9ZM11.5 6.9001C11.5 6.6614 11.5948 6.43248 11.7636 6.2637C11.9323 6.09492 12.1613 6.0001 12.4 6.0001H19.6C19.8386 6.0001 20.0676 6.09492 20.2363 6.2637C20.4051 6.43248 20.5 6.6614 20.5 6.9001C20.5 7.13879 20.4051 7.36771 20.2363 7.53649C20.0676 7.70528 19.8386 7.8001 19.6 7.8001H12.4C12.1613 7.8001 11.9323 7.70528 11.7636 7.53649C11.5948 7.36771 11.5 7.13879 11.5 6.9001ZM6.09995 11.4001C6.75515 11.4001 7.37075 11.5747 7.89995 11.8825C8.44721 11.5665 9.068 11.4002 9.69993 11.4002C10.3319 11.4002 10.9526 11.5665 11.4999 11.8825C12.0472 12.1984 12.5016 12.6529 12.8176 13.2001C13.1336 13.7474 13.2999 14.3682 13.3 15.0001V16.8001H14.2C14.4386 16.8001 14.6676 16.8949 14.8363 17.0637C15.0051 17.2325 15.1 17.4614 15.1 17.7001V25.8001C15.1 26.7549 14.7207 27.6706 14.0455 28.3457C13.3704 29.0208 12.4547 29.4001 11.5 29.4001H4.29995C3.34517 29.4001 2.4295 29.0208 1.75437 28.3457C1.07924 27.6706 0.699951 26.7549 0.699951 25.8001V17.7001C0.699951 17.4614 0.794772 17.2325 0.963555 17.0637C1.13234 16.8949 1.36126 16.8001 1.59995 16.8001H2.49995V15.0001C2.49995 14.0453 2.87924 13.1296 3.55437 12.4545C4.2295 11.7794 5.14517 11.4001 6.09995 11.4001ZM7.89995 16.8001V15.0001C7.89995 14.5227 7.71031 14.0649 7.37274 13.7273C7.03518 13.3897 6.57734 13.2001 6.09995 13.2001C5.62256 13.2001 5.16472 13.3897 4.82716 13.7273C4.48959 14.0649 4.29995 14.5227 4.29995 15.0001V16.8001H7.89995ZM9.24995 13.2559C9.53795 13.7725 9.69995 14.3683 9.69995 15.0001V16.8001H11.5V15.0001C11.5002 14.7253 11.4374 14.454 11.3166 14.2072C11.1957 13.9604 11.02 13.7445 10.8028 13.5761C10.5856 13.4078 10.3327 13.2913 10.0635 13.2358C9.79435 13.1803 9.51605 13.1872 9.24995 13.2559Z"
                            fill={getIconFill(1)}
                          />
                        </svg>
                      </div>
                      <div className="stepLabel">Packing Responsibly</div>
                    </div>
                    <div className="stepConnector">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="37"
                        height="10"
                        viewBox="0 0 37 10"
                        fill="none"
                      >
                        <path
                          d="M7 4.3L0 0.958548V9.04145L7 5.7V4.3ZM36 5.7C36.3866 5.7 36.7 5.3866 36.7 5C36.7 4.6134 36.3866 4.3 36 4.3V5V5.7ZM6.3 5V5.7H36V5V4.3H6.3V5Z"
                          fill={getConnectorFill(2)}
                        />
                      </svg>
                    </div>
                    {/* Step 3: On our way */}
                    <div className="stepContainer">
                      <div
                        className="stepIconCircle"
                        style={getStepIconStyle(2)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="22"
                          viewBox="0 0 16 22"
                        >
                          <path
                            d="M8.20612 0.199951C4.05136 0.199951 0.646118 3.59475 0.646118 7.73835C0.646118 9.34395 1.15876 10.8362 2.02672 12.0627L7.2838 21.1505C8.02 22.1124 8.5096 21.9299 9.12196 21.1001L14.9201 11.2325C15.0371 11.0201 15.1289 10.7948 15.2092 10.5644C15.5769 9.66753 15.766 8.7076 15.7661 7.73835C15.7661 3.59475 12.362 0.199951 8.20612 0.199951ZM8.20612 3.73227C10.4439 3.73227 12.2237 5.50743 12.2237 7.73871C12.2237 9.96999 10.4435 11.7444 8.20612 11.7444C5.96872 11.7444 4.18852 9.96963 4.18852 7.73871C4.18852 5.50779 5.96908 3.73227 8.20612 3.73227Z"
                            fill={getIconFill(2)}
                          />
                        </svg>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="27"
                          height="24"
                          viewBox="0 0 27 24"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M25.7786 0.76001C24.9696 0.77801 24.1586 0.81221 23.346 0.87233L23.4713 2.86385C24.2518 2.80727 25.0336 2.7709 25.816 2.75477L25.7786 0.76001ZM21.4676 1.05521C20.2184 1.21037 18.9584 1.43141 17.7128 1.78673L18.1818 3.71669C19.3137 3.39413 20.4866 3.18569 21.6778 3.03773L21.4676 1.05521ZM15.8476 2.45489C15.4744 2.61961 15.113 2.81003 14.7662 3.02477L14.7647 3.02657L14.7626 3.02729C14.2676 3.33905 13.7459 3.73469 13.32 4.30961C13.0115 4.72613 12.7592 5.25281 12.7001 5.87561L14.5343 6.07901C14.548 5.93285 14.6229 5.73989 14.7575 5.55845H14.7582V5.55773C14.9753 5.26397 15.3008 4.99721 15.6878 4.75313L15.6892 4.75241C15.9652 4.58251 16.2525 4.43145 16.5489 4.30025L15.8476 2.45489ZM14.9033 6.96749L13.7142 8.49209C13.9961 8.74985 14.2917 8.94785 14.5772 9.11345L14.5808 9.11525L14.5844 9.11741C15.5319 9.65633 16.5089 9.96053 17.4147 10.2492L17.9352 8.33477C17.0298 8.04605 16.1763 7.76741 15.4448 7.35197C15.2352 7.23029 15.0516 7.10321 14.9033 6.96749ZM19.7039 8.87333L19.1956 10.791L19.4361 10.8659L19.7313 10.9603C20.7083 11.2781 21.6443 11.6176 22.481 12.0874L23.3298 10.3162C22.3182 9.74777 21.2681 9.37625 20.2562 9.04721L20.2533 9.04649L19.9502 8.94965L19.7039 8.87333ZM25.056 11.6453L23.7518 13.0565C24.0599 13.3903 24.2907 13.7916 24.403 14.2064L24.4037 14.2085L24.4044 14.2118C24.5384 14.696 24.5387 15.2655 24.434 15.8408L26.2426 16.2267C26.3902 15.4145 26.414 14.5228 26.1713 13.6426C25.96 12.8643 25.5568 12.1882 25.056 11.6453ZM23.8025 17.0432C23.6029 17.2534 23.3827 17.443 23.1452 17.6091H23.1444C22.4964 18.0648 21.7448 18.4083 20.9463 18.7035L21.5417 20.5913C22.4151 20.2684 23.3118 19.8724 24.1499 19.2827L24.1521 19.2809L24.1532 19.2802C24.4973 19.0391 24.8156 18.7632 25.1032 18.4569L23.8025 17.0432ZM19.2521 19.2352C18.0954 19.5462 16.9132 19.7831 15.7166 19.984L15.9988 21.9564C17.2304 21.7494 18.467 21.5021 19.696 21.1716L19.2521 19.2352ZM13.9162 20.2562C12.7116 20.4207 11.5006 20.555 10.286 20.6695L10.4451 22.6574C11.6784 22.5414 12.914 22.405 14.1477 22.2362L13.9162 20.2562ZM8.46039 20.826C7.24323 20.9225 6.02319 21.001 4.80207 21.0672L4.89423 23.0602C6.12723 22.9936 7.36131 22.914 8.59503 22.8161L8.46039 20.826ZM2.96715 21.1572C2.23527 21.1914 1.50159 21.2195 0.766113 21.2454L0.826594 23.2402C1.56667 23.2148 2.3066 23.1852 3.04635 23.1516L2.96715 21.1572Z"
                            fill={getIconFill(2)}
                          />
                        </svg>
                      </div>
                      <div className="stepLabel">On our way</div>
                    </div>
                    <div className="stepConnector">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="40"
                        height="10"
                        viewBox="0 0 40 10"
                        fill="none"
                      >
                        <path
                          d="M7 4.3L0 0.958548V9.04145L7 5.7V4.3ZM32.2667 5C32.2667 7.06186 33.9381 8.73333 36 8.73333C38.0619 8.73333 39.7333 7.06186 39.7333 5C39.7333 2.93814 38.0619 1.26667 36 1.26667C33.9381 1.26667 32.2667 2.93814 32.2667 5ZM6.3 5V5.7H36V5V4.3H6.3V5Z"
                          fill={getConnectorFill(3)}
                        />
                      </svg>
                    </div>
                    {/* Step 4: At your door */}
                    <div className="stepContainer">
                      <div
                        className="stepIconCircle"
                        style={getStepIconStyle(3)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="30"
                          height="28"
                          viewBox="0 0 30 28"
                          fill="none"
                        >
                          <path
                            d="M12 0.974609C12.3146 0.974609 12.6167 1.02361 12.9062 1.12012C13.1233 1.19252 13.3345 1.29163 13.5391 1.41895L13.7412 1.55566L17.8271 4.62988C18.2083 4.91578 18.3942 5.24611 18.4053 5.62207C18.4167 6.01501 18.3164 6.34896 18.1074 6.62793C17.8986 6.90655 17.6135 7.08782 17.2471 7.17188C16.8949 7.25265 16.5168 7.15905 16.1074 6.86816L12.0605 3.79492L12 3.75L11.9404 3.79492L2.94043 10.5449L2.90039 10.5752V24.2246H7.5C7.89976 24.2246 8.23067 24.3596 8.49902 24.6279C8.76722 24.8962 8.90133 25.2265 8.90039 25.625C8.8994 26.0238 8.76463 26.3546 8.49707 26.624C8.22986 26.8931 7.8995 27.0273 7.5 27.0254H3C2.20181 27.0254 1.52146 26.7421 0.953125 26.1738C0.384772 25.6055 0.100605 24.9243 0.0996094 24.125V10.625C0.0996094 10.1656 0.203144 9.73044 0.40918 9.31934C0.615186 8.90847 0.898147 8.57092 1.25879 8.30566L1.25977 8.30469L10.2588 1.55566C10.526 1.36136 10.8044 1.21663 11.0938 1.12012C11.3833 1.02361 11.6854 0.974609 12 0.974609ZM21 19.7246C22.3412 19.7246 23.6386 19.8986 24.8926 20.2461C26.1463 20.5935 27.3444 21.1014 28.4854 21.7715V21.7725C28.9207 22.0385 29.2658 22.3953 29.5205 22.8438C29.775 23.2918 29.9013 23.7683 29.9004 24.2744V24.2754C29.9003 25.0495 29.6351 25.6989 29.1045 26.2295C28.5739 26.7601 27.9245 27.0253 27.1504 27.0254H14.8496C14.0755 27.0253 13.4261 26.7601 12.8955 26.2295C12.3649 25.6989 12.0997 25.0495 12.0996 24.2754C12.0996 23.7681 12.227 23.2909 12.4814 22.8428C12.7362 22.3943 13.0803 22.0375 13.5146 21.7725L13.5137 21.7715C14.6558 21.1013 15.8545 20.5936 17.1084 20.2461C18.3624 19.8986 19.6598 19.7246 21 19.7246ZM21 22.5254C19.9669 22.5254 18.9587 22.6513 17.9756 22.9033C16.992 23.1555 16.0584 23.5337 15.1758 24.0381L14.8486 24.2246H27.1514L26.8242 24.0381C25.9416 23.5337 25.008 23.1555 24.0244 22.9033C23.0413 22.6513 22.0331 22.5254 21 22.5254ZM21 9.22461C22.2238 9.22461 23.2612 9.65178 24.1172 10.5078C24.9732 11.3638 25.4004 12.4012 25.4004 13.625C25.4004 14.8488 24.9732 15.8862 24.1172 16.7422C23.2612 17.5982 22.2238 18.0254 21 18.0254C19.7762 18.0254 18.7388 17.5982 17.8828 16.7422C17.0268 15.8862 16.5996 14.8488 16.5996 13.625C16.5996 12.4012 17.0268 11.3638 17.8828 10.5078C18.7388 9.65178 19.7762 9.22461 21 9.22461ZM21 12.0254C20.5498 12.0254 20.168 12.1787 19.8613 12.4863C19.5548 12.7939 19.4014 13.1759 19.4004 13.625C19.3994 14.0744 19.5528 14.4571 19.8613 14.7656C20.1698 15.074 20.5517 15.2266 21 15.2246C21.4502 15.2246 21.833 15.0713 22.1406 14.7637C22.4481 14.4561 22.6006 14.0742 22.5996 13.625C22.5986 13.1759 22.4452 12.7939 22.1387 12.4863C21.832 12.1787 21.4502 12.0254 21 12.0254Z"
                            fill={getIconFill(3)}
                            stroke={
                              getIconFill(3) === "#FFFFFF" ? "#FFFFFF" : "white"
                            }
                            strokeWidth="0.2"
                          />
                        </svg>
                      </div>
                      <div className="stepLabel">At your door</div>
                    </div>
                  </div>
                  <div className="etaText" style={{ marginTop: 16 }}>
                    Your meal is scheduled for{" "}
                    <span style={{ fontWeight: "bold" }}>
                      {currentTrackedOrder.eta}
                    </span>
                  </div>
                </div>
              );
            })()}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setTrackModalVisible(false);
              setCurrentTrackedOrder(null);
            }}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MyPlan;
