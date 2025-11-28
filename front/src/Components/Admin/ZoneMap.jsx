import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Row,
  Col,
  Form,
  Button,
  Table,
  Badge,
  Spinner,
} from "react-bootstrap";
import axios from "axios";
import AreaSelector from "../Map/AreaSelector";

const GMAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

const ZoneMap = () => {
  const token = localStorage.getItem("authToken");
  const [hubs, setHubs] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    hubId: "",
    name: "",
    priority: 1,
    active: true,
    deliveryFee: 0,
    minOrder: 0,
    schedule: "",
    geometry: null, // GeoJSON Feature
  });

  const axiosCfg = useMemo(
    () => ({
      baseURL: "http://localhost:7013/api",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),
    [token]
  );

  const fetchHubs = async () => {
    try {
      const res = await axios.get("/Hub/hubs", axiosCfg);
      setHubs(res.data || []);
    } catch (e) {
      // silent
    }
  };

  const fetchZones = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/Hub/zones", axiosCfg);
      setZones(res.data || []);
    } catch (e) {
      setZones([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHubs();
    fetchZones();
  }, []);

  const resetForm = () =>
    setForm({
      hubId: "",
      name: "",
      priority: 1,
      active: true,
      deliveryFee: 0,
      minOrder: 0,
      schedule: "",
      geometry: null,
    });

  const saveZone = async () => {
    if (!form.hubId || !form.geometry) return;
    setSaving(true);
    try {
      const payload = {
        hubId: form.hubId,
        name: form.name,
        priority: Number(form.priority) || 1,
        active: !!form.active,
        deliveryFee: Number(form.deliveryFee) || 0,
        minOrder: Number(form.minOrder) || 0,
        schedule: form.schedule,
        geometry: form.geometry,
      };
      const res = await axios.post("/Hub/zones", payload, axiosCfg);
      if (res.status === 201 || res.status === 200) {
        resetForm();
        fetchZones();
      }
    } catch (e) {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (zone) => {
    try {
      await axios.put(
        `/Hub/zones/${zone._id}`,
        { active: !zone.active },
        axiosCfg
      );
      fetchZones();
    } catch (e) {}
  };

  const removeZone = async (zone) => {
    try {
      await axios.delete(`/Hub/zones/${zone._id}`, axiosCfg);
      fetchZones();
    } catch (e) {}
  };

  return (
    <div className="p-2">
      <Card className="shadow-sm">
        <Card.Header className="text-white" style={{ background: "#fe4500" }}>
          <Row className="align-items-center">
            <Col>
              <h4 className="mb-0">Zone Management (Polygon)</h4>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body>
          <Row className="g-3">
            <Col md={6}>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Hub</Form.Label>
                  <Form.Select
                    value={form.hubId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, hubId: e.target.value }))
                    }
                  >
                    <option value="">Select hub</option>
                    {hubs.map((h) => (
                      <option key={h._id || h.hubId} value={h.hubId || h._id}>
                        {(h.hubName || "").trim()} ({h.hubId || h._id})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Zone Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="e.g. Koramangala-1"
                  />
                </Form.Group>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Priority</Form.Label>
                      <Form.Control
                        type="number"
                        value={form.priority}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, priority: e.target.value }))
                        }
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Delivery Fee</Form.Label>
                      <Form.Control
                        type="number"
                        value={form.deliveryFee}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            deliveryFee: e.target.value,
                          }))
                        }
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Min Order</Form.Label>
                      <Form.Control
                        type="number"
                        value={form.minOrder}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, minOrder: e.target.value }))
                        }
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-3">
                  <Form.Label>Schedule</Form.Label>
                  <Form.Control
                    type="text"
                    value={form.schedule}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, schedule: e.target.value }))
                    }
                    placeholder="e.g. Lunch 07:00-14:00; Dinner 17:00-22:00"
                  />
                </Form.Group>
                <Form.Check
                  className="mb-3"
                  type="switch"
                  id="zone-active"
                  label="Active"
                  checked={form.active}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, active: e.target.checked }))
                  }
                />
                <div className="d-flex gap-2">
                  <Button
                    variant="primary"
                    onClick={saveZone}
                    disabled={!form.hubId || !form.geometry || saving}
                  >
                    {saving ? (
                      <Spinner animation="border" size="sm" className="me-2" />
                    ) : null}
                    Save Zone
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={resetForm}
                    disabled={saving}
                  >
                    Reset
                  </Button>
                </div>
              </Form>
            </Col>
            <Col md={6}>
              <AreaSelector
                apiKey={GMAPS_KEY}
                value={form.geometry}
                onGeoJSONChange={(feature) =>
                  setForm((f) => ({ ...f, geometry: feature }))
                }
                editable={true}
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="shadow-sm mt-3">
        <Card.Header className="text-white" style={{ background: "#6B8E23" }}>
          <h5 className="mb-0">Existing Zones</h5>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
            </div>
          ) : (
            <div className="table-responsive">
              <Table striped hover>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Hub</th>
                    <th>Priority</th>
                    <th>Active</th>
                    <th>Delivery Fee</th>
                    <th>Min Order</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {zones.length ? (
                    zones.map((z) => (
                      <tr key={z._id}>
                        <td>{z.name || "-"}</td>
                        <td>{z.hubId}</td>
                        <td>{z.priority}</td>
                        <td>
                          {z.active ? (
                            <Badge bg="success">Active</Badge>
                          ) : (
                            <Badge bg="secondary">Inactive</Badge>
                          )}
                        </td>
                        <td>{z.deliveryFee ?? 0}</td>
                        <td>{z.minOrder ?? 0}</td>
                        <td className="d-flex gap-2">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() =>
                              setForm({
                                hubId: z.hubId,
                                name: z.name || "",
                                priority: z.priority || 1,
                                active: !!z.active,
                                deliveryFee: z.deliveryFee ?? 0,
                                minOrder: z.minOrder ?? 0,
                                schedule: z.schedule || "",
                                geometry: z.geometry,
                              })
                            }
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-warning"
                            onClick={() => toggleActive(z)}
                          >
                            {z.active ? "Deactivate" : "Activate"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => removeZone(z)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center text-muted">
                        No zones found
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default ZoneMap;
