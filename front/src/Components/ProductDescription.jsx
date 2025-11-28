import React, { useEffect, useState } from "react";
import "../Styles/Productdsc.css";
import { Button, Container } from "react-bootstrap";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { MdTimer } from "react-icons/md";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import { GoHeart } from "react-icons/go";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const ProductDescription = ({ setHeaderUpdate, cartRemoveStatus }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  const location = useLocation();
  const data = location.state;

  const [selectedImage, setSelectedImage] = useState();

  useEffect(() => {
    setSelectedImage(data?.productimage[0]);
  }, [data]);

  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 5,
      slidesToSlide: 3,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
      slidesToSlide: 2, // optional, default to 1.
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 2,
      slidesToSlide: 1, // optional, default to 1.
    },
  };

  const handleImageClick = (items) => {
    setSelectedImage(items);
  };

  const [count, setCount] = useState(0);

  //scroll window top
  useEffect(() => {});
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  //=====================PRODUCTS==========================//
  //integrating get method
  const [Addproducts, setAddproducts] = useState([]);
  const getAddproducts = async () => {
    try {
      let res = await axios.get(
        "http://localhost:7013/api/admin/admin/product"
      );
      if (res.status === 200) {
        setAddproducts(res.data.products);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAddproducts();
  }, []);

  //=====================CART Add==========================//
  const [Carts, setCarts] = useState([]);
  const [quantity, setquantity] = useState(1);
  let subtotal = 0;
  let total = 0;
  let tax = 0;
  if (Carts?.length !== 0) {
    for (let i = 0; i < Carts.length; i++) {
      subtotal =
        subtotal +
        (Carts[i]?.totalPrice -
          Math.round(
            Number(Carts[i]?.price * Carts[i]?.quantity) *
              (Carts[i]?.productId?.tax / 100)
          ));
      total = total + Carts[i]?.totalPrice;
      tax =
        tax +
        Math.round(
          Number(Carts[i]?.price * Carts[i]?.quantity) *
            (Carts[i]?.productId?.tax / 100)
        );
    }
  }

  // Add product to cart (Post integration)
  const addCart = async (item) => {
    if (!user) {
      alert("Need to Login");
    } else {
      try {
        const config = {
          url: "/addcart/Addtocart",
          method: "post",
          baseURL: "http://localhost:7013/api",
          data: {
            productId: item._id,
            customerId: user._id,
            quantity: quantity, // Pass the updated quantity
            price: Number(item?.productprice),
            Size: item?.productvolumetype,
            totalPrice: Math.round(
              (Number(item?.productprice) +
                Math.round(item?.productprice * (item?.tax / 100)) -
                (Number(item?.productprice) +
                  Math.round(item?.productprice * (item?.tax / 100))) *
                  (item.productdiscount / 100)) *
                quantity
            ),
          },
        };

        await axios(config).then(function (res) {
          if (res.status === 200) {
            alert("Product Added to Cart");
            getCatrDeatils();
            setHeaderUpdate(user?._id);
          }
        });
      } catch (error) {
        console.log(error);
        alert(error.response.data.error);
      }
    }
  };

  const removewCart = async (item) => {
    try {
      const config = {
        url: "/addcart/deletecart",
        method: "put",
        baseURL: "http://localhost:7013/api",
        headers: { "content-type": "application/json" },
        data: {
          productId: item?.productId?._id, // Update this to match the actual productId
          customerId: user?._id,
        },
      };
      let res = await axios(config);
      if (res.status === 200) {
        alert("Product Removed From Cart");
        getCatrDeatils();
        setHeaderUpdate(user?._id);
      }
    } catch (error) {
      alert(error.response.data.error);
    }
  };

  // Increament Quantity
  const incQuntity = async (items, total, quantity) => {
    try {
      const config = {
        url: "/priceIncAnddec",
        method: "put",
        baseURL: "http://localhost:7013/api/addcart",
        headers: { "conten-type": "application/json" },
        data: {
          cartId: items?._id,
          quantity: quantity,
          totalPrice: total * quantity,
        },
      };
      // console.log("dsafsd",(item.price));
      let res = await axios(config);
      if (res.status === 200) {
        getCatrDeatils();
        setHeaderUpdate(user?._id);
      }
    } catch (error) {}
  };

  // Decreament Quantity
  const decQuntity = async (items, total, quantity) => {
    try {
      if (quantity !== 0) {
        const config = {
          url: "/priceIncAnddec",
          method: "put",
          baseURL: "http://localhost:7013/api/addcart",
          headers: { "conten-type": "application/json" },
          data: {
            cartId: items?._id,
            quantity: quantity,
            totalPrice: total * quantity,
          },
        };
        let res = await axios(config);
        if (res.status === 200) {
          getCatrDeatils();
          setHeaderUpdate(user?._id);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Get cart details
  const [Cartstatus, setCartstatus] = useState([]);

  const getCatrDeatils = () => {
    axios
      .get("http://localhost:7013/api/addcart/getcart/" + user?._id)
      .then(function (response) {
        setCarts(response.data.success);
        setCartstatus(response.data.success);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  useEffect(() => {
    getCatrDeatils();
  }, []);

  useEffect(() => {
    if (cartRemoveStatus === user?._id) {
      getCatrDeatils();
      getAddproducts();
    }
  }, [cartRemoveStatus]);

  const cartItem = Cartstatus.find((ele) => ele.productId?._id === data?._id);

  return (
    <div>
      <Container>
        <div className="row">
          <h4 className="mt-2 mb-3">Product Description</h4>
          <div className="col-md-2 mb-2">
            <div className="mobile-view">
              <div onClick={() => handleImageClick()}>
                <div className="side-of-images">
                  <img
                    src="Assets/homebanner.jpg"
                    alt=""
                    className="product-small-img"
                  />
                </div>
              </div>

              <div onClick={() => handleImageClick()}>
                <div className="side-of-images">
                  <img
                    src="Assets/dinner-banner.jpg"
                    alt=""
                    className="product-small-img"
                  />
                </div>
              </div>

              <div onClick={() => handleImageClick()}>
                <div className="side-of-images">
                  <img
                    src="Assets/lunch-banner.jpg"
                    alt=""
                    className="product-small-img"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6 mb-2">
            <div>
              <div className="position-relative">
                <img
                  alt=""
                  src="Assets/loginbg.jpg"
                  className="product-main-img"
                />

                <div className="stock-available">
                  <span className="green-dot"></span>
                </div>
                <Button
                  className="stock-bar-container1"
                  style={{ backgroundColor: "white", color: "black" }}
                >
                  <div className="d-flex justify-content-between align-items-center w-100">
                    <div className="progress flex-grow-1">
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{ width: "70%" }}
                        aria-valuenow="30"
                        aria-valuemin="0"
                        aria-valuemax="100"
                      ></div>
                    </div>
                    <span>3/10</span>
                  </div>
                </Button>
              </div>
              {/* <div>
                <img
                  src="Assets/loginbg.jpg"
                  alt=""
                  className="product-main-img"
                />
              </div> */}
            </div>
          </div>

          <div className="col-md-4 mb-3">
            <div>
              <div>
                <h4>
                  <b>Andra Curry</b>
                </h4>
              </div>

              <div className="d-flex gap-3 mt-3 mb-3">
                <div>
                  <span className="badge">₹400</span>
                </div>
                <div className="linescratch-text">
                  <b>₹800</b>
                </div>
                <div className="discount-text">
                  <span>50%OFF</span>
                </div>
              </div>

              <div className="mb-5">
                <h5>
                  <b>Add More Items</b>
                </h5>
                <div className="d-flex gap-3 mt-2 mb-2">
                  <div style={{ width: "fit-content" }}>
                    <div className="d-flex gap-2 mb-2">
                      <div>
                        <img
                          src="Assets/loginbg.jpg"
                          alt=""
                          className="top-picks-img"
                        />
                      </div>
                      <div>
                        <div>
                          <b>Cheese</b>
                        </div>
                        <div>500 gm, </div>
                        <div>
                          <b>₹ 400 </b>
                        </div>
                      </div>
                    </div>
                    <div style={{}}>
                      <Button
                        variant=""
                        className="add-to-cart-btn"
                        style={{ width: "100%" }}
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </div>

                  <div style={{ width: "fit-content" }}>
                    <div className="d-flex gap-2 mb-2">
                      <div>
                        <img
                          src="Assets/loginbg.jpg"
                          alt=""
                          className="top-picks-img"
                        />
                      </div>
                      <div>
                        <div>
                          <b>Cheese</b>
                        </div>
                        <div>500 gm,</div>
                        <div>
                          <b>₹ 400 </b>
                        </div>
                      </div>
                    </div>
                    <div style={{}}>
                      <Button
                        variant=""
                        className="add-to-cart-btn"
                        style={{ width: "100%" }}
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Button
                  variant=""
                  className="add-to-cart-btn"
                  // style={{ width: "100%" }}
                >
                  Add to Cart
                </Button>
              </div>
              {/* <div
                className="d-flex justify-content-between mt-3 mb-4"
                style={{ textAlign: "left" }}
              >
                <div>
                  <div>
                    <span>
                      500 Graam
                    </span>
                  </div>
                  <div>
                    <p style={{ margin: "0px" }}>
                      MRP ₹ 400
                    </p>
                  </div>
                  <div>
                    <span>(Include of all taxes)</span>
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      marginTop: "15px",
                    }}
                  >
                   <Button
                  variant=""
                  className="w-100 mt-3"
                  style={{ border: "1px solid orangered" }}
                >
                  Add to Cart
                </Button>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-8 mb-2 mt-3">
            <div style={{ textAlign: "left" }}>
              <h5>
                <b>About Product</b>
              </h5>
              <div>
                <span>
                  "Loream" appears to be a typo. Did you mean "Lorem"? If so,
                  "Lorem ipsum" is a placeholder text commonly used in design
                  and development to fill space and simulate real content. It's
                  derived from a scrambled section of Cicero's writings and
                  helps to demonstrate how the layout will look when the real
                  text is available.
                </span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ProductDescription;
