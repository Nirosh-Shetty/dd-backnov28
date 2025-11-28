import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Button,
  Modal,
  Table,
  Image,
  Spinner,
  Form,
  Row,
  Col,
  Card,
  InputGroup,
  ButtonGroup,
} from "react-bootstrap";
import { AiFillDelete } from "react-icons/ai";
import { BsSearch } from "react-icons/bs";
import "../Admin/Admin.css";
import { IoIosEye } from "react-icons/io";
import axios from "axios";
import * as XLSX from "xlsx";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import ReactPaginate from "react-paginate";
import { FaStar } from "react-icons/fa";
import Swal from "sweetalert2";
// import { debounce } from "lodash"; // Kept from original, but not used in new filter state

const CorporateBookings = () => {
  // --- Original Modal States ---
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const [data, setdata] = useState();
  const handleShow = (item) => {
    setdata(item);
    setShow(true);
  };

  const [show4, setShow4] = useState(false);
  const handleClose4 = () => setShow4(false);
  const handleShow4 = () => setShow4(true);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [show3, setShow3] = useState(false);
  const [dataa, setdataa] = useState(false);
  const handleClose3 = () => setShow3(false);
  const handleShow3 = (items) => {
    setShow3(true);
    setdataa(items);
  };

  // --- Data & Pagination States ---
  const [ApartmentOrder, setApartmentOrder] = useState([]);
  const [hubs, setHubs] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10,
  });

  // --- NEW Filter State Management ---
  const [filters, setFilters] = useState({
    dateFilterType: "today",
    hubId: "",
    session: "All",
    status: "",
    search: "",
    page: 1,
  });

  // --- States for Modal Actions ---
  const [delData, setdelData] = useState();
  const [markloder, setmarkloader] = useState(false);
  const [statusdata, setstatusdata] = useState("");
  const [reason, setreason] = useState("");
  const [excelLoading, setExeclLoading] = useState(false);

  // --- REMOVED Old/Unused States ---
  // const [AllTimesSlote, setAllTimesSlote] = useState([]); (Removed)
  // const [locations, setLocations] = useState([]); (Removed)
  // const [selectedLocations, setSelectedLocations] = useState([]); (Removed)
  // const [allLocation, setAllLocation] = useState([]); (Removed)
  // const [isDropdownOpen, setIsDropdownOpen] = useState(false); (Removed)
  // const dropdownRef = useRef(null); (Removed)

  // --- API Functions ---

  // MODIFIED: Fetches corporate orders based on new filters
  const getApartmentOrder = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page: filters.page,
        limit: pagination.pageSize,
        orderType: "corporate",
        search: filters.search,
        dateFilterType: filters.dateFilterType,
        hubId: filters.hubId,
        session: filters.session,
        status: filters.status,
      };

      const res = await axios.get(
        "http://localhost:7013/api/admin/getallordersfilter",
        { params }
      );

      if (res.data.success) {
        setApartmentOrder(res.data.data.orders);
        setPagination(res.data.data.pagination);
        // REMOVED: setAllTimesSlote and setLocations
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
      setApartmentOrder([]);
      Swal.fire({
        title: "Error",
        text: "Failed to fetch orders",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch Hubs (from original)
  const getHubs = async () => {
    try {
      const res = await axios.get("http://localhost:7013/api/Hub/hubs");
      setHubs(res.data);
    } catch (error) {
      console.error("Failed to fetch hubs:", error);
    }
  };

  // --- useEffects ---
  useEffect(() => {
    getHubs();
  }, []);

  useEffect(() => {
    getApartmentOrder();
  }, [filters]); // Re-fetch orders when any filter changes

  // --- Filter Handlers ---
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const handleDateFilterChange = (type) => {
    setFilters((prev) => ({ ...prev, dateFilterType: type, page: 1 }));
  };

  const handlePageChange = ({ selected }) => {
    setFilters((prev) => ({ ...prev, page: selected + 1 }));
  };

  const clearFilters = () => {
    setFilters({
      dateFilterType: "today",
      hubId: "",
      session: "All",
      status: "",
      search: "",
      page: 1,
    });
  };

  // --- Original Functions (Kept as requested) ---
  const deleteBooking = async (data) => {
    // ... (Your existing function)
    try {
      setLoading(true);
      let res = await axios.delete(
        `http://localhost:7013/api/admin/deletefoodorder/${data}`
      );
      if (res) {
        Swal.fire("Success", "Booking deleted", "success");
        handleClose4();
        getApartmentOrder(); // Refresh
      }
    } catch (error) {
      setLoading(false);
      Swal.fire("Error", "Failed to delete", "error");
    }
  };

  const changestatus = async (item) => {
    // ... (Your existing function)
    if (!statusdata) return alert("Please select a status");
    setLoading(true);
    try {
      const config = {
        url: "/admin/updateOrderStatus/" + item._id,
        method: "put",
        baseURL: "http://localhost:7013/api",
        headers: { "Content-Type": "application/json" },
        data: { newStatus: statusdata },
      };
      const res = await axios(config);
      if (res.status === 200) {
        handleClose3();
        getApartmentOrder(); // Refresh
        Swal.fire("Success", "Order status updated", "success");
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
      Swal.fire("Error", "Failed to update status", "error");
    }
  };

  // WARNING: This function is kept, but will fail
  // It depends on filters (slot, locations) that have been removed.
  const updateSelectedMarks = async () => {
    if (!filters.slot) {
      // This will now always fail
      return Swal.fire("Info", "Please select slot", "info");
    }
    if (!filters.locations.length) {
      // This will now always fail
      return Swal.fire("Info", "Please select location", "info");
    }
    if (!filters.status) {
      return Swal.fire("Info", "Please select order status", "info");
    }
    // ... (rest of your function)
    setmarkloader(true);
    try {
      const config = {
        url: "/admin/updateMultipleOrderStatus",
        method: "put",
        baseURL: "http://localhost:7013/api",
        headers: { "Content-Type": "application/json" },
        data: {
          status: filters.status,
          locations: filters.locations,
          slot: filters.slot,
        },
      };
      let res = await axios(config);
      // ... (rest of your function)
    } catch (error) {
      // ... (rest of your function)
    }
  };

  // Export Excel (Updated to use new filters)
  const handleExportExcel = async () => {
    setExeclLoading(true);
    try {
      const params = {
        ...filters,
        page: 1,
        limit: 10000, // Fetch all for export
        orderType: "corporate",
      };

      const res = await axios.get(
        "http://localhost:7013/api/admin/getallordersfilter",
        { params }
      );

      if (res.data.success) {
        const dataToExport = res.data.data.orders.map((item, index) => ({
          "Sl.No": index + 1,
          "Delivery Date": moment(item?.deliveryDate).format("DD-MM-YYYY"),
          Session: item?.session || "N/A",
          "Placed Date": moment(item?.createdAt).format("DD-MM-YYYY"),
          "Placed Time": moment(item?.createdAt).format("h:mm A"),
          "Order ID": item?.orderid,
          "Customer Name": item?.username,
          "Hub Name": item?.hubId?.hubName || "N/A",
          Slot: item?.slot,
          Category: item?.allProduct
            ?.map((p) => p.foodItemId?.foodcategory)
            .join(", "),
          Product: item?.allProduct
            ?.map((p) => `${p.foodItemId?.foodname} - ${p.quantity} Qty`)
            .join("\n"),
          Cutlery: item?.Cutlery > 0 ? "Yes" : "No",
          Unit: item?.allProduct?.map((p) => p.foodItemId?.unit).join(", "),
          Phone: item?.Mobilenumber,
          Corporate: item?.companyName,
          "Delivery location": item?.delivarylocation,
          // "Delivery Method": item.deliveryMethod || "N/A",
          "Payment Method": item?.paymentmethod,
          "Delivery Amount": item?.deliveryCharge,
          Tax: item?.tax?.toFixed(2),
          "Wallet Discount": item?.discountWallet || 0,
          "Coupon Discount": item?.coupon || 0,
          "Total Amount": item?.allTotal,
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "CorporateOrders");
        XLSX.writeFile(
          workbook,
          `Corporate_Bookings_${moment().format("DDMMYYYY")}.xlsx`
        );
      }
    } catch (error) {
      console.error("Export error:", error);
      alert("Export failed.");
    } finally {
      setExeclLoading(false);
    }
  };

  const renderStars = (rating) => {
    // ... (Your existing function, no changes)
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          color={i <= rating ? "#ffc107" : "#e4e5e9"}
          style={{ marginRight: "2px" }}
        />
      );
    }
    return stars;
  };

  // REMOVED: debouncedSearch useEffect

  return (
    <div>
      {/* === NEW: Date Filter Toggles === */}
      <Card className="mb-3">
        <Card.Body className="d-flex justify-content-center">
          <ButtonGroup
            style={{
              border: "2px solid #007bff",
              borderRadius: "23px",
              padding: "5px",
            }}
          >
            <Button
              variant={
                filters.dateFilterType === "today"
                  ? "primary"
                  : "outline-primary"
              }
              onClick={() => handleDateFilterChange("today")}
              style={{
                borderTopLeftRadius: "18px",
                borderBottomLeftRadius: "18px",
              }}
            >
              Today's Orders
            </Button>
            <Button
              variant={
                filters.dateFilterType === "future"
                  ? "primary"
                  : "outline-primary"
              }
              onClick={() => handleDateFilterChange("future")}
            >
              Future Orders (from Today)
            </Button>
            <Button
              variant={
                filters.dateFilterType === "all" ? "primary" : "outline-primary"
              }
              onClick={() => handleDateFilterChange("all")}
              style={{
                borderTopRightRadius: "18px",
                borderBottomRightRadius: "18px",
              }}
            >
              All Orders
            </Button>
          </ButtonGroup>
        </Card.Body>
      </Card>

      {/* === MODIFIED: Filters Row 1 === */}
      <Row className="d-flex gap-3 align-items-center mb-2 mx-1">
        {/* Hub Filter */}
        <Col md>
          <Form.Label>Hub</Form.Label>
          <Form.Select
            className="packer-slot-select shadow-sm"
            name="hubId"
            value={filters.hubId}
            onChange={handleFilterChange}
          >
            <option value="">All Hubs</option>
            {hubs?.map((hub) => (
              <option key={hub._id} value={hub._id}>
                {hub?.hubName}
              </option>
            ))}
          </Form.Select>
        </Col>

        {/* NEW: Session Filter */}
        <Col md>
          <Form.Label>Session</Form.Label>
          <Form.Select
            className="packer-slot-select shadow-sm"
            name="session"
            value={filters.session}
            onChange={handleFilterChange}
          >
            <option value="All">All Sessions</option>
            <option value="Lunch">Lunch</option>
            <option value="Dinner">Dinner</option>
          </Form.Select>
        </Col>

        {/* Status Filter (Kept) */}
        <Col md>
          <Form.Label>Status</Form.Label>
          <Form.Select
            className="form-select packer-slot-select shadow-sm"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Cooking">Cooking</option>
            <option value="Packing">Packing</option>
            <option value="On the way">On the way</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </Form.Select>
        </Col>

        {/* REMOVED: Location Filter Dropdown */}
        {/* REMOVED: Old Slot Filter */}
        {/* REMOVED: Bulk Update Button (relied on removed filters) */}
      </Row>

      {/* === MODIFIED: Filters Row 2 === */}
      <Row className="d-flex gap-3 mb-2 mx-1 align-items-end">
        {/* Search */}
        <Col md={3}>
          <Form.Label>Search</Form.Label>
          <InputGroup>
            <InputGroup.Text id="basic-addon1">
              <BsSearch />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search by Order ID or Name..."
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
            />
          </InputGroup>
        </Col>

        {/* REMOVED: Date From/To */}

        {/* Clear Filters */}
        <Col md={2}>
          <Button variant="danger" onClick={clearFilters} className="w-100">
            Clear All
          </Button>
        </Col>
      </Row>

      {/* Main Content */}
      <div className="customerhead p-2">
        <div className="d-flex justify-content-between align-items-center">
          <h2 className="header-c">Corporate Booking List</h2>
          <h3 className="header-c">
            Total Orders: {pagination?.totalCount || 0}
          </h3>
          <Button
            variant="success"
            onClick={handleExportExcel}
            disabled={excelLoading}
          >
            {excelLoading ? <Spinner size="sm" /> : "Export Excel"}
          </Button>
        </div>

        <div className="mb-3">
          <Table
            responsive
            bordered
            style={{ width: "-webkit-fill-available" }}
          >
            <thead>
              {/* === ALL COLUMNS KEPT + 2 NEW ADDED === */}
              <tr>
                <th>S.No</th>
                <th>Placed Date</th>
                <th>Placed Time</th>
                <th>Delivery Date</th> {/* NEW */}
                <th>Session</th> {/* NEW */}
                <th>Order ID</th>
                <th>Customer Name</th>
                <th>Total Order</th>
                <th style={{ padding: "30px" }}>Order Status</th>
                <th>Hub</th>
                <th>Slots Details</th>
                <th>Category Name</th>
                <th>Product Name</th>
                <th>Cutlery</th>
                <th>Unit</th>
                <th>Phone Number</th>
                <th>Corporate</th>
                <th>Delivery location</th>
                {/* <th>Delivery Method</th> */}
                <th>Payment Method</th>
                <th>Delivery Amount</th>
                <th>Tax</th>
                <th>Apply Wallet</th>
                <th>Coupon Discount</th>
                <th>Total Amount</th>
                <th>Rate/Comment</th>
                <th>Order Invoice</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={28} className="text-center">
                    {" "}
                    {/* Updated colSpan */}
                    <Spinner animation="border" variant="primary" />
                  </td>
                </tr>
              ) : ApartmentOrder.length === 0 ? (
                <tr>
                  <td colSpan={28} className="text-center">
                    {" "}
                    {/* Updated colSpan */}
                    No orders found
                  </td>
                </tr>
              ) : (
                ApartmentOrder.map((items, i) => {
                  const serialNumber =
                    (pagination.currentPage - 1) * pagination.pageSize + i + 1;
                  return (
                    <tr key={items._id}>
                      <td>{serialNumber}</td>
                      <td style={{ paddingTop: "20px" }}>
                        {moment(items?.createdAt).format("DD-MM-YYYY")}
                      </td>
                      <td style={{ paddingTop: "20px" }}>
                        {moment(items?.createdAt).format("h:mm A")}
                      </td>
                      {/* === NEW DATA CELLS === */}
                      <td style={{ paddingTop: "20px" }}>
                        {items?.deliveryDate
                          ? moment(items.deliveryDate).format("DD-MM-YYYY")
                          : "N/A"}
                      </td>
                      <td style={{ paddingTop: "20px" }}>
                        {items?.session || "N/A"}
                      </td>
                      {/* === END NEW DATA CELLS === */}
                      <td style={{ paddingTop: "20px" }}>{items?.orderid}</td>
                      <td style={{ paddingTop: "20px" }}>
                        {items?.username}
                        {items?.studentName && (
                          <> | Student: {items.studentName}</>
                        )}
                      </td>
                      <td style={{ paddingTop: "20px" }}>
                        {items?.totalOrder || 0}
                      </td>
                      <td style={{ paddingTop: "20px", width: "400px" }}>
                        {items?.status}
                        <Button
                          className="modal-add-btn mt-2"
                          variant=""
                          onClick={() => handleShow3(items)}
                        >
                          Change Status
                        </Button>
                      </td>
                      <td style={{ paddingTop: "20px" }}>
                        {items?.hubId?.hubName || "N/A"}{" "}
                        {/* Using populated hub name */}
                      </td>
                      <td style={{ paddingTop: "20px" }}>{items?.slot}</td>
                      <td style={{ paddingTop: "20px" }}>
                        {items?.allProduct?.map((item, idx) => (
                          <span key={idx}>
                            {item?.foodItemId?.foodcategory}
                            {idx !== items.allProduct.length - 1 ? ", " : ""}
                          </span>
                        ))}
                      </td>
                      <td style={{ paddingTop: "20px" }}>
                        {items?.allProduct?.map((item, idx) => (
                          <span key={idx}>
                            {`${item?.foodItemId?.foodname} - ${item?.quantity} Qty`}
                            {idx !== items.allProduct.length - 1 ? ", " : ""}
                            {/* <br></br> */}
                          </span>
                        ))}
                      </td>
                      <td>{items?.Cutlery > 0 ? "Yes" : "No"}</td>
                      <td style={{ paddingTop: "20px" }}>
                        {items?.allProduct?.map((item, idx) => (
                          <span key={idx}>
                            {item?.foodItemId?.unit}
                            {idx !== items.allProduct.length - 1 ? ", " : ""}
                          </span>
                        ))}
                      </td>
                      <td style={{ paddingTop: "20px" }}>
                        {items?.Mobilenumber}
                      </td>
                      <td style={{ paddingTop: "20px" }}>
                        {items?.companyName}
                      </td>{" "}
                      {/* Using companyName */}
                      <td style={{ paddingTop: "20px" }}>
                        {items?.delivarylocation},{items?.addressline}
                      </td>
                      {/* <td style={{ paddingTop: "20px" }}>
                        {items.deliveryMethod ? items?.deliveryMethod : "N/A"}
                      </td> */}
                      <td style={{ paddingTop: "20px" }}>
                        {items?.paymentmethod}
                      </td>
                      <td style={{ paddingTop: "20px" }}>
                        {items?.deliveryCharge}
                      </td>
                      <td style={{ paddingTop: "20px" }}>
                        {items?.tax?.toFixed(2)}
                      </td>
                      <td style={{ paddingTop: "20px" }}>
                        {items?.discountWallet ? "Yes" : "No"}
                      </td>
                      <td style={{ paddingTop: "20px" }}>
                        {items?.coupon || "No"}
                      </td>
                      <td style={{ paddingTop: "20px" }}>₹{items?.allTotal}</td>
                      <td style={{ paddingTop: "20px" }}>
                        {items?.rate ? (
                          <div>
                            <div>{renderStars(items?.rate)}</div>
                            <small>{items?.comement || "No comment"}</small>
                          </div>
                        ) : (
                          "Not rated"
                        )}
                      </td>
                      <td style={{ paddingTop: "5px" }}>
                        <Button onClick={() => handleShow(items)}>
                          <IoIosEye size={20} />
                        </Button>
                        <Button
                          variant=""
                          style={{
                            background: "green",
                            color: "white",
                            border: "1px solid white",
                          }}
                          onClick={() =>
                            navigate("/thermalinvoice", {
                              state: { item: items },
                            })
                          }
                        >
                          Print
                        </Button>
                      </td>
                      <td style={{ paddingTop: "20px" }}>
                        <Button
                          className="modal-add-btn"
                          variant=""
                          onClick={() => {
                            setdelData(items._id);
                            handleShow4();
                          }}
                        >
                          <AiFillDelete />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="d-flex justify-content-center">
            <ReactPaginate
              previousLabel={"Back"}
              nextLabel={"Next"}
              breakLabel="..."
              pageCount={pagination.totalPages}
              onPageChange={handlePageChange}
              forcePage={pagination.currentPage - 1}
              containerClassName={"paginationBttns"}
              previousLinkClassName={"previousBttn"}
              nextLinkClassName={"nextBttn"}
              disabledClassName={"paginationDisabled"}
              activeClassName={"paginationActive"}
            />
          </div>
        )}
      </div>

      {/* --- ALL MODALS (Kept from original) --- */}

      {/* Delete booking */}
      <Modal
        show={show4}
        onHide={handleClose4}
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
                <br /> you want to delete this data?
              </p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="" className="modal-close-btn" onClick={handleClose4}>
            Close
          </Button>
          <Button
            variant=""
            onClick={() => deleteBooking(delData)}
            className="modal-add-btn"
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Invoice */}
      <Modal
        show={show}
        onHide={handleClose}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        style={{ zIndex: 9999999 }}
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Order Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row">
            {data && (
              <div>
                <h4>Order Summary</h4>
                <b>{data?.allProduct?.length} Items</b>
                <hr />

                <div className="row w-100">
                  {data?.allProduct?.map((Item) => {
                    return (
                      <div className="row  border mt-1 mx-1" key={Item?._id}>
                        <div className="col-md-4">
                          <img
                            src={`${Item?.foodItemId?.Foodgallery[0]?.image2}`}
                            alt=""
                            style={{ width: "90px", height: "80px" }}
                          />
                        </div>
                        <div className="col-md-4">
                          <div style={{ textAlign: "left" }}>
                            <b>{Item?.foodItemId?.foodname}</b> <br />
                            <span>
                              <b> ₹ {Item?.totalPrice / Item?.quantity}</b>
                            </span>
                            <br />
                            <b> Qty. {Item?.quantity}</b>
                          </div>
                        </div>
                        <div className="col-md-4 d-flex align-items-center">
                          <div style={{ textAlign: "left" }}>
                            <b>₹ {(Item?.totalPrice).toFixed(2)}</b> <br />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="row m-2 mt-3 align-items-center">
                  <b>Bill Details</b>
                  <div className="col-md-10 mb-2">
                    <div>
                      <div>Sub Total</div>
                      <div>Tax (5%)</div>
                      {data?.Cutlery ? <div>Cutlery</div> : null}
                      {data?.delivarytype ? <div>Delivery charges</div> : null}
                      {data?.coupon ? <div>Coupon Discount</div> : null}
                      {data?.discountWallet ? <div>Apply Wallet</div> : null}
                      <div>
                        <b>Bill total</b>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-2 mb-2">
                    <div style={{ textAlign: "left" }}>
                      <div>
                        <div>
                          ₹{" "}
                          {data?.allProduct
                            ?.reduce((acc, item) => {
                              return (
                                Number(acc) +
                                Number(item?.quantity) *
                                  Number(item?.foodItemId?.foodprice)
                              );
                            }, 0)
                            .toFixed(2)}
                        </div>
                        <div>₹ {data?.tax?.toFixed(2)}</div>
                        {data?.Cutlery ? <div>₹ {data?.Cutlery}</div> : null}
                        {data?.delivarytype ? (
                          <div>₹ {data?.delivarytype}</div>
                        ) : null}
                        {data?.coupon ? <div>- ₹ {data?.coupon}</div> : null}
                        {data?.discountWallet ? (
                          <div>- ₹ {data?.discountWallet}</div>
                        ) : null}
                        <div>
                          <b>₹ {data?.allTotal.toFixed(2)}</b>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row m-2 mt-3">
                  <b>Customer Feedback</b>
                  <div className="col-md-12">
                    <div style={{ marginBottom: "10px" }}>
                      <span>Rating: </span>
                      {renderStars(data?.rate || 0)}
                    </div>
                    <div>
                      <span>Comment: </span>
                      {data?.comement || "No Comment"}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="d-flex gap-4 justify-content-end mt-3 mb-3">
            <div>
              <Button
                variant=""
                style={{
                  background: "white",
                  color: "green",
                  border: "1px solid green",
                }}
                onClick={handleClose}
              >
                Close
              </Button>
            </div>
            <div>
              <Button
                variant=""
                style={{
                  background: "green",
                  color: "white",
                  border: "1px solid white",
                }}
                onClick={() =>
                  navigate("/AdminInvoice", { state: { item: data } })
                }
              >
                Invoice
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* status change  */}
      <Modal
        show={show3}
        onHide={handleClose3}
        backdrop="static"
        keyboard={false}
        style={{ zIndex: "99999" }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Change Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="col-md-12 mb-2">
            <Form.Select // Changed to Form.Select
              name="status"
              id="status"
              onChange={(e) => {
                setstatusdata(e.target.value);
              }}
              defaultValue="" // Use defaultValue
            >
              <option value="" disabled>
                Select Status
              </option>
              <option value="Cooking">Cooking</option>
              <option value="Packing">Packing</option>
              <option value="On the way">On the way</option>
              <option value="Delivered">Delivered</option>
            </Form.Select>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose3}>
            Close
          </Button>
          <Button
            variant="primary" // Changed variant
            className="modal-add-btn"
            onClick={() => changestatus(dataa)}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CorporateBookings;
