import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import moment from "moment";
import ReactPaginate from "react-paginate";
import "./PackerList.css";

const PackerList = () => {
  // Modal states
  const [showAddPacker, setShowAddPacker] = useState(false);
  const [showEditPacker, setShowEditPacker] = useState(false);
  const [showDeletePacker, setShowDeletePacker] = useState(false);

  const handleCloseAddPacker = () => {
    setShowAddPacker(false);
    setSelectedHubs([]);
    setSelectedLocations([]);
  };
  const handleShowAddPacker = () => {
    setNewPacker({ username: "", mobileNumber: "", hubs: [], locations: [] });
    setSelectedHubs([]);
    setSelectedLocations([]);
    setShowAddPacker(true);
  };
  const handleCloseEditPacker = () => {
    setShowEditPacker(false);
    setSelectedPacker(null);
    setSelectedHubs([]);
    setSelectedLocations([]);
  };
  const handleShowEditPacker = (packer) => {
    setSelectedPacker(packer);
    setEditPacker({
      username: packer.username || "",
      mobileNumber: packer.mobileNumber || "",
      hubs: packer.hubs || [],
      locations: packer.locations || [],
    });
    setSelectedHubs(packer.hubs || []);
    setSelectedLocations(packer.locations || []);
    setShowEditPacker(true);
  };
  const handleCloseDeletePacker = () => setShowDeletePacker(false);
  const handleShowDeletePacker = (packer) => {
    setSelectedPacker(packer);
    setShowDeletePacker(true);
  };

  // Packer data states
  const [packers, setPackers] = useState([]);
  const [noChangeData, setNoChangeData] = useState([]);
  const [searchH, setSearchH] = useState("");
  const [loading, setLoading] = useState(false);

  // Hub and location states
  const [hubs, setHubs] = useState([]); // [{ hubId, hubName, locations: [] }]
  const [selectedHubs, setSelectedHubs] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);

  // Add/Edit/Delete packer states
  const [newPacker, setNewPacker] = useState({
    username: "",
    mobileNumber: "",
    hubs: [],
    locations: [],
  });
  const [editPacker, setEditPacker] = useState({
    username: "",
    mobileNumber: "",
    hubs: [],
    locations: [],
  });
  const [selectedPacker, setSelectedPacker] = useState(null);
  const [addPackerLoading, setAddPackerLoading] = useState(false);
  const [editPackerLoading, setEditPackerLoading] = useState(false);
  const [deletePackerLoading, setDeletePackerLoading] = useState(false);

  // Toast states
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Theme state
  const [theme, setTheme] = useState("light");

  // Pagination states
  const [pageNumber, setPageNumber] = useState(0);
  const packersPerPage = 6;
  const pagesVisited = pageNumber * packersPerPage;
  const pageCount = Math.ceil(packers.length / packersPerPage);

  // Assume token is stored in localStorage
  const token = localStorage.getItem("authToken");

  // Phone number formatting and validation for Indian numbers
  //   const  = (value) => {
  //     if (!value) return "";
  //     const digits = value.replace(/\D/g, "");
  //     if (digits.length <= 5) return digits;
  //     return `${digits.slice(0, 5)} ${digits.slice(5, 10)}`;
  //   };

  const cleanPhoneNumber = (value) => {
    const digits = value.replace(/\D/g, "");
    return digits.length === 10 ? `+91${digits}` : digits;
  };

  const validatePhoneNumber = (value) => {
    const digits = value.replace(/\D/g, "");
    return digits.length === 10 && /^[6-9]/.test(digits);
  };

  // Show toast notification
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  // Fetch hubs
  const getHubs = async () => {
    try {
      const res = await axios.get("http://localhost:7013/api/Hub/hubs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHubs(res.data);
    } catch (error) {
      console.error("Error fetching hubs:", error);
      showToast(
        error?.response?.data?.message || "Failed to fetch hubs.",
        "error"
      );
    }
  };

  // Fetch packers
  const getPackers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "http://localhost:7013/api/packer/getAllPacker",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPackers(res.data);
      setNoChangeData(res.data);
    } catch (error) {
      console.error("Error fetching packers:", error);
      showToast(
        error?.response?.data?.message || "Failed to fetch packers.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Add Packer
  const handleAddPacker = async () => {
    if (
      !newPacker.username ||
      !newPacker.mobileNumber ||
      !newPacker.hubs.length ||
      !newPacker.locations.length
    ) {
      showToast("All fields are required.", "error");
      return;
    }
    if (!validatePhoneNumber(newPacker.mobileNumber)) {
      showToast(
        "Invalid Indian mobile number. It must be 10 digits starting with 6, 7, 8, or 9.",
        "error"
      );
      return;
    }
    setAddPackerLoading(true);
    try {
      const payload = {
        ...newPacker,
        mobileNumber: cleanPhoneNumber(newPacker.mobileNumber),
      };
      const res = await axios.post(
        "http://localhost:7013/api/packer/createpacker",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.status === 201) {
        showToast("Packer added successfully");
        handleCloseAddPacker();
        getPackers();
      }
    } catch (error) {
      console.error("Error adding packer:", error);
      showToast(
        error?.response?.data?.error || "Failed to add packer.",
        "error"
      );
    } finally {
      setAddPackerLoading(false);
    }
  };

  // Edit Packer
  const handleEditPacker = async () => {
    if (
      !editPacker.username ||
      !editPacker.mobileNumber ||
      !editPacker.hubs.length ||
      !editPacker.locations.length
    ) {
      showToast("All fields are required.", "error");
      return;
    }
    if (!validatePhoneNumber(editPacker.mobileNumber)) {
      showToast(
        "Invalid Indian mobile number. It must be 10 digits starting with 6, 7, 8, or 9.",
        "error"
      );
      return;
    }
    setEditPackerLoading(true);
    try {
      const payload = {
        ...editPacker,
        mobileNumber: cleanPhoneNumber(editPacker.mobileNumber),
        packerId: selectedPacker.packerId,
      };
      const res = await axios.put(
        `http://localhost:7013/api/packer/updatePacker`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.status === 200) {
        showToast("Packer updated successfully");
        handleCloseEditPacker();
        getPackers();
      }
    } catch (error) {
      console.error("Error updating packer:", error);
      showToast(
        error?.response?.data?.message || "Failed to update packer.",
        "error"
      );
    } finally {
      setEditPackerLoading(false);
    }
  };

  // Delete Packer
  const handleDeletePacker = async () => {
    setDeletePackerLoading(true);
    try {
      const res = await axios.delete(
        `http://localhost:7013/api/packer/deletPacker/${selectedPacker.packerId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.status === 200) {
        showToast("Packer deleted successfully");
        setShowDeletePacker(false);
        setSelectedPacker(null);
        getPackers();
      }
    } catch (error) {
      console.error("Error deleting packer:", error);
      showToast(
        error?.response?.data?.message || "Failed to delete packer.",
        "error"
      );
    } finally {
      setDeletePackerLoading(false);
    }
  };

  // Search filter
  const handleFilterH = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearchH(searchTerm);
    setPageNumber(0);
    if (searchTerm) {
      const filteredData = noChangeData.filter((packer) => {
        const username = packer.username
          ? String(packer.username).toLowerCase()
          : "";
        const mobileNumber = packer.mobileNumber
          ? String(packer.mobileNumber).toLowerCase()
          : "";
        const packerId = packer.packerId
          ? String(packer.packerId).toLowerCase()
          : "";
        const hubs = packer.hubs
          ? packer.hubs.map((hub) => String(hub).toLowerCase())
          : [];
        const locations = packer.locations
          ? packer.locations.map((loc) => String(loc).toLowerCase())
          : [];
        return (
          username.includes(searchTerm) ||
          mobileNumber.includes(searchTerm) ||
          packerId.includes(searchTerm) ||
          hubs.some((hub) => hub.includes(searchTerm)) ||
          locations.some((loc) => loc.includes(searchTerm))
        );
      });
      setPackers(filteredData || []);
    } else {
      setPackers(noChangeData || []);
    }
  };

  // Export Excel
  const handleExportExcel = () => {
    setLoading(true);
    try {
      const customHeaders = noChangeData.map((item) => ({
        "Registered Date": moment(item.createdAt).format("MM/DD/YYYY, hh:mm A"),
        "Packer ID": item.packerId || "N/A",
        Username: item.username || "N/A",
        "Mobile Number": item.mobileNumber,
        Hubs: item.hubs ? item.hubs.join(", ") : "N/A",
        Locations: item.locations ? item.locations.join(", ") : "N/A",
      }));

      const worksheet = XLSX.utils.json_to_sheet(customHeaders);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Packer List");
      XLSX.writeFile(
        workbook,
        `PackerList_${moment().format("YYYYMMDD")}.xlsx`
      );
      showToast("Exported to Excel successfully");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      showToast("Failed to export to Excel.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Pagination
  const changePage = ({ selected }) => {
    setPageNumber(selected);
  };

  // Fetch packers and hubs on mount
  useEffect(() => {
    getPackers();
    getHubs();
  }, []);

  // Handle hub change
  const handleHubChange = (e, isEdit = false) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(
      (option) => option.value
    );
    setSelectedHubs(selectedOptions);
    setSelectedLocations([]); // Reset locations when hubs change
    if (isEdit) {
      setEditPacker({ ...editPacker, hubs: selectedOptions, locations: [] });
    } else {
      setNewPacker({ ...newPacker, hubs: selectedOptions, locations: [] });
    }
  };

  // Handle location change
  const handleLocationChange = (e, isEdit = false) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(
      (option) => option.value
    );
    setSelectedLocations(selectedOptions);
    if (isEdit) {
      setEditPacker({ ...editPacker, locations: selectedOptions });
    } else {
      setNewPacker({ ...newPacker, locations: selectedOptions });
    }
  };

  // Handle Enter key for modals
  const handleKeyDown = (e, action) => {
    if (e.key === "Enter") {
      action();
    }
  };

  // Get locations for selected hubs
  const getLocationsForHubs = (hubIds) => {
    const locations = hubIds
      .map((hubId) => hubs.find((h) => h.hubId === hubId)?.locations || [])
      .flat()
      .filter((loc, index, self) => self.indexOf(loc) === index); // Remove duplicates
    return locations;
  };

  return (
    <div className={`placker-list ${theme}`}>
      {/* Full-screen loading overlay */}
      {loading && (
        <div className="placker-list-loading-overlay">
          <svg
            className="placker-list-spinner placker-list-spinner-large"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="placker-list-spinner-circle"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="placker-list-spinner-path"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
            />
          </svg>
        </div>
      )}

      <div className="placker-list-header">
        <h2 className="placker-list-title">Packer List</h2>
        {/* <button
          onClick={toggleTheme}
          className="placker-list-button placker-list-button-theme"
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
        >
          {theme === "light" ? "Dark" : "Light"} Theme
        </button> */}
      </div>

      {/* Toast Notification */}
      <div
        className={`placker-list-toast ${
          toast.show ? "placker-list-toast-visible" : ""
        } placker-list-toast-${toast.type}`}
        role="alert"
      >
        {toast.message}
      </div>

      {/* Filters */}
      <div className="placker-list-filters">
        <div className="placker-list-search">
          <svg
            className="placker-list-search-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search by Username, Mobile, ID, Hubs, or Locations..."
            value={searchH}
            onChange={handleFilterH}
            className="placker-list-search-input"
            aria-label="Search packers"
          />
        </div>
        <div className="placker-list-buttons">
          <button
            onClick={handleExportExcel}
            className="placker-list-button placker-list-button-export"
            aria-label="Export packer list to Excel"
            disabled={loading}
          >
            {loading ? (
              <svg
                className="placker-list-spinner"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="placker-list-spinner-circle"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="placker-list-spinner-path"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
                />
              </svg>
            ) : (
              "Export Excel"
            )}
          </button>
          <button
            onClick={handleShowAddPacker}
            className="placker-list-button placker-list-button-add"
            aria-label="Add new packer"
            disabled={loading}
          >
            Add Packer
          </button>
        </div>
      </div>

      {/* Packer Table */}
      <div className="placker-list-table-container">
        <table className="placker-list-table" aria-label="Packer list table">
          <thead className="placker-list-table-head">
            <tr>
              <th className="placker-list-table-header">SL.NO</th>
              <th className="placker-list-table-header">Packer ID</th>
              <th className="placker-list-table-header">Name</th>
              <th className="placker-list-table-header">Mobile_Number</th>
              <th className="placker-list-table-header">Hubs</th>
              <th className="placker-list-table-header">Locations</th>
              <th className="placker-list-table-header">Actions</th>
            </tr>
          </thead>
          <tbody>
            {packers.length > 0 ? (
              packers
                ?.slice(pagesVisited, pagesVisited + packersPerPage)
                .map((item, i) => (
                  <tr key={item._id} className="placker-list-table-row">
                    <td className="placker-list-table-cell">
                      {i + 1 + pagesVisited}
                    </td>
                    <td className="placker-list-table-cell">
                      {item.packerId || "N/A"}
                    </td>
                    <td className="placker-list-table-cell">
                      {item.username || "N/A"}
                    </td>
                    <td className="placker-list-table-cell">
                      {item.mobileNumber || "N/A"}
                    </td>
                    <td className="placker-list-table-cell">
                      {item.hubs ? item.hubs.join(", ") : "N/A"}
                    </td>
                    <td className="placker-list-table-cell">
                      {item.locations ? item.locations.join(", ") : "N/A"}
                    </td>
                    <td className="placker-list-table-cell">
                      <button
                        onClick={() => handleShowEditPacker(item)}
                        className="placker-list-action-button placker-list-action-edit"
                        aria-label={`Edit packer ${item.username}`}
                        disabled={loading}
                      >
                        <svg
                          className="placker-list-action-icon"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15.232 5.232l3.536 3.536m-2.036-1.036l-9 9-3 1 1-3 9-9z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleShowDeletePacker(item)}
                        className="placker-list-action-button placker-list-action-delete"
                        aria-label={`Delete packer ${item.username}`}
                        disabled={loading}
                      >
                        <svg
                          className="placker-list-action-icon"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan={7} className="placker-list-table-empty">
                  No packers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {packers.length > 0 && (
        <div className="placker-list-pagination">
          <p className="placker-list-pagination-count">
            Total Count: {packers.length}
          </p>
          <ReactPaginate
            previousLabel={"Back"}
            nextLabel={"Next"}
            pageCount={pageCount}
            onPageChange={changePage}
            containerClassName={"placker-list-pagination-buttons"}
            previousLinkClassName={"placker-list-pagination-prev"}
            nextLinkClassName={"placker-list-pagination-next"}
            disabledClassName={"placker-list-pagination-disabled"}
            activeClassName={"placker-list-pagination-active"}
          />
        </div>
      )}

      {/* Add Packer Modal */}
      <div
        className={`placker-list-modal ${
          showAddPacker ? "placker-list-modal-visible" : ""
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="placker-list-modal-content">
          <h3 className="placker-list-modal-title">Add New Packer</h3>
          <div className="placker-list-modal-body">
            <div className="placker-list-form-group">
              <label className="placker-list-form-label" htmlFor="add-username">
                Username
              </label>
              <input
                id="add-username"
                type="text"
                value={newPacker.username}
                onChange={(e) =>
                  setNewPacker({ ...newPacker, username: e.target.value })
                }
                onKeyDown={(e) => handleKeyDown(e, handleAddPacker)}
                className="placker-list-form-input"
                placeholder="Enter username"
                required
                aria-required="true"
                disabled={addPackerLoading}
              />
            </div>
            <div className="placker-list-form-group">
              <label className="placker-list-form-label" htmlFor="add-mobile">
                Mobile Number
              </label>
              <input
                id="add-mobile"
                type="tel"
                value={newPacker.mobileNumber}
                onChange={(e) =>
                  setNewPacker({ ...newPacker, mobileNumber: e.target.value })
                }
                onKeyDown={(e) => handleKeyDown(e, handleAddPacker)}
                className="placker-list-form-input"
                placeholder="XXXXX XXXXX"
                required
                aria-required="true"
                disabled={addPackerLoading}
              />
            </div>
            <div className="placker-list-form-group">
              <label className="placker-list-form-label" htmlFor="add-hubs">
                Hubs
              </label>
              <select
                id="add-hubs"
                multiple
                value={selectedHubs}
                onChange={(e) => handleHubChange(e, false)}
                className="placker-list-form-select placker-list-form-select-multiple"
                required
                aria-required="true"
                disabled={addPackerLoading}
              >
                {hubs.map((hub) => (
                  <option key={hub.hubId} value={hub.hubId}>
                    {hub.hubName}
                  </option>
                ))}
              </select>
            </div>
            <div className="placker-list-form-group">
              <label
                className="placker-list-form-label"
                htmlFor="add-locations"
              >
                Locations
              </label>
              <select
                id="add-locations"
                multiple
                value={selectedLocations}
                onChange={(e) => handleLocationChange(e, false)}
                className="placker-list-form-select placker-list-form-select-multiple"
                required
                aria-required="true"
                disabled={addPackerLoading || !selectedHubs.length}
              >
                {getLocationsForHubs(selectedHubs).map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>
            <div className="placker-list-modal-footer">
              <button
                onClick={handleCloseAddPacker}
                className="placker-list-button placker-list-button-cancel"
                disabled={addPackerLoading}
                aria-label="Cancel adding packer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPacker}
                className="placker-list-button placker-list-button-primary"
                disabled={addPackerLoading}
                aria-label="Add packer"
              >
                {addPackerLoading ? (
                  <svg
                    className="placker-list-spinner"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="placker-list-spinner-circle"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="placker-list-spinner-path"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
                    />
                  </svg>
                ) : (
                  "Add Packer"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Packer Modal */}
      <div
        className={`placker-list-modal ${
          showEditPacker ? "placker-list-modal-visible" : ""
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="placker-list-modal-content">
          <h3 className="placker-list-modal-title">Edit Packer</h3>
          <div className="placker-list-modal-body">
            <div className="placker-list-form-group">
              <label
                className="placker-list-form-label"
                htmlFor="edit-username"
              >
                Username
              </label>
              <input
                id="edit-username"
                type="text"
                value={editPacker.username}
                onChange={(e) =>
                  setEditPacker({ ...editPacker, username: e.target.value })
                }
                onKeyDown={(e) => handleKeyDown(e, handleEditPacker)}
                className="placker-list-form-input"
                placeholder="Enter username"
                required
                aria-required="true"
                disabled={editPackerLoading}
              />
            </div>
            <div className="placker-list-form-group">
              <label className="placker-list-form-label" htmlFor="edit-mobile">
                Mobile Number
              </label>
              <input
                id="edit-mobile"
                type="tel"
                value={editPacker.mobileNumber}
                onChange={(e) =>
                  setEditPacker({ ...editPacker, mobileNumber: e.target.value })
                }
                onKeyDown={(e) => handleKeyDown(e, handleEditPacker)}
                className="placker-list-form-input"
                placeholder="XXXXX XXXXX"
                required
                aria-required="true"
                disabled={editPackerLoading}
              />
            </div>
            <div className="placker-list-form-group">
              <label className="placker-list-form-label" htmlFor="edit-hubs">
                Hubs
              </label>
              <select
                id="edit-hubs"
                multiple
                value={selectedHubs}
                onChange={(e) => handleHubChange(e, true)}
                className="placker-list-form-select placker-list-form-select-multiple"
                required
                aria-required="true"
                disabled={editPackerLoading}
              >
                {hubs.map((hub) => (
                  <option key={hub.hubId} value={hub.hubId}>
                    {hub.hubName}
                  </option>
                ))}
              </select>
            </div>
            <div className="placker-list-form-group">
              <label
                className="placker-list-form-label"
                htmlFor="edit-locations"
              >
                Locations
              </label>
              <select
                id="edit-locations"
                multiple
                value={selectedLocations}
                onChange={(e) => handleLocationChange(e, true)}
                className="placker-list-form-select placker-list-form-select-multiple"
                required
                aria-required="true"
                disabled={editPackerLoading || !selectedHubs.length}
              >
                {getLocationsForHubs(selectedHubs).map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>
            <div className="placker-list-modal-footer">
              <button
                onClick={handleCloseEditPacker}
                className="placker-list-button placker-list-button-cancel"
                disabled={editPackerLoading}
                aria-label="Cancel editing packer"
              >
                Cancel
              </button>
              <button
                onClick={handleEditPacker}
                className="placker-list-button placker-list-button-primary"
                disabled={editPackerLoading}
                aria-label="Save packer changes"
              >
                {editPackerLoading ? (
                  <svg
                    className="placker-list-spinner"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="placker-list-spinner-circle"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="placker-list-spinner-path"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
                    />
                  </svg>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Packer Modal */}
      <div
        className={`placker-list-modal ${
          showDeletePacker ? "placker-list-modal-visible" : ""
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="placker-list-modal-content">
          <h3 className="placker-list-modal-title placker-list-modal-title-delete">
            Delete Packer
          </h3>
          <p className="placker-list-modal-text">
            Are you sure you want to delete {selectedPacker?.username} (ID:{" "}
            {selectedPacker?.packerId})?
          </p>
          <div className="placker-list-modal-footer">
            <button
              onClick={handleCloseDeletePacker}
              className="placker-list-button placker-list-button-cancel"
              disabled={deletePackerLoading}
              aria-label="Cancel deleting packer"
            >
              Cancel
            </button>
            <button
              onClick={handleDeletePacker}
              className="placker-list-button placker-list-button-delete"
              disabled={deletePackerLoading}
              aria-label="Delete packer"
            >
              {deletePackerLoading ? (
                <svg
                  className="placker-list-spinner"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="placker-list-spinner-circle"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="placker-list-spinner-path"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
                  />
                </svg>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackerList;
