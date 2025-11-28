import React, { useEffect, useState } from "react";
import "../Admin/Admin.css";
import Card from "react-bootstrap/Card";
import { Button, Form, Modal, Pagination, Table } from "react-bootstrap";
import { AiFillDelete, AiFillEye } from "react-icons/ai";
import { BsSearch } from "react-icons/bs";
import axios from "axios";
import moment from "moment";
import { Navigate, useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [ApartmentOrder, setApartmentOrder] = useState({});
  const getApartmentOrder = async () => {
    try {
      let res = await axios.get(
        "http://localhost:7013/api/admin/getAllOrderCount"
      );
      if (res.status === 200) {
        setApartmentOrder(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getApartmentOrder();
  }, []);
  //integrating get  method corporate

  const navigate = useNavigate();
  const [show2, setShow2] = useState();
  const handleClose2 = () => setShow2(false);
  const handleShow2 = () => setShow2(true);

  const [show4, setShow4] = useState();
  const handleClose4 = () => setShow4(false);
  const handleShow4 = () => setShow4(true);

  //User list get method Integration
  const [Adduser, setAdduser] = useState([]);
  const getAdduser = async () => {
    try {
      let res = await axios.get("http://localhost:7013/api/User/registeruser");
      if (res.status === 200) {
        setAdduser(res.data.success.reverse());
      }
    } catch (error) {
      console.log(error);
    }
  };

  // useEffect(() => {
  //   getAdduser();
  // }, []);

  return (
    <div>
      <h2 className="header-c ">Dashboard</h2>

      <div className="cards-container">
        <Card
          onClick={() => navigate("/user-list")}
          style={{
            width: "15rem",
            cursor: "pointer",
            height: "120px",
            padding: "20px",
            boxShadow: "1px 0px 10px 1px black",
            borderRadius: "10px",
          }}
        >
          <Card.Body>
            <Card.Title>Registered Users</Card.Title>
            <Card.Subtitle className="mb-2 text-muted">
              {ApartmentOrder?.user}
            </Card.Subtitle>
          </Card.Body>
        </Card>

        <Card
          onClick={() => navigate("/apartment-booking-list")}
          style={{
            width: "15rem",
            cursor: "pointer",
            height: "120px",
            padding: "20px",
            boxShadow: "1px 0px 10px 1px black",
            borderRadius: "10px",
          }}
        >
          <Card.Body>
            <Card.Title>Apartment Orders</Card.Title>
            {/* filter(( e) => PackageName == AddBookinglist ) */}
            <Card.Subtitle className="mb-2 text-muted">
              {ApartmentOrder?.apartment}
            </Card.Subtitle>
          </Card.Body>
        </Card>

        <Card
          onClick={() => navigate("/corporate-booking-list")}
          style={{
            width: "15rem",
            cursor: "pointer",
            height: "120px",
            padding: "20px",
            boxShadow: "1px 0px 10px 1px black",
            borderRadius: "10px",
          }}
        >
          <Card.Body>
            <Card.Title>Corporate Orders</Card.Title>
            <Card.Subtitle className="mb-2 text-muted">
              {ApartmentOrder?.corporate}
            </Card.Subtitle>
          </Card.Body>
        </Card>
      </div>

      <div>
        {/* <h2 className="header-c ">User List</h2> */}

        {/* <div className="srch-icon">
          <div>
            <div class="input-group ">
              <span class="input-group-text" id="basic-addon1">
                <BsSearch />
              </span>
              <input
                type="text"
                class="form-control"
                placeholder="Search..."
                aria-describedby="basic-addon1"
              />
            </div>
          </div>

          <div>
            <Button variant="" className="admin-add-btn">
              <a
                style={{ color: "white", textDecoration: "none" }}
                href="/userlist"
              >
                View All Users
              </a>
            </Button>
          </div>
        </div> */}
        {/* <div className="mb-3">
          <Table responsive bordered>
            <thead>
              <tr>
                <th>S.No</th>
                <th>
                  <div>Registration ID</div>
                </th>
                <th>
                  <div>Name</div>
                </th>
                <th>
                  <div>Registration Date</div>
                </th>
                <th>
                  <div>Mobile Number</div>
                </th>
                <th>
                  <div>Email Id</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {records?.map((item, i) => {
                const serialNumber = i + 1; return (
                  <tr key={i}>
                    <td>{serialNumber}</td>
                    <td style={{ paddingTop: "20px" }}>{item.UName}</td>
                    <td style={{ paddingTop: "20px" }}>{item.UPhone}</td>
                    <td style={{ paddingTop: "20px" }}>{item.UEmail}</td>
                    <td style={{ paddingTop: "20px" }}>{item.UAddress}</td>
                    <div>
                      <AiFillDelete
                        className="text-danger"
                        style={{ cursor: "pointer", fontSize: "20px" }}
                        onClick={() => {
                          handleShow4();
                          setData(item)
                        }}

                      />
                    </div>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div> */}

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
              // onClick={Deleteuserlist}
            >
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      </div>

      <div></div>
    </div>
  );
};

export default Dashboard;
