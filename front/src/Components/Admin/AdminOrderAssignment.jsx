import axios from "axios";
import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  GoogleMap,
  InfoWindow,
  Polygon,
  DrawingManager,
  useJsApiLoader,
} from "@react-google-maps/api";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import '../../Styles/AdminOrderAssignment.css';
import { FaEdit, FaEye, FaTrash } from "react-icons/fa";

// Define libraries outside component to prevent re-renders
const LIBRARIES = ["drawing"];

const AdminOrderAssignment = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 12.9716, lng: 77.5946 });
  const [zoom, setZoom] = useState(13);
  const [hubs, setHubs] = useState([]);
  const [selectedHub, setSelectedHub] = useState("all");
  const mapRef = useRef(null);
  const clustererRef = useRef(null);

  // POLYGON STATES - NEW
  const [zones, setZones] = useState([]);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);
  const [showZoneForm, setShowZoneForm] = useState(false);
  const [showZoneDetails, setShowZoneDetails] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [tempPolygonCoords, setTempPolygonCoords] = useState(null);
  const [zoneName, setZoneName] = useState("");
  const [zoneColor, setZoneColor] = useState("#FF0000");
  const [availableRiders, setAvailableRiders] = useState([]);
  const [selectedRiders, setSelectedRiders] = useState([]);
  const [isRidersLoading, setIsRidersLoading] = useState(false);
  const [zoneDetails, setZoneDetails] = useState(null);
  const [mapHeight, setMapHeight] = useState("75vh");

  // Replace LoadScript with useJsApiLoader hook - UPDATED
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyBqzZ-CgLs1qFNZTSMp8MQYaho0pvwuCUU",
    id: "google-map-script",
    libraries: LIBRARIES, // Added drawing library
  });

  const addressTypeConfig = {
    PG: {
      color: "#8A2BE2",
      icon: "🏠",
      label: "PG",
    },
    School: {
      color: "#FF6B6B",
      icon: "🏫",
      label: "School",
    },
    Work: {
      color: "#00796B",
      icon: "💼",
      label: "Work",
    },
    Home: {
      color: "#FFB300",
      icon: "🏡",
      label: "Home",
    },
  };

  // Responsive map height
  useEffect(() => {
    const updateMapHeight = () => {
      if (window.innerWidth <= 480) {
        setMapHeight("45vh");
      } else if (window.innerWidth <= 768) {
        setMapHeight("50vh");
      } else if (window.innerWidth <= 1024) {
        setMapHeight("70vh");
      } else {
        setMapHeight("75vh");
      }
    };

    updateMapHeight();
    window.addEventListener("resize", updateMapHeight);
    return () => window.removeEventListener("resize", updateMapHeight);
  }, []);

  const mapContainerStyle = {
    width: "100%",
    height: mapHeight,
    minHeight: "300px",
  };

  const generateNextZoneName = useCallback(() => {
    const usedLetters = new Set();
    zones.forEach((zone) => {
      const match = zone?.name?.trim().match(/^Zone\s+([A-Z])/i);
      if (match?.[1]) {
        usedLetters.add(match[1].toUpperCase());
      }
    });
    for (let code = 65; code <= 90; code += 1) {
      const letter = String.fromCharCode(code);
      if (!usedLetters.has(letter)) {
        return `Zone ${letter}`;
      }
    }
    return `Zone ${zones.length + 1}`;
  }, [zones]);

  const fetchRiders = useCallback(async () => {
    try {
      setIsRidersLoading(true);
      const res = await axios.get("http://localhost:7013/api/admin/riders");
      if (Array.isArray(res.data?.riders)) {
        setAvailableRiders(res.data.riders);
      } else {
        setAvailableRiders([]);
      }
    } catch (error) {
      console.error("Failed to load riders", error);
      setAvailableRiders([]);
    } finally {
      setIsRidersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRiders();
  }, [fetchRiders]);

  // POLYGON FUNCTIONS - NEW
  const loadZones = async () => {
    try {
      const res = await axios.get("http://localhost:7013/api/admin/getZones");
      if (Array.isArray(res.data)) {
        // Map backend zones to frontend format (ensure id field exists)
        const formattedZones = res.data.map((zone) => ({
          ...zone,
          id: zone._id || zone.id, // Use _id from backend as id
        }));
        setZones(formattedZones);
      } else {
        setZones([]);
      }
    } catch (error) {
      console.log("Backend not available, loading zones from localStorage");
      try {
        const savedZones = localStorage.getItem("deliveryZones");
        if (savedZones) {
          const parsedZones = JSON.parse(savedZones);
          if (Array.isArray(parsedZones)) {
            setZones(parsedZones);
          } else {
            setZones([]);
          }
        }
      } catch (parseError) {
        console.error("Error parsing zones from localStorage:", parseError);
        setZones([]);
      }
    }
  };

  const saveZoneToStorage = async (newZone) => {
    try {
      const res = await axios.post("http://localhost:7013/api/admin/saveZone", newZone);
      console.log("Zone saved to backend", res.data);
      // Reload zones from backend to get the saved zone with proper ID
      await loadZones();
      return res.data.zone;
    } catch (error) {
      console.error("Error saving zone to backend:", error);
      console.log("Backend not available, saving zone to localStorage");
      const updatedZones = [...zones, newZone];
      localStorage.setItem("deliveryZones", JSON.stringify(updatedZones));
      return newZone;
    }
  };

  const handlePolygonComplete = useCallback((polygon) => {
    const coordinates = polygon.getPath().getArray().map((latLng) => ({
      lat: latLng.lat(),
      lng: latLng.lng(),
    }));

    console.log('Polygon drawn with coordinates:', coordinates);
    setTempPolygonCoords(coordinates);
    polygon.setMap(null);
    setIsDrawingMode(false);
    setShowZoneForm(true);
    // Only set default name if not editing
    if (!editingZone) {
      setZoneName((prev) => prev || generateNextZoneName());
      setSelectedRiders([]);
    }
  }, [generateNextZoneName, editingZone]);

  const handleRiderSelection = useCallback((event) => {
    const values = Array.from(event.target.selectedOptions).map((option) => option.value);
    setSelectedRiders(values);
  }, []);

  const handleSaveZone = async () => {
    if (!zoneName.trim()) {
      alert("Please enter a zone name");
      return;
    }

    if (!tempPolygonCoords || tempPolygonCoords.length < 3) {
      alert("Please draw a valid polygon with at least 3 points");
      return;
    }

    const zoneData = {
      name: zoneName,
      paths: tempPolygonCoords,
      fillColor: zoneColor,
      strokeColor: zoneColor,
      fillOpacity: 0.35,
      strokeOpacity: 0.8,
      assignedRiders: selectedRiders,
    };

    try {
      if (editingZone) {
        // Update existing zone
        await updateZone(editingZone.id || editingZone._id, zoneData);
        alert(`Zone "${zoneName}" updated successfully!`);
      } else {
        // Create new zone
        await saveZoneToStorage(zoneData);
        alert(`Zone "${zoneName}" saved successfully!`);
      }
      
      setZoneName("");
      setZoneColor("#FF0000");
      setTempPolygonCoords(null);
      setShowZoneForm(false);
      setSelectedRiders([]);
      setEditingZone(null);
    } catch (error) {
      console.error("Error saving zone:", error);
      alert("Failed to save zone. Please try again.");
    }
  };

  const updateZone = async (zoneId, zoneData) => {
    try {
      const res = await axios.put(
        `http://localhost:7013/api/admin/updateZone/${zoneId}`,
        zoneData
      );
      console.log("Zone updated in backend", res.data);
      await loadZones();
      return res.data.zone;
    } catch (error) {
      console.error("Error updating zone:", error);
      throw error;
    }
  };

  const handleEditZone = async (zone) => {
    try {
      // Fetch full zone details with populated riders
      const res = await axios.get(
        `http://localhost:7013/api/admin/getZone/${zone.id || zone._id}`
      );
      const fullZone = res.data;
      
      setEditingZone(fullZone);
      setZoneName(fullZone.name);
      setZoneColor(fullZone.fillColor || "#FF0000");
      setTempPolygonCoords(fullZone.paths);
      setSelectedRiders(
        fullZone.assignedRiders
          ? fullZone.assignedRiders.map((rider) => 
              typeof rider === 'object' ? rider._id : rider
            )
          : []
      );
      setShowZoneForm(true);
      setShowZoneDetails(false);
      
      // Center map on zone
      if (fullZone.paths && fullZone.paths.length > 0) {
        setMapCenter({
          lat: fullZone.paths[0].lat,
          lng: fullZone.paths[0].lng,
        });
        setZoom(14);
      }
    } catch (error) {
      console.error("Error loading zone for edit:", error);
      alert("Failed to load zone details. Please try again.");
    }
  };

  const handleViewZoneDetails = async (zone) => {
    try {
      const res = await axios.get(
        `http://localhost:7013/api/admin/getZone/${zone.id || zone._id}`
      );
      setZoneDetails(res.data);
      setShowZoneDetails(true);
      setSelectedZone(zone);
      
      // Center map on zone
      if (res.data.paths && res.data.paths.length > 0) {
        setMapCenter({
          lat: res.data.paths[0].lat,
          lng: res.data.paths[0].lng,
        });
        setZoom(14);
      }
    } catch (error) {
      console.error("Error loading zone details:", error);
      alert("Failed to load zone details. Please try again.");
    }
  };

  const handleCancelZone = () => {
    setTempPolygonCoords(null);
    setShowZoneForm(false);
    setZoneName("");
    setZoneColor("#FF0000");
    setSelectedRiders([]);
    setEditingZone(null);
  };

  const deleteZone = async (zoneId) => {
    if (!window.confirm("Are you sure you want to delete this zone?")) {
      return;
    }

    try {
      await axios.delete(`http://localhost:7013/api/admin/deleteZone/${zoneId}`);
      // Reload zones from backend after deletion
      await loadZones();
      if (selectedZone?.id === zoneId || selectedZone?._id === zoneId) {
        setSelectedZone(null);
      }
    } catch (error) {
      console.error("Error deleting zone:", error);
      console.log("Backend not available, deleting from localStorage");
      const updatedZones = zones.filter(z => z.id !== zoneId && z._id !== zoneId);
      setZones(updatedZones);
      localStorage.setItem("deliveryZones", JSON.stringify(updatedZones));
      if (selectedZone?.id === zoneId || selectedZone?._id === zoneId) {
        setSelectedZone(null);
      }
    }
  };

  const handleZoneClick = useCallback((zone, event) => {
    console.log('Clicked zone:', zone.name);
    setSelectedZone(zone);
  }, []);

  // Calculate dynamic offset based on zoom level
  const calculateOffsetRadius = (currentZoom) => {
    if (currentZoom >= 18) return 0.00001;
    if (currentZoom >= 16) return 0.00003;
    if (currentZoom >= 14) return 0.00008;
    if (currentZoom >= 12) return 0.0002;
    if (currentZoom >= 10) return 0.0005;
    return 0.001;
  };

  const offsetOverlappingMarkers = (ordersArray, currentZoom = 13) => {
    const locationMap = new Map();
    const offsetOrders = [];
    const radius = calculateOffsetRadius(currentZoom);

    ordersArray.forEach((order, index) => {
      const lat = order.coordinates.coordinates[1];
      const lng = order.coordinates.coordinates[0];

      let foundGroup = null;
      for (const [groupKey, group] of locationMap.entries()) {
        const [groupLat, groupLng] = groupKey.split("_").map(Number);
        const distance = Math.sqrt(
          Math.pow(lat - groupLat, 2) + Math.pow(lng - groupLng, 2)
        );

        if (distance < 0.00009) {
          foundGroup = group;
          break;
        }
      }

      if (!foundGroup) {
        const locationKey = `${lat.toFixed(6)}_${lng.toFixed(6)}`;
        locationMap.set(locationKey, []);
        offsetOrders.push({
          ...order,
          originalIndex: index,
          displayLat: lat,
          displayLng: lng,
          isGrouped: false,
          groupCount: 1,
          groupKey: locationKey,
        });
        locationMap.get(locationKey).push(offsetOrders.length - 1);
      } else {
        const groupIndex = foundGroup.length;
        const angle = (360 / 8) * groupIndex;
        const offsetLat = lat + radius * Math.cos((angle * Math.PI) / 180);
        const offsetLng = lng + radius * Math.sin((angle * Math.PI) / 180);

        offsetOrders.push({
          ...order,
          originalIndex: index,
          displayLat: offsetLat,
          displayLng: offsetLng,
          isGrouped: true,
          groupCount: foundGroup.length + 1,
          groupKey: foundGroup[0].groupKey,
        });

        const firstMarkerIndex = foundGroup[0];
        offsetOrders[firstMarkerIndex].isGrouped = true;
        offsetOrders[firstMarkerIndex].groupCount = foundGroup.length + 1;

        foundGroup.push(offsetOrders.length - 1);
      }
    });

    return offsetOrders;
  };

  const createPinShapedMarker = (
    orderNumber,
    addressType,
    isGrouped = false,
    groupCount = 1
  ) => {
    const config = addressTypeConfig[addressType] || {
      color: "#6B8e23",
      icon: "🏠",
      label: "Other",
    };

    const pinPaths = {
      PG: "M -12,-30 L 12,-30 L 15,-15 L 8,-8 L 0,5 L -8,-8 L -15,-15 Z",
      School: "M -15,-30 L 15,-30 L 15,-5 L 5,-5 L 0,5 L -5,-5 L -15,-5 Z",
      Work: "M -12,-30 L 12,-30 L 15,-15 L 8,-8 L 0,5 L -8,-8 L -15,-15 Z",
      Home: "M 0,-35 L 15,-20 L 15,-10 L 10,-10 L 10,0 L -10,0 L -10,-10 L -15,-10 L -15,-20 Z",
      Office: "M -15,-30 L 15,-30 L 15,0 L 8,0 L 0,8 L -8,0 L -15,0 Z",
      default:
        "M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z",
    };

    const groupBadge =
      isGrouped && groupCount > 1
        ? `
      <circle cx="15" cy="-30" r="10" fill="#FF0000" stroke="white" stroke-width="2"/>
      <text x="15" y="-26"
            font-family="Arial Black, sans-serif"
            font-size="10"
            font-weight="900"
            text-anchor="middle"
            fill="white">
        ${groupCount}
      </text>
    `
        : "";

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="-25 -45 50 60" width="50" height="60">
        <defs>
          <filter id="shadow${orderNumber}">
            <feDropShadow dx="0" dy="3" stdDeviation="3" flood-opacity="0.6"/>
          </filter>
        </defs>
        <path d="${pinPaths[addressType] || pinPaths.default}"
              fill="${config.color}"
              stroke="white"
              stroke-width="2.5"
              filter="url(#shadow${orderNumber})"/>
        ${groupBadge}
        <text x="0" y="-15"
              font-family="Arial Black, sans-serif"
              font-size="16"
              font-weight="900"
              text-anchor="middle"
              fill="white"
              stroke="#000"
              stroke-width="1">
          ${orderNumber}
        </text>
      </svg>
    `.trim();

    const encodedSvg = encodeURIComponent(svg)
      .replace(/'/g, "%27")
      .replace(/"/g, "%22");

    return {
      url: `data:image/svg+xml,${encodedSvg}`,
      scaledSize: new window.google.maps.Size(50, 60),
      anchor: new window.google.maps.Point(25, 60),
    };
  };

  const initializeClusterer = useCallback((map) => {
    if (!map) return;

    if (clustererRef.current) {
      clustererRef.current.clearMarkers();
    }

    const createClusterIcon = (cluster) => {
      const count = cluster.count;
      let backgroundColor = "#007bff";
      let size = 40;

      if (count > 20) {
        backgroundColor = "#dc3545";
        size = 50;
      } else if (count > 10) {
        backgroundColor = "#fd7e14";
        size = 45;
      } else if (count > 5) {
        backgroundColor = "#ffc107";
        size = 42;
      }

      return {
        url: `data:image/svg+xml,${encodeURIComponent(`
          <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
            <circle cx="${size / 2}" cy="${size / 2}" r="${
          size / 2 - 2
        }" fill="${backgroundColor}" stroke="white" stroke-width="3"/>
            <text x="${size / 2}" y="${
          size / 2 + 4
        }" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="14">${count}</text>
          </svg>
        `)}`,
        scaledSize: new window.google.maps.Size(size, size),
        anchor: new window.google.maps.Point(size / 2, size / 2),
      };
    };

    clustererRef.current = new MarkerClusterer({
      map,
      markers: [],
      renderer: {
        render: ({ count, position }, stats) => {
          const clusterOptions = {
            position,
            icon: createClusterIcon({ count }),
            title: `${count} orders clustered`,
            zIndex: 1000 + count,
          };

          return new window.google.maps.Marker(clusterOptions);
        },
      },
      algorithmOptions: {
        maxZoom: 15,
        gridSize: 60,
      },
    });
  }, []);

  const fetchTodaysOrders = async () => {
    try {
      const res = await axios.get(
        "http://localhost:7013/api/admin/getPackerOrders"
      );
      
      if (!Array.isArray(res.data)) {
        console.error("Orders API returned non-array data");
        setOrders([]);
        setFilteredOrders([]);
        return;
      }

      const ordersWithCoordinates = res.data.filter(
        (order) =>
          order.coordinates &&
          order.coordinates.coordinates &&
          order.coordinates.coordinates.length === 2
      );

      const processedOrders = offsetOverlappingMarkers(
        ordersWithCoordinates,
        zoom
      );
      setOrders(processedOrders);
      setFilteredOrders(processedOrders);

      const uniqueHubs = [
        ...new Set(
          ordersWithCoordinates
            .filter((order) => order.hubName)
            .map((order) => order.hubName)
        ),
      ].map((hubName) => ({
        name: hubName,
        count: ordersWithCoordinates.filter(
          (order) => order.hubName === hubName
        ).length,
      }));

      setHubs(uniqueHubs);

      if (processedOrders.length > 0) {
        const firstOrder = processedOrders[0];
        setMapCenter({
          lat: firstOrder.displayLat,
          lng: firstOrder.displayLng,
        });
      }

      if (clustererRef.current && mapRef.current) {
        updateClustererMarkers(processedOrders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
      setFilteredOrders([]);
      setHubs([]);
    }
  };

  const updateClustererMarkers = useCallback(
    (ordersArray) => {
      if (!clustererRef.current || !mapRef.current) return;

      clustererRef.current.clearMarkers();

      const markers = ordersArray.map((order, index) => {
        const marker = new window.google.maps.Marker({
          position: {
            lat: order.displayLat,
            lng: order.displayLng,
          },
          icon: createPinShapedMarker(
            index + 1,
            order.addressType,
            order.isGrouped,
            order.groupCount
          ),
          title: `Order ${index + 1}: ${order.username} - ${order.addressType}${
            order.isGrouped ? ` (${order.groupCount} orders here)` : ""
          }`,
          zIndex:
            selectedOrder?._id === order._id
              ? 1000
              : order.isGrouped
              ? 200
              : 100,
        });

        marker.addListener("click", () => {
          handleMarkerClick(order, index + 1);
        });

        return marker;
      });

      clustererRef.current.addMarkers(markers);
    },
    [selectedOrder]
  );

  const filterOrdersByHub = useCallback(
    (hubName) => {
      setSelectedHub(hubName);
      if (hubName === "all") {
        setFilteredOrders(orders);
        if (orders.length > 0) {
          const firstOrder = orders[0];
          setMapCenter({
            lat: firstOrder.displayLat,
            lng: firstOrder.displayLng,
          });
        }
      } else {
        const hubOrders = orders.filter((order) => order.hubName === hubName);
        setFilteredOrders(hubOrders);

        if (hubOrders.length > 0) {
          const firstHubOrder = hubOrders[0];
          setMapCenter({
            lat: firstHubOrder.displayLat,
            lng: firstHubOrder.displayLng,
          });
          setZoom(14);
        }
      }
    },
    [orders]
  );

  useEffect(() => {
    fetchTodaysOrders();
    loadZones(); // Load zones on mount
  }, []);

  useEffect(() => {
    if (orders.length > 0) {
      const processedOrders = offsetOverlappingMarkers(
        orders.map((order) => ({
          ...order,
          coordinates: order.coordinates,
        })),
        zoom
      );
      setOrders(processedOrders);
      if (selectedHub !== "all") {
        const hubOrders = processedOrders.filter(
          (order) => order.hubName === selectedHub
        );
        setFilteredOrders(hubOrders);
      } else {
        setFilteredOrders(processedOrders);
      }

      if (clustererRef.current && mapRef.current) {
        updateClustererMarkers(
          selectedHub === "all" ? processedOrders : filteredOrders
        );
      }
    }
  }, [zoom]);

  const handleMarkerClick = useCallback((order, orderNumber) => {
    setSelectedOrder({ ...order, orderNumber });
  }, []);

  const handleMapLoad = useCallback(
    (map) => {
      mapRef.current = map;
      initializeClusterer(map);

      window.google.maps.event.addListener(map, "zoom_changed", () => {
        setZoom(map.getZoom());
      });

      if (filteredOrders.length > 0) {
        updateClustererMarkers(filteredOrders);
      }
    },
    [filteredOrders, initializeClusterer, updateClustererMarkers]
  );

  const getLocationGroups = () => {
    const groups = {};
    filteredOrders.forEach((order, index) => {
      if (order.isGrouped && order.groupKey) {
        if (!groups[order.groupKey]) {
          groups[order.groupKey] = [];
        }
        groups[order.groupKey].push({ ...order, orderNumber: index + 1 });
      }
    });
    return groups;
  };

  const locationGroups = getLocationGroups();
  const hasGroupedMarkers = Object.keys(locationGroups).length > 0;

  if (loadError) {
    return (
      <div style={{ padding: "20px", color: "red" }}>
        Error loading maps: {loadError.message}
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div style={{ padding: "20px", fontSize: "18px" }}>
        Loading Maps...
      </div>
    );
  }

  return (
    <div className="admin-assignment-page">
      <div className="assignment-card">
        <div className="assignment-header">
          <div>
            <p className="eyebrow-text">Live delivery overview</p>
            <h2>Orders Map & Zone Management</h2>
            <p className="subtext">
              Track active orders, inspect hub distribution, and draw delivery zones without losing the interactive map.
            </p>
          </div>
          <div className="header-actions">
            <button className="btn btn-outline" onClick={fetchTodaysOrders}>
              🔄 Refresh Orders
            </button>
            <div className="stat-pill">
              <span>Total Zones</span>
              <strong>{Array.isArray(zones) ? zones.length : 0}</strong>
            </div>
          </div>
        </div>

        <div className="header-metrics surface">
          <div className="snapshot-row header-snapshot-row">
            <div className="snapshot-card snapshot-card--primary">
              <span>{selectedHub === "all" ? "Total orders" : `Orders in ${selectedHub}`}</span>
              <strong>{filteredOrders.length}</strong>
            </div>
            <div className="snapshot-card">
              <span>Mapped orders</span>
              <strong>{filteredOrders.filter((order) => order.coordinates).length}</strong>
            </div>
            <div className={`snapshot-card${hasGroupedMarkers ? " snapshot-card--warning" : ""}`}>
              <span>Grouped locations</span>
              <strong>{hasGroupedMarkers ? Object.keys(locationGroups).length : 0}</strong>
            </div>
            <div className="snapshot-card">
              <span>Last updated</span>
              <strong>
                {new Date().toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </strong>
            </div>
          </div>
        </div>

        <div className="assignment-layout">
          <div className="control-panel">
          

            <section className="surface hub-filter-card">
              <div className="section-title-row">
                <div>
                  <p className="eyebrow-text">Filters</p>
                  <h3>Hub selection</h3>
                </div>
                {selectedHub !== "all" && (
                  <span className="hub-pill">
                    🏢 {selectedHub} · {filteredOrders.length} orders
                  </span>
                )}
              </div>
              <label className="form-label" htmlFor="hub-filter">
                Filter by hub
              </label>
              <select
                id="hub-filter"
                className="hub-select"
                value={selectedHub}
                onChange={(e) => filterOrdersByHub(e.target.value)}
              >
                <option value="all">All hubs · {orders.length} orders</option>
                {Array.isArray(hubs) &&
                  hubs.map((hub, index) => (
                    <option key={index} value={hub.name}>
                      {hub.name} · {hub.count} orders
                    </option>
                  ))}
              </select>
            </section>
          

            {/* <div className="info-banner info">
              💡 Each order renders as a colored pin with its sequence number.{" "}
              {selectedHub !== "all" && `Currently focused on the ${selectedHub} hub. `}
              Overlapping orders spread automatically—click any marker for details.
            </div> */}

            <section className="surface actions-card">
              <div className="actions-bar">
                <button
                  className={`btn ${isDrawingMode ? "btn-danger" : "btn-success"}`}
                  onClick={() => {
                    setIsDrawingMode(!isDrawingMode);
                    setShowZoneForm(false);
                    setEditingZone(null);
                    setShowZoneDetails(false);
                    setZoneDetails(null);
                  }}
                  disabled={showZoneForm}
                >
                  {isDrawingMode ? "Cancel Drawing" : "Create New Zone"}
                </button>
                <button className="btn btn-primary" onClick={fetchTodaysOrders}>
                  Reload data
                </button>
              </div>

              {isDrawingMode && (
                <div className="instructions-banner">
                  📍 Drawing mode is active. Click on the map to drop points and double-click to finish the polygon.
                </div>
              )}

{hasGroupedMarkers && (
              <div className="info-banner warning">
                ⚠️ <strong>{Object.keys(locationGroups).length}</strong> location(s) host multiple orders. Markers with
                a red badge show the total stacked at that stop.
              </div>
            )}
              {showZoneForm && (
                <div className="zone-form">
                  <h3>{editingZone ? "Edit delivery zone" : "Create delivery zone"}</h3>
                  {editingZone && tempPolygonCoords && (
                    <div className="info-banner info" style={{ marginBottom: "16px" }}>
                      ℹ️ Current polygon has {tempPolygonCoords.length} points. Click "Redraw Polygon" to change it.
                    </div>
                  )}
                  <div className="form-grid">
                    <label className="form-field">
                      <span>Zone name *</span>
                      <input
                        className="text-input"
                        type="text"
                        value={zoneName}
                        onChange={(e) => setZoneName(e.target.value)}
                        placeholder="e.g. Zone A - Downtown"
                      />
                    </label>
                    <label className="form-field">
                      <span>Zone color</span>
                      <div className="color-field">
                        <input
                          className="color-input"
                          type="color"
                          value={zoneColor}
                          onChange={(e) => setZoneColor(e.target.value)}
                        />
                        <span>{zoneColor}</span>
                      </div>
                    </label>
                    <label className="form-field">
                      <span>Assign riders</span>
                      <select
                        className="text-input"
                        multiple
                        value={selectedRiders}
                        onChange={handleRiderSelection}
                        disabled={isRidersLoading || availableRiders.length === 0}
                      >
                        {isRidersLoading && (
                          <option value="" disabled>
                            Loading riders...
                          </option>
                        )}
                        {!isRidersLoading && availableRiders.length === 0 && (
                          <option value="" disabled>
                            No riders available
                          </option>
                        )}
                        {availableRiders.map((rider) => (
                          <option key={rider._id} value={rider._id}>
                            {rider.name || "Unnamed Rider"}{" "}
                            {rider.phone ? `(${rider.phone})` : ""}
                          </option>
                        ))}
                      </select>
                      <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                        Hold Ctrl/Cmd to select multiple riders.
                      </span>
                    </label>
                    {editingZone && (
                      <div className="form-field">
                        <button
                          className="btn btn-outline"
                          type="button"
                          onClick={() => {
                            setTempPolygonCoords(null);
                            setIsDrawingMode(true);
                            setShowZoneForm(false);
                          }}
                        >
                          Redraw Polygon
                        </button>
                        <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block", marginTop: "4px" }}>
                          Click to redraw the zone polygon on the map
                        </span>
                      </div>
                    )}
                    <div className="form-actions">
                      <button className="btn btn-success" onClick={handleSaveZone}>
                        {editingZone ? "Update zone" : "Save zone"}
                      </button>
                      <button className="btn btn-ghost" onClick={handleCancelZone}>
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {showZoneDetails && zoneDetails && (
              <section className="surface zone-details-card" style={{ marginBottom: "20px" }}>
                <div className="section-title-row">
                  <div>
                    <p className="eyebrow-text">Zone Details</p>
                    <h3>{zoneDetails.name}</h3>
                  </div>
                  <button
                    className="btn btn-ghost btn-small"
                    onClick={() => {
                      setShowZoneDetails(false);
                      setZoneDetails(null);
                    }}
                  >
                    ✕ Close
                  </button>
                </div>
                <div style={{ padding: "16px 0", maxHeight: "600px", overflowY: "auto" }}>
                  <div style={{ marginBottom: "20px" }}>
                    <p style={{ fontWeight: "bold", marginBottom: "8px" }}>Zone Color:</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div
                        style={{
                          width: "30px",
                          height: "30px",
                          backgroundColor: zoneDetails.fillColor,
                          border: `2px solid ${zoneDetails.strokeColor}`,
                          borderRadius: "4px",
                        }}
                      ></div>
                      <span>{zoneDetails.fillColor}</span>
                    </div>
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <p style={{ fontWeight: "bold", marginBottom: "8px" }}>
                      Polygon Points: {zoneDetails.paths?.length || 0}
                    </p>
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <p style={{ fontWeight: "bold", marginBottom: "12px" }}>
                      Assigned Riders ({zoneDetails.assignedRiders?.length || 0}):
                    </p>
                    {zoneDetails.assignedRiders && zoneDetails.assignedRiders.length > 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "400px", overflowY: "auto", paddingRight: "4px" }}>
                        {zoneDetails.assignedRiders.map((rider, index) => (
                          <div
                            key={rider._id || rider.id || index}
                            style={{
                              padding: "12px",
                              backgroundColor: "#f8f9fa",
                              borderRadius: "8px",
                              border: "1px solid #e9ecef",
                              marginBottom: "4px",
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
                              <div style={{ flex: "1", minWidth: "150px" }}>
                                <p style={{ fontWeight: "bold", margin: 0 }}>
                                  {rider.name || "Unnamed Rider"}
                                </p>
                                <p style={{ margin: "4px 0 0 0", fontSize: "0.875rem", color: "#64748b" }}>
                                  📞 {rider.phone || "No phone"}
                                </p>
                                {rider.email && (
                                  <p style={{ margin: "4px 0 0 0", fontSize: "0.875rem", color: "#64748b" }}>
                                    ✉️ {rider.email}
                                  </p>
                                )}
                              </div>
                              <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                                {rider.hub && (
                                  <span
                                    style={{
                                      display: "inline-block",
                                      padding: "4px 8px",
                                      backgroundColor: "#e3f2fd",
                                      color: "#1976d2",
                                      borderRadius: "4px",
                                      fontSize: "0.75rem",
                                    }}
                                  >
                                    🏢 {rider.hub}
                                  </span>
                                )}
                                {rider.vehicleType && (
                                  <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                                    🚗 {rider.vehicleType}
                                    {rider.vehicleNumber && ` (${rider.vehicleNumber})`}
                                  </span>
                                )}
                                <span
                                  style={{
                                    display: "inline-block",
                                    padding: "4px 8px",
                                    backgroundColor:
                                      rider.status === "active"
                                        ? "#e8f5e9"
                                        : rider.status === "inactive"
                                        ? "#fff3e0"
                                        : "#ffebee",
                                    color:
                                      rider.status === "active"
                                        ? "#2e7d32"
                                        : rider.status === "inactive"
                                        ? "#e65100"
                                        : "#c62828",
                                    borderRadius: "4px",
                                    fontSize: "0.75rem",
                                    textTransform: "capitalize",
                                  }}
                                >
                                  {rider.status || "active"}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: "#64748b", fontStyle: "italic" }}>
                        No riders assigned to this zone
                      </p>
                    )}
                  </div>

                  <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #e9ecef" }}>
                    <p style={{ fontSize: "0.875rem", color: "#64748b", margin: 0 }}>
                      Created: {new Date(zoneDetails.createdAt).toLocaleString()}
                    </p>
                    {zoneDetails.updatedAt && (
                      <p style={{ fontSize: "0.875rem", color: "#64748b", margin: "4px 0 0 0" }}>
                        Last updated: {new Date(zoneDetails.updatedAt).toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div style={{ marginTop: "20px", display: "flex", gap: "8px" }}>
                    <button
                      className="btn btn-success"
                      onClick={() => {
                        handleEditZone(zoneDetails);
                      }}
                    >
                      Edit Zone
                    </button>
                    <button
                      className="btn btn-ghost"
                      onClick={() => {
                        setShowZoneDetails(false);
                        setZoneDetails(null);
                      }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </section>
            )}

            {Array.isArray(zones) && zones.length > 0 && (
              <section className="surface zone-list-card">
                <div className="section-title-row">
                  <div>
                    <p className="eyebrow-text">Zones</p>
                    <h3>Delivery coverage ({zones.length})</h3>
                  </div>
                </div>
                <div className="zone-list">
                  {zones.map((zone) => (
                    <div
                      key={zone.id || zone._id}
                      className="zone-item"
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        if (zone.paths && zone.paths.length > 0) {
                          setMapCenter({
                            lat: zone.paths[0].lat,
                            lng: zone.paths[0].lng,
                          });
                          setZoom(14);
                        }
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          if (zone.paths && zone.paths.length > 0) {
                            setMapCenter({
                              lat: zone.paths[0].lat,
                              lng: zone.paths[0].lng,
                            });
                            setZoom(14);
                          }
                        }
                      }}
                    >
                      <div className="d-flex gap-2">

                        <span
                          className="zone-color-chip"
                          style={{
                            backgroundColor: zone.fillColor || zone.strokeColor || "#FF0000",
                            borderColor: zone.strokeColor || zone.fillColor || "#FF0000",
                            display: "block",
                            visibility: "visible",
                          }}
                        />
                        <div className="zone-text-content">
                          <p className="zone-name" title={zone.name || "Unnamed Zone"}>
                            {zone.name ? String(zone.name) : "Unnamed Zone"}
                          </p>
                          {zone.createdAt && (
                            <p className="zone-meta">
                              Created {new Date(zone.createdAt).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="zone-actions">
                        <button
                          className="btn btn-outline btn-small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewZoneDetails(zone);
                          }}
                        >
                          <FaEye />
                        </button>
                        <button
                          className="btn btn-success btn-small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditZone(zone);
                          }}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="btn btn-danger btn-small"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteZone(zone.id || zone._id);
                          }}
                        >
                          <FaTrash />
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              </section>
            )}

             <section className="surface stats-card">
              {selectedHub === "all" && hubs.length > 0 && (
                <div className="stat-subcard">
                  <p className="stat-subcard-title">Hub distribution</p>
                  {hubs.slice(0, 4).map((hub, index) => (
                    <div className="stat-subcard-row" key={index}>
                      <span>🏢 {hub.name}</span>
                      <span>{hub.count}</span>
                    </div>
                  ))}
                  {hubs.length > 4 && (
                    <p className="stat-subcard-foot">+{hubs.length - 4} more hubs tracked</p>
                  )}
                </div>
              )}

              {hasGroupedMarkers && (
                <div className="stat-subcard">
                  <p className="stat-subcard-title">Orders sharing an address</p>
                  <div className="grouped-list">
                    {Object.entries(locationGroups).map(([groupKey, groupOrders], idx) => (
                      <div className="grouped-row" key={groupKey}>
                        <span>Location {idx + 1}</span>
                        <span>{groupOrders.length} orders</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section> 
          </div>

          <div className="map-panel">
            <div className="map-wrapper">
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                mapContainerClassName="assignment-map"
                center={mapCenter}
                zoom={zoom}
                onLoad={handleMapLoad}
                options={{
                  streetViewControl: true,
                  mapTypeControl: true,
                  fullscreenControl: true,
                  zoomControl: true,
                  minZoom: 10,
                  maxZoom: 20,
                }}
              >
        {/* DRAWING MANAGER - NEW */}
        {isDrawingMode && (
          <DrawingManager
            onPolygonComplete={handlePolygonComplete}
            options={{
              drawingMode: window.google.maps.drawing.OverlayType.POLYGON,
              drawingControl: false,
              polygonOptions: {
                fillColor: zoneColor,
                fillOpacity: 0.35,
                strokeWeight: 2,
                strokeColor: zoneColor,
                strokeOpacity: 0.8,
                clickable: false,
                editable: true,
                draggable: false,
                zIndex: 1,
              },
            }}
          />
        )}

        {/* RENDER ZONES - NEW */}
        {Array.isArray(zones) && zones.map((zone) => (
          <Polygon
            key={zone.id || zone._id}
            paths={zone.paths}
            options={{
              fillColor: zone.fillColor,
              fillOpacity: zone.fillOpacity,
              strokeColor: zone.strokeColor,
              strokeOpacity: zone.strokeOpacity,
              strokeWeight: (selectedZone?.id === zone.id || selectedZone?._id === zone._id) ? 4 : 2,
              clickable: true,
              draggable: false,
              editable: false,
              geodesic: false,
              zIndex: (selectedZone?.id === zone.id || selectedZone?._id === zone._id) ? 10 : 1,
            }}
            onClick={(e) => handleZoneClick(zone, e)}
          />
        ))}

        {/* Individual markers are now handled by the clusterer */}
        {/* Only render InfoWindow for selected order */}
        {selectedOrder && (
          <InfoWindow
            position={{
              lat: selectedOrder.displayLat,
              lng: selectedOrder.displayLng,
            }}
            onCloseClick={() => setSelectedOrder(null)}
          >
            <div
              style={{
                padding: "0",
                maxWidth: "320px",
                fontFamily: "Arial, sans-serif",
                borderRadius: "10px",
                overflow: "hidden",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: "16px",
                  backgroundColor:
                    addressTypeConfig[selectedOrder.addressType]?.color ||
                    "#007bff",
                  color: "white",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <div
                    style={{
                      width: "45px",
                      height: "45px",
                      backgroundColor: "white",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color:
                        addressTypeConfig[selectedOrder.addressType]?.color ||
                        "#007bff",
                      fontWeight: "bold",
                      fontSize: "18px",
                      border: "3px solid rgba(255,255,255,0.3)",
                    }}
                  >
                    {selectedOrder.orderNumber}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "18px" }}>
                      Order #{selectedOrder.orderNumber}
                    </h3>
                    <p
                      style={{
                        margin: "4px 0 0 0",
                        fontSize: "13px",
                        opacity: 0.9,
                      }}
                    >
                      {addressTypeConfig[selectedOrder.addressType]?.icon}{" "}
                      {selectedOrder.addressType}
                      {selectedOrder.isGrouped && (
                        <span
                          style={{
                            marginLeft: "8px",
                            backgroundColor: "rgba(255,0,0,0.8)",
                            padding: "2px 6px",
                            borderRadius: "10px",
                            fontSize: "11px",
                          }}
                        >
                          {selectedOrder.groupCount} at location
                        </span>
                      )}
                    </p>
                    {selectedOrder.hubName && (
                      <p
                        style={{
                          margin: "4px 0 0 0",
                          fontSize: "12px",
                          opacity: 0.9,
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        🏢 Hub: {selectedOrder.hubName}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: "16px" }}>
                <div
                  style={{ display: "grid", gap: "10px", marginBottom: "16px" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <span style={{ fontSize: "18px" }}>👤</span>
                    <div>
                      <div style={{ fontWeight: "bold", fontSize: "15px" }}>
                        {selectedOrder.username}
                      </div>
                      <div style={{ fontSize: "13px", color: "#666" }}>
                        📞 {selectedOrder.Mobilenumber}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Details Card */}
                <div
                  style={{
                    backgroundColor: "#f8f9fa",
                    padding: "14px",
                    borderRadius: "8px",
                    marginBottom: "16px",
                    border: "1px solid #e9ecef",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "10px",
                      fontSize: "14px",
                    }}
                  >
                    <div>
                      <strong>Status:</strong>
                      <div
                        style={{
                          color:
                            selectedOrder.status === "Delivered"
                              ? "#28a745"
                              : selectedOrder.status === "Cooking"
                              ? "#ffc107"
                              : "#007bff",
                          fontWeight: "bold",
                          fontSize: "13px",
                        }}
                      >
                        {selectedOrder.status}
                      </div>
                    </div>
                    <div>
                      <strong>Time Slot:</strong>
                      <div style={{ fontSize: "13px" }}>
                        {selectedOrder.slot}
                      </div>
                    </div>
                    <div>
                      <strong>Total Amount:</strong>
                      <div
                        style={{
                          fontWeight: "bold",
                          color: "#28a745",
                          fontSize: "13px",
                        }}
                      >
                        ₹{selectedOrder.allTotal}
                      </div>
                    </div>
                    <div>
                      <strong>Items Count:</strong>
                      <div style={{ fontSize: "13px" }}>
                        {selectedOrder.allProduct.length}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div style={{ fontSize: "13px", marginBottom: "12px" }}>
                  <strong style={{ display: "block", marginBottom: "6px" }}>
                    📦 Order Items:
                  </strong>
                  <div style={{ maxHeight: "120px", overflowY: "auto" }}>
                    {selectedOrder.allProduct.map((product, idx) => (
                      <div
                        key={idx}
                        style={{
                          marginTop: "4px",
                          padding: "6px 0",
                          borderBottom:
                            idx < selectedOrder.allProduct.length - 1
                              ? "1px solid #f0f0f0"
                              : "none",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span>
                          • {product.foodItemId?.foodname || "Unknown Item"}
                        </span>
                        <span
                          style={{
                            color: "#666",
                            backgroundColor: "#f0f0f0",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontSize: "11px",
                          }}
                        >
                          Qty: {product.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Address */}
                <div
                  style={{
                    padding: "12px",
                    backgroundColor: "#e9ecef",
                    borderRadius: "6px",
                    fontSize: "12px",
                    color: "#495057",
                    lineHeight: "1.4",
                    border: "1px solid #dee2e6",
                  }}
                >
                  <strong>📍 Delivery Address:</strong>
                  <br />
                  {selectedOrder.delivarylocation}
                </div>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
      <section className="surface legend-card legend-card--inline">
        <div className="legend-inline-scroll">
          {Object.entries(addressTypeConfig).map(([type, config]) => {
            const markerIcon = createPinShapedMarker("1", type, false, 1);
            const typeCount = filteredOrders.filter((order) => order.addressType === type).length;
            return (
              <div className="legend-chip" key={type}>
                <div className="legend-marker-count">
                  <img src={markerIcon.url} alt={`${type} marker`} />
                  <span className="legend-marker-badge">{typeCount}</span>
                </div>
                <span>
                  {config.icon} {config.label}
                </span>
              </div>
            );
          })}
          <div className="legend-chip legend-chip--highlight">
            <img src={createPinShapedMarker("1", "PG", true, 3).url} alt="Grouped marker example" />
            <span>Grouped 🔴</span>
          </div>
          <div className="legend-chip legend-chip--accent">
            <div className="cluster-pill">5</div>
            <span>Cluster 🔵</span>
          </div>
        </div>
      </section>
            </div>
          </div>
   
        </div>
      </div>
    </div>
  );
};

export default AdminOrderAssignment;