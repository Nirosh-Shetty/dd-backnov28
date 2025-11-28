import React, { useState, useEffect } from "react";
import { Button, Modal, Table, Image } from "react-bootstrap";
import { AiFillDelete } from "react-icons/ai";
import { BiSolidEdit } from "react-icons/bi";
import { BsSearch } from "react-icons/bs";
import "../Admin/Admin.css";
import axios from "axios";
import moment from "moment";
import * as XLSX from "xlsx";
import ReactPaginate from "react-paginate";

const ApartmentList = () => {
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
  const [Apartmentname, setApartmentname] = useState("");
  const [Address, setAddress] = useState("");
  const [pincode, setpincode] = useState("");
  const [doordelivaryprice, setdoordelivaryprice] = useState("");
  const [apartmentdelivaryprice, setapartmentdelivaryprice] = useState("");
  const [prefixcode, setprefixcode] = useState("");
  const [approximatetime, setapproximatetime] = useState("");

  const AddApartmentdata = async () => {
    try {
      if (!Apartmentname) {
        return alert("Please Add Apartment Name");
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
      if (!doordelivaryprice) {
        return alert("Please add Door Delivery price ");
      }
      if (!apartmentdelivaryprice) {
        return alert("Please add Tower Delivery price ");
      }
      if (!approximatetime) {
        return alert("Please add approximate time ");
      }

      const config = {
        url: "/admin/addapartment",
        method: "post",
        baseURL: "http://localhost:7013/api",
        header: { "content-type": "application/json" },
        data: {
          Apartmentname: Apartmentname,
          Address: Address,
          pincode: pincode,
          prefixcode: prefixcode,
          doordelivaryprice: doordelivaryprice,
          apartmentdelivaryprice: apartmentdelivaryprice,
          approximatetime: approximatetime,
        },
      };
      let res = await axios(config);
      if (res.status === 200) {
        alert("Apartment Details Added Successfully");
        getAddApartment();
        handleClose3();
        setApartmentname("");
        setAddress("");
        setpincode("");
        setdoordelivaryprice(" ");
        setapartmentdelivaryprice("");
        setprefixcode("");
        setapproximatetime("");
      }
    } catch (error) {
      console.log(error);
      alert(error.response.data.msg);
    }
  };

  //integrating get  method
  const [AddApartment, setAddApartment] = useState([]);
  const getAddApartment = async () => {
    try {
      let res = await axios.get("http://localhost:7013/api/admin/getapartment");
      if (res.status === 200) {
        setAddApartment(res.data.corporatedata.reverse());
        setNoChangeData(res.data.corporatedata);
      }
    } catch (error) {
      console.log(error);
    }
  };

  console.log("fdfd", AddApartment);

  //delete method
  const [Data, setData] = useState("");
  const DeleteApartment = async () => {
    try {
      const config = {
        url: "admin/deleteapartment/" + Data,
        method: "delete",
        baseURL: "http://localhost:7013/api/",
        header: { "content-type": "application/json" },
      };
      await axios(config).then((res) => {
        if (res.status === 200) {
          alert("Successfully Delete");
          getAddApartment();
          handleClose5();
        }
      });
    } catch (error) {
      console.log(error);
      alert(error.response.data.msg);
    }
  };

  //update method
  const [Data1, setData1] = useState("");
  const handleShow4 = (items) => {
    setShow4(true);
    setData1(items);
    setApartmentname(items?.Apartmentname);
    setAddress(items?.Address);
    setpincode(items?.pincode);
    setdoordelivaryprice(items?.doordelivaryprice);
    setapproximatetime(items?.approximatetime);
    setprefixcode(items?.prefixcode);
    setapartmentdelivaryprice(items?.apartmentdelivaryprice);
  };

  const EditApartment = async (e) => {
    e.preventDefault();
    try {
      const config = {
        url: "admin/updateapartment",
        method: "put",
        baseURL: "http://localhost:7013/api/",
        headers: { "Content-Type": "application/json" },
        data: {
          Apartmentname,
          Address,
          pincode,
          prefixcode,
          doordelivaryprice,
          apartmentdelivaryprice,
          approximatetime,
          userId: Data1?._id,
        },
      };

      const response = await axios(config);
      if (response.status === 200) {
        alert("Update successful");
        handleClose4();
        getAddApartment();
      }
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.error || "An error occurred");
    }
  };

  useEffect(() => {
    getAddApartment();
  }, []);

  //Pagination
  const [pageNumber, setPageNumber] = useState(0);
  const usersPerPage = 6;
  const pagesVisited = pageNumber * usersPerPage;
  const pageCount = Math.ceil(AddApartment.length / usersPerPage);
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
      setAddApartment(filteredData);
    } else {
      setAddApartment(nochangedata);
    }
  };

  // Export Excel
  const handleExportExcel = () => {
    // Create a custom mapping for the column headers
    const customHeaders = AddApartment.map((item) => ({
      "Date / Time": moment(item.updatedAt).format("MM/DD/YYYY, hh:mm A"),
      "Apartment Name": item.Apartmentname,
      "Pin Code": item.pincode,
      "Prefix Code": item.prefixcode,
      "Door Delivery Price": item.doordelivaryprice,
      "Tower  Delivery Price": item.apartmentdelivaryprice,
      "Approximate Time": item.approximatetime,
      Address: item.Address,
    }));

    // Convert your custom data to an Excel sheet
    const worksheet = XLSX.utils.json_to_sheet(customHeaders);

    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Apartment List ");

    // Download the Excel file
    XLSX.writeFile(workbook, "ApartmentList.xlsx");
  };

  return (
    <div>
      <div>
        <h2 className="header-c ">Pg/Apartment List</h2>
        <div className="customerhead p-2">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="col-lg-4 d-flex justify-content-center">
              <div class="input-group ">
                <span class="input-group-text" id="basic-addon1">
                  <BsSearch />
                </span>
                <input
                  type="text"
                  class="form-control"
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
                  <th>Sl. No</th>
                  <th>Date / Time</th>
                  <th>Pg/Apartment Name</th>
                  <th>Address</th>
                  <th>Pin Code</th>
                  <th>Prefix Code</th>
                  <th>Door Delivery Price</th>
                  <th>Tower Delivery Price</th>
                  <th>Approximate Delivery Time</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {AddApartment?.slice(
                  pagesVisited,
                  pagesVisited + usersPerPage
                )?.map((items, i) => {
                  return (
                    <tr key={1}>
                      <td style={{ paddingTop: "20px" }}>
                        {i + 1 + usersPerPage * pageNumber}
                      </td>
                      <td style={{ paddingTop: "20px" }}>
                        {moment(items?.updatedAt).format("MM/DD/YYYY, h:mm A")}
                      </td>
                      <td style={{ paddingTop: "20px" }}>
                        {items?.Apartmentname}
                      </td>

                      <td style={{ paddingTop: "20px" }}>{items?.Address}</td>
                      <td style={{ paddingTop: "20px" }}> {items?.pincode}</td>

                      <td style={{ paddingTop: "20px" }}>
                        {" "}
                        {items?.prefixcode}
                      </td>

                      <td style={{ paddingTop: "20px" }}>
                        ₹ {items?.doordelivaryprice}
                      </td>
                      <td style={{ paddingTop: "20px" }}>
                        ₹ {items?.apartmentdelivaryprice}
                      </td>

                      <td style={{ paddingTop: "20px" }}>
                        {items?.approximatetime} mins
                      </td>

                      <td>
                        {" "}
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
                            />{" "}
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
                Total Count: {AddApartment?.length}
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
              <Modal.Title>Add Pg/Apartment List</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="row">
                <div className="do-sear mt-2">
                  <label>Pg/Apartment Name</label>
                  <input
                    type="text"
                    className="vi_0"
                    placeholder="Enter Pg/Apartment Name"
                    onChange={(e) => setApartmentname(e.target.value)}
                  />
                </div>
              </div>

              <div className="row">
                <div className="do-sear mt-2">
                  <label>Address</label>
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
                  <label>Add Pin Code</label>
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
                  <label>Add Prefix Code</label>
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
                  <label>Add Door Delivery Price</label>
                  <input
                    type="text"
                    className="vi_0"
                    placeholder="Enter Door Delivery Price"
                    onChange={(e) => setdoordelivaryprice(e.target.value)}
                  />
                </div>
              </div>

              <div className="row">
                <div className="do-sear mt-2">
                  <label>Add Tower Delivery Price</label>
                  <input
                    type="text"
                    className="vi_0"
                    placeholder="Enter Tower Delivery Price"
                    onChange={(e) => setapartmentdelivaryprice(e.target.value)}
                  />
                </div>
              </div>

              <div className="row">
                <div className="do-sear mt-2">
                  <label>Add Approximate Delivery Time</label>
                  <input
                    type="number"
                    className="vi_0"
                    min={0}
                    placeholder="Enter Approximate Delivery Time"
                    onChange={(e) => setapproximatetime(e.target.value)}
                  />
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
                  onClick={AddApartmentdata}
                >
                  Add
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
          >
            <Modal.Header closeButton>
              <Modal.Title style={{ color: "black" }}>
                Edit Pg/Apartment List
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="row">
                <div className="do-sear mt-2">
                  <label>Edit Pg/Apartment Name</label>
                  <input
                    type="text"
                    className="vi_0"
                    value={Apartmentname}
                    placeholder={Data1.Apartmentname}
                    onChange={(e) => setApartmentname(e.target.value)}
                  />
                </div>
              </div>

              <div className="row">
                <div className="do-sear mt-2">
                  <label>Edit Address</label>
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
                  <label>Edit Pin Code</label>
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
                  <label>Edit Prefix Code</label>
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
                  <label>Edit Door Delivery Price</label>
                  <input
                    type="text"
                    className="vi_0"
                    value={doordelivaryprice}
                    placeholder={Data1.doordelivaryprice}
                    onChange={(e) => setdoordelivaryprice(e.target.value)}
                  />
                </div>
              </div>

              <div className="row">
                <div className="do-sear mt-2">
                  <label>Edit Tower Delivery Price</label>
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
                  <label>Edit Approximate Delivery Time</label>
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
                onClick={EditApartment}
              >
                Update
              </Button>
            </Modal.Footer>
          </Modal>

          {/*Delet Package modal for Category */}
          <Modal
            show={show5}
            onHide={handleClose5}
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
                onClick={handleClose5}
              >
                Close
              </Button>
              <Button
                variant=""
                className="modal-add-btn"
                onClick={DeleteApartment}
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

export default ApartmentList;
