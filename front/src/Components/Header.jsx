// import React, { useState } from "react";
// import {
//   Navbar,
//   Container,
//   Nav,
//   Button,
//   Dropdown,
//   Offcanvas,
//   Modal,
//   Row,
//   Form,
//   InputGroup,
// } from "react-bootstrap";
// import {
//   FaEye,
//   FaEyeSlash,
//   FaMapMarkerAlt,
//   FaRegUserCircle,
// } from "react-icons/fa";
// import { BsCart3 } from "react-icons/bs";
// import "../Styles/Header.css";
// import { IoTrashBin } from "react-icons/io5";
// import { IoIosArrowForward } from "react-icons/io";

// const Header = () => {
//   const [showCart, setShowCart] = useState(false);
//   const [showLogin, setShowLogin] = useState(false);

//   // Handlers for showing/hiding the modals
//   const handleCloseCart = () => setShowCart(false);
//   const handleShowCart = () => setShowCart(true);
//   const handleCloseLogin = () => setShowLogin(false);
//   const handleShowLogin = () => setShowLogin(true);

//   //passwrd view
//   const [PasswordShow, setPasswordShow] = useState(false);
//   const [otp, setOtp] = useState("");
//   const [admindata, setadmindata] = useState({});

//   // validation for mobile number
//   const [mobileError, setMobileError] = useState("");

//   // Login modal //
//   const [show, setShow] = useState();
//   const handleClose = () => setShow(false);
//   const handleShow = () => setShow(true);

//   return (
//     <>
//       <div className="headers">
//         <Navbar expand="lg" style={{ padding: "0px", background: "white" }}>
//           <Container fluid className="mobile-nav">
//             {/* Left Side: Logo */}
//             <div className="d-flex ">
//               <Navbar.Brand href="/" className="d-flex align-items-center">
//                 <a href="/"
//                   className=""
//                   style={{ fontSize: "24px", color: "white" }}
//                 >
//                   <img src="Assets/dailydishlogo.jpeg" alt="" className="logo"/>
//                 </a>
//               </Navbar.Brand>
//               <div className="location-input-container d-flex align-items-center">
//                 <FaMapMarkerAlt
//                   style={{ marginRight: "5px", color: "orangered" }}
//                 />
//                 <input
//                   type="text"
//                   className="form-control"
//                   placeholder="Enter Location"
//                   style={{ width: "300px" }}
//                 />
//               </div>
//             </div>

//             {/* Right Side: Login and Cart */}
//             <Nav className="ml-auto d-flex align-items-center gap-3">
//               <Nav.Link onClick={handleShow}>
//                 {/* <FaRegUserCircle
//                   style={{ fontSize: "24px", marginRight: "5px" }}
//                 /> */}
//                 {/* Login */}
//               </Nav.Link>
//               <Dropdown style={{}}>
//                 <Dropdown.Toggle
//                   className="align-items-center"
//                   style={{
//                     cursor: "pointer",
//                     color: "black",
//                     backgroundColor: "unset",
//                     border: "none",
//                   }}
//                 >
//                   <FaRegUserCircle
//                     style={{ fontSize: "24px", marginRight: "5px" }}
//                   />
//                 </Dropdown.Toggle>

//                 <Dropdown.Menu className="mt-2">
//                   <Dropdown.Item href="/profile">My Profile</Dropdown.Item>
//                   <Dropdown.Item href="/orders">My Orders</Dropdown.Item>
//                   <Dropdown.Item href="/livestreams">Live Stream</Dropdown.Item>
//                   {/* <Dropdown.Item href="#">Chat with Us</Dropdown.Item> */}

//                   <Dropdown.Item>Log out</Dropdown.Item>
//                 </Dropdown.Menu>
//               </Dropdown>

//               <Button variant="" className="mycrt" onClick={handleShowCart}>
//                 <BsCart3 style={{ fontSize: "24px" }} />
//               </Button>
//             </Nav>
//           </Container>
//         </Navbar>
//       </div>

//       {/* Offcanvas for Cart */}
//       <Offcanvas
//         show={showCart}
//         onHide={handleCloseCart}
//         placement="end"
//         id="checkout"
//       >
//         <Offcanvas.Header closeButton>
//           <Offcanvas.Title>My Cart</Offcanvas.Title>
//         </Offcanvas.Header>
//         <Offcanvas.Body>
//           <div className="row">
//             <div className="cartbox">
//               {/* Sample Cart Item */}
//               <div className="cart-bx">
//                 <div className="d-flex justify-content-between mb-2 mt-2">
//                   <div className="d-flex gap-3">
//                     <div>
//                       <img
//                         src="Assets/loginbg.jpg"
//                         alt="ProductImage"
//                         className="checkout-block-img"
//                       />
//                     </div>
//                     <div style={{ textAlign: "left" }}>
//                       <p style={{ margin: "0px" }}>Product Name</p>
//                       <p style={{ margin: "0px" }}>500ml Bottle</p>
//                       <b>₹ 200</b>
//                     </div>
//                   </div>

//                   <div>
//                     <div
//                       className="mb-2"
//                       style={{
//                         display: "flex",
//                         alignItems: "center",
//                         background: "orangered",
//                         color: "white",
//                         borderRadius: "5px",
//                       }}
//                     >
//                       <Button
//                         variant=""
//                         style={{ background: "orangered", color: "white" }}
//                       >
//                         -
//                       </Button>
//                       <span>1</span>
//                       <Button
//                         variant=""
//                         style={{ background: "orangered", color: "white" }}
//                       >
//                         +
//                       </Button>
//                     </div>
//                     <div>
//                       <IoTrashBin
//                         style={{
//                           color: "red",
//                           fontSize: "20px",
//                           margin: "auto",
//                           textAlign: "center",
//                           alignItems: "center",
//                           display: "flex",
//                           justifyContent: "center",
//                         }}
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Bill Details */}
//               <div>
//                 <h6>
//                   <b>Bill Details</b>
//                 </h6>
//                 <div className="d-flex justify-content-between mb-2 align-items-center">
//                   <div className="mb-2">
//                     <div>
//                       <div>Sub Total</div>
//                       <div>Tax</div>
//                       <div>
//                         <b>Bill total</b>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="mb-2">
//                     <div style={{ textAlign: "left" }}>
//                       <div>₹ 200</div>
//                       <div>₹ 20</div>
//                       <div>
//                         <b>₹ 220</b>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Action Buttons */}
//               <div className="d-flex justify-content-between">
//                 <div className="mb-2" style={{ textAlign: "end" }}>
//                   <a
//                     href="/Checkout"
//                     style={{ color: "unset", textDecoration: "none" }}
//                   >
//                     <Button
//                       variant=""
//                       style={{ backgroundColor: "orangered", color: "white" }}
//                     >
//                       Checkout
//                     </Button>
//                   </a>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </Offcanvas.Body>
//       </Offcanvas>

//       {/* Modal for Login */}
//       <Modal
//         show={show}
//         onHide={handleClose}
//         style={{
//           zIndex: "999999",
//         }}
//       >
//         <Modal.Header closeButton>
//           <h3>Login</h3>
//         </Modal.Header>
//         <Modal.Body>
//           <div>
//             <Row>
//               <div className="col-12 mb-2">
//                 <Form.Label>Mobile Number</Form.Label>
//                 <InputGroup className="mb-2">
//                   <Form.Control
//                     className="login-input"
//                     type="number"
//                     placeholder="Enter mobile number"
//                     aria-label="number"
//                     aria-describedby="basic-addon1"
//                     maxLength={10}
//                   />
//                   <Button
//                     variant=""
//                     style={{
//                       background: "orangered",
//                       color: "white",
//                       borderRadius: "3px",
//                       height: "100%", // Ensure it matches the input height
//                     }}
//                   >
//                     Get OTP
//                   </Button>
//                 </InputGroup>
//                 {/* Error message for mobile number validation */}
//                 {mobileError && (
//                   <div className="text-danger">{mobileError}</div>
//                 )}
//               </div>
//             </Row>

//             <Row>
//               <div className="col-12 mb-2">
//                 <Form.Group className="mb-2" controlId="formGroupPassword">
//                   <Form.Label>OTP</Form.Label>
//                   <InputGroup className="mb-2" style={{ background: "white" }}>
//                     <Form.Control
//                       type={PasswordShow ? "text" : "password"}
//                       className="login-input"
//                       placeholder="Enter OTP"
//                       aria-describedby="basic-addon1"
//                     />
//                     <span
//                       style={{ borderRadius: "0px", padding: "5px 10px" }} // Aligns button to the input
//                       onClick={() => setPasswordShow(!PasswordShow)}
//                       className="passbtn"
//                     >
//                       {PasswordShow ? (
//                         <FaEye style={{ color: "white" }} />
//                       ) : (
//                         <FaEyeSlash style={{ color: "white" }} />
//                       )}
//                     </span>
//                   </InputGroup>
//                 </Form.Group>
//               </div>
//             </Row>

//             <div>
//               <h6
//                 style={{
//                   display: "flex",
//                   padding: "0 4px",
//                   cursor: "pointer",
//                 }}
//               >
//                 Resend OTP?
//               </h6>
//             </div>

//             <Row className="mt-3">
//               <div
//                 style={{
//                   float: "right",
//                   display: "flex",
//                   justifyContent: "center",
//                   padding: "0px 100px",
//                 }}
//               >
//                 <Button
//                   variant=""
//                   style={{
//                     backgroundColor: "white",
//                     color: "orangered",
//                     border: "1px solid orangered",
//                   }}
//                 >
//                   Log in
//                 </Button>
//               </div>
//             </Row>
//           </div>
//         </Modal.Body>
//       </Modal>
//     </>
//   );
// };

// export default Header;
