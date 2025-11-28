import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  Spinner,
  Alert,
  Card,
} from "react-bootstrap";

const AdminWalletSettings = () => {
  const [settings, setSettings] = useState({
    newUserBonus: 0,
    minCartValueForWallet: 0,
    maxWalletUsagePerOrder: 0,
    defaultFreeCashExpiryDays: 30,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:7013/api/wallet/getsettings"
        );

        if (response.data.success) {
          setSettings(response.data.success);
        }
      } catch (err) {
        setError("Failed to load wallet settings");
        console.error("Error fetching wallet settings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: parseFloat(value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const response = await axios.put(
        "http://localhost:7013/api/wallet/settings",
        settings
      );

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError("Failed to update wallet settings");
      console.error("Error updating wallet settings:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow">
            <Card.Body>
              <h2 className="mb-4 text-center">Wallet Settings</h2>

              {error && <Alert variant="danger">{error}</Alert>}
              {success && (
                <Alert variant="success">Settings updated successfully!</Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>New User Bonus (₹)</Form.Label>
                  <Form.Control
                    type="number"
                    name="newUserBonus"
                    value={settings.newUserBonus}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                  />
                  <Form.Text className="text-muted">
                    Amount of free cash to give new users upon registration.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Minimum Cart Value (₹)</Form.Label>
                  <Form.Control
                    type="number"
                    name="minCartValueForWallet"
                    value={settings.minCartValueForWallet}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                  />
                  <Form.Text className="text-muted">
                    Minimum cart value required to use wallet balance.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Maximum Wallet Usage Per Order (₹)</Form.Label>
                  <Form.Control
                    type="number"
                    name="maxWalletUsagePerOrder"
                    value={settings.maxWalletUsagePerOrder}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                  />
                  <Form.Text className="text-muted">
                    Maximum amount that can be used from wallet per order.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Default Free Cash Expiry (Days)</Form.Label>
                  <Form.Control
                    type="number"
                    name="defaultFreeCashExpiryDays"
                    value={settings.defaultFreeCashExpiryDays}
                    onChange={handleChange}
                    min="1"
                    required
                  />
                  <Form.Text className="text-muted">
                    Number of days until free cash expires.
                  </Form.Text>
                </Form.Group>
                <div className="d-flex justify-content-center align-items-center">
                  <Button
                    variant="success"
                    type="submit"
                    className=" d-flex justify-content-center align-items-center"
                    disabled={loading}
                  >
                    {loading ? (
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                      />
                    ) : (
                      "Save Settings"
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminWalletSettings;
