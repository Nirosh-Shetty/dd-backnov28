import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import "../Styles/LegalPage.css"; // We will create this CSS file

const LegalPage = () => {
  const navigate = useNavigate();

  return (
    <div className="legal-container">
      {/* Header */}
      <div className="legal-header">
        <button onClick={() => navigate(-1)} className="legal-back-button">
          <img src="/Assets/checkoutback.svg" alt="Back" className="icon-img-l" style={{ transform: "scaleX(-1)" }} />
        </button>
        <h1 className="legal-title">About & Legal</h1>
      </div>

      {/* Main Content */}
      <div className="legal-content">
        <button
          className="legal-button"
          onClick={() => navigate("/privacy-policy")}
        >
          <span>Privacy Policy</span>
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
        <button
          className="legal-button"
          onClick={() => navigate("/termsconditions")}
        >
          <span>Terms & Conditions</span>
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
    </div>
  );
}
export default LegalPage;