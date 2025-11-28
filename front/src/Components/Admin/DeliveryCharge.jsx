import React, { useEffect, useState } from "react";
import { Button, Modal, Table } from "react-bootstrap";
import { AiFillDelete } from "react-icons/ai";
import { BiSolidEdit } from "react-icons/bi";
import axios from "axios";

const DeliveryCharge = () => {
  // Add modal for Banner
  const [show3, setShow3] = useState();
  const handleClose3 = () => setShow3(false);
  const handleShow3 = () => setShow3(true);

  // Delet modal for  Banner
  const [show5, setShow5] = useState();
  const handleClose5 = () => setShow5(false);
  const handleShow5 = () => setShow5(true);

  // ======INTEGRATION=======//
  // integrating post method
  const [MinimumAmount, setMinimumAmount] = useState("");
  const [DelivaryCharge, setDelivaryCharge] = useState("");

  const AddDelvarycharg = async () => {
    try {
      if (!MinimumAmount) {
        return alert("Please add Minimum Amount");
      }
      if (!DelivaryCharge) {
        return alert("Please add Delivary Charge");
      }
      const config = {
        url: "/admin/delivarycharge",
        method: "post",
        baseURL: "http://localhost:7013/api",
        header: { "content-type": "multipart/form-data" },
        data: {
          MinimumAmount: MinimumAmount,
          DelivaryCharge: DelivaryCharge,
        },
      };
      let res = await axios(config);
      if (res.status === 200) {
        alert(res.data.success);
        getAddDelivarychrg();
        handleClose3();
      }
    } catch (error) {
      console.log(error);
      alert(error.response.data.msg);
    }
  };
  //integrating get  method
  const [AddDelivarychrg, setAddDelivarychrg] = useState([]);
  const getAddDelivarychrg = async () => {
    try {
      let res = await axios.get(
        "http://localhost:7013/api/admin/getdelivarycharge"
      );
      if (res.status === 200) {
        setAddDelivarychrg(res.data.getdelivarycharge);
      }
    } catch (error) {
      console.log(error);
    }
  };

  //delete method
  const [Data, setData] = useState("");
  const DeleteDelivarychrg = async () => {
    try {
      const config = {
        url: "admin/Deletedelivarycharge/" + Data,
        method: "delete",
        baseURL: "http://localhost:7013/api/",
        header: { "content-type": "application/json" },
      };
      await axios(config).then((res) => {
        if (res.status === 200) {
          alert("Successfully Delete");
          getAddDelivarychrg();
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
  const [show4, setShow4] = useState();
  const handleClose4 = () => setShow4(false);
  const handleShow4 = (items) => {
    setShow4(true);
    setData1(items);
    setMinimumAmount(items?.MinimumAmount);
    setDelivaryCharge(items?.DelivaryCharge);
  };

  const EditDelivarychrg = async (e) => {
    e.preventDefault();
    try {
      const config = {
        url: "admin/editdelivarycharge",
        method: "put",
        baseURL: "http://localhost:7013/api/",
        header: { "content-type": "multipart/form-data" },
        data: {
          MinimumAmount: MinimumAmount,
          DelivaryCharge: DelivaryCharge,
          id: Data1?._id,
        },
      };
      await axios(config).then((res) => {
        if (res.status === 200) {
          alert("successfully Update");
          handleClose4();
          getAddDelivarychrg();
        }
      });
    } catch (error) {
      console.log(error);
      alert(error.response.data.error);
    }
  };

  useEffect(() => {
    getAddDelivarychrg();
  }, []);

  return (
    <div>
      <div className="customerhead p-2">
        <div className="d-flex justify-content-between align-items-center">
          <h2 className="header-c ">Delivery Charge</h2>
          <div className="d-flex gap-3">
            <div>
              {AddDelivarychrg?.length !== 0 ? (
                ""
              ) : (
                <>
                  <button className="admin-add-btn" onClick={handleShow3}>
                    Add Delivery Charge
                  </button>
                </>
              )}
            </div>
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
                <th>Minimum Amount</th>
                <th>Delivery Charge</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {/* {AddDelivarychrg?.map((items, i) => {
                return( */}
              <tr>
                <td style={{ paddingTop: "20px" }}>Minimum Amount</td>
                <td style={{ paddingTop: "20px" }}>Charge</td>

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
                          handleShow4();
                          // setData1(items);
                        }}
                      />{" "}
                    </div>
                    <div>
                      <AiFillDelete
                        className="text-danger"
                        style={{ cursor: "pointer", fontSize: "20px" }}
                        onClick={() => {
                          handleShow5();
                          // setData(items?._id);
                        }}
                      />
                    </div>
                  </div>
                </td>
              </tr>
              {/* )
              })} */}
            </tbody>
          </Table>
        </div>

        {/* Add  modal  */}
        <Modal show={show3} onHide={handleClose3} style={{ zIndex: "99999" }}>
          <Modal.Header closeButton>
            <Modal.Title>Add Delivery Charge</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="row">
              <div className="do-sear mt-2">
                <label>Add Minimum Amount</label>
                <input
                  type="number"
                  placeholder="Enter Minimum Amount"
                  className="vi_0"
                  // onChange={(e) => setMinimumAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="row">
              <div className="do-sear mt-2">
                <label>Add Delivery Charge</label>
                <input
                  type="number"
                  placeholder="Enter Delivery Charge"
                  className="vi_0"
                  // onChange={(e) => setDelivaryCharge(e.target.value)}
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
                onClick={handleClose3}
              >
                Add
              </Button>
            </div>
          </Modal.Footer>
        </Modal>

        {/* Category Edit Package modal */}
        <Modal
          show={show4}
          onHide={handleClose4}
          backdrop="static"
          keyboard={false}
          style={{ zIndex: "99999" }}
        >
          <Modal.Header closeButton>
            <Modal.Title style={{ color: "black" }}>
              Edit Delivery Charge
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="row">
              <div className="do-sear mt-2">
                <label>Edit Minimum Amount</label>
                <input
                  type="number"
                  className="vi_0"
                  // value={MinimumAmount}
                  // onChange={(e) => setMinimumAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="row">
              <div className="do-sear mt-2">
                <label>Edit Delivery Charge</label>
                <input
                  type="number"
                  className="vi_0"
                  // value={DelivaryCharge}
                  // onChange={(e) => setDelivaryCharge(e.target.value)}
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
            <Button variant="" className="modal-add-btn" onClick={handleClose4}>
              Update
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Delet modal */}
        <Modal
          show={show5}
          onHide={handleClose5}
          backdrop="static"
          keyboard={false}
          style={{ zIndex: "99999" }}
        >
          <Modal.Header closeButton>
            <Modal.Title style={{ color: "green" }}>Warning</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="row">
              <div className="col-md-12">
                <p className="fs-4" style={{ color: "red" }}>
                  Are You Sure?
                  <br /> You Want to Delete This Data?
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
            <Button variant="" className="modal-add-btn" onClick={handleClose5}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default DeliveryCharge;
