import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCrosshairs,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaSearch,
} from "react-icons/fa";

const LocationModal3 = ({ show, onClose }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const searchInputRef = useRef(null);
  const autocompleteServiceRef = useRef(null);
  const placesServiceRef = useRef(null);

  const API_KEY = import.meta.env.VITE_MAP_KEY;

  // Load Google Maps script when modal opens
  useEffect(() => {
    if (show) {
      if (window.google && window.google.maps) {
        setScriptLoaded(true);
        initializeServices();
        return;
      }

      // Check if script is already loading
      if (document.querySelector(`script[src*="maps.googleapis.com"]`)) {
        const checkGoogle = setInterval(() => {
          if (window.google && window.google.maps) {
            setScriptLoaded(true);
            initializeServices();
            clearInterval(checkGoogle);
          }
        }, 100);
        return;
      }

      // Load Google Maps script
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        setScriptLoaded(true);
        initializeServices();
      };

      script.onerror = () => {
        console.error("Failed to load Google Maps script");
      };

      document.head.appendChild(script);
    }
  }, [show]);

  // Initialize services
  const initializeServices = () => {
    if (window.google && window.google.maps) {
      if (!autocompleteServiceRef.current) {
        autocompleteServiceRef.current =
          new window.google.maps.places.AutocompleteService();
      }
      if (!placesServiceRef.current) {
        placesServiceRef.current = new window.google.maps.places.PlacesService(
          document.createElement("div")
        );
      }
    }
  };

  // Focus search input when modal opens
  useEffect(() => {
    if (show && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 300);
    }
  }, [show]);

  // Fetch saved addresses
  useEffect(() => {
    if (show) {
      fetchSavedAddresses();
    }
  }, [show]);

  const fetchSavedAddresses = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));
      const customerId = user?._id;

      if (!customerId) return;

      const response = await fetch(
        `http://localhost:7013/api/User/customers/${customerId}/addresses`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const addresses = result.addresses || [];
          setSavedAddresses(addresses);

          // Find the actual default address, not just the first one
          const defaultAddr = addresses.find((addr) => addr.isDefault);
          setDefaultAddress(defaultAddr || null);
        }
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle search input changes
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (!scriptLoaded || !autocompleteServiceRef.current) {
      console.warn("Google Maps service not ready");
      return;
    }

    if (query.length > 2) {
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
    } else {
      setSearchSuggestions([]);
    }
  };

  // Handle location selection from search - Navigate to /location
  const handleLocationSelect = (place) => {
    if (!placesServiceRef.current) {
      placesServiceRef.current = new window.google.maps.places.PlacesService(
        document.createElement("div")
      );
    }

    placesServiceRef.current.getDetails(
      {
        placeId: place.place_id,
        fields: ["geometry", "name", "formatted_address", "vicinity"],
      },
      (placeResult, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          const locationData = {
            lat: placeResult.geometry.location.lat(),
            lng: placeResult.geometry.location.lng(),
          };

          // Close modal and navigate to /location with the selected place data
          onClose();
          navigate("/location", {
            state: {
              selectedPlace: {
                location: locationData,
                address: placeResult.formatted_address,
                name:
                  placeResult.name ||
                  placeResult.formatted_address.split(",")[0],
                vicinity: placeResult.vicinity,
              },
            },
          });
        }
      }
    );
  };

  const handleUseCurrentLocation = () => {
    onClose();
    navigate("/location");
  };

  const handleDeliverHere = async (address) => {
    setLoading(true); // ✅ Show loader
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const customerId = user?._id;

      if (!customerId) return;

      const response = await fetch(
        `http://localhost:7013/api/User/customers/${customerId}/addresses/${address._id}/primary`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        setDefaultAddress(address);
        localStorage.setItem("defaultAddress", JSON.stringify(address));
        onClose();

        // ✅ Wait briefly, then reload
        setTimeout(() => {
          window.location.reload();
        }, 300);
      }
    } catch (error) {
      console.error("Error setting default address:", error);
    } finally {
      setLoading(false); // ✅ Hide loader
    }
  };

  {
    loading && (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(255, 255, 255, 0.6)",
          zIndex: 2000,
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
    );
  }

  const getPrimaryName = (address) => {
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
  };

  const getAddressIcon = (type) => {
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
  };

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
        }}
        onClick={(e) => e.stopPropagation()}
      >
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
              className="btn-close"
              onClick={onClose}
              style={{
                fontSize: "12px",
                border: "none",
                background: "none",
                cursor: "pointer",
              }}
            >
              ×
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
        <div
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

            {/* Search Suggestions */}
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
        </div>

        {/* Use Current Location */}
        <div
          style={{
            padding: "0 20px 20px 20px",
            flexShrink: 0,
          }}
        >
          <button
            onClick={handleUseCurrentLocation}
            style={{
              width: "100%",
              padding: "12px 16px",
              backgroundColor: "#6B8E23",
              border: "1px solid #6B8E23",
              borderRadius: "12px",
              color: "#fff",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              fontFamily: "Inter",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#6B8E23";
              e.target.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#6B8E23";
              e.target.style.color = "white";
            }}
          >
            <FaCrosshairs size={16} />
            Use current location
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
            Saved Addresses{" "}
            {defaultAddress && `(Default: ${getPrimaryName(defaultAddress)})`}
          </h6>

          {loading ? (
            <div className="text-center py-3">
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : savedAddresses.length === 0 ? (
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
                    border:
                      defaultAddress?._id === address._id
                        ? "2px solid #6B8E23"
                        : "1px solid #e0e0e0",
                    borderRadius: "12px",
                    marginBottom:
                      index < savedAddresses.length - 1 ? "12px" : "0",
                    backgroundColor:
                      defaultAddress?._id === address._id ? "#f8fff8" : "white",
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
                          {defaultAddress?._id === address._id && (
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
                              DEFAULT
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
                      style={{
                        backgroundColor:
                          defaultAddress?._id === address._id
                            ? "#6B8E23"
                            : "transparent",
                        border:
                          defaultAddress?._id === address._id
                            ? "none"
                            : "1px solid #6B8E23",
                        borderRadius: "8px",
                        color:
                          defaultAddress?._id === address._id
                            ? "white"
                            : "#6B8E23",
                        fontSize: "12px",
                        fontWeight: "500",
                        padding: "6px 12px",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        marginLeft: "12px",
                        fontFamily: "Inter",
                        transition: "all 0.2s ease",
                        minWidth: "100px",
                      }}
                      onMouseEnter={(e) => {
                        if (defaultAddress?._id !== address._id) {
                          e.target.style.backgroundColor = "#6B8E23";
                          e.target.style.color = "white";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (defaultAddress?._id !== address._id) {
                          e.target.style.backgroundColor = "transparent";
                          e.target.style.color = "#6B8E23";
                        }
                      }}
                      disabled={loading}
                    >
                      {defaultAddress?._id === address._id ? (
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
      </div>
    </div>
  );
};

export default LocationModal3;
