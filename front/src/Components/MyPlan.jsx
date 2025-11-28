import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import name from "./../assets/successGroup.png";
import myplanlocation from "./../assets/myplanlocation.png";
import myplancalender from "./../assets/myplancalender.png";
import order from "../Helper/data";
import ".././Styles/Checkout.css";
import IsNonVeg from "./../assets/isVeg=no.svg";
import IsVeg from "./../assets/isVeg=yes.svg";
import myplanblackedit from "./../assets/myplanblackedit.png";
import myplancancelicon from "./../assets/myplancancelicon.png";
import myplandrop from "./../assets/myplandrop.png";
import myplanseparator from "./../assets/myplanseparator.png";
import myplanskip from "./../assets/myplanskip.png";
import myplancancel2 from "./../assets/myplancancelicon.png";

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

const MyPlan = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("today"); // today, tomorrow, upcoming
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBillingOpen, setIsBillingOpen] = useState(false);

  const toggleBillingDetails = () => {
    setIsBillingOpen(!isBillingOpen);
  };

  // Categorize orders by date
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

    order.forEach((item) => {
      const orderDate = new Date(item.deliveryDate);
      orderDate.setHours(0, 0, 0, 0);

      if (orderDate.getTime() === today.getTime()) {
        todayOrders.push(item);
      } else if (orderDate.getTime() === tomorrow.getTime()) {
        tomorrowOrders.push(item);
      } else if (orderDate >= dayAfterTomorrow) {
        upcomingOrders.push(item);
      }
    });

    return { todayOrders, tomorrowOrders, upcomingOrders };
  }, []);

  // Get current tab orders
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

  // Function to calculate time remaining for edit/confirm
  const getTimeRemaining = (deliveryDate) => {
    const delivery = new Date(deliveryDate);
    const now = new Date();
    const diffTime = delivery - now;
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    return { days, hours };
  };

  const ViewPlanModal = ({ isOpen, onClose, order, isPaid }) => {
    if (!isOpen) return null;

    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
          padding: 20,
        }}
        onClick={onClose}
      >
        <div
          style={{
            backgroundColor: "white",
            borderRadius: 16,
            padding: 24,
            maxWidth: 600,
            width: "100%",
            maxHeight: "90vh",
            overflowY: "auto",
            position: "relative",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with Date Box */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 24,
              paddingBottom: 16,
              borderBottom: "1px solid #eee",
            }}
          >
            <div
              style={{
                width: 117,
                height: 72,
                background: "#fff8dc",
                border: "2px solid #f5deb3",
                borderRadius: 12,
                paddingTop: 6,
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0 12px",
                  fontSize: 10,
                  fontWeight: 500,
                  color: "#333",
                  marginTop: 15,
                }}
              >
                <span>{formatDate(order.deliveryDate)}</span>
                <div
                  style={{
                    width: 1,
                    height: 28,
                    background: "#ccc",
                    position: "absolute",
                    left: "50%",
                    top: 12,
                    transform: "translateX(-50%)",
                  }}
                />
                <span>{formatDay(order.deliveryDate)}</span>
              </div>
              <div
                style={{
                  width: "100%",
                  height: 1,
                  background: "#ccc",
                  marginTop: 4,
                }}
              />
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  marginTop: 6,
                }}
              >
                {order.session}
              </div>
              {isPaid && (
                <div
                  style={{
                    position: "absolute",
                    top: -5,
                    right: -5,
                    width: 26,
                    height: 26,
                  }}
                >
                  <img
                    src={name}
                    alt="badge"
                    style={{ width: "100%", height: "100%" }}
                  />
                </div>
              )}
            </div>

            {/* Edit/Confirm banner */}
            <div
              style={{
                background: isPaid ? "#7a9b2d" : "#E5F3FD",
                color: isPaid ? "#fff" : "#438FC6",
                fontSize: 11,
                fontWeight: 600,
                padding: "6px 12px",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                marginTop: 12,
              }}
            >
              {isPaid
                ? `Edit orders within ${
                    getTimeRemaining(order.deliveryDate).days
                  } days, ${getTimeRemaining(order.deliveryDate).hours} hours`
                : `Confirm plan within ${
                    getTimeRemaining(order.deliveryDate).days
                  } days, ${getTimeRemaining(order.deliveryDate).hours} hours`}
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                fontSize: 24,
                cursor: "pointer",
                color: "#666",
                position: "absolute",
                top: 16,
                right: 16,
              }}
            >
              <img src={myplancancel2} alt="" style={{ width: 24 }} />
            </button>
          </div>

          {/* Cart Container */}
          <div className="checkoutcontainer">
            <div className="cart-container">
              <div className="cart-section">
                <div className="cart-content">
                  {/* Cart Header */}
                  <div className="cart-header">
                    <div className="header-content">
                      <div className="header-left">
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
                    </div>
                  </div>

                  {/* Cart Items */}
                  {order.allProduct.map((product, index) => (
                    <div className="cart-item" key={index}>
                      <div className="veg-indicator">
                        <div className="veg-indicator d-flex align-items-center justify-content-center gap-2 flex-row fw-bold">
                          {index + 1}.{" "}
                          {product?.foodcategory === "Veg" ? (
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
                      </div>
                      <div className="item-content">
                        <div className="item-details">
                          <div className="item-name">
                            <div className="item-name-text">{product.item}</div>
                          </div>
                          <div className="item-tags">
                            <div className="portion-tag">
                              <div className="portion-text">
                                <div className="portion-label">
                                  {product.qty} Portion
                                  {product.qty > 1 ? "s" : ""}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="item-controls">
                          <div className="quantity-control">
                            <div className="quantity-btn">
                              <div className="btn-text">-</div>
                            </div>
                            <div className="quantity-display">
                              <div className="quantity-text">{product?.qty}</div>
                            </div>
                            <div className="quantity-btn">
                              <div className="btn-text">+</div>
                            </div>
                          </div>
                          <div className="price-container vertical">
                            <div className="current-price">
                              <div className="current-currency">
                                <div className="current-currency-text">₹</div>
                              </div>
                              <div className="current-amount">
                                <div className="current-amount-text">
                                  {product.price * product.qty}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Cart Footer */}
                  <div className="cart-footer">
                    <div className="add-more-section">
                      <div className="add-more-btn">
                        <div className="add-more-content">
                          <div className="add-more-text-container">
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
                            <div className="add-more-text">
                              <div className="add-more-label">Add More</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="total-section">
                      <div className="total-label-container">
                        <div className="total-label">Total</div>
                      </div>
                      <div className="total-price-section">
                        <div className="total-price-content d-flex align-items-center justify-content-center gap-4">
                          <div className="total-current-price d-flex align-items-center">
                            <div className="current-currency">
                              <div className="current-currency-text">₹</div>
                            </div>
                            <div className="current-amount">
                              <div className="current-amount-text">
                                {order.subTotal?.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: "8px",
                  paddingTop: "18px",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    color: "#212121",
                    paddingBottom: 8,
                    paddingLeft: 8,
                    alignSelf: "flex-start",
                    width: 386,
                    fontSize: 20,
                  }}
                >
                  Delivery Details
                </div>

                <div
                  style={{
                    background: "#fff",
                    borderRadius: 12,
                    border: "0.5px solid #f5deb3",
                    boxShadow: "0 2px 3px rgba(245, 155, 83, 0.1)",
                    overflow: "hidden",
                    position: "relative",
                    padding: "0 0",
                    marginBottom: 16,
                  }}
                >
                  {/* Address Section */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      padding: 9,
                      gap: 10,
                    }}
                  >
                    <img
                      src={myplanlocation}
                      alt="Location"
                      style={{ height: 24, objectFit: "contain", marginTop: 8 }}
                    />
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          color: "#212121",
                          fontWeight: 600,
                          fontSize: 16,
                          marginBottom: 4,
                        }}
                      >
                        {order.delivarylocation}
                      </div>
                      <div style={{ color: "#6b6b6b", fontSize: 13 }}>
                        Mr {order.username} | {order.Mobilenumber}
                      </div>
                    </div>
                    <button
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "4px 8px",
                        borderRadius: 6,
                        background: "#fff5e6",
                        border: "none",
                        cursor: "pointer",
                      }}
                      onClick={() => {}}
                    >
                      <img
                        src={myplanblackedit}
                        alt="Change"
                        style={{ width: 14, height: 14, objectFit: "contain" }}
                      />
                      <span
                        style={{
                          color: "#212121",
                          fontWeight: 500,
                          fontSize: 13,
                        }}
                      >
                        Change
                      </span>
                    </button>
                  </div>

                  <img
                    src={myplanseparator}
                    alt=""
                    style={{
                      width: "90%",
                      alignSelf: "center",
                      margin: "5px auto",
                    }}
                  />

                  {/* Handover Section */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      padding: 9,
                      gap: 10,
                    }}
                  >
                    <img
                      src={myplandrop}
                      alt="Notes"
                      style={{ height: 49, objectFit: "contain" }}
                    />
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          color: "#212121",
                          fontSize: 15,
                          marginBottom: 8,
                        }}
                      >
                        Handover at:{" "}
                        <span
                          style={{
                            color: "#6b8e23",
                            fontWeight: 600,
                            textDecoration: "underline",
                          }}
                        >
                          Security entry Point
                        </span>
                      </div>
                      <input
                        type="text"
                        placeholder="Add Delivery notes"
                        style={{
                          width: "100%",
                          borderRadius: 20,
                          border: "1px solid #6b8e23",
                          padding: "8px 10px",
                          fontSize: 15,
                          color: "#212121",
                          background: "#fff",
                          marginBottom: 0,
                          height: 40,
                        }}
                      />
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
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="7"
                      viewBox="0 0 20 10"
                      fill="none"
                      style={{
                        transform: isBillingOpen
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                        transition: "transform 0.3s ease",
                      }}
                    >
                      <path
                        d="M18 8.5L10 1.5L2 8.5"
                        stroke="#2C2C2C"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
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
                      {(() => {
                        const staticSubtotal = 250.0;
                        const staticGST = 5;
                        const staticGSTAmount = (staticSubtotal * staticGST) / 100;
                        const staticCutlery = 10;
                        const staticCoupon = 20;
                        const staticDeliveryType = "Express";
                        const staticDeliveryCharge = 25;
                        const staticWallet = 30;

                        const totalPay =
                          staticSubtotal +
                          staticGSTAmount +
                          staticCutlery +
                          staticDeliveryCharge -
                          staticCoupon -
                          staticWallet;

                        return (
                          <>
                            <div className="label-column">
                              <div className="toatal-va">Total Order Value</div>
                              <div className="toatal-va">Tax ({staticGST}%)</div>
                              <div className="toatal-va">Cutlery</div>
                              <div className="toatal-va">Coupon Discount</div>
                              <div className="toatal-va">{`${staticDeliveryType} Delivery`}</div>
                              <div className="toatal-va">Wallet Pay</div>
                              <div>
                                <b className="toatal-va">Total Payable</b>
                              </div>
                            </div>

                            <div className="value-column">
                              <div className="toatal-va">
                                ₹ {staticSubtotal.toFixed(2)}
                              </div>
                              <div className="toatal-va">
                                ₹ {staticGSTAmount.toFixed(2)}
                              </div>
                              <div className="toatal-va">₹ {staticCutlery}</div>
                              <div className="toatal-va" style={{ color: "green" }}>
                                - ₹ {staticCoupon}
                              </div>
                              <div className="toatal-va">₹ {staticDeliveryCharge}</div>
                              <div className="toatal-va" style={{ color: "green" }}>
                                - ₹ {staticWallet}
                              </div>
                              <div className="toatal-va">
                                <b>₹ {totalPay.toFixed(2)}</b>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "space-between",
              marginTop: 24,
              alignItems: "center",
            }}
          >
            {!isPaid && (
              <>
                <button
                  style={{
                    width: 140,
                    height: 50,
                    background: "#6b6b6b",
                    border: "1px solid #ddd",
                    borderRadius: 12,
                    padding: "12px",
                    fontWeight: 600,
                    color: "#fafafa",
                    cursor: "pointer",
                    fontSize: "14px",
                    transition: "all 0.2s ease",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 2,
                  }}
                >
                  Skip Order
                  <img
                    src={myplanskip}
                    alt=""
                    style={{ marginLeft: 6, width: 16 }}
                  />
                </button>

                <button
                  style={{
                    width: 260,
                    height: 50,
                    background: "#6b8e23",
                    color: "white",
                    fontWeight: 700,
                    borderRadius: 12,
                    border: "none",
                    padding: "12px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    fontSize: "14px",
                    transition: "all 0.2s ease",
                    boxShadow: "0 2px 4px rgba(107, 142, 35, 0.3)",
                  }}
                >
                  Confirm & Pay
                  <span
                    style={{
                      background: "#FFF8DC",
                      color: "#222",
                      fontWeight: 700,
                      borderRadius: 10,
                      padding: "3px 12px",
                      fontSize: "18px",
                    }}
                  >
                    ₹{order.subTotal?.toFixed(2)}
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const handleViewPlan = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  // Get tab date display
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

  return (
    <div className="mainbg">
      <div className="checkoutcontainer">
        {/* Header */}
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
            <h3 className="checkout-title">My Plans</h3>
            <div style={{ width: 36 }}></div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 12,
            marginBottom: 24,
            marginTop: 20,
          }}
        >
          {/* Today Tab */}
          <button
            onClick={() => setSelectedTab("today")}
            style={{
              width: 117,
              height: 72,
              background: selectedTab === "today" ? "#5E4030" : "#fff8dc",
              border: `2px solid ${
                selectedTab === "today" ? "#5E4030" : "#f5deb3"
              }`,
              borderRadius: 12,
              paddingTop: 6,
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-start",
              boxSizing: "border-box",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          >
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                padding: "0 12px",
                fontSize: 10,
                fontWeight: 500,
                color: selectedTab === "today" ? "#fff" : "#333",
                marginTop: 15,
              }}
            >
              <span>{getTabDateDisplay("today").date}</span>
              <div
                style={{
                  width: 1,
                  height: 28,
                  background: selectedTab === "today" ? "#fff" : "#ccc",
                  position: "absolute",
                  left: "50%",
                  top: 12,
                  transform: "translateX(-50%)",
                }}
              />
              <span>{getTabDateDisplay("today").day}</span>
            </div>
            <div
              style={{
                width: "100%",
                height: 1,
                background: selectedTab === "today" ? "#fff" : "#ccc",
                marginTop: 4,
              }}
            />
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                marginTop: 6,
                color: selectedTab === "today" ? "#fff" : "#000",
              }}
            >
              Today
            </div>
          </button>

          {/* Tomorrow Tab */}
          <button
            onClick={() => setSelectedTab("tomorrow")}
            style={{
              width: 117,
              height: 72,
              background: selectedTab === "tomorrow" ? "#5E4030" : "#fff",
              border: `2px solid ${
                selectedTab === "tomorrow" ? "#5E4030" : "#f5deb3"
              }`,
              borderRadius: 12,
              paddingTop: 6,
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-start",
              boxSizing: "border-box",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          >
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                padding: "0 12px",
                fontSize: 10,
                fontWeight: 500,
                color: selectedTab === "tomorrow" ? "#fff" : "#333",
                marginTop: 15,
              }}
            >
              <span>{getTabDateDisplay("tomorrow").date}</span>
              <div
                style={{
                  width: 1,
                  height: 28,
                  background: selectedTab === "tomorrow" ? "#fff" : "#ccc",
                  position: "absolute",
                  left: "50%",
                  top: 12,
                  transform: "translateX(-50%)",
                }}
              />
              <span>{getTabDateDisplay("tomorrow").day}</span>
            </div>
            <div
              style={{
                width: "100%",
                height: 1,
                background: selectedTab === "tomorrow" ? "#fff" : "#ccc",
                marginTop: 4,
              }}
            />
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                marginTop: 6,
                color: selectedTab === "tomorrow" ? "#fff" : "#000",
              }}
            >
              Tomorrow
            </div>
          </button>

          {/* Upcoming Tab */}
          <button
            onClick={() => setSelectedTab("upcoming")}
            style={{
              width: 117,
              height: 72,
              background: selectedTab === "upcoming" ? "#5E4030" : "#fff",
              border: `2px solid ${
                selectedTab === "upcoming" ? "#5E4030" : "#f5deb3"
              }`,
              borderRadius: 12,
              paddingTop: 6,
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-start",
              boxSizing: "border-box",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          >
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                padding: "0 12px",
                fontSize: 10,
                fontWeight: 500,
                color: selectedTab === "upcoming" ? "#fff" : "#333",
                marginTop: 15,
              }}
            >
              <span>{getTabDateDisplay("upcoming").date}</span>
              <div
                style={{
                  width: 1,
                  height: 28,
                  background: selectedTab === "upcoming" ? "#fff" : "#ccc",
                  position: "absolute",
                  left: "50%",
                  top: 12,
                  transform: "translateX(-50%)",
                }}
              />
              <span>{getTabDateDisplay("upcoming").day}</span>
            </div>
            <div
              style={{
                width: "100%",
                height: 1,
                background: selectedTab === "upcoming" ? "#fff" : "#ccc",
                marginTop: 4,
              }}
            />
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                marginTop: 6,
                color: selectedTab === "upcoming" ? "#fff" : "#000",
              }}
            >
              Upcoming
            </div>
          </button>
        </div>

        {/* Orders Content */}
        <div
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            alignItems: "center",
            padding: "0 16px",
          }}
        >
          {currentTabOrders.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                color: "#666",
                fontSize: 16,
              }}
            >
              No plans for this day yet
            </div>
          ) : (
            currentTabOrders.map((item) => {
              const { days, hours } = getTimeRemaining(item.deliveryDate);
              const isPaid = item.paymentmethod === "Online";

              return (
                <div
                  key={item._id}
                  style={{
                    borderRadius: 16,
                    border: "1px solid #EEEEEE",
                    background: "#FFF",
                    marginBottom: 16,
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
                    position: "relative",
                    padding: 16,
                    width: "100%",
                    maxWidth: 420,
                  }}
                >
                  {/* Meal Type Header */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <h3
                      style={{
                        fontSize: 20,
                        fontWeight: 700,
                        margin: 0,
                        color: "#212121",
                      }}
                    >
                      {item.session}
                    </h3>
                    {isPaid && (
                      <div
                        style={{
                          background: "#6B8E23",
                          color: "white",
                          fontSize: 12,
                          fontWeight: 600,
                          padding: "4px 12px",
                          borderRadius: 20,
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M7 0C3.13438 0 0 3.13438 0 7C0 10.8656 3.13438 14 7 14C10.8656 14 14 10.8656 14 7C14 3.13438 10.8656 0 7 0ZM5.6 10.5L2.1 7L3.2625 5.8375L5.6 8.1625L10.7375 3.025L11.9 4.2L5.6 10.5Z"
                            fill="white"
                          />
                        </svg>
                        Confirmed
                      </div>
                    )}
                  </div>

                  {/* Delivery Time */}
                  <div
                    style={{
                      fontSize: 13,
                      color: "#4A821D",
                      marginBottom: 8,
                    }}
                  >
                    Arrives fresh between 12:00 to 01:00PM
                  </div>

                  {/* Location */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 16,
                    }}
                  >
                    <img
                      src={myplanlocation}
                      alt=""
                      style={{ width: 16, height: 16 }}
                    />
                    <div style={{ fontWeight: 600, fontSize: 14, flex: 1 }}>
                      {item.delivarylocation}
                    </div>
                  </div>

                  {/* Reminder Badge */}
                  {!isPaid && (
                    <div
                      style={{
                        background: "#E1F3F8",
                        color: "#197CA8",
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "8px 12px",
                        borderRadius: 8,
                        marginBottom: 16,
                        display: "inline-block",
                      }}
                    >
                      Confirm plan within ({days})days, ({hours})h hours
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      width: "100%",
                    }}
                  >
                    <button
                      onClick={() => handleViewPlan(item)}
                      style={{
                        flex: 1,
                        border: "1px solid #3A8DAD",
                        background: "#FFF8DC",
                        color: "#3A8DAD",
                        borderRadius: 12,
                        padding: "12px",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                        cursor: "pointer",
                        gap: 6,
                        height: 48,
                      }}
                    >
                      View Plan
                      <img
                        src={myplancalender}
                        alt=""
                        style={{ width: 18 }}
                      />
                    </button>

                    {isPaid ? (
                      <button
                        style={{
                          flex: 1,
                          background: "#6B8E23",
                          color: "white",
                          borderRadius: 12,
                          border: "none",
                          padding: "12px",
                          fontWeight: 700,
                          fontSize: 14,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          height: 48,
                        }}
                      >
                        Track Order
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M16.5 7.5V15C16.5 15.825 15.825 16.5 15 16.5H3C2.175 16.5 1.5 15.825 1.5 15V7.5M1.5 7.5L9 1.5L16.5 7.5M1.5 7.5H16.5"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    ) : (
                      <button
                        style={{
                          flex: 1,
                          background: "#6B8E23",
                          color: "white",
                          fontWeight: 700,
                          borderRadius: 12,
                          border: "none",
                          padding: "12px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                          fontSize: 14,
                          height: 48,
                        }}
                      >
                        Pay
                        <span
                          style={{
                            background: "#FFF8DC",
                            color: "#222",
                            fontWeight: 700,
                            borderRadius: 8,
                            padding: "4px 10px",
                            fontSize: 14,
                          }}
                        >
                          ₹{item.subTotal}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* View Plan Modal */}
      {selectedOrder && (
        <ViewPlanModal
          isOpen={isModalOpen}
          onClose={closeModal}
          order={selectedOrder}
          isPaid={selectedOrder.paymentmethod === "Online"}
        />
      )}
    </div>
  );
};

export default MyPlan;