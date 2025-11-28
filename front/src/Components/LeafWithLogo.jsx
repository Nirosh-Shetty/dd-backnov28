import React, { useMemo, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faGoogle, faCcDiscover } from "@fortawesome/free-brands-svg-icons";
import Logo from "../assets/logo-container.svg";
// import LeafSvg from "../assets/leafbanana.svg";
import { Colors } from "../Helper/themes";
import "../Styles/LeafWithLogo.css";
import Swal2 from "sweetalert2";
import axios from "axios";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
const LOGO_BASE_W = 768;
const LOGO_BASE_H = 475;
const LOGO_PADDING = 32;

export default function LeafWithLogo() {
  const [screenW, setScreenW] = useState(window.innerWidth);
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [loader, setLoader] = useState(false);
  useEffect(() => {
    const handleResize = () => setScreenW(Math.min(window.innerWidth, 400)); // Fixed to 400 for consistent mobile width
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (user) {
      setTimeout(() => {
        navigate("/home", { replace: true });
      }, 200);
    }
  }, []);

  // const location = useLocation();
  const { referralCode } = useParams();
  useEffect(() => {
    // const params = new URLSearchParams(location.search);
    // const referralCode = params.get("ref");

    if (referralCode) {
      localStorage.setItem("referralCode", referralCode);
      console.log("Referral code captured:", referralCode);
    }
  }, []);
  const headerVariants = {
    hidden: { y: -100 },
    visible: {
      y: 0,
      transition: { duration: 0.8, delay: 0.2, ease: "easeOut" },
    },
  };

  // Fixed sizing for consistent mobile appearance
  const containerWidth = 360; // Fixed container width
  const leafWidth = Math.max(0, containerWidth - 24); // Always use container width, not screen width
  const leafAR = useMemo(() => 1.5, []);
  const leafHeight = Math.max(0, leafWidth / leafAR);
  const logoMaxW = Math.max(0, leafWidth - 2 * LOGO_PADDING);
  const logoMaxH = Math.max(0, leafHeight - 2 * LOGO_PADDING);
  const scale = Math.min(logoMaxW / LOGO_BASE_W, logoMaxH / LOGO_BASE_H, 1);
  const LOGO_W = Math.round(LOGO_BASE_W * scale);
  const LOGO_H = Math.round(LOGO_BASE_H * scale);

  const handleContinueAsGuest = () => {
    // navigate("/home", { state: { phone: null, isVerified: false } });
    window.location.replace("/home");
  };

  const handleOtpClick = async () => {
    if (!customerName) {
      Swal2.fire({
        toast: true,
        position: "bottom",
        icon: "error",
        title: `Please enter your full name.`,
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
    if (!phone) {
      Swal2.fire({
        toast: true,
        position: "bottom",
        icon: "error",
        title: `Please enter your phone number.`,

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
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      Swal2.fire({
        toast: true,
        position: "bottom",
        icon: "error",
        title: `Please enter a valid 10-digit phone number.`,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: "me-small-toast",
          title: "me-small-toast-title",
        },
      });
      //   alert("Please enter a valid 10-digit phone number.");
      return;
    }
    setLoader(true);
    try {
      const config = {
        url: "/User/Sendotp",
        method: "post",
        baseURL: "http://localhost:7013/api",

        headers: { "content-type": "application/json" },
        data: {
          Mobile: phone,
        },
      };

      const res = await axios(config);
      if (res.status === 401) {
        return Swal2.fire({
          toast: true,
          position: "bottom",
          icon: "error",
          title: `Invalid Phone Number`,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          customClass: {
            popup: "me-small-toast",
            title: "me-small-toast-title",
          },
        });
      }
      if (res.status === 402) {
        return Swal2.fire({
          toast: true,
          position: "bottom",
          icon: "error",
          title: `Error sending OTP`,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          customClass: {
            popup: "me-small-toast",
            title: "me-small-toast-title",
          },
        });
      }
      if (res.status === 200) {
        Swal2.fire({
          toast: true,
          position: "bottom",
          icon: "success",
          title: `Hi ${customerName}, OTP sent successfully on your whatsapp number`,
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          customClass: {
            popup: "me-small-toast",
            title: "me-small-toast-title",
          },
        });
        setTimeout(() => {
          setLoader(false);
          navigate("/otp-varification", {
            state: { phone, Fname: customerName },
          });
        }, 2000);
      }
    } catch (error) {
      setLoader(false);
      Swal2.fire({
        toast: true,
        position: "bottom",
        icon: "error",
        title: error.response?.data?.error || `Something went wrong!`,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: "me-small-toast",
          title: "me-small-toast-title",
        },
      });
      console.log("error", error.message);
    }
  };

  return (
    <div className="login-container">
      <motion.div
        className="header-wrapper"
        initial="hidden"
        animate="visible"
        variants={headerVariants}
      >
        <div className="login-header">
          <div
            className="logo-container"
            style={{
              width: leafWidth,
              height: leafHeight,
              position: "relative",
            }}
          >
            <img
              src="/Assets/leafbanana.svg"
              width={leafWidth}
              height={leafHeight}
              alt="Leaf Background"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: (leafWidth - LOGO_W) / 2,
                top: (leafHeight - LOGO_H) / 2,
                width: LOGO_W,
                height: LOGO_H,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <img
                src={Logo}
                width={LOGO_W}
                height={LOGO_H}
                alt="Logo"
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="main-content">
        <div className="divider-row">
          <div className="divider-line"></div>
          <div className="divider-badge">
            <span className="divider-text">Log in or Sign-up</span>
          </div>
          <div className="divider-line"></div>
        </div>

        <div className="customer-name">
          <input
            className="customer-name-input"
            placeholder="Enter your full name"
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </div>

        <div className="phone-row">
          <div className="input-group-phone">
            <div className="prefix-box-phone">
              <span className="prefix-text-phone">+91</span>
            </div>
            <input
              className="phone-input"
              placeholder="Enter phone number"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <button
            className="otp-button"
            onClick={handleOtpClick}
            disabled={loader}
          >
            {loader ? (
              <FontAwesomeIcon
                icon={faSpinner}
                size="lg"
                color={Colors.warmWood}
              />
            ) : (
              <span className="otp-text">Get OTP</span>
            )}
          </button>
        </div>

        {/* Uncomment if you want to add social login options */}
        {/* <div className="divider-row">
          <div className="divider-line"></div>
          <div className="divider-badge">
            <span className="divider-text">OR</span>
          </div>
          <div className="divider-line"></div>
        </div>

        <div className="social-login-row">
          <button
            className="social-login-button"
            onClick={() => navigate("/google-login")}
          >
            <FontAwesomeIcon icon={faGoogle} size="lg" color={Colors.warmWood} />
          </button>
          <button
            className="social-login-button"
            onClick={() => navigate("/google-login")}
          >
            <FontAwesomeIcon icon={faCcDiscover} size="lg" color={Colors.warmWood} />
          </button>
        </div> */}
      </div>

      <div className="footer">
        <button onClick={handleContinueAsGuest} className="guest-text">
          Skip, Just here for the Menu
        </button>
        <p className="terms-and-conditions-text">
          By continuing, you agree to our{" "}
          <a
            href="/termsconditions"
            className="link-text-terms"
            // target="_blank"
            rel="noopener noreferrer"
            color={Colors.greenCardamom}
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="/privacy-policy"
            className="link-text-terms"
            // target="_blank"
            rel="noopener noreferrer"
            color={Colors.greenCardamom}
          >
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
