import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaWhatsapp, FaLock } from "react-icons/fa";
import Swal from "sweetalert2";
import "./PackerLogin.css";
import axios from "axios";

const LoginPage = () => {
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleWhatsappSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (whatsappNumber.length === 10) {
        let res = await axios.post(
          "http://localhost:7013/api/packer/sendPackerOtp",
          {
            mobileNumber: whatsappNumber,
          }
        );
        if (res.status == 200) {
          // Swal.fire({
          //   title: "OTP Sent!",
          //   text: "A 4-digit OTP has been sent to your WhatsApp number.",
          //   icon: "success",
          //   confirmButtonColor: "#F81E0F",
          //   timer: 2000,
          //   timerProgressBar: true,
          // });
          setLoading(false);
          setShowOtp(true);
        }
      } else {
        setLoading(false);
        Swal.fire({
          title: "Invalid Number",
          text: "Please enter a valid 10-digit WhatsApp number.",
          icon: "error",
          confirmButtonColor: "#F81E0F",
        });
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
      Swal.fire({
        title: "Authentication  Failed",
        text:
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          "OTP Authentication failed.",
        icon: "error",
        confirmButtonColor: "#F81E0F",
      });
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (otp.length === 6) {
        let res = await axios.post(
          "http://localhost:7013/api/packer/verificationPacker",
          {
            mobileNumber: whatsappNumber,
            otp: otp,
          }
        );

        if (res.status == 200) {
          localStorage.clear();
          setTimeout(() => {
            localStorage.setItem("packer", JSON.stringify(res.data.data));
            localStorage.setItem("packer-token", res.data.token);
          }, 200);

          Swal.fire({
            title: "Login Successful!",
            text: "Welcome to the DailyDish Packer Dashboard!",
            icon: "success",
            confirmButtonColor: "#F81E0F",
            timer: 2000,
            timerProgressBar: true,
          }).then(() => navigate("/packer-dashboard"));
        }
      } else {
        Swal.fire({
          title: "Invalid OTP",
          text: "Please enter a valid 6-digit OTP.",
          icon: "error",
          confirmButtonColor: "#F81E0F",
        });
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
      Swal.fire({
        title: "OTP Authentication",
        text:
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          "OTP Authentication failed.",
        icon: "error",
        confirmButtonColor: "#F81E0F",
      });
    }
  };

  return (
    <div className="packer-login-container">
      <div className="packer-overlay"></div>
      <div className="card shadow p-4 packer-login-card">
        <h3
          className="text-center mb-2 packer-login-title"
          style={{ color: "#F81E0F", fontWeight: "bold" }}
        >
          {showOtp ? "Verify OTP" : "Packer Login"}
        </h3>
        <p className="text-center mb-4 packer-login-subtitle">
          Join the DailyDish Packing Team!
        </p>
        {!showOtp ? (
          <form onSubmit={handleWhatsappSubmit}>
            <div className="mb-4">
              <label className="form-label fw-bold">WhatsApp Number</label>
              <div className="input-group">
                <span className="input-group-text packer-input-icon bg-success text-white">
                  <FaWhatsapp />
                </span>
                <input
                  type="tel"
                  className="form-control packer-input"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="Enter 10-digit WhatsApp number"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            <button
              type="submit"
              className="btn w-100 packer-login-btn"
              style={{ backgroundColor: "#F81E0F", color: "white" }}
              disabled={loading}
            >
              {loading ? <span className="packer-spinner"></span> : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit}>
            <div className="mb-4">
              <label className="form-label fw-bold">OTP</label>
              <div className="input-group">
                <span className="input-group-text packer-input-icon bg-success text-white">
                  <FaLock />
                </span>
                <input
                  type="text"
                  className="form-control packer-input"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            <button
              type="submit"
              className="btn w-100 packer-login-btn"
              style={{ backgroundColor: "#F81E0F", color: "white" }}
              disabled={loading}
            >
              {loading ? (
                <span className="packer-spinner"></span>
              ) : (
                "Verify OTP"
              )}
            </button>
            <button
              className="btn btn-link w-100 mt-2 packer-change-number"
              onClick={() => {
                setShowOtp(false);
                setOtp("");
                setWhatsappNumber("");
              }}
              disabled={loading}
            >
              Change Number
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
