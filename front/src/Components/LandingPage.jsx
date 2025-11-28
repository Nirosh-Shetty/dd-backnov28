import React, { useState } from "react";
import {
  Button,
  Card,
  Carousel,
  Container,
  Form,
  Modal,
} from "react-bootstrap";
import { FaCheck, FaHome } from "react-icons/fa";
import { MdApartment } from "react-icons/md";
import "../Styles/Landingpage.css";
import Banner from "./Banner";
import { IoMdHeart } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import swal from "sweetalert";
import UserBanner from "./UserBanner";

const LandingPage = () => {
  const [selectedOption, setSelectedOption] = useState("");
  const Navigate = useNavigate();

  const handleSelection = (option) => {
    setSelectedOption(option);

    // localStorage.setItem("addresstype", option);
    // localStorage.removeItem("address");
    // sessionStorage.removeItem("Savedaddress")
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Selected option:", selectedOption);
  };

  const [show, setShow] = useState();
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  // const Handeledata = () => {
  //   try {
  //     if (ab) {
  //       let data = JSON.parse(ab);
  //       localStorage.setItem("address", data?.Address);
  //       window.location.reload();
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };
  return (
    <div>
      <Container>
     
        <div className="row p-0 landingpage ">
      
      
          <div className="col-md-6 p-0 left">
            <div className="col-md-12">
              <img
                src="Assets/homeimg.JPG"
                alt=""
                className="landing-left-img"
              />
            </div>
          </div>
          
          <div className="col-md-6 mb-3">

            <div className="main">
           
              <div className="d-flex justify-content-center mt-3">
                <img
                  src="Assets/landinggif.gif"
                  alt=""
                  className="landinggif"
                />
              </div>

              <UserBanner/>

              <div className="hellodeliver ">
                <h6 className=" mbl ">Hello!</h6>
                <p className="mbl">Where to Deliver?</p>
              </div>
              <Form onSubmit={handleSubmit} className=" mbl-selectr mt-4">
                <Form.Group
                  style={{
                    display: "flex",
                    gap: "25px",
                    justifyContent: "center",
                    padding: "0px 25px",
                  }}
                >
                  <div className="button-container">
                    <div
                      variant={selectedOption === "apartment" ? "white" : ""}
                      className={`selection-button ${
                        selectedOption === "apartment" ? "active" : ""
                      }`}
                      onClick={() => {
                        handleSelection("apartment");
                        // return swal({
                        //   title: "Info",
                        //   text: "Launching Soon",
                        //   icon: "info",
                        //   button: "OK",
                        // })
                        localStorage.setItem("addresstype", "apartment");
                        Navigate("/home");
                      }}
                    >
                      <img
                        src="/Assets/apartment.png"
                        alt=""
                        srcset=""
                        className="office"
                      />
                      <h6 className="mt-2" style={{ color: "black" }}>Pg/Apartment
                      </h6>
                      {selectedOption === "apartment" && (
                        <div className="top-right-icon">
                          <FaCheck />
                        </div>

                      )}
                    </div>

                    <b className="mbl-name">Apartment</b>
                    {/* <p className="apartment-launching"> Launching Soon</p> */}
                  </div>
                  <div className="button-container">
                    <div
                      variant={selectedOption === "corporate" ? "white" : ""}
                      className={`selection-button ${
                        selectedOption === "corporate" ? "active" : ""
                      }`}
                      onClick={() => {
                        handleSelection("corporate");
                        localStorage.setItem("addresstype", "corporate");
                        Navigate("/home");
                      }}
                    >
                      <img
                        src="/Assets/office.png"
                        alt=""
                        srcset=""
                        className="office"
                      />

                      {/* <div className="balloon">
                      
                      </div> */}
                      <h6 className="mt-2" style={{ color: "black" }}>
                        Corporate
                      </h6>
                      <p className="corporate-mon">Mon - Fri</p>
                      {selectedOption === "corporate" && (
                        <div className="top-right-icon">
                          <FaCheck />
                        </div>
                      )}
                    </div>
                    <b className="mbl-name">Corporate</b>
                  </div>
                </Form.Group>
                {/* <Button
                  variant=""
                  disabled={!selectedOption}
                  className="contiBtn"
            
                  onClick={() => Navigate("/home")}
                >
                  Continue
                </Button> */}
              </Form>
              {/* <a
                href="https://www.youtube.com/@dailydish8803/featured"
                target="_blank"
                className="why-us-link"
                style={{ color: "unset", textDecoration: "none" }}
              >
                <img src="Assets/why.JPG" alt="" className="why-img" />
              </a> */}

              {/* <img
                src="Assets/dailydishlogo.jpeg"
                alt=""
                className="bottom-logo"
              /> */}
              <div className="d-flex justify-content-center mt-4">
                <img
                  src="./Assets/dailydishlogo.png"
                  alt=""
                  srcset=""
                  className="dailydishlogo2"
                />
              </div>
              <div className="d-flex justify-content-center pb-3">
                <div className="landingtext">
                  <span>
                    We are a food service company delivering fresh, home-style
                    dishes prepared by experts at an affordable cost. Our goal
                    is to let you focus on what you love while we take care of what
                    we <span>
<IoMdHeart style={{color:"#6B8E23",fontSize:'22px'}}/>
                    </span>
                  </span>
                </div>
              </div>
            </div>
            <div></div>
          </div>
        </div>

        <div className="row justify-content-center text-center mt-3 mb-1">
          <div className="col-md-4 mb-1 ">
            <p>© CULINARY CRAVINGS CONVENIENCE PVT LTD all rights reserved.</p>
          </div>
        </div>
      </Container>

      {/* Address Add Modal  */}
      {/* <Modal show={show} onHide={handleClose} style={{ zIndex: "99999" }}>
        <Modal.Header closeButton>
          <Modal.Title>Add Address</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <div
              className="radio"
              style={{ display: "flex", justifyContent: "space-around" }}
            >
              <Form.Check type="radio" label="Apartment" name="radio" />
              <Form.Check type="radio" label="Corporate" name="radio" />
            </div>
            <Form.Control
              type="text"
              placeholder="Enter Full Name"
              style={{ marginTop: "18px" }}
            />
            <Form.Control
              type="text"
              placeholder="Enter Flat No, Building Name"
              style={{ marginTop: "18px" }}
            />
            <Form.Control
              type="number"
              placeholder="Enter Pincode"
              style={{ marginTop: "18px" }}
            />
            <Form.Control
              type="number"
              placeholder="Enter Phone Number"
              style={{ marginTop: "18px" }}
            />
            <Button style={{ width: "100%", marginTop: "24px" }}>Save</Button>
          </Form>
        </Modal.Body>
      </Modal> */}
    </div>
  );
};

export default LandingPage;
