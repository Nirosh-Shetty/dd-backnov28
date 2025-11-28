import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCrosshairs,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaSearch,
} from "react-icons/fa";

const LocationModal2 = ({ show, onClose }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [primaryAddressId, setPrimaryAddressId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const searchInputRef = useRef(null);
  const autocompleteServiceRef = useRef(null);
  const placesServiceRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const fetchAbortControllerRef = useRef(null);
  const hasFetchedAddressesRef = useRef(false);
  const isModalMountedRef = useRef(false);

  const API_KEY = import.meta.env.VITE_MAP_KEY;

  // Optimized Google Maps script loading with caching check
  useEffect(() => {
    if (!show) return;

    isModalMountedRef.current = true;

    // Check if already loaded
    if (window.google?.maps?.places) {
      setScriptLoaded(true);
      initializeServices();
      return;
    }

    // Check if script element exists
    const existingScript = document.querySelector(
      `script[src*="maps.googleapis.com"]`
    );

    if (existingScript) {
      // Script is loading, wait for it
      const checkInterval = setInterval(() => {
        if (window.google?.maps?.places) {
          setScriptLoaded(true);
          initializeServices();
          clearInterval(checkInterval);
        }
      }, 50);

      return () => clearInterval(checkInterval);
    }

    // Load new script
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (isModalMountedRef.current) {
        setScriptLoaded(true);
        initializeServices();
      }
    };

    script.onerror = () => console.error("Failed to load Google Maps");
    document.head.appendChild(script);

    return () => {
      isModalMountedRef.current = false;
    };
  }, [show, API_KEY]);

  // Initialize Google Maps services
  const initializeServices = useCallback(() => {
    if (!window.google?.maps?.places) return;

    if (!autocompleteServiceRef.current) {
      autocompleteServiceRef.current =
        new window.google.maps.places.AutocompleteService();
    }
    if (!placesServiceRef.current) {
      placesServiceRef.current = new window.google.maps.places.PlacesService(
        document.createElement("div")
      );
    }
  }, []);

  // Focus search input
  useEffect(() => {
    if (show && searchInputRef.current) {
      const timer = setTimeout(() => searchInputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [show]);

  // OPTIMIZED: Fetch saved addresses with AbortController and caching
  const fetchSavedAddresses = useCallback(async () => {
    // Prevent duplicate fetches
    if (hasFetchedAddressesRef.current) return;

    try {
      setLoading(true);
      hasFetchedAddressesRef.current = true;

      const user = JSON.parse(localStorage.getItem("user"));
      const customerId = user?._id;

      if (!customerId) {
        setLoading(false);
        return;
      }

      // Check localStorage cache first
      const cachedAddresses = localStorage.getItem(`addresses_${customerId}`);
      const cacheTimestamp = localStorage.getItem(
        `addresses_timestamp_${customerId}`
      );
      const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

      // Use cache if valid and recent
      if (cachedAddresses && cacheTimestamp) {
        const age = Date.now() - parseInt(cacheTimestamp);
        if (age < CACHE_DURATION) {
          const cached = JSON.parse(cachedAddresses);
          setSavedAddresses(cached.addresses || []);
          setPrimaryAddressId(cached.primaryAddress || null);
          setLoading(false);

          // Fetch fresh data in background
          fetchAddressesInBackground(customerId);
          return;
        }
      }

      // Create AbortController for cancellation
      fetchAbortControllerRef.current = new AbortController();

      const response = await fetch(
        `http://localhost:7013/api/User/customers/${customerId}/addresses`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          signal: fetchAbortControllerRef.current.signal,
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const addresses = result.addresses || [];
          const primaryId = result.primaryAddress || null;

          setSavedAddresses(addresses);
          setPrimaryAddressId(primaryId);

          // Cache the results
          localStorage.setItem(
            `addresses_${customerId}`,
            JSON.stringify({ addresses, primaryAddress: primaryId })
          );
          localStorage.setItem(
            `addresses_timestamp_${customerId}`,
            Date.now().toString()
          );
        }
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error fetching addresses:", error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Background fetch to update cache
  const fetchAddressesInBackground = async (customerId) => {
    try {
      const response = await fetch(
        `http://localhost:7013/api/User/customers/${customerId}/addresses`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const addresses = result.addresses || [];
          const primaryId = result.primaryAddress || null;

          // Update cache silently
          localStorage.setItem(
            `addresses_${customerId}`,
            JSON.stringify({ addresses, primaryAddress: primaryId })
          );
          localStorage.setItem(
            `addresses_timestamp_${customerId}`,
            Date.now().toString()
          );
        }
      }
    } catch (error) {
      console.error("Background fetch error:", error);
    }
  };

  // Fetch addresses when modal opens
  useEffect(() => {
    if (show) {
      fetchSavedAddresses();
    }

    return () => {
      // Cleanup: abort ongoing fetch
      if (fetchAbortControllerRef.current) {
        fetchAbortControllerRef.current.abort();
      }
      // Reset fetch flag when modal closes
      if (!show) {
        hasFetchedAddressesRef.current = false;
      }
    };
  }, [show, fetchSavedAddresses]);

  // OPTIMIZED: Debounced search with cleanup
  const handleSearchChange = useCallback((e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!window.google?.maps?.places || !autocompleteServiceRef.current) {
      return;
    }

    if (query.length > 2) {
      debounceTimerRef.current = setTimeout(() => {
        autocompleteServiceRef.current.getPlacePredictions(
          {
            input: query,
            types: ["geocode", "establishment"],
            componentRestrictions: { country: "in" },
          },
          (predictions, status) => {
            if (
              status === window.google.maps.places.PlacesServiceStatus.OK &&
              predictions
            ) {
              setSearchSuggestions(predictions);
            } else {
              setSearchSuggestions([]);
            }
          }
        );
      }, 300);
    } else {
      setSearchSuggestions([]);
    }
  }, []);

  // Handle location selection
  const handleLocationSelect = useCallback(
    (place) => {
      if (!placesServiceRef.current) {
        placesServiceRef.current = new window.google.maps.places.PlacesService(
          document.createElement("div")
        );
      }

      setActionLoading("search");
      setShowSearch(false);

      placesServiceRef.current.getDetails(
        {
          placeId: place.place_id,
          fields: ["geometry", "name", "formatted_address", "vicinity"],
        },
        (placeResult, status) => {
          setActionLoading(null);
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            const locationData = {
              lat: placeResult.geometry.location.lat(),
              lng: placeResult.geometry.location.lng(),
            };

            onClose();
            navigate("/current-location", {
              state: {
                selectedPlace: {
                  location: locationData,
                  address: placeResult.formatted_address,
                  name:
                    placeResult.name ||
                    placeResult.formatted_address.split(",")[0],
                  vicinity: placeResult.vicinity,
                },
                setAsPrimary: false,
              },
            });
          }
        }
      );
    },
    [navigate, onClose]
  );

  // OPTIMIZED: Remove primary address with cache update
  const removePrimaryAddress = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const customerId = user?._id;

      if (!customerId || !primaryAddressId) return;

      // Update UI immediately
      setPrimaryAddressId(null);
      localStorage.removeItem("primaryAddress");

      // Update cache
      const cachedAddresses = localStorage.getItem(`addresses_${customerId}`);
      if (cachedAddresses) {
        const cached = JSON.parse(cachedAddresses);
        cached.primaryAddress = null;
        localStorage.setItem(`addresses_${customerId}`, JSON.stringify(cached));
      }

      // Background API call
      fetch(
        `http://localhost:7013/api/User/customers/${customerId}/primary-address/remove`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
        }
      ).catch((error) =>
        console.error("Error removing primary address:", error)
      );
    } catch (error) {
      console.error("Error removing primary address:", error);
    }
  }, [primaryAddressId]);

  // OPTIMIZED: Handle current location
  const handleUseCurrentLocation = useCallback(async () => {
    if (actionLoading) return; // Prevent double-click

    setActionLoading("current-location");

    try {
      if (primaryAddressId) {
        removePrimaryAddress();
      }

      // Navigate immediately
      onClose();
      navigate("/current-location", { state: { setAsPrimary: false } });
    } catch (error) {
      console.error("Error handling current location:", error);
      onClose();
      navigate("/current-location", { state: { setAsPrimary: false } });
    } finally {
      setActionLoading(null);
    }
  }, [
    primaryAddressId,
    removePrimaryAddress,
    navigate,
    onClose,
    actionLoading,
  ]);

  // OPTIMIZED: Handle deliver here with cache update
  const handleDeliverHere = useCallback(
    async (address) => {
      if (actionLoading) return; // Prevent double-click

      setActionLoading(address._id);

      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const customerId = user?._id;

        if (!customerId) return;

        // Update UI immediately
        setPrimaryAddressId(address._id);
        localStorage.setItem("primaryAddress", JSON.stringify(address));

        // Update cache
        const cachedAddresses = localStorage.getItem(`addresses_${customerId}`);
        if (cachedAddresses) {
          const cached = JSON.parse(cachedAddresses);
          cached.primaryAddress = address._id;
          localStorage.setItem(
            `addresses_${customerId}`,
            JSON.stringify(cached)
          );
        }

        // Close modal first
        onClose();

        // API call in background
        const response = await fetch(
          `http://localhost:7013/api/User/customers/${customerId}/addresses/${address._id}/primary`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (response.ok) {
          // Reload after a short delay
          setTimeout(() => {
            window.location.reload();
          }, 100);
        }
      } catch (error) {
        console.error("Error setting primary address:", error);
      } finally {
        setActionLoading(null);
      }
    },
    [onClose, actionLoading]
  );

  // Helper functions
  const getPrimaryName = useCallback((address) => {
    if (!address) return "";

    switch (address.addressType) {
      case "Home":
        return address.homeName || address.houseName || "";
      case "PG":
        return address.apartmentName || address.houseName || "";
      case "School":
        return address.schoolName || address.houseName || "";
      case "Work":
        return address.companyName || address.houseName || "";
      default:
        return address.houseName || "";
    }
  }, []);

  const getAddressIcon = useCallback((type) => {
    switch (type) {
      case "Home":
        return "🏠";
      case "PG":
        return "🏢";
      case "School":
        return "🎓";
      case "Work":
        return "💼";
      default:
        return "📍";
    }
  }, []);

  const isPrimaryAddress = useCallback(
    (addressId) => primaryAddressId === addressId,
    [primaryAddressId]
  );

  const getPrimaryAddress = useCallback(
    () => savedAddresses.find((addr) => addr._id === primaryAddressId),
    [savedAddresses, primaryAddressId]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (fetchAbortControllerRef.current) {
        fetchAbortControllerRef.current.abort();
      }
    };
  }, []);

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 1050,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          maxWidth: "605px",
          maxHeight: "100vh",
          backgroundColor: "white",
          borderRadius: "16px",
          border: "none",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Minimal Loading Overlay */}
        {loading && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 20,
            }}
          >
            <div
              className="spinner-border"
              role="status"
              style={{
                width: "2.5rem",
                height: "2.5rem",
                color: "#6B8E23",
              }}
            >
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div
          style={{
            padding: "20px",
            borderBottom: "1px solid #f0f0f0",
            flexShrink: 0,
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5
              style={{
                margin: 0,
                color: "#2c2c2c",
                fontFamily: "Inter",
                fontWeight: "600",
              }}
            >
              Search for your delivery location
            </h5>

            <button
              type="button"
              onClick={onClose}
              style={{
                fontSize: "20px",
                border: "none",
                background: "none",
                cursor: "pointer",
                color: "#555",
                lineHeight: "1",
              }}
            >
              &times;
            </button>
          </div>

          <p
            style={{
              margin: 0,
              color: "#666",
              fontSize: "14px",
              fontFamily: "Inter",
            }}
          >
            Pin your exact location for seamless delivery
          </p>
        </div>

        {/* Search Input */}
        {/* <div
          style={{
            padding: "20px",
            position: "relative",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              border: "1px solid #e0e0e0",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "12px 16px",
                gap: "8px",
              }}
            >
              <FaSearch size={18} color="#666" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setShowSearch(true)}
                placeholder="Search for area, street, landmark..."
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  fontSize: "16px",
                  padding: "8px 0",
                  backgroundColor: "transparent",
                  fontFamily: "Inter",
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSearchSuggestions([]);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "18px",
                    color: "#666",
                    cursor: "pointer",
                    padding: "4px",
                  }}
                >
                  ×
                </button>
              )}
            </div>

            {showSearch && searchSuggestions.length > 0 && (
              <div
                style={{
                  borderTop: "1px solid #e0e0e0",
                  maxHeight: "200px",
                  overflowY: "auto",
                }}
              >
                {searchSuggestions.map((place, index) => (
                  <div
                    key={place.place_id}
                    onClick={() => handleLocationSelect(place)}
                    style={{
                      padding: "12px 16px",
                      borderBottom:
                        index < searchSuggestions.length - 1
                          ? "1px solid #f0f0f0"
                          : "none",
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                      fontSize: "14px",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#f8f9fa";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "white";
                    }}
                  >
                    <div style={{ fontWeight: "500", color: "#333" }}>
                      {place.structured_formatting.main_text}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#666",
                        marginTop: "2px",
                      }}
                    >
                      {place.structured_formatting.secondary_text}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div> */}

        {/* Use Current Location Button */}
        <div
          style={{
            padding: "0 20px 20px 20px",
            flexShrink: 0,
          }}
        >
          <button
            onClick={handleUseCurrentLocation}
            disabled={actionLoading === "current-location"}
            style={{
              width: "100%",
              padding: "12px 16px",
              backgroundColor: "#6B8E23",
              border: "1px solid #6B8E23",
              borderRadius: "12px",
              color: "#fff",
              fontSize: "14px",
              fontWeight: "500",
              cursor:
                actionLoading === "current-location"
                  ? "not-allowed"
                  : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              fontFamily: "Inter",
              transition: "all 0.2s ease",
              opacity: actionLoading === "current-location" ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (!actionLoading) {
                e.target.style.backgroundColor = "#5a7a1c";
              }
            }}
            onMouseLeave={(e) => {
              if (!actionLoading) {
                e.target.style.backgroundColor = "#6B8E23";
              }
            }}
          >
            {actionLoading === "current-location" ? (
              <>
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                Getting location...
              </>
            ) : (
              <>
                <FaCrosshairs size={16} />
                Use current location
                {primaryAddressId && " (Clear primary)"}
              </>
            )}
          </button>
        </div>

        {/* Saved Addresses */}
        <div
          style={{
            padding: "0 20px 20px 20px",
            flex: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            opacity: loading ? 0.5 : 1,
            transition: "opacity 0.3s",
          }}
        >
          <h6
            style={{
              color: "#2c2c2c",
              fontFamily: "Inter",
              fontWeight: "600",
              marginBottom: "16px",
              fontSize: "16px",
            }}
          >
            Saved Addresses
            {primaryAddressId &&
              ` (Primary: ${getPrimaryName(getPrimaryAddress())})`}
          </h6>

          {savedAddresses.length === 0 && !loading ? (
            <div
              style={{
                textAlign: "center",
                padding: "20px",
                color: "#666",
                fontFamily: "Inter",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FaMapMarkerAlt size={32} color="#ccc" className="mb-2" />
              <p style={{ margin: 0, fontSize: "14px" }}>
                No saved addresses yet
              </p>
            </div>
          ) : (
            <div style={{ flex: 1, overflowY: "auto" }}>
              {savedAddresses.map((address, index) => (
                <div
                  key={address._id}
                  style={{
                    padding: "16px",
                    border: isPrimaryAddress(address._id)
                      ? "2px solid #6B8E23"
                      : "1px solid #e0e0e0",
                    borderRadius: "12px",
                    marginBottom:
                      index < savedAddresses.length - 1 ? "12px" : "0",
                    backgroundColor: isPrimaryAddress(address._id)
                      ? "#f8fff8"
                      : "white",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="d-flex align-items-start flex-grow-1">
                      <span
                        style={{
                          fontSize: "18px",
                          marginRight: "12px",
                          marginTop: "2px",
                        }}
                      >
                        {getAddressIcon(address.addressType)}
                      </span>
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center mb-1">
                          <h6
                            style={{
                              margin: 0,
                              color: "#2c2c2c",
                              fontFamily: "Inter",
                              fontWeight: "600",
                              fontSize: "14px",
                            }}
                          >
                            {getPrimaryName(address)}
                          </h6>
                          {isPrimaryAddress(address._id) && (
                            <span
                              style={{
                                marginLeft: "8px",
                                fontSize: "10px",
                                color: "#6B8E23",
                                fontWeight: "500",
                                backgroundColor: "#f0f9f0",
                                padding: "2px 6px",
                                borderRadius: "4px",
                              }}
                            >
                              PRIMARY
                            </span>
                          )}
                        </div>
                        <p
                          style={{
                            margin: 0,
                            color: "#666",
                            fontSize: "12px",
                            fontFamily: "Inter",
                            lineHeight: "1.4",
                          }}
                        >
                          {address.fullAddress}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeliverHere(address)}
                      disabled={actionLoading === address._id}
                      style={{
                        backgroundColor: isPrimaryAddress(address._id)
                          ? "#6B8E23"
                          : "transparent",
                        border: isPrimaryAddress(address._id)
                          ? "none"
                          : "1px solid #6B8E23",
                        borderRadius: "8px",
                        color: isPrimaryAddress(address._id)
                          ? "white"
                          : "#6B8E23",
                        fontSize: "12px",
                        fontWeight: "500",
                        padding: "6px 12px",
                        cursor:
                          actionLoading === address._id
                            ? "not-allowed"
                            : "pointer",
                        whiteSpace: "nowrap",
                        marginLeft: "12px",
                        fontFamily: "Inter",
                        transition: "all 0.2s ease",
                        minWidth: "100px",
                        opacity: actionLoading === address._id ? 0.7 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (!isPrimaryAddress(address._id) && !actionLoading) {
                          e.target.style.backgroundColor = "#6B8E23";
                          e.target.style.color = "white";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isPrimaryAddress(address._id) && !actionLoading) {
                          e.target.style.backgroundColor = "transparent";
                          e.target.style.color = "#6B8E23";
                        }
                      }}
                    >
                      {actionLoading === address._id ? (
                        <div
                          className="spinner-border spinner-border-sm"
                          role="status"
                        >
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      ) : isPrimaryAddress(address._id) ? (
                        <>
                          <FaCheckCircle size={12} className="me-1" />
                          Selected
                        </>
                      ) : (
                        "Deliver here"
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Search Action Loading */}
        {actionLoading === "search" && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              zIndex: 10,
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              className="spinner-border"
              role="status"
              style={{
                width: "3rem",
                height: "3rem",
                color: "#6B8E23",
              }}
            >
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationModal2;
