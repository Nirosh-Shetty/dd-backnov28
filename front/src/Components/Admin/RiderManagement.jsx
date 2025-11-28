import React, { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Col,
  Form,
  InputGroup,
  Modal,
  Row,
  Table,
} from "react-bootstrap";
import { BsSearch } from "react-icons/bs";
import { BiSolidEdit } from "react-icons/bi";
import { AiFillDelete } from "react-icons/ai";
import { IoMdRefresh } from "react-icons/io";
import ReactPaginate from "react-paginate";
import axios from "axios";

const defaultForm = {
  name: "",
  phone: "",
  alternatePhone: "",
  email: "",
  hub: "",
  vehicleType: "",
  vehicleNumber: "",
  status: "active",
  aadhaarNumber: "",
  licenseNumber: "",
  notes: "",
};

const statusOptions = [
  { label: "All Status", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Blocked", value: "blocked" },
];

const RiderManagement = () => {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formData, setFormData] = useState(defaultForm);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRider, setSelectedRider] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [pageNumber, setPageNumber] = useState(0);
  const [hubOptions, setHubOptions] = useState([]);
  const [hubLoading, setHubLoading] = useState(false);
  const fetchHubOptions = async () => {
    try {
      setHubLoading(true);
      const res = await axios.get("http://localhost:7013/api/Hub/hubs");
      if (res.status === 200) {
        setHubOptions(res.data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setHubLoading(false);
    }
  };

  useEffect(() => {
    fetchHubOptions();
  }, []);


  const perPage = 8;
  const pagesVisited = pageNumber * perPage;

  const fetchRiders = async (opts = { showLoader: true }) => {
    try {
      if (opts.showLoader) setLoading(true);
      const res = await axios.get(
        "http://localhost:7013/api/admin/riders",
        {
          params: {
            status: statusFilter,
            search: search.trim() || undefined,
          },
        }
      );
      if (res.status === 200) {
        setRiders(res.data?.riders || []);
        setPageNumber(0);
      }
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message ||
          "Failed to load riders. Please try again."
      );
    } finally {
      if (opts.showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchRiders({ showLoader: true });
    }, 300);
    return () => clearTimeout(debounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, search]);

  const openCreateModal = () => {
    setFormData(defaultForm);
    setSelectedRider(null);
    setShowFormModal(true);
  };

  const openEditModal = (rider) => {
    setSelectedRider(rider);
    setFormData({
      name: rider.name || "",
      phone: rider.phone || "",
      alternatePhone: rider.alternatePhone || "",
      email: rider.email || "",
      hub: rider.hub || "",
      vehicleType: rider.vehicleType || "",
      vehicleNumber: rider.vehicleNumber || "",
      status: rider.status || "active",
      aadhaarNumber: rider?.documents?.aadhaarNumber || "",
      licenseNumber: rider?.documents?.licenseNumber || "",
      notes: rider.notes || "",
    });
    setShowFormModal(true);
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    setSubmitting(false);
    setFormData(defaultForm);
    setSelectedRider(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name?.trim() || !formData.phone?.trim()) {
      alert("Name and phone number are mandatory.");
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        documents: {
          aadhaarNumber: formData.aadhaarNumber || "",
          licenseNumber: formData.licenseNumber || "",
        },
      };
      delete payload.aadhaarNumber;
      delete payload.licenseNumber;

      const baseConfig = {
        baseURL: "http://localhost:7013/api/admin",
        headers: { "Content-Type": "application/json" },
      };

      let response;
      if (selectedRider?._id) {
        response = await axios({
          ...baseConfig,
          url: `/riders/${selectedRider._id}`,
          method: "put",
          data: payload,
        });
      } else {
        response = await axios({
          ...baseConfig,
          url: "/riders",
          method: "post",
          data: payload,
        });
      }

      if (response.status === 200 || response.status === 201) {
        alert(
          selectedRider ? "Rider updated successfully" : "Rider created successfully"
        );
        closeFormModal();
        fetchRiders({ showLoader: false });
      }
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message ||
          "Failed to save rider. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (rider) => {
    setSelectedRider(rider);
    setShowDeleteModal(true);
  };

  const deleteRider = async () => {
    if (!selectedRider?._id) return;
    try {
      const res = await axios.delete(
        `http://localhost:7013/api/admin/riders/${selectedRider._id}`
      );
      if (res.status === 200) {
        alert("Rider removed successfully");
        setShowDeleteModal(false);
        setSelectedRider(null);
        fetchRiders({ showLoader: false });
      }
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message ||
          "Failed to delete rider. Please try again."
      );
    }
  };

  const filteredRiders = useMemo(() => riders || [], [riders]);
  const pageCount = Math.ceil(filteredRiders.length / perPage) || 0;

  const renderStatusBadge = (status) => {
    const variantMap = {
      active: "success",
      inactive: "warning",
      blocked: "danger",
    };
    return (
      <Badge bg={variantMap[status] || "secondary"} className="text-uppercase">
        {status}
      </Badge>
    );
  };

  return (
    <div className="container p-4">
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center mb-4 gap-3">
        <div>
          <h2 className="header-c mb-1">Delivery Riders</h2>
          <p className="text-muted mb-0">
            Manage rider onboarding, documents and status from a single place.
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button
            variant="outline-secondary"
            onClick={() => fetchRiders({ showLoader: true })}
            title="Refresh"
            disabled={loading}
          >
            <IoMdRefresh className="me-2" />
            {loading ? "Refreshing" : "Refresh"}
          </Button>
          <Button variant="success" onClick={openCreateModal}>
            + Add Rider
          </Button>
        </div>
      </div>

      <Row className="g-3 mb-4">
        <Col xs={12} md={6} lg={4}>
          <InputGroup>
            <InputGroup.Text>
              <BsSearch />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search by name, phone or hub..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Form.Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <div className="d-flex flex-column">
            <span className="text-muted small">Total Riders</span>
            <strong className="fs-4">{riders.length}</strong>
          </div>
        </Col>
      </Row>

      <div className="table-responsive">
        <Table bordered hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Rider</th>
              <th>Contact</th>
              <th>Vehicle</th>
              <th>Hub</th>
              <th>Status</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center py-5">
                  Loading riders...
                </td>
              </tr>
            ) : filteredRiders.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-5">
                  No riders found. Click "Add Rider" to get started.
                </td>
              </tr>
            ) : (
              filteredRiders
                .slice(pagesVisited, pagesVisited + perPage)
                .map((rider, index) => (
                  <tr key={rider._id}>
                    <td>{index + 1 + perPage * pageNumber}</td>
                    <td>
                      <div className="fw-semibold">{rider.name}</div>
                      {rider.notes && (
                        <small className="text-muted">{rider.notes}</small>
                      )}
                    </td>
                    <td>
                      <div>{rider.phone}</div>
                      {rider.alternatePhone && (
                        <small className="text-muted">
                          Alt: {rider.alternatePhone}
                        </small>
                      )}
                      {rider.email && (
                        <div className="text-muted small">{rider.email}</div>
                      )}
                    </td>
                    <td>
                      <div>{rider.vehicleType || "-"}</div>
                      <small className="text-muted">
                        {rider.vehicleNumber || "-"}
                      </small>
                    </td>
                    <td>
                      {rider.hub ? (
                        <div className="fw-semibold">{rider.hub}</div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>{renderStatusBadge(rider.status)}</td>
                    <td>
                      {new Date(rider.updatedAt || rider.createdAt || Date.now())
                        .toLocaleDateString()}
                    </td>
                    <td>
                      <div className="d-flex gap-3 fs-5">
                        <BiSolidEdit
                          className="text-success cursor-pointer"
                          onClick={() => openEditModal(rider)}
                        />
                        <AiFillDelete
                          className="text-danger cursor-pointer"
                          onClick={() => confirmDelete(rider)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </Table>
      </div>

      {pageCount > 1 && (
        <div className="d-flex justify-content-end">
          <ReactPaginate
            previousLabel="Back"
            nextLabel="Next"
            pageCount={pageCount}
            onPageChange={({ selected }) => setPageNumber(selected)}
            containerClassName="paginationBttns"
            previousLinkClassName="previousBttn"
            nextLinkClassName="nextBttn"
            disabledClassName="paginationDisabled"
            activeClassName="paginationActive"
          />
        </div>
      )}

      <Modal show={showFormModal} onHide={closeFormModal} size="lg" style={{ zIndex: 99999 }}> 
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedRider ? "Update Rider" : "Add New Rider"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Full Name *</Form.Label>
                <Form.Control
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter rider name"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Primary Phone *</Form.Label>
                <Form.Control
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="10 digit mobile number"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Alternate Phone</Form.Label>
                <Form.Control
                  name="alternatePhone"
                  value={formData.alternatePhone}
                  onChange={handleInputChange}
                  placeholder="Optional"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="example@dailydish.com"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Hub</Form.Label>
                <Form.Select
                  name="hub"
                  value={formData.hub}
                  onChange={handleInputChange}
                  disabled={hubLoading && hubOptions.length === 0}
                >
                  <option value="">
                    {hubLoading ? "Loading hubs..." : "Select hub"}
                  </option>
                  {hubOptions.map((hub) => (
                    <option key={hub._id || hub.hubId} value={hub.hubName}>
                      {hub.hubName}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Vehicle Type</Form.Label>
                <Form.Control
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleInputChange}
                  placeholder="Bike / Scooter / Car"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Vehicle Number</Form.Label>
                <Form.Control
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleInputChange}
                  placeholder="KA 03 XX 0000"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  {statusOptions
                    .filter((option) => option.value !== "all")
                    .map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Aadhaar Number</Form.Label>
                <Form.Control
                  name="aadhaarNumber"
                  value={formData.aadhaarNumber}
                  onChange={handleInputChange}
                  placeholder="Document reference"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>License Number</Form.Label>
                <Form.Control
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleInputChange}
                  placeholder="Document reference"
                />
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label>Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Special instructions, shift timings, etc."
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={closeFormModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
            {submitting
              ? "Saving..."
              : selectedRider
              ? "Update Rider"
              : "Create Rider"}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showDeleteModal}
        onHide={() => {
          setShowDeleteModal(false);
          setSelectedRider(null);
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Remove Rider</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to remove{" "}
          <strong>{selectedRider?.name}</strong>? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => {
              setShowDeleteModal(false);
              setSelectedRider(null);
            }}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={deleteRider}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default RiderManagement;

