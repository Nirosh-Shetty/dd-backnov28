import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa"; // Icons for success and failure
import "../Styles/payment.css"; // External CSS for better readability
import axios from "axios";
import swal from "sweetalert";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Extract query parameters
  const transactionId = searchParams.get("transactionId");
  const userId = searchParams.get("userID");

  // State for payment status and details
  const [paymentStatus, setPaymentStatus] = useState(null); // e.g., "CR" or "FAILED"
  const [paymentDetails, setPaymentDetails] = useState(null); // Store the full payment data

  const handleHomeClick = () => {
    navigate("/orders?userID=" + userId);
  };

  const checkPaymentStatus = async () => {
    try {
      // Construct API endpoint
      const url = `http://localhost:7013/api/User/checkPayment/${transactionId}/${userId}`;

      // Make the GET request
      const response = await axios.get(url);

      if (response.status == 200) {
        const paymentData = response.data.success;
        setPaymentDetails(paymentData);
        if (paymentData.status === "COMPLETED") {
          localStorage.removeItem("cart");
          setPaymentStatus("COMPLETED");
          setTimeout(() => {
            navigate("/orders?userID=" + userId);
          }, 1000);
        } else {
          setPaymentStatus("FAILED");
          setTimeout(() => {
            navigate("/checkout");
          }, 1000);
        }
      } else {
        // Handle unexpected response
        swal({
          title: "Payment Verification Failed",
          text: "Unable to verify your payment status. Please contact support.",
          icon: "error",
          button: "OK",
        });
      }
    } catch (error) {
      // Handle API errors
      console.error("Error checking payment status:", error);
      swal({
        title: "Error!",
        text: "Unable to verify payment status. Please try again.",
        icon: "error",
        button: "OK",
      });
    }
  };

  useEffect(() => {
    // Call payment status check when component mounts
    if (transactionId && userId) {
      checkPaymentStatus();
    } else {
      swal({
        title: "Invalid Payment Details",
        text: "Missing transaction ID or user ID.",
        icon: "error",
        button: "OK",
      });
      navigate("/home");
    }
  }, [transactionId, userId, navigate]);

  return (
    <div className="payment-success-container">
      {paymentStatus === "COMPLETED" ? (
        <>
          <FaCheckCircle className="payment-success-icon" />
          <h1 className="payment-success-title">Payment Successful!</h1>
          <p className="payment-success-message">
            Thank you for your payment,{" "}
            <strong>{paymentDetails?.username}</strong>.
          </p>
          <p className="payment-success-message">
            Amount: ₹{paymentDetails?.amount}
          </p>
          <button onClick={handleHomeClick} className="payment-success-button">
            Go To My Order
          </button>
        </>
      ) : paymentStatus === "FAILED" ? (
        <>
          <FaTimesCircle className="payment-failed-icon" />
          <h1 className="payment-failed-title">Payment Failed</h1>
          <p className="payment-failed-message">
            We could not process your payment. Please try again.
          </p>
          <button
            onClick={() => navigate("/checkout")}
            className="payment-success-button"
          >
            Retry Payment
          </button>
        </>
      ) : (
        <p>Loading payment status...</p>
      )}
    </div>
  );
};

export default PaymentSuccess;
