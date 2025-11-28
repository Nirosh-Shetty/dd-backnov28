import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import locationpng from "./../assets/deliverylocation.svg";
import homeimg from "./../assets/ion_home-outline.png";
import homeimg2 from "./../assets/ion_home-outline-white.svg";
import apartmentimg from "./../assets/apartment.png";
import apartmentimg2 from "./../assets/tabler_building-skyscraper-white.svg";
import workimg from "./../assets/streamline-ultimate_work-from-home-user-sofa.png";
import workimg2 from "./../assets/streamline-ultimate_work-from-home-user-sofa-white.svg";
import schoolimg from "./../assets/streamline-ultimate-color_study-exam-math.png";
import schoolimg2 from "./../assets/streamline-ultimate-color_study-exam-math-white.png";
import cross from "./../assets/cross.png";
import { CircleCheck } from "lucide-react";
import spilt from "./../assets/spilt.png";
import secure from "./../assets/secure.png";
import warning from "./../assets/warning.png";
import axios from "axios";
import { MdMyLocation } from "react-icons/md";

const LocationConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [address, setAddress] = useState("");
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const isLargeScreen = window.innerWidth >= 768;

  // Location permission states
  const [showLocationPermission, setShowLocationPermission] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);

  // Address form state
  const [hub, setHub] = useState([]);
  const [houseName, setHouseName] = useState("");
  const [homeName, setHomeName] = useState("");
  const [addressType, setAddressType] = useState("");
  const [landmark, setLandmark] = useState("");
  const [floor, setFloor] = useState("");

  // PG specific fields
  const [apartmentName, setApartmentName] = useState("");
  const [towerBlock, setTowerBlock] = useState("");
  const [flat, setFlat] = useState("");

  // School specific fields
  const [schoolName, setSchoolName] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [studentSection, setStudentSection] = useState("");

  // Work specific field
  const [companyName, setCompanyName] = useState("");
  const [floorNo, setFloorNo] = useState("");

  // Serviceability states
  const [showServiceablePopup, setShowServiceablePopup] = useState(false);
  const [serviceRequestName, setServiceRequestName] = useState();
  const [serviceRequestPhone, setServiceRequestPhone] = useState("");
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [isServiceable, setIsServiceable] = useState(null); // null: not checked, true: serviceable, false: not serviceable
  const [isValidatingServiceability, setIsValidatingServiceability] =
    useState(false);

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const geocoderRef = useRef(null);
  const autocompleteServiceRef = useRef(null);
  const placesServiceRef = useRef(null);
  const searchInputRef = useRef(null);
  const infoWindowRef = useRef(null);
  const fixedPinRef = useRef(null);
  const fixedMessageRef = useRef(null);

  const API_KEY = import.meta.env.VITE_MAP_KEY;

  // Track if we're editing an address
  const [isEditing, setIsEditing] = useState(false);

  // Check location permission on component mount
  useEffect(() => {
    checkLocationPermission();

    // Prevent back navigation if location not confirmed
    const handleBackButton = (e) => {
      if (!isConfirmed) {
        e.preventDefault();
        navigate("/home");
      }
    };

    window.history.pushState(null, null, window.location.pathname);
    window.addEventListener("popstate", handleBackButton);

    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, [isConfirmed]);

  // Check location permission
  const checkLocationPermission = () => {
    if (!navigator.geolocation) {
      setLocationDenied(true);
      setShowLocationPermission(true);
      return;
    }

    // Check if permission was previously denied
    navigator.permissions
      ?.query({ name: "geolocation" })
      .then((result) => {
        if (result.state === "denied") {
          setLocationDenied(true);
          setShowLocationPermission(true);
        } else if (result.state === "prompt") {
          setShowLocationPermission(true);
        }
      })
      .catch(() => {
        // If permissions API is not supported, show the popup
        setShowLocationPermission(true);
      });
  };

  // Handle allow location
  const handleAllowLocation = () => {
    setShowLocationPermission(false);
    getCurrentLocation();
  };

  // Handle deny location
  const handleDenyLocation = () => {
    setLocationDenied(true);
    setShowLocationPermission(false);
    const defaultLocation = { lat: 40.7128, lng: -74.006 };
    setCurrentLocation(defaultLocation);
    setSelectedLocation(defaultLocation);
    setIsLoading(false);
  };

  // Handle retry location
  const handleRetryLocation = () => {
    setLocationDenied(false);
    setShowLocationPermission(true);
  };

  // Check if coming from modal with selected place OR editing existing address
  useEffect(() => {
    if (location.state?.selectedPlace) {
      const { selectedPlace } = location.state;
      handleSelectedPlaceFromModal(selectedPlace);
    } else if (location.state?.editingAddress) {
      // Scenario 3: Editing existing address
      const { editingAddress } = location.state;
      setIsEditing(true);
      handleEditingAddress(editingAddress);
    }
  }, [location.state]);

  // Handle place selected from modal
  const handleSelectedPlaceFromModal = (selectedPlace) => {
    if (selectedPlace.location && selectedPlace.address) {
      setSelectedLocation(selectedPlace.location);
      setAddress(selectedPlace.address);
      setHouseName(selectedPlace.name || selectedPlace.address.split(",")[0]);

      if (mapInstanceRef.current && markerRef.current) {
        mapInstanceRef.current.panTo(selectedPlace.location);
        mapInstanceRef.current.setZoom(16);
        markerRef.current.setPosition(selectedPlace.location);

        // Update info window position
        if (infoWindowRef.current) {
          infoWindowRef.current.setPosition(selectedPlace.location);
        }
      }

      setIsConfirmed(false);
      // Validate serviceability for the selected place
      validateServiceability(selectedPlace.location);
    }
  };

  // Handle editing existing address - FIXED with proper coordinate handling
  const handleEditingAddress = (editingAddress) => {
    console.log("Editing address:", editingAddress);

    let locationCoords = { lat: 40.7128, lng: -74.006 }; // Default fallback

    if (editingAddress.location) {
      // Handle different location formats
      if (
        editingAddress.location.coordinates &&
        editingAddress.location.coordinates.length >= 2
      ) {
        // MongoDB GeoJSON format: [longitude, latitude]
        locationCoords = {
          lng: parseFloat(editingAddress.location.coordinates[0]),
          lat: parseFloat(editingAddress.location.coordinates[1]),
        };
      } else if (editingAddress.location.lat && editingAddress.location.lng) {
        // Standard lat/lng object format
        locationCoords = {
          lat: parseFloat(editingAddress.location.lat),
          lng: parseFloat(editingAddress.location.lng),
        };
      } else {
        console.warn("Invalid coordinates format, using default location");
      }
    } else {
      console.warn("No location data found, using default location");
    }

    console.log("Setting location coords:", locationCoords);

    setSelectedLocation(locationCoords);
    setAddress(editingAddress.fullAddress || editingAddress.address || "");
    setHouseName(editingAddress.houseName || "");
    setAddressType(editingAddress.addressType || "");

    // Pre-fill all the form fields based on address type
    if (editingAddress.addressType === "Home") {
      setHomeName(editingAddress.homeName || "");
      setLandmark(editingAddress.landmark || "");
      setFloor(editingAddress.floor || "");
    } else if (editingAddress.addressType === "PG") {
      setApartmentName(editingAddress.apartmentName || "");
      setTowerBlock(editingAddress.towerBlock || "");
      setFlat(editingAddress.flat || "");
      setFloor(editingAddress.floor || "");
    } else if (editingAddress.addressType === "School") {
      setSchoolName(editingAddress.schoolName || "");
      setStudentName(editingAddress.studentName || "");
      setStudentClass(editingAddress.studentClass || "");
      setStudentSection(editingAddress.studentSection || "");
    } else if (editingAddress.addressType === "Work") {
      setCompanyName(editingAddress.companyName || "");
      setFloorNo(editingAddress.floorNo || "");
    }

    // DON'T auto-confirm or show form - wait for user to click "Confirm Location"
    setIsConfirmed(false);
    setShowAddressForm(false);

    // Validate serviceability for the editing address
    validateServiceability(locationCoords);
  };

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
      console.warn("Geocoder not available");
      setAddress("Address service not available");
      return;
    }

    // Validate coordinates
    if (
      typeof lat !== "number" ||
      typeof lng !== "number" ||
      isNaN(lat) ||
      isNaN(lng)
    ) {
      console.warn("Invalid coordinates:", { lat, lng });
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
      const shortAddress = response.split(",")[0];
      setHouseName(shortAddress);
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
        if (data.serviceable) {
          setHub(data.hubs || []);
          console.log("Location is serviceable. Hubs:", data.hubs);
        } else {
          console.log("Location is not serviceable");
          setHub([]);
        }
      } else {
        console.error("Serviceability validation failed:", data.message);
        setIsServiceable(null);
        setHub([]);
      }
    } catch (error) {
      console.error("Serviceability validation error:", error);
      setIsServiceable(null);
      setHub([]);
    } finally {
      setIsValidatingServiceability(false);
    }
  };

  // console.log("hub.................." , hub)

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
      console.log("Google Maps script loaded successfully");
    };

    script.onerror = () => {
      setError("Failed to load Google Maps. Please check your API key.");
      setIsLoading(false);
    };

    document.head.appendChild(script);
  }, [initializeServices]);

  // Initialize map when script is loaded AND we have a location - FIXED LOGIC
  useEffect(() => {
    if (
      scriptLoaded &&
      selectedLocation &&
      !showLocationPermission &&
      !locationDenied &&
      !mapInstanceRef.current // Only initialize once
    ) {
      console.log(
        "Script loaded and selected location available:",
        selectedLocation
      );

      // Small delay to ensure DOM is ready
      setTimeout(() => {
        if (mapRef.current) {
          console.log("Initializing map with location:", selectedLocation);
          initializeMap(selectedLocation);

          // Only get address if we don't already have one
          if (
            !address ||
            address === "Detecting your address..." ||
            address === "Address not available"
          ) {
            getAddressFromCoordinates(
              selectedLocation.lat,
              selectedLocation.lng
            );
          }

          // Validate serviceability for the initial location
          validateServiceability(selectedLocation);
        }
        setIsLoading(false);
      }, 500);
    }
  }, [scriptLoaded, selectedLocation, showLocationPermission, locationDenied]);

  // Set initial location based on scenario - FIXED
  useEffect(() => {
    if (scriptLoaded) {
      // Scenario 1: Selected place from modal
      if (location.state?.selectedPlace) {
        const { selectedPlace } = location.state;
        setSelectedLocation(selectedPlace.location);
        setAddress(selectedPlace.address);
        setHouseName(selectedPlace.name || selectedPlace.address.split(",")[0]);
      }
      // Scenario 3: Editing existing address
      else if (location.state?.editingAddress) {
        const { editingAddress } = location.state;
        let locationCoords = { lat: 40.7128, lng: -74.006 }; // Default fallback

        if (editingAddress.location) {
          if (
            editingAddress.location.coordinates &&
            editingAddress.location.coordinates.length >= 2
          ) {
            locationCoords = {
              lng: parseFloat(editingAddress.location.coordinates[0]),
              lat: parseFloat(editingAddress.location.coordinates[1]),
            };
          } else if (
            editingAddress.location.lat &&
            editingAddress.location.lng
          ) {
            locationCoords = {
              lat: parseFloat(editingAddress.location.lat),
              lng: parseFloat(editingAddress.location.lng),
            };
          }
        }

        console.log("Setting editing address location:", locationCoords);
        setSelectedLocation(locationCoords);
        setAddress(editingAddress.fullAddress || editingAddress.address || "");
      }
      // Scenario 2: Default - get current location
      else {
        getCurrentLocation();
      }
    }
  }, [scriptLoaded, showLocationPermission, locationDenied]);

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
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
        console.log("Got current location:", location);
        setCurrentLocation(location);
        setSelectedLocation(location);
        setLocationDenied(false);

        // Validate serviceability for current location
        validateServiceability(location);
      },
      (error) => {
        console.error("Error getting location:", error);
        setError(`Unable to retrieve your location: ${error.message}`);
        setLocationDenied(true);

        const defaultLocation = { lat: 40.7128, lng: -74.006 };
        setCurrentLocation(defaultLocation);
        setSelectedLocation(defaultLocation);

        // Validate serviceability for default location
        validateServiceability(defaultLocation);
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
      console.log("Creating new map instance at:", location);

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

      if (!placesServiceRef.current) {
        placesServiceRef.current = new window.google.maps.places.PlacesService(
          map
        );
      }

      // Create custom location button
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

      // Add the icon using innerHTML
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
              setIsConfirmed(false);

              // Get address for current location
              getAddressFromCoordinates(
                currentLocation.lat,
                currentLocation.lng
              );

              // Validate serviceability
              validateServiceability(currentLocation);

              // Restore MdMyLocation icon
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

      // Create the pin SVG
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

      infoWindowRef.current = null;

      markerRef.current = new window.google.maps.Marker({
        position: location,
        map: map,
        visible: false,
        title: "Delivery location",
      });

      console.log("Fixed pin and message created at center");

      let mapMoveTimeout;

      const updateLocationFromCenter = () => {
        const newCenter = map.getCenter();
        const newLocation = {
          lat: newCenter.lat(),
          lng: newCenter.lng(),
        };

        console.log("Map moved to:", newLocation);
        markerRef.current.setPosition(newLocation);
        setSelectedLocation(newLocation);
        setIsConfirmed(false);
        getAddressFromCoordinates(newLocation.lat, newLocation.lng);
        validateServiceability(newLocation);
      };

      map.addListener("center_changed", () => {
        if (mapMoveTimeout) clearTimeout(mapMoveTimeout);
        mapMoveTimeout = setTimeout(() => {
          updateLocationFromCenter();
        }, 300);
      });

      map.addListener("dragstart", () => {
        if (fixedPinRef.current) {
          const line = fixedPinRef.current.querySelector("line");
          if (line) {
            line.style.animation = "pulse 0.5s ease-in-out infinite";
          }
        }

        if (fixedMessageRef.current) {
          fixedMessageRef.current.style.transform =
            "translateX(-50%) scale(0.95)";
          fixedMessageRef.current.style.opacity = "0.9";
        }
      });

      map.addListener("dragend", () => {
        if (fixedPinRef.current) {
          const line = fixedPinRef.current.querySelector("line");
          if (line) {
            line.style.animation = "pulse 2s ease-in-out infinite";
          }
        }

        if (fixedMessageRef.current) {
          fixedMessageRef.current.style.transform = "translateX(-50%)";
          fixedMessageRef.current.style.opacity = "1";
        }
      });

      map.addListener("idle", () => {
        if (fixedPinRef.current) {
          const line = fixedPinRef.current.querySelector("line");
          if (line) {
            line.style.animation = "pulse 2s ease-in-out infinite";
          }
        }

        if (fixedMessageRef.current) {
          fixedMessageRef.current.style.transform = "translateX(-50%)";
          fixedMessageRef.current.style.opacity = "1";
        }
      });

      console.log("Map initialized successfully with fixed pin and message");
    } catch (error) {
      console.error("Error initializing map:", error);
      setError("Failed to initialize map. Please try again.");
    }
  };

  const createCustomPinSVG = () => {
    return {
      url:
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(`
        <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
          <style>
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.7; }
            }
          </style>
          <!-- Pin point -->
          <circle cx="20" cy="10" r="8" fill="#6B8E23" stroke="#fff" stroke-width="2"/>
          <!-- Pin stem -->
          <line 
            x1="20" y1="18" 
            x2="20" y2="45" 
            stroke="#6B8E23" 
            stroke-width="3" 
            stroke-linecap="round"
            style="animation: pulse 2s ease-in-out infinite;"
          />
          <!-- Shadow effect -->
          <ellipse cx="20" cy="48" rx="4" ry="2" fill="#000" opacity="0.2"/>
        </svg>
      `),
      size: new window.google.maps.Size(40, 50),
      origin: new window.google.maps.Point(0, 0),
      anchor: new window.google.maps.Point(20, 50), // Anchor at bottom center
      scaledSize: new window.google.maps.Size(40, 50),
    };
  };

  useEffect(() => {
    return () => {
      // Clean up fixed elements when component unmounts
      if (fixedPinRef.current && fixedPinRef.current.parentNode) {
        fixedPinRef.current.parentNode.removeChild(fixedPinRef.current);
      }
      if (fixedMessageRef.current && fixedMessageRef.current.parentNode) {
        fixedMessageRef.current.parentNode.removeChild(fixedMessageRef.current);
      }
    };
  }, []);

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

  // Handle location selection from search - UPDATED for smooth transitions
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
            setHouseName(
              placeResult.name || placeResult.formatted_address.split(",")[0]
            );

            if (mapInstanceRef.current && markerRef.current) {
              // Smooth pan and zoom instead of reset
              mapInstanceRef.current.panTo(location);
              mapInstanceRef.current.setZoom(16);

              // Smooth marker movement
              markerRef.current.setPosition(location);

              // Update info window position
              if (infoWindowRef.current) {
                infoWindowRef.current.setPosition(location);
              }
            }

            setShowSearch(false);
            setSearchQuery("");
            setSearchSuggestions([]);
            setIsConfirmed(false);

            // Validate serviceability for the selected location
            validateServiceability(location);
          }
        }
      );
    }
  };

  // Handle confirm location - NOW SIMPLIFIED since serviceability is already checked
  const handleConfirmLocation = async () => {
    if (!selectedLocation) return;

    // If serviceability hasn't been checked yet, check it now
    if (isServiceable === null) {
      await validateServiceability(selectedLocation);
    }

    // If location is serviceable, proceed to address form
    if (isServiceable === true) {
      setIsConfirmed(true);
      setShowAddressForm(true);
    }
    // If location is not serviceable, show the service request popup
    else if (isServiceable === false) {
      setShowServiceablePopup(true);
      // Pre-fill user details if available
      const user = JSON.parse(localStorage.getItem("user"));
      if (user) {
        setServiceRequestName(user.Fname || "");
        setServiceRequestPhone(user.Mobile || "");
      }
    }
    // If serviceability check is still in progress, show loading
    else {
      setIsLoading(true);
      // Wait for serviceability check to complete
      setTimeout(async () => {
        await validateServiceability(selectedLocation);
        setIsLoading(false);
        // Recursively call this function after check completes
        handleConfirmLocation();
      }, 500);
    }
  };

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

      const response = await axios.post(
        "http://localhost:7013/api/service-requests",
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000, // 10 second timeout
        }
      );

      console.log(response, "rrrrrrrrrrrrrrrrrrrrrrrr");

      if (response.data.success) {
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
        throw new Error(response.data.message || "Failed to submit request");
      }
    } catch (error) {
      console.error("Error submitting service request:", error);

      // Handle different types of errors
      if (error.code === "ECONNABORTED") {
        setError("Request timeout. Please try again.");
      } else if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const message =
          error.response.data?.message || "Failed to submit request";

        if (status === 409) {
          setError("You already have a pending request for this location.");
        } else if (status === 400) {
          setError("Invalid request. Please check your information.");
        } else if (status === 404) {
          setError("User not found. Please login again.");
        } else if (status >= 500) {
          setError("Server error. Please try again later.");
        } else {
          setError(message);
        }
      } else if (error.request) {
        // Request was made but no response received
        setError("Network error. Please check your connection and try again.");
      } else {
        // Something else happened
        setError(
          error.message || "Failed to submit request. Please try again."
        );
      }
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

  // Reset form fields when address type changes (only if not editing)
  useEffect(() => {
    if (!location.state?.editingAddress) {
      setLandmark("");
      setFloor("");
      setTowerBlock("");
      setFlat("");
      setStudentName("");
      setStudentClass("");
      setStudentSection("");
      setFloorNo("");
      setHomeName("");
      setApartmentName("");
      setSchoolName("");
      setCompanyName("");
    }
  }, [addressType, location.state?.editingAddress]);

  // Check if form is valid based on address type
  const isFormValid = () => {
    if (!houseName.trim()) return false;

    switch (addressType) {
      case "Home":
        return homeName.trim();
      case "PG":
        return apartmentName.trim() && towerBlock.trim() && flat.trim();
      case "School":
        return (
          schoolName.trim() &&
          studentName.trim() &&
          studentClass.trim() &&
          studentSection.trim()
        );
      case "Work":
        return companyName.trim() && floorNo.trim();
      default:
        return false;
    }
  };

  // Handle save address
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      setError("Please fill all required fields");
      return;
    }

    const addressData = {
      location: selectedLocation,
      address: address,
      houseName: houseName,
      addressType: addressType,
      homeName: homeName,
      apartmentName: apartmentName,
      schoolName: schoolName,
      companyName: companyName,
      hubName: hub[0]?.hubName || "",
      hubId: hub[0]?.hub || "",
      ...(addressType === "Home" && { landmark, floor }),
      ...(addressType === "PG" && { towerBlock, flat, floor }),
      ...(addressType === "School" && {
        studentName,
        studentClass,
        studentSection,
      }),
      ...(addressType === "Work" && { floorNo }),
      fullAddress: generateFullAddress(),
    };

    console.log("Saving address:", addressData);

    try {
      setIsLoading(true);

      const user = JSON.parse(localStorage.getItem("user"));
      const customerId = user._id;

      if (!customerId) {
        setError("Customer ID not found. Please login again.");
        return;
      }

      const requestPayload = {
        customerId: customerId,
        addressType: addressData.addressType,
        houseName: addressData.houseName,
        fullAddress: addressData.fullAddress,
        location: {
          lat: addressData.location.lat,
          lng: addressData.location.lng,
        },
        landmark: addressData.landmark || "",
        floor: addressData.floor || "",
        towerBlock: addressData.towerBlock || "",
        flat: addressData.flat || "",
        studentName: addressData.studentName || "",
        studentClass: addressData.studentClass || "",
        studentSection: addressData.studentSection || "",
        floorNo: addressData.floorNo || "",
        homeName: addressData.homeName || "",
        apartmentName: addressData.apartmentName || "",
        schoolName: addressData.schoolName || "",
        companyName: addressData.companyName || "",
        isDefault: true,
        hubName: addressData.hubName || "",
        hubId: addressData.hubId || "",
      };

      // If editing existing address, include addressId for update
      if (location.state?.editingAddress?._id) {
        requestPayload.addressId = location.state.editingAddress._id;
      }

      const endpoint = location.state?.editingAddress?._id
        ? `http://localhost:7013/api/User/customers/${user._id}/addresses/${location.state.editingAddress._id}`
        : "http://localhost:7013/api/User/addresses";
      const method = location.state?.editingAddress?._id ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save address");
      }

      const result = await response.json();

      if (result.success) {
        setShowAddressForm(false);
        resetForm();

        navigate("/home", {
          state: {
            userLocation: selectedLocation,
            userAddress: address,
            addressData: addressData,
          },
        });
      } else {
        throw new Error(result.message || "Failed to save address");
      }
    } catch (error) {
      console.error("Error saving address:", error);
      setError(error.message || "Failed to save address. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel button click
  const handleCancel = () => {
    setShowAddressForm(false);
    setIsConfirmed(false);
  };

  // Generate full address based on type
  const generateFullAddress = () => {
    let fullAddress = address;

    switch (addressType) {
      case "Home":
        if (homeName) fullAddress = `${homeName}, ${fullAddress}`;
        if (landmark) fullAddress += `, near ${landmark}`;
        if (floor) fullAddress += `, ${floor}`;
        break;
      case "PG":
        if (apartmentName) fullAddress = `${apartmentName}, ${fullAddress}`;
        if (towerBlock) fullAddress += `, ${towerBlock}`;
        if (flat) fullAddress += `, ${flat}`;
        if (floor) fullAddress += `, ${floor}`;
        break;
      case "School":
        if (schoolName) fullAddress = `${schoolName}, ${fullAddress}`;
        if (studentName) fullAddress += `, ${studentName}`;
        if (studentClass) fullAddress += `, Class ${studentClass}`;
        if (studentSection) fullAddress += `, Section ${studentSection}`;
        break;
      case "Work":
        if (companyName) fullAddress = `${companyName}, ${fullAddress}`;
        if (floorNo) fullAddress += `, ${floorNo}`;
        break;
    }

    return fullAddress;
  };

  // Reset all form fields
  const resetForm = () => {
    setHouseName("");
    setLandmark("");
    setFloor("");
    setTowerBlock("");
    setFlat("");
    setStudentName("");
    setStudentClass("");
    setStudentSection("");
    setFloorNo("");
    setHomeName("");
    setApartmentName("");
    setSchoolName("");
    setCompanyName("");
  };

  // Address type options
  const addressTypes = [
    { key: "Home", label: "Home", icon: homeimg, icon2: homeimg2 },
    {
      key: "PG",
      label: "PG/ Apartment",
      icon: apartmentimg,
      icon2: apartmentimg2,
    },
    { key: "School", label: "School", icon: schoolimg, icon2: schoolimg2 },
    { key: "Work", label: "Work", icon: workimg, icon2: workimg2 },
  ];

  const renderTypeSpecificFields = () => {
    const commonInputStyle = {
      width: "100%",
      height: "44px",
      borderRadius: "12px",
      padding: "8px 16px",
      border: "0.4px solid #6B8E23",
      background: "#FAFAFA",
      fontSize: "14px",
      marginBottom: "10px",
    };

    switch (addressType) {
      case "Home":
        return (
          <div
            className="d-flex flex-column align-items-start mt-2"
            style={{
              gap: "12px",
              borderRadius: "12px",
              width: "100%",
              maxWidth: window.innerWidth > 768 ? "500px" : "354px",
              margin: "0 auto 20px auto",
            }}
          >
            <input
              type="text"
              value={homeName}
              onChange={(e) => setHomeName(e.target.value)}
              placeholder="Home Name *"
              style={commonInputStyle}
            />
            <input
              type="text"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="Landmark, building, floor"
              style={{ ...commonInputStyle, marginBottom: "0" }}
            />
          </div>
        );

      case "PG":
        return (
          <div
            className="d-flex flex-column align-items-start mt-2"
            style={{
              gap: "12px",
              borderRadius: "12px",
              width: "100%",
              maxWidth: window.innerWidth > 768 ? "500px" : "354px",
              margin: "0 auto 20px auto",
            }}
          >
            <input
              type="text"
              value={apartmentName}
              onChange={(e) => setApartmentName(e.target.value)}
              placeholder="Apartment Name *"
              style={commonInputStyle}
            />
            <input
              type="text"
              value={towerBlock}
              onChange={(e) => setTowerBlock(e.target.value)}
              placeholder="Tower/Block name *"
              style={commonInputStyle}
            />
            <div
              className="d-flex"
              style={{
                width: "100%",
                gap: "12px",
              }}
            >
              <input
                type="text"
                value={flat}
                onChange={(e) => setFlat(e.target.value)}
                placeholder="Flat *"
                style={commonInputStyle}
              />
              <input
                type="text"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                placeholder="Floor"
                style={commonInputStyle}
              />
            </div>
          </div>
        );

      case "School":
        return (
          <div
            className="d-flex flex-column align-items-start mt-2"
            style={{
              gap: "12px",
              borderRadius: "12px",
              width: "100%",
              maxWidth: window.innerWidth > 768 ? "500px" : "354px",
              margin: "0 auto 20px auto",
            }}
          >
            <div className="d-flex gap-2 align-items-start">
              <img
                src={spilt}
                alt=""
                style={{ width: "20px", height: "20px", marginTop: "2px" }}
              />
              <p
                className="mb-0"
                style={{
                  color: "#2c2c2c",
                  fontSize: "14px",
                  fontFamily: "Inter",
                  fontWeight: "500",
                }}
              >
                Later you can split the order
              </p>
              <img
                src={warning}
                alt=""
                style={{ width: "10px", height: "10px", marginTop: "6px" }}
              />
            </div>

            <div className="d-flex gap-2 align-items-start">
              <img
                src={secure}
                alt=""
                style={{ width: "12px", height: "12px", marginTop: "2px" }}
              />
              <p
                className="mb-0"
                style={{
                  color: "#2c2c2c",
                  fontSize: "10px",
                  fontFamily: "Inter",
                  fontWeight: "500",
                }}
              >
                Safe & Private: details are only used to deliver correctly.
              </p>
            </div>

            <input
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="School Name *"
              style={commonInputStyle}
            />

            <input
              type="text"
              placeholder="Student's full name *"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              style={commonInputStyle}
            />

            <div
              className="d-flex justify-content-between"
              style={{
                width: "100%",
                gap: "12px",
              }}
            >
              <input
                type="text"
                placeholder="Class *"
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
                style={commonInputStyle}
              />
              <input
                type="text"
                placeholder="Section *"
                value={studentSection}
                onChange={(e) => setStudentSection(e.target.value)}
                style={commonInputStyle}
              />
            </div>
          </div>
        );

      case "Work":
        return (
          <div
            className="d-flex flex-column align-items-start mt-2"
            style={{
              gap: "12px",
              borderRadius: "12px",
              width: "100%",
              maxWidth: window.innerWidth > 768 ? "500px" : "354px",
              margin: "0 auto 20px auto",
            }}
          >
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Company Name *"
              style={commonInputStyle}
            />
            <input
              type="text"
              value={floorNo}
              onChange={(e) => setFloorNo(e.target.value)}
              placeholder="Floor no *"
              style={{ ...commonInputStyle, marginBottom: "0" }}
            />
          </div>
        );

      default:
        return null;
    }
  };

  // Get button text based on serviceability status
  const getConfirmButtonText = () => {
    if (isValidatingServiceability) {
      return "Checking serviceability...";
    }

    if (isConfirmed) {
      return "✅ Location Confirmed";
    }

    if (location.state?.editingAddress) {
      return "Confirm Location to Edit";
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

    if (isConfirmed) {
      return { backgroundColor: "#4caf50" };
    }

    if (isServiceable === false) {
      return { backgroundColor: "#b22222" };
    }

    return { backgroundColor: "#6B8E23" };
  };

  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          // Update the map center to user's current location
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter(userLocation);
            mapInstanceRef.current.setZoom(16);
          }

          // Update selected location
          setSelectedLocation(userLocation);
          setIsConfirmed(false);

          // Get address for the new location
          getAddressFromCoordinates(userLocation.lat, userLocation.lng);

          // Validate serviceability
          validateServiceability(userLocation);

          console.log("Located user at:", userLocation);
        },
        (error) => {
          console.error("Error getting current location:", error);
          setError(
            "Unable to detect your current location. Please make sure location services are enabled."
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
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
      {/* Location Permission Popup */}
      {showLocationPermission && (
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
              Allow Location Access
            </h3>
            <p
              style={{
                marginBottom: "24px",
                color: "#666",
                fontSize: "14px",
                lineHeight: "1.5",
              }}
            >
              We need your location to show nearby restaurants and deliver your
              orders accurately.
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <button
                onClick={handleAllowLocation}
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
                Allow Location Access
              </button>
              <button
                onClick={handleDenyLocation}
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
                Not Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Location Denied Popup */}
      {locationDenied && !showLocationPermission && (
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
              ❌
            </div>
            <h3
              style={{
                marginBottom: "12px",
                color: "#333",
                fontSize: "20px",
                fontWeight: "600",
              }}
            >
              Location Access Denied
            </h3>
            <p
              style={{
                marginBottom: "24px",
                color: "#666",
                fontSize: "14px",
                lineHeight: "1.5",
              }}
            >
              To get accurate delivery locations and nearby restaurants, please
              enable location access in your browser settings.
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
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
              <button
                onClick={() => setLocationDenied(false)}
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
                Continue Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Serviceability Popup */}
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
            ></div>
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

          {/* Serviceability Status Indicator */}
          {/* {selectedLocation && isServiceable !== null && !showAddressForm && (
            <div
              style={{
                position: "absolute",
                bottom: "16px",
                left: "16px",
                right: "16px",
                backgroundColor: isServiceable ? "#e8f5e8" : "#fff3e0",
                border: `1px solid ${isServiceable ? "#c8e6c9" : "#ffcc80"}`,
                borderRadius: "10px",
                padding: "12px 16px",
                zIndex: 1000,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: isServiceable ? "#2e7d32" : "#e65100",
                }}
              >
                <span style={{ fontSize: "16px" }}>
                  {isServiceable ? "✅" : "⚠️"}
                </span>
                <span>
                  {isServiceable
                    ? "This location is serviceable"
                    : "This location is not currently serviceable"}
                </span>
              </div>
              {!isServiceable && (
                <div
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    marginTop: "4px",
                    lineHeight: "1.4",
                  }}
                >
                  You can still confirm this location and request service for your area.
                </div>
              )}
            </div>
          )} */}

          {/* Address Form Modal */}
          {showAddressForm && (
            <div
              className="modal show fade d-block"
              tabIndex="-1"
              role="dialog"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.5)",
                boxShadow: "1px 0px 4px 0px #00000040",
                zIndex: 2000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                className="modal-dialog"
                role="document"
                style={{
                  maxWidth: window.innerWidth > 768 ? "605px" : "402px",
                  height: "auto",
                  margin: "auto",
                  width: "90%",
                }}
              >
                <div
                  className="modal-content"
                  style={{
                    backgroundColor: "#F8F6F0",
                    borderRadius: "16px",
                    padding: window.innerWidth > 768 ? "30px 40px" : "20px",
                    position: "relative",
                  }}
                >
                  {/* Close Button */}
                  <button
                    type="button"
                    onClick={handleCancel}
                    style={{
                      position: "absolute",
                      top: "16px",
                      right: "16px",
                      background: "none",
                      border: "none",
                      fontSize: "24px",
                      color: "#666",
                      cursor: "pointer",
                      width: "32px",
                      height: "32px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "50%",
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "rgba(0,0,0,0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "transparent";
                    }}
                  >
                    ×
                  </button>

                  <form onSubmit={handleSaveAddress}>
                    {/* Address Details Section */}
                    <div style={{ marginBottom: "20px" }}>
                      {addressType ? (
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#2c2c2c",
                          }}
                        >
                          <img src={locationpng} alt="" />
                          {address}
                        </div>
                      ) : (
                        <div
                          style={{
                            fontSize: "12px",
                          }}
                        >
                          <img src={locationpng} alt="" />
                          <span
                            style={{
                              fontFamily: "Inter",
                              fontSize: "14px",
                              fontWeight: "500",
                              color: "#2c2c2c",
                            }}
                          >
                            Select Delivery Address Type
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Address Type Selection */}
                    <div style={{ marginBottom: "20px" }}>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(4, 1fr)",
                          gap: "8px",
                        }}
                      >
                        {addressTypes.map((type) => (
                          <button
                            key={type.key}
                            type="button"
                            onClick={() => setAddressType(type.key)}
                            style={{
                              width: isLargeScreen ? "auto" : "75px",
                              height: isLargeScreen ? "55px" : "43px",
                              padding: "8px",
                              borderRadius: "12px",
                              border:
                                addressType === type.key
                                  ? "1.2px solid #F5DEB3"
                                  : "1.2px solid #F5DEB3",
                              backgroundColor:
                                addressType === type.key
                                  ? "#6B8E23"
                                  : "#FFF8DC",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "4px",
                              opacity: 1,
                            }}
                          >
                            <img
                              src={
                                addressType === type.key
                                  ? type.icon2
                                  : type.icon
                              }
                              alt={type.label}
                              style={{
                                width: isLargeScreen ? "24px" : "16px",
                                height: isLargeScreen ? "24px" : "16px",
                                objectFit: "contain",
                              }}
                            />
                            <span
                              style={{
                                fontSize: "12px",
                                fontWeight: "500",
                                fontFamily: "Inter",
                                color:
                                  addressType === type.key ? "#fff" : "#000",
                              }}
                            >
                              {type.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Type Specific Fields */}
                    {renderTypeSpecificFields()}

                    {/* Footer Buttons */}
                    {addressType && (
                      <div
                        className="d-flex flex-wrap justify-content-center align-items-center mt-4 gap-3"
                        style={{
                          width: "100%",
                          margin: "0 auto",
                        }}
                      >
                        {/* Cancel Button */}
                        <button
                          type="button"
                          className="btn"
                          onClick={handleCancel}
                          style={{
                            backgroundColor: "transparent",
                            border: "1px solid #d5c5b0",
                            borderRadius: "12px",
                            width: window.innerWidth > 768 ? "160px" : "120px", // smaller on mobile
                            height: "45px",
                            fontWeight: "600",
                            textAlign: "center",
                            fontSize: window.innerWidth > 768 ? "16px" : "14px",
                            padding: "0 10px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          Cancel
                          <img
                            src={cross}
                            alt=""
                            style={{ width: "14px", height: "14px" }}
                          />
                        </button>

                        {/* Save Button */}
                        <button
                          type="submit"
                          className="btn d-flex justify-content-center align-items-center"
                          disabled={!isFormValid() || isLoading}
                          style={{
                            backgroundColor:
                              isFormValid() && !isLoading
                                ? "#E6B800"
                                : "#C0C0C0",
                            borderRadius: "12px",
                            border: "1px solid #c0c0c0",
                            width: window.innerWidth > 768 ? "200px" : "160px",
                            height: "45px",
                            fontWeight: "600",
                            color: "black",
                            cursor:
                              isFormValid() && !isLoading
                                ? "pointer"
                                : "not-allowed",
                            fontSize: window.innerWidth > 768 ? "16px" : "14px",
                            padding: "0 12px",
                            gap: "6px",
                          }}
                        >
                          {isLoading
                            ? "Saving..."
                            : location.state?.editingAddress
                            ? "Update Address"
                            : "Save Address"}
                          {!isLoading && (
                            <CircleCheck
                              style={{
                                width: "16px",
                                height: "16px",
                                marginTop: "1px",
                              }}
                            />
                          )}
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>
          )}

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
                {isLoading ? "Saving address..." : "Loading map..."}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Panel - Location Details */}
        {/* {!showAddressForm && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: window.innerWidth <= 768 ? "8px" : "16px",
              backgroundColor: "transparent",
              position: "relative",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "16px",
                boxShadow: "0 -4px 20px rgba(0,0,0,0.1)",
                width: "100%",
                maxWidth:
                  window.innerWidth >= 1200
                    ? "100%"
                    : window.innerWidth >= 768
                    ? "700px"
                    : "95%", 
                maxHeight: window.innerWidth <= 768 ? "55vh" : "70vh",
                overflowY: "auto",
                border: "1px solid #e0e0e0",
                margin: "0 auto",
                transition: "all 0.3s ease",
              }}
            >
              <div
                style={{ padding: window.innerWidth <= 768 ? "12px" : "20px" }}
              >
                {selectedLocation && isServiceable === false && (
                  <div
                    style={{
                      backgroundColor: "#fff3e0",
                      border: "1px solid #ffcc80",
                      borderRadius: "8px",
                      padding: "12px",
                      marginBottom: "16px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#b22222",
                      }}
                    >
                      <span style={{ fontSize: "16px" }}>⚠️</span>
                      <span>Service not currently available</span>
                    </div>

                    <div
                      style={{
                        fontSize: "12px",
                        color: "#666",
                        marginTop: "4px",
                        lineHeight: "1.4",
                      }}
                    >
                      You can request service for this location by confirming
                      below.
                    </div>
                  </div>
                )}
                
                <div
                  style={{
                    padding: window.innerWidth <= 768 ? "10px" : "16px",
                    borderRadius: "10px",
                    marginBottom: window.innerWidth <= 768 ? "12px" : "20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: window.innerWidth <= 768 ? "8px" : "12px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: window.innerWidth <= 768 ? "18px" : "20px",
                        color: "#4caf50",
                      }}
                    >
                      📍
                    </div>
                    <div style={{ flex: "1" }}>
                      <div
                        style={{
                          fontSize: window.innerWidth <= 768 ? "14px" : "16px",
                          fontWeight: "600",
                          color: "#2e7d32",
                          marginBottom: "4px",
                        }}
                      >
                        {isConfirmed
                          ? "Confirmed Location"
                          : location.state?.editingAddress
                          ? "Editing Address - Confirm Location"
                          : "Your Location"}
                      </div>
                      <div
                        style={{
                          fontSize: window.innerWidth <= 768 ? "12px" : "13px",
                          color: "#666",
                          lineHeight: "1.4",
                        }}
                      >
                        {address || "Detecting your address..."}
                      </div>
                    </div>
                  </div>
                </div>

               

                <div>
                  <button
                    onClick={handleConfirmLocation}
                    disabled={isValidatingServiceability || !selectedLocation}
                    style={{
                      width: "100%",
                      padding: window.innerWidth <= 768 ? "12px" : "16px",
                      ...getConfirmButtonStyle(),
                      color: "white",
                      border: "none",
                      borderRadius: "10px",
                      fontSize: window.innerWidth <= 768 ? "14px" : "16px",
                      fontWeight: "bold",
                      cursor:
                        isValidatingServiceability || !selectedLocation
                          ? "default"
                          : "pointer",
                      transition: "all 0.3s ease",
                      opacity:
                        isValidatingServiceability || !selectedLocation
                          ? 0.6
                          : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!isValidatingServiceability && selectedLocation) {
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
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
        )} */}

        {!showAddressForm && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding:
                window.innerWidth <= 480
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
                borderRadius: window.innerWidth <= 480 ? "10px" : "12px",
                boxShadow: "0 -2px 12px rgba(0,0,0,0.1)",
                width: "100%",
                maxWidth:
                  window.innerWidth <= 480
                    ? "96%"
                    : window.innerWidth <= 768
                    ? "98%"
                    : "500px",
                maxHeight:
                  window.innerWidth <= 480
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
                    window.innerWidth <= 480
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
                      borderRadius: window.innerWidth <= 480 ? "5px" : "6px",
                      padding:
                        window.innerWidth <= 480 ? "6px 10px" : "8px 12px",
                      marginBottom: window.innerWidth <= 480 ? "8px" : "10px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: window.innerWidth <= 480 ? "4px" : "6px",
                        fontSize: window.innerWidth <= 480 ? "12px" : "13px",
                        fontWeight: "500",
                        color: "#b22222",
                      }}
                    >
                      <span
                        style={{
                          fontSize: window.innerWidth <= 480 ? "14px" : "16px",
                        }}
                      >
                        ⚠️
                      </span>
                      <span>Service not available</span>
                    </div>
                    <div
                      style={{
                        fontSize: window.innerWidth <= 480 ? "10px" : "11px",
                        color: "#666",
                        marginTop: window.innerWidth <= 480 ? "1px" : "2px",
                        lineHeight: "1.3",
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
                      window.innerWidth <= 480
                        ? "6px"
                        : window.innerWidth <= 768
                        ? "8px"
                        : "10px",
                    borderRadius: window.innerWidth <= 480 ? "6px" : "8px",
                    marginBottom:
                      window.innerWidth <= 480
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
                        window.innerWidth <= 480
                          ? "4px"
                          : window.innerWidth <= 768
                          ? "6px"
                          : "8px",
                    }}
                  >
                    <div
                      style={{
                        fontSize:
                          window.innerWidth <= 480
                            ? "14px"
                            : window.innerWidth <= 768
                            ? "16px"
                            : "18px",
                        color: "#4caf50",
                        marginTop: window.innerWidth <= 480 ? "1px" : "2px",
                        flexShrink: 0,
                      }}
                    >
                      📍
                    </div>
                    <div style={{ flex: "1", minWidth: 0 }}>
                      <div
                        style={{
                          fontSize:
                            window.innerWidth <= 480
                              ? "12px"
                              : window.innerWidth <= 768
                              ? "13px"
                              : "14px",
                          fontWeight: "600",
                          color: "#2e7d32",
                          marginBottom:
                            window.innerWidth <= 480 ? "1px" : "2px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {isConfirmed
                          ? "Confirmed Location"
                          : location.state?.editingAddress
                          ? "Editing Address"
                          : "Your Location"}
                      </div>
                      <div
                        style={{
                          fontSize:
                            window.innerWidth <= 480
                              ? "10px"
                              : window.innerWidth <= 768
                              ? "11px"
                              : "12px",
                          color: "#666",
                          lineHeight: window.innerWidth <= 480 ? "1.2" : "1.3",
                          wordBreak: "break-word",
                          display: "-webkit-box",
                          WebkitLineClamp: window.innerWidth <= 480 ? 2 : 3,
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
                        window.innerWidth <= 480
                          ? "8px"
                          : window.innerWidth <= 768
                          ? "10px"
                          : "12px",
                      ...getConfirmButtonStyle(),
                      color: "white",
                      border: "none",
                      borderRadius: window.innerWidth <= 480 ? "6px" : "8px",
                      fontSize:
                        window.innerWidth <= 480
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
                        isValidatingServiceability || !selectedLocation
                          ? 0.6
                          : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!isValidatingServiceability && selectedLocation) {
                        e.target.style.transform = "translateY(-1px)";
                        e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
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
        )}
      </div>

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
          
          /* Smooth transitions for map elements */
          .gm-style {
            transition: all 0.3s ease;
          }
          
          /* Custom smooth pan animation */
          .smooth-pan {
            transition: transform 0.5s ease-out;
          }
        `}
      </style>
    </div>
  );
};

export default LocationConfirmation;
