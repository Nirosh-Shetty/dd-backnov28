import React, { useEffect, useState } from "react";
import { Button, Modal, Table } from "react-bootstrap";
import { BsSearch } from "react-icons/bs";
import axios from "axios";
import ReactPaginate from "react-paginate";
import { AiFillDelete } from "react-icons/ai";
import { BiSolidEdit } from "react-icons/bi";
import "bootstrap/dist/css/bootstrap.min.css";
// import './Bag.css';

function Bag() {
  const [showAdd, setShowAdd] = useState(false);
  const handleCloseAdd = () => {
    setShowAdd(false);
    setBagNo("");
  };
  const handleShowAdd = () => setShowAdd(true);

  const [showEdit, setShowEdit] = useState(false);
  const handleCloseEdit = () => {
    setShowEdit(false);
    setEditData(null);
    setBagNo("");
  };
  const handleShowEdit = (data) => {
    setEditData(data);
    setBagNo(data.bagNo);
    setShowEdit(true);
  };

  const [showDelete, setShowDelete] = useState(false);
  const handleCloseDelete = () => setShowDelete(false);
  const handleShowDelete = (data) => {
    setDelData(data);
    setShowDelete(true);
  };

  const [bagNo, setBagNo] = useState("");
  const [bagList, setBagList] = useState([]);
  const [nochangedata, setNoChangeData] = useState([]);
  const [delData, setDelData] = useState(null);
  const [editData, setEditData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const AddBag = async () => {
    if (!bagNo) {
      alert("Please enter a bag number");
      return;
    }
    try {
      const config = {
        url: "admin/addbag",
        method: "post",
        baseURL: "http://localhost:7013/api",
        headers: { "Content-Type": "application/json" },
        data: { bagNo },
      };
      let res = await axios(config);
      if (res.status === 200) {
        alert("Bag Added Successfully");
        handleCloseAdd();
        getBags();
      }
    } catch (error) {
      console.error(error);
      alert("Error adding bag");
    }
  };

  const UpdateBag = async () => {
    if (!bagNo) {
      alert("Please enter a bag number");
      return;
    }
    try {
      const config = {
        url: `admin/updatebag/${editData._id}`,
        method: "put",
        baseURL: "http://localhost:7013/api",
        headers: { "Content-Type": "application/json" },
        data: { bagNo },
      };
      let res = await axios(config);
      if (res.status === 200) {
        alert("Bag Updated Successfully");
        handleCloseEdit();
        getBags();
      }
    } catch (error) {
      console.error(error);
      alert("Error updating bag");
    }
  };

  const getBags = async () => {
    try {
      let res = await axios.get("http://localhost:7013/api/admin/getbags");
      if (res.status === 200) {
        setBagList(res.data.bags.reverse());
        setNoChangeData(res.data.bags.reverse());
      }
    } catch (error) {
      console.error(error);
    }
  };

  const deleteBag = async () => {
    try {
      let res = await axios.delete(
        `http://localhost:7013/api/admin/deletebag/${delData._id}`
      );
      if (res.status === 200) {
        alert("Bag Deleted Successfully");
        handleCloseDelete();
        getBags();
      }
    } catch (error) {
      alert(error.message);
    }
  };

  useEffect(() => {
    getBags();
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    if (term === "") {
      setBagList(nochangedata);
    } else {
      const filtered = nochangedata.filter((item) =>
        item.bagNo.toLowerCase().includes(term)
      );
      setBagList(filtered);
    }
    setPageNumber(0);
  };

  const [pageNumber, setPageNumber] = useState(0);
  const usersPerPage = 6;
  const pagesVisited = pageNumber * usersPerPage;
  const pageCount = Math.ceil(bagList.length / usersPerPage);
  const changePage = ({ selected }) => setPageNumber(selected);

  return (
    <div className="container p-4">
      <h2 className="header-c">Bags</h2>
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <div className="col-lg-4 d-flex justify-content-center">
          <div className="input-group">
            <span className="input-group-text">
              <BsSearch />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search by Bag Number..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>
        <Button variant="success" onClick={handleShowAdd}>
          + ADD
        </Button>
      </div>

      <Table responsive bordered>
        <thead>
          <tr>
            <th>Sl. No</th>
            <th>Bag Number</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {bagList
            ?.slice(pagesVisited, pagesVisited + usersPerPage)
            ?.map((item, i) => (
              <tr key={i}>
                <td className="align-middle">
                  {i + 1 + usersPerPage * pageNumber}
                </td>
                <td className="align-middle">Bag {item.bagNo}</td>
                <td className="align-middle">
                  <div className="d-flex justify-content-center gap-3">
                    <BiSolidEdit
                      className="text-success cursor-pointer fs-5"
                      onClick={() => handleShowEdit(item)}
                    />
                    <AiFillDelete
                      className="text-danger cursor-pointer fs-5"
                      onClick={() => handleShowDelete(item)}
                    />
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </Table>

      <div className="d-flex justify-content-between align-items-center mt-3">
        <p>Total Count: {bagList?.length}</p>
        <ReactPaginate
          previousLabel="Back"
          nextLabel="Next"
          pageCount={pageCount}
          onPageChange={changePage}
          containerClassName="paginationBttns"
          previousLinkClassName="previousBttn"
          nextLinkClassName="nextBttn"
          disabledClassName="paginationDisabled"
          activeClassName="paginationActive"
        />
      </div>

      <Modal show={showAdd} onHide={handleCloseAdd} style={{ zIndex: 99999 }}>
        <Modal.Header closeButton>
          <Modal.Title>Add Bag</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label className="form-label">Bag Number</label>
            <input
              type="number"
              className="form-control"
              placeholder="Enter Bag Number"
              value={bagNo}
              onChange={(e) => setBagNo(e.target.value)}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAdd}>
            Close
          </Button>
          <Button variant="primary" onClick={AddBag}>
            Add
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showEdit} onHide={handleCloseEdit} style={{ zIndex: 99999 }}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Bag</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label className="form-label">Bag Number</label>
            <input
              type="number"
              className="form-control"
              placeholder="Enter Bag Number"
              value={bagNo}
              onChange={(e) => setBagNo(e.target.value)}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEdit}>
            Close
          </Button>
          <Button variant="primary" onClick={UpdateBag}>
            Update
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showDelete}
        onHide={handleCloseDelete}
        backdrop="static"
        keyboard={false}
        style={{ zIndex: 99999 }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Warning</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="fs-5 text-danger">
            Are you sure you want to delete Bag No: {delData?.bagNo}?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDelete}>
            Close
          </Button>
          <Button variant="danger" onClick={deleteBag}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Bag;
