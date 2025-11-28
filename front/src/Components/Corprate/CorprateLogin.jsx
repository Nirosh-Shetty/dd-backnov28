import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { FaPhone, FaKey, FaWhatsappSquare } from "react-icons/fa";

function CorporateLogin() {
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const navigate = useNavigate();

  const requestOtp = async () => {
    try {
      if (!mobileNumber || mobileNumber.length !== 10) {
        return toast.warning("Please enter a valid 10-digit mobile number");
      }

      const config = {
        url: "/admin/Loginwithotp",
        method: "post",
        baseURL: "http://localhost:7013/api",
        headers: { "content-type": "application/json" },
        data: { mobile: mobileNumber },
      };

      let res = await axios(config);

      if (res.status === 200) {
        if (res.data.success) {
          toast.success("OTP successfully sent on your whatsapp number!");
          setIsOtpSent(true);
        } else {
          toast.warning("Failed to send OTP");
        }
      }
    } catch (error) {
      toast.error(
        error.response?.data?.error || "An error occurred while sending OTP"
      );
      console.log(error);
    }
  };

  const verifyOtp = async () => {
    try {
      if (!otp || otp.length !== 6) {
        return toast.warning("Please enter a valid 6-digit OTP");
      }

      const config = {
        url: "/admin/verifyOtpCorprate",
        method: "post",
        baseURL: "http://localhost:7013/api",
        headers: { "content-type": "application/json" },
        data: { mobile: mobileNumber, otp: otp },
      };

      let res = await axios(config);

      if (res.status === 200) {
        if (res.data.success) {
          toast.success("Successfully logged in");
          localStorage.setItem("corporate", JSON.stringify(res.data.check));
          navigate("/corporate-dashboard");
        } else {
          toast.warning("Invalid OTP");
        }
      }
    } catch (error) {
      toast.error(
        error.response?.data?.error || "An error occurred during verification"
      );
      console.log(error);
    }
  };

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={true}
        closeOnClick
        draggable
      />
      <style>
        {`
          .form-floating > label {
            transform-origin: top left;
            padding: 12px 12px 12px 48px;
            transition: all 0.2s ease;
            color: #6c757d;
          }

          .form-floating > .form-control:focus ~ label,
          .form-floating > .form-control:not(:placeholder-shown) ~ label {
            transform: scale(0.85) translateY(-1.8rem) translateX(0.2rem);
          
            color: #0056b3;
           
          }

          .form-floating > .form-control {
            padding-top: 2rem;
            padding-bottom: 0.5rem;
            padding-left: 3.5rem;
            line-height: 1.5;
            height: 65px;
          }

          .form-floating > .form-control::placeholder {
            color: transparent;
          }
        `}
      </style>
      <div
        className="min-vh-100 d-flex align-items-center justify-content-center"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1920&auto=format&fit=crop")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div
          className="card border-0 rounded-5 w-100 animate__animated animate__zoomIn"
          style={{
            maxWidth: "420px",
            background:
              "linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(240, 240, 245, 0.95))",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
          }}
        >
          <div className="card-body p-5">
            <div className="text-center mb-5">
              <img
                src="../logo512.png"
                alt="DailyDish Logo"
                className="img-fluid"
                style={{
                  //   maxWidth: '150px',
                  width: "150px",
                  height: "80px",
                  //   objectFit: 'contain'
                }}
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/150?text=Logo";
                }}
              />
              <h3 className="mt-4 fw-bold text-dark display-5">
                Corporate Login
              </h3>
            </div>

            <form>
              {!isOtpSent ? (
                <div className="mb-4 position-relative">
                  <div className="form-floating">
                    <input
                      type="tel"
                      className="form-control form-control-lg rounded-3 shadow-sm"
                      id="mobile"
                      placeholder="Mobile Number"
                      value={mobileNumber}
                      onChange={(e) =>
                        setMobileNumber(e.target.value.replace(/\D/g, ""))
                      }
                      maxLength={10}
                      required
                    />
                    <label htmlFor="mobile" className="form-label fw-medium">
                      Mobile Number
                    </label>
                    <FaWhatsappSquare
                      size={35}
                      className="position-absolute"
                      color="green"
                      style={{
                        top: "60%",
                        left: "10px",
                        transform: "translateY(-50%)",
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="mb-4 position-relative">
                  <div className="form-floating">
                    <input
                      type="text"
                      className="form-control form-control-lg rounded-3 shadow-sm"
                      id="otp"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, ""))
                      }
                      maxLength={6}
                      required
                    />
                    <label htmlFor="otp" className="form-label fw-medium">
                      Enter OTP
                    </label>
                    <FaKey
                      className="position-absolute text-primary"
                      style={{
                        top: "50%",
                        left: "15px",
                        transform: "translateY(-50%)",
                        fontSize: "1.2rem",
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="d-flex justify-content-center mb-4">
                <button
                  type="button"
                  className="btn btn-primary px-5 py-3 rounded-3 fw-bold shadow-sm"
                  style={{
                    background: "linear-gradient(90deg, #007bff, #00aaff)",
                    border: "none",
                    transition: "transform 0.2s ease, opacity 0.2s ease",
                  }}
                  onClick={isOtpSent ? verifyOtp : requestOtp}
                  onMouseOver={(e) => {
                    e.target.style.opacity = "0.9";
                    e.target.style.transform = "scale(1.05)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.opacity = "1";
                    e.target.style.transform = "scale(1)";
                  }}
                >
                  {isOtpSent ? "Verify OTP" : "Request OTP"}
                </button>
              </div>

              {isOtpSent && (
                <div className="text-center mt-3">
                  <button
                    type="button"
                    className="btn btn-link text-primary fw-medium"
                    style={{
                      textDecoration: "none",
                      transition: "color 0.3s ease",
                    }}
                    onClick={() => {
                      setIsOtpSent(false);
                      setOtp("");
                    }}
                    onMouseOver={(e) => (e.target.style.color = "#0056b3")}
                    onMouseOut={(e) => (e.target.style.color = "#007bff")}
                  >
                    Change Number
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default CorporateLogin;
