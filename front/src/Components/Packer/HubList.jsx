import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import moment from "moment";
import ReactPaginate from "react-paginate";
import {
  Modal,
  Button,
  Form,
  Spinner,
  Alert,
  Table,
  Badge,
  Card,
  Row,
  Col,
} from "react-bootstrap";
import "./HubList.css";
import AreaSelector from "../Map/AreaSelector";

const HubList = () => {
  // Modal states
  const [showAddHub, setShowAddHub] = useState(false);
  const [showEditHub, setShowEditHub] = useState(false);
  const [showDeleteHub, setShowDeleteHub] = useState(false);
  const [showViewAllPolygons, setShowViewAllPolygons] = useState(false);

  // Hub data states
  const [hubs, setHubs] = useState([]);
  const [noChangeData, setNoChangeData] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Add/Edit/Delete hub states
  const [newHub, setNewHub] = useState({
    hubName: "",
    locations: [],
    geometry: null,
  });
  const [editHub, setEditHub] = useState({
    hubId: "",
    hubName: "",
    locations: [],
    geometry: null,
  });
  const [selectedHub, setSelectedHub] = useState(null);
  const [addHubLoading, setAddHubLoading] = useState(false);
  const [editHubLoading, setEditHubLoading] = useState(false);
  const [deleteHubLoading, setDeleteHubLoading] = useState(false);

  // Toast state
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Pagination states
  const [pageNumber, setPageNumber] = useState(0);
  const hubsPerPage = 6;
  const pagesVisited = pageNumber * hubsPerPage;
  const pageCount = Math.ceil(hubs.length / hubsPerPage);

  // Location data states
  const [corporateLocations, setCorporateLocations] = useState([]);
  const [apartmentLocations, setApartmentLocations] = useState([]);
  const [allLocations, setAllLocations] = useState([]);

  // Token from localStorage
  const token = localStorage.getItem("authToken");

  // Fetch corporate locations
  const getCorporateLocations = useCallback(async () => {
    try {
      const res = await axios.get(
        "http://localhost:7013/api/admin/getcorporate",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.status === 200) {
        setCorporateLocations(res.data.corporatedata);
      }
    } catch (error) {
      console.error("Error fetching corporate locations:", error);
      showToast("Failed to fetch corporate locations.", "error");
    }
  }, [token]);

  // Fetch apartment locations
  const getApartmentLocations = useCallback(async () => {
    try {
      const res = await axios.get(
        "http://localhost:7013/api/admin/getapartment",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.status === 200) {
        setApartmentLocations(res.data.corporatedata);
      }
    } catch (error) {
      console.error("Error fetching apartment locations:", error);
      showToast("Failed to fetch apartment locations.", "error");
    }
  }, [token]);

  // Combine all locations
  useEffect(() => {
    const combinedLocations = [
      ...corporateLocations.map((loc) => ({
        value: `${loc.Apartmentname}, ${loc.Address}, ${loc.pincode}`,
        label: `${loc.Apartmentname}, ${loc.Address}, ${loc.pincode}`,
        type: "Corporate",
      })),
      ...apartmentLocations.map((loc) => ({
        value: `${loc.Apartmentname}, ${loc.Address}, ${loc.pincode}`,
        label: `${loc.Apartmentname}, ${loc.Address}, ${loc.pincode}`,
        type: "Apartment",
      })),
    ];
    setAllLocations(combinedLocations);
  }, [corporateLocations, apartmentLocations]);

  // Show toast notification
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    alert(message);
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  // Fetch hubs
  const getHubs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:7013/api/Hub/hubs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHubs(res.data);
      setNoChangeData(res.data);
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Failed to fetch hubs.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Add Hub
  const handleAddHub = async () => {
    if (!newHub.hubName.trim()) {
      showToast("Hub name is required.", "error");
      return;
    }
    // if (!newHub.locations.length) {
    //   showToast("At least one location is required.", "error");
    //   return;
    // }
    if (!newHub.geometry) {
      showToast("Please draw a service area polygon on the map.", "error");
      return;
    }
    setAddHubLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:7013/api/Hub/hubs",
        {
          hubName: newHub.hubName.trim(),
          locations: newHub.locations,
          geometry: newHub.geometry,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.status === 201) {
        showToast("Hub added successfully");
        setShowAddHub(false);
        setNewHub({ hubName: "", locations: [], geometry: null });
        getHubs();
      }
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Failed to add hub.",
        "error"
      );
    } finally {
      setAddHubLoading(false);
    }
  };

  // Edit Hub
  const handleEditHub = async () => {
    if (!editHub.hubName.trim()) {
      showToast("Hub name is required.", "error");
      return;
    }
    // if (!editHub.locations.length) {
    //   showToast("At least one location is required.", "error");
    //   return;
    // }
    setEditHubLoading(true);
    try {
      const payload = {
        hubName: editHub.hubName.trim(),
        locations: editHub.locations,
      };
      if (editHub.geometry) {
        payload.geometry = editHub.geometry;
      }
      const res = await axios.put(
        `http://localhost:7013/api/Hub/hubs/${editHub.hubId}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.status === 200) {
        showToast("Hub updated successfully");
        setShowEditHub(false);
        getHubs();
      }
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Failed to update hub.",
        "error"
      );
    } finally {
      setEditHubLoading(false);
    }
  };

  // Delete Hub
  const handleDeleteHub = async () => {
    setDeleteHubLoading(true);
    try {
      const res = await axios.delete(
        `http://localhost:7013/api/Hub/hubs/${selectedHub.hubId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.status === 200) {
        showToast("Hub deleted successfully");
        setShowDeleteHub(false);
        setSelectedHub(null);
        getHubs();
      }
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Failed to delete hub.",
        "error"
      );
    } finally {
      setDeleteHubLoading(false);
    }
  };

  // Search filter
  const handleFilter = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearch(searchTerm);
    setPageNumber(0);
    if (searchTerm) {
      const filteredData = noChangeData.filter((hub) => {
        const hubName = hub.hubName ? hub.hubName.toLowerCase() : "";
        const hubId = hub.hubId ? hub.hubId.toLowerCase() : "";
        const locations = hub.locations
          ? hub.locations.join(" ").toLowerCase()
          : "";
        return (
          hubName.includes(searchTerm) ||
          hubId.includes(searchTerm) ||
          locations.includes(searchTerm)
        );
      });
      setHubs(filteredData);
    } else {
      setHubs(noChangeData);
    }
  };

  // Export Excel
  const handleExportExcel = () => {
    setLoading(true);
    try {
      const customHeaders = noChangeData.map((item) => ({
        "Hub ID": item.hubId || "N/A",
        "Hub Name": item.hubName || "N/A",
        "Total Locations": item.locations ? item.locations.length : 0,
        Locations: item.locations ? item.locations.join(", ") : "N/A",
      }));
      const worksheet = XLSX.utils.json_to_sheet(customHeaders);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Hub List");
      XLSX.writeFile(workbook, `HubList_${moment().format("YYYYMMDD")}.xlsx`);
      showToast("Exported to Excel successfully");
    } catch (e) {
      console.error(e);
      showToast("Failed to export to Excel.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Pagination
  const changePage = ({ selected }) => setPageNumber(selected);

  // Fetch data on mount
  useEffect(() => {
    getHubs();
    getCorporateLocations();
    getApartmentLocations();
    // These functions are memoized, so this runs once per token change
  }, [getHubs, getCorporateLocations, getApartmentLocations]);

  // Get location type badge
  const getLocationBadge = (location) => {
    const locationData = allLocations.find((loc) => loc.value === location);
    return locationData ? (
      <Badge
        bg={locationData.type === "Corporate" ? "info" : "success"}
        className="me-1 mb-1"
      >
        {locationData.type}
      </Badge>
    ) : null;
  };

  // Location selector component
  const LocationSelector = ({
    selectedLocations,
    onLocationChange,
    disabled = false,
  }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const filteredLocations = allLocations.filter((location) =>
      location.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleLocationToggle = (locationValue) => {
      const newLocations = selectedLocations.includes(locationValue)
        ? selectedLocations.filter((loc) => loc !== locationValue)
        : [...selectedLocations, locationValue];
      onLocationChange(newLocations);
    };

    return (
      <div className="location-selector">
        <div className="selected-locations mb-2">
          {selectedLocations.map((location) => (
            <Badge
              key={location}
              bg="primary"
              className="me-1 mb-1 d-flex align-items-center"
              style={{ fontSize: "0.75rem" }}
            >
              {location.split(",")[0]}
              <button
                type="button"
                className="btn-close btn-close-white ms-1"
                style={{ fontSize: "0.5rem" }}
                onClick={() => handleLocationToggle(location)}
                disabled={disabled}
              />
            </Badge>
          ))}
        </div>
        <div className="dropdown">
          <Form.Control
            type="text"
            placeholder="Search and select locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsDropdownOpen(true)}
            disabled={disabled}
          />
          {isDropdownOpen && (
            <div
              className="dropdown-menu show w-100"
              style={{ maxHeight: "200px", overflowY: "auto" }}
            >
              {filteredLocations.map((location) => (
                <div
                  key={location.value}
                  className={`dropdown-item d-flex align-items-center justify-content-between ${
                    selectedLocations.includes(location.value) ? "active" : ""
                  }`}
                  onClick={() => handleLocationToggle(location.value)}
                  style={{ cursor: "pointer" }}
                >
                  <span>{location.label}</span>
                  <Badge
                    bg={location.type === "Corporate" ? "info" : "success"}
                  >
                    {location.type}
                  </Badge>
                </div>
              ))}
              {filteredLocations.length === 0 && (
                <div className="dropdown-item text-muted">
                  No locations found
                </div>
              )}
            </div>
          )}
        </div>
        <div className="d-flex justify-content-end mt-2">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => setIsDropdownOpen(false)}
          >
            Close
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="hub-list">
      {/* Toast Notification */}
      <Alert
        variant={toast.type === "success" ? "success" : "danger"}
        show={toast.show}
        className="hub-list-toast position-fixed"
        style={{ top: "20px", right: "20px", zIndex: 1050 }}
      >
        {toast.message}
      </Alert>

      {/* Loading Overlay */}
      {loading && (
        <div
          className="hub-list-loading-overlay position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1040 }}
        >
          <div className="text-center">
            <Spinner animation="border" variant="light" />
            <div className="text-light mt-2">Loading...</div>
          </div>
        </div>
      )}

      <Card className="shadow-sm">
        <Card.Header className=" text-white" style={{ background: "#fe4500" }}>
          <Row className="align-items-center">
            <Col>
              <h4 className="mb-0">Hub Management</h4>
            </Col>
            <Col xs="auto">
              <div className="d-flex gap-2">
                <Button
                  variant="outline-light"
                  onClick={() => setShowViewAllPolygons(true)}
                  disabled={loading}
                  className="d-flex align-items-center"
                >
                  🗺️ View All Polygons
                </Button>
                <Button
                  variant="outline-light"
                  onClick={handleExportExcel}
                  disabled={loading}
                  className="d-flex align-items-center"
                >
                  {loading ? (
                    <Spinner animation="border" size="sm" className="me-2" />
                  ) : null}
                  Export Excel
                </Button>
                <Button
                  variant="light"
                  onClick={() => setShowAddHub(true)}
                  disabled={loading}
                >
                  + Add Hub
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Header>

        <Card.Body>
          {/* Search and Stats */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Control
                type="text"
                placeholder="🔍 Search by Hub Name, ID, or Locations..."
                value={search}
                onChange={handleFilter}
                className="shadow-sm"
              />
            </Col>
            <Col
              md={6}
              className="d-flex align-items-center justify-content-end"
            >
              <div className="text-muted">
                <strong>{hubs.length}</strong> hubs found
              </div>
            </Col>
          </Row>

          {/* Hub Table */}
          <div className="table-responsive">
            <Table striped hover className="shadow-sm">
              <thead className="table-dark">
                <tr>
                  <th width="8%">SL.NO</th>
                  <th width="12%">Hub ID</th>
                  <th width="20%">Hub Name</th>
                  <th width="45%">Locations</th>
                  <th width="15%">Actions</th>
                </tr>
              </thead>
              <tbody>
                {hubs.length > 0 ? (
                  hubs
                    .slice(pagesVisited, pagesVisited + hubsPerPage)
                    .map((hub, i) => (
                      <tr key={hub._id}>
                        <td className="align-middle">{i + 1 + pagesVisited}</td>
                        <td className="align-middle">
                          <Badge bg="secondary">{hub.hubId || "N/A"}</Badge>
                        </td>
                        <td className="align-middle">
                          <strong>{hub.hubName || "N/A"}</strong>
                        </td>
                        <td className="d-flex justify-content-center">
                          <div className="d-flex flex-wrap gap-1">
                            {hub.locations && hub.locations.length > 0 ? (
                              hub.locations.map((location, index) => (
                                <div
                                  key={index}
                                  className="d-flex align-items-center justify-content-center"
                                >
                                  <Badge className="me-1">{location}</Badge>
                                  {getLocationBadge(location)}
                                </div>
                              ))
                            ) : (
                              <span className="text-muted">No locations</span>
                            )}
                          </div>
                          {hub.locations && hub.locations.length > 0 && (
                            <small className="text-muted">
                              {hub.locations.length} location(s)
                            </small>
                          )}
                        </td>
                        <td className="align-middle">
                          <div className="d-flex gap-1">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => {
                                setEditHub({
                                  hubId: hub.hubId,
                                  hubName: hub.hubName,
                                  locations: hub.locations || [],
                                  geometry: hub.geometry || null,
                                });
                                setShowEditHub(true);
                              }}
                              disabled={loading}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => {
                                setSelectedHub(hub);
                                setShowDeleteHub(true);
                              }}
                              disabled={loading}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-4">
                      <div className="text-muted">
                        {search
                          ? "No hubs found matching your search."
                          : "No hubs available."}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          {/* Pagination */}
          {hubs.length > hubsPerPage && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <div className="text-muted">
                Showing {pagesVisited + 1} to{" "}
                {Math.min(pagesVisited + hubsPerPage, hubs.length)} of{" "}
                {hubs.length} entries
              </div>
              <ReactPaginate
                previousLabel="← Previous"
                nextLabel="Next →"
                pageCount={pageCount}
                onPageChange={changePage}
                containerClassName="pagination mb-0"
                previousLinkClassName="page-link"
                nextLinkClassName="page-link"
                disabledClassName="disabled"
                activeClassName="active"
                pageLinkClassName="page-link"
                pageClassName="page-item"
                previousClassName="page-item"
                nextClassName="page-item"
              />
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Add Hub Modal */}
      <Modal
        show={showAddHub}
        onHide={() => setShowAddHub(false)}
        size="lg"
        fullscreen
        style={{ zIndex: 99999 }}
      >
        <Modal.Header
          closeButton
          className="text-white"
          style={{ background: "#fe4500" }}
        >
          <Modal.Title className="text-white">Add New Hub</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "80vh", overflowY: "auto" }}>
          <Form>
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">Hub Name</Form.Label>
              <Form.Control
                type="text"
                value={newHub.hubName}
                onChange={(e) =>
                  setNewHub({ ...newHub, hubName: e.target.value })
                }
                placeholder="Enter hub name"
                className="shadow-sm"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">
                Locations ({newHub.locations.length} selected)
              </Form.Label>
              <LocationSelector
                selectedLocations={newHub.locations}
                onLocationChange={(locations) =>
                  setNewHub({ ...newHub, locations })
                }
                disabled={addHubLoading}
              />
              {allLocations.length === 0 && (
                <Form.Text className="text-danger">
                  No locations available. Please add locations first.
                </Form.Text>
              )}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">
                Service Area (Polygon)
              </Form.Label>
              <div className="border rounded overflow-hidden">
                <AreaSelector
                  apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""}
                  value={newHub.geometry}
                  onGeoJSONChange={(feature) =>
                    setNewHub({ ...newHub, geometry: feature })
                  }
                  editable={!addHubLoading}
                />
              </div>
              <Form.Text muted>
                Draw the hub's service area. This will be saved with the hub.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowAddHub(false)}
            disabled={addHubLoading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAddHub}
            disabled={addHubLoading}
          >
            {addHubLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Adding...
              </>
            ) : (
              "Add Hub"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Hub Modal */}
      <Modal
        show={showEditHub}
        onHide={() => setShowEditHub(false)}
        size="lg"
        fullscreen
        style={{ zIndex: 99999 }}
      >
        <Modal.Header
          closeButton
          className="text-white"
          style={{ background: "#fe4500" }}
        >
          <Modal.Title>Edit Hub</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "80vh", overflowY: "auto" }}>
          <Form>
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">Hub Name</Form.Label>
              <Form.Control
                type="text"
                value={editHub.hubName}
                onChange={(e) =>
                  setEditHub({ ...editHub, hubName: e.target.value })
                }
                placeholder="Enter hub name"
                className="shadow-sm"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">
                Locations ({editHub.locations.length} selected)
              </Form.Label>
              <LocationSelector
                selectedLocations={editHub.locations}
                onLocationChange={(locations) =>
                  setEditHub({ ...editHub, locations })
                }
                disabled={editHubLoading}
              />
              {allLocations.length === 0 && (
                <Form.Text className="text-danger">
                  No locations available. Please add locations first.
                </Form.Text>
              )}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">
                Service Area (Polygon)
              </Form.Label>
              <div className="border rounded overflow-hidden">
                <AreaSelector
                  apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""}
                  value={editHub.geometry}
                  onGeoJSONChange={(feature) =>
                    setEditHub({ ...editHub, geometry: feature })
                  }
                  editable={!editHubLoading}
                />
              </div>
              <Form.Text muted>
                Draw or update the hub's service area. Leave unchanged to keep
                existing polygon.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowEditHub(false)}
            disabled={editHubLoading}
          >
            Cancel
          </Button>
          <Button
            variant="warning"
            onClick={handleEditHub}
            disabled={editHubLoading}
          >
            {editHubLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Updating...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Hub Modal */}
      <Modal show={showDeleteHub} onHide={() => setShowDeleteHub(false)}>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>Delete Hub</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <div className="mb-3">
              <i
                className="fas fa-exclamation-triangle text-danger"
                style={{ fontSize: "3rem" }}
              ></i>
            </div>
            <p className="mb-2">Are you sure you want to delete this hub?</p>
            <div className="alert alert-warning">
              <strong>Hub Name:</strong> {selectedHub?.hubName}
              <br />
              <strong>Hub ID:</strong> {selectedHub?.hubId}
              <br />
              <strong>Locations:</strong> {selectedHub?.locations?.length || 0}
            </div>
            <p className="text-muted">This action cannot be undone.</p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteHub(false)}
            disabled={deleteHubLoading}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteHub}
            disabled={deleteHubLoading}
          >
            {deleteHubLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              "Delete Hub"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View All Polygons Modal */}
      <Modal
        show={showViewAllPolygons}
        onHide={() => setShowViewAllPolygons(false)}
        size="xl"
        fullscreen
        style={{ zIndex: 99999 }}
      >
        <Modal.Header
          closeButton
          className="text-white"
          style={{ background: "#fe4500" }}
        >
          <Modal.Title>All Hub Service Areas</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ height: "85vh", padding: 0 }}>
          <AreaSelector
            apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""}
            value={null}
            allPolygons={hubs
              .filter((hub) => hub.geometry)
              .map((hub) => ({
                geometry: hub.geometry,
                hubName: hub.hubName,
                hubId: hub.hubId,
              }))}
            editable={false}
            viewOnly={true}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowViewAllPolygons(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default HubList;
