import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const LocationConfirmationSimple = () => {
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isServiceable, setIsServiceable] = useState(null);
  const [isValidatingServiceability, setIsValidatingServiceability] =
    useState(false);
  const [error, setError] = useState("");
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [showLocationDisabledPopup, setShowLocationDisabledPopup] =
    useState(false);

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSearch, setShowSearch] = useState(false);

  // Service request states (same as location.jsx)
  const [showServiceablePopup, setShowServiceablePopup] = useState(false);
  const [serviceRequestName, setServiceRequestName] = useState("");
  const [serviceRequestPhone, setServiceRequestPhone] = useState("");
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  // Map refs
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const geocoderRef = useRef(null);
  const fixedPinRef = useRef(null);
  const fixedMessageRef = useRef(null);
  const autocompleteServiceRef = useRef(null);
  const placesServiceRef = useRef(null);
  const searchInputRef = useRef(null);

  const API_KEY = import.meta.env.VITE_MAP_KEY;
  console.log('dfgdfg',API_KEY);

  // Initialize services
  const initializeServices = useCallback(() => {
    if (window.google && window.google.maps && !geocoderRef.current) {
      geocoderRef.current = new window.google.maps.Geocoder();
      autocompleteServiceRef.current =
        new window.google.maps.places.AutocompleteService();

      if (mapInstanceRef.current && !placesServiceRef.current) {
        placesServiceRef.current = new window.google.maps.places.PlacesService(
          mapInstanceRef.current
        );
      }
    }
  }, []);

  // Get address from coordinates
  const getAddressFromCoordinates = useCallback(async (lat, lng) => {
    if (!window.google || !window.google.maps || !geocoderRef.current) {
      setAddress("Address service not available");
      return;
    }

    if (
      typeof lat !== "number" ||
      typeof lng !== "number" ||
      isNaN(lat) ||
      isNaN(lng)
    ) {
      setAddress("Invalid location coordinates");
      return;
    }

    setIsGeocoding(true);

    try {
      const response = await new Promise((resolve, reject) => {
        geocoderRef.current.geocode(
          { location: { lat, lng } },
          (results, status) => {
            if (status === "OK" && results && results[0]) {
              resolve(results[0].formatted_address);
            } else if (status === "ZERO_RESULTS") {
              resolve("No address found for this location");
            } else {
              reject(new Error(`Geocoding failed: ${status}`));
            }
          }
        );
      });

      setAddress(response);
    } catch (error) {
      console.error("Geocoding error:", error);
      setAddress("Address not available");
    } finally {
      setIsGeocoding(false);
    }
  }, []);

  // Validate serviceability of a location
  const validateServiceability = async (location) => {
    if (!location) return;

    try {
      setIsValidatingServiceability(true);

      const response = await fetch(
        "http://localhost:7013/api/Hub/validate-location",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            lat: location.lat.toString(),
            lng: location.lng.toString(),
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setIsServiceable(data.serviceable);
      } else {
        console.error("Serviceability validation failed:", data.message);
        setIsServiceable(null);
      }
    } catch (error) {
      console.error("Serviceability validation error:", error);
      setIsServiceable(null);
    } finally {
      setIsValidatingServiceability(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 2 && autocompleteServiceRef.current) {
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

  // Handle location selection from search
  const handleLocationSelect = (place) => {
    if (placesServiceRef.current) {
      placesServiceRef.current.getDetails(
        {
          placeId: place.place_id,
          fields: ["geometry", "name", "formatted_address"],
        },
        (placeResult, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            const location = {
              lat: placeResult.geometry.location.lat(),
              lng: placeResult.geometry.location.lng(),
            };

            setSelectedLocation(location);
            setAddress(placeResult.formatted_address);

            if (mapInstanceRef.current && markerRef.current) {
              // Smooth pan and zoom to selected location
              mapInstanceRef.current.panTo(location);
              mapInstanceRef.current.setZoom(16);

              // Update marker position
              markerRef.current.setPosition(location);
            }

            setShowSearch(false);
            setSearchQuery("");
            setSearchSuggestions([]);

            // Validate serviceability for the selected location
            validateServiceability(location);
          }
        }
      );
    }
  };

  // Check location permission
  const checkLocationPermission = () => {
    if (!navigator.geolocation) {
      setShowLocationDisabledPopup(true);
      return false;
    }

    // Check if permission was previously denied
    if (navigator.permissions) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((result) => {
          if (result.state === "denied") {
            setShowLocationDisabledPopup(true);
            return false;
          }
          return true;
        })
        .catch(() => {
          // If permissions API fails, try to get location anyway
          return true;
        });
    }
    return true;
  };

  // Load Google Maps script
  useEffect(() => {
    if (window.google && window.google.maps) {
      setScriptLoaded(true);
      initializeServices();
      return;
    }

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

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setScriptLoaded(true);
      initializeServices();
    };

    script.onerror = () => {
      setError("Failed to load Google Maps. Please check your API key.");
      setIsLoading(false);
    };

    document.head.appendChild(script);
  }, [initializeServices]);

  // Get current location on component mount
  useEffect(() => {
    if (scriptLoaded) {
      getCurrentLocation();
    }
  }, [scriptLoaded]);

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setShowLocationDisabledPopup(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location = {
          lat: latitude,
          lng: longitude,
        };
        setSelectedLocation(location);
        validateServiceability(location);

        // Initialize map with location
        setTimeout(() => {
          if (mapRef.current) {
            initializeMap(location);
            getAddressFromCoordinates(location.lat, location.lng);
          }
          setIsLoading(false);
        }, 500);
      },
      (error) => {
        console.error("Error getting location:", error);

        // Show location disabled popup for permission denied errors
        if (error.code === error.PERMISSION_DENIED) {
          setShowLocationDisabledPopup(true);
        } else {
          setError(`Unable to retrieve your location: ${error.message}`);
        }

        const defaultLocation = { lat: 40.7128, lng: -74.006 };
        setSelectedLocation(defaultLocation);
        validateServiceability(defaultLocation);

        setTimeout(() => {
          if (mapRef.current) {
            initializeMap(defaultLocation);
            getAddressFromCoordinates(defaultLocation.lat, defaultLocation.lng);
          }
          setIsLoading(false);
        }, 500);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const initializeMap = (location) => {
    if (!mapRef.current || !window.google || !window.google.maps) {
      console.error("Map container not found or Google Maps not loaded");
      return;
    }

    try {
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 16,
        center: location,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: false,
        rotateControl: false,
        scaleControl: false,
        panControl: false,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "on" }],
          },
        ],
        backgroundColor: "#f5f5f5",
        disableDefaultUI: true,
        gestureHandling: "greedy",
      });

      mapInstanceRef.current = map;

      // Initialize places service
      if (!placesServiceRef.current) {
        placesServiceRef.current = new window.google.maps.places.PlacesService(
          map
        );
      }

      // Create current location button
      const locationButton = document.createElement("button");
      locationButton.style.backgroundColor = "#fff";
      locationButton.style.border = "2px solid #fff";
      locationButton.style.borderRadius = "8px";
      locationButton.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
      locationButton.style.color = "#6b8e23";
      locationButton.style.cursor = "pointer";
      locationButton.style.padding = "10px";
      locationButton.style.width = "40px";
      locationButton.style.height = "40px";
      locationButton.style.display = "flex";
      locationButton.style.alignItems = "center";
      locationButton.style.justifyContent = "center";
      locationButton.style.margin = "10px";
      locationButton.style.transition = "all 0.3s ease";
      locationButton.style.fontSize = "24px";

      // Add the location icon using innerHTML
      locationButton.innerHTML = `
        <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="24px" width="24px" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"></path>
        </svg>
      `;

      // Hover effect
      locationButton.addEventListener("mouseenter", () => {
        locationButton.style.backgroundColor = "#f8f8f8";
        locationButton.style.transform = "scale(1.05)";
      });

      locationButton.addEventListener("mouseleave", () => {
        locationButton.style.backgroundColor = "#fff";
        locationButton.style.transform = "scale(1)";
      });

      // Click handler to get current location
      locationButton.addEventListener("click", () => {
        // Loading spinner during location fetch
        locationButton.innerHTML = `
          <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="24px" width="24px" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" opacity="0.3"/>
            <path d="M12 2 A10 10 0 0 1 22 12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round">
              <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
            </path>
          </svg>
        `;

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const currentLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };

              console.log("Current location:", currentLocation);

              // Center map on current location
              map.setCenter(currentLocation);
              map.setZoom(16);

              // Update marker position
              if (markerRef.current) {
                markerRef.current.setPosition(currentLocation);
              }

              // Update location state
              setSelectedLocation(currentLocation);

              // Get address for current location
              getAddressFromCoordinates(
                currentLocation.lat,
                currentLocation.lng
              );

              // Validate serviceability
              validateServiceability(currentLocation);

              // Restore location icon
              locationButton.innerHTML = `
                <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="24px" width="24px" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"></path>
                </svg>
              `;
            },
            (error) => {
              console.error("Error getting location:", error);

              // Show error - restore icon
              alert(
                "Unable to get your location. Please check location permissions."
              );

              locationButton.innerHTML = `
                <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="24px" width="24px" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"></path>
                </svg>
              `;
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0,
            }
          );
        } else {
          alert("Geolocation is not supported by your browser");
        }
      });

      // Add button to map at bottom-right corner
      map.controls[window.google.maps.ControlPosition.RIGHT_BOTTOM].push(
        locationButton
      );

      // Create fixed pin element
      const fixedPinElement = document.createElement("div");
      fixedPinElement.style.position = "absolute";
      fixedPinElement.style.top = "50%";
      fixedPinElement.style.left = "50%";
      fixedPinElement.style.transform = "translate(-50%, -100%)";
      fixedPinElement.style.width = "40px";
      fixedPinElement.style.height = "50px";
      fixedPinElement.style.pointerEvents = "none";
      fixedPinElement.style.zIndex = "1000";

      fixedPinElement.innerHTML = `
  <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
    <style>
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
      @media (max-width: 480px) {
        .pin-line {
          animation: pulse 1.5s ease-in-out infinite !important;
        }
      }
    </style>
    <circle cx="20" cy="10" r="8" fill="#6B8E23" stroke="#fff" stroke-width="2"/>
    <line 
      x1="20" y1="18" 
      x2="20" y2="45" 
      stroke="#6B8E23" 
      stroke-width="3" 
      stroke-linecap="round"
      class="pin-line"
      style="animation: pulse 2s ease-in-out infinite;"
    />
    <ellipse cx="20" cy="48" rx="4" ry="2" fill="#000" opacity="0.2"/>
  </svg>
`;

      // Create fixed message element
      const fixedMessageElement = document.createElement("div");
      fixedMessageElement.style.position = "absolute";
      fixedMessageElement.style.top = "calc(50% - 70px)";
      fixedMessageElement.style.left = "50%";
      fixedMessageElement.style.transform = "translateX(-50%)";
      fixedMessageElement.style.background = "#6b8e23";
      fixedMessageElement.style.color = "white";
      fixedMessageElement.style.padding = "8px 12px";
      fixedMessageElement.style.borderRadius = "6px";
      fixedMessageElement.style.fontFamily = "Arial, sans-serif";
      fixedMessageElement.style.fontSize = "12px";
      fixedMessageElement.style.fontWeight = "700";
      fixedMessageElement.style.lineHeight = "1.2";
      fixedMessageElement.style.maxWidth = "200px";
      fixedMessageElement.style.textAlign = "center";
      fixedMessageElement.style.pointerEvents = "none";
      fixedMessageElement.style.zIndex = "1000";
      fixedMessageElement.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";

      // Add responsive styles for mobile
      const mobileStyles = `
  @media (max-width: 480px) {
    .fixed-pin-message {
      top: calc(50% - 60px) !important;
      padding: 6px 10px !important;
      font-size: 11px !important;
      max-width: 160px !important;
      border-radius: 4px !important;
    }
    .fixed-pin-message div:first-child {
      font-size: 10px !important;
    }
    .fixed-pin-message div:last-child {
      font-size: 9px !important;
      margin-top: 1px !important;
    }
  }
  
  @media (max-width: 360px) {
    .fixed-pin-message {
      top: calc(50% - 55px) !important;
      padding: 5px 8px !important;
      font-size: 10px !important;
      max-width: 140px !important;
    }
    .fixed-pin-message div:first-child {
      font-size: 9px !important;
    }
    .fixed-pin-message div:last-child {
      font-size: 8px !important;
    }
  }
  
  @media (min-width: 481px) and (max-width: 768px) {
    .fixed-pin-message {
      top: calc(50% - 65px) !important;
      padding: 7px 10px !important;
      font-size: 11px !important;
      max-width: 180px !important;
    }
  }
`;

      // Add mobile class and styles
      fixedMessageElement.className = "fixed-pin-message";

      // Inject responsive styles
      const styleElement = document.createElement("style");
      styleElement.textContent = mobileStyles;
      document.head.appendChild(styleElement);

      fixedMessageElement.innerHTML = `
  <div>Order will be delivered here</div>
  <div style="font-size: 10px; opacity: 0.9; margin-top: 2px; font-weight: normal;">
    Move the map to set delivery location
  </div>
`;

      // Make pin responsive too
      const pinStyles = `
  @media (max-width: 480px) {
    .fixed-pin {
      width: 32px !important;
      height: 40px !important;
    }
    .fixed-pin svg {
      width: 32px !important;
      height: 40px !important;
    }
  }
  
  @media (max-width: 360px) {
    .fixed-pin {
      width: 28px !important;
      height: 35px !important;
    }
    .fixed-pin svg {
      width: 28px !important;
      height: 35px !important;
    }
  }
  
  @media (min-width: 481px) and (max-width: 768px) {
    .fixed-pin {
      width: 36px !important;
      height: 45px !important;
    }
    .fixed-pin svg {
      width: 36px !important;
      height: 45px !important;
    }
  }
`;

      // Apply responsive styles to pin
      fixedPinElement.className = "fixed-pin";
      const pinStyleElement = document.createElement("style");
      pinStyleElement.textContent = pinStyles;
      document.head.appendChild(pinStyleElement);

      mapRef.current.appendChild(fixedPinElement);
      mapRef.current.appendChild(fixedMessageElement);

      fixedPinRef.current = fixedPinElement;
      fixedMessageRef.current = fixedMessageElement;

      // Create hidden marker for location tracking
      markerRef.current = new window.google.maps.Marker({
        position: location,
        map: map,
        visible: false,
        title: "Delivery location",
      });
      mapRef.current.appendChild(fixedPinElement);
      mapRef.current.appendChild(fixedMessageElement);

      fixedPinRef.current = fixedPinElement;
      fixedMessageRef.current = fixedMessageElement;

      // Create hidden marker for location tracking
      markerRef.current = new window.google.maps.Marker({
        position: location,
        map: map,
        visible: false,
        title: "Delivery location",
      });

      // Listen for map center changes
      let mapMoveTimeout;

      const updateLocationFromCenter = () => {
        const newCenter = map.getCenter();
        const newLocation = {
          lat: newCenter.lat(),
          lng: newCenter.lng(),
        };

        markerRef.current.setPosition(newLocation);
        setSelectedLocation(newLocation);
        getAddressFromCoordinates(newLocation.lat, newLocation.lng);
        validateServiceability(newLocation);
      };

      map.addListener("center_changed", () => {
        if (mapMoveTimeout) clearTimeout(mapMoveTimeout);
        mapMoveTimeout = setTimeout(() => {
          updateLocationFromCenter();
        }, 300);
      });
    } catch (error) {
      console.error("Error initializing map:", error);
      setError("Failed to initialize map. Please try again.");
    }
  };

  // Handle confirm location
  const handleConfirmLocation = async () => {
    if (!selectedLocation) return;

    try {
      // If serviceability hasn't been checked yet, check it now
      if (isServiceable === null) {
        await validateServiceability(selectedLocation);
      }

      // If location is serviceable, save to localStorage and navigate to home
      if (isServiceable === true) {
        // Get hub information from serviceability validation
        let hubData = null;
        try {
          const response = await fetch(
            "http://localhost:7013/api/Hub/validate-location",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                lat: selectedLocation.lat.toString(),
                lng: selectedLocation.lng.toString(),
              }),
            }
          );
          const data = await response.json();
          if (data.success && data.hubs && data.hubs.length > 0) {
            hubData = data.hubs[0]; // Get the first hub
          }
        } catch (hubError) {
          console.warn("Failed to fetch hub details:", hubError);
        }

        // Prepare location data in the exact format you specified
        const locationData = {
          location: {
            type: "Point",
            coordinates: [selectedLocation.lng, selectedLocation.lat], // [longitude, latitude]
          },
          fullAddress: address,
          hubName: hubData?.hubName || "",
          hubId: hubData?.hub || null,
        };

        // Save to localStorage in the exact format
        try {
          localStorage.setItem("currentLocation", JSON.stringify(locationData));
        } catch (storageError) {
          console.warn(
            "Failed to save location to localStorage:",
            storageError
          );
        }

        // Navigate to home
        navigate("/home");
      }
      // If location is not serviceable, show service request modal (same as location.jsx)
      else if (isServiceable === false) {
        setShowServiceablePopup(true);
        // Pre-fill user details if available
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
          setServiceRequestName(user.Fname || "");
          setServiceRequestPhone(user.Mobile || "");
        }
      }
      // If serviceability check is still in progress, show loading and retry
      else {
        setIsLoading(true);
        setTimeout(async () => {
          await validateServiceability(selectedLocation);
          setIsLoading(false);
          // Recursively call this function after check completes
          handleConfirmLocation();
        }, 500);
      }
    } catch (error) {
      console.error("Error confirming location:", error);
      setError("Failed to confirm location. Please try again.");
      setIsLoading(false);
    }
  };

  // Handle service request (same as location.jsx)
  const handleServiceRequest = async () => {
    // Convert to string and handle null/undefined
    const name = String(serviceRequestName || "");
    const phone = String(serviceRequestPhone || "");

    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    if (!phone.trim()) {
      setError("Please enter your phone number");
      return;
    }

    // Basic phone validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone.trim())) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    try {
      setIsSubmittingRequest(true);
      setError(""); // Clear any previous errors

      const user = JSON.parse(localStorage.getItem("user"));

      if (!user || !user._id) {
        setError("User not found. Please login again.");
        return;
      }

      const customerId = user._id;

      const requestData = {
        customerId,
        name: name.trim(),
        phone: phone.trim(),
        location: selectedLocation,
        address: address,
      };

      console.log("Submitting service request:", requestData);

      const response = await fetch(
        "http://localhost:7013/api/service-requests",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );

      const result = await response.json();

      if (result.success) {
        // Show success message
        alert(
          "Thank you! Your request has been submitted successfully. We'll notify you when we start operations in your area."
        );

        // Reset and redirect
        setShowServiceablePopup(false);
        setServiceRequestName("");
        setServiceRequestPhone("");

        // Redirect to location page
        navigate("/location");
      } else {
        throw new Error(result.message || "Failed to submit request");
      }
    } catch (error) {
      console.error("Error submitting service request:", error);
      setError(error.message || "Failed to submit request. Please try again.");
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  // Handle cancel service request
  const handleCancelServiceRequest = () => {
    setShowServiceablePopup(false);
    setServiceRequestName("");
    setServiceRequestPhone("");
  };

  // Handle retry location
  const handleRetryLocation = () => {
    setShowLocationDisabledPopup(false);
    getCurrentLocation();
  };

  // Get button text based on serviceability status
  const getConfirmButtonText = () => {
    if (isValidatingServiceability) {
      return "Checking serviceability...";
    }

    if (isServiceable === true) {
      return "Confirm Location";
    }

    if (isServiceable === false) {
      return "Location Not Serviceable - Request Access";
    }

    return "Confirm Location";
  };

  // Get button style based on serviceability status
  const getConfirmButtonStyle = () => {
    if (isValidatingServiceability || !selectedLocation) {
      return { backgroundColor: "#ccc", cursor: "default" };
    }

    if (isServiceable === true) {
      return { backgroundColor: "#6B8E23", cursor: "pointer" };
    }

    if (isServiceable === false) {
      return { backgroundColor: "#b22222", cursor: "pointer" };
    }

    return { backgroundColor: "#ccc", cursor: "default" };
  };

  // Detect current location
  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter(userLocation);
            mapInstanceRef.current.setZoom(16);
          }

          setSelectedLocation(userLocation);
          getAddressFromCoordinates(userLocation.lat, userLocation.lng);
          validateServiceability(userLocation);
        },
        (error) => {
          console.error("Error getting current location:", error);
          if (error.code === error.PERMISSION_DENIED) {
            setShowLocationDisabledPopup(true);
          } else {
            setError("Unable to detect your current location.");
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    } else {
      setShowLocationDisabledPopup(true);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        fontFamily: "Arial, sans-serif",
        position: "relative",
      }}
    >
      {/* Location Disabled Popup */}
      {showLocationDisabledPopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 3000,
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "16px",
              padding: "24px",
              maxWidth: "400px",
              width: "100%",
              textAlign: "center",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            }}
          >
            <div
              style={{
                fontSize: "48px",
                marginBottom: "16px",
                color: "#ff6b6b",
              }}
            >
              📍
            </div>
            <h3
              style={{
                marginBottom: "12px",
                color: "#333",
                fontSize: "20px",
                fontWeight: "600",
              }}
            >
              Location is Disabled
            </h3>
            <p
              style={{
                marginBottom: "24px",
                color: "#666",
                fontSize: "14px",
                lineHeight: "1.5",
              }}
            >
              Please enable location access in your browser settings to use this
              feature.
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                marginTop: "12px",
              }}
            >
              <button
                onClick={handleRetryLocation}
                style={{
                  backgroundColor: "#6B8E23",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  padding: "14px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#5a7a1a";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#6B8E23";
                }}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Serviceability Popup (same as location.jsx) */}
      {showServiceablePopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 3000,
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "#F8F6F0",
              borderRadius: "16px",
              padding: "24px",
              maxWidth: "400px",
              width: "100%",
              textAlign: "center",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            }}
          >
            <div
              style={{
                fontSize: "48px",
                marginBottom: "16px",
                color: "#ffa500",
              }}
            >
              📍
            </div>
            <h3
              style={{
                marginBottom: "12px",
                color: "#333",
                fontSize: "20px",
                fontWeight: "600",
              }}
            >
              Coming Soon to Your Area!
            </h3>
            <p
              style={{
                marginBottom: "16px",
                color: "#666",
                fontSize: "14px",
                lineHeight: "1.5",
              }}
            >
              We're not currently operating in this location, but we're
              expanding rapidly! Let us know you're interested, and we'll notify
              you as soon as we launch in your area.
            </p>

            <div style={{ marginBottom: "20px", textAlign: "left" }}>
              <div style={{ marginBottom: "12px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  Your Name *
                </label>
                <input
                  type="text"
                  value={serviceRequestName}
                  onChange={(e) => setServiceRequestName(e.target.value)}
                  placeholder="Enter your name"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={serviceRequestPhone}
                  onChange={(e) => setServiceRequestPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div
                style={{
                  fontSize: "12px",
                  color: "#666",
                  marginBottom: "16px",
                }}
              >
                <strong>Selected Location:</strong> {address}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <button
                onClick={handleServiceRequest}
                disabled={
                  isSubmittingRequest ||
                  !serviceRequestName ||
                  !serviceRequestPhone
                }
                style={{
                  backgroundColor:
                    isSubmittingRequest ||
                    !serviceRequestName ||
                    !serviceRequestPhone
                      ? "#ccc"
                      : "#6B8E23",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  padding: "14px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor:
                    isSubmittingRequest ||
                    !serviceRequestName ||
                    !serviceRequestPhone
                      ? "not-allowed"
                      : "pointer",
                  transition: "background-color 0.2s",
                }}
              >
                {isSubmittingRequest ? "Submitting..." : "Request Location"}
              </button>
              <button
                onClick={handleCancelServiceRequest}
                style={{
                  backgroundColor: "transparent",
                  color: "#666",
                  border: "1px solid #ddd",
                  borderRadius: "12px",
                  padding: "14px",
                  fontSize: "16px",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#f5f5f5";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Vertical Layout */}
      <div
        style={{ display: "flex", flexDirection: "column", height: "100vh" }}
      >
        {/* Top Panel - Map */}
        <div
          style={{
            flex: "1",
            position: "relative",
            backgroundColor: "#e9ecef",
            minHeight: "50vh",
          }}
        >
          <div
            ref={mapRef}
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "#e9ecef",
            }}
          />

          {/* Search Bar */}
          <div
            style={{
              position: "absolute",
              top: "16px",
              left: "16px",
              right: "16px",
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
                padding: "8px 12px",
                gap: "8px",
              }}
            >
              <span style={{ fontSize: "18px", color: "#666" }}>🔍</span>
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
                  fontSize: "14px",
                  padding: "8px 0",
                  backgroundColor: "transparent",
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

          {/* Loading Overlay */}
          {isLoading && (
            <div
              style={{
                position: "absolute",
                top: "0",
                left: "0",
                right: "0",
                bottom: "0",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                zIndex: "2000",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  border: "4px solid #e0e0e0",
                  borderTop: "4px solid #6B8E23",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  marginBottom: "16px",
                }}
              ></div>
              <div
                style={{
                  fontSize: "16px",
                  color: "#333",
                  fontWeight: "500",
                }}
              >
                Loading map...
              </div>
            </div>
          )}
        </div>

        {/* Bottom Panel - Location Details */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding:
              window.innerWidth <= 360
                ? "1px"
                : window.innerWidth <= 480
                ? "2px"
                : window.innerWidth <= 768
                ? "4px"
                : "8px",
            backgroundColor: "transparent",
            position: "relative",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius:
                window.innerWidth <= 360
                  ? "8px"
                  : window.innerWidth <= 480
                  ? "10px"
                  : "12px",
              boxShadow: "0 -2px 12px rgba(0,0,0,0.1)",
              width: "100%",
              maxWidth:
                window.innerWidth <= 360
                  ? "94%"
                  : window.innerWidth <= 480
                  ? "96%"
                  : window.innerWidth <= 768
                  ? "98%"
                  : "500px",
              maxHeight:
                window.innerWidth <= 360
                  ? "30vh"
                  : window.innerWidth <= 480
                  ? "35vh"
                  : window.innerWidth <= 768
                  ? "40vh"
                  : "55vh",
              overflowY: "auto",
              border: "1px solid #e0e0e0",
              margin: "0 auto",
              transition: "all 0.3s ease",
            }}
          >
            <div
              style={{
                padding:
                  window.innerWidth <= 360
                    ? "4px 8px"
                    : window.innerWidth <= 480
                    ? "6px 10px"
                    : window.innerWidth <= 768
                    ? "8px 12px"
                    : "12px 16px",
              }}
            >
              {/* Serviceability Status */}
              {selectedLocation && isServiceable === false && (
                <div
                  style={{
                    backgroundColor: "#fff3e0",
                    border: "1px solid #ffcc80",
                    borderRadius:
                      window.innerWidth <= 360
                        ? "4px"
                        : window.innerWidth <= 480
                        ? "5px"
                        : "6px",
                    padding:
                      window.innerWidth <= 360
                        ? "4px 8px"
                        : window.innerWidth <= 480
                        ? "6px 10px"
                        : "8px 12px",
                    marginBottom:
                      window.innerWidth <= 360
                        ? "6px"
                        : window.innerWidth <= 480
                        ? "8px"
                        : "10px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap:
                        window.innerWidth <= 360
                          ? "3px"
                          : window.innerWidth <= 480
                          ? "4px"
                          : "6px",
                      fontSize:
                        window.innerWidth <= 360
                          ? "11px"
                          : window.innerWidth <= 480
                          ? "12px"
                          : "13px",
                      fontWeight: "500",
                      color: "#b22222",
                    }}
                  >
                    <span
                      style={{
                        fontSize:
                          window.innerWidth <= 360
                            ? "12px"
                            : window.innerWidth <= 480
                            ? "14px"
                            : "16px",
                      }}
                    >
                      ⚠️
                    </span>
                    <span>Service not available</span>
                  </div>
                  <div
                    style={{
                      fontSize:
                        window.innerWidth <= 360
                          ? "9px"
                          : window.innerWidth <= 480
                          ? "10px"
                          : "11px",
                      color: "#666",
                      marginTop: window.innerWidth <= 360 ? "1px" : "2px",
                      lineHeight: window.innerWidth <= 360 ? "1.1" : "1.3",
                    }}
                  >
                    Confirm to request service for this location
                  </div>
                </div>
              )}

              {/* Current Location Display */}
              <div
                style={{
                  padding:
                    window.innerWidth <= 360
                      ? "4px"
                      : window.innerWidth <= 480
                      ? "6px"
                      : window.innerWidth <= 768
                      ? "8px"
                      : "10px",
                  borderRadius:
                    window.innerWidth <= 360
                      ? "4px"
                      : window.innerWidth <= 480
                      ? "6px"
                      : "8px",
                  marginBottom:
                    window.innerWidth <= 360
                      ? "6px"
                      : window.innerWidth <= 480
                      ? "8px"
                      : window.innerWidth <= 768
                      ? "10px"
                      : "12px",
                  backgroundColor: "#f8f9fa",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap:
                      window.innerWidth <= 360
                        ? "3px"
                        : window.innerWidth <= 480
                        ? "4px"
                        : window.innerWidth <= 768
                        ? "6px"
                        : "8px",
                  }}
                >
                  <div
                    style={{
                      fontSize:
                        window.innerWidth <= 360
                          ? "12px"
                          : window.innerWidth <= 480
                          ? "14px"
                          : window.innerWidth <= 768
                          ? "16px"
                          : "18px",
                      color: "#4caf50",
                      marginTop: window.innerWidth <= 360 ? "1px" : "2px",
                      flexShrink: 0,
                    }}
                  >
                    📍
                  </div>
                  <div style={{ flex: "1", minWidth: 0 }}>
                    <div
                      style={{
                        fontSize:
                          window.innerWidth <= 360
                            ? "11px"
                            : window.innerWidth <= 480
                            ? "12px"
                            : window.innerWidth <= 768
                            ? "13px"
                            : "14px",
                        fontWeight: "600",
                        color: "#2e7d32",
                        marginBottom: window.innerWidth <= 360 ? "1px" : "2px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      Your Location
                    </div>
                    <div
                      style={{
                        fontSize:
                          window.innerWidth <= 360
                            ? "9px"
                            : window.innerWidth <= 480
                            ? "10px"
                            : window.innerWidth <= 768
                            ? "11px"
                            : "12px",
                        color: "#666",
                        lineHeight:
                          window.innerWidth <= 360
                            ? "1.1"
                            : window.innerWidth <= 480
                            ? "1.2"
                            : "1.3",
                        wordBreak: "break-word",
                        display: "-webkit-box",
                        WebkitLineClamp:
                          window.innerWidth <= 360
                            ? 2
                            : window.innerWidth <= 480
                            ? 2
                            : 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {address || "Detecting address..."}
                    </div>
                  </div>
                </div>
              </div>

              {/* Confirm Button */}
              <div>
                <button
                  onClick={handleConfirmLocation}
                  disabled={isValidatingServiceability || !selectedLocation}
                  style={{
                    width: "100%",
                    padding:
                      window.innerWidth <= 360
                        ? "6px"
                        : window.innerWidth <= 480
                        ? "8px"
                        : window.innerWidth <= 768
                        ? "10px"
                        : "12px",
                    ...getConfirmButtonStyle(),
                    color: "white",
                    border: "none",
                    borderRadius:
                      window.innerWidth <= 360
                        ? "4px"
                        : window.innerWidth <= 480
                        ? "6px"
                        : "8px",
                    fontSize:
                      window.innerWidth <= 360
                        ? "11px"
                        : window.innerWidth <= 480
                        ? "12px"
                        : window.innerWidth <= 768
                        ? "13px"
                        : "14px",
                    fontWeight: "600",
                    cursor:
                      isValidatingServiceability || !selectedLocation
                        ? "default"
                        : "pointer",
                    transition: "all 0.2s ease",
                    opacity:
                      isValidatingServiceability || !selectedLocation ? 0.6 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!isValidatingServiceability && selectedLocation) {
                      e.target.style.transform = "translateY(-1px)";
                      e.target.style.boxShadow =
                        window.innerWidth <= 360
                          ? "0 1px 4px rgba(0,0,0,0.1)"
                          : "0 2px 8px rgba(0,0,0,0.15)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isValidatingServiceability && selectedLocation) {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "none";
                    }
                  }}
                >
                  {getConfirmButtonText()}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            left: "20px",
            right: "20px",
            backgroundColor: "#ffebee",
            color: "#c62828",
            padding: "16px",
            borderRadius: "8px",
            border: "1px solid #ffcdd2",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            zIndex: "2000",
            maxWidth: "calc(100% - 40px)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
            }}
          >
            <div style={{ fontSize: "18px" }}>⚠️</div>
            <div style={{ flex: "1" }}>
              <div style={{ fontWeight: "600", marginBottom: "4px" }}>
                Error
              </div>
              <div style={{ fontSize: "14px" }}>{error}</div>
            </div>
            <button
              onClick={() => setError("")}
              style={{
                background: "none",
                border: "none",
                color: "#c62828",
                cursor: "pointer",
                fontSize: "18px",
                padding: "0",
                width: "24px",
                height: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default LocationConfirmationSimple;
