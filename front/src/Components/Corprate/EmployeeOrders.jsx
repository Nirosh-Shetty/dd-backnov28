import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  Table,
  Spinner,
  FormControl,
  InputGroup,
} from "react-bootstrap";
import { BsSearch } from "react-icons/bs";
import { IoIosEye } from "react-icons/io";
import axios from "axios";
import * as XLSX from "xlsx";
import moment from "moment";
import ReactPaginate from "react-paginate";

// CSS for ReactPaginate
const customStyles = `
  .paginationBttns {
    display: flex;
    list-style: none;
    padding: 0;
    justify-content: center;
  }
  .paginationBttns li {
    margin: 0 5px;
  }
  .paginationBttns li a {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    color: #007bff;
  }
  .paginationActive a {
    background-color: #007bff;
    color: white;
    border-color: #007bff;
  }
  .paginationDisabled a {
    color: #ccc;
    cursor: not-allowed;
  }
  .previousBttn a, .nextBttn a {
    font-weight: bold;
  }
`;

const EmployeeOrders = () => {
  const [orders, setOrders] = useState([]);
  const [noChangeData, setNoChangeData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchH, setSearchH] = useState("");
  const [show, setShow] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const corparate = JSON.parse(localStorage.getItem("corporate"));
  // Modal controls
  const handleClose = () => setShow(false);
  const handleShow = (order) => {
    setSelectedOrder(order);
    setShow(true);
  };

  // Pagination states
  const [pageNumber, setPageNumber] = useState(0);
  const ordersPerPage = 6;
  const pagesVisited = pageNumber * ordersPerPage;
  const pageCount = Math.ceil(orders?.length / ordersPerPage);
  const changePage = ({ selected }) => {
    setPageNumber(selected);
  };

  const getOrders = async () => {
    setLoading(true);
    try {
      let res = await axios.get(
        "http://localhost:7013/api/admin/getAllOrdersByCompanyId/" +
          corparate?._id
      );
      if (res.status === 200) {
        // Filter orders by corporate employees (assuming corporateId or employeeId linkage)
        const corporateOrders = res.data.orders;
        setOrders(corporateOrders);
        setNoChangeData(corporateOrders);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (corparate?._id) {
      getOrders();
    }
  }, [corparate?._id]);

  // Search filter
  const handleFilterH = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearchH(searchTerm);
    setPageNumber(0);
    if (searchTerm !== "") {
      const filteredData = noChangeData.filter((user) =>
        Object.values(user).some((value) =>
          String(value).toLowerCase().includes(searchTerm)
        )
      );
      setOrders(filteredData);
    } else {
      setOrders(noChangeData);
    }
  };

  // Export Excel
  const handleExportExcel = () => {
    const customHeaders = orders.map((item, i) => ({
      "S.No": i + 1,
      "Placed On": moment(item.createdAt).format("DD-MM-YYYY, hh:mm A"),
      "Order ID": item.orderid,
      "Employee ID": item?.customerId?.employeeId,
      "Employee Name": item?.username || "N/A",
      "Total Cart Value": `₹${(
        (Array.isArray(item?.allProduct)
          ? item.allProduct.reduce((acc, items) => {
              const quantity = Number(items?.quantity) || 0;
              const price = Number(items?.foodItemId?.foodprice) || 0;
              return acc + quantity * price;
            }, 0)
          : 0) +
        (Number(item?.tax) || 0) +
        (Number(item?.Cutlery) || 0) +
        (Number(item?.deliveryType) || 0)
      ) // Corrected typo: delivarytype -> deliveryType
        ?.toFixed(2)}`,
      "Subsidy Amount Used":
        item?.discountWallet > 0 ? item?.discountWallet : "No",
      "Extra Amount Paid": `₹${(
        (Array.isArray(item?.allProduct)
          ? item.allProduct.reduce((acc, items) => {
              const quantity = Number(items?.quantity) || 0;
              const price = Number(items?.foodItemId?.foodprice) || 0;
              return acc + quantity * price;
            }, 0)
          : 0) +
        (Number(item?.tax) || 0) +
        (Number(item?.Cutlery) || 0) +
        (Number(item?.deliveryType) || 0) - // Corrected typo: delivarytype -> deliveryType
        (item?.discountWallet || 0)
      ).toFixed(2)}`,
      "Order Status": item.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(customHeaders);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employee Orders");
    XLSX.writeFile(
      workbook,
      `EmployeeOrders_${moment().format("DDMMYYYY")}.xlsx`
    );
  };

  return (
    <div className="container mt-5">
      <style>{customStyles}</style>

      <h2 className="header-c">Employee Orders</h2>

      {/* Filters */}
      <div className="d-flex flex-wrap gap-3 mb-4">
        <InputGroup style={{ maxWidth: "300px" }}>
          <InputGroup.Text>
            <BsSearch />
          </InputGroup.Text>
          <FormControl
            type="text"
            placeholder="Search by Order ID or Employee Name..."
            value={searchH}
            onChange={handleFilterH}
          />
        </InputGroup>
        <Button variant="success" onClick={handleExportExcel}>
          Export Excel
        </Button>
      </div>

      {/* Orders Table */}
      <Table responsive bordered hover className="shadow-sm">
        <thead className="table-dark">
          <tr>
            <th>S.No</th>
            <th>Placed On</th>
            <th>Order ID</th>
            <th>Employee ID</th>
            <th>Employee Name</th>
            <th>Total Cart Value</th>
            <th>Subsidy Amount Used</th>
            <th>Extra Amount Paid</th>
            <th>Order Status</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={9} className="text-center">
                <Spinner animation="border" variant="primary" />
              </td>
            </tr>
          ) : orders?.length > 0 ? (
            orders
              .slice(pagesVisited, pagesVisited + ordersPerPage)
              .map((item, i) => (
                <tr key={item._id}>
                  <td style={{ paddingTop: "20px" }}>{i + 1 + pagesVisited}</td>
                  <td style={{ paddingTop: "20px" }}>
                    {moment(item.createdAt).format("DD-MM-YYYY, h:mm A")}
                  </td>
                  <td style={{ paddingTop: "20px" }}>{item.orderid}</td>
                  <td style={{ paddingTop: "20px" }}>
                    {item?.customerId?.employeeId || "N/A"}
                  </td>
                  <td style={{ paddingTop: "20px" }}>{item?.username}</td>

                  <td style={{ paddingTop: "20px" }}>
                    ₹{" "}
                    {(
                      (Array.isArray(item?.allProduct)
                        ? item.allProduct.reduce((acc, items) => {
                            const quantity = Number(items?.quantity) || 0;
                            const price =
                              Number(items?.foodItemId?.foodprice) || 0;
                            return acc + quantity * price;
                          }, 0)
                        : 0) +
                      (Number(item?.tax) || 0) +
                      (Number(item?.Cutlery) || 0) +
                      (Number(item?.deliveryType) || 0)
                    ) // Corrected typo: delivarytype -> deliveryType
                      .toFixed(2)}
                  </td>
                  <td style={{ paddingTop: "20px" }}>
                    {item?.discountWallet > 0 ? item?.discountWallet : "No"}
                  </td>
                  <td style={{ paddingTop: "20px" }}>
                    ₹
                    {(
                      (Array.isArray(item?.allProduct)
                        ? item.allProduct.reduce((acc, items) => {
                            const quantity = Number(items?.quantity) || 0;
                            const price =
                              Number(items?.foodItemId?.foodprice) || 0;
                            return acc + quantity * price;
                          }, 0)
                        : 0) +
                      (Number(item?.tax) || 0) +
                      (Number(item?.Cutlery) || 0) +
                      (Number(item?.deliveryType) || 0) - // Corrected typo: delivarytype -> deliveryType
                      (item?.discountWallet || 0)
                    ).toFixed(2)}
                  </td>
                  <td style={{ paddingTop: "20px" }}>{item.status}</td>
                  <td style={{ paddingTop: "20px" }}>
                    <IoIosEye
                      style={{ fontSize: "20px", cursor: "pointer" }}
                      onClick={() => handleShow(item)}
                    />
                  </td>
                </tr>
              ))
          ) : (
            <tr>
              <td colSpan={9} className="text-center text-muted">
                No orders found.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Pagination */}
      <div className="d-flex align-items-center justify-content-between mt-3">
        <p>Total Count: {orders?.length}</p>
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
      </div>

      {/* Order Details Modal */}
      <Modal
        show={show}
        onHide={handleClose}
        size="lg"
        centered
        className="animate__animated animate__fadeIn"
        style={{ zIndex: 99999 }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Order Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <h4>Order Summary</h4>
            <p>
              <b>Order ID:</b> {selectedOrder?.orderid}
            </p>
            <p>
              <b>Employee:</b> {selectedOrder?.username || "N/A"}
            </p>
            <p>
              <b>Placed On:</b>{" "}
              {moment(selectedOrder?.createdAt).format("MM/DD/YYYY, h:mm A")}
            </p>
            <p>
              <b>Status:</b> {selectedOrder?.status}
            </p>
            <hr />
            <h5>Items</h5>
            {selectedOrder?.allProduct?.map((item) => (
              <div key={item._id} className="row border mt-1 mx-1">
                <div className="col-md-4">
                  <img
                    src={`${item?.foodItemId?.Foodgallery[0]?.image2}`}
                    alt=""
                    style={{ width: "90px", height: "80px" }}
                    onError={(e) => (e.target.src = "/placeholder.jpg")}
                  />
                </div>
                <div className="col-md-4">
                  <div style={{ textAlign: "left" }}>
                    <b>{item?.foodItemId?.foodname}</b> <br />
                    <span>
                      <b>₹{item?.foodItemId?.foodprice}</b>
                    </span>{" "}
                    <br />
                    <b>Qty. {item?.quantity}</b>
                  </div>
                </div>
                <div className="col-md-4 d-flex align-items-center">
                  <b>
                    ₹{(item?.quantity * item?.foodItemId?.foodprice).toFixed(2)}
                  </b>
                </div>
              </div>
            ))}
            <hr />
            <h5>Bill Details</h5>
            <div className="row m-2">
              <div className="col-md-10">
                <div>Sub Total</div>
                <div>Tax (5%)</div>
                {selectedOrder?.Cutlery ? <div>Cutlery</div> : null}
                {selectedOrder?.delivarytype ? (
                  <div>Delivery Charges</div>
                ) : null}
                {selectedOrder?.discountWallet ? (
                  <div>Subsidy Amount Used</div>
                ) : null}
                <div>
                  <b>Total Cart Value</b>
                </div>
                <div>
                  <b>Extra Amount Paid</b>
                </div>
              </div>
              <div className="col-md-2" style={{ textAlign: "right" }}>
                <div>
                  ₹
                  {selectedOrder?.allProduct
                    ?.reduce(
                      (acc, item) =>
                        acc +
                        Number(item?.quantity) *
                          Number(item?.foodItemId?.foodprice),
                      0
                    )
                    .toFixed(2)}
                </div>
                <div>₹{selectedOrder?.tax?.toFixed(2)}</div>
                {selectedOrder?.Cutlery ? (
                  <div>₹ {selectedOrder?.Cutlery}</div>
                ) : null}
                {selectedOrder?.delivarytype ? (
                  <div>₹{selectedOrder?.delivarytype}</div>
                ) : null}
                {selectedOrder?.discountWallet ? (
                  <div>₹{selectedOrder?.discountWallet.toFixed(2)}</div>
                ) : null}
                <div>
                  <b>
                    ₹
                    {(
                      (Array.isArray(selectedOrder?.allProduct)
                        ? selectedOrder.allProduct.reduce((acc, items) => {
                            const quantity = Number(items?.quantity) || 0;
                            const price =
                              Number(items?.foodItemId?.foodprice) || 0;
                            return acc + quantity * price;
                          }, 0)
                        : 0) +
                      (Number(selectedOrder?.tax) || 0) +
                      (Number(selectedOrder?.Cutlery) || 0) +
                      (Number(selectedOrder?.deliveryType) || 0)
                    ) // Corrected typo: delivarytype -> deliveryType
                      .toFixed(2)}
                  </b>
                </div>
                <div>
                  <b>
                    ₹
                    {(
                      (Array.isArray(selectedOrder?.allProduct)
                        ? selectedOrder.allProduct.reduce((acc, items) => {
                            const quantity = Number(items?.quantity) || 0;
                            const price =
                              Number(items?.foodItemId?.foodprice) || 0;
                            return acc + quantity * price;
                          }, 0)
                        : 0) +
                      (Number(selectedOrder?.tax) || 0) +
                      (Number(selectedOrder?.Cutlery) || 0) +
                      (Number(selectedOrder?.deliveryType) || 0) - // Corrected typo: delivarytype -> deliveryType
                      (selectedOrder?.discountWallet || 0)
                    ).toFixed(2)}
                  </b>
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EmployeeOrders;
