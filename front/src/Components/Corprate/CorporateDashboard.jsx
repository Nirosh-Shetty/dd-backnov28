import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import {
  FaHome,
  FaBox,
  FaUsers,
  FaChartLine,
  FaUser,
  FaSignOutAlt,
  FaBars,
  FaDollarSign,
} from "react-icons/fa";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function CorporateDashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    activeEmployees: 0,
    customerSatisfaction: 0,
  });

  const [userProfile, setUserProfile] = useState({
    name: "",
    mobile: "",
    company: "",
    role: "",
  });

  const [corporateAddress, setCorporateAddress] = useState({
    Apartmentname: "",
    Address: "",
    pincode: 0,
    apartmentdelivaryprice: 0,
    approximatetime: "",
    prefixcode: "",
    mobile: 0,
    logo: "",
    otp: 0,
    status: true,
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const corporate = JSON.parse(window.localStorage.getItem("corporate"));
        if (!corporate) {
          toast.error("Please log in to access the dashboard");
          return;
        }

        const mockDashboardData = {
          totalOrders: 1250,
          totalRevenue: 45000,
          activeEmployees: 45,
          customerSatisfaction: 92,
        };

        const mockProfileData = {
          name: corporate.Apartmentname || "John Doe",
          mobile: corporate.mobile || "john.doe@company.com",
          company: corporate.company || "DailyDish",
          role: corporate.role || "Food Service",
          ...corporate,
        };

        const mockAddressData = {
          Apartmentname: "Corporate HQ",
          Address: "123 Business Avenue, Suite 100",
          pincode: 123456,
          apartmentdelivaryprice: 5.99,
          approximatetime: "30 mins",
          prefixcode: "CORP",
          mobile: 1234567890,
          logo: "../Assets/corporate_logo.jpeg",
          otp: 1234,
          status: true,
        };

        setDashboardData(mockDashboardData);
        setUserProfile(mockProfileData);
        setCorporateAddress(mockAddressData);
        toast.success("Dashboard loaded successfully");
      } catch (error) {
        toast.error(error.response?.data?.error || "Failed to load dashboard");
        console.log(error);
      }
    };

    fetchData();
  }, [navigate]);

  const corporate = JSON.parse(localStorage.getItem("corporate"));
  const [orderList, setOrderList] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Orders",
        data: [],
        borderColor: "#F81E0F",
        backgroundColor: "rgba(248, 30, 15, 0.1)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#F81E0F",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "#F81E0F",
      },
    ],
  });

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top", labels: { font: { size: 14 } } },
      title: { display: true, text: "Orders Trends ", font: { size: 18 } },
      tooltip: { enabled: true, mode: "index", intersect: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Number of Orders" },
      },
      x: { title: { display: true, text: "Month" } },
    },
    hover: { mode: "nearest", intersect: true },
  };

  const getOrders = async () => {
    try {
      let res = await axios.get(
        `http://localhost:7013/api/admin/getAllOrdersByCompanyId/${corporate?._id}`
      );
      if (res.status === 200) {
        const corporateOrders = res.data.orders;
        setOrderList(corporateOrders);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getAllEmployees = async () => {
    try {
      let res = await axios.get(
        `http://localhost:7013/api/User/getUserByCompany/${corporate?._id}`
      );
      if (res.status === 200) {
        setEmployees(res.data.success);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Process orders to create chart data
  useEffect(() => {
    const processChartData = () => {
      // Assuming each order has a `createdAt` field with a date
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const orderCounts = new Array(12).fill(0); // Array to store order counts for each month

      orderList.forEach((order) => {
        const date = new Date(order.createdAt); // Adjust based on your order date field
        const month = date.getMonth(); // 0 = Jan, 11 = Dec
        orderCounts[month]++;
      });

      // Filter out months with no orders and create labels and data
      const labels = [];
      const data = [];
      orderCounts.forEach((count, index) => {
        if (count > 0) {
          labels.push(monthNames[index]);
          data.push(count);
        }
      });

      setChartData({
        labels,
        datasets: [
          {
            label: "Orders",
            data,
            borderColor: "#F81E0F",
            backgroundColor: "rgba(248, 30, 15, 0.1)",
            fill: true,
            tension: 0.4,
            pointBackgroundColor: "#F81E0F",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "#F81E0F",
          },
        ],
      });
    };

    if (orderList.length > 0) {
      processChartData();
    }
  }, [orderList]);

  useEffect(() => {
    getOrders();
    getAllEmployees();
  }, []);

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={true}
        closeOnClick
        draggable
      />
      <style>
        {`
          :root {
            --bs-primary: #F81E0F;
            --bs-primary-rgb: 248, 30, 15;
            --bs-primary-dark: #D9180D;
            --bs-secondary: #FF4C3B;
            --bs-secondary-rgb: 255, 76, 59;
          }
         
          .content {
            
            padding: 20px;
            background: linear-gradient(135deg, #f8f9fa, #ffffff);
            min-height: 100vh;
            transition: margin-left 0.3s ease;
          }
          .btn-primary {
            background: linear-gradient(90deg, var(--bs-primary), var(--bs-secondary));
            border: none;
          }
          .btn-primary:hover {
            background: linear-gradient(90deg, var(--bs-primary-dark), #E04334);
          }
          .card {
            border: none;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          @media (max-width: 768px) {
          
        
            .sidebar-toggle {
              display: block;
            }
          }
          @media (min-width: 769px) {
            .sidebar {
              left: 0;
            }
         
            .sidebar-toggle {
              display: none;
            }
          }
        `}
      </style>
      <div className="d-flex">
        <div className="content">
          <div className="container-fluid">
            <div className="card mb-4">
              <div className="card-body p-5 text-center">
                {userProfile?.logo && (
                  <img
                    src={userProfile?.logo}
                    alt="DailyDish Logo"
                    className="img-fluid mb-4"
                    style={{
                      maxWidth: "150px",
                      height: "auto",
                      objectFit: "contain",
                      borderRadius: "10px",
                    }}
                    onError={(e) =>
                      (e.target.src =
                        "https://via.placeholder.com/150?text=Logo")
                    }
                  />
                )}

                <h2 className="fw-bold text-dark display-5">
                  Corporate Dashboard
                </h2>
              </div>
            </div>

            <div className="card mb-4">
              <div className="card-body p-4">
                <h4 className="fw-bold mb-3">Profile</h4>
                <div className="row g-3">
                  <div className="col-md-6">
                    <p>
                      <strong>Company Name:</strong> {userProfile?.name}
                    </p>
                    <p>
                      <strong>Mobile:</strong> {userProfile?.mobile}
                    </p>
                    <p>
                      <strong>Partner With:</strong> {userProfile?.company}
                    </p>
                    <p>
                      <strong>Service Type:</strong> {userProfile?.role}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p>
                      <strong>Address:</strong> {userProfile?.Address}
                    </p>
                    <p>
                      <strong>Pincode:</strong> {userProfile?.pincode}
                    </p>
                    <p>
                      <strong>Prefixcode:</strong> {userProfile?.prefixcode}
                    </p>
                    <p>
                      <strong>DailyDish for delivery time:</strong>{" "}
                      {userProfile?.approximatetime} min
                    </p>
                  </div>
                  {/* <div className="col-12 text-center">
                    <button
                      className="btn btn-primary px-4 py-2"
                      onClick={() => toast.info("Edit profile functionality coming soon!")}
                    >
                      Edit Profile
                    </button>
                  </div> */}
                </div>
              </div>
            </div>

            <div className="row g-4">
              <div className="col-md-3 col-sm-6">
                <div className="card h-100">
                  <div className="card-body text-center">
                    <FaBox
                      className="text-primary mb-3"
                      style={{ fontSize: "2rem" }}
                    />
                    <h5 className="card-title fw-bold">Total Orders</h5>
                    <p className="card-text display-6">{orderList?.length}</p>
                  </div>
                </div>
              </div>
              {/* <div className="col-md-3 col-sm-6">
                <div className="card h-100">
                  <div className="card-body text-center">
                   
                    <span className="text-primary mb-3" style={{ fontSize: '2rem' }}>₹</span>
                    <h5 className="card-title fw-bold">Revenue</h5>
                    <p className="card-text display-6">₹{dashboardData.totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </div> */}
              <div className="col-md-3 col-sm-6">
                <div className="card h-100">
                  <div className="card-body text-center">
                    <FaUsers
                      className="text-primary mb-3"
                      style={{ fontSize: "2rem" }}
                    />
                    <h5 className="card-title fw-bold"> Employees</h5>
                    <p className="card-text display-6">{employees?.length}</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3 col-sm-6">
                <div className="card h-100">
                  <div className="card-body text-center">
                    <FaChartLine
                      className="text-primary mb-3"
                      style={{ fontSize: "2rem" }}
                    />
                    <h5 className="card-title fw-bold">Satisfaction</h5>
                    <p className="card-text display-6">
                      {dashboardData.customerSatisfaction}%
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-12">
                <div className="card">
                  <div className="card-body">
                    <Line data={chartData} options={chartOptions} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CorporateDashboard;
