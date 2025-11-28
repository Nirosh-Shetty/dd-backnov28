import React, { useState, useEffect } from "react";
import { FaTimes, FaPlus, FaSearch } from "react-icons/fa";
import "../../Styles/MenuUpload.css"; // Your CSS file
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import axios from "axios";

// 2. Define ALL your API URLs
const SAVE_API_URL = "http://localhost:7013/api/admin/hub-menu"; // This is for SAVING (from our plan)
const HUBS_API = "http://localhost:7013/api/Hub/hubs"; // This is your live API
const PRODUCTS_API = "http://localhost:7013/api/admin/getFoodItems"; // This is your live API

const MenuUpload = () => {
  const navigate = useNavigate();

  // View 1: Product Selection
  const [menuDate, setMenuDate] = useState("");
  const [session, setSession] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [masterProducts, setMasterProducts] = useState([]); // Will hold products from API
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [allHubs, setAllHubs] = useState([]); // Will hold hubs from API
  const [addedProducts, setAddedProducts] = useState([]);

  // View 2: Hub Assignment
  const [view, setView] = useState("selection"); // 'selection' or 'assignment'
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [assignments, setAssignments] = useState({});
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // 3. Fetch Hubs and Products on component load
  useEffect(() => {
    const fetchInitialData = async () => {
      setPageLoading(true);
      try {
        // We'll fetch products and hubs at the same time
        const [productsRes, hubsRes] = await Promise.all([
          axios.get(PRODUCTS_API), // Use your live product API
          axios.get(HUBS_API), // Use your live hub API
        ]);

        // Use the response structure you provided: response.data.data
        if (productsRes.data && productsRes.data.data) {
          setMasterProducts(productsRes.data.data);
        } else {
          toast.error("Could not parse products. Check API.");
        }

        // Use the response structure you provided: response.data (which is an array)
        if (hubsRes.data && Array.isArray(hubsRes.data)) {
          setAllHubs(hubsRes.data);
        } else {
          toast.error("Could not parse hubs. Check API.");
        }
      } catch (err) {
        console.error("Error fetching initial data:", err);
        toast.error("Failed to load products and hubs. Please refresh.");
      } finally {
        setPageLoading(false);
      }
    };

    fetchInitialData();
  }, []); // Runs once on component mount

  // 4. Handle product search (FIX: use 'foodname')
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts([]);
    } else {
      setFilteredProducts(
        masterProducts.filter((p) =>
          // Use your field 'foodname'
          p.foodname.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, masterProducts]);

  // === VIEW 1 FUNCTIONS ===

  const handleAddProduct = (product) => {
    if (!addedProducts.find((p) => p._id === product._id)) {
      setAddedProducts([...addedProducts, product]);
    }
    setSearchTerm("");
  };

  const handleRemoveProduct = (productId) => {
    setAddedProducts(addedProducts.filter((p) => p._id !== productId));
    // Also remove from assignments if it's there
    setAssignments((prev) => {
      const newAssignments = { ...prev };
      delete newAssignments[productId];
      return newAssignments;
    });
  };

  const handleGoToAssignment = () => {
    if (!menuDate || !session) {
      return toast.warn("Please select a Date and Session.");
    }
    if (addedProducts.length === 0) {
      return toast.warn("Please add at least one product.");
    }

    // Initialize assignments state for all added products
    const newAssignments = {};
    for (const product of addedProducts) {
      newAssignments[product._id] = {};
      // 5. FIX: Use allHubs from state, not DUMMY_HUBS
      for (const hub of allHubs) {
        // Pre-fill with default values
        newAssignments[product._id][hub._id] = {
          hubId: hub._id, // Store the hubId
          // 6. FIX: Use your field 'foodprice' as the basePrice
          hubPrice: product.foodprice,
          preOrderPrice: product.foodprice,
          totalQuantity: 10, // Default quantity
          hubPriority: 1, // Default priority
          isActive: true,
        };
      }
    }
    setAssignments(newAssignments);
    setCurrentProductIndex(0);
    setView("assignment"); // Switch to View 2
  };

  // === VIEW 2 FUNCTIONS ===

  // NOTE:
  // We no longer call API on "Save & Next". We only collect assignments client-side.
  // The bulk upload will be triggered by "Add all".

  // Advance to next product (no API call)
  const handleNextClick = () => {
    if (currentProductIndex < addedProducts.length - 1) {
      setCurrentProductIndex((i) => i + 1);
    }
  };

  // Delete local product (no backend delete because nothing has been pushed yet)
  const handleDeleteItem = () => {
    const productToDelete = addedProducts[currentProductIndex];
    if (!productToDelete) return;
    // Remove from addedProducts
    const newAdded = addedProducts.filter((p, idx) => idx !== currentProductIndex);
    setAddedProducts(newAdded);
    // Remove assignments for that product
    setAssignments((prev) => {
      const copy = { ...prev };
      delete copy[productToDelete._id];
      return copy;
    });
    // Adjust index
    if (newAdded.length === 0) {
      // go back to selection view
      setView("selection");
      setCurrentProductIndex(0);
    } else if (currentProductIndex >= newAdded.length) {
      setCurrentProductIndex(newAdded.length - 1);
    }
  };

  // Build bulk payload and send to backend
  const handleSaveAllClick = async () => {
    if (!menuDate || !session) {
      toast.warn("Menu date and session are required.");
      return;
    }
    if (!addedProducts || addedProducts.length === 0) {
      toast.warn("No products to save.");
      return;
    }

    const items = addedProducts.map((product) => {
      const hubObj = assignments[product._id] || {};
      const hubData = Object.values(hubObj).map((h) => ({
        hubId: h.hubId,
        hubPrice: Number(h.hubPrice || product.foodprice || 0),
        preOrderPrice: Number(h.preOrderPrice || product.foodprice || 0),
        totalQuantity: Number(h.totalQuantity || 0),
        hubPriority: Number(h.hubPriority || 0),
        isActive: h.isActive !== undefined ? Boolean(h.isActive) : true,
      }));
      return {
        productId: product._id,
        menuDate,
        session,
        basePrice: Number(product.foodprice || 0),
        hubData,
      };
    }).filter(it => Array.isArray(it.hubData) && it.hubData.length > 0);

    if (items.length === 0) {
      toast.warn("No hub assignments found to save.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${SAVE_API_URL}/bulk`, { items });
      if (res?.data?.success) {
        toast.success("All items saved to hub menu.");
        // optional: navigate to hub management or reset UI
        setAddedProducts([]);
        setAssignments({});
        setView("selection");
        navigate("/hub-product-mangement");
      } else {
        toast.error("Bulk save completed with issues.");
      }
    } catch (err) {
      console.error("Bulk save error", err);
      toast.error("Failed to save menus. See console.");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignmentChange = (hubId, field, value) => {
    const currentProductId = addedProducts[currentProductIndex]._id;
    const numericValue = Number(value) < 0 ? 0 : Number(value); // Ensure non-negative numbers

    setAssignments((prev) => ({
      ...prev,
      [currentProductId]: {
        ...prev[currentProductId],
        [hubId]: {
          ...prev[currentProductId][hubId],
          [field]: numericValue,
        },
      },
    }));
  };

  const handleToggleHubActive = (hubId) => {
    const currentProductId = addedProducts[currentProductIndex]._id;
    setAssignments((prev) => ({
      ...prev,
      [currentProductId]: {
        ...prev[currentProductId],
        [hubId]: {
          ...prev[currentProductId][hubId],
          isActive: !prev[currentProductId][hubId].isActive,
        },
      },
    }));
  };

  // This handles the "Next" button
  // const handleNextClick = async () => {
  //   const success = await handleSaveProductAssignments();
  //   if (success) {
  //     // Only move to next product if save was successful
  //     setCurrentProductIndex(currentProductIndex + 1);
  //   }
  // };

  // This handles the "Add all" button
  // const handleSaveAllClick = async () => {
  //   const success = await handleSaveProductAssignments();
  //   if (success) {
  //     // Navigate to hub management as requested
  //     toast.info("All menus saved! Navigating to Hub Management...");
  //     // 9. FIX: This must match your router path in Main.jsx
  //     navigate("/hub-product-mangement");
  //   }
  // };

  // const handleDeleteItem = () => {
  //   const productToDelete = addedProducts[currentProductIndex];
  //   handleRemoveProduct(productToDelete._id);

  //   if (addedProducts.length - 1 === 0) {
  //     // If no products left, go back to View 1
  //     handleCancel();
  //   } else if (currentProductIndex >= addedProducts.length - 1) {
  //     // If we deleted the last item, move to the new last item
  //     setCurrentProductIndex(currentProductIndex - 1);
  //   }
  //   // Otherwise, index stays the same (next item slides into place)
  // };

  const handleCancel = () => {
    // We don't clear menuDate or session, as admin might want to add more
    setAddedProducts([]);
    setAssignments({});
    setCurrentProductIndex(0);
    setView("selection");
  };

  const currentProduct = addedProducts[currentProductIndex];
  const currentAssignments = assignments[currentProduct?._id] || {};

  // === RENDER ===

  if (pageLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <div className="mu-container">
          <h3>Loading Products and Hubs...</h3>
        </div>
      </Box>
    );
  }

  if (view === "assignment") {
    // --- VIEW 2: HUB ASSIGNMENT (Matching image_65d19f.png) ---
    return (
      <Box sx={{ p: 3 }}>
        <div className="mu-container">
          <div className="mu-header">
            <h3>Assign to Hubs</h3>
            <button onClick={handleCancel} className="btn btn-secondary">
              Cancel & Go Back
            </button>
          </div>

          <div className="mu-item-header">
            <h4>
              <span className="mu-item-counter">
                {currentProductIndex + 1}/{addedProducts.length}
              </span>
              {/* 10. FIX: Use your fields 'foodname' and 'foodprice' ++ */}
              {currentProduct.foodname} - ₹{currentProduct.foodprice}
            </h4>
            <button
              className="btn btn-danger btn-sm"
              onClick={handleDeleteItem}
            >
              Delete ITEM
            </button>
          </div>

          <div className="table-responsive">
            <table className="table table-bordered mu-hub-table">
              <thead>
                <tr>
                  <th>Hub</th>
                  <th>Quantity</th>
                  <th>Hub Priority</th>
                  <th>Hub Pricing</th>
                  <th>Pre Order Pricing</th>
                  <th>Option to close</th>
                </tr>
              </thead>
              <tbody>
                {/* 11. FIX: Use allHubs from state ++ */}
                {allHubs.map((hub) => {
                  const assignment = currentAssignments[hub._id];
                  const isDisabled = !assignment?.isActive;
                  return (
                    <tr
                      key={hub._id}
                      className={isDisabled ? "row-disabled" : ""}
                    >
                      {/* Use 'hubName' from your API response */}
                      <td>{hub.hubName}</td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          disabled={isDisabled}
                          value={assignment?.totalQuantity || 0}
                          onChange={(e) =>
                            handleAssignmentChange(
                              hub._id,
                              "totalQuantity",
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          disabled={isDisabled}
                          value={assignment?.hubPriority || 0}
                          onChange={(e) =>
                            handleAssignmentChange(
                              hub._id,
                              "hubPriority",
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          disabled={isDisabled}
                          value={assignment?.hubPrice || 0}
                          onChange={(e) =>
                            handleAssignmentChange(
                              hub._id,
                              "hubPrice",
                              e.target.value
                            )
                          }
                        />
                      </td>  <td>
                        <input
                          type="number"
                          className="form-control"
                          disabled={isDisabled}
                          value={assignment?.preOrderPrice || 0}
                          onChange={(e) =>
                            handleAssignmentChange(
                              hub._id,
                              "preOrderPrice",
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td>
                        <button
                          className={`btn ${
                            isDisabled ? "btn-success" : "btn-danger"
                          }`}
                          onClick={() => handleToggleHubActive(hub._id)}
                        >
                          {isDisabled ? <FaPlus /> : <FaTimes />}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mu-footer">
            <button
              className="btn btn-outline-secondary"
              onClick={() => setCurrentProductIndex(currentProductIndex - 1)}
              disabled={currentProductIndex === 0 || loading}
            >
              Previous
            </button>

            {currentProductIndex === addedProducts.length - 1 ? (
              <button
                className="btn btn-success"
                onClick={handleSaveAllClick}
                disabled={loading}
              >
                {loading ? "Saving..." : "Add all"}
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={handleNextClick}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save & Next"}
              </button>
            )}
          </div>
        </div>
      </Box>
    );
  }

  // --- VIEW 1: PRODUCT SELECTION (Matching image_65ca39.png) ---
  return (
    <Box sx={{ p: 3 }}>
      <div className="mu-container">
        <div className="mu-header">
          <h3>Menu Upload</h3>
        </div>

        <div className="row">
          <div className="col-md-6 form-group">
            <label>+ Select Date</label>
            <input
              type="date"
              className="form-control"
              value={menuDate}
              onChange={(e) => setMenuDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]} // Today's date
            />
          </div>
          <div className="col-md-6 form-group">
            <label>+ Select Session</label>
            <select
              className="form-control"
              value={session}
              onChange={(e) => setSession(e.target.value)}
            >
              <option value="">Select Lunch / Dinner</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
            </select>
          </div>
        </div>

        <div className="form-group mu-product-search-container">
          <label>+ Add Product (For that particular date and session)</label>
          <div className="mu-search-wrapper">
            <input
              type="text"
              className="form-control"
              placeholder="Search product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="mu-search-icon" />
          </div>
          {filteredProducts.length > 0 && (
            <div className="mu-search-results">
              {filteredProducts.map((product) => (
                <div key={product._id} className="mu-search-result-item">
                  <img
                    // 12. FIX: Use your 'Foodgallery' field
                    src={
                      product.Foodgallery[0]?.image2 ||
                      "/Assets/logo-container.svg"
                    }
                    alt={product.foodname}
                  />
                  <span>
                    {/* 13. FIX: Use your 'foodname' and 'foodprice' fields */}
                    {product.foodname} (₹{product.foodprice})
                  </span>
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => handleAddProduct(product)}
                  >
                    <FaPlus /> ADD
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mu-added-list">
          <label>Added Lists</label>
          <div className="mu-added-list-items">
            {addedProducts.length === 0 ? (
              <p className="mu-no-items">No products added yet.</p>
            ) : (
              addedProducts.map((product) => (
                <span key={product._id} className="mu-added-item-tag">
                  {/* 14. FIX: Use your 'foodname' field */}
                  {product.foodname}
                  <button onClick={() => handleRemoveProduct(product._id)}>
                    <FaTimes />
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        <div className="mu-footer">
          <button
            className="btn btn-primary btn-lg"
            onClick={handleGoToAssignment}
          >
            Assign to Hub
          </button>
        </div>
      </div>
    </Box>
  );
};

export default MenuUpload;
