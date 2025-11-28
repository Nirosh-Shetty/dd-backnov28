import React, { useState } from "react";

import Adminheader from "../Admin/AdminHeader";
import { Link } from "react-router-dom";
import {
  MdDiscount,
  MdOutlineSmartScreen,
  MdOutlineSupportAgent,
  MdSubject,
} from "react-icons/md";
import swal from "sweetalert";
import { Button, Modal, Table, Image } from "react-bootstrap";

import { LuAlignHorizontalJustifyStart } from "react-icons/lu";
// import { useTheme } from "../Context/ThemeContext";
import Navbar from "react-bootstrap/Navbar";
import { GiHamburgerMenu, GiWallet } from "react-icons/gi";
import { AiOutlineClose, AiOutlineLogout } from "react-icons/ai";
import { BsFillBuildingsFill } from "react-icons/bs";
import { FaWeightHanging } from "react-icons/fa";
import { CiDiscount1 } from "react-icons/ci";
import { MdProductionQuantityLimits } from "react-icons/md";
import axios from "axios";
import { HiMiniWallet } from "react-icons/hi2";
import "../Admin/Admin.css";

const CorporateLayout = (props) => {
    const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);
  const [show5, setShow5] = useState();
  const handleClose5 = () => setShow5(false);
  const handleShow5 = () => setShow5(true);

  const logOut = () => {
    swal({
      title: "Yeah!",
      text: "Successfully Logged Out",
      icon: "success",
      button: "Ok!",
    });

    setTimeout(() => {
      window.location.assign("/");
    }, 1000);
    localStorage.removeItem("corporate");
    handleClose5()
  };
  return (
    <div>
      <div className="dash">
        <div className="admin-all">
          <div className="admin-sidebar-display" >
            <div
              className="left-side"
              style={{ position: "sticky", top: "0", height: "100vh" }}
            >
               <div>
      <Navbar expand="lg" className=" p-0">
        <button
          class="custom-toggler navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarsExample09"
          aria-controls="navbarsExample09"
          aria-expanded={!isNavCollapsed ? true : false}
          aria-label="Toggle navigation"
          
          style={{ margin: "10px" }}
        >
          <span>
            <GiHamburgerMenu style={{ color: "white" }} />
          </span>
        </button>
        <div
          class={`${isNavCollapsed ? "collapse" : ""} navbar-collapse`}
          id="navbarsExample09"
        >
          <div className="si09">
            <div style={{ width: "100%", justifyContent: "space-between" }}>
              <div
                className="lo-ad"
                style={{ background: "white", borderBottom: "1px solid white" }}
              >
                <div className="">
                  <a href="/corporate-dashboard" className="tail-text">
                    <img
                      src="../Assets/dailydishlogo.jpeg"
                      alt="Logo"
                      className="admin-logo-img"
                      style={{ width: "300px", height: "65px", padding: "5px" }}
                    />
                  </a>
                </div>
              </div>
              <div className="sidebar-close-icon" >
                <AiOutlineClose />
              </div>
            </div>
            <ul>
              <Link to="/corporate-dashboard" >
                <li className="a-ele ">
                  <span>
                    <MdOutlineSupportAgent style={{ fontSize: "20px" }} />
                  </span>
                  <span className="ms-2">Dashboard</span>
                </li>
              </Link>
              <Link to="/corporate-employees" >
                <li className="a-ele ">
                  <span>
                    <HiMiniWallet  
                      style={{ fontSize: "20px" }}
                    />
                  </span>
                  <span className="ms-2">Employee List  </span>
                </li>
              </Link>
              <Link to="/employees-orders" >
                <li className="a-ele ">
                  <span>
                    <LuAlignHorizontalJustifyStart
                      style={{ fontSize: "20px" }}
                    />
                  </span>
                  <span className="ms-2">
                  Employees Orders{" "}
                    {/* <span className="sidebar-count">
                     {0}
                    </span> */} 
                  </span>
                </li>
              </Link>

              {/* <Link to="/employees-cart" >
                <li className="a-ele ">
                  <span>
                    <MdProductionQuantityLimits
                      style={{ fontSize: "20px" }}
                    />
                  </span>
                  <span className="ms-2">Abandoned Cart </span>
                </li>
              </Link> */}

              {/* <Link to="/admin/walletseting" >
                <li className="a-ele ">
                  <span>
                    <GiWallet 
                      style={{ fontSize: "20px" }}
                    />
                  </span>
                  <span className="ms-2">Wallet Setting </span>
                </li>
              </Link> */}

             
           

            </ul>
          </div>
        </div>
      </Navbar>
    </div>
            </div>
          </div>

          <div className="right-admin main-content">
          <div>
          <Modal
            show={show5}
            onHide={handleClose5}
            backdrop="static"
            keyboard={false}
            style={{ zIndex: "99999" }}
          >
            <Modal.Header closeButton>
              <Modal.Title>Warning</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="row">
                <div className="col-md-12">
                  <p className="fs-4" style={{ color: "red" }}>
                    Are you sure?
                    <br /> Do you want to Logout?
                  </p>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant=""
                className="modal-close-btn"
                onClick={handleClose5}
              >
                Close
              </Button>
              <Button
                variant=""
                className="modal-add-btn"
                onClick={logOut}
              >
                Yes
              </Button>
            </Modal.Footer>
          </Modal>
      <div className="header">
        <div className="row justify-content-between align-items-center">
          <div
            className="mb-3"
            style={{
              border: "1px solid #80808029",
              height: "80px",
              backgroundColor: "#80808029",
            }}
          >
            <div
              className="d-flex justify-content-end mt-6"
              style={{ fontSize: "40px", padding: "18px 35px" }}
            >
              <AiOutlineLogout style={{color:"orangered",cursor:"pointer"}}               
              onClick={handleShow5}
              />
            </div>
          </div>

          {/* <div className="col-lg-7"></div> */}
          {/* <div
            className="col-lg-8  "
            style={{
              cursor: "pointer",
              display: "flex",
              justifyContent: "flex-end",
              gap: "30px",
              alignItems: "center",
              fontSize: "25px",
            }}
          >
            

             <img
              src="../assets/user.png"
              style={{ height: "50px", width: "50px" }}
            /> 
          </div> */}
        </div>
      </div>
    </div>
            {props.children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorporateLayout;
