import React, { useEffect,useState } from "react";
import { FaUserShield } from "react-icons/fa";
import { BsFillMoonStarsFill, BsSearch, BsSun } from "react-icons/bs";
// import { useTheme } from "../Context/ThemeContext";
import { Form, FormCheck } from "react-bootstrap";
import { AiOutlineLogout } from "react-icons/ai";
import "../Admin/Admin.css";
import swal from "sweetalert";
import { Button, Modal, Table, Image } from "react-bootstrap";

const AdminHeader = () => {
  // const admin = JSON.parse(localStorage.getItem("admin"));
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
      window.location.assign("/admin");
    }, 5000);
    localStorage.removeItem("admin");
  };
let admincheck =localStorage.getItem("admin");
if(!admincheck){
  window.location.assign("/admin");
}else
  return (
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
  );
};

export default AdminHeader;
