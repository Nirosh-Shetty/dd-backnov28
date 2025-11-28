import React, { useState, useEffect } from "react";
import { Button, Form, Modal, Spinner, Alert } from "react-bootstrap";
import axios from "axios";
import moment from "moment";

const RestaurantClosure = () => {
  // State for form inputs
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [banner, setBanner] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [closureDetails, setClosureDetails] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // State for restaurant status
  const [isRestaurantClosed, setIsRestaurantClosed] = useState(false);

  // Modal handlers
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setError("");
    setSuccess("");
    resetForm();
  };

  // Reset form fields
  const resetForm = () => {
    setStartDate("");
    setEndDate("");
    setStartTime("");
    setEndTime("");
    setBanner(null);
  };

  // Fetch existing closure details
  const fetchClosureDetails = async () => {
    try {
      const response = await axios.get(
        "http://localhost:7013/api/admin/getClosureDetails"
      );
      if (response.status === 200 && response.data.data) {
        setClosureDetails(response.data.data);
        checkRestaurantStatus(response.data.data);
      } else {
        setClosureDetails(null);
        setIsRestaurantClosed(false);
      }
    } catch (error) {
      console.error("Error fetching closure details:", error);
      setError("Failed to fetch closure details");
    }
  };

  // Check if restaurant should be closed based on current date/time
  const checkRestaurantStatus = (closure) => {
    if (!closure) return;

    const now = moment();
    const startDateTime = moment(
      `${closure.startDate} ${closure.startTime}`,
      "YYYY-MM-DD HH:mm"
    );
    const endDateTime = moment(
      `${closure.endDate} ${closure.endTime}`,
      "YYYY-MM-DD HH:mm"
    );

    // Check if current time is within closure period
    const isClosed = now.isBetween(startDateTime, endDateTime, undefined, "[]");
    setIsRestaurantClosed(isClosed);
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      // Validation
      if (!startDate) return setError("Please select a start date");
      if (!endDate) return setError("Please select an end date");
      if (!startTime) return setError("Please select a start time");
      if (!endTime) return setError("Please select an end time");
      if (!banner) return setError("Please upload a banner image");

      // Validate date range
      const startDateTime = moment(
        `${startDate} ${startTime}`,
        "YYYY-MM-DD HH:mm"
      );
      const endDateTime = moment(`${endDate} ${endTime}`, "YYYY-MM-DD HH:mm");
      if (endDateTime.isBefore(startDateTime)) {
        return setError("End date/time must be after start date/time");
      }

      // Validate banner file type
      const allowedImageTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/gif",
      ];
      if (!allowedImageTypes.includes(banner.type)) {
        return setError(
          "Invalid file type. Please upload an image (JPEG, PNG, JPG, or GIF)"
        );
      }

      // Prepare form data
      const formData = new FormData();
      formData.append("startDate", startDate);
      formData.append("endDate", endDate);
      formData.append("startTime", startTime);
      formData.append("endTime", endTime);
      formData.append("banner", banner);

      setIsLoading(true);
      setError("");
      setSuccess("");

      // Send data to API
      const response = await axios.post(
        "http://localhost:7013/api/admin/setClosure",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.status === 200) {
        setSuccess("Restaurant closure set successfully");
        setClosureDetails(response.data.data);
        checkRestaurantStatus(response.data.data);
        setTimeout(() => {
          handleCloseModal();
        }, 1500);
      }
    } catch (error) {
      console.error("Error setting closure:", error);
      setError(error.response?.data?.error || "Failed to set closure");
    } finally {
      setIsLoading(false);
    }
  };

  // Clear closure
  const clearClosure = async () => {
    try {
      setIsLoading(true);
      const response = await axios.delete(
        "http://localhost:7013/api/admin/clearClosure"
      );
      if (response.status === 200) {
        setSuccess("Closure cleared successfully");
        setClosureDetails(null);
        setIsRestaurantClosed(false);
        setTimeout(() => setSuccess(""), 1500);
      }
    } catch (error) {
      console.error("Error clearing closure:", error);
      setError(error.response?.data?.error || "Failed to clear closure");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClosureDetails();
  }, []);

  return (
    <div className="container py-5">
      <div className="card shadow">
        <div
          className="card-header  text-white d-flex justify-content-between align-items-center "
          style={{ backgroundColor: "#fe4500" }}
        >
          <h3 className="mb-0">Restaurant Closure Management</h3>
          <Button
            variant="primary"
            onClick={handleShowModal}
            disabled={isLoading}
          >
            Set Closure Period
          </Button>
        </div>
        <div className="card-body">
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          {isRestaurantClosed && closureDetails && (
            <Alert variant="warning">
              <strong>Restaurant is currently closed!</strong>
              <p>
                Closure Period:{" "}
                {moment(closureDetails.startDate).format("DD/MM/YYYY")}{" "}
                {closureDetails.startTime}
                to {moment(closureDetails.endDate).format("DD/MM/YYYY")}{" "}
                {closureDetails.endTime}
              </p>
              {closureDetails.banner && (
                <img
                  src={`${closureDetails.banner}`}
                  alt="Closure Banner"
                  className="img-fluid mt-2"
                  style={{ maxHeight: "100px" }}
                />
              )}
            </Alert>
          )}

          {closureDetails && !isRestaurantClosed && (
            <div className="alert alert-info">
              <strong>Upcoming/Scheduled Closure:</strong>
              <p>
                From: {moment(closureDetails.startDate).format("DD/MM/YYYY")}{" "}
                {closureDetails.startTime}
                <br />
                To: {moment(closureDetails.endDate).format("DD/MM/YYYY")}{" "}
                {closureDetails.endTime}
              </p>
              {closureDetails.banner && (
                <img
                  src={`${closureDetails.banner}`}
                  alt="Closure Banner"
                  className="img-fluid mt-2"
                  style={{ maxHeight: "100px" }}
                />
              )}
              <Button
                variant="danger"
                size="sm"
                onClick={clearClosure}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Clearing...
                  </>
                ) : (
                  "Clear Closure"
                )}
              </Button>
            </div>
          )}

          {!closureDetails && !isRestaurantClosed && (
            <p className="text-muted">No closure period set.</p>
          )}
        </div>
      </div>

      {/* Modal for setting closure */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header
          closeButton
          className=" text-white"
          style={{ backgroundColor: "#fe4500" }}
        >
          <Modal.Title>Set Restaurant Closure</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={moment().format("YYYY-MM-DD")}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Start Time</Form.Label>
              <Form.Control
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || moment().format("YYYY-MM-DD")}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>End Time</Form.Label>
              <Form.Control
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Closure Banner</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => setBanner(e.target.files[0])}
              />
              <Form.Text className="text-muted">
                Upload a banner image (JPEG, PNG, JPG, or GIF) to display during
                closure.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleCloseModal}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <div
            style={{
              backgroundColor: "#f81e0f",
              borderColor: "#f81e0f",
              borderRadius: "6px",
              textAlign: "center",
              color: "white",
              padding: "10px",
              cursor: "pointer",
            }}
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Saving...
              </>
            ) : (
              "Set Closure"
            )}
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default RestaurantClosure;
