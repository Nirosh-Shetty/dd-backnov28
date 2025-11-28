import React, { useState, useEffect, useContext } from "react";
import {
  Button,
  Modal,
  Table,
  Form,
  InputGroup,
  FormControl,
  Spinner,
} from "react-bootstrap";
import { BsSearch, BsFillPersonFill, BsFillEyeFill } from "react-icons/bs";
import { PiBasketFill } from "react-icons/pi";
import { TiMessages } from "react-icons/ti";
import { FaAngleRight } from "react-icons/fa";
import { MdDelete, MdDeleteForever, MdOutlineFileCopy } from "react-icons/md";
import { LuDownload } from "react-icons/lu";
import axios from "axios";
import * as XLSX from "xlsx";
import "../Admin/Admin.css";
import moment from "moment";
import ReactPaginate from "react-paginate";
import { WalletContext } from "../../WalletContext";

// CSS for ReactPaginate and custom styles

const UserList = () => {
  const { AllWallet, AdminWallet } = useContext(WalletContext);

  // Modal states
  const [show4, setShow4] = useState(false);
  const [show, setShow] = useState(false);
  const [show2, setShow2] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const handleClose4 = () => setShow4(false);
  const handleShow4 = (user) => {
    setSelectedWallet(user);
    setShow4(true);
  };
  const handleClose = () => setShow(false);
  const handleShow = (userId) => {
    setSelectedUserId(userId);
    setShow(true);
  };
  const handleClose2 = () => setShow2(false);
  const handleShow2 = () => setShow2(true);

  // Wallet management states
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [actionType, setActionType] = useState("add");
  const [walletLoading, setWalletLoading] = useState(false);

  // User data states
  const [Adduser, setAdduser] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [searchH, setSearchH] = useState("");
  const [startDate, setstartDate] = useState("");
  const [endDate, setendDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState({
    current: 0,
    total: 0,
  });

  // Fetch user data with pagination
  const getAdduser = async (
    page = 1,
    search = "",
    startDate = "",
    endDate = ""
  ) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search: search,
        startDate: startDate,
        endDate: endDate,
        sortBy: "_id",
        sortOrder: "desc",
      });

      const response = await axios.get(
        `http://localhost:7013/api/User/registeruser?${params}`
      );
      if (response.status === 200) {
        setAdduser(response.data.success);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAdduser(1, searchH, startDate, endDate);
  }, [searchH, startDate, endDate]);

  const [deleteModele, setDeleteModele] = useState(false);
  const [deleteID, setDeleteID] = useState(null);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const config = {
        url: `/User/deleteUser/${deleteID}`,
        method: "delete",
        baseURL: "http://localhost:7013/api",
        headers: { "Content-Type": "application/json" },
      };
      const res = await axios(config);
      if (res.status === 200) {
        alert("User deleted successfully");
        setDeleteModele(false);
        getAdduser();
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  // Fetch apartment orders
  const [ApartmentOrder, setApartmentOrder] = useState([]);
  const getApartmentOrder = async () => {
    try {
      let res = await axios.get("http://localhost:7013/api/admin/getallorders");
      if (res.status === 200) {
        setApartmentOrder(res.data.order.reverse());
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getApartmentOrder();
  }, []);

  // Block/Unblock user
  const handleBlockUnblock = async (user) => {
    try {
      const config = {
        url: `/User/blockuser/${user?._id}`,
        method: "put",
        baseURL: "http://localhost:7013/api",
        headers: { "Content-Type": "application/json" },
      };
      const res = await axios(config);
      if (res.status === 200) {
        alert(
          user?.BlockCustomer
            ? "Successfully unblocked"
            : "Successfully blocked"
        );
        getAdduser();
      }
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.error || "An error occurred.");
    }
    handleClose4();
  };

  // Wallet management
  const [userw, setUserW] = useState("");
  const handleManageWallet = (wallet, type) => {
    const walletData = AllWallet.find(
      (ele) => ele?.userId?._id.toString() === wallet?.toString()
    );
    setUserW(wallet);
    setSelectedWallet(walletData);
    setActionType(type);
    setAmount(0);
    setDescription("");
    setExpiryDate("");
    setShowModal(true);
  };

  const handleSubmit = async () => {
    setWalletLoading(true);
    try {
      await axios.post(
        actionType === "add"
          ? "http://localhost:7013/api/wallet/add-free-cash"
          : "http://localhost:7013/api/wallet/deduct-cash",
        {
          userId: userw,
          amount: Number(amount),
          description,
          expiryDays: actionType === "add" ? expiryDate : null,
        }
      );
      setShowModal(false);
      AdminWallet();
    } catch (error) {
      console.error("Error updating wallet:", error);
      alert("Failed to update wallet.");
    } finally {
      setWalletLoading(false);
    }
  };

  // Search filter
  const handleFilterH = (e) => {
    const searchTerm = e.target.value;
    setSearchH(searchTerm);
    getAdduser(1, searchTerm, startDate, endDate);
  };

  // Date filter
  const filterData = () => {
    if (!startDate) {
      alert("Please select a 'from' date");
      return;
    }
    if (!endDate) {
      alert("Please select a 'to' date");
      return;
    }

    const startDateObj = moment(startDate, "YYYY-MM-DD");
    const endDateObj = moment(endDate, "YYYY-MM-DD").endOf("day");

    if (endDateObj.isBefore(startDateObj)) {
      alert("End date cannot be before the start date");
      return;
    }

    getAdduser(1, searchH, startDate, endDate);
  };

  const clearbutton = () => {
    setendDate("");
    setstartDate("");
    setSearchH("");
    getAdduser(1, "", "", "");
  };

  // Function to fetch all users for export in chunks
  const fetchAllUsersForExport = async () => {
    setIsExporting(true);
    setExportProgress({ current: 0, total: 0 });

    try {
      let allUsers = [];
      let currentPage = 1;
      let hasMorePages = true;
      let totalCount = 0;

      while (hasMorePages) {
        const params = new URLSearchParams({
          search: searchH,
          startDate: startDate,
          endDate: endDate,
          page: currentPage.toString(),
          limit: "1000", // Process 1000 records at a time
        });

        const response = await axios.get(
          `http://localhost:7013/api/User/export-all?${params}`
        );
        const chunkData = response.data.success;
        const pagination = response.data.pagination;

        allUsers = [...allUsers, ...chunkData];
        hasMorePages = pagination.hasNextPage;
        currentPage++;
        totalCount = pagination.totalCount;

        // Update progress
        setExportProgress({
          current: allUsers.length,
          total: totalCount,
        });
      }

      return allUsers;
    } catch (error) {
      console.error("Error fetching users for export:", error);
      return [];
    } finally {
      setIsExporting(false);
      setExportProgress({ current: 0, total: 0 });
    }
  };

  // Export Excel
  const handleExportExcel = async () => {
    try {
      const allUsers = await fetchAllUsersForExport();

      if (allUsers.length === 0) {
        alert("No data to export");
        return;
      }

      const customHeaders = allUsers.map((item) => ({
        "Registered Date": moment(item.updatedAt).format("MM/DD/YYYY, hh:mm A"),
        "User ID": item._id,
        Name: item.Fname || "N/A",
        "Mobile Number": item.Mobile ? String(item.Mobile) : "N/A",
        "Email ID": item.Email || "N/A",
        Address: item.Address || "N/A",
        "Total Orders": item.totalOrders || 0,
        "Total Wallet Balance": `₹${item.walletBalance || "0.00"}`,
        "Wallet Expiry Date": item.walletExpiry || "N/A",
        "Last Order": item.lastOrder
          ? `${item.lastOrder.date} - ₹${item.lastOrder.amount}`
          : "No orders",
        "Total Amount": `₹${item.totalAmount || "0.00"}`,
        "Last Login": item.updatedAt
          ? moment(item.updatedAt).format("MM/DD/YYYY, hh:mm A")
          : "N/A",
        "User Type": `${
          item.status == "Employee"
            ? item.employeeId + " Employee"
            : "Normal User"
        }`,
        "Acquisition Channel": item.acquisition_channel || "N/A",
        Status: item.BlockCustomer ? "Blocked" : "Active",
      }));

      const worksheet = XLSX.utils.json_to_sheet(customHeaders);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "User List");
      XLSX.writeFile(workbook, `UserList_${moment().format("YYYYMMDD")}.xlsx`);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    }
  };

  // Order and wallet calculations
  const findOrdersTotal = (customerId) => {
    return ApartmentOrder.filter(
      (customer) => customer?.customerId === customerId
    )
      .reduce((acc, item) => acc + Number(item.allTotal || 0), 0)
      .toFixed(2);
  };

  const findNumberofOrders = (customerId) => {
    return ApartmentOrder.filter(
      (customer) => customer?.customerId === customerId
    ).length;
  };

  const findLastOrder = (customerId) => {
    return ApartmentOrder.filter(
      (order) => order.customerId === customerId
    ).sort((a, b) => new Date(b.Placedon) - new Date(a.Placedon));
  };

  const findWalletBalence = (userId) => {
    return (
      AllWallet.find(
        (ele) => ele?.userId?._id.toString() === userId?.toString()
      ) || { balance: 0 }
    );
  };

  const findWalletExpiry = (userId) => {
    const wallet = AllWallet.find(
      (ele) => ele?.userId?._id.toString() === userId?.toString()
    );
    if (wallet?.transactions?.length) {
      const earliestExpiry = wallet.transactions
        .filter(
          (txn) => txn.expiryDate && moment(txn.expiryDate).isAfter(moment())
        )
        .sort(
          (a, b) => new Date(a.expiryDate) - new Date(b.expiryDate)
        )[0]?.expiryDate;
      return earliestExpiry
        ? moment(earliestExpiry).format("MM/DD/YYYY, hh:mm A")
        : "N/A";
    }
    return "N/A";
  };

  // Pagination
  const changePage = ({ selected }) => {
    const newPage = selected + 1; // ReactPaginate uses 0-based indexing, our API uses 1-based
    getAdduser(newPage, searchH, startDate, endDate);
  };

  return (
    <div className="container mt-5">
      {/* <style>{customStyles}</style> */}

      <h2 className="header-c">User List</h2>

      {/* Filters */}
      <div className="d-flex flex-wrap gap-3 mb-4">
        <InputGroup style={{ maxWidth: "300px" }}>
          <InputGroup.Text>
            <BsSearch />
          </InputGroup.Text>
          <FormControl
            type="text"
            placeholder="Search by Name, Mobile, or Email..."
            value={searchH}
            onChange={handleFilterH}
          />
        </InputGroup>
        <InputGroup style={{ maxWidth: "250px" }}>
          <InputGroup.Text>From:</InputGroup.Text>
          <FormControl
            type="date"
            value={startDate}
            onChange={(e) => setstartDate(e.target.value)}
          />
        </InputGroup>
        <InputGroup style={{ maxWidth: "250px" }}>
          <InputGroup.Text>To:</InputGroup.Text>
          <FormControl
            type="date"
            value={endDate}
            onChange={(e) => setendDate(e.target.value)}
          />
        </InputGroup>
        <Button variant="primary" onClick={filterData}>
          Filter
        </Button>
        <Button variant="danger" onClick={clearbutton}>
          Clear
        </Button>
        <Button
          variant="success"
          onClick={handleExportExcel}
          disabled={isExporting}
        >
          {isExporting ? (
            <>
              <Spinner size="sm" className="me-2" />
              {exportProgress.total > 0
                ? `Exporting... ${exportProgress.current}/${exportProgress.total}`
                : "Exporting..."}
            </>
          ) : (
            <>
              <LuDownload className="me-2" /> Export Excel
            </>
          )}
        </Button>
      </div>

      {/* User Table */}
      <Table responsive bordered hover className="shadow-sm">
        <thead className="table-dark">
          <tr>
            <th>SL.NO</th>
            <th>Registered Date</th>
            <th>User ID</th>
            <th>Profile</th>
            <th>Name</th>
            <th>Mobile Number</th>
            <th>Address</th>
            <th>Total Orders</th>
            <th>Total Wallet Balance</th>
            <th>Wallet Expiry Date</th>
            <th>Last Order</th>
            <th>Total Amount</th>
            <th>Last Login</th>
            <th>User Type</th>
            <th>Acquisition Channel</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={15} className="text-center">
                <Spinner animation="border" variant="primary" />
              </td>
            </tr>
          ) : Adduser?.length > 0 ? (
            Adduser.map((item, i) => (
              <tr key={item._id}>
                <td>
                  {i + 1 + (pagination.currentPage - 1) * pagination.limit}
                </td>
                <td>{moment(item?.updatedAt).format("MM/DD/YYYY h:mm A")}</td>
                <td>{item?._id}</td>
                <td>
                  {item?.profileImage ? (
                    <img
                      src={`http://localhost:7013/Customer/${item?.profileImage}`}
                      alt="Profile"
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                      }}
                      onError={(e) =>
                        (e.target.outerHTML =
                          '<i class="bi bi-person-fill" style="font-size: 50px;"></i>')
                      }
                    />
                  ) : (
                    <BsFillPersonFill size={50} />
                  )}
                </td>
                <td>{item?.Fname || "N/A"}</td>
                <td>{item?.Mobile ? String(item.Mobile) : "N/A"}</td>
                <td>{item?.Address || "N/A"}</td>
                <td>{findNumberofOrders(item?._id)}</td>
                <td>
                  ₹{findWalletBalence(item?._id)?.balance?.toFixed(2) || "0.00"}{" "}
                  <Button
                    variant="outline-success"
                    size="sm"
                    className="me-2"
                    onClick={() => handleManageWallet(item?._id, "add")}
                  >
                    Add Bonus
                  </Button>
                </td>
                <td>{findWalletExpiry(item?._id)}</td>
                <td>
                  {findLastOrder(item?._id)?.[0]?.allTotal
                    ? `${moment(findLastOrder(item?._id)[0].Placedon).format(
                        "MM/DD/YYYY, hh:mm A"
                      )} - ₹${findLastOrder(item?._id)[0].allTotal}`
                    : "No orders"}
                </td>
                <td>₹{findOrdersTotal(item?._id)}</td>
                <td>
                  {item.updatedAt
                    ? moment(item.updatedAt).format("MM/DD/YYYY, hh:mm A")
                    : "N/A"}
                </td>
                <td>
                  {item?.status == "Employee" && `${item?.employeeId}`}
                  <br />
                  {item?.status || "N/A"}
                </td>
                <td>
                  {item.acquisition_channel ? item.acquisition_channel : "N/A"}
                </td>
                <td>{item.BlockCustomer ? "Blocked" : "Active"}</td>
                <td>
                  <div className="d-flex gap-2">
                    <Button
                      variant={
                        item?.BlockCustomer ? "danger" : "outline-success"
                      }
                      size="sm"
                      onClick={() => handleShow4(item)}
                    >
                      {item?.BlockCustomer ? "Unblock" : "Block"}
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => {
                        setDeleteID(item?._id);
                        setDeleteModele(true);
                      }}
                    >
                      <MdDelete size={20} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={15} className="text-center text-muted">
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Pagination */}
      <div className="d-flex align-items-center justify-content-between mt-3">
        <p>Total Count: {pagination.totalCount}</p>
        <ReactPaginate
          previousLabel={"Back"}
          nextLabel={"Next"}
          pageCount={pagination.totalPages}
          onPageChange={changePage}
          containerClassName={"paginationBttns"}
          previousLinkClassName={"previousBttn"}
          nextLinkClassName={"nextBttn"}
          disabledClassName={"paginationDisabled"}
          activeClassName={"paginationActive"}
          forcePage={pagination.currentPage - 1} // Convert to 0-based for ReactPaginate
        />
      </div>

      {/* Order History Modal */}
      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
        className="animate__animated animate__fadeIn"
      >
        <Modal.Header closeButton>
          <Modal.Title>Order History</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {ApartmentOrder.filter((order) => order.customerId === selectedUserId)
            .length > 0 ? (
            ApartmentOrder.filter(
              (order) => order.customerId === selectedUserId
            ).map((order) => (
              <div key={order._id} className="row p-2 mt-3 mb-2">
                <div className="col-md-10">
                  <div className="order-icond-text d-flex align-items-center">
                    <PiBasketFill
                      style={{ fontSize: "25px", marginRight: "10px" }}
                    />
                    <div>
                      <b>
                        {order.orderId || "N/A"} ·{" "}
                        <span>₹{order.allTotal || "0.00"}</span>
                      </b>
                      <br />
                      <span>
                        {moment(order.Placedon).format(
                          "dddd, DD MMM YYYY, hh:mm A"
                        )}
                      </span>
                    </div>
                    <Button variant="success" className="ms-3">
                      {order.status || "Unknown"}
                    </Button>
                  </div>
                </div>
                <div className="col-md-2 mt-3">
                  <Button variant="outline-success" onClick={handleShow2}>
                    <BsFillEyeFill style={{ fontSize: "20px" }} />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted text-center">No orders found.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Block Modal */}
      <Modal
        show={show4}
        onHide={handleClose4}
        backdrop="static"
        keyboard={false}
        className="animate__animated animate__fadeIn"
      >
        <Modal.Header closeButton>
          <Modal.Title>Warning</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="fs-4" style={{ color: "red" }}>
            Are you sure?
            <br /> you want to{" "}
            {selectedWallet?.BlockCustomer ? "unblock" : "block"} this Customer?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose4}>
            Close
          </Button>
          <Button
            variant="danger"
            onClick={() => handleBlockUnblock(selectedWallet)}
          >
            {selectedWallet?.BlockCustomer ? "Unblock" : "Block"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/*Delete Modal */}
      <Modal
        show={deleteModele}
        onHide={() => setDeleteModele(false)}
        backdrop="static"
        keyboard={false}
        className="animate__animated animate__fadeIn"
      >
        <Modal.Header closeButton>
          <Modal.Title>Warning</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="fs-4" style={{ color: "red" }}>
            Are you sure?
            <br /> you want to delete this Customer?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteModele(false)}>
            Close
          </Button>
          <Button variant="danger" onClick={() => handleDelete()}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Order Summary Modal */}
      <Modal
        show={show2}
        onHide={handleClose2}
        size="lg"
        centered
        className="animate__animated animate__fadeIn"
      >
        <Modal.Header closeButton>
          <Modal.Title>Order Summary</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <div>
              <h4>Order Summary</h4>
              <div>Arrived at 1-10 PM</div>
              <div>
                <b>4 Items in this Order</b>
              </div>
              <hr />
            </div>
            {[
              { name: "Spinach", qty: "200 g x 1", price: 29 },
              { name: "Spinach", qty: "200 g x 1", price: 29 },
              { name: "Spinach", qty: "200 g x 1", price: 29 },
              { name: "Spinach", qty: "200 g x 1", price: 29 },
            ].map((item, index) => (
              <div className="row m-2 align-items-center" key={index}>
                <div className="col-md-10">
                  <div className="order-icond-text d-flex">
                    <div className="col-md-2">
                      <img
                        src="../Assets/leafies.jpg"
                        alt={item.name}
                        style={{ width: "90px", height: "80px" }}
                      />
                    </div>
                    <div style={{ textAlign: "left" }}>
                      <b>{item.name}</b> <br />
                      <span>{item.qty}</span>
                    </div>
                  </div>
                </div>
                <div className="col-md-2">
                  <p>
                    <b>₹{item.price}</b>
                  </p>
                </div>
              </div>
            ))}
            <div className="row m-2 mt-3 align-items-center">
              <b>Bill Details</b>
              <div className="col-md-10 mb-2">
                <div>
                  <div>MRP</div>
                  <div>Product discount</div>
                  <div>Item total</div>
                  <div>Handling charge</div>
                  <div>Delivery charges</div>
                  <div>Feeding India donation</div>
                  <div>
                    <b>Bill total</b>
                  </div>
                </div>
              </div>
              <div className="col-md-2 mb-2">
                <div style={{ textAlign: "left" }}>
                  <div>₹237</div>
                  <div>- ₹40</div>
                  <div>₹230</div>
                  <div>+ ₹2</div>
                  <div>+25</div>
                  <div>+ ₹1</div>
                  <div>
                    <b>₹246</b>
                  </div>
                </div>
              </div>
            </div>
            <div className="row m-2 mt-3 align-items-center">
              <b>Order details</b>
              <div>
                <div className="mt-2 mb-2">
                  <p style={{ margin: "0" }}>Order ID</p>
                  <p style={{ margin: "0" }}>
                    ORD45623595262 <MdOutlineFileCopy />
                  </p>
                </div>
                <div className="mt-2 mb-2">
                  <p style={{ margin: "0" }}>Payment</p>
                  <p style={{ margin: "0" }}>Paid Online</p>
                </div>
                <div className="mt-2 mb-2">
                  <p style={{ margin: "0" }}>Deliver to</p>
                  <p style={{ margin: "0" }}>
                    Singapura layout, Ms palya, Vidyaranyapura, Bangalore,
                    Karnataka 560097
                  </p>
                </div>
                <div className="mt-2 mb-2">
                  <p style={{ margin: "0" }}>Order placed</p>
                  <p style={{ margin: "0" }}>
                    Placed on Fri, 14 Jun'24, 11:24 AM
                  </p>
                </div>
              </div>
            </div>
            <div className="row m-2 align-items-center">
              <b>Need help with your order?</b>
              <div className="col-md-10 mt-2 mb-2">
                <div className="order-icond-text d-flex">
                  <TiMessages
                    style={{ fontSize: "25px", marginRight: "10px" }}
                  />
                  <div>
                    <b>Chat with us</b> <br />
                    <span>About any issues related to your order</span>
                  </div>
                </div>
              </div>
              <div className="col-md-2 mt-2 mb-2">
                <FaAngleRight />
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose2}>
            Close
          </Button>
          <Button variant="success">Download Invoice</Button>
        </Modal.Footer>
      </Modal>

      {/* Wallet Management Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        className="animate__animated animate__fadeIn"
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title
            className={actionType === "add" ? "text-success" : "text-danger"}
          >
            {actionType === "add" ? "Add Bonus" : "Deduct Amount"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <strong>User:</strong> {selectedWallet?.userId?.Fname || "Unknown"}
          </p>
          <p>
            <strong>Current Balance:</strong> ₹
            {selectedWallet?.balance?.toFixed(2) || "0.00"}
          </p>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description"
              />
            </Form.Group>
            {actionType === "add" && (
              <Form.Group className="mb-3">
                <Form.Label>Expiry Date</Form.Label>
                <Form.Control
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </Form.Group>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowModal(false)}
            disabled={walletLoading}
          >
            Cancel
          </Button>
          <Button
            variant={actionType === "add" ? "success" : "danger"}
            onClick={handleSubmit}
            disabled={walletLoading}
          >
            {walletLoading ? (
              <Spinner size="sm" />
            ) : actionType === "add" ? (
              "Add Bonus"
            ) : (
              "Deduct Amount"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserList;
