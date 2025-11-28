import React, { useState, useEffect } from "react";
import { createCoupon, updateCoupon, deleteCoupon } from "./API";
import axios from "axios";
import { Button, Form, Table, Modal } from "react-bootstrap";
import { CSVLink } from "react-csv"; // Import react-csv

import swal from "sweetalert";
import { BsEye } from "react-icons/bs";
import { FaRegEye } from "react-icons/fa";
import moment from "moment";
const AdminCoupon = () => {
  const [coupons, setCoupons] = useState([]);
  const [formData, setFormData] = useState({
    couponName: "",
    shortDescription: "",
    applyUser: "",
    discountPrice: "",
    productId: "",
  });
  const [image, setImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [fooditemdata, setfooditemdata] = useState([]);
  const getfooditems = async () => {
    try {
      let res = await axios.get(
        "http://localhost:7013/api/admin/getFoodItemsUnBlocks"
      );
      if (res.status === 200) {
        setfooditemdata(res.data.data);
      }
    } catch (error) {
      swal({
        title: "Error",
        text: "Check your internet connection!",
        icon: "error",
        buttons: "Try Again",
      });
      console.log(error);
    }
  };

  const getCoupon = async () => {
    try {
      axios
        .get("http://localhost:7013/api/admin/coupons")
        .then((response) => {
          setCoupons(response.data);
        })
        .catch((error) => {
          console.error("Error fetching coupons:", error);
        });
    } catch (errror) {
      console.log(errror);
    }
  };
  useEffect(() => {
    getfooditems();
    getCoupon();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleCreateOrUpdateCoupon = (e) => {
    e.preventDefault();
    const couponAction = editingCoupon
      ? updateCoupon(editingCoupon._id, formData, image)
      : createCoupon(formData, image);

    couponAction
      .then((response) => {
        alert(editingCoupon ? "Coupon Updated!" : "Coupon Created!");
        getCoupon();
        setFormData({
          couponName: "",
          shortDescription: "",
          applyUser: "",
          discountPrice: "",
          productId: "",
        });
        setImage(null);
        setShowModal(false);
        setEditingCoupon(null);
      })
      .catch((error) => {
        alert("Error saving coupon!");
        console.error("Error:", error);
      });
  };

  const handleEditCoupon = (coupon) => {
    setFormData({
      couponName: coupon.couponName,
      shortDescription: coupon.shortDescription,
      applyUser: coupon.applyUser,
      discountPrice: coupon.discountPrice,
      productId: coupon.productId,
    });
    setEditingCoupon(coupon);
    setShowModal(true);
  };
  const [deleteShow, setDeleteShow] = useState(false);
  const [deleteId, setdeleteId] = useState("");
  const handleDeleteCoupon = (id) => {
    deleteCoupon(deleteId)
      .then(() => {
        getCoupon();
      })
      .catch((error) => {
        alert("Error deleting coupon!");
        console.error("Error:", error);
      });
  };
  const [showApply, setshowapply] = useState(false);

  const [users, setUsers] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const usersDataForCSV = users.map((user) => ({
    Name: user.Name,
    MobileNumber: user.MobileNumber,
    Date_Time: user?.AppliedDate ? moment(user?.AppliedDate).format("lll") : "",
  }));

  return (
    <div className="container mt-4">
      <h1 className="header-c"> Coupon Management</h1>
      <div className="d-flex justify-content-between">
        <span></span>

        <Button
          variant="success"
          className="mb-3 text-right"
          onClick={() => setShowModal(true)}
        >
          + Add
        </Button>
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Coupon Code</th>
            <th>Description</th>
            <th>Discount Price</th>
            <th>Product ID</th>
            <th>Apply User List</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {coupons?.map((coupon) => (
            <tr key={coupon._id}>
              <td>{coupon?.couponName}</td>
              <td>{coupon?.shortDescription}</td>
              <td>₹.{coupon?.discountPrice}</td>
              <td>
                {coupon?.productId?.Foodgallery && (
                  <img
                    src={`${coupon?.productId?.Foodgallery[0]?.image2}`}
                    alt={coupon?.productId?.foodname}
                    style={{ width: 50, marginRight: 10 }}
                  />
                )}
                {coupon?.productId?.foodname} ₹.{coupon?.productId?.foodprice}
              </td>
              <td>
                <abbr
                  title="View"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setUsers(coupon?.applyUser);
                    setSelectedCoupon(coupon?.couponName);
                    setshowapply(true);
                  }}
                >
                  <FaRegEye size={25} color="green" />{" "}
                </abbr>{" "}
              </td>
              <td>
                <Button
                  variant="warning"
                  size="sm"
                  onClick={() => handleEditCoupon(coupon)}
                >
                  Edit
                </Button>{" "}
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    setdeleteId(coupon?._id);
                    setDeleteShow(true);
                  }}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal for Creating/Editing Coupon */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingCoupon ? "Edit Coupon" : "Add Coupon"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateOrUpdateCoupon}>
            <Form.Group>
              <Form.Label>Coupon Code</Form.Label>
              <Form.Control
                type="text"
                name="couponName"
                value={formData.couponName}
                onChange={handleInputChange}
                placeholder="Enter coupon code"
                required
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Short Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleInputChange}
                placeholder="Enter short description"
                required
              />
            </Form.Group>

            {/* <Form.Group>
              <Form.Label>Apply User</Form.Label>
              <Form.Control
                type="text"
                name="applyUser"
                value={formData.applyUser}
                onChange={handleInputChange}
                placeholder="Comma separated user types"
              />
            </Form.Group> */}

            <Form.Group>
              <Form.Label>Discount Price</Form.Label>
              <Form.Control
                type="number"
                name="discountPrice"
                value={formData.discountPrice}
                onChange={handleInputChange}
                placeholder="Enter discount price"
                required
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Product</Form.Label>
              <Form.Control
                as="select"
                name="productId"
                value={formData.productId}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Product</option>
                {fooditemdata?.map((product) => (
                  <option key={product._id} value={product._id}>
                    <img
                      src={`${product?.Foodgallery[0]?.image2}`}
                      alt={product?.foodname}
                      style={{ width: 30, marginRight: 10 }}
                    />
                    {product?.foodname} (₹.{product?.foodprice})
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group>
              <Form.Label>Coupon Image</Form.Label>
              <Form.Control type="file" onChange={handleImageChange} />
            </Form.Group>

            <Button variant="warning" type="submit" className="mt-3">
              {editingCoupon ? "Update Coupon" : "Create Coupon"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/*Delet modal for Products */}
      <Modal
        show={deleteShow}
        onHide={() => setDeleteShow(false)}
        backdrop="static"
        keyboard={false}
        size="sm"
        style={{ zIndex: "99999" }}
      >
        <Modal.Header closeButton>
          <Modal.Title style={{ color: "red" }}> Are you sure?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row">
            <div className="col-md-12">
              <p className="fs-4" style={{ color: "red" }}>
                You want to delete this data?
              </p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant=""
            className="modal-close-btn"
            onClick={() => setDeleteShow(false)}
          >
            Close
          </Button>
          <Button
            variant=""
            className="modal-add-btn"
            onClick={handleDeleteCoupon}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showApply} onHide={() => setshowapply(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Users list who applied Coupon</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {users.length > 0 ? (
            <>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Mobile Number</th>
                    <th>Date/Time</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td>{user.Name}</td>
                      <td>{user.MobileNumber}</td>
                      <td>
                        {user?.AppliedDate
                          ? moment(user?.AppliedDate).format("lll")
                          : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <CSVLink
                data={usersDataForCSV} // Provide the CSV data
                filename={`coupon_${selectedCoupon}_users.csv`} // Dynamic filename
                className="btn btn-success" // Style the export button
                target="_blank"
              >
                Export Users as CSV
              </CSVLink>
            </>
          ) : (
            <p className="text-center">No users have applied this coupon.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setshowapply(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminCoupon;
