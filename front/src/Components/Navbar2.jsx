import React from "react";
import { Offcanvas } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Wallet,
  MessageSquare,
  FileText,
  //   Gift,
  LogOut,
  ChevronRight,
  BookOpen,
  //   Utensils,
  Lock,
  Youtube,
} from "lucide-react";
import swal from "sweetalert";
import "../Styles/Navbar2.css"; // The same CSS file as before

const ProfileOffcanvas = ({ show, handleClose }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  //   console.log(user, ' user in offcanvas');
  // --- Logic copied from your Banner.jsx ---
  const phoneNumber = "7204188504";
  const message = "Hello! I need assistance.";
  const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    message
  )}`;

  const handleLogout = () => {
    handleClose(); // Close the menu first
    swal({
      title: "Are you sure you want to log out?",
      icon: "warning",
      buttons: ["Cancel", "Logout"],
      dangerMode: true,
    }).then((willLogout) => {
      if (willLogout) {
        swal("Successfully Logged Out!", {
          icon: "success",
          timer: 1500,
          buttons: false,
        });
        localStorage.clear();
        setTimeout(() => {
          window.location.assign("/");
        }, 1500);
      }
    });
  };

  // This function closes the menu when a user clicks a link
  const handleLinkClick = (path) => {
    navigate(path);
    handleClose();
  };

  return (
    <Offcanvas
      show={show}
      onHide={handleClose}
      placement="end"
      className="profile-offcanvas"
      style={{
        backgroundColor: "#F8F6F0",
      }}
    >
      <Offcanvas.Body className="p-0">
        <div className="profile-container-in-offcanvas">
          {/* Header */}
          <div className="profile-header">
            {/* We only show user details if the user exists */}
            {user ? (
              <div className="user-info" style={{ paddingTop: "20px" }}>
                <button onClick={handleClose} className="nav-back-btn">
                  <img
                    src="/Assets/checkoutback.svg"
                    alt="Back"
                    className="icon-img-l"
                    style={{
                      WebkitTransform: "scaleX(-1)",
                      transform: "scaleX(-1)",
                    }}
                  />
                </button>
                {/* <div className="avatar"> */}
                <Link to="/profile"  style={{
                  display:"flex",
                  alignItems:"center",
                  justifyContent:"space-evenly"
                }}>
                <img
                  style={{
                    paddingRight: "10px",
                  }}
                  src="/Assets/profile.svg"
                  alt="profile"
                  // className="icon-img-l"
                />
                {/* </div> */}
                <div className="user-details">
                  <h4>{`${user.Fname} ${user.Lname || ""}`}</h4>
                  <p>
                    {/* {user.Mobile} | {user.Email} */}
                    {user.Mobile}
                  </p>
                </div>
                </Link>
              </div>
            ) : (
              <div className="user-info" style={{ paddingTop: "20px" }}>
                <button onClick={handleClose} className="nav-back-btn">
                  <img
                    src="/Assets/checkoutback.svg"
                    alt="Back"
                    className="icon-img-l"
                    style={{
                      WebkitTransform: "scaleX(-1)",
                      transform: "scaleX(-1)",
                    }}
                  />
                </button>
                <div className="avatar">
                  <Lock size={30} className="avatar-icon" />
                </div>
                <div className="user-details">
                  <h4>Welcome, Guest</h4>
                  <p>Login to unlock benefits</p>
                </div>
              </div>
            )}
          </div>

          {/* Body */}
          <div className="profile-body">
            {user ? (
              // --- MENU FOR LOGGED-IN USERS ---
              <>
                <div className="row g-3 top-widgets">
                  <div className="col-6">
                    <div
                      className="widget-card"
                      style={{
                        paddingLeft: "5px",
                      }}
                      onClick={() => handleLinkClick("/orders")}
                    >
                      <img
                        src="/Assets/lists.svg"
                        alt="WhatsApp"
                        className="icon-img-l"
                      />
                      <span>My Orders</span>
                    </div>
                  </div>
                  <div className="col-6">
                    <div
                      className="widget-card"
                      style={{
                        paddingLeft: "5px",
                      }}
                      onClick={() => handleLinkClick("/wallet")}
                    >
                      <img
                        src="/Assets/wallet1.svg"
                        alt="WhatsApp"
                        className="icon-img-l"
                      />
                      <span>My Wallet</span>
                    </div>
                  </div>
                </div>
                <div className="nav-list">
                  {/* <NavItem
                    icon={<User size={20} />}
                    text='My Profile'
                    onClick={() => handleLinkClick('/profile')}
                  /> */}
                  <NavItem
                    icon={
                      <img
                        src="/Assets/selectlocation.svg"
                        alt="Profile"
                        className="icon-img-l"
                      />
                    }
                    text="My Addresses"
                    onClick={() => handleLinkClick("/addresses")}
                  />
                   <NavItem
                icon={
                  <img
                    src="/Assets/gifticon.svg"
                    alt="Refer & Earn"
                    className="icon-img-l"
                  />
                }
                text="Refer & Earn"
                onClick={() => handleLinkClick('/refer')}
              />
                  <NavItemExternal
                    icon={
                      <img
                        src="/Assets/whatsapp.svg"
                        alt="WhatsApp"
                        className="icon-img-l"
                      />
                    }
                    text="Chat with us"
                    href={whatsappLink}
                  />
                  {/* <NavItem icon={<Gift size={20} />} text="Referral Zone" onClick={() => handleLinkClick('/refer')} /> */}
                  <NavItem
                    icon={
                      <img
                        src="/Assets/legal-document.svg"
                        alt="WhatsApp"
                        className="icon-img-l"
                      />
                    }
                    text="Policies and Terms"
                    onClick={() => handleLinkClick("/legal-page")}
                  />
                  {/* <NavItem
                    icon={<FileText size={20} />}
                    text='Terms & Conditions'
                    onClick={() => handleLinkClick('/termsconditions')}
                  /> */}
                  <NavItem
                    icon={
                      <img
                        src="/Assets/logout.svg"
                        alt="Back"
                        className="icon-img-l"
                      />
                    }
                    text="Logout"
                    onClick={handleLogout}
                  />
                </div>
              </>
            ) : (
              // --- MENU FOR GUESTS (LOGGED-OUT) ---
              <div className="nav-list">
                <NavItem
                  icon={<Lock size={20} />}
                  text="Login"
                  onClick={() => handleLinkClick("/")}
                />
                <NavItem
                  icon={<Youtube size={20} />}
                  text="Live Stream"
                  onClick={() => handleLinkClick("/livestreams")}
                />
                <NavItemExternal
                  icon={<MessageSquare size={20} />}
                  text="Chat with us"
                  href={whatsappLink}
                />
                <NavItem
                  icon={<FileText size={20} />}
                  text="Privacy Policy"
                  onClick={() => handleLinkClick("/privacy-policy")}
                />
                <NavItem
                  icon={<FileText size={20} />}
                  text="Terms & Conditions"
                  onClick={() => handleLinkClick("/termsconditions")}
                />
              </div>
            )}
          </div>
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

// Helper components for list items
const NavItem = ({ icon, text, onClick }) => (
  <div className="nav-item" onClick={onClick}>
    <div className="nav-item-content">
      <span className="nav-icon">{icon}</span>
      <span>{text}</span>
    </div>
    <img src="/Assets/circleleft.svg" alt="Back" className="icon-img-l" />
  </div>
);
const NavItemExternal = ({ icon, text, href }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="nav-item">
    <div className="nav-item-content">
      <span className="nav-icon">{icon}</span>
      <span>{text}</span>
    </div>
    <img src="/Assets/circleleft.svg" alt="Back" className="icon-img-l" />
  </a>
);

export default ProfileOffcanvas;
