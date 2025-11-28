import React, { useState, useEffect, useMemo, useRef } from "react";
import { Button, Modal, Table, Image, Spinner } from "react-bootstrap";
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
import { debounce } from "lodash";

const CorporateBookingsOld = () => {
  const [show, setShow] = useState();
  const handleClose = () => setShow(false);
  const [data, setdata] = useState();
  const handleShow = (item) => {
    setdata(item);
    setShow(true);
  };

  const [show4, setShow4] = useState();
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

  // State for filters and pagination
  const [ApartmentOrder, setApartmentOrder] = useState([]);
  const [AllTimesSlote, setAllTimesSlote] = useState([]);
  const [locations, setLocations] = useState([]);
  const [hubs, setHubs] = useState([]); // New state for hubs
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 6,
  });

  // Filter states
  const [slot, setSelectedSlote] = useState("");
  const [selectedHub, setSelectedHub] = useState(""); // New hub filter state
  const [selectLocation, setSelectLocation] = useState("");
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectStatus, setSelectStatus] = useState("");
  const [searchH, setSearchH] = useState("");
  const [startDate, setstartDate] = useState("");
  const [endDate, setendDate] = useState("");

  // Dropdown states
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Updated API call with filters and pagination
  const getApartmentOrder = async (
    page = 1,
    resetPagination = false,
    location = [],
    customSearch = searchH
  ) => {
    setLoading(true);
    try {
      const params = {
        page: resetPagination ? 1 : page,
        limit: pagination.pageSize,
        orderType: "corporate",
        ...(customSearch && { search: customSearch }),
        ...(slot && { slot }),
        ...((location.length > 0 || selectedLocations.length > 0) && {
          locations: location || selectedLocations,
        }),
        ...(selectStatus && { status: selectStatus }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      };

      const res = await axios.get(
        "http://localhost:7013/api/admin/getallordersfilterold",
        { params }
      );

      if (res.data.success) {
        setApartmentOrder(res.data.data.orders);
        setPagination(res.data.data.pagination);
        setAllTimesSlote([
          ...new Set(res.data.data.orders?.map((ele) => ele?.slot)),
        ]);
        setLocations([
          ...new Set(res.data.data.orders?.map((ele) => ele?.delivarylocation)),
        ]);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
      Swal.fire({
        title: "Error",
        text: "Failed to fetch orders",
        icon: "error",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        toast: true,
        position: "bottom",
      });
    } finally {
      setLoading(false);
    }
  };

  const getHubs = async () => {
    try {
      const res = await axios.get("http://localhost:7013/api/Hub/hubs", {
        // headers: { Authorization: `Bearer ${token}` },
      });
      setHubs(res.data);
    } catch (error) {
      console.error("Failed to fetch hubs:", error);
      alert(error?.response?.data?.message || "Failed to fetch hubs.");
    }
  };

  useEffect(() => {
    getApartmentOrder();
    getHubs();
  }, []);

  // Handle pagination change
  const handlePageChange = ({ selected }) => {
    const newPage = selected + 1;
    getApartmentOrder(newPage);
  };

  // Handle filter changes
  const handleFilterChange = () => {
    getApartmentOrder(1, true); // Reset to page 1 when filters change
  };

  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        getApartmentOrder(1, true, [], value); // value passed as customSearch
      }, 1000),
    []
  );

  useEffect(() => {
    if (searchH.trim() !== "") {
      debouncedSearch(searchH);
    }
  }, [searchH]);

  // Handle location selection
  const handleLocationToggle = (location) => {
    setSelectedLocations((prev) => {
      if (prev.includes(location)) {
        return prev.filter((loc) => loc !== location);
      } else {
        return [...prev, location];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedLocations.length === locations.length) {
      setSelectedLocations([]);
    } else {
      setSelectedLocations([...locations]);
    }
  };

  // Apply filters
  const applyFilters = () => {
    handleFilterChange();
  };

  // Clear filters
  const clearFilters = () => {
    setSelectedSlote("");
    setSelectedHub(""); // Clear hub filter
    setSelectedLocations([]);
    setSelectStatus("");
    setSearchH("");
    setstartDate("");
    setendDate("");
    // Reset to show all data
    getApartmentOrder(1, true);
  };

  // Delete booking
  const [delData, setdelData] = useState();
  let deleteBooking = async (data) => {
    try {
      setLoading(true);
      let res = await axios.delete(
        `http://localhost:7013/api/admin/deletefoodorder/${data}`
      );
      if (res) {
        Swal.fire({
          title: "Success",
          text: "Booking deleted successfully",
          icon: "success",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          toast: true,
          position: "bottom",
        });
        handleClose4();
        getApartmentOrder(pagination.currentPage);
      }
    } catch (error) {
      setLoading(false);
      Swal.fire({
        title: "Error",
        text: error.message || "Failed to delete booking",
        icon: "error",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        toast: true,
        position: "bottom",
      });
    }
  };

  // Bulk status update
  const [markloder, setmarkloader] = useState(false);
  const updateSelectedMarks = async () => {
    if (!slot) {
      return Swal.fire({
        title: "Info",
        text: "Please select slot",
        icon: "info",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        toast: true,
        position: "bottom",
      });
    }
    if (!selectedLocations.length) {
      return Swal.fire({
        title: "Info",
        text: "Please select location",
        icon: "info",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        toast: true,
        position: "bottom",
      });
    }
    if (!selectStatus) {
      return Swal.fire({
        title: "Info",
        text: "Please select order status",
        icon: "info",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        toast: true,
        position: "bottom",
      });
    }

    setmarkloader(true);
    try {
      const config = {
        url: "/admin/updateMultipleOrderStatus",
        method: "put",
        baseURL: "http://localhost:7013/api",
        headers: { "Content-Type": "application/json" },
        data: {
          status: selectStatus,
          locations: selectedLocations,
          slot: slot,
        },
      };

      let res = await axios(config);
      if (res.data.success) {
        setmarkloader(false);
        getApartmentOrder(pagination.currentPage);
        Swal.fire({
          title: "Success",
          text: `Successfully updated ${res.data.modifiedCount} orders`,
          icon: "success",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          toast: true,
          position: "bottom",
        });
      }
    } catch (error) {
      console.log(error);
      setmarkloader(false);
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "Something went wrong",
        icon: "error",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        toast: true,
        position: "bottom",
      });
    }
  };

  const [allLocation, setAllLocation] = useState([]);

  const [excelLoading, setExeclLoading] = useState(false);
  // Export Excel
  const handleExportExcel = async () => {
    const params = {
      orderType: "corporate",
      ...(searchH && { search: searchH }),
      ...(slot && { slot }),
      ...((selectedLocations.length > 0 || allLocation.length > 0) && {
        locations: [...allLocation, ...selectedLocations],
      }),
      ...(selectStatus && { status: selectStatus }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    };

    try {
      setExeclLoading(true);

      const res = await axios.get(
        "http://localhost:7013/api/admin/exportExcelOrder",
        {
          params,
          responseType: "blob", // Critical: Handle as binary data
          timeout: 300000, // 5 minutes timeout for large files
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          onDownloadProgress: (progressEvent) => {
            // Optional: Show download progress
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log(`Download Progress: ${percentCompleted}%`);
          },
        }
      );

      if (res.status === 200) {
        // Create blob URL and trigger download
        const blob = new Blob([res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        // Get filename from response headers or use default
        const contentDisposition = res.headers["content-disposition"];
        let filename = "Corporate_Bookings.xlsx";

        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }

        link.download = filename;
        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        // Optional: Show success message
        // toast.success('Excel file downloaded successfully!');
      }
    } catch (error) {
      console.error("Export error:", error);

      // Handle different types of errors
      if (error.code === "ECONNABORTED") {
        alert(
          "Export timeout. The dataset might be too large. Please try with filters to reduce the number of records."
        );
      } else if (error.response?.status === 400) {
        alert(
          error.response.data.error || "Bad request. Please check your filters."
        );
      } else if (error.response?.status === 500) {
        alert(
          "Server error occurred during export. Please try again or contact support."
        );
      } else {
        alert(
          "Export failed. Please check your internet connection and try again."
        );
      }
    } finally {
      setExeclLoading(false);
    }
  };
  // Status change
  const [statusdata, setstatusdata] = useState("");
  const changestatus = async (item) => {
    setLoading(true);
    try {
      const config = {
        url: "/admin/updateOrderStatus/" + item._id,
        method: "put",
        baseURL: "http://localhost:7013/api",
        headers: { "Content-Type": "application/json" },
        data: {
          newStatus: statusdata,
        },
      };

      const res = await axios(config);
      if (res.status === 200) {
        handleClose3();
        getApartmentOrder(pagination.currentPage);
        Swal.fire({
          title: "Success",
          text: "Order status updated successfully",
          icon: "success",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          toast: true,
          position: "bottom",
        });
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
      Swal.fire({
        title: "Error",
        text: "Failed to update order status",
        icon: "error",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        toast: true,
        position: "bottom",
      });
    }
  };

  const renderStars = (rating) => {
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

  return (
    <div>
      {/* Filters Row 1 */}
      <div className="d-flex gap-3 align-items-center mb-2">
        {/* Hub Filter */}
        <select
          className="form-select packer-slot-select shadow-sm"
          value={selectedHub}
          onChange={(e) => {
            setSelectedHub(e.target.value);
            const data = e.target.value;
            if (data) {
              const loc = JSON.parse(data)?.locations?.map(
                (ele) => ele?.split(", ")[0]
              );
              getApartmentOrder(1, false, loc);
              // setSelectLocation(JSON.parse(data)?.locations?.map((ele)=>ele?.split(', ')[0]))
              setAllLocation(loc || []);
            } else {
              getApartmentOrder();
              setAllLocation([]);
            }
          }}
        >
          <option value="">All Hubs</option>
          {hubs?.map((hub) => (
            <option key={hub._id} value={JSON.stringify(hub)}>
              {hub?.hubName}
            </option>
          ))}
        </select>

        {/* Slot Filter */}
        <select
          className="form-select packer-slot-select shadow-sm"
          value={slot}
          onChange={(e) => setSelectedSlote(e.target.value)}
        >
          <option value="">All Slots</option>
          {AllTimesSlote?.map((ele) => (
            <option key={ele} value={ele}>
              {ele}
            </option>
          ))}
        </select>

        {/* Location Filter */}
        <div className="dropdown btn" ref={dropdownRef}>
          <button
            className="btn btn-outline-secondary dropdown-toggle form-select packer-location-select shadow-sm d-flex justify-content-between align-items-center"
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{ textAlign: "left", minHeight: "38px" }}
          >
            <span>
              {selectedLocations.length === 0
                ? "All Locations"
                : selectedLocations.length === 1
                ? selectedLocations[0]
                : `${selectedLocations.length} locations selected`}
            </span>
          </button>

          {isDropdownOpen && (
            <div
              className="dropdown-menu show w-100 shadow"
              style={{ maxHeight: "300px", overflowY: "auto" }}
            >
              <div className="dropdown-item">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="select-all-locations"
                    checked={selectedLocations.length === locations.length}
                    onChange={handleSelectAll}
                  />
                  <label
                    className="form-check-label fw-bold"
                    htmlFor="select-all-locations"
                  >
                    {selectedLocations.length === locations.length
                      ? "Clear All"
                      : "Select All"}
                  </label>
                </div>
              </div>
              <hr className="dropdown-divider" />
              {locations.map((location) => (
                <div key={location} className="dropdown-item">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      value={location}
                      id={`location-${location}`}
                      checked={selectedLocations.includes(location)}
                      onChange={() => handleLocationToggle(location)}
                    />
                    <label
                      className="form-check-label"
                      htmlFor={`location-${location}`}
                    >
                      {location}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status Filter */}
        <select
          className="form-select packer-slot-select shadow-sm"
          value={selectStatus}
          onChange={(e) => setSelectStatus(e.target.value)}
        >
          <option value="">Select Status</option>
          <option value="On the way">On the way</option>
          <option value="Delivered">Delivered</option>
        </select>

        {/* Bulk Update Button */}
        <Button
          variant="warning"
          className="text-white fw-semibold d-flex"
          style={{ backgroundColor: "#ff6200", border: "none" }}
          onClick={updateSelectedMarks}
          disabled={markloder}
        >
          {markloder ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Marking...
            </>
          ) : selectStatus ? (
            `Mark As ${selectStatus}`
          ) : (
            "Mark"
          )}
        </Button>
      </div>

      {/* Filters Row 2 */}
      <div className="d-flex gap-3 mb-2">
        {/* Search */}
        <div className="col-lg-3 d-flex justify-content-center">
          <div className="input-group">
            <span className="input-group-text" id="basic-addon1">
              <BsSearch />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search..."
              aria-describedby="basic-addon1"
              onChange={(e) => setSearchH(e.target.value)}
              value={searchH}
            />
          </div>
        </div>

        {/* Date From */}
        <div className="col-md-3 d-flex justify-content-center align-items-center">
          <div className="input-group">
            <label htmlFor="" className="m-auto">
              From:
            </label>
            <input
              type="date"
              className="form-control packer-slot-select"
              aria-describedby="date-filter"
              value={startDate}
              onChange={(e) => setstartDate(e.target.value)}
            />
          </div>
        </div>

        {/* Date To */}
        <div className="col-md-3 d-flex justify-content-center align-items-center">
          <div className="input-group">
            <label htmlFor="" className="m-auto">
              To:
            </label>
            <input
              type="date"
              className="form-control packer-slot-select"
              aria-describedby="date-filter"
              value={endDate}
              onChange={(e) => setendDate(e.target.value)}
            />
          </div>
        </div>

        {/* Apply Filters */}
        <div>
          <Button variant="" className="modal-add-btn" onClick={applyFilters}>
            Apply Filters
          </Button>
        </div>

        {/* Clear Filters */}
        <div>
          <Button variant="danger" onClick={clearFilters}>
            Clear All
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="customerhead p-2">
        <div className="d-flex justify-content-between align-items-center">
          <h2 className="header-c">Corporate Booking List</h2>
          <h3 className="header-c">Total Orders: {pagination?.totalCount}</h3>
          <Button
            variant="success"
            onClick={handleExportExcel}
            disabled={excelLoading}
          >
            {excelLoading ? <Spinner size={16} /> : "Export Excel"}
          </Button>
        </div>

        <div className="mb-3">
          <Table
            responsive
            bordered
            style={{ width: "-webkit-fill-available" }}
          >
            <thead>
              <tr>
                <th>S.No</th>
                <th>Placed Date</th>
                <th>Placed Time</th>
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
                {/* <th>Delivery Type</th> */}
                <th>Delivery Method</th>
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
                  <td colSpan={15} className="text-center">
                    <Spinner animation="border" variant="oranged" />
                  </td>
                </tr>
              ) : ApartmentOrder.length === 0 ? (
                <tr>
                  <td colSpan={24} className="text-center">
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
                        {items?.hub || "N/A"}
                      </td>
                      <td style={{ paddingTop: "20px" }}>{items?.slot}</td>
                      <td style={{ paddingTop: "20px" }}>
                        {items?.allProduct?.map((item) => {
                          return `${item?.foodItemId?.foodcategory}` + ",";
                        })}
                      </td>
                      <td style={{ paddingTop: "20px" }}>
                        {items?.allProduct?.map((item) => {
                          return (
                            `${item?.foodItemId?.foodname}` +
                            " - " +
                            `${item?.quantity}.Qyt, `
                          );
                        })}
                      </td>
                      <td>{items?.Cutlery > 0 ? "Yes" : "No"}</td>
                      <td style={{ paddingTop: "20px" }}>
                        {items?.allProduct?.map((item) => {
                          return `${item?.foodItemId?.unit}` + ",";
                        })}
                      </td>
                      <td style={{ paddingTop: "20px" }}>
                        {items?.Mobilenumber}
                      </td>
                      <td style={{ paddingTop: "20px" }}>{items?.apartment}</td>
                      <td style={{ paddingTop: "20px" }}>
                        {items?.delivarylocation},{items?.addressline}
                      </td>
                      {/* <td style={{ paddingTop: '20px' }}>Gate Delivery</td> */}

                      <td style={{ paddingTop: "20px" }}>
                        {items.deliveryMethod ? items?.deliveryMethod : "N/A"}
                      </td>
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
              containerClassName={"paginationBttns"}
              previousLinkClassName={"previousBttn"}
              nextLinkClassName={"nextBttn"}
              disabledClassName={"paginationDisabled"}
              activeClassName={"paginationActive"}
            />
          </div>
        )}
      </div>

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
          <Modal.Title id="contained-modal-title-vcenter"></Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row">
            <div>
              <h4>Order Summary</h4>
              <b>{data?.allProduct?.length} Items</b>
              <hr />

              <div className="row w-100">
                {data?.allProduct?.map((Item) => {
                  return (
                    <>
                      <div className="row  border mt-1 mx-1">
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
                    </>
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
                        {data?.allProduct?.reduce((acc, item) => {
                          return (
                            Number(acc) +
                            Number(item?.quantity) *
                              Number(item?.foodItemId?.foodprice)
                          ).toFixed(2);
                        }, 0)}
                      </div>
                      <div>₹ {data?.tax?.toFixed(2)}</div>
                      {data?.Cutlery ? <div>₹ {data?.Cutlery}</div> : null}
                      {data?.delivarytype ? (
                        <div>₹ {data?.delivarytype}</div>
                      ) : null}
                      {data?.coupon ? <div>₹ {data?.coupon}</div> : null}
                      {data?.discountWallet ? (
                        <div>₹ {data?.discountWallet}</div>
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
          <Modal.Title>Warning</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="col-md-12 mb-2">
            <select
              name="status"
              id="status"
              className="vi_0"
              onChange={(e) => {
                console.log("Selected Value:", e.target.value);
                setstatusdata(e.target.value);
              }}
            >
              <option value="">Select Status</option>
              <option value="Cooking">Cooking</option>
              <option value="Packing">Packing</option>
              <option value="Ontheway">On the way</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant=""
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

export default CorporateBookingsOld;
