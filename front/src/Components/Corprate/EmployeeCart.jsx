import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  Table,
  Modal,
  InputGroup,
  FormControl,
  Spinner,
} from "react-bootstrap";
import moment from "moment";
import { FaSearch, FaShoppingCart } from "react-icons/fa";
import { LuDownload } from "react-icons/lu";
import { CSVLink } from "react-csv";
import ReactPaginate from "react-paginate";

// CSS for ReactPaginate (add to your CSS file or inline)

const EmployeeCart = () => {
  const [carts, setCarts] = useState([]);
  const [selectedCart, setSelectedCart] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(0); // ReactPaginate uses 0-based indexing
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const cartsPerPage = 5;
  const coprate = JSON.parse(localStorage.getItem("corporate"));
  // Fetch abandoned carts
  const fetchCarts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:7013/api/cart/getCartBycompany/" + coprate._id
      );
      setCarts(response.data.items || []);
    } catch (error) {
      console.error("Error fetching carts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (coprate?._id) {
      fetchCarts();
    }
  }, [coprate?._id]);

  // Search logic
  const filteredCarts = carts.filter((cart) => {
    const username = cart.username ? String(cart.username) : "";
    const mobile = cart.mobile ? String(cart.mobile) : "";
    return (
      username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mobile.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Pagination logic
  const pageCount = Math.ceil(filteredCarts.length / cartsPerPage);
  const indexOfLastCart = (currentPage + 1) * cartsPerPage;
  const indexOfFirstCart = indexOfLastCart - cartsPerPage;
  const currentCarts = filteredCarts.slice(indexOfFirstCart, indexOfLastCart);

  // Handle page change
  const changePage = ({ selected }) => {
    setCurrentPage(selected);
  };

  // Open modal to show cart details
  const handleViewCart = (cart) => {
    setSelectedCart(cart);
    setShowModal(true);
  };

  // CSV export data
  const csvData = filteredCarts.map((cart) => ({
    CartID: cart.cartId || "N/A",
    Username: cart.username || "Unknown",
    Mobile: cart.mobile ? String(cart.mobile) : "N/A",
    ItemsCount: cart.items?.length || 0,
    LastUpdated: moment(cart.lastUpdated).format("lll"),

    Status: cart.status || "N/A",
  }));

  return (
    <div className="container mt-5">
      {/* Inject pagination styles */}
      {/* <style>{paginationStyles}</style> */}

      <h2 className="text-center mb-4 " style={{ color: "#fe4500" }}>
        <FaShoppingCart className="me-2" /> Abandoned Cart Management
      </h2>

      {/* Search and Export */}
      <div className="d-flex justify-content-between mb-4 flex-wrap">
        <InputGroup className="w-50" style={{ minWidth: "200px" }}>
          <InputGroup.Text>
            <FaSearch />
          </InputGroup.Text>
          <FormControl
            placeholder="Search by Username or Mobile..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(0); // Reset to first page on search
            }}
          />
        </InputGroup>
        <CSVLink
          data={csvData}
          filename={`abandoned_carts_${moment().format("YYYYMMDD")}.csv`}
          className="btn btn-outline-success mt-2 mt-md-0"
        >
          <LuDownload className="me-2" /> Export to CSV
        </CSVLink>
      </div>

      {/* Cart Table */}
      <Table
        striped
        bordered
        hover
        responsive
        className="text-center shadow-sm"
      >
        <thead className="table-dark">
          <tr>
            <th>Cart ID</th>
            <th>User Name</th>
            <th>Mobile</th>
            <th>Items Count</th>
            <th>Last Updated</th>
            {/* <th>Abandoned</th> */}
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={8}>
                <Spinner animation="border" variant="primary" />
              </td>
            </tr>
          ) : currentCarts.length > 0 ? (
            currentCarts.map((cart) => (
              <tr key={cart._id}>
                <td>{cart.cartId || "N/A"}</td>
                <td>{cart.username || "Unknown"}</td>
                <td>{cart.mobile ? String(cart.mobile) : "N/A"}</td>
                <td>{cart.items?.length || 0}</td>
                <td>{moment(cart.lastUpdated).format("lll")}</td>
                {/* <td>
                  <span
                    className={`badge ${
                      cart.abandoned ? "bg-danger" : "bg-success"
                    }`}
                  >
                    {cart.abandoned ? "Yes" : "No"}
                  </span>
                </td> */}
                <td>{cart.status || "N/A"}</td>
                <td>
                  <Button
                    variant="outline-info"
                    size="sm"
                    onClick={() => handleViewCart(cart)}
                  >
                    View Details
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} className="text-center text-muted">
                No abandoned carts found.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Pagination with ReactPaginate */}
      {filteredCarts.length > cartsPerPage && (
        <ReactPaginate
          previousLabel={"Back"}
          nextLabel={"Next"}
          pageCount={pageCount}
          onPageChange={changePage}
          containerClassName={"paginationBttns"}
          previousLinkClassName={"previousBttn"}
          nextLinkClassName={"nextBttn"}
          disabledClassName={"paginationDisabled"}
          activeClassName={"paginationActive"}
        />
      )}

      {/* Modal to show cart details */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        className="animate__animated animate__fadeIn"
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>
            <FaShoppingCart className="me-2" /> Cart Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCart ? (
            <>
              <p>
                <strong>Cart ID:</strong> {selectedCart.cartId || "N/A"}
              </p>
              <p>
                <strong>User Name:</strong> {selectedCart.username || "Unknown"}
              </p>
              <p>
                <strong>Mobile:</strong>{" "}
                {selectedCart.mobile ? String(selectedCart.mobile) : "N/A"}
              </p>
              <p>
                <strong>Last Updated:</strong>{" "}
                {moment(selectedCart.lastUpdated).format("lll")}
              </p>
              <p>
                <strong>Abandoned:</strong>{" "}
                {selectedCart.abandoned ? "Yes" : "No"}
              </p>
              <p>
                <strong>Status:</strong> {selectedCart.status || "N/A"}
              </p>
              <h5 className="mt-3">🛒 Cart Items:</h5>
              {selectedCart.items?.length > 0 ? (
                <Table striped bordered responsive>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Price</th>
                      <th>Unit</th>
                      <th>Quantity</th>
                      <th>Image</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCart.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.foodname || "N/A"}</td>
                        <td>₹{item.totalPrice?.toFixed(2) || "0.00"}</td>
                        <td>{item.unit || "N/A"}</td>
                        <td>{item.Quantity || 0}</td>
                        <td>
                          <img
                            src={item.image || "https://via.placeholder.com/50"}
                            alt={item.foodname || "Item"}
                            style={{ width: 50, borderRadius: "5px" }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-muted">No items in cart.</p>
              )}
            </>
          ) : (
            <p className="text-muted">No details available</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EmployeeCart;
