import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../Styles/BottomNav.css";
import { BiFoodMenu } from "react-icons/bi";
import { FaCalendarAlt } from "react-icons/fa";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  
  // Use Ref for scroll position to avoid re-binding event listeners constantly
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Threshold of 10px to prevent jitter
      if (Math.abs(currentScrollY - lastScrollY.current) < 10) return;

      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        // Scrolling DOWN -> Hide
        setIsVisible(false);
      } else {
        // Scrolling UP -> Show
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- CRITICAL FIX FOR OVERLAP ---
  // We set a CSS variable on the body so OTHER components (like Cart Bar) know where to sit
  useEffect(() => {
    if (isVisible) {
      document.body.classList.add("nav-visible");
      document.body.classList.remove("nav-hidden");
    } else {
      document.body.classList.add("nav-hidden");
      document.body.classList.remove("nav-visible");
    }
  }, [isVisible]);

  const activeTab = location.pathname.includes("my-plan") ? "plan" : "menu";

  return (
    <div className={`bottom-nav-container ${isVisible ? "" : "bottom-nav-hidden"}`}>
      <button 
        className={`nav-item ${activeTab === "menu" ? "active" : ""}`}
        onClick={() => navigate("/home")}
      >
        <BiFoodMenu size={24} className="nav-icon-svg" style={{ fill: activeTab === "menu" ? "#6b8e23" : "#c0c0c0" }} />
        <span className="nav-label">Menu</span>
      </button>

      <button 
        className={`nav-item ${activeTab === "plan" ? "active" : ""}`}
        onClick={() => navigate("/my-plan")}
      >
        <FaCalendarAlt size={22} className="nav-icon-svg" style={{ fill: activeTab === "plan" ? "#6b8e23" : "#c0c0c0" }} />
        <span className="nav-label">My Plan</span>
      </button>
    </div>
  );
};

export default BottomNav;