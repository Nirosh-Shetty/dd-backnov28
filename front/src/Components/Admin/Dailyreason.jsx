import React, { useEffect, useState } from "react";
import { Button, Modal, Table, Tabs, Tab } from "react-bootstrap";
import { BsSearch } from "react-icons/bs";
import axios from "axios";
import ReactPaginate from "react-paginate";
import { AiFillDelete } from "react-icons/ai";
import { BiSolidEdit } from "react-icons/bi";
import "bootstrap/dist/css/bootstrap.min.css";
// import './ReasonManagement.css';

function ReasonManagement() {
  // State and functions for Delay Reasons
  const [showAddDelay, setShowAddDelay] = useState(false);
  const [showEditDelay, setShowEditDelay] = useState(false);
  const [showDeleteDelay, setShowDeleteDelay] = useState(false);
  const [delayReason, setDelayReason] = useState("");
  const [delayReasonList, setDelayReasonList] = useState([]);
  const [delayNoChangeData, setDelayNoChangeData] = useState([]);
  const [delayDelData, setDelayDelData] = useState(null);
  const [delayEditData, setDelayEditData] = useState(null);
  const [delaySearchTerm, setDelaySearchTerm] = useState("");
  const [delayPageNumber, setDelayPageNumber] = useState(0);

  const handleCloseAddDelay = () => {
    setShowAddDelay(false);
    setDelayReason("");
  };
  const handleShowAddDelay = () => setShowAddDelay(true);
  const handleCloseEditDelay = () => {
    setShowEditDelay(false);
    setDelayEditData(null);
    setDelayReason("");
  };
  const handleShowEditDelay = (data) => {
    setDelayEditData(data);
    setDelayReason(data.reason);
    setShowEditDelay(true);
  };
  const handleCloseDeleteDelay = () => setShowDeleteDelay(false);
  const handleShowDeleteDelay = (data) => {
    setDelayDelData(data);
    setShowDeleteDelay(true);
  };

  // State and functions for Reschedule Reasons
  const [showAddReschedule, setShowAddReschedule] = useState(false);
  const [showEditReschedule, setShowEditReschedule] = useState(false);
  const [showDeleteReschedule, setShowDeleteReschedule] = useState(false);
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [rescheduleReasonList, setRescheduleReasonList] = useState([]);
  const [rescheduleNoChangeData, setRescheduleNoChangeData] = useState([]);
  const [rescheduleDelData, setRescheduleDelData] = useState(null);
  const [rescheduleEditData, setRescheduleEditData] = useState(null);
  const [rescheduleSearchTerm, setRescheduleSearchTerm] = useState("");
  const [reschedulePageNumber, setReschedulePageNumber] = useState(0);

  const handleCloseAddReschedule = () => {
    setShowAddReschedule(false);
    setRescheduleReason("");
  };
  const handleShowAddReschedule = () => setShowAddReschedule(true);
  const handleCloseEditReschedule = () => {
    setShowEditReschedule(false);
    setRescheduleEditData(null);
    setRescheduleReason("");
  };
  const handleShowEditReschedule = (data) => {
    setRescheduleEditData(data);
    setRescheduleReason(data.reason);
    setShowEditReschedule(true);
  };
  const handleCloseDeleteReschedule = () => setShowDeleteReschedule(false);
  const handleShowDeleteReschedule = (data) => {
    setRescheduleDelData(data);
    setShowDeleteReschedule(true);
  };

  // State and functions for Cancel Reasons
  const [showAddCancel, setShowAddCancel] = useState(false);
  const [showEditCancel, setShowEditCancel] = useState(false);
  const [showDeleteCancel, setShowDeleteCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelReasonList, setCancelReasonList] = useState([]);
  const [cancelNoChangeData, setCancelNoChangeData] = useState([]);
  const [cancelDelData, setCancelDelData] = useState(null);
  const [cancelEditData, setCancelEditData] = useState(null);
  const [cancelSearchTerm, setCancelSearchTerm] = useState("");
  const [cancelPageNumber, setCancelPageNumber] = useState(0);

  const handleCloseAddCancel = () => {
    setShowAddCancel(false);
    setCancelReason("");
  };
  const handleShowAddCancel = () => setShowAddCancel(true);
  const handleCloseEditCancel = () => {
    setShowEditCancel(false);
    setCancelEditData(null);
    setCancelReason("");
  };
  const handleShowEditCancel = (data) => {
    setCancelEditData(data);
    setCancelReason(data.reason);
    setShowEditCancel(true);
  };
  const handleCloseDeleteCancel = () => setShowDeleteCancel(false);
  const handleShowDeleteCancel = (data) => {
    setCancelDelData(data);
    setShowDeleteCancel(true);
  };

  // CRUD Operations for Delay Reasons
  const AddDelayReason = async () => {
    if (!delayReason) {
      alert("Please enter a delay reason");
      return;
    }
    try {
      const config = {
        url: "admin/adddelayreason",
        method: "post",
        baseURL: "http://localhost:7013/api",
        headers: { "Content-Type": "application/json" },
        data: { reason: delayReason, reasonType: "delay" },
      };
      let res = await axios(config);
      if (res.status === 200) {
        alert("Delay Reason Added Successfully");
        handleCloseAddDelay();
        getDelayReasons();
      }
    } catch (error) {
      console.error(error);
      alert("Error adding delay reason");
    }
  };

  const UpdateDelayReason = async () => {
    if (!delayReason) {
      alert("Please enter a delay reason");
      return;
    }
    try {
      const config = {
        url: `admin/updatedelayreason/${delayEditData._id}`,
        method: "put",
        baseURL: "http://localhost:7013/api",
        headers: { "Content-Type": "application/json" },
        data: { reason: delayReason, reasonType: "delay" },
      };
      let res = await axios(config);
      if (res.status === 200) {
        alert("Delay Reason Updated Successfully");
        handleCloseEditDelay();
        getDelayReasons();
      }
    } catch (error) {
      console.error(error);
      alert("Error updating delay reason");
    }
  };

  const getDelayReasons = async () => {
    try {
      let res = await axios.get(
        "http://localhost:7013/api/admin/getdelayreasons"
      );
      if (res.status === 200) {
        const Reasons = res.data.reasons || [];
        setDelayReasonList(Reasons?.filter((ele) => ele.reasonType == "delay"));
        setDelayNoChangeData(
          Reasons?.filter((ele) => ele.reasonType == "delay")
        );
        setRescheduleReasonList(
          Reasons?.filter((ele) => ele.reasonType == "reschedule")
        );
        setRescheduleNoChangeData(
          Reasons?.filter((ele) => ele.reasonType == "reschedule")
        );
        setCancelReasonList(
          Reasons?.filter((ele) => ele.reasonType == "cancel")
        );
        setCancelNoChangeData(
          Reasons?.filter((ele) => ele.reasonType == "cancel")
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const deleteDelayReason = async () => {
    try {
      let res = await axios.delete(
        `http://localhost:7013/api/admin/deletedelayreason/${delayDelData._id}`
      );
      if (res.status === 200) {
        alert("Delay Reason Deleted Successfully");
        handleCloseDeleteDelay();
        getDelayReasons();
      }
    } catch (error) {
      alert(error.message);
    }
  };

  // CRUD Operations for Reschedule Reasons
  const AddRescheduleReason = async () => {
    if (!rescheduleReason) {
      alert("Please enter a reschedule reason");
      return;
    }
    try {
      const config = {
        url: "admin/adddelayreason",
        method: "post",
        baseURL: "http://localhost:7013/api",
        headers: { "Content-Type": "application/json" },
        data: { reason: rescheduleReason, reasonType: "reschedule" },
      };
      let res = await axios(config);
      if (res.status === 200) {
        alert("Reschedule Reason Added Successfully");
        handleCloseAddReschedule();
        getDelayReasons();
      }
    } catch (error) {
      console.error(error);
      alert("Error adding reschedule reason");
    }
  };

  const UpdateRescheduleReason = async () => {
    if (!rescheduleReason) {
      alert("Please enter a reschedule reason");
      return;
    }
    try {
      const config = {
        url: `admin/updatedelayreason/${rescheduleEditData._id}`,
        method: "put",
        baseURL: "http://localhost:7013/api",
        headers: { "Content-Type": "application/json" },
        data: { reason: rescheduleReason, reasonType: "reschedule" },
      };
      let res = await axios(config);
      if (res.status === 200) {
        alert("Reschedule Reason Updated Successfully");
        handleCloseEditReschedule();
        getDelayReasons();
      }
    } catch (error) {
      console.error(error);
      alert("Error updating reschedule reason");
    }
  };

  const deleteRescheduleReason = async () => {
    try {
      let res = await axios.delete(
        `http://localhost:7013/api/admin/deletedelayreason/${rescheduleDelData._id}`
      );
      if (res.status === 200) {
        alert("Reschedule Reason Deleted Successfully");
        handleCloseDeleteReschedule();
        getDelayReasons();
      }
    } catch (error) {
      alert(error.message);
    }
  };

  // CRUD Operations for Cancel Reasons
  const AddCancelReason = async () => {
    if (!cancelReason) {
      alert("Please enter a cancel reason");
      return;
    }
    try {
      const config = {
        url: "admin/adddelayreason",
        method: "post",
        baseURL: "http://localhost:7013/api",
        headers: { "Content-Type": "application/json" },
        data: { reason: cancelReason, reasonType: "cancel" },
      };
      let res = await axios(config);
      if (res.status === 200) {
        alert("Cancel Reason Added Successfully");
        handleCloseAddCancel();
        getDelayReasons();
      }
    } catch (error) {
      console.error(error);
      alert("Error adding cancel reason");
    }
  };

  const UpdateCancelReason = async () => {
    if (!cancelReason) {
      alert("Please enter a cancel reason");
      return;
    }
    try {
      const config = {
        url: `admin/updatedelayreason/${cancelEditData._id}`,
        method: "put",
        baseURL: "http://localhost:7013/api",
        headers: { "Content-Type": "application/json" },
        data: { reason: cancelReason, reasonType: "cancel" },
      };
      let res = await axios(config);
      if (res.status === 200) {
        alert("Cancel Reason Updated Successfully");
        handleCloseEditCancel();
        getDelayReasons();
      }
    } catch (error) {
      console.error(error);
      alert("Error updating cancel reason");
    }
  };

  const deleteCancelReason = async () => {
    try {
      let res = await axios.delete(
        `http://localhost:7013/api/admin/deletedelayreason/${cancelDelData._id}`
      );
      if (res.status === 200) {
        alert("Cancel Reason Deleted Successfully");
        handleCloseDeleteCancel();
        getDelayReasons();
      }
    } catch (error) {
      alert(error.message);
    }
  };

  // Fetch all reasons on component mount
  useEffect(() => {
    getDelayReasons();
  }, []);

  // Search and Pagination for Delay Reasons
  const handleDelaySearch = (e) => {
    const term = e.target.value.toLowerCase();
    setDelaySearchTerm(term);
    if (term === "") {
      setDelayReasonList(delayNoChangeData);
    } else {
      const filtered = delayNoChangeData.filter((item) =>
        item.reason.toLowerCase().includes(term)
      );
      setDelayReasonList(filtered);
    }
    setDelayPageNumber(0);
  };

  const delayUsersPerPage = 6;
  const delayPagesVisited = delayPageNumber * delayUsersPerPage;
  const delayPageCount = Math.ceil(delayReasonList.length / delayUsersPerPage);
  const delayChangePage = ({ selected }) => setDelayPageNumber(selected);

  // Search and Pagination for Reschedule Reasons
  const handleRescheduleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setRescheduleSearchTerm(term);
    if (term === "") {
      setRescheduleReasonList(rescheduleNoChangeData);
    } else {
      const filtered = rescheduleNoChangeData.filter((item) =>
        item.reason.toLowerCase().includes(term)
      );
      setRescheduleReasonList(filtered);
    }
    setReschedulePageNumber(0);
  };

  const rescheduleUsersPerPage = 6;
  const reschedulePagesVisited = reschedulePageNumber * rescheduleUsersPerPage;
  const reschedulePageCount = Math.ceil(
    rescheduleReasonList.length / rescheduleUsersPerPage
  );
  const rescheduleChangePage = ({ selected }) =>
    setReschedulePageNumber(selected);

  // Search and Pagination for Cancel Reasons
  const handleCancelSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setCancelSearchTerm(term);
    if (term === "") {
      setCancelReasonList(cancelNoChangeData);
    } else {
      const filtered = cancelNoChangeData.filter((item) =>
        item.reason.toLowerCase().includes(term)
      );
      setCancelReasonList(filtered);
    }
    setCancelPageNumber(0);
  };

  const cancelUsersPerPage = 6;
  const cancelPagesVisited = cancelPageNumber * cancelUsersPerPage;
  const cancelPageCount = Math.ceil(
    cancelReasonList.length / cancelUsersPerPage
  );
  const cancelChangePage = ({ selected }) => setCancelPageNumber(selected);

  return (
    <div className="container p-4">
      <h2 className="mb-4 text-center">Reason Management</h2>
      <Tabs
        defaultActiveKey="delay"
        id="reason-tabs"
        className="mb-3 custom-tabs"
      >
        {/* Delay Reasons Tab */}
        <Tab eventKey="delay" title="Delay Reasons">
          <div className="mb-3 d-flex justify-content-between align-items-center">
            <div className="col-lg-4 d-flex justify-content-center">
              <div className="input-group">
                <span className="input-group-text">
                  <BsSearch />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by Delay Reason..."
                  value={delaySearchTerm}
                  onChange={handleDelaySearch}
                />
              </div>
            </div>
            <Button className="custom-add-btn" onClick={handleShowAddDelay}>
              + ADD
            </Button>
          </div>

          <Table responsive bordered className="custom-table">
            <thead>
              <tr>
                <th>Sl. No</th>
                <th>Delay Reason</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {delayReasonList
                ?.slice(
                  delayPagesVisited,
                  delayPagesVisited + delayUsersPerPage
                )
                ?.map((item, i) => (
                  <tr key={i}>
                    <td className="align-middle">
                      {i + 1 + delayPagesVisited}
                    </td>
                    <td className="align-middle">{item.reason}</td>
                    <td className="align-middle">
                      <div className="d-flex justify-content-center gap-3">
                        <BiSolidEdit
                          className="text-success cursor-pointer fs-5"
                          onClick={() => handleShowEditDelay(item)}
                        />
                        <AiFillDelete
                          className="text-danger cursor-pointer fs-5"
                          onClick={() => handleShowDeleteDelay(item)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </Table>

          <div className="d-flex justify-content-between align-items-center mt-3">
            <p>Total Count: {delayReasonList?.length}</p>
            <ReactPaginate
              previousLabel="Back"
              nextLabel="Next"
              pageCount={delayPageCount}
              onPageChange={delayChangePage}
              containerClassName="paginationBttns"
              previousLinkClassName="previousBttn"
              nextLinkClassName="nextBttn"
              disabledClassName="paginationDisabled"
              activeClassName="paginationActive"
            />
          </div>

          <Modal
            show={showAddDelay}
            onHide={handleCloseAddDelay}
            style={{ zIndex: 99999 }}
          >
            <Modal.Header closeButton>
              <Modal.Title>Add Delay Reason</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="mb-3">
                <label className="form-label">Delay Reason</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Delay Reason"
                  value={delayReason}
                  onChange={(e) => setDelayReason(e.target.value)}
                />
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseAddDelay}>
                Close
              </Button>
              <Button className="custom-primary-btn" onClick={AddDelayReason}>
                Add
              </Button>
            </Modal.Footer>
          </Modal>

          <Modal
            show={showEditDelay}
            onHide={handleCloseEditDelay}
            style={{ zIndex: 99999 }}
          >
            <Modal.Header closeButton>
              <Modal.Title>Edit Delay Reason</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="mb-3">
                <label className="form-label">Delay Reason</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Delay Reason"
                  value={delayReason}
                  onChange={(e) => setDelayReason(e.target.value)}
                />
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseEditDelay}>
                Close
              </Button>
              <Button
                className="custom-primary-btn"
                onClick={UpdateDelayReason}
              >
                Update
              </Button>
            </Modal.Footer>
          </Modal>

          <Modal
            show={showDeleteDelay}
            onHide={handleCloseDeleteDelay}
            backdrop="static"
            keyboard={false}
            style={{ zIndex: 99999 }}
          >
            <Modal.Header closeButton>
              <Modal.Title>Warning</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p className="fs-5 text-danger">
                Are you sure you want to delete the delay reason:{" "}
                {delayDelData?.reason}?
              </p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseDeleteDelay}>
                Close
              </Button>
              <Button className="custom-danger-btn" onClick={deleteDelayReason}>
                Delete
              </Button>
            </Modal.Footer>
          </Modal>
        </Tab>

        {/* Reschedule Reasons Tab */}
        <Tab eventKey="reschedule" title="Reschedule Reasons">
          <div className="mb-3 d-flex justify-content-between align-items-center">
            <div className="col-lg-4 d-flex justify-content-center">
              <div className="input-group">
                <span className="input-group-text">
                  <BsSearch />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by Reschedule Reason..."
                  value={rescheduleSearchTerm}
                  onChange={handleRescheduleSearch}
                />
              </div>
            </div>
            <Button
              className="custom-add-btn"
              onClick={handleShowAddReschedule}
            >
              + ADD
            </Button>
          </div>

          <Table responsive bordered className="custom-table">
            <thead>
              <tr>
                <th>Sl. No</th>
                <th>Reschedule Reason</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rescheduleReasonList
                ?.slice(
                  reschedulePagesVisited,
                  reschedulePagesVisited + rescheduleUsersPerPage
                )
                ?.map((item, i) => (
                  <tr key={i}>
                    <td className="align-middle">
                      {i + 1 + reschedulePagesVisited}
                    </td>
                    <td className="align-middle">{item.reason}</td>
                    <td className="align-middle">
                      <div className="d-flex justify-content-center gap-3">
                        <BiSolidEdit
                          className="text-success cursor-pointer fs-5"
                          onClick={() => handleShowEditReschedule(item)}
                        />
                        <AiFillDelete
                          className="text-danger cursor-pointer fs-5"
                          onClick={() => handleShowDeleteReschedule(item)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </Table>

          <div className="d-flex justify-content-between align-items-center mt-3">
            <p>Total Count: {rescheduleReasonList?.length}</p>
            <ReactPaginate
              previousLabel="Back"
              nextLabel="Next"
              pageCount={reschedulePageCount}
              onPageChange={rescheduleChangePage}
              containerClassName="paginationBttns"
              previousLinkClassName="previousBttn"
              nextLinkClassName="nextBttn"
              disabledClassName="paginationDisabled"
              activeClassName="paginationActive"
            />
          </div>

          <Modal
            show={showAddReschedule}
            onHide={handleCloseAddReschedule}
            style={{ zIndex: 99999 }}
          >
            <Modal.Header closeButton>
              <Modal.Title>Add Reschedule Reason</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="mb-3">
                <label className="form-label">Reschedule Reason</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Reschedule Reason"
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                />
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseAddReschedule}>
                Close
              </Button>
              <Button
                className="custom-primary-btn"
                onClick={AddRescheduleReason}
              >
                Add
              </Button>
            </Modal.Footer>
          </Modal>

          <Modal
            show={showEditReschedule}
            onHide={handleCloseEditReschedule}
            style={{ zIndex: 99999 }}
          >
            <Modal.Header closeButton>
              <Modal.Title>Edit Reschedule Reason</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="mb-3">
                <label className="form-label">Reschedule Reason</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Reschedule Reason"
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                />
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseEditReschedule}>
                Close
              </Button>
              <Button
                className="custom-primary-btn"
                onClick={UpdateRescheduleReason}
              >
                Update
              </Button>
            </Modal.Footer>
          </Modal>

          <Modal
            show={showDeleteReschedule}
            onHide={handleCloseDeleteReschedule}
            backdrop="static"
            keyboard={false}
            style={{ zIndex: 99999 }}
          >
            <Modal.Header closeButton>
              <Modal.Title>Warning</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p className="fs-5 text-danger">
                Are you sure you want to delete the reschedule reason:{" "}
                {rescheduleDelData?.reason}?
              </p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseDeleteReschedule}>
                Close
              </Button>
              <Button
                className="custom-danger-btn"
                onClick={deleteRescheduleReason}
              >
                Delete
              </Button>
            </Modal.Footer>
          </Modal>
        </Tab>

        {/* Cancel Reasons Tab */}
        <Tab eventKey="cancel" title="Cancel Reasons">
          <div className="mb-3 d-flex justify-content-between align-items-center">
            <div className="col-lg-4 d-flex justify-content-center">
              <div className="input-group">
                <span className="input-group-text">
                  <BsSearch />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by Cancel Reason..."
                  value={cancelSearchTerm}
                  onChange={handleCancelSearch}
                />
              </div>
            </div>
            <Button className="custom-add-btn" onClick={handleShowAddCancel}>
              + ADD
            </Button>
          </div>

          <Table responsive bordered className="custom-table">
            <thead>
              <tr>
                <th>Sl. No</th>
                <th>Cancel Reason</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {cancelReasonList
                ?.slice(
                  cancelPagesVisited,
                  cancelPagesVisited + cancelUsersPerPage
                )
                ?.map((item, i) => (
                  <tr key={i}>
                    <td className="align-middle">
                      {i + 1 + cancelPagesVisited}
                    </td>
                    <td className="align-middle">{item.reason}</td>
                    <td className="align-middle">
                      <div className="d-flex justify-content-center gap-3">
                        <BiSolidEdit
                          className="text-success cursor-pointer fs-5"
                          onClick={() => handleShowEditCancel(item)}
                        />
                        <AiFillDelete
                          className="text-danger cursor-pointer fs-5"
                          onClick={() => handleShowDeleteCancel(item)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </Table>

          <div className="d-flex justify-content-between align-items-center mt-3">
            <p>Total Count: {cancelReasonList?.length}</p>
            <ReactPaginate
              previousLabel="Back"
              nextLabel="Next"
              pageCount={cancelPageCount}
              onPageChange={cancelChangePage}
              containerClassName="paginationBttns"
              previousLinkClassName="previousBttn"
              nextLinkClassName="nextBttn"
              disabledClassName="paginationDisabled"
              activeClassName="paginationActive"
            />
          </div>

          <Modal
            show={showAddCancel}
            onHide={handleCloseAddCancel}
            style={{ zIndex: 99999 }}
          >
            <Modal.Header closeButton>
              <Modal.Title>Add Cancel Reason</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="mb-3">
                <label className="form-label">Cancel Reason</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Cancel Reason"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseAddCancel}>
                Close
              </Button>
              <Button className="custom-primary-btn" onClick={AddCancelReason}>
                Add
              </Button>
            </Modal.Footer>
          </Modal>

          <Modal
            show={showEditCancel}
            onHide={handleCloseEditCancel}
            style={{ zIndex: 99999 }}
          >
            <Modal.Header closeButton>
              <Modal.Title>Edit Cancel Reason</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="mb-3">
                <label className="form-label">Cancel Reason</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Cancel Reason"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseEditCancel}>
                Close
              </Button>
              <Button
                className="custom-primary-btn"
                onClick={UpdateCancelReason}
              >
                Update
              </Button>
            </Modal.Footer>
          </Modal>

          <Modal
            show={showDeleteCancel}
            onHide={handleCloseDeleteCancel}
            backdrop="static"
            keyboard={false}
            style={{ zIndex: 99999 }}
          >
            <Modal.Header closeButton>
              <Modal.Title>Warning</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p className="fs-5 text-danger">
                Are you sure you want to delete the cancel reason:{" "}
                {cancelDelData?.reason}?
              </p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseDeleteCancel}>
                Close
              </Button>
              <Button
                className="custom-danger-btn"
                onClick={deleteCancelReason}
              >
                Delete
              </Button>
            </Modal.Footer>
          </Modal>
        </Tab>
      </Tabs>
      <style>
        {`.custom-tabs .nav-link {
  color: #2c3e50;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-bottom: none;
  margin-right: 2px;
}

.custom-tabs .nav-link.active {
  background-color: #FE4500;
  color: #FFFFFF;
  border-color: #FE4500 #FE4500 #FFFFFF;
}

.custom-tabs .nav-tabs {
  border-bottom: 1px solid #FE4500;
}

/* Custom Table Styling */
.custom-table thead th {
  background-color: #FE4500;
  color: #FFFFFF;
  text-align: center;
}

.custom-table tbody td {
  vertical-align: middle;
}

/* Custom Button Styling */
.custom-add-btn {
  background-color: #FE4500 !important;
  border-color: #FE4500 !important;
  color: #FFFFFF !important;
}

.custom-add-btn:hover {
  background-color: #e03e00 !important;
  border-color: #e03e00 !important;
}

.custom-primary-btn {
  background-color: #FE4500 !important;
  border-color: #FE4500 !important;
  color: #FFFFFF !important;
}

.custom-primary-btn:hover {
  background-color: #e03e00 !important;
  border-color: #e03e00 !important;
}

.custom-danger-btn {
  background-color: #dc3545 !important;
  border-color: #dc3545 !important;
  color: #FFFFFF !important;
}

.custom-danger-btn:hover {
  background-color: #c82333 !important;
  border-color: #c82333 !important;
}`}
      </style>
    </div>
  );
}

export default ReasonManagement;
