import React, { useState, useEffect } from "react";
import { Button, Modal, Table } from "react-bootstrap";
import { AiFillDelete } from "react-icons/ai";
import { BsSearch } from "react-icons/bs";
import "../Admin/Admin.css";
import axios from "axios";
import moment from "moment";
import * as XLSX from "xlsx";
import ReactPaginate from "react-paginate";

const LocationAddRequest = () => {
  // Delete modal
  const [show4, setShow4] = useState();
  const handleClose4 = () => setShow4(false);
  const handleShow4 = () => setShow4(true);

  // get method Integration
  const [Enquiry, setEnquiry] = useState([]);
  const getEnquiry = async () => {
    try {
      let res = await axios.get(
        "http://localhost:7013/api/User/getEnquiryenquiry"
      );
      if (res.status === 200) {
        setEnquiry(res.data.getdata.reverse());
        setNoChangeData(res.data.getdata);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Delete
  const [contactListId, setcontactListId] = useState();
  let DeleteEnquiry = async () => {
    try {
      let res = await axios.delete(
        `http://localhost:7013/api/User/DeleteEnquiryList/${contactListId}`
      );
      if (res.status === 200) {
        alert(` Successfully Deleted..!`);
        handleClose4();
        getEnquiry();
      } else {
        alert(` not deleted..`);
      }
    } catch (error) {
      alert(error.message);
    }
  };

  useEffect(() => {
    getEnquiry();
  }, []);

  //Pagination
  const [pageNumber, setPageNumber] = useState(0);
  const usersPerPage = 6;
  const pagesVisited = pageNumber * usersPerPage;
  const pageCount = Math.ceil(Enquiry.length / usersPerPage);
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
      setEnquiry(filteredData);
    } else {
      setEnquiry(nochangedata);
    }
  };

  // ==============DATE FILTER======================//

  const [startDate, setstartDate] = useState("");
  const [endDate, setendDate] = useState("");

  function filterByDateRange() {
    if (!startDate) {
      alert("Please select a 'from' date");
      return;
    }
    if (!endDate) {
      alert("Please select a 'to' date");
      return;
    }

    // Parse the input date strings into Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Set the end time to the end of the day to include all records on the end date
    end.setHours(23, 59, 59, 999);

    // Filter the Enquiry array based on the date range
    const newArry = Enquiry.filter((order) => {
      const placedDate = new Date(order.createdAt);
      return placedDate >= start && placedDate <= end;
    });

    setEnquiry(newArry);

    if (newArry.length === 0) {
      alert("No records found within the selected date range");
    }
  }

  function clearbutton() {
    setendDate("");
    setstartDate("");
    setEnquiry(nochangedata);
    // getAdduser();
  }
  // Export Excel
  const handleExportExcel = () => {
    // Create a custom mapping for the column headers
    const customHeaders = Enquiry.map((items) => ({
      "Date / Time": moment(items.createdAt).format("MM/DD/YYYY, h:mm A"),
      "User Name": items.Name,
      "Phone Number": items.Number,
      "Apartment Name": items.ApartmentName,
      Description: items.Message,
    }));

    // Convert your custom data to an Excel sheet
    const worksheet = XLSX.utils.json_to_sheet(customHeaders);

    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "LocationAddRequest");

    // Download the Excel file
    XLSX.writeFile(workbook, "LocationaddRequest.xlsx");
  };

  return (
    <div>
      <div>
        <div className="d-flex gap-3 mb-2">
          <div className="col-lg-3 d-flex justify-content-center">
            <div class="input-group ">
              <span class="input-group-text" id="basic-addon1">
                <BsSearch />
              </span>
              <input
                type="text"
                class="form-control"
                placeholder="Search..."
                aria-describedby="basic-addon1"
                onChange={handleFilterH}
                value={searchH}
              />
            </div>
          </div>
          <div className="col-md-3 d-flex justify-content-center align-items-center">
            <div className="input-group">
              <label htmlFor="" className="m-auto">
                From: &nbsp;
              </label>
              <input
                type="date"
                className="form-control"
                aria-describedby="date-filter"
                value={startDate}
                onChange={(e) => setstartDate(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-3 d-flex justify-content-center align-items-center">
            <div className="input-group">
              <label htmlFor="" className="m-auto">
                To: &nbsp;
              </label>
              <input
                type="date"
                className="form-control"
                aria-describedby="date-filter"
                value={endDate}
                onChange={(e) => setendDate(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Button
              variant=""
              className="modal-add-btn"
              onClick={filterByDateRange}
            >
              Submit
            </Button>
          </div>
          <div>
            <Button variant="danger" onClick={clearbutton}>
              Clear
            </Button>
          </div>
        </div>
        <div className="customerhead p-2">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="header-c ">Add Location Request</h2>
            <Button variant="success" onClick={handleExportExcel}>
              Export Excel
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
                  <th>SL.NO</th>
                  <th>Request Date</th>
                  <th>Name</th>
                  <th>Phone Number</th>
                  <th>Apartment Name</th>
                  <th>Address</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {Enquiry?.slice(pagesVisited, pagesVisited + usersPerPage)?.map(
                  (items, i) => {
                    return (
                      <tr>
                        <td style={{ paddingTop: "20px" }}>
                          {i + 1 + usersPerPage * pageNumber}
                        </td>
                        <td style={{ paddingTop: "20px" }}>
                          {moment(items?.createdAt).format("MM/DD/YYYY h:mm A")}
                        </td>
                        <td style={{ paddingTop: "20px" }}>{items?.Name}</td>
                        <td style={{ paddingTop: "20px" }}>{items?.Number}</td>
                        <td style={{ paddingTop: "20px" }}>
                          {items?.ApartmentName}
                        </td>
                        <td style={{ paddingTop: "20px" }}>
                          {" "}
                          {items?.Message}
                        </td>

                        <td style={{ paddingTop: "20px" }}>
                          {" "}
                          <div
                            style={{
                              display: "flex",
                              gap: "20px",
                              justifyContent: "center",
                            }}
                          >
                            <div>
                              <AiFillDelete
                                className="text-danger"
                                style={{ cursor: "pointer", fontSize: "20px" }}
                                onClick={() => {
                                  handleShow4();
                                  setcontactListId(items?._id);
                                }}
                              />{" "}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </Table>

            <div style={{ display: "flex" }} className="reactPagination">
              <p style={{ width: "100%", marginTop: "20px" }}>
                Total Count: {Enquiry?.length}
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

          {/* Delet modal  */}
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
              <Button
                variant=""
                className="modal-close-btn"
                onClick={handleClose4}
              >
                Close
              </Button>
              <Button
                variant=""
                className="modal-add-btn"
                onClick={DeleteEnquiry}
              >
                Delete
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default LocationAddRequest;
