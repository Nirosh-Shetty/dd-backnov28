import React, { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faSpinner,
  faBackspace,
  faTimes,
  faPaste,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp as faWhatsappBrand } from "@fortawesome/free-brands-svg-icons";
import { Colors } from "../Helper/themes";
import "../Styles/Validate.css"; // We'll create this CSS file
import Swal2 from "sweetalert2";
import axios from "axios";

export default function Validate() {
  const navigate = useNavigate();
  const location = useLocation();
  const { phone, Fname } = location.state || {};
  const [loader, setLoader] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(15);
  const [currentInputIndex, setCurrentInputIndex] = useState(0);
  const inputs = useRef([]);

  const user = JSON.parse(localStorage.getItem("user"));

  const handleVerify = useCallback(
    async (code) => {
      setLoader(true);
      try {
        const capturedReferralCode = localStorage.getItem("referralCode");

        const payload = {
          Mobile: phone,
          otp: code,
          Fname: Fname,
        };

        if (capturedReferralCode) {
          payload.referralCode = capturedReferralCode;
        }

        const config = {
          url: "/User/mobileotpverification",
          method: "post",
          baseURL: "http://localhost:7013/api",
          headers: { "content-type": "application/json" },
          data: payload,
        };

        const res = await axios(config);

        if (res.status === 200) {
          setLoader(false);
          const userData = res.data.details;
          localStorage.setItem("user", JSON.stringify(userData));
          localStorage.setItem("addresstype", "corporate");

          if (capturedReferralCode) {
            localStorage.removeItem("referralCode");
            console.log("Referral code used and cleared.");
          }

          // ✅ Redirect logic based on address availability
          const hasAddresses =
            Array.isArray(userData.addresses) && userData.addresses.length > 0;

          setTimeout(() => {
            if (hasAddresses) {
              window.location.replace("/home");
            } else {
              window.location.replace("/current-location");
            }
          }, 100);
          Swal2.fire({
            toast: true,
            position: "bottom",
            icon: "success",
            title: `OTP verified successfully`,
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
        setLoader(false);
        Swal2.fire({
          toast: true,
          position: "bottom",
          icon: "error",
          title: `${
            error.response?.data?.error ||
            error.response?.data?.message ||
            "Error verifying OTP"
          }`,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          customClass: {
            popup: "me-small-toast",
            title: "me-small-toast-title",
          },
        });
      }
    },
    [phone, Fname, navigate]
  );

  useEffect(() => {
    if (countdown === 0) return; // stop countdown

    const timerId = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [countdown]);

  const handleChange = (text, idx) => {
    // Only allow numbers
    if (!/^\d*$/.test(text)) return;

    let chars = text.split("");

    if (chars.length > 1) {
      // Handle multiple characters (paste or type)
      const arr = chars.slice(0, 6);
      const newOtp = arr.concat(Array(6 - arr.length).fill(""));
      setOtp(newOtp);
      setCurrentInputIndex(Math.min(arr.length, 5));

      // Focus the next empty input or last filled input
      if (arr.length < 6 && inputs.current[arr.length]) {
        inputs.current[arr.length].focus();
      } else if (arr.length === 6) {
        // All inputs filled, focus last input
        if (inputs.current[5]) {
          inputs.current[5].focus();
        }
        // ✅ Only call when full OTP entered
        setTimeout(() => {
          handleVerify(newOtp.join(""));
        }, 200);
      }
    } else {
      // Single character entry
      const temp = [...otp];
      temp[idx] = text;
      setOtp(temp);
      setCurrentInputIndex(idx);

      // Move to next input if current is filled
      if (text && idx < 5 && inputs.current[idx + 1]) {
        inputs.current[idx + 1].focus();
        setCurrentInputIndex(idx + 1);
      }

      // ✅ Call verify only when all boxes filled
      if (temp.every((digit) => digit !== "")) {
        setTimeout(() => {
          handleVerify(temp.join(""));
        }, 200);
      }
    }
  };

  // Enhanced paste handler for better mobile support
  const handleInputPaste = async (e, idx) => {
    e.preventDefault();
    let pastedData = "";

    try {
      // For mobile, prioritize clipboardData as it's more reliable
      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );

      if (isMobile) {
        // Mobile: Use clipboardData first
        pastedData = e.clipboardData?.getData("text") || "";

        // If clipboardData is empty, try clipboard API
        if (
          !pastedData &&
          navigator.clipboard &&
          navigator.clipboard.readText
        ) {
          try {
            pastedData = await navigator.clipboard.readText();
          } catch (clipboardErr) {
            console.log("Mobile clipboard API failed:", clipboardErr);
          }
        }
      } else {
        // Desktop: Try clipboard API first
        if (navigator.clipboard && navigator.clipboard.readText) {
          pastedData = await navigator.clipboard.readText();
        } else {
          // Fallback to clipboardData
          pastedData = e.clipboardData?.getData("text") || "";
        }
      }
    } catch (err) {
      // Final fallback
      pastedData = e.clipboardData?.getData("text") || "";
    }

    if (pastedData) {
      const cleanData = pastedData.replace(/\D/g, "");

      if (cleanData.length > 0) {
        // Always start from the first position and fill all boxes
        const newOtp = Array(6).fill("");
        for (let i = 0; i < Math.min(cleanData.length, 6); i++) {
          newOtp[i] = cleanData[i];
        }

        setOtp(newOtp);
        setCurrentInputIndex(Math.min(cleanData.length, 5));

        // Show success feedback
        Swal2.fire({
          toast: true,
          position: "bottom",
          icon: "success",
          title: `Pasted ${cleanData.length} digit${
            cleanData.length > 1 ? "s" : ""
          }`,
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
          customClass: {
            popup: "me-small-toast",
            title: "me-small-toast-title",
          },
        });

        // Auto-verify if all filled
        if (cleanData.length >= 6) {
          setTimeout(() => {
            handleVerify(cleanData.substring(0, 6));
          }, 200);
        }
      }
    }
  };

  // Enhanced paste button click with better mobile support
  const handlePasteButton = useCallback(async () => {
    try {
      let pastedData = "";
      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );

      if (isMobile) {
        // For mobile, focus first input to allow paste via keyboard
        if (inputs.current[0]) {
          inputs.current[0].focus();
        }

        // Try clipboard API
        if (navigator.clipboard && navigator.clipboard.readText) {
          try {
            pastedData = await navigator.clipboard.readText();
          } catch (clipboardError) {
            console.log("Clipboard API failed:", clipboardError);
          }
        }
      } else {
        // For desktop, try clipboard API
        if (navigator.clipboard && navigator.clipboard.readText) {
          try {
            pastedData = await navigator.clipboard.readText();
          } catch (clipboardError) {
            console.log("Clipboard API failed:", clipboardError);
            // Fallback to execCommand for desktop
            const textArea = document.createElement("textarea");
            textArea.style.position = "fixed";
            textArea.style.left = "-999999px";
            textArea.style.top = "-999999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            try {
              const successful = document.execCommand("paste");
              if (successful) {
                pastedData = textArea.value;
              }
            } catch (err) {
              console.log("Fallback paste failed:", err);
            }

            document.body.removeChild(textArea);
          }
        }
      }

      if (pastedData) {
        // Clean the data - remove all non-digit characters
        const cleanData = pastedData.replace(/\D/g, "");

        if (cleanData.length > 0) {
          const newOtp = Array(6).fill("");
          for (let i = 0; i < Math.min(cleanData.length, 6); i++) {
            newOtp[i] = cleanData[i];
          }

          setOtp(newOtp);
          setCurrentInputIndex(Math.min(cleanData.length, 5));

          // Show success feedback
          Swal2.fire({
            toast: true,
            position: "bottom",
            icon: "success",
            title: `Pasted ${cleanData.length} digit${
              cleanData.length > 1 ? "s" : ""
            }`,
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true,
            customClass: {
              popup: "me-small-toast",
              title: "me-small-toast-title",
            },
          });

          // Auto-verify if all 6 digits are filled
          if (cleanData.length >= 6) {
            setTimeout(() => {
              handleVerify(cleanData.substring(0, 6));
            }, 200);
          }
        } else {
          // Show message if no digits found
          Swal2.fire({
            toast: true,
            position: "bottom",
            icon: "info",
            title: "No numbers found in clipboard",
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            customClass: {
              popup: "me-small-toast",
              title: "me-small-toast-title",
            },
          });
        }
      } else {
        // Show message if clipboard is empty
        Swal2.fire({
          toast: true,
          position: "bottom",
          icon: "info",
          title: "Clipboard is empty",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          customClass: {
            popup: "me-small-toast",
            title: "me-small-toast-title",
          },
        });
      }
    } catch (error) {
      console.log("Paste failed:", error);
      // Show user-friendly message
      Swal2.fire({
        toast: true,
        position: "bottom",
        icon: "error",
        title: "Unable to access clipboard. Please paste manually.",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: "me-small-toast",
          title: "me-small-toast-title",
        },
      });
    }
  }, [handleVerify]);

  // Listen for backspace
  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      // If this box is empty, go back
      if (otp[idx] === "" && idx > 0) {
        const temp = [...otp];
        temp[idx - 1] = "";
        setOtp(temp);
        setCurrentInputIndex(idx - 1);
        if (inputs.current[idx - 1]) {
          inputs.current[idx - 1].focus();
        }
      } else {
        // Delete current box
        const temp = [...otp];
        temp[idx] = "";
        setOtp(temp);
        setCurrentInputIndex(idx);
      }
    } else if (e.key === "Enter") {
      if (otp.every((digit) => digit !== "")) {
        handleVerify(otp.join(""));
      }
    }
    // Allow arrow keys for navigation
    if (e.key === "ArrowLeft" && idx > 0) {
      e.preventDefault();
      setCurrentInputIndex(idx - 1);
      if (inputs.current[idx - 1]) {
        inputs.current[idx - 1].focus();
      }
    } else if (e.key === "ArrowRight" && idx < 5) {
      e.preventDefault();
      setCurrentInputIndex(idx + 1);
      if (inputs.current[idx + 1]) {
        inputs.current[idx + 1].focus();
      }
    }
  };

  // Handle input focus
  const handleInputFocus = (idx) => {
    setCurrentInputIndex(idx);
  };

  // Global paste handler and keyboard shortcuts
  useEffect(() => {
    const handleGlobalPaste = async (e) => {
      // Only handle paste if we're not already in an input
      if (e.target.tagName !== "INPUT") {
        let pastedData = "";

        try {
          // Try clipboard API first
          if (navigator.clipboard && navigator.clipboard.readText) {
            pastedData = await navigator.clipboard.readText();
          } else {
            // Fallback to clipboardData
            pastedData = e.clipboardData?.getData("text") || "";
          }
        } catch (err) {
          // Final fallback
          pastedData = e.clipboardData?.getData("text") || "";
        }

        if (pastedData) {
          const cleanData = pastedData.replace(/\D/g, "");
          if (cleanData.length >= 4) {
            // Only handle if it looks like an OTP
            const newOtp = Array(6).fill("");
            for (let i = 0; i < Math.min(cleanData.length, 6); i++) {
              newOtp[i] = cleanData[i];
            }
            setOtp(newOtp);
            setCurrentInputIndex(Math.min(cleanData.length, 5));

            // Show feedback for successful paste
            Swal2.fire({
              toast: true,
              position: "bottom",
              icon: "success",
              title: `Auto-pasted ${cleanData.length} digit${
                cleanData.length > 1 ? "s" : ""
              }`,
              showConfirmButton: false,
              timer: 1500,
              timerProgressBar: true,
              customClass: {
                popup: "me-small-toast",
                title: "me-small-toast-title",
              },
            });

            if (cleanData.length >= 6) {
              setTimeout(() => {
                handleVerify(cleanData.substring(0, 6));
              }, 200);
            }
          }
        }
      }
    };

    // Desktop keyboard shortcuts
    const handleKeyDown = (e) => {
      // Ctrl+V or Cmd+V for paste
      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        e.preventDefault();
        handlePasteButton();
        return;
      }

      // Enter key to verify if all fields are filled (global fallback)
      if (e.key === "Enter" && document.activeElement.tagName !== "INPUT") {
        e.preventDefault();
        if (otp.every((digit) => digit !== "")) {
          handleVerify(otp.join(""));
        }
        return;
      }
    };

    document.addEventListener("paste", handleGlobalPaste);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("paste", handleGlobalPaste);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleVerify, otp, handlePasteButton]);

  const handleResendOTP = async () => {
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
      if (res.status === 200) {
        setLoader(false);
        setCountdown(15);
        if (inputs.current[0]) {
          inputs.current[0].focus();
        }
        Swal2.fire({
          toast: true,
          position: "bottom",
          icon: "success",
          title: `Hi ${Fname}, OTP resent successfully on your whatsapp number`,
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          customClass: {
            popup: "me-small-toast",
            title: "me-small-toast-title",
          },
        });
      }
    } catch (error) {
      setLoader(false);
      Swal2.fire({
        toast: true,
        position: "bottom",
        icon: "error",
        title: `${
          error.response.data.error ||
          error.response.data.message ||
          "Error sending OTP"
        }`,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: "me-small-toast",
          title: "me-small-toast-title",
        },
      });
      console.log(error);
    }

    // Add your resend OTP logic here
  };

  return (
    <div className="validate-container">
      {/* Header */}
      <div className="validate-header">
        <button onClick={() => navigate(-1)} className="back-button">
          <FontAwesomeIcon
            icon={faArrowLeft}
            size="lg"
            height={24}
            width={24}
            className="back-button-icon"
          />
        </button>
        <div className="header-center">
          <h1 className="validate-title">OTP Verification</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="validate-content">
        <p className="validate-subtitle">
          We have sent a One-Time Password to{" "}
        </p>

        <div className="phone-display">
          <FontAwesomeIcon
            icon={faWhatsappBrand}
            className="whatsapp-icon"
            color="#2C2C2C"
          />
          <span className="phone-number">+91 {phone}</span>
        </div>

        <div className="otp-container">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(ref) => (inputs.current[i] = ref)}
              className={`otp-input ${currentInputIndex === i ? "active" : ""}`}
              type="text"
              inputMode="numeric"
              maxLength={i === 0 ? 6 : 1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              onPaste={(e) => handleInputPaste(e, i)}
              onFocus={() => handleInputFocus(i)}
              autoComplete="off"
              placeholder="*"
            />
          ))}
        </div>

        <div className="resend-section">
          <span className="resend-text">Didn't get the OTP? </span>
          <div className="resend-timer-wrapper">
            {countdown > 0 ? (
              <span className="resend-timer">
                Resend it in{" "}
                <span className="resend-countdown">{countdown}s</span>
              </span>
            ) : (
              <button onClick={handleResendOTP} className="resend-button">
                {loader ? (
                  <FontAwesomeIcon
                    icon={faSpinner}
                    size="lg"
                    color={Colors.warmWood}
                    className="spinning"
                  />
                ) : (
                  <span className="resend-now">Resend OTP</span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Paste Button */}
        {/* <div className="paste-section">
          <button onClick={handlePasteButton} className="paste-button">
            <FontAwesomeIcon icon={faPaste} />
            <span>Paste</span>
          </button>
        </div> */}

        {/* <button className="verify-button" onClick={handleVerify}>
          <span className="verify-text">Verify</span>
        </button>

        <button onClick={() => navigate(-1)} className="other-login-button">
          <span className="other-login-text">Other login methods</span>
        </button> */}
      </div>
    </div>
  );
}
