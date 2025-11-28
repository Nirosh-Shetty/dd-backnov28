import React, { useState, useEffect } from "react";
import { Button, Modal, Table, Image } from "react-bootstrap";
import { AiFillDelete } from "react-icons/ai";
import { BiSolidEdit } from "react-icons/bi";
import { BsSearch } from "react-icons/bs";
import "../Admin/Admin.css";
import axios from "axios";

const Slot = () => {
  // ======Main Slots INTEGRATION=======//

  // Add modal for sloat
  const [show3, setShow3] = useState();
  const handleClose3 = () => setShow3(false);
  const handleShow3 = () => setShow3(true);

  // Edit modal for  sloat
  const [show4, setShow4] = useState();
  const handleClose4 = () => setShow4(false);

  // Delet modal for  sloat
  const [show5, setShow5] = useState();
  const handleClose5 = () => setShow5(false);
  const handleShow5 = () => setShow5(true);

  // integrating post method of Main Slots
  const [mainslots, setmainslots] = useState("");

  const AddSlotadata = async () => {
    try {
      if (!mainslots) {
        return alert("Please add Main Slots");
      }
      const config = {
        url: "/admin/addslots",
        method: "post",
        baseURL: "http://localhost:7013/api",
        header: { "content-type": "application/json" },
        data: {
          mainslots: mainslots,
        },
      };
      let res = await axios(config);
      if (res.status === 200) {
        alert("Main Slots Added Successfully");
        getAddSlots();
        handleClose3();
        setmainslots("");
      }
    } catch (error) {
      console.log(error);
      alert(error.response.data.msg);
    }
  };
  //integrating get  method
  const [AddSlots, setAddSlots] = useState([]);
  const getAddSlots = async () => {
    try {
      let res = await axios.get("http://localhost:7013/api/admin/getslots");
      if (res.status === 200) {
        setAddSlots(res.data.Newaddress);
        setNoChangeData1(res.data.Newaddress);
      }
    } catch (error) {
      console.log(error);
    }
  };

  //delete method
  const [Data, setData] = useState("");
  const DeleteSlots = async () => {
    try {
      const config = {
        url: "admin/deleteslots/" + Data,
        method: "delete",
        baseURL: "http://localhost:7013/api/",
        header: { "content-type": "application/json" },
      };
      await axios(config).then((res) => {
        if (res.status === 200) {
          alert("Successfully Delete");
          getAddSlots();
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
    setmainslots(items?.mainslots);
  };

  const EditSlots = async (e) => {
    e.preventDefault();
    try {
      const config = {
        url: "admin/updateslots",
        method: "put",
        baseURL: "http://localhost:7013/api/",
        header: { "content-type": "application/json" },
        data: {
          mainslots: mainslots,
          userId: Data1?._id,
        },
      };
      await axios(config).then((res) => {
        if (res.status === 200) {
          alert("successfully Update");
          handleClose4();
          getAddSlots();
        }
      });
    } catch (error) {
      console.log(error);
      alert(error.response.data.error);
    }
  };

  useEffect(() => {
    getAddSlots();
  }, []);

  // Search filter
  const [nochangedata1, setNoChangeData1] = useState([]);
  const [searchH1, setSearchH1] = useState("");

  const handleFilterH1 = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearchH1(searchTerm);
    if (searchTerm !== "") {
      const filteredData = nochangedata1.filter((user) =>
        Object.values(user).some((value) =>
          String(value).toLowerCase().includes(searchTerm)
        )
      );
      setAddSlots(filteredData);
    } else {
      setAddSlots(nochangedata);
    }
  };

  // ======Available Slots INTEGRATION=======//

  // Add modal for sloat
  const [show, setShow] = useState();
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // Edit modal for  sloat
  const [show1, setShow1] = useState();
  const handleClose1 = () => setShow1(false);

  // Delet modal for  sloat
  const [show2, setShow2] = useState();
  const handleClose2 = () => setShow2(false);
  const handleShow2 = () => setShow2(true);

  // integrating post method of Main Slots
  const [Mainslots, setMainslots] = useState("");
  const [Availableslots, setAvailableslots] = useState("");

  const AddavailableSlotadata = async () => {
    try {
      if (!Mainslots) {
        return alert("Please Select Main Slots");
      }
      if (!Availableslots) {
        return alert("Please Add Available Slots");
      }
      const config = {
        url: "/admin/addavailableslots",
        method: "post",
        baseURL: "http://localhost:7013/api",
        header: { "content-type": "application/json" },
        data: {
          Mainslots: Mainslots,
          Availableslots: Availableslots,
        },
      };
      let res = await axios(config);
      if (res.status === 200) {
        alert("Available Slots Added Successfully");
        getAddAvailableslot();
        handleClose();
        setMainslots(" ");
        setAvailableslots(" ");
      }
    } catch (error) {
      console.log(error);
      alert(error.response.data.msg);
    }
  };
  //integrating get  method
  const [AddAvailableslot, setAddAvailableslot] = useState([]);
  const getAddAvailableslot = async () => {
    try {
      let res = await axios.get(
        "http://localhost:7013/api/admin/getavailableslots"
      );
      if (res.status === 200) {
        setAddAvailableslot(res.data.Newaddress);
        setNoChangeData(res.data.Newaddress);
      }
    } catch (error) {
      console.log(error);
    }
  };

  //delete method
  const [Datass, setDatass] = useState("");
  const DeleteavaiableSlots = async () => {
    try {
      const config = {
        url: "admin/deleteavailableslots/" + Datass,
        method: "delete",
        baseURL: "http://localhost:7013/api/",
        header: { "content-type": "application/json" },
      };
      await axios(config).then((res) => {
        if (res.status === 200) {
          alert("Successfully Delete");
          getAddAvailableslot();
          handleClose2();
        }
      });
    } catch (error) {
      console.log(error);
      alert(error.response.data.msg);
    }
  };

  //update method
  const [Data2, setData2] = useState("");
  const handleShow1 = (items) => {
    setShow1(true);
    setData2(items);
    setMainslot(items?.Mainslot);
    setAvailableslots(items?.Availableslots);
  };

  const EditAvailableslots = async (e) => {
    e.preventDefault();
    try {
      const config = {
        url: "admin/updateavailableslots",
        method: "put",
        baseURL: "http://localhost:7013/api/",
        header: { "content-type": "application/json" },
        data: {
          Mainslot: Mainslot,
          Availableslots: Availableslots,
          userId: Data2?._id,
        },
      };
      await axios(config).then((res) => {
        if (res.status === 200) {
          alert("successfully Update");
          handleClose1();
          getAddAvailableslot();
        }
      });
    } catch (error) {
      console.log(error);
      alert(error.response.data.error);
    }
  };

  useEffect(() => {
    getAddAvailableslot();
  }, []);

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
      setAddAvailableslot(filteredData);
    } else {
      setAddAvailableslot(nochangedata);
    }
  };

  //condition
  const [Mainslot, setMainslot] = useState(true);
  const [Subslota, setSubslota] = useState(false);
  return (
    <div>
      <div className="d-flex gap-3 mb-3">
        <div
          className={`activebtns ${Mainslot ? "active" : ""}`}
          onClick={() => {
            setMainslot(true);
            setSubslota(false);
          }}
        >
          <Button variant="" style={{ border: "1px solid orange" }}>
            Main Slots
          </Button>
        </div>
        <div
          className={`activebtns ${Subslota ? "active" : ""}`}
          onClick={() => {
            setMainslot(false);
            setSubslota(true);
          }}
        >
          <Button variant="" style={{ border: "1px solid orange" }}>
            Available Slots
          </Button>
        </div>
      </div>

      {Mainslot ? (
        <>
          <div>
            <div>
              <h2 className="header-c ">Main Slot</h2>
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
                        value={searchH1}
                        onChange={handleFilterH1}
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
                        <th>Sl.No</th>
                        <th>Main Slots</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {AddSlots?.map((items, i) => {
                        return (
                          <tr key={i}>
                            <td style={{ paddingTop: "20px" }}>{i + 1}</td>
                            <td style={{ paddingTop: "20px" }}>
                              {items?.mainslots}
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
                                    style={{
                                      cursor: "pointer",
                                      fontSize: "20px",
                                    }}
                                    onClick={() => {
                                      handleShow4(items);
                                      setData1(items);
                                    }}
                                  />{" "}
                                </div>
                                <div>
                                  <AiFillDelete
                                    className="text-danger"
                                    style={{
                                      cursor: "pointer",
                                      fontSize: "20px",
                                    }}
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
                </div>

                {/* Add Package modal for Category */}
                <Modal
                  show={show3}
                  onHide={handleClose3}
                  style={{ zIndex: "99999" }}
                >
                  <Modal.Header closeButton>
                    <Modal.Title>Add Slots</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <div className="row">
                      <div className="do-sear mt-2">
                        <label>Add Main Slots</label>
                        <input
                          type="text"
                          className="vi_0"
                          placeholder="Enter Main Slots"
                          onChange={(e) => setmainslots(e.target.value)}
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
                        onClick={AddSlotadata}
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
                      Edit Slots
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <div className="row">
                      <div className="do-sear mt-2">
                        <label>Edit Main Slots</label>
                        <input
                          type="text"
                          className="vi_0"
                          value={mainslots}
                          placeholder={Data1?.mainslots}
                          onChange={(e) => setmainslots(e.target.value)}
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
                      onClick={EditSlots}
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
                      onClick={DeleteSlots}
                    >
                      Delete
                    </Button>
                  </Modal.Footer>
                </Modal>
              </div>
            </div>
          </div>
        </>
      ) : (
        <></>
      )}

      {Subslota ? (
        <>
          <div>
            <div>
              <h2 className="header-c ">Available Slot</h2>
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
                  <Button variant="success" onClick={handleShow}>
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
                        <th>Sl.No</th>
                        <th>Main Slots</th>
                        <th>Available Slot</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {AddAvailableslot?.map((items, i) => {
                        return (
                          <tr key={i}>
                            <td style={{ paddingTop: "20px" }}>{i + 1}</td>
                            <td style={{ paddingTop: "20px" }}>
                              {items?.Mainslots}
                            </td>
                            <td style={{ paddingTop: "20px" }}>
                              {items?.Availableslots}
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
                                    style={{
                                      cursor: "pointer",
                                      fontSize: "20px",
                                    }}
                                    onClick={() => {
                                      handleShow1(items);
                                      setData2(items);
                                    }}
                                  />{" "}
                                </div>
                                <div>
                                  <AiFillDelete
                                    className="text-danger"
                                    style={{
                                      cursor: "pointer",
                                      fontSize: "20px",
                                    }}
                                    onClick={() => {
                                      handleShow2();
                                      setDatass(items?._id);
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
                </div>

                {/* Add Package modal available slot */}
                <Modal
                  show={show}
                  onHide={handleClose}
                  style={{ zIndex: "99999" }}
                >
                  <Modal.Header closeButton>
                    <Modal.Title>Add Available Slots</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <div className="row">
                      <div className="do-sear mt-2">
                        <label>Select Main Slots</label>
                        <select
                          name=""
                          id=""
                          className="vi_0"
                          onChange={(e) => setMainslots(e.target.value)}
                        >
                          <option value="">Select Slots</option>
                          {AddSlots?.map((itemss) => {
                            return (
                              <option value={itemss?.mainslots}>
                                {itemss?.mainslots}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    </div>
                    <div className="row">
                      <div className="do-sear mt-2">
                        <label>Add Available Slots</label>
                        <input
                          type="text"
                          className="vi_0"
                          placeholder="Enter Available Slots"
                          onChange={(e) => setAvailableslots(e.target.value)}
                        />
                      </div>
                    </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <div className="d-flex">
                      <Button
                        className="mx-2 modal-close-btn"
                        variant=""
                        onClick={handleClose}
                      >
                        Close
                      </Button>
                      <Button
                        className="mx-2 modal-add-btn"
                        variant=""
                        onClick={AddavailableSlotadata}
                      >
                        Add
                      </Button>
                    </div>
                  </Modal.Footer>
                </Modal>

                {/* Edit Package modal for available slot */}
                <Modal
                  show={show1}
                  onHide={handleClose1}
                  backdrop="static"
                  keyboard={false}
                  style={{ zIndex: "99999" }}
                >
                  <Modal.Header closeButton>
                    <Modal.Title style={{ color: "black" }}>
                      Edit Available Slots
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <div className="row">
                      <div className="do-sear mt-2">
                        <label>Select Main Slots</label>
                        <select
                          name=""
                          id=""
                          className="vi_0"
                          onChange={(e) => setMainslots(e.target.value)}
                        >
                          <option value="">Select Slots</option>
                          {AddSlots?.map((itemss) => {
                            return (
                              <option value={itemss?.mainslots}>
                                {itemss?.mainslots}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    </div>
                    <div className="row">
                      <div className="do-sear mt-2">
                        <label>Edit Available Slots</label>
                        <input
                          type="text"
                          className="vi_0"
                          value={Availableslots}
                          placeholder={Data2?.Availableslots}
                          onChange={(e) => setAvailableslots(e.target.value)}
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
                      onClick={EditAvailableslots}
                    >
                      Update
                    </Button>
                  </Modal.Footer>
                </Modal>

                {/*Delet Package modal for Category */}
                <Modal
                  show={show2}
                  onHide={handleClose2}
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
                      onClick={handleClose2}
                    >
                      Close
                    </Button>
                    <Button
                      variant=""
                      className="modal-add-btn"
                      onClick={DeleteavaiableSlots}
                    >
                      Delete
                    </Button>
                  </Modal.Footer>
                </Modal>
              </div>
            </div>
          </div>
        </>
      ) : (
        <></>
      )}
    </div>
  );
};

export default Slot;
