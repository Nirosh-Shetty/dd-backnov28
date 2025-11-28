import React, { useState } from "react";
import { Card, Table, Button, Form, Row, Col, Badge } from "react-bootstrap";
import { FaSearch, FaFilter, FaDownload, FaUser, FaUtensils, FaCheckCircle, FaClock, FaTimesCircle, FaListAlt, FaCommentDots } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Admin.css"; 

const AdminPlanDashboard = () => {
  const [activeView, setActiveView] = useState("sales"); // 'sales' or 'orders'
  const [startDate, setStartDate] = useState(new Date());
  const [selectedSession, setSelectedSession] = useState("Lunch");
  const [selectedHub, setSelectedHub] = useState("All Hubs");

  // --- DUMMY DATA: SALES TRACKER ---
  const dummySalesData = [
    {
      id: 1,
      foodName: "Chicken Ghee Roast",
      hub: "Manyata Tech Park",
      totalReserved: 50,
      confirmed: 30,
      pending: 15,
      skipped: 5,
      basePrice: 120,
      hubPrice: 100, 
      preOrderPrice: 90, 
    },
    {
      id: 2,
      foodName: "Chapati",
      hub: "Manyata Tech Park",
      totalReserved: 100,
      confirmed: 80,
      pending: 10,
      skipped: 10,
      basePrice: 20,
      hubPrice: 15,
      preOrderPrice: 12,
    },
    {
      id: 3,
      foodName: "Dal Fry",
      hub: "Hebbal",
      totalReserved: 60,
      confirmed: 20,
      pending: 35,
      skipped: 5,
      basePrice: 80,
      hubPrice: 70,
      preOrderPrice: 60,
    },
  ];

  // --- DUMMY DATA: ORDERS TRACKER ---
  const dummyOrdersData = [
    {
      id: 101,
      customerName: "Rahul Kumar",
      contact: "9876543210",
      items: "Chicken Ghee Roast x2, Chapati x4",
      value: 228,
      status: "Confirmed",
      session: "Lunch",
      hub: "Manyata Tech Park",
      date: "2024-11-12",
    },
    {
      id: 102,
      customerName: "Sneha Reddy",
      contact: "9123456789",
      items: "Dal Fry x1, Chapati x3",
      value: 96,
      status: "Pending Payment",
      session: "Lunch",
      hub: "Hebbal",
      date: "2024-11-12",
    },
    {
      id: 103,
      customerName: "Amit Shah",
      contact: "8888888888",
      items: "Chicken Ghee Roast x1",
      value: 90,
      status: "Skipped",
      session: "Dinner",
      hub: "Manyata Tech Park",
      date: "2024-11-12",
    },
     {
      id: 104,
      customerName: "John Doe",
      contact: "7777777777",
      items: "Chapati x10",
      value: 120,
      status: "Cancelled",
      session: "Lunch",
      hub: "Hebbal",
      date: "2024-11-12",
    },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case "Confirmed": return "success";
      case "Pending Payment": return "warning";
      case "Skipped": return "secondary";
      case "Cancelled": return "danger";
      default: return "primary";
    }
  };

  const totalOrders = dummyOrdersData.length;
  const confirmedOrders = dummyOrdersData.filter(o => o.status === "Confirmed").length;
  const pendingOrders = dummyOrdersData.filter(o => o.status === "Pending Payment").length;
  const cancelledOrders = dummyOrdersData.filter(o => o.status === "Skipped" || o.status === "Cancelled").length;

  const handleSendReminders = () => {
      if(window.confirm(`Send WhatsApp reminder to ${pendingOrders} pending customers?`)) {
          alert("Reminders sent successfully!");
      }
  };

  return (
    <div className="container-fluid p-4" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      
      {/* --- HEADER & TOGGLE SWITCH --- */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
            <h2 style={{ color: "#4b5563", fontWeight: "800", margin: 0 }}>
            My Plan Management
            </h2>
            <p className="text-muted mb-0">Track future reservations and sales</p>
        </div>
        
        <div className="bg-white p-1 rounded-pill shadow-sm border d-flex">
            <Button 
                variant={activeView === 'sales' ? 'success' : 'light'} 
                className={`rounded-pill px-4 fw-bold ${activeView === 'sales' ? '' : 'text-muted'}`}
                onClick={() => setActiveView('sales')}
                style={{minWidth: '160px'}}
            >
                <FaUtensils className="me-2"/> Sales Tracker
            </Button>
            <Button 
                variant={activeView === 'orders' ? 'success' : 'light'} 
                className={`rounded-pill px-4 fw-bold ${activeView === 'orders' ? '' : 'text-muted'}`}
                onClick={() => setActiveView('orders')}
                 style={{minWidth: '160px'}}
            >
                <FaListAlt className="me-2"/> Orders Tracker
            </Button>
        </div>
      </div>

      {/* --- COMMON FILTERS --- */}
      {/* Z-Index fix applied to this Card to ensure dropdowns float ABOVE the tables */}
      <Card className="shadow-sm border-0 mb-4" style={{ overflow: 'visible', zIndex: 10 }}> 
        <Card.Body className="py-3">
            <div className="row g-3 align-items-end">
                <div className="col-md-3">
                    <label className="small fw-bold text-muted mb-1">Select Date</label>
                    {/* Fixed Strategy prevents datepicker from being hidden */}
                    <DatePicker 
                        selected={startDate} 
                        onChange={(date) => setStartDate(date)} 
                        className="form-control"
                        popperProps={{ strategy: "fixed" }} 
                    />
                </div>
                <div className="col-md-3">
                    <label className="small fw-bold text-muted mb-1">Select Session</label>
                    <Form.Select value={selectedSession} onChange={(e)=>setSelectedSession(e.target.value)}>
                        <option>Lunch</option>
                        <option>Dinner</option>
                    </Form.Select>
                </div>
                <div className="col-md-3">
                    <label className="small fw-bold text-muted mb-1">Select Hub</label>
                    <Form.Select value={selectedHub} onChange={(e)=>setSelectedHub(e.target.value)}>
                        <option>All Hubs</option>
                        <option>Manyata Tech Park</option>
                        <option>Hebbal</option>
                    </Form.Select>
                </div>
                <div className="col-md-3 text-end">
                    <Button variant="outline-success" className="fw-bold">
                        <FaDownload className="me-2"/> Export Report
                    </Button>
                </div>
            </div>
        </Card.Body>
      </Card>

      {/* ========================================== */}
      {/* VIEW 1: PLANNED SALES TRACKER (Product Focus) */}
      {/* ========================================== */}
      {activeView === 'sales' && (
        <Card className="shadow-sm border-0">
            <Card.Header className="bg-white py-3 border-bottom">
                <h5 className="m-0 fw-bold text-dark">Item Sales Performance</h5>
            </Card.Header>
            <Card.Body className="p-0">
                <Table hover responsive className="m-0 align-middle text-nowrap">
                    <thead className="bg-light text-uppercase small text-muted">
                        <tr>
                            <th className="py-3 ps-4">Item Name</th>
                            <th>Hub</th>
                            <th className="text-center">Total Rsrvd</th>
                            <th className="text-center">Confirmed</th>
                            <th className="text-center">Pending</th>
                            <th className="text-center">Skipped</th>
                            {/* Price Columns */}
                            <th className="text-center bg-light border-start">Base ₹</th>
                            <th className="text-center bg-light">Hub ₹</th>
                            <th className="text-center bg-warning bg-opacity-10 text-dark">Pre-Order ₹</th>
                            {/* Value Columns */}
                            <th className="text-end border-start">Est. Sales Value</th>
                            <th className="text-end pe-4 text-success">Achieved Sales</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dummySalesData.map((item) => {
                            const salesValue = item.preOrderPrice * item.totalReserved;
                            const achievedSales = item.preOrderPrice * item.confirmed;
                            
                            return (
                                <tr key={item.id}>
                                    <td className="ps-4 fw-bold text-dark">{item.foodName}</td>
                                    <td className="text-muted small">{item.hub}</td>
                                    <td className="text-center fw-bold bg-light">{item.totalReserved}</td>
                                    <td className="text-center text-success fw-bold">{item.confirmed}</td>
                                    <td className="text-center text-warning fw-bold">{item.pending}</td>
                                    <td className="text-center text-danger">{item.skipped}</td>
                                    
                                    <td className="text-center border-start text-muted">{item.basePrice}</td>
                                    <td className="text-center text-muted">{item.hubPrice}</td>
                                    <td className="text-center fw-bold bg-warning bg-opacity-10">{item.preOrderPrice}</td>
                                    
                                    <td className="text-end border-start text-muted">₹{salesValue.toLocaleString()}</td>
                                    <td className="text-end pe-4 fw-bolder text-success">₹{achievedSales.toLocaleString()}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </Table>
            </Card.Body>
        </Card>
      )}

      {/* ========================================== */}
      {/* VIEW 2: PLANNED ORDERS TRACKER (User Focus) */}
      {/* ========================================== */}
      {activeView === 'orders' && (
        <>
            {/* KPI BOXES */}
            <div className="row g-3 mb-4">
                <div className="col-md-3">
                    <Card className="border-0 shadow-sm border-start border-4 border-primary p-3">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <div className="text-muted small fw-bold text-uppercase">Total Orders</div>
                                <h3 className="fw-bold text-dark mb-0">{totalOrders}</h3>
                            </div>
                            <div className="bg-primary bg-opacity-10 p-3 rounded-circle-no-border text-primary">
                                <FaListAlt size={24} />
                            </div>
                        </div>
                    </Card>
                </div>
                <div className="col-md-3">
                    <Card className="border-0 shadow-sm border-start border-4 border-success p-3">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <div className="text-muted small fw-bold text-uppercase">Confirmed</div>
                                <h3 className="fw-bold text-success mb-0">{confirmedOrders}</h3>
                            </div>
                            <div className="bg-success bg-opacity-10 p-3 rounded-circle-no-border text-success">
                                <FaCheckCircle size={24} />
                            </div>
                        </div>
                    </Card>
                </div>
                <div className="col-md-3">
                    <Card className="border-0 shadow-sm border-start border-4 border-warning p-3">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <div className="text-muted small fw-bold text-uppercase">Yet to Confirm</div>
                                <h3 className="fw-bold text-warning mb-0">{pendingOrders}</h3>
                            </div>
                            <div className="bg-warning bg-opacity-10 p-3 rounded-circle-no-border text-warning">
                                <FaClock size={24} />
                            </div>
                        </div>
                    </Card>
                </div>
                <div className="col-md-3">
                    <Card className="border-0 shadow-sm border-start border-4 border-danger p-3">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <div className="text-muted small fw-bold text-uppercase">Skip / Cancel</div>
                                <h3 className="fw-bold text-danger mb-0">{cancelledOrders}</h3>
                            </div>
                            <div className="bg-danger bg-opacity-10 p-3 rounded-circle-no-border text-danger">
                                <FaTimesCircle size={24} />
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* ORDERS TABLE */}
            <Card className="shadow-sm border-0">
                 <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div className="d-flex align-items-center gap-3">
                        <h5 className="m-0 fw-bold text-dark">Customer Orders</h5>
                        <div className="input-group" style={{maxWidth: '300px'}}>
                            <span className="input-group-text bg-light border-end-0"><FaSearch className="text-muted"/></span>
                            <Form.Control placeholder="Search customer..." className="border-start-0 bg-light shadow-none" />
                        </div>
                    </div>

                    {/* --- NEW ACTION BUTTON --- */}
                    {pendingOrders > 0 && (
                        <Button 
                            variant="warning" 
                            className="text-dark fw-bold shadow-sm"
                            onClick={handleSendReminders}
                        >
                            <FaCommentDots className="me-2"/> 
                            Send Reminder to {pendingOrders} Pending
                        </Button>
                    )}
                    {/* ------------------------- */}

                </Card.Header>
                <Card.Body className="p-0">
                    <Table hover responsive className="m-0 align-middle">
                        <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="py-3 ps-4">Customer Name</th>
                                <th>Contact</th>
                                <th>Items</th>
                                <th>Total Value</th>
                                <th>Status</th>
                                <th>Session</th>
                                <th>Hub</th>
                                <th className="pe-4 text-end">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dummyOrdersData.map((order) => (
                                <tr key={order.id}>
                                    <td className="ps-4 fw-bold text-dark">{order.customerName}</td>
                                    <td>{order.contact}</td>
                                    <td style={{maxWidth: '250px'}} title={order.items}>
                                        <small className="text-dark bg-light px-2 py-1 rounded border">
                                            {order.items}
                                        </small>
                                    </td>
                                    <td className="fw-bold">₹{order.value}</td>
                                    <td>
                                        <Badge bg={getStatusBadge(order.status)} pill className="px-3">
                                            {order.status}
                                        </Badge>
                                    </td>
                                    <td>{order.session}</td>
                                    <td>{order.hub}</td>
                                    <td className="text-end pe-4 text-muted">{order.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </>
      )}
    </div>
  );
};

export default AdminPlanDashboard;