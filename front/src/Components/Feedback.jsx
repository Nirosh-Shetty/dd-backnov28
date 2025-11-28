import React, { useEffect, useState } from "react";
import { Card, Button, Form, Spinner } from "react-bootstrap";
import { RxCross2 } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert";

const FeedbackPage = () => {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        feedback: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
            setFormData({
                name: user?.Fname || "",
                phone: (user?.Mobile) || "",
                email: user?.Email || "",
                feedback:""
            })
        }
    }, [])
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        const { name, phone, email, feedback } = formData;

        // Validation 1: Check for empty fields
        if (!name.trim() || !phone|| !email.trim() || !feedback.trim()) {
            Swal({
                icon: "error",
                title: "Oops...",
                text: "Please fill all fields correctly!",
            });
            return;
        }

        // Validation 2: Name validation
        // - Must be at least 2 characters
        // - Only letters and spaces allowed
        const nameRegex = /^[A-Za-z\s]{2,50}$/;
        if (!nameRegex.test(name.trim())) {
            Swal({
                icon: "error",
                title: "Invalid Name",
                text: "Name must be 2-50 characters long and contain only letters and spaces!",
            });
            return;
        }

        // Validation 3: Indian Phone Number validation
        // - Must be exactly 10 digits
        // - Must start with 6, 7, 8, or 9
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(phone)) {
            Swal({
                icon: "error",
                title: "Invalid Phone Number",
                text: "Please enter a valid 10-digit Indian phone number starting with 6, 7, 8, or 9!",
            });
            return;
        }

        // Validation 4: Email validation
        // - Standard email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            Swal({
                icon: "error",
                title: "Invalid Email",
                text: "Please enter a valid email address!",
            });
            return;
        }

        // Validation 5: Feedback validation
        // - Must be at least 10 characters
        // - Maximum 500 characters
        if (feedback.trim().length < 10 || feedback.trim().length > 500) {
            Swal({
                icon: "error",
                title: "Invalid Feedback",
                text: "Feedback must be between 10 and 500 characters!",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            // Replace with your actual API endpoint
            await axios.post("/api/feedback", { name, phone, email, feedback });
            setFormData({ name: "", phone: "", email: "", feedback: "" });
            Swal({
                icon: "success",
                title: "Thank You!",
                text: "Your feedback has been submitted successfully!",
                confirmButtonText: "OK",
            });
        } catch (error) {
            console.error("Error submitting feedback:", error);
            Swal({
                icon: "error",
                title: "Submission Failed",
                text: "Failed to submit feedback. Please try again later.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="ban-container" style={{ paddingTop: "20px" }}>
            <div className="mobile-banner">
                <a onClick={() => navigate(-1)}>
                    <RxCross2 style={{ fontSize: "20px", float: "right" }} />
                </a>
                <div className="w-100">
                    <h3 className="text-center mb-3">Feedback</h3>

                    <Card className="shadow-lg p-3" style={{ maxWidth: "400px", margin: "auto" }}>
                        <Card.Body>
                            <h5 className="fw-bold text-center">Share Your Feedback</h5>
                            <Form onSubmit={handleFeedbackSubmit}>
                                <Form.Group controlId="formName" className="mb-3">
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Enter your name"
                                        disabled={isSubmitting}
                                    />
                                </Form.Group>

                                <Form.Group controlId="formPhone" className="mb-3">
                                    <Form.Label>Phone Number</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="Enter your phone number"
                                        disabled={isSubmitting}
                                    />
                                </Form.Group>

                                <Form.Group controlId="formEmail" className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="Enter your email"
                                        disabled={isSubmitting}
                                    />
                                </Form.Group>

                                <Form.Group controlId="formFeedback" className="mb-3">
                                    <Form.Label>Feedback</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={5}
                                        name="feedback"
                                        value={formData.feedback}
                                        onChange={handleInputChange}
                                        placeholder="Let us know your thoughts..."
                                        disabled={isSubmitting}
                                    />
                                </Form.Group>

                                <div className="text-center">
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        disabled={
                                            isSubmitting ||
                                            !formData.name?.trim() ||
                                            !formData.phone ||
                                            !formData.email?.trim() ||
                                            !formData.feedback?.trim()
                                        }
                                    >
                                        {isSubmitting ? (
                                            <Spinner animation="border" size="sm" />
                                        ) : (
                                            "Submit Feedback"
                                        )}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default FeedbackPage;