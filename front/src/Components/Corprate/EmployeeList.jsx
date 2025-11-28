import React, { useState, useEffect, useContext } from "react";
import {
  Button,
  Modal,
  Table,
  Form,
  InputGroup,
  FormControl,
  Spinner,
} from "react-bootstrap";
import { BsSearch, BsFillPersonFill } from "react-icons/bs";
import { FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";
import * as XLSX from "xlsx";
import moment from "moment";
import ReactPaginate from "react-paginate";
import { WalletContext } from "../../WalletContext";

// CSS for ReactPaginate and custom styles
const customStyles = `
  .paginationBttns {
    display: flex;
    list-style: none;
    padding: 0;
    justify-content: center;
  }
  .paginationBttns li {
    margin: 0 5px;
  }
  .paginationBttns li a {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    color: #007bff;
  }
  .paginationActive a {
    background-color: #007bff;
    color: white;
    border-color: #007bff;
  }
  .paginationDisabled a {
    color: #ccc;
    cursor: not-allowed;
  }
  .previousBttn a, .nextBttn a {
    font-weight: bold;
  }
`;

const EmployeeList = () => {
  //   const { AllWallet, AdminWallet } = useContext(WalletContext);
  const corporate = JSON.parse(window.localStorage.getItem("corporate"));
  // Modal states
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showEditEmployee, setShowEditEmployee] = useState(false);
  const [showDeleteEmployee, setShowDeleteEmployee] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const handleCloseAddEmployee = () => setShowAddEmployee(false);
  const handleShowAddEmployee = () => setShowAddEmployee(true);
  const handleCloseEditEmployee = () => setShowEditEmployee(false);

  const [AllWallet, setAllWallet] = useState([]);

  const getAllWallet = async () => {
    const result = await axios.get(
      `http://localhost:7013/api/wallet/getAllWalletCompsny/${corporate._id}`
    );
    setAllWallet(result.data.data);
  };
  const handleShowEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    setEditEmployee({
      Fname: employee.Fname || "",
      Mobile: employee.Mobile || "",
      employeeId: employee.employeeId || "",
      subsidyAmount: employee.subsidyAmount || 0,
    });
    setShowEditEmployee(true);
  };
  const handleCloseDeleteEmployee = () => setShowDeleteEmployee(false);
  const handleShowDeleteEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowDeleteEmployee(true);
  };
  const handleCloseWalletModal = () => setShowWalletModal(false);

  // Employee data states
  const [employees, setEmployees] = useState([]);
  const [noChangeData, setNoChangeData] = useState([]);
  const [searchH, setSearchH] = useState("");
  const [loading, setLoading] = useState(false);

  // Add/Edit/Delete employee states
  const [newEmployee, setNewEmployee] = useState({
    Fname: "",
    Mobile: "",
    employeeId: "",
    subsidyAmount: 0,
  });
  const [editEmployee, setEditEmployee] = useState({
    Fname: "",
    Mobile: "",
    employeeId: "",
    subsidyAmount: 0,
  });
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [addEmployeeLoading, setAddEmployeeLoading] = useState(false);
  const [editEmployeeLoading, setEditEmployeeLoading] = useState(false);
  const [deleteEmployeeLoading, setDeleteEmployeeLoading] = useState(false);

  // Wallet management states
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [actionType, setActionType] = useState("add");
  const [walletLoading, setWalletLoading] = useState(false);
  const [employeeW, setEmployeeW] = useState("");

  // Pagination states
  const [pageNumber, setPageNumber] = useState(0);
  const employeesPerPage = 6;
  const pagesVisited = pageNumber * employeesPerPage;
  const pageCount = Math.ceil(employees.length / employeesPerPage);

  // Fetch employee data
  const getEmployees = async () => {
    setLoading(true);
    try {
      let res = await axios.get(
        "http://localhost:7013/api/User/getUserByCompany/" + corporate._id
      );
      if (res.status === 200) {
        setEmployees(res.data.success);
        setNoChangeData(res.data.success);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getEmployees();
    // getAllWallet();
  }, []);

  // Add Employee
  const handleAddEmployee = async () => {
    setAddEmployeeLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:7013/api/User/registercustomer",
        {
          Fname: newEmployee.Fname,
          Mobile: newEmployee.Mobile,
          employeeId: newEmployee.employeeId,
          subsidyAmount: Number(newEmployee.subsidyAmount),
          status: "Employee",
          companyId: corporate._id,
          companyName: corporate.Apartmentname,
        }
      );
      if (res.status === 200) {
        alert("Employee added successfully");
        setShowAddEmployee(false);
        setNewEmployee({
          Fname: "",
          Mobile: "",
          employeeId: "",
          subsidyAmount: 0,
        });
        getEmployees();
      }
    } catch (error) {
      console.error("Error adding employee:", error);
      alert(error?.response?.data?.error || "Failed to add employee.");
    } finally {
      setAddEmployeeLoading(false);
    }
  };

  // Edit Employee
  const handleEditEmployee = async () => {
    setEditEmployeeLoading(true);
    try {
      const res = await axios.put(`http://localhost:7013/api/User/updateuser`, {
        Fname: editEmployee.Fname,
        Mobile: editEmployee.Mobile,
        employeeId: editEmployee.employeeId,
        subsidyAmount: Number(editEmployee.subsidyAmount),
        userId: selectedEmployee?._id,
      });
      if (res.status === 200) {
        alert("Employee updated successfully");
        setShowEditEmployee(false);
        setSelectedEmployee(null);
        getEmployees();
      }
    } catch (error) {
      console.error("Error updating employee:", error);
      alert(error?.response?.data?.error || "Failed to update employee.");
    } finally {
      setEditEmployeeLoading(false);
    }
  };

  // Delete Employee
  const handleDeleteEmployee = async () => {
    setDeleteEmployeeLoading(true);
    try {
      const res = await axios.delete(
        `http://localhost:7013/api/User/deleteUser/${selectedEmployee._id}`
      );
      if (res.status === 200) {
        alert("Employee deleted successfully");
        setShowDeleteEmployee(false);
        setSelectedEmployee(null);
        getEmployees();
      }
    } catch (error) {
      console.error("Error deleting employee:", error);
      alert(error?.response?.data?.error || "Failed to delete employee.");
    } finally {
      setDeleteEmployeeLoading(false);
    }
  };

  // Wallet management
  const handleManageWallet = (wallet, type) => {
    const walletData = AllWallet.find(
      (ele) => ele?.userId?._id.toString() === wallet?.toString()
    );
    setEmployeeW(wallet);
    setSelectedWallet(walletData);
    setActionType(type);
    setAmount(0);
    setDescription("");
    setExpiryDate("");
    setShowWalletModal(true);
  };

  const handleSubmitWallet = async () => {
    setWalletLoading(true);
    try {
      await axios.post(
        actionType === "add"
          ? "http://localhost:7013/api/wallet/add-free-cash"
          : "http://localhost:7013/api/wallet/deduct-cash",
        {
          userId: employeeW,
          amount: Number(amount),
          description,
          companyId: corporate._id,
          expiryDays: actionType === "add" ? expiryDate : null,
        }
      );
      if (actionType === "add") {
        setShowWalletModal(false);
        getAllWallet();
        alert("Free cash added successfully");
      }

      //   AdminWallet();
    } catch (error) {
      console.error("Error updating wallet:", error);
      alert("Failed to update wallet.");
    } finally {
      setWalletLoading(false);
    }
  };

  // Search filter
  const handleFilterH = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearchH(searchTerm);
    setPageNumber(0);
    if (searchTerm) {
      const filteredData = noChangeData.filter((employee) => {
        const Fname = employee.Fname
          ? String(employee.Fname).toLowerCase()
          : "";
        const Mobile = employee.Mobile
          ? String(employee.Mobile).toLowerCase()
          : "";
        const employeeId = employee.employeeId
          ? String(employee.employeeId).toLowerCase()
          : "";
        return (
          Fname.includes(searchTerm) ||
          Mobile.includes(searchTerm) ||
          employeeId.includes(searchTerm)
        );
      });
      setEmployees(filteredData);
    } else {
      setEmployees(noChangeData);
    }
  };

  // Export Excel
  const handleExportExcel = () => {
    const customHeaders = noChangeData.map((item) => ({
      "Registered Date": moment(item.updatedAt).format("MM/DD/YYYY, hh:mm A"),
      "Employee ID": item.employeeId || "N/A",
      Name: item.Fname || "N/A",
      "Phone Number": item.Mobile ? String(item.Mobile) : "N/A",
      "Daily Subsidy Amount": item.subsidyAmount
        ? `₹${item.subsidyAmount.toFixed(2)}`
        : "₹0.00",
      // "Wallet Balance": "₹"+ AllWallet.find((w) => w?.userId?._id.toString() === item?._id.toString())?.balance || "0.00",
    }));

    const worksheet = XLSX.utils.json_to_sheet(customHeaders);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employee List");
    XLSX.writeFile(
      workbook,
      `EmployeeList_${moment().format("YYYYMMDD")}.xlsx`
    );
  };

  // Pagination
  const changePage = ({ selected }) => {
    setPageNumber(selected);
  };

  return (
    <div className="container mt-5">
      <style>{customStyles}</style>

      <h2 className="header-c">Employee List</h2>

      {/* Filters */}
      <div className="d-flex flex-wrap  mb-4 justify-content-between">
        <InputGroup style={{ maxWidth: "300px" }}>
          <InputGroup.Text>
            <BsSearch />
          </InputGroup.Text>
          <FormControl
            type="text"
            placeholder="Search by Name, Phone, or Employee ID..."
            value={searchH}
            onChange={handleFilterH}
          />
        </InputGroup>
        <div className="d-flex gap-2">
          <Button variant="success" onClick={handleExportExcel}>
            Export Excel
          </Button>
          <Button variant="info" onClick={handleShowAddEmployee}>
            Add Employee
          </Button>
        </div>
      </div>

      {/* Employee Table */}
      <Table responsive bordered hover className="shadow-sm">
        <thead className="table-dark">
          <tr>
            <th>SL.NO</th>
            <th>Employee ID</th>
            <th>Name</th>
            <th>Phone Number</th>
            <th>Daily Subsidy Amount</th>

            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={7} className="text-center">
                <Spinner animation="border" variant="primary" />
              </td>
            </tr>
          ) : employees?.length > 0 ? (
            employees
              .slice(pagesVisited, pagesVisited + employeesPerPage)
              .map((item, i) => (
                <tr key={item._id}>
                  <td>{i + 1 + pagesVisited}</td>
                  <td>{item?.employeeId || "N/A"}</td>
                  <td>{item?.Fname || "N/A"}</td>
                  <td>{item?.Mobile ? String(item.Mobile) : "N/A"}</td>
                  <td>
                    ₹
                    {item?.subsidyAmount
                      ? item.subsidyAmount.toFixed(2)
                      : "0.00"}
                  </td>

                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleShowEditEmployee(item)}
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleShowDeleteEmployee(item)}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))
          ) : (
            <tr>
              <td colSpan={7} className="text-center text-muted">
                No employees found.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Pagination */}
      <div className="d-flex align-items-center justify-content-between mt-3">
        <p>Total Count: {employees?.length}</p>
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

      {/* Add Employee Modal */}
      <Modal
        show={showAddEmployee}
        onHide={handleCloseAddEmployee}
        centered
        className="animate__animated animate__fadeIn"
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="text-primary">Add New Employee</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                value={newEmployee.Fname}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, Fname: e.target.value })
                }
                placeholder="Enter full name"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="tel"
                value={newEmployee.Mobile}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, Mobile: e.target.value })
                }
                placeholder="Enter phone number"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Employee ID</Form.Label>
              <Form.Control
                type="text"
                value={newEmployee.employeeId}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, employeeId: e.target.value })
                }
                placeholder="Enter employee ID"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Daily Subsidy Amount (₹)</Form.Label>
              <Form.Control
                type="number"
                min="0"
                step="0.01"
                value={newEmployee.subsidyAmount}
                onChange={(e) =>
                  setNewEmployee({
                    ...newEmployee,
                    subsidyAmount: e.target.value,
                  })
                }
                placeholder="Enter daily subsidy amount"
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleCloseAddEmployee}
            disabled={addEmployeeLoading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAddEmployee}
            disabled={addEmployeeLoading}
          >
            {addEmployeeLoading ? <Spinner size="sm" /> : "Add Employee"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Employee Modal */}
      <Modal
        show={showEditEmployee}
        onHide={handleCloseEditEmployee}
        centered
        className="animate__animated animate__fadeIn"
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="text-primary">Edit Employee</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                value={editEmployee.Fname}
                onChange={(e) =>
                  setEditEmployee({ ...editEmployee, Fname: e.target.value })
                }
                placeholder="Enter full name"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="tel"
                value={editEmployee.Mobile}
                onChange={(e) =>
                  setEditEmployee({ ...editEmployee, Mobile: e.target.value })
                }
                placeholder="Enter phone number"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Employee ID</Form.Label>
              <Form.Control
                type="text"
                value={editEmployee.employeeId}
                onChange={(e) =>
                  setEditEmployee({
                    ...editEmployee,
                    employeeId: e.target.value,
                  })
                }
                placeholder="Enter employee ID"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Daily Subsidy Amount (₹)</Form.Label>
              <Form.Control
                type="number"
                min="0"
                step="0.01"
                value={editEmployee.subsidyAmount}
                onChange={(e) =>
                  setEditEmployee({
                    ...editEmployee,
                    subsidyAmount: e.target.value,
                  })
                }
                placeholder="Enter daily subsidy amount"
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleCloseEditEmployee}
            disabled={editEmployeeLoading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleEditEmployee}
            disabled={editEmployeeLoading}
          >
            {editEmployeeLoading ? <Spinner size="sm" /> : "Save Changes"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Employee Modal */}
      <Modal
        show={showDeleteEmployee}
        onHide={handleCloseDeleteEmployee}
        centered
        className="animate__animated animate__fadeIn"
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="text-danger">Delete Employee</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="fs-4" style={{ color: "red" }}>
            Are you sure you want to delete {selectedEmployee?.Fname} (ID:{" "}
            {selectedEmployee?.employeeId})?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleCloseDeleteEmployee}
            disabled={deleteEmployeeLoading}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteEmployee}
            disabled={deleteEmployeeLoading}
          >
            {deleteEmployeeLoading ? <Spinner size="sm" /> : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Wallet Management Modal */}
      <Modal
        show={showWalletModal}
        onHide={handleCloseWalletModal}
        centered
        className="animate__animated animate__fadeIn"
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title
            className={actionType === "add" ? "text-success" : "text-danger"}
          >
            {actionType === "add" ? "Add Bonus" : "Deduct Amount"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <strong>Employee:</strong>{" "}
            {selectedWallet?.employeeId?.Fname || "Unknown"}
          </p>
          <p>
            <strong>Current Balance:</strong> ₹
            {selectedWallet?.balance?.toFixed(2) || "0.00"}
          </p>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description"
              />
            </Form.Group>
            {actionType === "add" && (
              <Form.Group className="mb-3">
                <Form.Label>Expiry Date</Form.Label>
                <Form.Control
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </Form.Group>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleCloseWalletModal}
            disabled={walletLoading}
          >
            Cancel
          </Button>
          <Button
            variant={actionType === "add" ? "success" : "danger"}
            onClick={handleSubmitWallet}
            disabled={walletLoading}
          >
            {walletLoading ? (
              <Spinner size="sm" />
            ) : actionType === "add" ? (
              "Add Bonus"
            ) : (
              "Deduct Amount"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EmployeeList;
