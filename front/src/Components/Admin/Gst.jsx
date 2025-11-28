import React, { useEffect, useState } from "react";
import { Button, Modal, Table, Image, Form } from "react-bootstrap";
import { useMemo } from "react";
import { BsSearch } from "react-icons/bs";
import axios from "axios";
import ReactPaginate from "react-paginate";
import { AiFillDelete } from "react-icons/ai";
import { BiSolidEdit } from "react-icons/bi";
import moment from "moment";

function Gst() {
  const [show3, setShow3] = useState();
  const handleClose3 = () => setShow3(false);
  const handleShow3 = () => setShow3(true);

  const [show5, setShow5] = useState();
  const handleClose5 = () => setShow5(false);
  const handleShow5 = () => setShow5(true);

  const [sgst, setSGST] = useState(0);
  const [cgst, setCGST] = useState(0);
  const [totalgst, setTotalGST] = useState(0);

  useMemo(() => {
    setTotalGST(Number(sgst) + Number(cgst));
  }, [sgst, cgst]);

  const AddGst = async (user) => {
    try {
      const config = {
        url: "admin/addgst",
        method: "post",
        baseURL: "http://localhost:7013/api",
        headers: { "Content-Type": "application/Json" },
        data: {
          Cgst: cgst,
          Sgst: sgst,
          TotalGst: totalgst,
        },
      };
      let res = await axios(config);
      if (res.status === 200) {
        alert("Gst Added Successfully");
        handleClose3();
        getGst();
        setSGST(" ");
        setCGST(" ");
        setTotalGST(" ");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const [gstlist, setGstList] = useState([]);
  const [nochangedata, setNoChangeData] = useState([]);
  const getGst = async () => {
    try {
      let res = await axios.get("http://localhost:7013/api/admin/getgst");
      if (res.status === 200) {
        setGstList(res.data.gst.reverse());
        setNoChangeData(res.data.gst.reverse());
        console.log("gst", res.data.gst);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const [delData, setdelData] = useState("");
  let deleteGst = async (id) => {
    try {
      let res = await axios.delete(
        `http://localhost:7013/api/admin/deletegst/${delData?._id}`
      );
      if (res.status === 200) {
        alert(`GST Deleted Successfully`);
        handleClose5();
        getGst();
      }
    } catch (error) {
      alert(error.message);
    }
  };

  useEffect(() => {
    getGst();
  }, []);

  //Pagination
  const [pageNumber, setPageNumber] = useState(0);
  const usersPerPage = 6;
  const pagesVisited = pageNumber * usersPerPage;
  const pageCount = Math.ceil(gstlist.length / usersPerPage);
  const changePage = ({ selected }) => {
    setPageNumber(selected);
  };

  return (
    <div>
      <h2 className="header-c ">Gst</h2>
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
                // onChange={handleFilterH}
              />
            </div>
          </div>

          <Button variant="success" onClick={handleShow3}>
            + ADD
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
                <th>Sl. No</th>
                <th>SGST</th>
                <th>CGST</th>
                <th>Total GST</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {gstlist
                ?.slice(pagesVisited, pagesVisited + usersPerPage)
                ?.map((items, i) => {
                  return (
                    <tr key={i}>
                      <td style={{ paddingTop: "20px" }}>
                        {i + 1 + usersPerPage * pageNumber}
                      </td>

                      <td style={{ paddingTop: "20px" }}>{items.Sgst}</td>
                      <td style={{ paddingTop: "20px" }}>{items?.Cgst}</td>
                      <td style={{ paddingTop: "20px" }}>{items?.TotalGst}</td>

                      <td>
                        {" "}
                        <div
                          style={{
                            display: "flex",
                            gap: "20px",
                            justifyContent: "center",
                          }}
                        >
                          {/* <div>
                            <BiSolidEdit
                              className="text-success"
                              style={{ cursor: "pointer", fontSize: "20px" }}
                              // onClick={() => {
                              //   handleShow4(items);
                              //   setData1(items);
                              // }}
                            />{" "}
                          </div> */}
                          <div>
                            <AiFillDelete
                              className="text-danger"
                              style={{ cursor: "pointer", fontSize: "20px" }}
                              onClick={() => {
                                handleShow5();
                                setdelData(items);
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

          {/* <div style={{ display: "flex" }} className="reactPagination">
            <p style={{ width: "100%", marginTop: "20px" }}>
              Total Count: {gstlist?.length}
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
          </div> */}
        </div>

        {/* Add modal for Products */}
        <Modal show={show3} onHide={handleClose3} style={{ zIndex: "99999" }}>
          <Modal.Header closeButton>
            <Modal.Title>Add GST</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="row">
              <div className="do-sear mt-2">
                <label>SGST</label>
                <input
                  type="number"
                  name=""
                  className="vi_0"
                  placeholder="Enter SGST %"
                  value={sgst}
                  onChange={(e) => setSGST(e.target.value)}
                />
              </div>
            </div>

            <div className="row">
              <div className="do-sear mt-2">
                <label>CGST</label>
                <input
                  type="number"
                  className="vi_0"
                  placeholder="Enter CGST %"
                  value={cgst}
                  onChange={(e) => setCGST(e.target.value)}
                />
              </div>
            </div>

            <div className="row">
              <div className="do-sear mt-2">
                <label>Total GST</label>
                <input
                  type="number"
                  className="vi_0"
                  placeholder="Enter Total Amount"
                  onChange={(e) => setTotalGST(e.target.value)}
                  value={totalgst}
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
                onClick={AddGst}
              >
                Add
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
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
                  <br /> you want to delete this GST?
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
            <Button variant="" className="modal-add-btn" onClick={deleteGst}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}

export default Gst;
