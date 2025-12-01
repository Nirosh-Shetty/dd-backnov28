import React, { useState, useEffect, useMemo } from "react";
import {
  Button,
  Modal,
  Table,
  Form,
  Spinner,
  Card,
  Tabs,
  Tab,
  InputGroup,
} from "react-bootstrap";
import { AiFillDelete, AiOutlineEdit } from "react-icons/ai";
import { BsSearch, BsPlus } from "react-icons/bs";
import { MdLocationOn, MdPriceChange } from "react-icons/md";
import axios from "axios";
import ReactPaginate from "react-paginate";
import * as XLSX from "xlsx";
import { Link } from "react-router-dom";
import { FaExternalLinkAlt } from "react-icons/fa";

// API URL for HubMenu (Daily Menu)
const API_URL = "http://localhost:7013/api/admin/hub-menu";
// API URL for Admin actions (Products, Hubs)
const ADMIN_API_URL = "http://localhost:7013/api/admin";
const HUB_API_URL = "http://localhost:7013/api/Hub";

const HubWiseProductManagement = () => {
  // --- STATE ---

  // Hub State
  const [hubs, setHubs] = useState([]);
  const [selectedHub, setSelectedHub] = useState(null);
  const token = localStorage.getItem("authToken");

  // Filter State
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedSession, setSelectedSession] = useState("Lunch");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");

  // Data State
  const [menuItems, setMenuItems] = useState([]); // For "Products" tab (Daily Menu)
  const [allProducts, setAllProducts] = useState([]); // For "Price Management" tab (Base Products)
  // const [defaultHubProducts, setDefaultHubProducts] = useState([]); // Filtered Base Products

  const [isLoading, setIsLoading] = useState(false); // For modal buttons
  const [isDataLoading, setIsDataLoading] = useState(false); // For table loading

  // Modal States
  const [showEditHubProduct, setShowEditHubProduct] = useState(false);
  const [showDeleteProduct, setShowDeleteProduct] = useState(false);
  const [showBulkPrice, setShowBulkPrice] = useState(false);
  // const [showPriceManager, setShowPriceManager] = useState(false);
  const [activeTab, setActiveTab] = useState("products");

  // Form States
  const [editHubProductForm, setEditHubProductForm] = useState({
    _id: null,
    productId: null,
    foodname: "",
    hubPrice: 0,
    totalQuantity: 0,
    remainingQuantity: 0,
    hubPriority: 0,
    product: null,
  });

  const [selectedProductForDelete, setSelectedProductForDelete] =
    useState(null);

  // --- DERIVED STATE (for "Products" Tab) ---
  const filteredMenuItems = useMemo(() => {
    let filteredData = [...menuItems];
    if (searchTerm && activeTab === "products") {
      filteredData = filteredData.filter(
        (item) =>
          item.productId?.foodname
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          item.productId?.foodcategory
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }
    if (filterType && activeTab === "products") {
      switch (filterType) {
        case "out_of_stock":
          filteredData = filteredData.filter(
            (item) => item.remainingQuantity === 0
          );
          break;
        case "low_stock":
          filteredData = filteredData.filter(
            (item) => item.remainingQuantity < 10 && item.remainingQuantity > 0
          );
          break;
        default:
          break;
      }
    }
    return filteredData;
  }, [menuItems, searchTerm, filterType, activeTab]);

  // --- DERIVED STATE (for "Price Management" Tab) ---
  // const filteredDefaultProducts = useMemo(() => {
  //    let filteredData = [...defaultHubProducts];
  //    if (searchTerm && activeTab === 'pricing') {
  //      filteredData = filteredData.filter(
  //        (product) =>
  //          product.foodname.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //          product.foodcategory.toLowerCase().includes(searchTerm.toLowerCase())
  //      );
  //    }
  //    // Add any pricing-specific filters here if needed
  //    return filteredData;
  // }, [defaultHubProducts, searchTerm, activeTab]);

  // Pagination
  const [pageNumber, setPageNumber] = useState(0);
  const usersPerPage = 8;
  const pagesVisited = pageNumber * usersPerPage;
  const changePage = ({ selected }) => setPageNumber(selected);

  // Determine page count based on active tab
  const pageCount = Math.ceil(filteredMenuItems.length / usersPerPage);

  // --- API FUNCTIONS ---

  const getHubs = async () => {
    try {
      const res = await axios.get(`${HUB_API_URL}/hubs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHubs(res.data);
      if (res.data.length > 0) {
        setSelectedHub(res.data[0]);
      }
    } catch (error) {
      console.error("Failed to fetch hubs:", error);
    }
  };

  // 1. Fetch Daily Menu (for "Products" tab)
  const fetchHubMenu = async () => {
    if (!selectedHub || !selectedDate || !selectedSession) {
      setMenuItems([]);
      return;
    }
    setIsDataLoading(true);
    try {
      const res = await axios.get(`${API_URL}/get-menu`, {
        params: {
          hubId: selectedHub._id,
          menuDate: selectedDate,
          session: selectedSession,
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      setMenuItems(res.data.menu || []);
    } catch (error) {
      console.error("Error fetching hub menu:", error);
      setMenuItems([]);
    } finally {
      setIsDataLoading(false);
    }
  };
  // --- ACTION FUNCTIONS ---

  // (Actions for "Products" Tab - Daily Menu)
  const updateHubMenuItem = async () => {
    if (!editHubProductForm._id) return;
    try {
      setIsLoading(true);
      const updateData = {
        hubPrice: Number(editHubProductForm.hubPrice),
        totalQuantity: Number(editHubProductForm.totalQuantity),
        remainingQuantity: Number(editHubProductForm.remainingQuantity),
        hubPriority: Number(editHubProductForm.hubPriority),
      };
      const res = await axios.put(
        `${API_URL}/update/${editHubProductForm._id}`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.status === 200) {
        alert("Menu item updated successfully!");
        setShowEditHubProduct(false);
        await fetchHubMenu();
      }
    } catch (error) {
      console.error("Failed to update menu item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteHubMenuItem = async () => {
    if (!selectedProductForDelete) return;
    try {
      setIsLoading(true);
      const res = await axios.delete(
        `${API_URL}/delete/${selectedProductForDelete._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.status === 200) {
        alert("Menu item removed successfully!");
        setShowDeleteProduct(false);
        setSelectedProductForDelete(null);
        await fetchHubMenu();
      }
    } catch (error) {
      console.error("Failed to delete menu item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (item) => {
    setMenuItems((prevItems) =>
      prevItems.map((menuItem) =>
        menuItem._id === item._id
          ? { ...menuItem, isActive: !item.isActive }
          : menuItem
      )
    );
    try {
      await axios.put(
        `${API_URL}/update/${item._id}`,
        { isActive: !item.isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      alert("Failed to update status.");
      await fetchHubMenu(); // Revert on error
    }
  };
  const exportToExcel = () => {
    // 1. Check if there is data to export
    if (filteredMenuItems.length === 0) {
      alert("No data to export. Please check your filters.");
      return;
    }

    // 2. Format the data from filteredMenuItems into a clean array
    const exportData = filteredMenuItems.map((item, index) => ({
      "Sl. No": index + 1,
      "Product Name": item.productId?.foodname,
      Category: item.productId?.foodcategory,
      "Base Price (₹)": item.basePrice,
      "Hub Price (₹)": item.hubPrice,
      "Pre-order Price (₹)": item.preOrderPrice,
      "Total Stock": item.totalQuantity,
      "Remaining Stock": item.remainingQuantity,
      Priority: item.hubPriority,
      Status: item.isActive ? "Active" : "Closed",
    }));

    // 3. Create a worksheet from the formatted data
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // 4. Create a new workbook
    const workbook = XLSX.utils.book_new();

    // 5. Append the worksheet to the workbook with a sheet name
    XLSX.utils.book_append_sheet(workbook, worksheet, "Menu");

    // 6. Define a dynamic filename
    const filename = `HubMenu_${
      selectedHub?.hubName || "Hub"
    }_${selectedDate}_${selectedSession}.xlsx`;

    // 7. Trigger the file download
    XLSX.writeFile(workbook, filename);
  };
  const markProductSoldOut = async (item) => {
    setMenuItems((prevItems) =>
      prevItems.map((menuItem) =>
        menuItem._id === item._id
          ? { ...menuItem, remainingQuantity: 0 }
          : menuItem
      )
    );
    try {
      await axios.put(
        `${API_URL}/update/${item._id}`,
        { remainingQuantity: 0 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      alert("Failed to mark as sold out.");
      await fetchHubMenu();
    }
  };

  const markAllProductsSoldOut = async () => {
    if (!selectedHub) return;
    const confirm = window.confirm(
      `Are you sure you want to mark ALL items as sold out for this filter?`
    );
    if (!confirm) return;
    setIsDataLoading(true);
    try {
      await axios.post(
        `${API_URL}/bulk-sold-out`,
        {
          hubId: selectedHub._id,
          menuDate: selectedDate,
          session: selectedSession,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchHubMenu();
    } catch (error) {
      alert("Failed to mark all as sold out.");
    } finally {
      setIsDataLoading(false);
    }
  };

  // (Actions for "Price Management" Tab - Default Prices)

  // This is for the "Bulk Price Update" modal
  const handleBulkPriceUpdate = async (percentage, operation) => {
    if (!selectedHub || !selectedDate || !selectedSession) {
      alert("Please select a hub, date, and session first.");
      return;
    }

    const confirmMsg = `Are you sure you want to ${operation} all prices by ${percentage}% for this menu?`;
    if (!window.confirm(confirmMsg)) return;

    setIsLoading(true); // Use the modal spinner
    try {
      const res = await axios.post(
        `${API_URL}/bulk-price-update`, // The new endpoint
        {
          hubId: selectedHub._id,
          menuDate: selectedDate,
          session: selectedSession,
          percentage: percentage,
          operation: operation,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        alert(res.data.message);
        await fetchHubMenu(); // Refresh data to show new prices
      }
    } catch (error) {
      console.error("Failed to bulk update prices:", error);
      alert(error?.response?.data?.message || "Bulk update failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- MODAL HANDLERS ---
  const openEditModal = (menuItem) => {
    setEditHubProductForm({
      _id: menuItem._id,
      productId: menuItem.productId._id,
      foodname: menuItem.productId.foodname,
      hubPrice: menuItem.hubPrice,
      totalQuantity: menuItem.totalQuantity,
      remainingQuantity: menuItem.remainingQuantity,
      hubPriority: menuItem.hubPriority,
      product: menuItem.productId,
    });
    setShowEditHubProduct(true);
  };

  const openDeleteModal = (menuItem) => {
    setSelectedProductForDelete(menuItem);
    setShowDeleteProduct(true);
  };

  // --- EFFECTS ---
  useEffect(() => {
    getHubs();
  }, [token]);

  // Re-fetch daily menu when these filters change
  useEffect(() => {
    if (activeTab === "products") {
      fetchHubMenu();
    }
  }, [selectedHub, selectedDate, selectedSession, activeTab]);

  // // Re-filter default products when hub or base products change
  // useEffect(() => {
  //   if (selectedHub && allProducts.length > 0) {
  //     const hubSpecificProducts = allProducts
  //       .map((product) => {
  //         const hubPriceData = product.locationPrice?.find(
  //           (loc) => loc.hubId === selectedHub.hubId
  //         );

  //         if (hubPriceData) {
  //           return {
  //             ...product,
  //             hubPriceData: hubPriceData,
  //           };
  //         }
  //         return null;
  //       })
  //       .filter(Boolean); // Remove nulls

  //     setDefaultHubProducts(hubSpecificProducts);
  //   } else {
  //     setDefaultHubProducts([]);
  //   }
  // }, [selectedHub, allProducts]);

  // Reset pagination when data/tabs change
  useEffect(() => {
    setPageNumber(0);
  }, [filteredMenuItems, activeTab]);

  const onRemainingQuantityChange = (e) => {
    const newRemaining = Number(e.target.value);
    const oldRemaining = Number(editHubProductForm.remainingQuantity);
    const oldTotal = Number(editHubProductForm.totalQuantity);

    // Calculate how much the remaining changed
    const diff = newRemaining - oldRemaining;

    // Update both fields accordingly
    setEditHubProductForm({
      ...editHubProductForm,
      remainingQuantity: newRemaining,
      totalQuantity: oldTotal + diff, // keep total in sync
    });
  };
  // --- RENDER ---
  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="header-c">Hub Menu Management</h2>
        <div className="d-flex gap-2">
          <Button
            variant="outline-success"
            onClick={() => setShowBulkPrice(true)}
            // Disable if not on pricing tab
            // disabled={activeTab !== "pricing"}
          >
            <MdPriceChange /> Bulk Price Update
          </Button>
        </div>
      </div>

      {/* Hub Selection */}
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex flex-wrap gap-3 align-items-center justify-content-between">
            <strong>Select Hub:</strong>
            {hubs.map((hub) => (
              <Button
                key={hub._id}
                variant={
                  selectedHub?._id === hub._id
                    ? "outline-danger"
                    : "outline-success"
                }
                onClick={() => setSelectedHub(hub)}
                className="d-flex align-items-center gap-2"
              >
                <MdLocationOn />
                {hub.hubId}
                <small className="text-muted">({hub.hubName})</small>
              </Button>
            ))}
          </div>
        </Card.Body>
      </Card>

      {selectedHub && (
        <Card>
          <Card.Header>
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
              className="mb-0"
            >
              <Tab eventKey="products" title="Daily Menu"></Tab>
              <Tab eventKey="pricing" title="Default Price Management"></Tab>
            </Tabs>
          </Card.Header>

          <Card.Body>
            {isDataLoading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Loading...</p>
              </div>
            ) : (
              <>
                {/* --- TAB 1: DAILY MENU --- */}
                {activeTab === "products" && (
                  <>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="mb-0">
                        Daily Menu for <b>{selectedHub.hubName}</b>
                      </h5>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={exportToExcel}
                      >
                        Export Excel
                      </Button>
                    </div>
                    {/* Filters */}
                    <div className="row mb-3">
                      <div className="col-md-3">
                        <Form.Group>
                          <Form.Label>Select Date</Form.Label>
                          <Form.Control
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                          />
                        </Form.Group>
                      </div>
                      <div className="col-md-3">
                        <Form.Group>
                          <Form.Label>Select Session</Form.Label>
                          <Form.Select
                            value={selectedSession}
                            onChange={(e) => setSelectedSession(e.target.value)}
                          >
                            <option value="Lunch">Lunch</option>
                            <option value="Dinner">Dinner</option>
                          </Form.Select>
                        </Form.Group>
                      </div>
                      <div className="col-md-3">
                        <Form.Label>Search</Form.Label>
                        <InputGroup>
                          <InputGroup.Text>
                            <BsSearch />
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </InputGroup>
                      </div>
                      <div className="col-md-3">
                        <Form.Label>Filter By</Form.Label>
                        <Form.Select
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value)}
                        >
                          <option value="">All Products</option>
                          <option value="out_of_stock">Out of Stock</option>
                          <option value="low_stock">Low Stock</option>
                        </Form.Select>
                      </div>
                    </div>
                    <div className="mb-3 d-flex justify-content-between align-items-center">
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={markAllProductsSoldOut}
                        disabled={isDataLoading || isLoading}
                      >
                        Mark All Filtered as Sold Out
                      </Button>
                      <Link
                        to="/admin/menu-upload"
                        className="ms-2"
                      >
                        <Button variant="success">
                          <FaExternalLinkAlt
                            style={{
                              paddingRight: "5px",
                            }}
                          />{" "}
                          Add Product
                        </Button>
                      </Link>
                    </div>

                    {/* Products Table */}
                    <div className="table-responsive">
                      <Table striped bordered hover>
                        <thead className="table-dark">
                          <tr>
                            <th>Sl. No</th>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Base (₹)</th>
                            <th>Hub (₹)</th>
                            <th>PreOrder (₹)</th>
                            <th>Total</th>
                            <th>Rem.</th>
                            <th>Status</th>
                            <th>Prio.</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredMenuItems
                            .slice(pagesVisited, pagesVisited + usersPerPage)
                            .map((item, index) => (
                              <tr key={item._id}>
                                <td>{index + 1 + pagesVisited}</td>
                                <td>
                                  <img
                                    src={
                                      item.productId?.Foodgallery?.[0]
                                        ?.image2 ||
                                      "https://via.placeholder.com/50"
                                    }
                                    alt={item.productId?.foodname}
                                    style={{
                                      width: "50px",
                                      height: "50px",
                                      objectFit: "cover",
                                    }}
                                    className="rounded"
                                  />
                                </td>
                                <td>{item.productId?.foodname || "N/A"}</td>
                                <td>{item.productId?.foodcategory || "N/A"}</td>
                                <td>{item.basePrice}</td>
                                <td>{item.hubPrice}</td>
                                <td>{item.preOrderPrice}</td>
                                <td>{item.totalQuantity}</td>
                                <td>
                                  <span
                                    className={`badge ${
                                      item.remainingQuantity === 0
                                        ? "bg-danger"
                                        : item.remainingQuantity < 10
                                        ? "bg-warning"
                                        : "bg-success"
                                    }`}
                                  >
                                    {item.remainingQuantity}
                                  </span>
                                </td>
                                <td>
                                  <Form.Check
                                    type="switch"
                                    id={`active-switch-${item._id}`}
                                    label={item.isActive ? "Active" : "Closed"}
                                    checked={item.isActive}
                                    onChange={() => handleToggleActive(item)}
                                  />
                                </td>
                                <td>{item.hubPriority}</td>
                                <td>
                                  <div className="d-flex gap-2">
                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      onClick={() => openEditModal(item)}
                                      title="Edit Daily Menu Item"
                                    >
                                      <AiOutlineEdit />
                                    </Button>
                                    <Button
                                      variant="outline-warning"
                                      size="sm"
                                      onClick={() => markProductSoldOut(item)}
                                      title="Mark as Sold Out"
                                    >
                                      Sold Out
                                    </Button>
                                    <Button
                                      variant="outline-danger"
                                      size="sm"
                                      onClick={() => openDeleteModal(item)}
                                      title="Remove from Daily Menu"
                                    >
                                      <AiFillDelete />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </Table>
                    </div>

                    {/* Pagination */}
                    <div className="d-flex justify-content-between align-items-center">
                      <p className="mb-0">
                        Total: {filteredMenuItems.length} products
                      </p>
                      <ReactPaginate
                        previousLabel={"Back"}
                        nextLabel={"Next"}
                        pageCount={pageCount}
                        onPageChange={changePage}
                        containerClassName={"paginationBttns mb-0"}
                        previousLinkClassName={"previousBttn"}
                        nextLinkClassName={"nextBttn"}
                        disabledClassName={"paginationDisabled"}
                        activeClassName={"paginationActive"}
                      />
                    </div>
                  </>
                )}

                {/* --- TAB 2: PRICE MANAGEMENT --- */}
                {activeTab === "pricing" && (
                  <>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="mb-0">
                        Price Management for {selectedHub.hubName}
                      </h5>
                      {/* <div className="col-md-3">
        <InputGroup>
          <InputGroup.Text><BsSearch /></InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
      </div> */}
                    </div>

                    <div className="row">
                      {/* --- Price Overview (Left Side) --- */}
                      <div className="col-md-7">
                        <Card>
                          <Card.Header>
                            <h6>
                              Price Overview (for {selectedDate} -{" "}
                              {selectedSession})
                            </h6>
                          </Card.Header>
                          <Card.Body
                            style={{ maxHeight: "600px", overflowY: "auto" }}
                          >
                            {/* We map `filteredMenuItems` here */}
                            {filteredMenuItems.length > 0 ? (
                              filteredMenuItems.map((item) => (
                                <div
                                  key={item._id}
                                  className="d-flex justify-content-between align-items-center mb-2 p-2 border rounded"
                                >
                                  <span>
                                    <img
                                      src={
                                        item.productId?.Foodgallery?.[0]
                                          ?.image2 ||
                                        "https://via.placeholder.com/50"
                                      }
                                      alt={item.productId?.foodname}
                                      style={{
                                        width: "40px",
                                        height: "40px",
                                        objectFit: "cover",
                                        marginRight: "10px",
                                      }}
                                      className="rounded"
                                    />
                                    {item.productId?.foodname}
                                  </span>
                                  <div className="d-flex align-items-center gap-3">
                                    <span className="text-muted">
                                      Base: ₹{item.basePrice}
                                    </span>
                                    <div className="d-flex align-items-center gap-2">
                                      <strong>Hub Price:</strong>
                                      <span className="text-muted">₹</span>
                                      <input
                                        type="number"
                                        className="form-control form-control-sm"
                                        defaultValue={item.hubPrice}
                                        onBlur={(e) => {
                                          // This is an inline edit
                                          // We call the *single item* update endpoint
                                          const newPrice = Number(
                                            e.target.value
                                          );
                                          if (newPrice !== item.hubPrice) {
                                            axios
                                              .put(
                                                `${API_URL}/update/${item._id}`,
                                                { hubPrice: newPrice },
                                                {
                                                  headers: {
                                                    Authorization: `Bearer ${token}`,
                                                  },
                                                }
                                              )
                                              .then(() => {
                                                // Optimistically update state
                                                setMenuItems((prev) =>
                                                  prev.map((mi) =>
                                                    mi._id === item._id
                                                      ? {
                                                          ...mi,
                                                          hubPrice: newPrice,
                                                        }
                                                      : mi
                                                  )
                                                );
                                              })
                                              .catch((err) => {
                                                console.error(err);
                                                alert(
                                                  "Failed to update price."
                                                );
                                                e.target.value = item.hubPrice; // Revert on fail
                                              });
                                          }
                                        }}
                                        style={{ width: "80px" }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p>No menu items found for this filter.</p>
                            )}
                          </Card.Body>
                        </Card>
                      </div>

                      {/* --- Bulk Price Actions (Right Side) --- */}
                      <div className="col-md-5">
                        <Card>
                          <Card.Header>
                            <h6>Bulk Price Actions</h6>
                          </Card.Header>
                          <Card.Body>
                            <div className="d-grid gap-2">
                              <Button
                                variant="outline-success"
                                onClick={() =>
                                  handleBulkPriceUpdate(10, "increase")
                                }
                                disabled={isLoading}
                              >
                                {isLoading ? (
                                  <Spinner size="sm" />
                                ) : (
                                  "Increase All Prices by 10%"
                                )}
                              </Button>
                              <Button
                                variant="outline-warning"
                                onClick={() =>
                                  handleBulkPriceUpdate(5, "increase")
                                }
                                disabled={isLoading}
                              >
                                {isLoading ? (
                                  <Spinner size="sm" />
                                ) : (
                                  "Increase All Prices by 5%"
                                )}
                              </Button>
                              <Button
                                variant="outline-danger"
                                onClick={() =>
                                  handleBulkPriceUpdate(5, "decrease")
                                }
                                disabled={isLoading}
                              >
                                {isLoading ? (
                                  <Spinner size="sm" />
                                ) : (
                                  "Decrease All Prices by 5%"
                                )}
                              </Button>
                              <Button
                                variant="outline-dark"
                                onClick={() =>
                                  handleBulkPriceUpdate(10, "decrease")
                                }
                                disabled={isLoading}
                              >
                                {isLoading ? (
                                  <Spinner size="sm" />
                                ) : (
                                  "Decrease All Prices by 10%"
                                )}
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </Card.Body>
        </Card>
      )}

      {/* --- MODALS --- */}
      {/* (All modals from previous response go here) */}

      {/* Bulk Price Update Modal */}
      <Modal show={showBulkPrice} onHide={() => setShowBulkPrice(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Bulk Price Update</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-4">
            <h6>
              Update default prices for all products in {selectedHub?.hubName}
            </h6>
            <p className="text-muted">
              This will modify the 'locationPrice' for all products in this hub.
            </p>
          </div>
          <div className="d-grid gap-3">
            <Card className="border-success">
              <Card.Body className="text-center">
                <h6 className="text-success mb-3">Increase Prices</h6>
                <div className="d-grid gap-2">
                  <Button
                    variant="outline-success"
                    onClick={() => handleBulkPriceUpdate(5, "increase")}
                    disabled={isLoading}
                  >
                    Increase by 5%
                  </Button>
                  <Button
                    variant="outline-success"
                    onClick={() => handleBulkPriceUpdate(10, "increase")}
                    disabled={isLoading}
                  >
                    Increase by 10%
                  </Button>
                </div>
              </Card.Body>
            </Card>
            <Card className="border-danger">
              <Card.Body className="text-center">
                <h6 className="text-danger mb-3">Decrease Prices</h6>
                <div className="d-grid gap-2">
                  <Button
                    variant="outline-danger"
                    onClick={() => handleBulkPriceUpdate(5, "decrease")}
                    disabled={isLoading}
                  >
                    Decrease by 5%
                  </Button>
                  <Button
                    variant="outline-danger"
                    onClick={() => handleBulkPriceUpdate(10, "decrease")}
                    disabled={isLoading}
                  >
                    Decrease by 10%
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBulkPrice(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Price Manager Modal (Removed, as it's now inline on the tab) */}

      {/* Delete Product Modal (For Daily Menu) */}
      <Modal
        show={showDeleteProduct}
        onHide={() => setShowDeleteProduct(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to remove "
            {selectedProductForDelete?.productId?.foodname}" from this hub's
            menu for this date/session?
          </p>
          <p className="text-danger">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteProduct(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={deleteHubMenuItem}
            disabled={isLoading}
          >
            {isLoading ? <Spinner size="sm" /> : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Hub Product Modal (For Daily Menu) */}
      <Modal
        show={showEditHubProduct}
        onHide={() => setShowEditHubProduct(false)}
        size="lg"
        style={{ zIndex: 99999 }}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Edit Daily Menu Item in {selectedHub?.hubName}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editHubProductForm.product && (
            <>
              <div className="mb-3">
                <Card>
                  <Card.Body className="p-3">
                    <div className="d-flex align-items-center gap-3">
                      <img
                        src={
                          editHubProductForm.product.Foodgallery?.[0]?.image2 ||
                          "https://via.placeholder.com/60"
                        }
                        alt={editHubProductForm.product.foodname}
                        style={{
                          width: "60px",
                          height: "60px",
                          objectFit: "cover",
                        }}
                        className="rounded"
                      />
                      <div>
                        <h6 className="mb-1">
                          {editHubProductForm.product.foodname}
                        </h6>
                        <small className="text-muted">
                          {editHubProductForm.product.foodcategory} • Base
                          Price: ₹
                          {editHubProductForm.product.basePrice ||
                            editHubProductForm.product.foodprice}
                        </small>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Hub Price (₹)</Form.Label>
                    <Form.Control
                      type="number"
                      value={editHubProductForm.hubPrice}
                      onChange={(e) =>
                        setEditHubProductForm({
                          ...editHubProductForm,
                          hubPrice: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Total Stock</Form.Label>
                    <Form.Control
                      type="number"
                      value={editHubProductForm.totalQuantity}
                      disabled
                      readOnly
                      className="bg-light"
                      // onChange={(e) =>
                      //   setEditHubProductForm({
                      //     ...editHubProductForm,
                      //     totalQuantity: e.target.value,
                      //   })
                      // }
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Remaining Stock</Form.Label>
                    <Form.Control
                      type="number"
                      value={editHubProductForm.remainingQuantity}
                      onChange={onRemainingQuantityChange}
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Menu Priority</Form.Label>
                    <Form.Control
                      type="number"
                      value={editHubProductForm.hubPriority}
                      onChange={(e) =>
                        setEditHubProductForm({
                          ...editHubProductForm,
                          hubPriority: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </div>
              </div>

              <div className="alert alert-info">
                <small>
                  <strong>Note:</strong> Changes will apply to this menu item
                  for {selectedDate} ({selectedSession}) in{" "}
                  {selectedHub?.hubName}.
                </small>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowEditHubProduct(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={updateHubMenuItem}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Updating...
              </>
            ) : (
              "Update Menu Item"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default HubWiseProductManagement;
