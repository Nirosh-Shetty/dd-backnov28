import React, { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Offcanvas from "react-bootstrap/Offcanvas";
import "../Styles/Navbar.css";
import { Button, Dropdown, Form, InputGroup, Modal } from "react-bootstrap";
import { BiMessageDetail } from "react-icons/bi";
import { IoLogoYoutube } from "react-icons/io5";
import { ImSpoonKnife } from "react-icons/im";
import { FaEye, FaEyeSlash, FaUser } from "react-icons/fa";
import { RiMentalHealthFill } from "react-icons/ri";
import { BsCart3 } from "react-icons/bs";
import { IoTrashBin } from "react-icons/io5";
import { FaMapMarkerAlt, FaRegUserCircle } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { MdAccountCircle } from "react-icons/md";
import { MdOutlineLogout } from "react-icons/md";
import { FaLock } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import swal from "sweetalert";
const Navbar1 = ({ selectArea, Carts, setCarts }) => {
  const navigate = useNavigate();
  const [showCart, setShowCart] = useState(false);
  const handleCloseCart = () => setShowCart(false);
  const handleShowCart = () => setShowCart(true);
  const address = selectArea ? JSON.parse(selectArea) : {};

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // otp
  const [show2, setShow2] = useState(false);
  const handleClose2 = () => setShow2(false);
  const handleShow2 = () => setShow2(true);

  const [show3, setShow3] = useState(false);

  const handleClose3 = () => setShow3(false);
  const handleShow3 = () => {
    handleClose();
    setShow3(true);
  };

  const [PasswordShow, setPasswordShow] = useState(false);
  const [admindata, setadmindata] = useState({});

  // Integration Profile Update
  const user = JSON.parse(localStorage.getItem("user"));

  //Registration modal
  const [Fname, setFname] = useState("");
  const [Mobile, setMobile] = useState("");
  const [Address, setAddress] = useState("");
  const [Flatno, setFlatno] = useState("");
  const [OTP, setOTP] = useState(["", "", "", ""]);

  const d = new Date();
  let subtotal = 0;
  let total = 0;
  let tax = 0;

  function validateIndianMobileNumber(mobileNumber) {
    // Regex to validate Indian mobile number
    const regex = /^[6-9]\d{9}$/;

    // Test the mobile number against the regex
    return regex.test(mobileNumber);
  }

  const handleRegister = async () => {
    if (!Fname) {
      return alert("Enter Your Name");
    }
    if (!Mobile) {
      return alert("Enter Your Mobile Number");
    }
    if (!Address) {
      return alert("Enter Your Address");
    }
    if (!Flatno) {
      return alert("Enter Your Flat Number");
    }
    if (!validateIndianMobileNumber(Mobile)) {
      return alert("Invalid mobile number");
    }
    try {
      const config = {
        url: "/User/registercustomer",
        method: "post",
        baseURL: "http://localhost:7013/api",

        headers: { "content-type": "application/json" },
        data: {
          Fname: Fname,
          Address: Address,
          Mobile: Mobile,
          Flatno: Flatno,
        },
      };
      let res = await axios(config);
      if (res.status === 200) {
        localStorage.setItem("user", JSON.stringify(res.data.details));
        setFname(" ");
        setAddress(" ");
        setFlatno(" ");
        handleClose();
        loginAdmin();
        handleShow2();
      }
      if (res.status === 403) {
        alert("User Already Exist..");
        setFname(" ");
        setAddress(" ");
        setFlatno(" ");
        setMobile(0);
        // handleClose4();
        // handleShow2();
      }
    } catch (error) {
      console.log(error);
      alert(error.response.data.error);
    }
  };
  //logout
  const logOut = () => {
    swal({
      title: "Yeah!",
      text: "Successfully Logged Out",
      icon: "success",
      button: "Ok!",
    });
    setTimeout(() => {
      window.location.assign("/");
    }, 5000);
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
  };
  const loginAdmin = async () => {
    try {
      const config = {
        url: "/User/Sendotp",
        method: "post",
        baseURL: "http://localhost:7013/api",
        headers: { "content-type": "application/json" },
        data: {
          Mobile: Mobile,
        },
      };
      let res = await axios(config);
      if (res.status === 200) {
        alert("OTP Sent to Your Mobile Number");
      }
    } catch (error) {
      alert(error.response.data.error);
      console.log(error);
    }
  };

  // Verify OTP
  const verifyOTP = async () => {
    try {
      if (!OTP) {
        return alert("Enter a valid OTP");
      }
      const config = {
        url: "User/mobileotpverification",
        method: "post",
        baseURL: "http://localhost:7013/api/",
        header: { "content-type": "application/json" },
        data: {
          Mobile: Mobile,
          otp: OTP,
        },
      };
      const res = await axios(config);
      if (res.status === 200) {
        setadmindata(res.data.success);
        localStorage.setItem("user", JSON.stringify(res.data.details));
        alert("OTP verified successfully");
        navigate("/checkout");
        handleClose2();
        setOTP("");
        setMobile(" ");
      }
    } catch (error) {
      console.log(error);
      alert(error.response.data.error);
    }
  };

  // const verifyOTP=()=>{
  //   if (!OTP) {
  //     return alert("please enter OTP")
  //   }

  //   if(OTP===1234){
  //     alert("OTP verified successfully")
  //   }
  // }

  Carts = JSON.parse(localStorage.getItem("cart"));
  const removeFromCart = async (foodItemId) => {
    // Retrieve existing cart data or initialize as an empty array
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    // Log to confirm item to be removed
    console.log("Removing item with ID:", foodItemId);

    // Filter out the item with the specified foodItemId
    const updatedCart = cart.filter(
      (cartItem) => cartItem.foodItemId !== foodItemId
    );

    // Log the cart after removal attempt
    console.log("Updated Cart:", updatedCart);

    // Update localStorage with the updated cart array
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    setCarts(updatedCart);
    // Optional: reload the page to reflect changes
    // window.location.reload();
  };

  if (Carts?.length !== 0) {
    for (let i = 0; i < Carts?.length; i++) {
      subtotal =
        subtotal +
        (Carts[i]?.totalPrice * Carts[i]?.Quantity -
          Math.round(
            Number(Carts[i]?.price * Carts[i]?.Quantity) * (Carts[i]?.gst / 100)
          ));
      total = total + Carts[i]?.totalPrice * Carts[i]?.Quantity;
      tax =
        tax +
        Math.round(
          Number(Carts[i]?.price * Carts[i]?.Quantity) * (Carts[i]?.gst / 100)
        );
    }
  }

  const increaseQuantity = (foodItemId) => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const itemIndex = cart.findIndex(
      (cartItem) => cartItem.foodItemId === foodItemId
    );

    if (itemIndex !== -1) {
      cart[itemIndex].Quantity += 1;
      localStorage.setItem("cart", JSON.stringify(cart));
      // window.location.reload();
      setCarts(cart);
    }
  };

  const decreaseQuantity = (foodItemId) => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const itemIndex = cart.findIndex(
      (cartItem) => cartItem.foodItemId === foodItemId
    );

    if (itemIndex !== -1) {
      if (cart[itemIndex].Quantity > 1) {
        cart[itemIndex].Quantity -= 1;
      } else {
        // Remove item if Quantity is 1 and user wants to decrease
        cart?.splice(itemIndex, 1);
      }
      localStorage.setItem("cart", JSON.stringify(cart));
      setCarts(cart);
    }
  };

  const goToCheckout = () => {
    navigate("/checkout", {
      state: {
        subtotal,
        total,
        tax,
      },
    });
  };
  return (
    <div className="headers">
      <ToastContainer />
      <div>
        {["xs"].map((expand) => (
          <Navbar key={expand} expand={expand} className="navbar1">
            <Container fluid className="navbarcontainer">
              <Nav.Link href="/" className="tail-text m-1 ">
                <a href="/">
                  <img
                    src="Assets/dailydishlogo.jpeg"
                    alt=""
                    className="logo"
                  />
                </a>
              </Nav.Link>

              <div className=" d-flex align-items-center address">
                <FaMapMarkerAlt
                  style={{ marginRight: "5px", color: "orangered" }}
                  className="address"
                />
                {address?.Address ? (
                  <div className="address">
                    <div>
                      <span>{address?.apartmentname}</span>,<br />
                      <span>{address?.Address}</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="address">
                      Please Select Apartment/Corporate Address
                    </span>
                  </>
                )}
              </div>

              <Navbar.Toggle
                aria-controls={`offcanvasNavbar-expand-${expand}`}
              />
              <Navbar.Offcanvas
                id={`offcanvasNavbar-expand-${expand}`}
                aria-labelledby={`offcanvasNavbarLabel-expand-${expand}`}
                placement="end"
                className="custom-offcanvas-size"
              >
                <Offcanvas.Header closeButton></Offcanvas.Header>
                <Offcanvas.Body style={{ padding: "2px 0px" }}>
                  <Nav
                    className="justify-content-end flex-grow-1 pe-3 ps-3"
                    style={{ alignItems: "start" }}
                  >
                    <Nav.Link href="/" className="tail-text">
                      {user ? (
                        <>
                          <div className="side-nav-img">
                            <Nav.Link href="/profile" className="tail-text ">
                              <div className="d-flex gap-3 align-items-center ">
                                <div>
                                  <span className="iocn">
                                    <MdAccountCircle className="fabicon" />
                                  </span>{" "}
                                </div>
                                <div className="textcolor">My Profile</div>
                              </div>
                            </Nav.Link>
                            <Nav.Link href="/orders" className="tail-text">
                              <div className="d-flex gap-3 align-items-center">
                                <div>
                                  <span className="iocn">
                                    <ImSpoonKnife className="fabicon" />{" "}
                                  </span>{" "}
                                </div>
                                <div className="textcolor">My Orders </div>
                              </div>
                            </Nav.Link>
                            <Nav.Link href="/chats" className="tail-text ">
                              <div className="d-flex gap-3 align-items-center ">
                                <div>
                                  <span className="iocn">
                                    <BiMessageDetail className="fabicon" />
                                  </span>{" "}
                                </div>
                                <div className="textcolor">Chat with Us</div>
                              </div>
                            </Nav.Link>
                            <Nav.Link href="/livestreams" className="tail-text">
                              <div className="d-flex gap-3 align-items-center">
                                <div>
                                  <span className="iocn">
                                    <IoLogoYoutube className="fabicon" />{" "}
                                  </span>{" "}
                                </div>
                                <div className="textcolor">Live Stream </div>
                              </div>
                            </Nav.Link>

                            <Nav.Link
                              href="/"
                              onClick={() => logOut()}
                              className="tail-text"
                            >
                              <div className="d-flex gap-3 align-items-center">
                                <div>
                                  <span className="iocn">
                                    <MdOutlineLogout className="fabicon" />{" "}
                                  </span>{" "}
                                </div>
                                <div className="textcolor">Log Out </div>
                              </div>
                            </Nav.Link>
                            {/* <div className="mt-2 mb-2">{user?.Fname}</div>
                            <div>{user?.Mobile}</div> */}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="side-nav-img">
                            {/* My Profile <br /> */}
                            {/* <img
                              src="Assets/user.jpg"
                              alt=""
                              style={{ width: "100px", borderRadius: "50%" }}
                            /> */}
                            <div>
                              <Nav.Link
                                href=""
                                className="tail-text"
                                onClick={handleShow}
                              >
                                <div className="d-flex gap-3 align-items-center">
                                  <div>
                                    <span className="iocn">
                                      <FaLock className="fabicon" />{" "}
                                    </span>{" "}
                                  </div>
                                  <div className="textcolor">
                                    Register/Login{" "}
                                  </div>
                                </div>
                              </Nav.Link>
                              <Nav.Link
                                href="/livestreams"
                                className="tail-text"
                              >
                                <div className="d-flex gap-3 align-items-center">
                                  <div>
                                    <span className="iocn">
                                      <IoLogoYoutube className="fabicon" />{" "}
                                    </span>{" "}
                                  </div>
                                  <div className="textcolor">Live Stream </div>
                                </div>
                              </Nav.Link>
                              <Nav.Link href="/chats" className="tail-text ">
                                <div className="d-flex gap-3 align-items-center ">
                                  <div>
                                    <span className="iocn">
                                      <BiMessageDetail className="fabicon" />
                                    </span>{" "}
                                  </div>
                                  <div className="textcolor">Chat with Us</div>
                                </div>
                              </Nav.Link>
                            </div>
                          </div>
                        </>
                      )}
                    </Nav.Link>

                    {/* <Dropdown
                      className="mbl"
                      variant=""
                      style={{ backgroundColor: "unset" }}
                    >
                      <Dropdown.Toggle
                        className="align-items-center"
                        style={{
                          cursor: "pointer",
                          color: "black",
                          border: "none",
                          backgroundColor: "transparent",
                        }}
                      > */}

                    {/* My Profile <br /> */}
                    {/* <img
                        src="Assets/user.jpg"
                        alt=""
                        style={{ width: "100px", borderRadius: "50%" }}
                      /> */}
                    {/* {user ? (
                      <>
                        {user?.profileImage ? (
                          <img
                            src={`http://localhost:7013/Customer/${user?.profileImage}`}
                            alt=""
                            style={{ width: "50px", borderRadius: "50%" }}
                          />
                        ) : (
                     
                          <div className="side-nav-links">
                            <Nav.Link href="/profile" className="tail-text ">
                              <div className="d-flex gap-3 align-items-center ">
                                <div>
                                  <span className="iocn">
                                    <MdAccountCircle className="fabicons" />
                                  </span>{" "}
                                </div>
                                <div className="text-dark">My Profile</div>
                              </div>
                            </Nav.Link>
                            <Nav.Link href="/orders" className="tail-text">
                              <div className="d-flex gap-3 align-items-center">
                                <div>
                                  <span className="iocn">
                                    <ImSpoonKnife className="fabicons" />{" "}
                                  </span>{" "}
                                </div>
                                <div className="text-dark">My Orders </div>
                              </div>
                            </Nav.Link>
                            <Nav.Link
                              href=""
                              onClick={handleShowCart}
                              className="tail-text"
                            >
                              <div className="d-flex gap-3 align-items-center">
                                <div>
                                  <span className="iocn">
                                    <BsCart3 className="fabicons" />{" "}
                                  </span>{" "}
                                </div>
                                <div className="text-dark">My Cart </div>
                              </div>
                            </Nav.Link>
                            <Nav.Link href="/chats" className="tail-text ">
                              <div className="d-flex gap-3 align-items-center ">
                                <div>
                                  <span className="iocn">
                                    <BiMessageDetail className="fabicons" />
                                  </span>{" "}
                                </div>
                                <div className="text-dark">Chat with Us</div>
                              </div>
                            </Nav.Link>
                            <Nav.Link href="/livestreams" className="tail-text">
                              <div className="d-flex gap-3 align-items-center">
                                <div>
                                  <span className="iocn">
                                    <IoLogoYoutube className="fabicons" />{" "}
                                  </span>{" "}
                                </div>
                                <div className="text-dark">Live Stream </div>
                              </div>
                            </Nav.Link>

                            <Nav.Link
                              href="/"
                              onClick={() => logOut()}
                              className="tail-text"
                            >
                              <div className="d-flex gap-3 align-items-center">
                                <div>
                                  <span className="iocn">
                                    <MdOutlineLogout className="fabicons" />{" "}
                                  </span>{" "}
                                </div>
                                <div className="text-dark">Log Out </div>
                              </div>
                            </Nav.Link>
                          </div>
                        )}{" "}
                        &nbsp;
                   
                      </>
                    ) : (
                      <div className="side-nav-img">
                  
                      <div>
                        <Nav.Link
                          href=""
                          className="tail-text"
                          onClick={handleShow}
                        >
                          <div className="d-flex gap-3 align-items-center">
                            <div>
                              <span className="iocn">
                                <FaLock className="fabicon" />{" "}
                              </span>{" "}
                            </div>
                            <div>Register/Login </div>
                          </div>
                        </Nav.Link>
                        <Nav.Link
                          href="/livestreams"
                          className="tail-text"
                        >
                          <div className="d-flex gap-3 align-items-center">
                            <div>
                              <span className="iocn">
                                <IoLogoYoutube className="fabicon" />{" "}
                              </span>{" "}
                            </div>
                            <div>Live Stream </div>
                          </div>
                        </Nav.Link>
                        <Nav.Link href="/chats" className="tail-text ">
                          <div className="d-flex gap-3 align-items-center ">
                            <div>
                              <span className="iocn">
                                <BiMessageDetail className="fabicon" />
                              </span>{" "}
                            </div>
                            <div>Chat with Us</div>
                          </div>
                        </Nav.Link>
                      </div>
                    </div>
                    )} */}
                    {/* </Dropdown.Toggle>
                    </Dropdown> */}
                    <Nav.Link href="#" className="tail-text">
                      <div
                        variant=""
                        className="mycrt"
                        onClick={() => {
                          if (!selectArea || selectArea === "") {
                            return alert("Please select Apartment/Corporate");
                          }
                          handleShowCart();
                        }}
                        style={{ padding: "0 15px" }}
                      >
                        {/* <BsCart3
                          style={{ fontSize: "24px", color: "orangered" }}
                        /> */}
                        <div className="cartvalue">
                          <span>{Carts?.length}</span>
                        </div>
                      </div>
                    </Nav.Link>
                  </Nav>
                </Offcanvas.Body>
              </Navbar.Offcanvas>
            </Container>
          </Navbar>
        ))}
        <hr style={{ margin: "0" }} />
      </div>

      {/* Offcanvas for Cart */}
      <Offcanvas
        show={showCart}
        onHide={handleCloseCart}
        placement="end"
        id="checkout"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>My Cart</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className="row">
            {Carts?.length > 0 ? (
              <>
                <div className="cartbox">
                  {/* Sample Cart Item */}
                  {Carts?.map((item) => {
                    return (
                      <div className="cart-bx">
                        <div className="d-flex justify-content-between mb-2 mt-2">
                          <div className="d-flex gap-3">
                            <div>
                              <img
                                src={`${item?.image}`}
                                alt="ProductImage"
                                className="checkout-block-img"
                              />
                            </div>
                            <div style={{ textAlign: "left" }}>
                              <p style={{ margin: "0px" }}>{item?.foodname}</p>
                              <p style={{ margin: "0px" }}>
                                {item?.quantity} {item?.unit}
                              </p>
                              <b>₹ {item?.totalPrice}</b>
                            </div>
                          </div>

                          <div>
                            <div
                              className="mb-2"
                              style={{
                                display: "flex",
                                alignItems: "center",
                                background: "orangered",
                                color: "white",
                                borderRadius: "5px",
                              }}
                            >
                              <Button
                                variant=""
                                style={{
                                  background: "orangered",
                                  color: "white",
                                }}
                                onClick={() =>
                                  decreaseQuantity(item?.foodItemId)
                                }
                              >
                                -
                              </Button>
                              <span>{item?.Quantity}</span>
                              <Button
                                variant=""
                                style={{
                                  background: "orangered",
                                  color: "white",
                                }}
                                onClick={() =>
                                  increaseQuantity(item?.foodItemId)
                                }
                              >
                                +
                              </Button>
                            </div>
                            <div
                              onClick={() => removeFromCart(item?.foodItemId)}
                            >
                              <IoTrashBin
                                style={{
                                  color: "red",
                                  fontSize: "20px",
                                  margin: "auto",
                                  textAlign: "center",
                                  alignItems: "center",
                                  display: "flex",
                                  justifyContent: "center",
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {/* Bill Details */}
                  <div>
                    <h6>
                      <b>Bill Details</b>
                    </h6>
                    <div className="d-flex justify-content-between mb-2 align-items-center">
                      <div className="mb-2">
                        <div>
                          <div>Sub Total</div>
                          <div>Tax</div>
                          <div>
                            <b>Bill total</b>
                          </div>
                        </div>
                      </div>
                      <div className="mb-2">
                        <div style={{ textAlign: "left" }}>
                          <div>₹ {subtotal}</div>
                          <div>₹ {tax}</div>
                          <div>
                            <b>₹ {total}</b>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="d-flex justify-content-between">
                    <div className="mb-2" style={{ textAlign: "end" }}>
                      {user ? (
                        <>
                          <a
                            onClick={() => goToCheckout()}
                            style={{ color: "unset", textDecoration: "none" }}
                          >
                            <Button
                              variant=""
                              style={{
                                backgroundColor: "orangered",
                                color: "white",
                              }}
                            >
                              Checkout
                            </Button>
                          </a>
                        </>
                      ) : (
                        <>
                          <Button
                            variant=""
                            style={{
                              backgroundColor: "orangered",
                              color: "white",
                            }}
                            onClick={() => handleShow()}
                          >
                            Checkout
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <p style={{ textAlign: "center" }}>Your Cart is empty</p>
              </>
            )}
          </div>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Register  */}
      <Modal show={show} onHide={handleClose} style={{ zIndex: "99999" }}>
        <Modal.Header closeButton>
          <Modal.Title>Register Here</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Control
              type="text"
              placeholder="Enter Full Name"
              style={{ marginTop: "18px" }}
              onChange={(e) => setFname(e.target.value)}
            />
            <Form.Control
              type="number"
              placeholder="Enter Phone Number"
              style={{ marginTop: "18px" }}
              onChange={(e) => setMobile(e.target.value)}
            />
            <Form.Control
              type="text"
              placeholder="Enter Flat No,Building Name"
              style={{ marginTop: "18px" }}
              onChange={(e) => setAddress(e.target.value)}
            />
            <Form.Control
              type="text"
              placeholder="Tower/Phase/Block"
              style={{ marginTop: "18px" }}
              onChange={(e) => setFlatno(e.target.value)}
            />

            <Button
              variant=""
              style={{
                width: "100%",
                marginTop: "24px",
                backgroundColor: "orangered",
                color: "white",
                textAlign: "center",
              }}
              onClick={handleRegister}
            >
              Register
            </Button>
          </Form>
          <h6 className="text-center">Or</h6>
          <Button
            variant=""
            style={{
              width: "100%",
              backgroundColor: "orangered",
              color: "white",
              textAlign: "center",
            }}
            onClick={handleShow3}
          >
            Login
          </Button>
        </Modal.Body>
      </Modal>

      {/* OTP  */}
      <Modal
        show={show2}
        onHide={handleClose2}
        size="sm"
        style={{
          zIndex: "99999",
          position: "absolute",
          top: "30%",
          left: "0%",
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Enter OTP</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <span style={{ fontSize: "13px" }}>
            An OTP has been sent to your Phone Number
          </span>
          <div className="d-flex gap-1 mt-3 mb-3">
            {/* {OTP.map((digit, index) => (
              <div className="col-sm-2" key={index}>
                <input
                  type="text"
                  className="vi_0"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyPress={(e) => {
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  style={{ textAlign: "center" }}
                />
              </div>
            ))} */}

            <InputGroup className="mb-2" style={{ background: "white" }}>
              <Form.Control
                type={PasswordShow ? "text" : "password"}
                className="login-input"
                placeholder="Enter OTP"
                aria-describedby="basic-addon1"
                // value={OTP}
                onChange={(e) => setOTP(e.target.value)}
              />
              <Button
                variant=""
                style={{
                  borderRadius: "0px",
                  border: "1px solid black",
                  textAlign: "center",
                }}
                onClick={() => setPasswordShow(!PasswordShow)}
                className="passbtn"
              >
                {PasswordShow ? <FaEye /> : <FaEyeSlash />}
              </Button>
            </InputGroup>
          </div>
          <div>
            <Button
              variant=""
              className="modal-add-btn w-100"
              onClick={verifyOTP}
            >
              Continue
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      <Modal show={show3} onHide={handleClose3}>
        <Modal.Header closeButton>
          <Modal.Title>Login Here</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Control
              type="number"
              placeholder="Enter Phone Number"
              style={{ marginTop: "18px" }}
              onChange={(e) => setMobile(e.target.value)}
            />

            <Button
              variant=""
              style={{
                width: "100%",
                marginTop: "24px",
                backgroundColor: "orangered",
                color: "white",
                textAlign: "center",
              }}
              onClick={handleShow2}
              // onClick={()=>{navigate("/checkout")}}
            >
              Login
            </Button>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose3}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Navbar1;
