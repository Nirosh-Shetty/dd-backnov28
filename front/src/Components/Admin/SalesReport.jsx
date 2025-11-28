import { useState, useEffect, useRef } from "react";
import {
  Button,
  Table,
  Form,
  InputGroup,
  Card,
  Spinner,
  Dropdown,
  Row, // Added Row
  Col, // Added Col
} from "react-bootstrap";
import { BsSearch, BsArrowBarDown } from "react-icons/bs";
import { AiOutlineExport } from "react-icons/ai";
import axios from "axios";
import * as XLSX from "xlsx";
import moment from "moment";
import "../../Styles/SalesReport.css";

const SalesReport = () => {
  // State declarations
  // const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState(moment().format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(moment().format("YYYY-MM-DD"));
  const [sortOrder, setSortOrder] = useState("desc");
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hubs, setHubs] = useState([]);
  const [locationData, setLocationData] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectHub, setSelectHub] = useState({});
  const dropdownRef = useRef(null);

  // --- CHANGE 1: Rename state from selectedSlot to selectedSession ---
  const [selectedSession, setSelectedSession] = useState("All");

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // const handleLocationToggle = (location) => {
  //   setSelectedLocations((prev) => {
  //     if (prev.includes(location)) {
  //       return prev.filter((loc) => loc !== location);
  //     } else {
  //       return [...prev, location];
  //     }
  //   });
  // };

  // const handleSelectAll = () => {
  //   if (selectedLocations.length === locationData.length) {
  //     setSelectedLocations([]);
  //   } else {
  //     setSelectedLocations([...locationData]);
  //   }
  // };

  // const getProducts = async () => {
  //   setLoading(true);
  //   try {
  //     const res = await axios.get(
  //       "http://localhost:7013/api/admin/getFoodItems"
  //     );
  //     if (res.status === 200) {
  //       setProducts(res.data.data);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching products:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const getSalesReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      // send precise ISO timestamps (start/end of day) to avoid timezone ambiguity
      if (startDate)
        params.append(
          "startDate",
          moment(startDate).startOf("day").toISOString()
        );
      if (endDate)
        params.append("endDate", moment(endDate).endOf("day").toISOString());
      if (Object.keys(selectHub).length > 0)
        params.append("hubId", selectHub.hubId);
      if (locationData.length > 0) {
        locationData.forEach((location) =>
          params.append("locations", location)
        );
      }

      // --- CHANGE 2: Send 'session' instead of 'slot' ---
      if (selectedSession !== "All") {
        params.append("session", selectedSession);
      }

      if (searchTerm) params.append("searchTerm", searchTerm);
      params.append("sortOrder", sortOrder);

      const res = await axios.get(
        `http://localhost:7013/api/admin/getSalesReport?${params.toString()}`
      );
      if (res.status === 200) {
        setFilteredData(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching sales report:", error);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  const getHubs = async () => {
    try {
      const res = await axios.get("http://localhost:7013/api/Hub/hubs", {
        headers: { Authorization: `Bearer ${"token"}` },
      });
      setHubs(res.data);
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to fetch hubs.", "error");
    }
  };

  useEffect(() => {
    // getProducts();
    getHubs();
    getSalesReport();
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      getSalesReport();
    }, 500);

    return () => clearTimeout(debounceTimer);

    // --- CHANGE 3: Update dependency array ---
  }, [
    startDate,
    endDate,
    selectHub,
    selectedLocations,
    searchTerm,
    sortOrder,
    selectedSession, // Changed from selectedSlot
  ]);

  const setDateRange = (type) => {
    // ... (Your existing setDateRange function - no changes needed)
    const today = moment();
    let start, end;

    switch (type) {
      case "today":
        start = today.clone().startOf("day");
        end = today.endOf("day");
        break;
      case "yesterday":
        start = today.clone().subtract(1, "day").startOf("day");
        end = today.clone().subtract(1, "day").endOf("day");
        break;
      case "last3Days":
        start = today.clone().subtract(3, "days").startOf("day");
        end = today.endOf("day");
        break;
      case "lastWeek":
        start = today.clone().subtract(7, "days").startOf("day");
        end = today.endOf("day");
        break;
      case "thisMonth":
        start = today.clone().startOf("month");
        end = today.endOf("day");
        break;
      case "last2Months":
        start = today.clone().subtract(2, "months").startOf("month");
        end = today.endOf("day");
        break;
      case "last3Months":
        start = today.clone().subtract(3, "months").startOf("month");
        end = today.endOf("day");
        break;
      default:
        return;
    }

    setStartDate(start.format("YYYY-MM-DD"));
    setEndDate(end.format("YYYY-MM-DD"));
  };

  const clearFilters = () => {
    const today = moment().format("YYYY-MM-DD");
    setStartDate(today);
    setEndDate(today);
    setSearchTerm("");
    setSortOrder("desc");
    setSelectHub({});
    setSelectedLocations([]);
    setLocationData([]);
    // --- CHANGE 4: Reset the correct state ---
    setSelectedSession("All");
  };

  const handleExportExcel = () => {
    // ... (Your existing handleExportExcel function - no changes needed)
    const exportData = filteredData.map((item, index) => ({
      "S.No": index + 1,
      "Item Name": item.foodName,
      Price: item.price,
      "Sold Quantity": item.quantity,
      "Total Amount": item.totalAmount,
      "Last Sold Time": item.lastSoldTime
        ? moment(item.lastSoldTime).format("DD-MM-YYYY hh:mm:ss A")
        : "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Report");
    XLSX.writeFile(workbook, `SalesReport_${moment().format("DDMMYYYY")}.xlsx`);
  };

  return (
    <div className="sales-report-container">
      <Card className="shadow-sm">
        <Card.Header
          className=" text-white d-flex justify-content-between align-items-center"
          style={{ backgroundColor: "#fe4500" }}
        >
          <h2 className="header-c mb-0 " style={{ color: "white" }}>
            Sales Report
          </h2>
          {loading && <Spinner animation="border" size="sm" />}
        </Card.Header>
        <Card.Body>
          <div className="filters mb-2">
            <div className="row g-3 align-items-center">
              <div className="col-md-3">
                <InputGroup>
                  <InputGroup.Text>
                    <BsSearch color="white" />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={loading}
                  />
                </InputGroup>
              </div>
              <div className="col-md-3">
                <Form.Group>
                  <Form.Label>From Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    disabled={loading}
                  />
                </Form.Group>
              </div>
              <div className="col-md-3">
                <Form.Group>
                  <Form.Label>To Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    disabled={loading}
                  />
                </Form.Group>
              </div>
              <div className="col-md-3 d-flex align-items-end gap-2 flex-wrap">
                <Button
                  variant="success"
                  onClick={handleExportExcel}
                  disabled={loading}
                >
                  <AiOutlineExport /> Export
                </Button>
                <Button
                  variant="outline-danger"
                  onClick={clearFilters}
                  disabled={loading}
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>

          <div className="row g-3 m-2 justify-content-end">
            {/* --- CHANGE 5: Update state for Session filter --- */}
            <div className="col-md-3">
              <Form.Label>Session</Form.Label>
              <Form.Select
                className="packer-slot-select shadow-sm"
                value={selectedSession} // Use selectedSession
                onChange={(e) => setSelectedSession(e.target.value)} // Use setSelectedSession
                style={{ height: "52px" }}
              >
                <option value="All">All Sessions</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
              </Form.Select>
            </div>

            <div className="col-md-4">
              <Form.Label>Hub</Form.Label>
              <select
                className="form-select packer-slot-select shadow-sm"
                value={JSON.stringify(selectHub)}
                style={{ height: "52px" }}
                onChange={(e) => {
                  const selected = e.target.value
                    ? JSON.parse(e.target.value)
                    : {};
                  setSelectHub(selected);
                  const locationd =
                    selected?.locations?.map((ele) => ele?.split(", ")[0]) ||
                    [];
                  setLocationData(locationd || []);
                  setSelectedLocations([]);
                }}
              >
                <option value="">All Hubs</option>
                {hubs?.map((ele) => (
                  <option key={ele?._id} value={JSON.stringify(ele)}>
                    {ele.hubId} ({ele.hubName})
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-3 d-flex align-items-end">
              <Dropdown
                className="packer-slot-select shadow-sm w-100"
                style={{ height: "52px" }}
              >
                <Dropdown.Toggle
                  variant="outline-primary"
                  id="dropdown-basic"
                  disabled={loading}
                  className="w-100"
                >
                  Quick Filters
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => setDateRange("today")}>
                    Today
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => setDateRange("yesterday")}>
                    Yesterday
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => setDateRange("last3Days")}>
                    Last 3 Days
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => setDateRange("lastWeek")}>
                    Last Week
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => setDateRange("thisMonth")}>
                    This Month
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => setDateRange("last2Months")}>
                    Last 2 Months
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => setDateRange("last3Months")}>
                    Last 3 Months
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
              <p>Loading data...</p>
            </div>
          ) : (
            <Table responsive hover className="sales-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Item Name</th>
                  <th>Price</th>
                  <th>Sold Quantity</th>
                  <th>Total Amount</th>
                  <th>
                    Last Sold Time
                    <BsArrowBarDown
                      className="ms-2 cursor-pointer"
                      onClick={() =>
                        setSortOrder(sortOrder === "desc" ? "asc" : "desc")
                      }
                    />
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.foodName}</td>
                    <td>₹{Number(item.price)?.toFixed(2)}</td>
                    <td>{item.quantity}</td>
                    <td>₹{item.totalAmount}</td>
                    <td>
                      {item.lastSoldTime
                        ? moment(item.lastSoldTime).format(
                            "DD-MM-YYYY hh:mm:ss A"
                          )
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default SalesReport;
