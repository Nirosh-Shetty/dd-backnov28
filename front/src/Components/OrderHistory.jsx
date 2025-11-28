import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import axios from "axios";
import moment from "moment";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Colors, FontFamily } from "../Helper/themes";
import { ArrowLeft } from "lucide-react";
import { Modal, Button } from "react-bootstrap";
import "../Styles/OrderHistory.css";

function OrderHistory() {
  // --- State for fetched orders and navigation ---
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]); // Store all orders
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("userID");
  const phoneNumber = "7204188504";
  const message = "Hello! I need assistance.";

  const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    message
  )}`;

  // --- Pagination state ---
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(4); // Number of orders per page

  // --- State for the currently tracked order ---
  const [currentTrackedOrder, setCurrentTrackedOrder] = useState(null);

  // --- Data fetching function ---
  const getorders = async (id) => {
    try {
      let res = await axios.get(
        `http://localhost:7013/api/admin/getallordersbyUserId/${id}`
      );
      if (res.status === 200 && res.data.order) {
        const formattedOrders = res.data.order
          .map((order) => ({
            id: order._id,
            orderId: order.orderid,
            rawStatus: order.status,
            date: order.updatedAt,
            status: order.status === "Delivered" ? "Delivered" : "Ongoing",
            statusColor:
              order.status === "Delivered" ? "#6B8E23" : Colors.warningOrange,
            items: order.allProduct.map((product) => ({
              name: product.foodItemId?.foodname || "N/A",
              type: product.foodItemId?.foodcategory?.toLowerCase() || "veg",
              quantity: product.quantity,
            })),
            packerName: order.packername || "DailyDish Employee",
            ratingOnOrder: order.ratingOnOrder || 0,
            ratingOnDelivery: order.ratingOnDelivery || 0,
            commentOnOrder: order.commentOnOrder || "",
            commentOnDelivery: order.commentOnDelivery || "",
            total: order.allTotal,
            eta: order.slot,
          }))
          .sort((a, b) => new Date(b.date) - new Date(a.date));

        // ADD THIS BLOCK TO SET THE INITIAL RATINGS
        const initialRatings = {};
        formattedOrders.forEach((order) => {
          if (order.status === "Delivered") {
            initialRatings[order.id] = {
              food: order.ratingOnOrder,
              delivery: order.ratingOnDelivery,
            };
          }
        });
        setOrderRatings(initialRatings);
        setAllOrders(formattedOrders); // Store all orders
        setOrders(formattedOrders); // Initialize with all orders
      }
    } catch (error) {
      console.log("Error fetching orders:", error);
    }
  };

  // --- useEffect to fetch orders on component mount ---
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (userId) {
      getorders(userId);
    } else if (user?._id) {
      getorders(user._id);
    }
  }, [userId]);

  // --- Pagination logic ---
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  // --- Pagination handlers ---
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo(0, 0);
    }
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };

  // --- States for Modals and Ratings ---
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisible1, setModalVisible1] = useState(false);
  const [modalVisible2, setModalVisible2] = useState(false);
  const [modalVisible3, setModalVisible3] = useState(false);
  const [modalVisible4, setModalVisible4] = useState(false);
  const [orderRatings, setOrderRatings] = useState({});
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [modalFoodRating, setModalFoodRating] = useState(0);
  const [modalDeliveryRating, setModalDeliveryRating] = useState(0);
  const [foodReview, setFoodReview] = useState("");
  const [deliveryReview, setDeliveryReview] = useState("");
  const [currentOrderForRating, setCurrentOrderForRating] = useState(null);

  const getOrderRating = (orderId, type) => orderRatings[orderId]?.[type] || 0;

  const setOrderRating = (orderId, type, rating) => {
    setOrderRatings((prev) => ({
      ...prev,
      [orderId]: { ...prev[orderId], [type]: rating },
    }));
  };

  // --- Star Rating Component ---
  const StarRating = ({
    rating,
    onRatingChange,
    size = 20,
    spacing = 6,
    ratingType = "default",
  }) => (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={`${ratingType}-${star}`}
          className="star-button"
          style={{ paddingRight: spacing }}
          onClick={() => onRatingChange(star)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size + 1}
            viewBox="0 0 20 21"
            fill="none"
          >
            <path
              d="M8.73047 1.95898C9.23225 0.87867 10.7677 0.87867 11.2695 1.95898L12.8438 5.34766C13.1061 5.91229 13.6417 6.30107 14.2598 6.37598L17.9688 6.82617C19.151 6.96979 19.6253 8.43024 18.7529 9.24121L16.0166 11.7852C15.5608 12.2091 15.3559 12.8383 15.4756 13.4492L16.1943 17.1162C16.4231 18.285 15.1805 19.1875 14.1396 18.6084L10.875 16.792C10.3309 16.4893 9.66909 16.4893 9.125 16.792L5.86035 18.6084C4.81949 19.1875 3.57692 18.285 3.80566 17.1162L4.52441 13.4492C4.64408 12.8383 4.43925 12.2091 3.9834 11.7852L1.24707 9.24121C0.374676 8.43024 0.848952 6.96979 2.03125 6.82617L5.74023 6.37598C6.35831 6.30107 6.89394 5.91229 7.15625 5.34766L8.73047 1.95898Z"
              fill={star <= rating ? "#FFD700" : "#D0D5DD"}
              stroke="#6B6B6B"
              strokeWidth="0.4"
            />
          </svg>
        </button>
      ))}
    </div>
  );

  // --- OrderCard Component ---
  const OrderCard = ({ order }) => {
    const foodRating = getOrderRating(order.id, "food");
    const deliveryRating = getOrderRating(order.id, "delivery");

    return (
      <div className="orderCard">
        <div className="orderHeader">
          <div className="orderDate">
            Ordered: {moment(order.date).format("DD MMM YYYY, hh:mm A")}
          </div>
          <div className="headerRight">
            <div className="statusContainer">
              <div className="statusBadge">
                {order.status !== "Ongoing" ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="17"
                    height="17"
                    viewBox="0 0 17 17"
                    fill="none"
                  >
                    <path
                      d="M8.74992 1.95825C5.08325 1.95825 2.08325 4.95825 2.08325 8.62492C2.08325 12.2916 5.08325 15.2916 8.74992 15.2916C12.4166 15.2916 15.4166 12.2916 15.4166 8.62492C15.4166 4.95825 12.4166 1.95825 8.74992 1.95825ZM7.41659 11.9583L4.08325 8.62492L5.02325 7.68492L7.41659 10.0716L12.4766 5.01159L13.4166 5.95825L7.41659 11.9583Z"
                      fill="#6B8E23"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="21"
                    height="18"
                    viewBox="0 0 21 18"
                    fill="none"
                  >
                    <path
                      d="M17.7344 5.79492C17.8867 5.79499 18.0335 5.85412 18.1416 5.96094C18.2498 6.06785 18.3105 6.21354 18.3105 6.36523V8.36133L19.9287 7.16309C20.0509 7.0726 20.2046 7.03437 20.3555 7.05566C20.5062 7.07705 20.6426 7.15642 20.7344 7.27734C20.8263 7.39842 20.8655 7.551 20.8438 7.70117C20.822 7.85122 20.7413 7.98658 20.6191 8.07715L18.3105 9.78711V14.5225C18.3104 15.1733 18.0483 15.797 17.583 16.2568C17.1177 16.7167 16.4867 16.9746 15.8291 16.9746H5.6709C5.01331 16.9746 4.38234 16.7167 3.91699 16.2568C3.45169 15.797 3.18956 15.1733 3.18945 14.5225V9.78711L0.880859 8.07715C0.758658 7.98658 0.678015 7.85122 0.65625 7.70117C0.634542 7.551 0.673742 7.39842 0.765625 7.27734C0.857401 7.15642 0.993756 7.07706 1.14453 7.05566C1.29537 7.03437 1.44909 7.0726 1.57129 7.16309L3.18945 8.36133V6.36523C3.18945 6.21354 3.25024 6.06785 3.3584 5.96094C3.46648 5.85412 3.61328 5.79499 3.76562 5.79492H17.7344ZM4.3418 14.5225C4.3419 14.8698 4.48163 15.2032 4.73047 15.4492C4.97954 15.6954 5.31816 15.834 5.6709 15.834H15.8291C16.1818 15.834 16.5205 15.6954 16.7695 15.4492C17.0184 15.2032 17.1581 14.8698 17.1582 14.5225V6.93555H4.3418V14.5225ZM8.20996 0.775391C8.36229 0.775391 8.50906 0.834669 8.61719 0.941406C8.72537 1.04832 8.78613 1.19399 8.78613 1.3457V3.85547C8.78611 4.00707 8.72525 4.15191 8.61719 4.25879C8.50904 4.36566 8.3624 4.42578 8.20996 4.42578C8.05765 4.42569 7.91177 4.36558 7.80371 4.25879C7.69557 4.1519 7.63381 4.00714 7.63379 3.85547V1.3457C7.63379 1.19399 7.69553 1.04832 7.80371 0.941406C7.91174 0.834835 8.05782 0.775484 8.20996 0.775391ZM10.75 0.775391C10.9024 0.775391 11.0491 0.834558 11.1572 0.941406C11.2654 1.04832 11.3262 1.19399 11.3262 1.3457V3.85547C11.3262 4.00699 11.2652 4.15193 11.1572 4.25879C11.0491 4.36566 10.9024 4.42578 10.75 4.42578C10.5976 4.42578 10.4509 4.36566 10.3428 4.25879C10.2348 4.15193 10.1738 4.00699 10.1738 3.85547V1.3457C10.1738 1.19399 10.2346 1.04832 10.3428 0.941406C10.4509 0.834557 10.5976 0.775391 10.75 0.775391ZM13.29 0.775391C13.4422 0.775484 13.5883 0.834835 13.6963 0.941406C13.8045 1.04832 13.8662 1.19399 13.8662 1.3457V3.85547C13.8662 4.00714 13.8044 4.1519 13.6963 4.25879C13.5882 4.36558 13.4423 4.42569 13.29 4.42578C13.1376 4.42578 12.991 4.36566 12.8828 4.25879C12.7748 4.15191 12.7139 4.00707 12.7139 3.85547V1.3457C12.7139 1.19399 12.7746 1.04832 12.8828 0.941406C12.9909 0.834669 13.1377 0.775391 13.29 0.775391Z"
                      fill="#CC4125"
                      stroke="#CC4125"
                      strokeWidth="0.2"
                    />
                  </svg>
                )}
              </div>
              <div className="statusText" style={{ color: order.statusColor }}>
                {order.status}
              </div>
            </div>
            {order.status === "Ongoing" ? (
              <button
                className="trackingOrder"
                onClick={() => {
                  setCurrentTrackedOrder(order);
                  setModalVisible4(true);
                }}
              >
                Track Order
              </button>
            ) : (
              <>
                <div className="dilvered">
                  {moment(order.date).format("DD MMM YYYY")}
                </div>
                <div className="dilvered">
                  {moment(order.date).format("hh:mm A")}
                </div>
              </>
            )}
          </div>
        </div>
        <div className="itemsContainer">
          <div className="itemsHeader">Order Details</div>
          {order.items.map((item, index) => (
            <div key={index} className="itemRow">
              {item.type === "veg" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="15"
                  viewBox="0 0 14 15"
                  fill="none"
                >
                  <g clipPath="url(#clip0_2155_12170)">
                    <path
                      d="M11.0799 2.22039C11.7426 2.22039 12.2799 2.75765 12.2799 3.42039V11.5804C12.2799 12.2431 11.7426 12.7804 11.0799 12.7804H2.9199C2.25716 12.7804 1.7199 12.2431 1.7199 11.5804V3.42039C1.7199 2.75765 2.25716 2.22039 2.9199 2.22039H11.0799ZM13.5999 2.10039C13.5999 1.43765 13.0626 0.900391 12.3999 0.900391H1.5999C0.937159 0.900391 0.399902 1.43765 0.399902 2.10039V12.9004C0.399902 13.5631 0.937161 14.1004 1.5999 14.1004H12.3999C13.0626 14.1004 13.5999 13.5631 13.5999 12.9004V2.10039ZM6.9999 3.54039C4.8153 3.54039 3.0399 5.31579 3.0399 7.50039C3.0399 9.68499 4.8153 11.4604 6.9999 11.4604C9.1845 11.4604 10.9599 9.68499 10.9599 7.50039C10.9599 5.31579 9.1845 3.54039 6.9999 3.54039Z"
                      fill="#009900"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_2155_12170">
                      <rect
                        width="13.2"
                        height="13.2"
                        fill="white"
                        transform="translate(0.399902 0.900391)"
                      />
                    </clipPath>
                  </defs>
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="15"
                  viewBox="0 0 14 15"
                  fill="none"
                >
                  <path
                    d="M10.7578 2.2199C11.4205 2.2199 11.9578 2.75716 11.9578 3.4199V11.5799C11.9578 12.2426 11.4205 12.7799 10.7578 12.7799H2.59776C1.93502 12.7799 1.39776 12.2426 1.39776 11.5799V3.4199C1.39776 2.75716 1.93502 2.2199 2.59776 2.2199H10.7578ZM13.2778 2.0999C13.2778 1.43716 12.7405 0.899902 12.0778 0.899902H1.27776C0.615016 0.899902 0.0777588 1.43716 0.0777588 2.0999V12.8999C0.0777588 13.5626 0.615017 14.0999 1.27776 14.0999H12.0778C12.7405 14.0999 13.2778 13.5626 13.2778 12.8999V2.0999ZM7.78065 4.79355C7.36508 3.8238 5.99033 3.82376 5.5747 4.79347L3.43435 9.78716C3.09495 10.579 3.67513 11.4599 4.53665 11.4599C5.15429 11.4599 5.8894 11.4599 6.67776 11.4599C7.46595 11.4599 8.20083 11.4599 8.81826 11.4599C9.67975 11.4599 10.2599 10.5791 9.9206 9.78724L7.78065 4.79355Z"
                    fill="#990100"
                  />
                </svg>
              )}
              <div className="quantityBadge">
                <div className="quantityText">{item.quantity}</div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="10"
                  height="14"
                  viewBox="0 0 10 14"
                  fill="none"
                >
                  <path
                    d="M3.5252 4.02496C3.61897 3.93122 3.74612 3.87857 3.8787 3.87857C4.01128 3.87857 4.13844 3.93122 4.2322 4.02496L6.0002 5.79296L7.7682 4.02496C7.81433 3.9772 7.8695 3.93911 7.9305 3.91291C7.9915 3.8867 8.05711 3.87291 8.1235 3.87233C8.18989 3.87176 8.25573 3.88441 8.31718 3.90955C8.37863 3.93469 8.43445 3.97181 8.4814 4.01876C8.52835 4.06571 8.56547 4.12153 8.59061 4.18298C8.61575 4.24443 8.62841 4.31027 8.62783 4.37666C8.62725 4.44305 8.61346 4.50866 8.58725 4.56966C8.56105 4.63066 8.52296 4.68584 8.4752 4.73196L6.7072 6.49996L8.4752 8.26796C8.52296 8.31408 8.56105 8.36925 8.58725 8.43026C8.61346 8.49126 8.62725 8.55687 8.62783 8.62326C8.62841 8.68965 8.61575 8.75549 8.59061 8.81694C8.56547 8.87838 8.52835 8.93421 8.4814 8.98116C8.43445 9.0281 8.37863 9.06523 8.31718 9.09037C8.25573 9.11551 8.18989 9.12816 8.1235 9.12758C8.05711 9.12701 7.9915 9.11321 7.9305 9.08701C7.8695 9.0608 7.81433 9.02271 7.7682 8.97496L6.0002 7.20696L4.2322 8.97496C4.18608 9.02271 4.13091 9.0608 4.0699 9.08701C4.0089 9.11321 3.94329 9.12701 3.8769 9.12758C3.81051 9.12816 3.74467 9.11551 3.68323 9.09037C3.62178 9.06523 3.56595 9.0281 3.51901 8.98116C3.47206 8.93421 3.43493 8.87838 3.40979 8.81694C3.38465 8.75549 3.372 8.68965 3.37258 8.62326C3.37315 8.55687 3.38695 8.49126 3.41315 8.43026C3.43936 8.36925 3.47745 8.31408 3.5252 8.26796L5.2932 6.49996L3.5252 4.73196C3.43147 4.63819 3.37881 4.51104 3.37881 4.37846C3.37881 4.24588 3.43147 4.11872 3.5252 4.02496Z"
                    fill="black"
                  />
                </svg>
              </div>
              <div className="itemName">{item.name}</div>
            </div>
          ))}
          <div className="totalRow">
            <div className="totalText">
              Bill Total{" "}
              <span style={{ fontWeight: "600" }}>₹ {order.total}</span>
            </div>
          </div>
        </div>
        {order.status === "Delivered" && (
          <div className="orderFooter">
            <div className="ratingContainer">
              <div className="ratingLabel">Your Food Rating</div>
              <div style={{ position: "relative" }}>
                <StarRating
                  rating={foodRating}
                  onRatingChange={(rating) =>
                    setOrderRating(order.id, "food", rating)
                  }
                  size={20}
                  spacing={6}
                  ratingType="food"
                />
                <button
                  className="rating-overlay"
                  onClick={() => {
                    const orderToRate = orders.find((o) => o.id === order.id);
                    setCurrentOrderForRating(orderToRate);
                    setCurrentOrderId(order.id);
                    setModalFoodRating(orderToRate.ratingOnOrder);
                    setFoodReview(orderToRate.commentOnOrder);
                    setModalVisible(true);
                  }}
                />
              </div>
            </div>
            <div
              style={{ width: 2, height: 50, backgroundColor: "#C0C0C0" }}
            ></div>
            <div className="ratingContainer">
              <div className="ratingLabel">Delivery Rating</div>
              <div style={{ position: "relative" }}>
                <StarRating
                  rating={deliveryRating}
                  onRatingChange={(rating) =>
                    setOrderRating(order.id, "delivery", rating)
                  }
                  size={20}
                  spacing={6}
                  ratingType="delivery"
                />
                <button
                  className="rating-overlay"
                  onClick={() => {
                    const orderToRate = orders.find((o) => o.id === order.id);
                    setCurrentOrderForRating(orderToRate);
                    setCurrentOrderId(order.id);
                    setModalDeliveryRating(orderToRate.ratingOnDelivery);
                    setDeliveryReview(orderToRate.commentOnDelivery);
                    setModalVisible1(true);
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // --- Pagination Component ---
  const Pagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="pagination-container">
        <button
          className={`pagination-btn ${currentPage === 1 ? "disabled" : ""}`}
          onClick={prevPage}
          disabled={currentPage === 1}
        >
          Previous
        </button>

        <div className="page-numbers">
          {startPage > 1 && (
            <>
              <button
                className={`page-number ${1 === currentPage ? "active" : ""}`}
                onClick={() => goToPage(1)}
              >
                1
              </button>
              {startPage > 2 && <span className="page-ellipsis">...</span>}
            </>
          )}

          {pageNumbers.map((number) => (
            <button
              key={number}
              className={`page-number ${
                number === currentPage ? "active" : ""
              }`}
              onClick={() => goToPage(number)}
            >
              {number}
            </button>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <span className="page-ellipsis">...</span>
              )}
              <button
                className={`page-number ${
                  totalPages === currentPage ? "active" : ""
                }`}
                onClick={() => goToPage(totalPages)}
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        <button
          className={`pagination-btn ${
            currentPage === totalPages ? "disabled" : ""
          }`}
          onClick={nextPage}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    );
  };

  const deleteOrder = (orderId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this order? This action cannot be undone."
      )
    ) {
      const updatedOrders = orders.filter((order) => order.id !== orderId);
      setOrders(updatedOrders);
      setAllOrders(updatedOrders);

      // Adjust current page if needed
      if (currentOrders.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }

      const { [orderId]: _, ...newRatings } = orderRatings;
      setOrderRatings(newRatings);
      setModalVisible3(false);
      setModalVisible2(false);
      alert("The order has been successfully deleted from your records.");
    }
  };

  const handleGoBack = () => navigate(-1);

  const handleRatingSubmit = async (ratingType) => {
    if (!currentOrderId) return;

    const isFoodRating = ratingType === "food";
    const rating = isFoodRating ? modalFoodRating : modalDeliveryRating;
    const comment = isFoodRating ? foodReview : deliveryReview;

    try {
      await axios.put(`http://localhost:7013/api/admin/submitOrderRating`, {
        orderId: currentOrderId,
        ratingType,
        rating,
        comment,
      });

      setOrderRating(currentOrderId, ratingType, rating);
      setOrders(
        orders.map((o) => {
          if (o.id === currentOrderId) {
            return isFoodRating
              ? { ...o, ratingOnOrder: rating, commentOnOrder: comment }
              : { ...o, ratingOnDelivery: rating, commentOnDelivery: comment };
          }
          return o;
        })
      );

      if (isFoodRating) {
        setModalVisible(false);
      } else {
        setModalVisible1(false);
      }
    } catch (error) {
      alert("Failed to submit rating. Please try again.");
    }
  };

  // Replace the useEffect with useLayoutEffect
  const containerRef = useRef(null);

  // Aggressive scroll to top
  useLayoutEffect(() => {
    const scrollToTop = () => {
      // Multiple methods to ensure scroll to top
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }
    };

    // Immediate scroll
    scrollToTop();

    // Scroll after a short delay to catch any late renders
    const timeout1 = setTimeout(scrollToTop, 0);
    const timeout2 = setTimeout(scrollToTop, 50);
    const timeout3 = setTimeout(scrollToTop, 100);

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
    };
  }, []);

  // Also add for pagination
  useLayoutEffect(() => {
    const scrollToTop = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    scrollToTop();
  }, [currentPage]);

  return (
    <div className="mobile-banner-updated containerOrder">
      <div className="headerBottom" onClick={handleGoBack}>
        <ArrowLeft size={35} style={{ color: "#FAFAFA" }} />
        <div className="tagline">My Orders</div>
      </div>

      {/* Orders Count */}
      <div className="orders-count" style={{ color: "#000" }}>
        Showing {currentOrders.length} of {orders.length} orders
        {currentPage > 1 && ` (Page ${currentPage} of ${totalPages})`}
      </div>

      <div className="scrollView">
        {currentOrders.length > 0 ? (
          currentOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))
        ) : (
          <div
            style={{ textAlign: "center", color: "#000", marginTop: "20px" }}
          >
            <p>No orders found.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <Pagination />

      {/* Rest of your modals remain the same */}
      <Modal
        className="tarck-order"
        show={modalVisible4}
        onHide={() => {
          setModalVisible4(false);
          setCurrentTrackedOrder(null);
        }}
        size="lg"
        centered
      >
        {/* Track Order Modal Content - unchanged */}
      </Modal>

      <Modal
        className="tarck-order"
        show={modalVisible4}
        onHide={() => {
          setModalVisible4(false);
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

              const totalItems = currentTrackedOrder.items.reduce(
                (acc, item) => acc + item.quantity,
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
                      <div
                        className="detailsorder"
                        style={{ fontFamily: FontFamily.Bold }}
                      >
                        ORDER ID :{" "}
                        <span style={{ fontFamily: FontFamily.Regular }}>
                          {currentTrackedOrder.orderId}
                        </span>
                      </div>
                      <div
                        className="detailsorder"
                        style={{ color: Colors.secondaryText }}
                      >
                        Summary: {totalItems} items, ₹
                        {currentTrackedOrder.total}
                      </div>
                    </div>
                    <button>
                      <div className="trackingHelp">
                        {" "}
                        <a
                          href={whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Need help?
                        </a>
                      </div>
                    </button>
                  </div>
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
              setModalVisible4(false);
              setCurrentTrackedOrder(null);
            }}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Food Rating Modal */}
      <Modal show={modalVisible} onHide={() => setModalVisible(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Food Rating</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentOrderForRating && (
            <>
              <div className="header">
                <div className="headerText">
                  Your meal was delivered on:{" "}
                  {moment(currentOrderForRating.date).format(
                    "DD MMM YYYY, hh:mm A"
                  )}
                </div>
              </div>

              {/* Rating Section */}
              <div className="ratingContainers">
                <div className="ratingLabel" style={{ textAlign: "center" }}>
                  Your Food Rating
                </div>
                <StarRating
                  rating={modalFoodRating}
                  onRatingChange={setModalFoodRating}
                  size={20}
                  spacing={20}
                  ratingType="modal-food"
                />
              </div>

              {/* Dropdown Section */}
              <button className="dropdownHeader">
                <div className="dropdownHeaderText">
                  Tell us about your meal
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="10"
                  viewBox="0 0 18 10"
                  fill="none"
                >
                  <path
                    d="M1 1.5L9 8.5L17 1.5"
                    stroke="#2C2C2C"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {/* Review TextInput */}
              <div className="reviewSection">
                <textarea
                  className="textInput"
                  placeholder="Add a Detailed review"
                  value={foodReview}
                  onChange={(e) => setFoodReview(e.target.value)}
                  rows={4}
                />
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="canlt"
            variant="secondary"
            onClick={() => setModalVisible(false)}
          >
            Cancel
          </Button>
          {/* <Button

                        className='btr'
                        onClick={() => {
                            if (currentOrderId) {
                                setOrderRating(currentOrderId, 'food', modalFoodRating);
                            }
                            setModalVisible(false);
                        }}
                    >
                        Submit
                    </Button> */}
          <Button className="btr" onClick={() => handleRatingSubmit("food")}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Delivery Rating */}
      <Modal
        show={modalVisible1}
        onHide={() => setModalVisible1(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Delivery Rating</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentOrderForRating && (
            <>
              <div className="header">
                <div className="headerText">
                  Your meal was delivered on:{" "}
                  {moment(currentOrderForRating.date).format(
                    "DD MMM YYYY, hh:mm A"
                  )}
                </div>
              </div>

              <div className="ratingContainers">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-around",
                    marginBottom: 4,
                  }}
                >
                  <div className="ratingLabel">Rate Delivery</div>
                  <div className="ratingLabel" style={{ marginLeft: 20 }}>
                    Delivered by {currentOrderForRating.packerName}
                  </div>
                </div>
                <StarRating
                  rating={modalDeliveryRating}
                  onRatingChange={setModalDeliveryRating}
                  size={20}
                  spacing={20}
                  ratingType="modal-delivery"
                />
              </div>

              {/* Dropdown Section */}
              <button className="dropdownHeader">
                <div className="dropdownHeaderText">How did we deliver?</div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="10"
                  viewBox="0 0 18 10"
                  fill="none"
                >
                  <path
                    d="M1 1.5L9 8.5L17 1.5"
                    stroke="#2C2C2C"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {/* Review TextInput */}
              <div className="reviewSection">
                <textarea
                  className="textInput"
                  placeholder="Add a Detailed review"
                  value={deliveryReview}
                  onChange={(e) => setDeliveryReview(e.target.value)}
                  rows={4}
                />
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="canlt"
            variant="secondary"
            onClick={() => setModalVisible1(false)}
          >
            Cancel
          </Button>
          {/* <Button
                        className='btr'
                        onClick={() => {
                            if (currentOrderId) {
                                setOrderRating(currentOrderId, 'delivery', modalDeliveryRating);
                            }
                            setModalVisible1(false);
                        }}
                    >
                        Submit
                    </Button> */}
          <Button
            className="btr"
            onClick={() => handleRatingSubmit("delivery")}
          >
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Order overlay */}
      <Modal
        show={modalVisible2}
        onHide={() => setModalVisible2(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Order Options</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="Orderoverlay">
            <button
              className="overlayorder"
              onClick={() => {
                /* navigation.navigate("OrderDetails") */
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M5 10.5V1.5L6 2L7 1.5L7.99813 2L9.00969 1.5L10 2L10.9934 1.5L11.9913 2L13 1.5L14.0003 2L15 1.5V8.5"
                  stroke="black"
                  strokeWidth="0.75"
                  strokeLinejoin="round"
                />
                <path
                  d="M15 8.5V12C15 12.663 14.7366 13.2989 14.2678 13.7678C13.7989 14.2366 13.1631 14.5 12.5 14.5M12.5 14.5C11.837 14.5 11.2011 14.2366 10.7323 13.7678C10.2634 13.2989 10 12.663 10 12V10.5H1.50002C1.4342 10.4994 1.36892 10.512 1.30799 10.5369C1.24706 10.5618 1.19171 10.5986 1.14517 10.6451C1.09862 10.6917 1.06181 10.747 1.03689 10.808C1.01197 10.8689 0.999436 10.9342 1.00002 11C1.00002 13 1.21064 14.5 3.50002 14.5H12.5Z"
                  stroke="black"
                  strokeWidth="0.75"
                  strokeLinejoin="round"
                />
                <path
                  d="M7 4.5H13M9 7H13"
                  stroke="black"
                  strokeWidth="0.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="detailsorder">Order details</div>
            </button>
            <button
              className="overlayorder"
              onClick={() => {
                setModalVisible2(false);
                setModalVisible3(true);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="15"
                viewBox="0 0 14 15"
                fill="none"
              >
                <path
                  d="M9.60938 0.962891V1.59766H13.0371V2.49707H12.1807V12.6689C12.1806 13.0578 12.044 13.3848 11.7725 13.6465C11.501 13.908 11.1619 14.0376 10.7578 14.0371H3.24219C2.83851 14.0371 2.49908 13.9076 2.22754 13.6465C1.95597 13.3853 1.81994 13.0579 1.81934 12.668V2.49707H0.962891V1.59766H4.39062V0.962891H9.60938ZM2.75195 12.6689C2.75203 12.783 2.80132 12.8897 2.90527 12.9902C3.0091 13.0906 3.12058 13.1382 3.24121 13.1377H10.7588C10.8789 13.1376 10.9913 13.0902 11.0957 12.9902C11.2 12.8904 11.2485 12.7834 11.248 12.6689V2.49707H2.75195V12.6689ZM9.86133 5.64746L9.88965 5.67383L9.86133 5.70117L7.66113 7.81738L9.86133 9.93359L9.88965 9.96094L9.86133 9.9873L9.22852 10.5967L9.20215 10.5713L7 8.45215L4.79785 10.5713L4.77148 10.5967L4.13867 9.9873L4.11035 9.96094L4.13867 9.93359L6.33789 7.81738L4.13867 5.70117L4.11035 5.67383L4.13867 5.64746L4.77148 5.03809L4.79785 5.06348L7 7.18164L9.20215 5.06348L9.22852 5.03809L9.86133 5.64746Z"
                  fill="black"
                  stroke="black"
                  strokeWidth="0.075"
                />
              </svg>
              <div className="detailsorder">Delete this order </div>
            </button>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalVisible2(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Delete */}
      <Modal
        show={modalVisible3}
        onHide={() => setModalVisible3(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="Orderoverlay">
            <div className="detailsorder" style={{ textAlign: "center" }}>
              Do you want to delete this order from your records?
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalVisible3(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => deleteOrder(currentOrderId)}>
            Delete Permanently
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default OrderHistory;
