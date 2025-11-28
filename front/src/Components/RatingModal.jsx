import React, { useState, useEffect } from "react";
import { Modal, Form } from "react-bootstrap";
import axios from "axios";
import { FaStar } from "react-icons/fa";
// import "../Styles/rating.css";

const RatingModal = () => {
  const [rateorder, setRateOrder] = useState({});
  const [rateMode, setRateMode] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const getOrderByCustomerId = async () => {
    try {
      const userId = JSON.parse(localStorage.getItem("user"));
      if (!userId) return;

      const res = await axios.get(
        `http://localhost:7013/api/admin/getorderNotRatedByUserID/${userId?._id}`
      );

      if (res.status === 200) {
        // console.log("Order to be rated:", res.data.order);
        setRateOrder(res.data.order);
        setRateMode(true);
      }
    } catch (error) {
      setRateMode(false);
      setRateOrder({});
    }
  };

  const makeRateOrder = async (id, rate, comment) => {
    try {
      if (rate === 0) return alert("Please select a rating");
      if (rate <= 3 && !comment.trim()) return;

      const res = await axios.put(
        "http://localhost:7013/api/admin/submitOrderRating",
        {
          orderId: id,
          ratingType: "food",
          rating: rate,
          comment,
        }
      );

      if (res.status === 200) {
        setRateOrder({});
        setRateMode(false);
        setRating(0);
        setComment("");
      }
    } catch (error) {
      if (error.response) alert(error.response.data.error);
      console.log(error);
    }
  };

  const handleClose = () => {
    setRateMode(false);
    setRateOrder({});
    setRating(0);
    setComment("");
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const options = {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      // second: "2-digit",
      hour12: true,
    };
    return date.toLocaleString("en-GB", options).replace(",", "");
  };

  useEffect(() => {
    getOrderByCustomerId();
  }, []);

  const handleRating = (value) => setRating(value);

  return (
    // <Modal
    //   show={rateMode}
    //   onHide={handleClose}
    //   backdrop="static"
    //   dialogClassName="bottom-modal" // 👈 custom class
    //   contentClassName="border-0"
    // >
    //   <Modal.Body className="rating-body">
    <Modal
      show={rateMode}
      onHide={handleClose}
      backdrop="static"
      centered
      contentClassName="border-0"
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Modal.Body
        style={{
          backgroundColor: "#fff",
          borderRadius: "16px",
          padding: "1.5rem",
          boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
          position: "fixed",
          bottom: 0,
          margin: "10px",
          left: 0,
          right: 0,
          // maxWidth: "40%",
        }}
      >
        <button className="custom-close-btn" onClick={handleClose}>
          ×
        </button>
        {rateorder &&
        rateorder.allProduct &&
        rateorder.allProduct.length > 0 ? (
          <>
            <h6
              style={{
                textAlign: "center",
                fontWeight: 400,
                color: "#333",
                fontSize: "0.9rem",
                marginBottom: "1rem",
              }}
            >
              Your Lunch/Dinner delivered on:{" "}
              <span style={{ fontWeight: 500 }}>
                {formatDateTime(rateorder.updatedAt)}
                {/* 10 Aug 2025, 12:12:00 */}
              </span>
            </h6>

            <Form>
              <Form.Group className="text-center mb-3">
                <Form.Label
                  style={{
                    display: "block",
                    fontSize: "0.9rem",
                    color: "#444",
                    marginBottom: "8px",
                  }}
                >
                  Your Food Rating
                </Form.Label>
                <div className="d-flex justify-content-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      size={46}
                      color={star <= rating ? "#E6B800" : "#ccc"}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleRating(star)}
                    />
                  ))}
                </div>
              </Form.Group>

              <Form.Group>
                <Form.Label
                  style={{
                    fontWeight: 400,
                    fontSize: "0.9rem",
                    color: "#333",
                  }}
                >
                  Tell us about your meal
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Add a detailed review"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required={rating <= 3} // ✅ Required only if rating ≤ 3
                  style={{
                    fontSize: "0.9rem",
                    border: "1px solid #A9A9A9",
                    borderRadius: "8px",
                    resize: "none",
                    boxShadow: "none",
                  }}
                />
              </Form.Group>

              <div className="mt-3 d-flex justify-content-center">
                <button
                  className="btn w-100"
                  style={{
                    backgroundColor: "#E6B800",
                    color: "black",
                    fontWeight: 500,
                    borderRadius: "10px",
                    border: "none",
                    padding: "10px 0",
                    fontSize: "1rem",
                    // verticalAlign: "middle",
                    paddingLeft: "40%",
                    fontWeight: 600,
                  }}
                  onClick={() => makeRateOrder(rateorder._id, rating, comment)}
                >
                  Submit
                </button>
              </div>
            </Form>
          </>
        ) : (
          <p className="text-center mb-0" style={{ color: "#666" }}>
            No product available to rate.
          </p>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default RatingModal;
