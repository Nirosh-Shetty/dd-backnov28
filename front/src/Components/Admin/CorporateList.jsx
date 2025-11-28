import React, { useState, useEffect } from "react";
import { Button, Modal, Table, Form, Spinner } from "react-bootstrap";
import { AiFillDelete } from "react-icons/ai";
import { BiSolidEdit } from "react-icons/bi";
import { BsFillPersonFill, BsSearch } from "react-icons/bs";
import { FaPlus, FaTrash } from "react-icons/fa";
import "../Admin/Admin.css";
import axios from "axios";
import moment from "moment";
import * as XLSX from "xlsx";
import ReactPaginate from "react-paginate";

const CorporateList = () => {
  // Add modal for Banner
  const [show3, setShow3] = useState();
  const handleClose3 = () => setShow3(false);
  const handleShow3 = () => setShow3(true);

  // Edit modal for  Banner
  const [show4, setShow4] = useState();
  const handleClose4 = () => setShow4(false);

  // Delet modal for  Banner
  const [show5, setShow5] = useState();
  const handleClose5 = () => setShow5(false);
  const handleShow5 = () => setShow5(true);

  // ======INTEGRATION=======//

  // integrating post method
  const [mobile, setMobile] = useState("");
  const [logo, setLogo] = useState("");
  const [Corparatename, setCorparatename] = useState("");
  const [Address, setAddress] = useState("");
  const [pincode, setpincode] = useState("");
  const [apartmentdelivaryprice, setapartmentdelivaryprice] = useState("");
  const [prefixcode, setprefixcode] = useState("");
  const [approximatetime, setapproximatetime] = useState("");
  const [deliverypoint, setDeliverypoint] = useState("");
  // New state for time slots
  const [lunchSlots, setLunchSlots] = useState([{ time: "", active: true }]);
  const [dinnerSlots, setDinnerSlots] = useState([{ time: "", active: true }]);

  // Functions to handle lunch slots
  const addLunchSlot = () => {
    setLunchSlots([...lunchSlots, { time: "", active: true }]);
  };

  const removeLunchSlot = (index) => {
    if (lunchSlots.length > 1) {
      const newSlots = lunchSlots.filter((_, i) => i !== index);
      setLunchSlots(newSlots);
    }
  };

  const updateLunchSlot = (index, field, value) => {
    const newSlots = [...lunchSlots];
    newSlots[index][field] = value;
    setLunchSlots(newSlots);
  };

  // Functions to handle dinner slots
  const addDinnerSlot = () => {
    setDinnerSlots([...dinnerSlots, { time: "", active: true }]);
  };

  const removeDinnerSlot = (index) => {
    if (dinnerSlots.length > 1) {
      const newSlots = dinnerSlots.filter((_, i) => i !== index);
      setDinnerSlots(newSlots);
    }
  };

  const updateDinnerSlot = (index, field, value) => {
    const newSlots = [...dinnerSlots];
    newSlots[index][field] = value;
    setDinnerSlots(newSlots);
  };

  // Reset slots function
  const resetSlots = () => {
    setLunchSlots([{ time: "", active: true }]);
    setDinnerSlots([{ time: "", active: true }]);
  };

  function isValidTimeSlot(slot) {
    const regex =
      /^((0?[0-9]|1[0-9]|2[0-3]):[0-5][0-9])\s?-\s?((0?[0-9]|1[0-9]|2[0-3]):[0-5][0-9])(\s?[APap][Mm])?$/;

    if (!regex.test(slot)) {
      return false;
    }

    // Extra check: AM/PM only valid if hours are 1–12
    const match = slot.match(regex);
    const hasAmPm = /[APap][Mm]/.test(slot);

    if (hasAmPm) {
      const [, startTime, , endTime] = match;
      const startHour = parseInt(startTime.split(":")[0], 10);
      const endHour = parseInt(endTime.split(":")[0], 10);

      if (startHour < 1 || startHour > 12 || endHour < 1 || endHour > 12) {
        return false; // Invalid because AM/PM with 24-hour clock
      }
    }

    return true;
  }

  const [loading, setLoading] = useState(false);

  const AddCorporatedata = async () => {
    try {
      if (!Corparatename) {
        return alert("Please Add Corparate Name");
      }

      if (!Address) {
        return alert("Please add Address");
      }

      if (!pincode) {
        return alert("Please add pin code");
      }

      if (!prefixcode) {
        return alert("Please add prefix code ");
      }
      if (!apartmentdelivaryprice) {
        return alert("Please add delivery price ");
      }
      if (!approximatetime) {
        return alert("Please add approximate time ");
      }

      const validLunchSlots = lunchSlots.filter(
        (slot) => slot.time.trim() !== ""
      );
      for (let slot of validLunchSlots) {
        if (!isValidTimeSlot(slot.time.trim())) {
          return alert(
            `Invalid Lunch Time Slot: ${slot.time} Please enter in this format 12:00 - 12:15 PM`
          );
        }
      }

      // Validate dinner slots
      const validDinnerSlots = dinnerSlots.filter(
        (slot) => slot.time.trim() !== ""
      );
      for (let slot of validDinnerSlots) {
        if (!isValidTimeSlot(slot.time.trim())) {
          return alert(
            `Invalid Dinner Time Slot: ${slot.time} Please enter in this format 7:00 - 7:15 PM`
          );
        }
      }
      setLoading(true);
      const config = {
        url: "/admin/addcorporate",
        method: "post",
        baseURL: "http://localhost:7013/api",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        data: {
          Apartmentname: Corparatename,
          Address: Address,
          pincode: pincode,
          prefixcode: prefixcode,
          apartmentdelivaryprice: apartmentdelivaryprice,
          approximatetime: approximatetime,
          logo: logo,
          mobile: mobile,
          lunchSlots: JSON.stringify(validLunchSlots),
          dinnerSlots: JSON.stringify(validDinnerSlots),
          deliverypoint: deliverypoint,
        },
      };
      let res = await axios(config);
      if (res.status === 200) {
        alert(res.data.success);
        getAddCorporate();
        handleClose3();
        setCorparatename("");
        setAddress("");
        setpincode("");
        setapartmentdelivaryprice("");
        setprefixcode("");
        setapproximatetime("");
        setLogo("");
        setMobile("");
        setDeliverypoint("");
        resetSlots();
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
      alert(error.response.data.msg);
    }
  };

  //integrating get  method
  const [AddCorporate, setAddCorporate] = useState([]);
  const getAddCorporate = async () => {
    try {
      setLoading(true);
      let res = await axios.get("http://localhost:7013/api/admin/getcorporate");
      if (res.status === 200) {
        setAddCorporate(res.data.corporatedata.reverse());
        setNoChangeData(res.data.corporatedata);
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  //delete method
  const [Data, setData] = useState("");
  const DeleteCorporate = async () => {
    try {
      setLoading(true);
      const config = {
        url: "admin/deletecorporate/" + Data,
        method: "delete",
        baseURL: "http://localhost:7013/api/",
        header: { "content-type": "application/json" },
      };
      await axios(config).then((res) => {
        if (res.status === 200) {
          alert("Successfully Delete");
          getAddCorporate();
          handleClose5();
        }
      });
    } catch (error) {
      console.log(error);
      setLoading(false);
      alert(error.response.data.msg);
    }
  };

  //update method
  const [Data1, setData1] = useState("");
  const handleShow4 = (items) => {
    setShow4(true);
    setData1(items);
    setCorparatename(items?.Apartmentname);
    setAddress(items?.Address);
    setpincode(items?.pincode);
    setapproximatetime(items?.approximatetime);
    setprefixcode(items?.prefixcode);
    setapartmentdelivaryprice(items?.apartmentdelivaryprice);
    setMobile(items?.mobile);
    setDeliverypoint(items?.deliverypoint);
    // Set slots from existing data or default
    try {
      const existingLunchSlots = items?.lunchSlots
        ? typeof items.lunchSlots === "string"
          ? JSON.parse(items.lunchSlots)
          : items.lunchSlots
        : [{ time: "", active: true }];
      const existingDinnerSlots = items?.dinnerSlots
        ? typeof items.dinnerSlots === "string"
          ? JSON.parse(items.dinnerSlots)
          : items.dinnerSlots
        : [{ time: "", active: true }];

      setLunchSlots(existingLunchSlots);
      setDinnerSlots(existingDinnerSlots);
    } catch (error) {
      console.log("Error parsing slots:", error);
      resetSlots();
    }
  };

  const EditCorporate = async (e) => {
    e.preventDefault();
    try {
      // Validate lunch slots
      const validLunchSlots = lunchSlots.filter(
        (slot) => slot.time.trim() !== ""
      );
      for (let slot of validLunchSlots) {
        if (!isValidTimeSlot(slot.time.trim())) {
          return alert(
            `Invalid Lunch Time Slot: ${slot.time} Please enter in this format 12:00 - 12:15 PM`
          );
        }
      }

      // Validate dinner slots
      const validDinnerSlots = dinnerSlots.filter(
        (slot) => slot.time.trim() !== ""
      );
      for (let slot of validDinnerSlots) {
        if (!isValidTimeSlot(slot.time.trim())) {
          return alert(
            `Invalid Dinner Time Slot: ${slot.time} Please enter in this format 7:00 - 7:15 PM`
          );
        }
      }
      setLoading(true);
      const config = {
        url: "admin/updatecorporatelist",
        method: "put",
        baseURL: "http://localhost:7013/api/",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        data: {
          Apartmentname: Corparatename,
          Address: Address,
          pincode: pincode,
          prefixcode: prefixcode,
          apartmentdelivaryprice: apartmentdelivaryprice,
          approximatetime: approximatetime,
          logo: logo,
          mobile: mobile,
          lunchSlots: JSON.stringify(validLunchSlots),
          dinnerSlots: JSON.stringify(validDinnerSlots),
          id: Data1?._id,
          deliverypoint: deliverypoint,
        },
      };

      const response = await axios(config);
      if (response.status === 200) {
        alert("Update successful");
        setLogo("");
        handleClose4();
        getAddCorporate();
        resetSlots();
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
      alert(error.response?.data?.error || "An error occurred");
    }
  };

  useEffect(() => {
    getAddCorporate();
  }, []);

  //Pagination
  const [pageNumber, setPageNumber] = useState(0);
  const usersPerPage = 6;
  const pagesVisited = pageNumber * usersPerPage;
  const pageCount = Math.ceil(AddCorporate.length / usersPerPage);
  const changePage = ({ selected }) => {
    setPageNumber(selected);
  };

  // Search filter
  const [nochangedata, setNoChangeData] = useState([]);
  const [searchH, setSearchH] = useState("");

  const handleFilterH = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearchH(searchTerm);
    if (searchTerm !== "") {
      const filteredData = nochangedata.filter((user) =>
        Object.values(user).some((value) =>
          String(value).toLowerCase().includes(searchTerm)
        )
      );
      setAddCorporate(filteredData);
    } else {
      setAddCorporate(nochangedata);
    }
  };

  // Export Excel
  const handleExportExcel = () => {
    // Create a custom mapping for the column headers
    const customHeaders = AddCorporate.map((item) => {
      // Parse slots for display
      let lunchSlotsDisplay = "";
      let dinnerSlotsDisplay = "";

      try {
        const lunchData = item.lunchSlots
          ? typeof item.lunchSlots === "string"
            ? JSON.parse(item.lunchSlots)
            : item.lunchSlots
          : [];

        const dinnerData = item.dinnerSlots
          ? typeof item.dinnerSlots === "string"
            ? JSON.parse(item.dinnerSlots)
            : item.dinnerSlots
          : [];

        lunchSlotsDisplay = lunchData
          .map(
            (slot) => `${slot.time} (${slot.active ? "Active" : "Inactive"})`
          )
          .join(", ");
        dinnerSlotsDisplay = dinnerData
          .map(
            (slot) => `${slot.time} (${slot.active ? "Active" : "Inactive"})`
          )
          .join(", ");
      } catch (error) {
        lunchSlotsDisplay = "No slots";
        dinnerSlotsDisplay = "No slots";
      }

      return {
        "Date / Time": moment(item.updatedAt).format("DD-MM-YYYY, hh:mm A"),
        "Apartment Name": item.Apartmentname,
        "Pin Code": item.pincode,
        "Prefix Code": item.prefixcode,
        "Tower Delivery Price": item.apartmentdelivaryprice,
        "Approximate Time": item.approximatetime,
        Address: item.Address,
        Mobile: item.mobile,
        "Lunch Slots": lunchSlotsDisplay,
        "Dinner Slots": dinnerSlotsDisplay,
        "Delivery Point": item.deliverypoint,
      };
    });

    // Convert your custom data to an Excel sheet
    const worksheet = XLSX.utils.json_to_sheet(customHeaders);

    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Corporate List ");

    // Download the Excel file
    XLSX.writeFile(workbook, "CorporateList.xlsx");
  };

  // Helper function to display slots in table
  const displaySlots = (slots) => {
    try {
      const slotsData = slots
        ? typeof slots === "string"
          ? JSON.parse(slots)
          : slots
        : [];

      return slotsData.map((slot, index) => (
        <div key={index} className="mb-1">
          <span
            className={`badge ${slot.active ? "bg-success" : "bg-secondary"}`}
          >
            {slot.time} {slot.active ? "✓" : "✗"}
          </span>
        </div>
      ));
    } catch (error) {
      return <span className="text-muted">No slots</span>;
    }
  };

  return (
    <div>
      <h2 className="header-c ">Corporate List</h2>
      <div className="customerhead p-2">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="col-lg-4 d-flex justify-content-center">
            <div className="input-group ">
              <span className="input-group-text" id="basic-addon1">
                <BsSearch />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search..."
                aria-describedby="basic-addon1"
                value={searchH}
                onChange={handleFilterH}
              />
            </div>
          </div>

          <div className="d-flex gap-3">
            <Button variant="success" onClick={handleShow3}>
              + ADD
            </Button>

            <Button variant="success" onClick={handleExportExcel}>
              Export Excel
            </Button>
          </div>
        </div>

        <div className="mb-3">
          <Table
            responsive
            bordered
            style={{ width: "-webkit-fill-available" }}
          >
            <thead>
              <tr>
                <th>Sl.No</th>
                <th>Date / Time</th>
                <th>Corporate Name</th>
                <th>Logo</th>
                <th>Mobile Number</th>
                <th>Address</th>
                <th>Pin Code</th>
                <th>Prefix Code</th>
                <th>Delivery Price</th>
                <th>Approximate Delivery Time</th>
                <th>Lunch Slots</th>
                <th>Dinner Slots</th>
                <th>Delivery Point</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <div className="text-center">
                  <Spinner animation="border" variant="danger" />
                </div>
              )}
              {AddCorporate?.slice(
                pagesVisited,
                pagesVisited + usersPerPage
              )?.map((items, i) => {
                return (
                  <tr key={items._id}>
                    <td style={{ paddingTop: "20px" }}>
                      {" "}
                      {i + 1 + usersPerPage * pageNumber}
                    </td>
                    <td style={{ paddingTop: "20px" }}>
                      {moment(items?.updatedAt).format("DD-MM-YYYY, h:mm A")}
                    </td>
                    <td style={{ paddingTop: "20px" }}>
                      {items?.Apartmentname}
                    </td>
                    <td>
                      {" "}
                      {items?.logo ? (
                        <img
                          src={items?.logo}
                          style={{
                            width: "70px",
                            height: "70px",
                            borderRadius: "50%",
                          }}
                          onError={(e) =>
                            (e.target.outerHTML =
                              '<i class="bi bi-person-fill" style="font-size: 50px;"></i>')
                          }
                          alt="Logo"
                        />
                      ) : (
                        <BsFillPersonFill size={50} />
                      )}
                    </td>
                    <td style={{ paddingTop: "20px" }}>{items?.mobile}</td>
                    <td style={{ paddingTop: "20px" }}>{items?.Address}</td>
                    <td style={{ paddingTop: "20px" }}>{items?.pincode}</td>
                    <td style={{ paddingTop: "20px" }}>{items?.prefixcode}</td>
                    <td style={{ paddingTop: "20px" }}>
                      ₹ {items?.apartmentdelivaryprice}
                    </td>
                    <td style={{ paddingTop: "20px" }}>
                      {items?.approximatetime} min
                    </td>
                    <td style={{ paddingTop: "20px", minWidth: "150px" }}>
                      {displaySlots(items?.lunchSlots)}
                    </td>
                    <td style={{ paddingTop: "20px", minWidth: "150px" }}>
                      {displaySlots(items?.dinnerSlots)}
                    </td>
                    <td style={{ paddingTop: "20px" }}>
                      {items?.deliverypoint}
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          gap: "20px",
                          justifyContent: "center",
                        }}
                      >
                        <div>
                          <BiSolidEdit
                            className="text-success"
                            style={{ cursor: "pointer", fontSize: "20px" }}
                            onClick={() => {
                              handleShow4(items);
                              setData1(items);
                            }}
                          />
                        </div>
                        <div>
                          <AiFillDelete
                            className="text-danger"
                            style={{ cursor: "pointer", fontSize: "20px" }}
                            onClick={() => {
                              handleShow5();
                              setData(items?._id);
                            }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>

          <div style={{ display: "flex" }} className="reactPagination">
            <p style={{ width: "100%", marginTop: "20px" }}>
              Total Count: {AddCorporate?.length}
            </p>
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
        </div>

        {/* Add Package modal for Category */}
        <Modal show={show3} onHide={handleClose3} style={{ zIndex: "99999" }}>
          <Modal.Header closeButton>
            <Modal.Title>Add Corporate List</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
            <div className="row">
              <div className="do-sear mt-2">
                <label> Corporate Name</label>
                <input
                  type="text"
                  className="vi_0"
                  placeholder="Enter Corporate Name"
                  onChange={(e) => setCorparatename(e.target.value)}
                />
              </div>
            </div>
            <div className="row">
              <div className="do-sear mt-2">
                <label htmlFor="logo"> Logo</label>
                <input
                  type="file"
                  className="vi_0"
                  id="logo"
                  accept="image/*"
                  placeholder="Select Logo"
                  onChange={(e) => setLogo(e.target.files[0])}
                />
              </div>
            </div>
            <div className="row">
              <div className="do-sear mt-2">
                <label> Mobile Number</label>
                <input
                  type="text"
                  className="vi_0"
                  placeholder="Enter Mobile Number"
                  onChange={(e) => setMobile(e.target.value)}
                />
              </div>
            </div>
            <div className="row">
              <div className="do-sear mt-2">
                <label> Address</label>
                <input
                  type="text"
                  className="vi_0"
                  placeholder="Enter Address"
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>

            <div className="row">
              <div className="do-sear mt-2">
                <label> Pin Code</label>
                <input
                  type="text"
                  className="vi_0"
                  placeholder="Enter Pin Code"
                  onChange={(e) => setpincode(e.target.value)}
                />
              </div>
            </div>

            <div className="row">
              <div className="do-sear mt-2">
                <label> Prefix Code</label>
                <input
                  type="text"
                  className="vi_0"
                  placeholder="Enter Prefix Code"
                  onChange={(e) => setprefixcode(e.target.value)}
                />
              </div>
            </div>
            <div className="row">
              <div className="do-sear mt-2">
                <label>
                  Delivery Price{" "}
                  <span style={{ fontSize: "14px" }}>(only Gate Delivery)</span>
                </label>
                <input
                  type="text"
                  className="vi_0"
                  placeholder="Enter Delivery Price"
                  onChange={(e) => setapartmentdelivaryprice(e.target.value)}
                />
              </div>
            </div>

            <div className="row">
              <div className="do-sear mt-2">
                <label> Approximate Delivery Time</label>
                <input
                  type="number"
                  min={0}
                  className="vi_0"
                  placeholder="Enter Approximate Delivery Time"
                  onChange={(e) => setapproximatetime(e.target.value)}
                />
              </div>
            </div>
            <div className="row">
              <div className="do-sear mt-2">
                <label>Delivery Point</label>
                <input
                  type="text"
                  minLength={0}
                  className="vi_0"
                  placeholder="eg. Security entry Point"
                  maxLength={23}
                  onChange={(e) => setDeliverypoint(e.target.value)}
                />
              </div>
            </div>
            {/* Lunch Slots Section */}
            <div className="row mt-3">
              <div className="col-12">
                <label className="form-label fw-bold">Lunch Time Slots</label>
                {lunchSlots.map((slot, index) => (
                  <div
                    key={index}
                    className="d-flex align-items-center mb-2 gap-2"
                  >
                    <input
                      type="text"
                      className="form-control"
                      value={slot.time}
                      onChange={(e) =>
                        updateLunchSlot(index, "time", e.target.value)
                      }
                      placeholder="eg: 12:00 - 12:15 PM"
                    />
                    <Form.Check
                      type="checkbox"
                      label="Active"
                      checked={slot.active}
                      onChange={(e) =>
                        updateLunchSlot(index, "active", e.target.checked)
                      }
                    />
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => removeLunchSlot(index)}
                      disabled={lunchSlots.length === 1}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={addLunchSlot}
                  className="mb-2"
                >
                  <FaPlus className="me-1" /> Add Lunch Slot
                </Button>
              </div>
            </div>

            {/* Dinner Slots Section */}
            <div className="row mt-3">
              <div className="col-12">
                <label className="form-label fw-bold">Dinner Time Slots</label>
                {dinnerSlots.map((slot, index) => (
                  <div
                    key={index}
                    className="d-flex align-items-center mb-2 gap-2"
                  >
                    <input
                      type="text"
                      className="form-control"
                      value={slot.time}
                      onChange={(e) =>
                        updateDinnerSlot(index, "time", e.target.value)
                      }
                      placeholder="eg: 08:00 - 08:15 PM"
                    />
                    <Form.Check
                      type="checkbox"
                      label="Active"
                      checked={slot.active}
                      onChange={(e) =>
                        updateDinnerSlot(index, "active", e.target.checked)
                      }
                    />
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => removeDinnerSlot(index)}
                      disabled={dinnerSlots.length === 1}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={addDinnerSlot}
                  className="mb-2"
                >
                  <FaPlus className="me-1" /> Add Dinner Slot
                </Button>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div className="d-flex">
              <Button
                className="mx-2 modal-close-btn"
                variant=""
                onClick={handleClose3}
              >
                Close
              </Button>
              <Button
                className="mx-2 modal-add-btn"
                variant=""
                onClick={AddCorporatedata}
              >
                {loading ? (
                  <Spinner
                    animation="border"
                    style={{ width: "20px", height: "20px" }}
                  />
                ) : (
                  "Add"
                )}
              </Button>
            </div>
          </Modal.Footer>
        </Modal>

        {/* Edit Package modal for Category */}
        <Modal
          show={show4}
          onHide={handleClose4}
          backdrop="static"
          keyboard={false}
          style={{ zIndex: "99999" }}
          // size="sm"
        >
          <Modal.Header closeButton>
            <Modal.Title style={{ color: "black" }}>
              Edit Corporate List
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
            <div className="row">
              <div className="do-sear mt-2">
                <label> Corporate Name</label>
                <input
                  type="text"
                  className="vi_0"
                  value={Corparatename}
                  placeholder={Data1.Apartmentname}
                  onChange={(e) => setCorparatename(e.target.value)}
                />
              </div>
            </div>
            <div className="row">
              <div className="do-sear mt-2">
                <label htmlFor="logo2"> Logo</label>
                <input
                  type="file"
                  className="vi_0"
                  id="logo2"
                  accept="image/*"
                  placeholder="Select Logo"
                  onChange={(e) => setLogo(e.target.files[0])}
                />
              </div>
            </div>
            <div className="row">
              <div className="do-sear mt-2">
                <label> Mobile Number</label>
                <input
                  type="text"
                  className="vi_0"
                  value={mobile}
                  placeholder={Data1.mobile}
                  onChange={(e) => setMobile(e.target.value)}
                />
              </div>
            </div>

            <div className="row">
              <div className="do-sear mt-2">
                <label> Address</label>
                <input
                  type="text"
                  className="vi_0"
                  value={Address}
                  placeholder={Data1.Address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>

            <div className="row">
              <div className="do-sear mt-2">
                <label> Pin Code</label>
                <input
                  type="text"
                  className="vi_0"
                  value={pincode}
                  placeholder={Data1.pincode}
                  onChange={(e) => setpincode(e.target.value)}
                />
              </div>
            </div>

            <div className="row">
              <div className="do-sear mt-2">
                <label> Prefix Code</label>
                <input
                  type="text"
                  className="vi_0"
                  value={prefixcode}
                  placeholder={Data1.prefixcode}
                  onChange={(e) => setprefixcode(e.target.value)}
                />
              </div>
            </div>

            <div className="row">
              <div className="do-sear mt-2">
                <label>
                  Delivery Price{" "}
                  <span style={{ fontSize: "14px" }}>(only Gate Delivery)</span>
                </label>
                <input
                  type="text"
                  className="vi_0"
                  value={apartmentdelivaryprice}
                  placeholder={Data1.apartmentdelivaryprice}
                  onChange={(e) => setapartmentdelivaryprice(e.target.value)}
                />
              </div>
            </div>

            <div className="row">
              <div className="do-sear mt-2">
                <label> Approximate Delivery Time</label>
                <input
                  type="number"
                  min={0}
                  className="vi_0"
                  value={approximatetime}
                  placeholder={Data1.approximatetime}
                  onChange={(e) => setapproximatetime(e.target.value)}
                />
              </div>
            </div>
            <div className="row">
              <div className="do-sear mt-2">
                <label>Delivery Point</label>
                <input
                  type="text"
                  minLength={0}
                  className="vi_0"
                  placeholder="eg. Security entry Point"
                  value={deliverypoint}
                  maxLength={23}
                  onChange={(e) => setDeliverypoint(e.target.value)}
                />
              </div>
            </div>
            {/* Edit Lunch Slots Section */}
            <div className="row mt-3">
              <div className="col-12">
                <label className="form-label fw-bold">Lunch Time Slots</label>
                {lunchSlots.map((slot, index) => (
                  <div
                    key={index}
                    className="d-flex align-items-center mb-2 gap-2"
                  >
                    <input
                      type="text"
                      className="form-control"
                      value={slot.time}
                      onChange={(e) =>
                        updateLunchSlot(index, "time", e.target.value)
                      }
                      placeholder="eg: 12:00 - 12:15 PM"
                    />
                    <Form.Check
                      type="checkbox"
                      label="Active"
                      checked={slot.active}
                      onChange={(e) =>
                        updateLunchSlot(index, "active", e.target.checked)
                      }
                    />
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => removeLunchSlot(index)}
                      disabled={lunchSlots.length === 1}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={addLunchSlot}
                  className="mb-2"
                >
                  <FaPlus className="me-1" /> Add Lunch Slot
                </Button>
              </div>
            </div>

            {/* Edit Dinner Slots Section */}
            <div className="row mt-3">
              <div className="col-12">
                <label className="form-label fw-bold">Dinner Time Slots</label>
                {dinnerSlots.map((slot, index) => (
                  <div
                    key={index}
                    className="d-flex align-items-center mb-2 gap-2"
                  >
                    <input
                      type="text"
                      className="form-control"
                      value={slot.time}
                      onChange={(e) =>
                        updateDinnerSlot(index, "time", e.target.value)
                      }
                      placeholder="eg: 08:00 - 08:15 PM"
                    />
                    <Form.Check
                      type="checkbox"
                      label="Active"
                      checked={slot.active}
                      onChange={(e) =>
                        updateDinnerSlot(index, "active", e.target.checked)
                      }
                    />
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => removeDinnerSlot(index)}
                      disabled={dinnerSlots.length === 1}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={addDinnerSlot}
                  className="mb-2"
                >
                  <FaPlus className="me-1" /> Add Dinner Slot
                </Button>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div className="d-flex">
              <Button
                className="mx-2 modal-close-btn"
                variant=""
                onClick={handleClose4}
              >
                Close
              </Button>
              <Button
                className="mx-2 modal-add-btn"
                variant=""
                onClick={EditCorporate}
              >
                {loading ? (
                  <Spinner
                    animation="border"
                    style={{ width: "20px", height: "20px" }}
                  />
                ) : (
                  "Update"
                )}
              </Button>
            </div>
          </Modal.Footer>
        </Modal>

        {/* Delete Confirmation modal for Corporate */}
        <Modal
          show={show5}
          onHide={handleClose5}
          backdrop="static"
          keyboard={false}
          style={{ zIndex: "99999" }}
        >
          <Modal.Header closeButton>
            <Modal.Title style={{ color: "black" }}>Warning</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="row">
              <div className="col-md-12">
                <p style={{ color: "black" }}>
                  Are you sure you want to delete this Corporate?
                </p>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              className="mx-2 modal-close-btn"
              variant=""
              onClick={handleClose5}
            >
              Close
            </Button>
            <Button
              className="mx-2 modal-add-btn"
              variant=""
              onClick={DeleteCorporate}
            >
              {loading ? (
                <Spinner
                  animation="border"
                  style={{ width: "20px", height: "20px" }}
                />
              ) : (
                "Delete"
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default CorporateList;
