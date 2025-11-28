// import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
// import { GoogleMap, useJsApiLoader, Polygon, DrawingManager } from "@react-google-maps/api";
// import { Spinner, Button, Alert } from "react-bootstrap";

// const containerStyle = {
//   width: "100%",
//   height: "600px",
// };

// const defaultCenter = { lat: 12.9716, lng: 77.5946 }; // Bangalore fallback

// function toGeoJSONFromPath(pathArray) {
//   const coordinates = pathArray.map((p) => [p.lng(), p.lat()]);
//   if (coordinates.length && (coordinates[0][0] !== coordinates[coordinates.length - 1][0] || coordinates[0][1] !== coordinates[coordinates.length - 1][1])) {
//     coordinates.push(coordinates[0]);
//   }
//   return {
//     type: "Feature",
//     geometry: {
//       type: "Polygon",
//       coordinates: [coordinates],
//     },
//     properties: {},
//   };
// }

// const AreaSelector = ({
//   apiKey,
//   value,
//   onChange,
//   onGeoJSONChange,
//   editable = true,
// }) => {
//   const [center, setCenter] = useState(defaultCenter);
//   const [paths, setPaths] = useState([]);
//   const [isDrawing, setIsDrawing] = useState(false);
//   const [drawingError, setDrawingError] = useState("");
//   const [drawingManagerReady, setDrawingManagerReady] = useState(false);
//   const polygonRef = useRef(null);
//   const drawingManagerRef = useRef(null);
//   const mapRef = useRef(null);

//   useEffect(() => {
//     if (navigator?.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (pos) => setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
//         () => {},
//         { enableHighAccuracy: false, maximumAge: 60000, timeout: 5000 }
//       );
//     }
//   }, []);

//   useEffect(() => {
//     if (value && value.type === "Feature" && value.geometry?.type === "Polygon") {
//       const ring = value.geometry.coordinates?.[0] || [];
//       const newPaths = ring
//         .slice(0, ring.length > 0 ? ring.length - 1 : 0)
//         .map(([lng, lat]) => ({ lat, lng }));
//       setPaths(newPaths);
//     }
//   }, [value]);

//   const onMapLoad = useCallback((map) => {
//     mapRef.current = map;
//   }, []);

//   const onDrawingManagerLoad = useCallback((drawingManager) => {
//     console.log("DrawingManager loaded successfully", drawingManager);
//     drawingManagerRef.current = drawingManager;
//     setDrawingManagerReady(true);

//     // Ensure drawing control is visible
//     if (drawingManager && drawingManager.setDrawingMode) {
//       drawingManager.setDrawingMode(null);
//     }
//   }, []);

//   const startDrawing = useCallback(() => {
//     try {
//       setDrawingError("");

//       if (!drawingManagerReady || !drawingManagerRef.current) {
//         setDrawingError("Drawing manager not ready. Please wait for map to load completely.");
//         console.error("DrawingManager not ready yet");
//         return;
//       }

//       if (!window.google || !window.google.maps || !window.google.maps.drawing) {
//         setDrawingError("Google Maps Drawing Library not loaded. Check API key and libraries.");
//         console.error("Google Maps Drawing library not available", {
//           google: !!window.google,
//           maps: !!window.google?.maps,
//           drawing: !!window.google?.maps?.drawing
//         });
//         return;
//       }

//       const drawingMode = window.google.maps.drawing.OverlayType.POLYGON;

//       // Verify the DrawingManager has the method
//       if (typeof drawingManagerRef.current.setDrawingMode !== 'function') {
//         setDrawingError("Drawing manager method not available. Please refresh the page.");
//         console.error("setDrawingMode is not a function", drawingManagerRef.current);
//         return;
//       }

//       drawingManagerRef.current.setDrawingMode(drawingMode);
//       setIsDrawing(true);
//       setDrawingError("");
//       console.log("Drawing mode activated successfully", { drawingMode, manager: drawingManagerRef.current });

//       // Show success message
//       setTimeout(() => {
//         if (isDrawing === false) {
//           // Still not drawing, there might be an issue
//         }
//       }, 100);
//     } catch (error) {
//       console.error("Error activating drawing mode:", error);
//       setDrawingError(`Error: ${error.message || 'Unknown error'}`);
//     }
//   }, [drawingManagerReady, isDrawing]);

//   const stopDrawing = useCallback(() => {
//     if (drawingManagerRef.current) {
//       drawingManagerRef.current.setDrawingMode(null);
//       setIsDrawing(false);
//     }
//   }, []);

//   const onPolygonComplete = useCallback((poly) => {
//     try {
//       const path = poly.getPath().getArray();
//       if (path.length < 3) {
//         setDrawingError("Polygon must have at least 3 points");
//         poly.setMap(null);
//         return;
//       }

//       const feature = toGeoJSONFromPath(path);
//       setPaths(path.map((p) => ({ lat: p.lat(), lng: p.lng() })));
//       onGeoJSONChange?.(feature);
//       onChange?.(feature);
//       poly.setMap(null); // Remove the temporary polygon

//       setIsDrawing(false);
//       setDrawingError("");

//       // Reset drawing mode after completion
//       if (drawingManagerRef.current) {
//         drawingManagerRef.current.setDrawingMode(null);
//       }

//       console.log("Polygon completed successfully");
//     } catch (error) {
//       console.error("Error processing polygon:", error);
//       setDrawingError(`Error processing polygon: ${error.message}`);
//     }
//   }, [onChange, onGeoJSONChange]);

//   const options = useMemo(
//     () => ({
//       fillColor: "#fe4500",
//       fillOpacity: 0.35,
//       strokeColor: "#fe4500",
//       strokeOpacity: 0.9,
//       strokeWeight: 3,
//       editable,
//       draggable: false,
//       clickable: true,
//       zIndex: 1,
//     }),
//     [editable]
//   );

//   const handleSetPath = useCallback(() => {
//     if (!polygonRef.current) return;
//     const path = polygonRef.current.getPath().getArray();
//     setPaths(path.map((p) => ({ lat: p.lat(), lng: p.lng() })));
//     const feature = toGeoJSONFromPath(path);
//     onGeoJSONChange?.(feature);
//     onChange?.(feature);
//   }, [onChange, onGeoJSONChange]);

//   const clearPolygon = useCallback(() => {
//     if (window.confirm("Do you want to clear this polygon?")) {
//       setPaths([]);
//       onGeoJSONChange?.(null);
//       onChange?.(null);
//       setIsDrawing(false);
//       if (drawingManagerRef.current) {
//         drawingManagerRef.current.setDrawingMode(null);
//       }
//     }
//   }, [onChange, onGeoJSONChange]);

//   const effectiveKey = apiKey || import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.VITE_MAP_KEY || "";
//   const { isLoaded, loadError } = useJsApiLoader({
//     googleMapsApiKey: effectiveKey,
//     libraries: ["drawing"],
//     id: "gmaps-loader"
//   });

//   if (loadError) {
//     console.error("Google Maps failed to load:", loadError);
//     return (
//       <div style={{ height: containerStyle.height, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #eee", borderRadius: 6, flexDirection: "column", padding: "20px" }}>
//         <Alert variant="danger">
//           <strong>Map failed to load</strong>
//           <br />
//           <small>Error: {loadError.message}</small>
//           <br />
//           <small>Please check your Google Maps API key and ensure:</small>
//           <ul style={{ textAlign: "left", marginTop: "10px" }}>
//             <li>Maps JavaScript API is enabled</li>
//             <li>Drawing Library is enabled</li>
//             <li>Billing is enabled on your Google Cloud account</li>
//             <li>API key restrictions allow your domain</li>
//           </ul>
//         </Alert>
//       </div>
//     );
//   }

//   return isLoaded ? (
//     <div style={{ position: "relative", width: "100%" }}>
//       <GoogleMap
//         mapContainerStyle={containerStyle}
//         center={center}
//         zoom={13}
//         onLoad={onMapLoad}
//         options={{
//           disableDefaultUI: false,
//           zoomControl: true,
//           streetViewControl: false,
//           fullscreenControl: true,
//           mapTypeControl: true,
//         }}
//       >
//         {editable && isLoaded && window.google?.maps?.drawing && (
//           <DrawingManager
//             onLoad={onDrawingManagerLoad}
//             options={{
//               drawingControl: true,
//               drawingControlOptions: {
//                 position: window.google.maps.ControlPosition.TOP_CENTER,
//                 drawingModes: [window.google.maps.drawing.OverlayType.POLYGON],
//               },
//               polygonOptions: options,
//             }}
//             onPolygonComplete={onPolygonComplete}
//           />
//         )}
//         {paths?.length > 0 && (
//           <Polygon
//             paths={paths}
//             options={options}
//             onMouseUp={handleSetPath}
//             onDragEnd={handleSetPath}
//             onRightClick={clearPolygon}
//             ref={polygonRef}
//           />
//         )}
//       </GoogleMap>

//       {editable && (
//         <>
//           {/* Drawing Control Button */}
//           <div style={{
//             position: "absolute",
//             top: "10px",
//             right: "10px",
//             zIndex: 1000,
//             display: "flex",
//             flexDirection: "column",
//             gap: "10px"
//           }}>
//             {!isDrawing ? (
//               <Button
//                 variant="primary"
//                 onClick={startDrawing}
//                 size="lg"
//                 disabled={!drawingManagerReady}
//                 style={{
//                   backgroundColor: drawingManagerReady ? "#fe4500" : "#ccc",
//                   borderColor: drawingManagerReady ? "#fe4500" : "#ccc",
//                   fontWeight: "bold",
//                   boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
//                   padding: "12px 20px",
//                   fontSize: "16px",
//                   cursor: drawingManagerReady ? "pointer" : "not-allowed"
//                 }}
//               >
//                 {drawingManagerReady ? "✏️ Start Drawing" : "⏳ Loading..."}
//               </Button>
//             ) : (
//               <Button
//                 variant="warning"
//                 onClick={stopDrawing}
//                 size="lg"
//                 style={{
//                   fontWeight: "bold",
//                   boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
//                   padding: "12px 20px",
//                   fontSize: "16px"
//                 }}
//               >
//                 ⏸️ Stop Drawing
//               </Button>
//             )}

//             {paths?.length > 0 && (
//               <Button
//                 variant="danger"
//                 onClick={clearPolygon}
//                 size="sm"
//                 style={{
//                   boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
//                 }}
//               >
//                 🗑️ Clear Polygon
//               </Button>
//             )}
//           </div>

//           {/* Instructions Panel */}
//           <div style={{
//             position: "absolute",
//             top: "10px",
//             left: "10px",
//             backgroundColor: "white",
//             padding: "15px",
//             borderRadius: "8px",
//             boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
//             zIndex: 1000,
//             fontSize: "13px",
//             maxWidth: "300px",
//             border: "2px solid #fe4500"
//           }}>
//             <div style={{ color: "#fe4500", fontWeight: "bold", marginBottom: "8px", fontSize: "15px" }}>
//               📍 How to Draw Hub Area:
//             </div>
//             <div style={{ lineHeight: "1.8", marginBottom: "10px" }}>
//               1. Click <strong style={{ color: "#fe4500" }}>"Start Drawing"</strong> button<br />
//               2. Click on the map to place your first point<br />
//               3. Continue clicking to add more vertices<br />
//               4. <strong>Double-click</strong> to complete the polygon
//             </div>

//             {isDrawing && (
//               <Alert variant="info" style={{ marginTop: "10px", padding: "8px", fontSize: "12px" }}>
//                 <strong>Drawing Mode Active!</strong><br />
//                 Click on the map to add points
//               </Alert>
//             )}

//             {drawingError && (
//               <Alert variant="danger" style={{ marginTop: "10px", padding: "8px", fontSize: "11px" }}>
//                 {drawingError}
//               </Alert>
//             )}

//             {paths?.length > 0 && (
//               <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "2px solid #fe4500", fontSize: "12px", color: "#666", fontWeight: "bold" }}>
//                 ✓ Polygon created with {paths.length} points
//               </div>
//             )}
//           </div>
//         </>
//       )}
//     </div>
//   ) : (
//     <div style={{ height: containerStyle.height, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #eee", borderRadius: 6, flexDirection: "column" }}>
//       <Spinner animation="border" variant="primary" style={{ width: "3rem", height: "3rem" }} />
//       <span style={{ marginTop: "15px", fontSize: "16px" }}>Loading map...</span>
//     </div>
//   );
// };

// export default AreaSelector;

//working........................

// import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
// import { GoogleMap, useJsApiLoader, Polygon, Marker } from "@react-google-maps/api";
// import { Spinner, Button, Alert } from "react-bootstrap";

// const containerStyle = {
//   width: "100%",
//   height: "600px",
// };

// const defaultCenter = { lat: 12.9716, lng: 77.5946 };

// function toGeoJSONFromPath(pathArray) {
//   const coordinates = pathArray.map((p) => [p.lng, p.lat]);
//   if (coordinates.length && (coordinates[0][0] !== coordinates[coordinates.length - 1][0] || coordinates[0][1] !== coordinates[coordinates.length - 1][1])) {
//     coordinates.push(coordinates[0]);
//   }
//   return {
//     type: "Feature",
//     geometry: {
//       type: "Polygon",
//       coordinates: [coordinates],
//     },
//     properties: {},
//   };
// }

// const AreaSelector = ({
//   apiKey,
//   value,
//   onChange,
//   onGeoJSONChange,
//   editable = true,
// }) => {
//   const [center, setCenter] = useState(defaultCenter);
//   const [paths, setPaths] = useState([]);
//   const [isDrawing, setIsDrawing] = useState(false);
//   const [drawingError, setDrawingError] = useState("");
//   const mapRef = useRef(null);
//   const polygonRef = useRef(null);

//   useEffect(() => {
//     if (navigator?.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (pos) => setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
//         () => {},
//         { enableHighAccuracy: false, maximumAge: 60000, timeout: 5000 }
//       );
//     }
//   }, []);

//   useEffect(() => {
//     if (value && value.type === "Feature" && value.geometry?.type === "Polygon") {
//       const ring = value.geometry.coordinates?.[0] || [];
//       const newPaths = ring
//         .slice(0, ring.length > 0 ? ring.length - 1 : 0)
//         .map(([lng, lat]) => ({ lat, lng }));
//       setPaths(newPaths);
//     }
//   }, [value]);

//   const onMapLoad = useCallback((map) => {
//     mapRef.current = map;
//   }, []);

//   const startDrawing = useCallback(() => {
//     try {
//       setDrawingError("");
//       setPaths([]); // Clear any existing paths
//       setIsDrawing(true);
//       console.log("Drawing mode activated - click on map to add points");
//     } catch (error) {
//       console.error("Error activating drawing mode:", error);
//       setDrawingError(`Error: ${error.message || 'Unknown error'}`);
//     }
//   }, []);

//   const stopDrawing = useCallback(() => {
//     setIsDrawing(false);
//     setDrawingError("");
//   }, []);

//   const handleMapClick = useCallback((event) => {
//     if (!isDrawing || !editable) return;

//     try {
//       const newPath = { lat: event.latLng.lat(), lng: event.latLng.lng() };
//       const newPaths = [...paths, newPath];
//       setPaths(newPaths);
//       setDrawingError("");
//     } catch (error) {
//       console.error("Error adding point:", error);
//       setDrawingError(`Error adding point: ${error.message}`);
//     }
//   }, [isDrawing, paths, editable]);

//   const completePolygon = useCallback(() => {
//     if (paths.length < 3) {
//       setDrawingError("Polygon must have at least 3 points");
//       return;
//     }

//     try {
//       const feature = toGeoJSONFromPath(paths);
//       onGeoJSONChange?.(feature);
//       onChange?.(feature);
//       setIsDrawing(false);
//       setDrawingError("");
//       console.log("Polygon completed successfully with", paths.length, "points");
//     } catch (error) {
//       console.error("Error completing polygon:", error);
//       setDrawingError(`Error completing polygon: ${error.message}`);
//     }
//   }, [paths, onChange, onGeoJSONChange]);

//   const clearPolygon = useCallback(() => {
//     if (window.confirm("Do you want to clear this polygon?")) {
//       setPaths([]);
//       onGeoJSONChange?.(null);
//       onChange?.(null);
//       setIsDrawing(false);
//     }
//   }, [onChange, onGeoJSONChange]);

//   const handleSetPath = useCallback(() => {
//     if (!polygonRef.current) return;
//     const path = polygonRef.current.getPath().getArray();
//     const newPaths = path.map((p) => ({ lat: p.lat(), lng: p.lng() }));
//     setPaths(newPaths);
//     const feature = toGeoJSONFromPath(newPaths);
//     onGeoJSONChange?.(feature);
//     onChange?.(feature);
//   }, [onChange, onGeoJSONChange]);

//   const polygonOptions = useMemo(
//     () => ({
//       fillColor: "#fe4500",
//       fillOpacity: 0.35,
//       strokeColor: "#fe4500",
//       strokeOpacity: 0.9,
//       strokeWeight: 3,
//       editable: !isDrawing && paths.length > 0, // Only editable when not drawing and has paths
//       draggable: false,
//       clickable: true,
//     }),
//     [isDrawing, paths.length]
//   );

//   const effectiveKey = apiKey || import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.VITE_MAP_KEY || "";
//   const { isLoaded, loadError } = useJsApiLoader({
//     googleMapsApiKey: effectiveKey,
//     libraries: ["geometry"],
//   });

//   if (loadError) {
//     return (
//       <div style={{ height: containerStyle.height, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #eee", borderRadius: 6, flexDirection: "column", padding: "20px" }}>
//         <Alert variant="danger">
//           <strong>Map failed to load</strong>
//           <br />
//           <small>Error: {loadError.message}</small>
//         </Alert>
//       </div>
//     );
//   }

//   return isLoaded ? (
//     <div style={{ position: "relative", width: "100%" }}>
//       <GoogleMap
//         mapContainerStyle={containerStyle}
//         center={center}
//         zoom={13}
//         onLoad={onMapLoad}
//         onClick={handleMapClick}
//         options={{
//           disableDefaultUI: false,
//           zoomControl: true,
//           streetViewControl: false,
//           mapTypeControl: true,
//           fullscreenControl: true,
//           draggableCursor: isDrawing ? "crosshair" : "grab", // Change cursor based on mode
//           draggingCursor: isDrawing ? "crosshair" : "grabbing",
//         }}
//       >
//         {/* Render markers for each point when drawing */}
//         {isDrawing && paths.map((path, index) => (
//           <Marker
//             key={index}
//             position={path}
//             label={{
//               text: (index + 1).toString(),
//               color: "white",
//               fontWeight: "bold",
//             }}
//             icon={{
//               path: window.google.maps.SymbolPath.CIRCLE,
//               scale: 8,
//               fillColor: "#fe4500",
//               fillOpacity: 1,
//               strokeColor: "white",
//               strokeWeight: 2,
//             }}
//           />
//         ))}

//         {/* Render polygon when we have at least 2 points */}
//         {paths.length >= 2 && (
//           <Polygon
//             paths={paths}
//             options={polygonOptions}
//             onMouseUp={handleSetPath}
//             onDragEnd={handleSetPath}
//             ref={polygonRef}
//           />
//         )}
//       </GoogleMap>

//       {editable && (
//         <>
//           {/* Control Buttons */}
//           <div style={{
//             position: "absolute",
//             top: "10px",
//             right: "10px",
//             zIndex: 1000,
//             display: "flex",
//             flexDirection: "column",
//             gap: "10px"
//           }}>
//             {!isDrawing ? (
//               <Button
//                 variant="primary"
//                 onClick={startDrawing}
//                 size="lg"
//                 style={{
//                   backgroundColor: "#fe4500",
//                   borderColor: "#fe4500",
//                   fontWeight: "bold",
//                   boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
//                   padding: "12px 20px",
//                   fontSize: "16px",
//                 }}
//               >
//                 ✏️ Start Drawing
//               </Button>
//             ) : (
//               <>
//                 <Button
//                   variant="success"
//                   onClick={completePolygon}
//                   size="lg"
//                   disabled={paths.length < 3}
//                   style={{
//                     fontWeight: "bold",
//                     boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
//                     padding: "12px 20px",
//                     fontSize: "16px",
//                     opacity: paths.length < 3 ? 0.6 : 1
//                   }}
//                 >
//                   ✅ Complete Polygon
//                 </Button>
//                 <Button
//                   variant="warning"
//                   onClick={stopDrawing}
//                   size="sm"
//                   style={{
//                     boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
//                   }}
//                 >
//                   ❌ Cancel
//                 </Button>
//               </>
//             )}

//             {paths.length > 0 && !isDrawing && (
//               <Button
//                 variant="danger"
//                 onClick={clearPolygon}
//                 size="sm"
//                 style={{
//                   boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
//                 }}
//               >
//                 🗑️ Clear Polygon
//               </Button>
//             )}
//           </div>

//           {/* Instructions Panel */}
//           <div style={{
//             position: "absolute",
//             top: "10px",
//             left: "10px",
//             backgroundColor: "white",
//             padding: "15px",
//             borderRadius: "8px",
//             boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
//             zIndex: 1000,
//             fontSize: "13px",
//             maxWidth: "300px",
//             border: "2px solid #fe4500"
//           }}>
//             <div style={{ color: "#fe4500", fontWeight: "bold", marginBottom: "8px", fontSize: "15px" }}>
//               📍 How to Draw Hub Area:
//             </div>

//             {!isDrawing ? (
//               <div style={{ lineHeight: "1.8", marginBottom: "10px" }}>
//                 1. Click <strong style={{ color: "#fe4500" }}>"Start Drawing"</strong><br />
//                 2. Click on the map to place points<br />
//                 3. Add at least 3 points<br />
//                 4. Click <strong>"Complete Polygon"</strong> when done
//               </div>
//             ) : (
//               <div style={{ lineHeight: "1.8", marginBottom: "10px" }}>
//                 <strong>Drawing in progress:</strong><br />
//                 • Click on map to add point {paths.length + 1}<br />
//                 • Need {Math.max(3 - paths.length, 0)} more points to complete<br />
//                 • Click <strong>"Complete Polygon"</strong> when done
//               </div>
//             )}

//             {isDrawing && (
//               <Alert variant="info" style={{ marginTop: "10px", padding: "8px", fontSize: "12px" }}>
//                 <strong>Drawing Mode Active!</strong><br />
//                 Cursor should be crosshair ✛<br />
//                 Click anywhere on the map to add points
//               </Alert>
//             )}

//             {drawingError && (
//               <Alert variant="danger" style={{ marginTop: "10px", padding: "8px", fontSize: "11px" }}>
//                 {drawingError}
//               </Alert>
//             )}

//             {paths.length > 0 && !isDrawing && (
//               <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "2px solid #fe4500", fontSize: "12px", color: "#666", fontWeight: "bold" }}>
//                 ✓ Polygon created with {paths.length} points
//                 <br />
//                 <small>Drag vertices to edit the shape</small>
//               </div>
//             )}

//             {isDrawing && paths.length > 0 && (
//               <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px dashed #fe4500", fontSize: "11px", color: "#fe4500" }}>
//                 Points added: {paths.length}
//                 {paths.length < 3 && (
//                   <div>Minimum 3 points required</div>
//                 )}
//               </div>
//             )}
//           </div>
//         </>
//       )}
//     </div>
//   ) : (
//     <div style={{ height: containerStyle.height, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #eee", borderRadius: 6, flexDirection: "column" }}>
//       <Spinner animation="border" variant="primary" style={{ width: "3rem", height: "3rem" }} />
//       <span style={{ marginTop: "15px", fontSize: "16px" }}>Loading map...</span>
//     </div>
//   );
// };

// export default AreaSelector;

//drag...........

// import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
// import { GoogleMap, useJsApiLoader, Polygon, Marker } from "@react-google-maps/api";
// import { Spinner, Button, Alert } from "react-bootstrap";

// const containerStyle = {
//   width: "100%",
//   height: "600px",
// };

// const defaultCenter = { lat: 12.9716, lng: 77.5946 };

// function toGeoJSONFromPath(pathArray) {
//   const coordinates = pathArray.map((p) => [p.lng, p.lat]);
//   if (coordinates.length && (coordinates[0][0] !== coordinates[coordinates.length - 1][0] || coordinates[0][1] !== coordinates[coordinates.length - 1][1])) {
//     coordinates.push(coordinates[0]);
//   }
//   return {
//     type: "Feature",
//     geometry: {
//       type: "Polygon",
//       coordinates: [coordinates],
//     },
//     properties: {},
//   };
// }

// const AreaSelector = ({
//   apiKey,
//   value,
//   onChange,
//   onGeoJSONChange,
//   editable = true,
// }) => {
//   const [center, setCenter] = useState(defaultCenter);
//   const [paths, setPaths] = useState([]);
//   const [isDrawing, setIsDrawing] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);
//   const [drawingError, setDrawingError] = useState("");
//   const [draggedPointIndex, setDraggedPointIndex] = useState(null);
//   const mapRef = useRef(null);
//   const polygonRef = useRef(null);
//   const markersRef = useRef([]);

//   useEffect(() => {
//     if (navigator?.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (pos) => setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
//         () => {},
//         { enableHighAccuracy: false, maximumAge: 60000, timeout: 5000 }
//       );
//     }
//   }, []);

//   useEffect(() => {
//     if (value && value.type === "Feature" && value.geometry?.type === "Polygon") {
//       const ring = value.geometry.coordinates?.[0] || [];
//       const newPaths = ring
//         .slice(0, ring.length > 0 ? ring.length - 1 : 0)
//         .map(([lng, lat]) => ({ lat, lng }));
//       setPaths(newPaths);
//       setIsEditing(true);
//     }
//   }, [value]);

//   const onMapLoad = useCallback((map) => {
//     mapRef.current = map;
//   }, []);

//   const startDrawing = useCallback(() => {
//     try {
//       setDrawingError("");
//       setPaths([]);
//       setIsDrawing(true);
//       setIsEditing(false);
//       console.log("Drawing mode activated - click on map to add points");
//     } catch (error) {
//       console.error("Error activating drawing mode:", error);
//       setDrawingError(`Error: ${error.message || 'Unknown error'}`);
//     }
//   }, []);

//   const startEditing = useCallback(() => {
//     if (paths.length >= 3) {
//       setIsEditing(true);
//       setIsDrawing(false);
//     }
//   }, [paths.length]);

//   const stopDrawing = useCallback(() => {
//     setIsDrawing(false);
//     setIsEditing(false);
//     setDrawingError("");
//   }, []);

//   const handleMapClick = useCallback((event) => {
//     if (!isDrawing || !editable) return;

//     try {
//       const newPath = { lat: event.latLng.lat(), lng: event.latLng.lng() };
//       const newPaths = [...paths, newPath];
//       setPaths(newPaths);
//       setDrawingError("");
//     } catch (error) {
//       console.error("Error adding point:", error);
//       setDrawingError(`Error adding point: ${error.message}`);
//     }
//   }, [isDrawing, paths, editable]);

//   const handleMarkerDrag = useCallback((index, event) => {
//     try {
//       const newPaths = [...paths];
//       newPaths[index] = {
//         lat: event.latLng.lat(),
//         lng: event.latLng.lng()
//       };
//       setPaths(newPaths);
//       setDraggedPointIndex(index);
//     } catch (error) {
//       console.error("Error dragging point:", error);
//       setDrawingError(`Error dragging point: ${error.message}`);
//     }
//   }, [paths]);

//   const handleMarkerDragEnd = useCallback((index, event) => {
//     try {
//       const newPaths = [...paths];
//       newPaths[index] = {
//         lat: event.latLng.lat(),
//         lng: event.latLng.lng()
//       };
//       setPaths(newPaths);
//       setDraggedPointIndex(null);

//       // Update the polygon data
//       const feature = toGeoJSONFromPath(newPaths);
//       onGeoJSONChange?.(feature);
//       onChange?.(feature);
//     } catch (error) {
//       console.error("Error finishing drag:", error);
//       setDrawingError(`Error updating point: ${error.message}`);
//     }
//   }, [paths, onChange, onGeoJSONChange]);

//   const completePolygon = useCallback(() => {
//     if (paths.length < 3) {
//       setDrawingError("Polygon must have at least 3 points");
//       return;
//     }

//     try {
//       const feature = toGeoJSONFromPath(paths);
//       onGeoJSONChange?.(feature);
//       onChange?.(feature);
//       setIsDrawing(false);
//       setIsEditing(true);
//       setDrawingError("");
//       console.log("Polygon completed successfully with", paths.length, "points");
//     } catch (error) {
//       console.error("Error completing polygon:", error);
//       setDrawingError(`Error completing polygon: ${error.message}`);
//     }
//   }, [paths, onChange, onGeoJSONChange]);

//   const clearPolygon = useCallback(() => {
//     if (window.confirm("Do you want to clear this polygon?")) {
//       setPaths([]);
//       onGeoJSONChange?.(null);
//       onChange?.(null);
//       setIsDrawing(false);
//       setIsEditing(false);
//     }
//   }, [onChange, onGeoJSONChange]);

//   const addPoint = useCallback(() => {
//     setIsDrawing(true);
//     setIsEditing(false);
//   }, []);

//   const deletePoint = useCallback((index) => {
//     if (paths.length <= 3) {
//       setDrawingError("Polygon must have at least 3 points");
//       return;
//     }

//     const newPaths = paths.filter((_, i) => i !== index);
//     setPaths(newPaths);

//     if (newPaths.length >= 3) {
//       const feature = toGeoJSONFromPath(newPaths);
//       onGeoJSONChange?.(feature);
//       onChange?.(feature);
//     }
//   }, [paths, onChange, onGeoJSONChange]);

//   const polygonOptions = useMemo(
//     () => ({
//       fillColor: "#fe4500",
//       fillOpacity: 0.2,
//       strokeColor: "#fe4500",
//       strokeOpacity: 0.8,
//       strokeWeight: 2,
//       editable: false,
//       draggable: false,
//       clickable: true,
//     }),
//     []
//   );

//   const effectiveKey = apiKey || import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.VITE_MAP_KEY || "";
//   const { isLoaded, loadError } = useJsApiLoader({
//     googleMapsApiKey: effectiveKey,
//     libraries: ["geometry"],
//   });

//   if (loadError) {
//     return (
//       <div style={{ height: containerStyle.height, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #eee", borderRadius: 6, flexDirection: "column", padding: "20px" }}>
//         <Alert variant="danger">
//           <strong>Map failed to load</strong>
//           <br />
//           <small>Error: {loadError.message}</small>
//         </Alert>
//       </div>
//     );
//   }

//   return isLoaded ? (
//     <div style={{ position: "relative", width: "100%" }}>
//       <GoogleMap
//         mapContainerStyle={containerStyle}
//         center={center}
//         zoom={13}
//         onLoad={onMapLoad}
//         onClick={handleMapClick}
//         options={{
//           disableDefaultUI: false,
//           zoomControl: true,
//           streetViewControl: false,
//           mapTypeControl: true,
//           fullscreenControl: true,
//           draggableCursor: isDrawing ? "crosshair" : "grab",
//           draggingCursor: isDrawing ? "crosshair" : "grabbing",
//         }}
//       >
//         {/* Draggable markers for each point when editing */}
//         {(isEditing || isDrawing) && paths.map((path, index) => (
//           <Marker
//             key={index}
//             position={path}
//             label={{
//               text: (index + 1).toString(),
//               color: "white",
//               fontWeight: "bold",
//               fontSize: "12px",
//             }}
//             icon={{
//               path: window.google.maps.SymbolPath.CIRCLE,
//               scale: 10,
//               fillColor: draggedPointIndex === index ? "#ff0000" : "#fe4500",
//               fillOpacity: 1,
//               strokeColor: "white",
//               strokeWeight: 3,
//             }}
//             draggable={isEditing || isDrawing}
//             onDrag={(event) => handleMarkerDrag(index, event)}
//             onDragEnd={(event) => handleMarkerDragEnd(index, event)}
//             cursor="move"
//             ref={(marker) => {
//               if (marker) {
//                 markersRef.current[index] = marker;
//               }
//             }}
//           />
//         ))}

//         {/* Render polygon when we have at least 2 points */}
//         {paths.length >= 2 && (
//           <Polygon
//             paths={paths}
//             options={polygonOptions}
//             ref={polygonRef}
//           />
//         )}
//       </GoogleMap>

//       {editable && (
//         <>
//           {/* Control Buttons */}
//           <div style={{
//             position: "absolute",
//             top: "10px",
//             right: "10px",
//             zIndex: 1000,
//             display: "flex",
//             flexDirection: "column",
//             gap: "10px"
//           }}>
//             {!isDrawing && !isEditing && paths.length === 0 && (
//               <Button
//                 variant="primary"
//                 onClick={startDrawing}
//                 size="lg"
//                 style={{
//                   backgroundColor: "#fe4500",
//                   borderColor: "#fe4500",
//                   fontWeight: "bold",
//                   boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
//                   padding: "12px 20px",
//                   fontSize: "16px",
//                 }}
//               >
//                 ✏️ Start Drawing
//               </Button>
//             )}

//             {isDrawing && (
//               <>
//                 <Button
//                   variant="success"
//                   onClick={completePolygon}
//                   size="lg"
//                   disabled={paths.length < 3}
//                   style={{
//                     fontWeight: "bold",
//                     boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
//                     padding: "12px 20px",
//                     fontSize: "16px",
//                     opacity: paths.length < 3 ? 0.6 : 1
//                   }}
//                 >
//                   ✅ Complete Polygon
//                 </Button>
//                 <Button
//                   variant="warning"
//                   onClick={stopDrawing}
//                   size="sm"
//                   style={{
//                     boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
//                   }}
//                 >
//                   ❌ Cancel
//                 </Button>
//               </>
//             )}

//             {isEditing && paths.length >= 3 && (
//               <>
//                 <Button
//                   variant="info"
//                   onClick={addPoint}
//                   size="sm"
//                   style={{
//                     boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
//                   }}
//                 >
//                   ➕ Add More Points
//                 </Button>
//                 <Button
//                   variant="secondary"
//                   onClick={stopDrawing}
//                   size="sm"
//                   style={{
//                     boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
//                   }}
//                 >
//                   🔚 Finish Editing
//                 </Button>
//               </>
//             )}

//             {paths.length > 0 && (
//               <Button
//                 variant="danger"
//                 onClick={clearPolygon}
//                 size="sm"
//                 style={{
//                   boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
//                 }}
//               >
//                 🗑️ Clear Polygon
//               </Button>
//             )}
//           </div>

//           {/* Instructions Panel */}
//           <div style={{
//             position: "absolute",
//             top: "10px",
//             left: "10px",
//             backgroundColor: "white",
//             padding: "15px",
//             borderRadius: "8px",
//             boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
//             zIndex: 1000,
//             fontSize: "13px",
//             maxWidth: "320px",
//             border: "2px solid #fe4500"
//           }}>
//             <div style={{ color: "#fe4500", fontWeight: "bold", marginBottom: "8px", fontSize: "15px" }}>
//               📍 Polygon Drawing Tool
//             </div>

//             {isDrawing && (
//               <div style={{ lineHeight: "1.8", marginBottom: "10px" }}>
//                 <strong>Drawing Mode:</strong><br />
//                 • Click on map to add points<br />
//                 • Need {Math.max(3 - paths.length, 0)} more points<br />
//                 • Click <strong>"Complete Polygon"</strong> when done
//               </div>
//             )}

//             {isEditing && (
//               <div style={{ lineHeight: "1.8", marginBottom: "10px" }}>
//                 <strong>Editing Mode:</strong><br />
//                 • <strong>Drag the numbered circles</strong> to adjust points<br />
//                 • Click <strong>"Add More Points"</strong> to continue drawing<br />
//                 • Click <strong>"Finish Editing"</strong> when done
//               </div>
//             )}

//             {!isDrawing && !isEditing && paths.length === 0 && (
//               <div style={{ lineHeight: "1.8", marginBottom: "10px" }}>
//                 Click <strong>"Start Drawing"</strong> to begin creating your hub area
//               </div>
//             )}

//             {isDrawing && (
//               <Alert variant="info" style={{ marginTop: "10px", padding: "8px", fontSize: "12px" }}>
//                 <strong>Click anywhere on the map to add points</strong>
//               </Alert>
//             )}

//             {isEditing && (
//               <Alert variant="success" style={{ marginTop: "10px", padding: "8px", fontSize: "12px" }}>
//                 <strong>Drag the orange circles to adjust the shape</strong>
//                 <br />
//                 <small>Points turn red when being dragged</small>
//               </Alert>
//             )}

//             {drawingError && (
//               <Alert variant="danger" style={{ marginTop: "10px", padding: "8px", fontSize: "11px" }}>
//                 {drawingError}
//               </Alert>
//             )}

//             {paths.length > 0 && (
//               <div style={{
//                 marginTop: "10px",
//                 paddingTop: "10px",
//                 borderTop: "2px solid #fe4500",
//                 fontSize: "12px",
//                 color: "#666",
//                 fontWeight: "bold"
//               }}>
//                 ✓ {paths.length} points
//                 {isEditing && (
//                   <div style={{ fontSize: "11px", color: "#fe4500", marginTop: "5px" }}>
//                     Drag points to fine-tune the shape
//                   </div>
//                 )}
//               </div>
//             )}

//             {isEditing && paths.length > 3 && (
//               <div style={{
//                 marginTop: "8px",
//                 padding: "5px",
//                 backgroundColor: "#fff3cd",
//                 borderRadius: "4px",
//                 fontSize: "11px",
//                 border: "1px solid #ffeaa7"
//               }}>
//                 💡 <strong>Tip:</strong> You can delete points by right-clicking (coming soon)
//               </div>
//             )}
//           </div>
//         </>
//       )}
//     </div>
//   ) : (
//     <div style={{ height: containerStyle.height, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #eee", borderRadius: 6, flexDirection: "column" }}>
//       <Spinner animation="border" variant="primary" style={{ width: "3rem", height: "3rem" }} />
//       <span style={{ marginTop: "15px", fontSize: "16px" }}>Loading map...</span>
//     </div>
//   );
// };

// export default AreaSelector;

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Polygon,
  Marker,
} from "@react-google-maps/api";
import { Spinner, Button, Alert, Form } from "react-bootstrap";

const containerStyle = {
  width: "100%",
  height: "600px",
};

const defaultCenter = { lat: 12.9716, lng: 77.5946 };

function toGeoJSONFromPath(pathArray) {
  const coordinates = pathArray.map((p) => [p.lng, p.lat]);
  if (
    coordinates.length &&
    (coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
      coordinates[0][1] !== coordinates[coordinates.length - 1][1])
  ) {
    coordinates.push(coordinates[0]);
  }
  return {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [coordinates],
    },
    properties: {},
  };
}

const AreaSelector = ({
  apiKey,
  value,
  onChange,
  onGeoJSONChange,
  editable = true,
}) => {
  const [center, setCenter] = useState(defaultCenter);
  const [paths, setPaths] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [drawingError, setDrawingError] = useState("");
  const [draggedPointIndex, setDraggedPointIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const mapRef = useRef(null);
  const polygonRef = useRef(null);
  const markersRef = useRef([]);
  const autocompleteService = useRef(null);
  const placesService = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (navigator?.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
        { enableHighAccuracy: false, maximumAge: 60000, timeout: 5000 }
      );
    }
  }, []);

  useEffect(() => {
    if (
      value &&
      value.type === "Feature" &&
      value.geometry?.type === "Polygon"
    ) {
      const ring = value.geometry.coordinates?.[0] || [];
      const newPaths = ring
        .slice(0, ring.length > 0 ? ring.length - 1 : 0)
        .map(([lng, lat]) => ({ lat, lng }));
      setPaths(newPaths);
      setIsEditing(true);
    }
  }, [value]);

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;

    // Initialize Google Places services
    if (window.google) {
      autocompleteService.current =
        new window.google.maps.places.AutocompleteService();
      placesService.current = new window.google.maps.places.PlacesService(map);
    }
  }, []);

  // Search for places
  const handleSearchChange = useCallback((e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (!query.trim()) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (!autocompleteService.current) return;

    setIsSearching(true);

    autocompleteService.current.getPlacePredictions(
      {
        input: query,
        types: ["establishment", "geocode"],
        componentRestrictions: { country: "in" }, // Restrict to India
      },
      (predictions, status) => {
        setIsSearching(false);
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          predictions
        ) {
          setSearchSuggestions(predictions);
          setShowSuggestions(true);
        } else {
          setSearchSuggestions([]);
          setShowSuggestions(false);
        }
      }
    );
  }, []);

  // Handle place selection
  const handlePlaceSelect = useCallback((placeId) => {
    if (!placesService.current) return;

    setIsSearching(true);
    setShowSuggestions(false);

    placesService.current.getDetails(
      {
        placeId: placeId,
        fields: ["geometry", "name", "formatted_address"],
      },
      (place, status) => {
        setIsSearching(false);
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          place.geometry
        ) {
          const newCenter = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };

          setCenter(newCenter);

          // Pan map to the selected location
          if (mapRef.current) {
            mapRef.current.panTo(newCenter);
            mapRef.current.setZoom(16);
          }

          setSearchQuery(place.name || place.formatted_address);
        } else {
          setDrawingError("Failed to get place details. Please try again.");
        }
      }
    );
  }, []);

  const startDrawing = useCallback(() => {
    try {
      setDrawingError("");
      setPaths([]);
      setIsDrawing(true);
      setIsEditing(false);
      console.log("Drawing mode activated - click on map to add points");
    } catch (error) {
      console.error("Error activating drawing mode:", error);
      setDrawingError(`Error: ${error.message || "Unknown error"}`);
    }
  }, []);

  const startEditing = useCallback(() => {
    if (paths.length >= 3) {
      setIsEditing(true);
      setIsDrawing(false);
    }
  }, [paths.length]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
    setIsEditing(false);
    setDrawingError("");
  }, []);

  const handleMapClick = useCallback(
    (event) => {
      if (!isDrawing || !editable) return;

      try {
        const newPath = { lat: event.latLng.lat(), lng: event.latLng.lng() };
        const newPaths = [...paths, newPath];
        setPaths(newPaths);
        setDrawingError("");
      } catch (error) {
        console.error("Error adding point:", error);
        setDrawingError(`Error adding point: ${error.message}`);
      }
    },
    [isDrawing, paths, editable]
  );

  const handleMarkerDrag = useCallback(
    (index, event) => {
      try {
        const newPaths = [...paths];
        newPaths[index] = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng(),
        };
        setPaths(newPaths);
        setDraggedPointIndex(index);
      } catch (error) {
        console.error("Error dragging point:", error);
        setDrawingError(`Error dragging point: ${error.message}`);
      }
    },
    [paths]
  );

  const handleMarkerDragEnd = useCallback(
    (index, event) => {
      try {
        const newPaths = [...paths];
        newPaths[index] = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng(),
        };
        setPaths(newPaths);
        setDraggedPointIndex(null);

        // Update the polygon data
        const feature = toGeoJSONFromPath(newPaths);
        onGeoJSONChange?.(feature);
        onChange?.(feature);
      } catch (error) {
        console.error("Error finishing drag:", error);
        setDrawingError(`Error updating point: ${error.message}`);
      }
    },
    [paths, onChange, onGeoJSONChange]
  );

  const completePolygon = useCallback(() => {
    if (paths.length < 3) {
      setDrawingError("Polygon must have at least 3 points");
      return;
    }

    try {
      const feature = toGeoJSONFromPath(paths);
      onGeoJSONChange?.(feature);
      onChange?.(feature);
      setIsDrawing(false);
      setIsEditing(true);
      setDrawingError("");
      console.log(
        "Polygon completed successfully with",
        paths.length,
        "points"
      );
    } catch (error) {
      console.error("Error completing polygon:", error);
      setDrawingError(`Error completing polygon: ${error.message}`);
    }
  }, [paths, onChange, onGeoJSONChange]);

  const clearPolygon = useCallback(() => {
    if (window.confirm("Do you want to clear this polygon?")) {
      setPaths([]);
      onGeoJSONChange?.(null);
      onChange?.(null);
      setIsDrawing(false);
      setIsEditing(false);
    }
  }, [onChange, onGeoJSONChange]);

  const addPoint = useCallback(() => {
    setIsDrawing(true);
    setIsEditing(false);
  }, []);

  const deletePoint = useCallback(
    (index) => {
      if (paths.length <= 3) {
        setDrawingError("Polygon must have at least 3 points");
        return;
      }

      const newPaths = paths.filter((_, i) => i !== index);
      setPaths(newPaths);

      if (newPaths.length >= 3) {
        const feature = toGeoJSONFromPath(newPaths);
        onGeoJSONChange?.(feature);
        onChange?.(feature);
      }
    },
    [paths, onChange, onGeoJSONChange]
  );

  const polygonOptions = useMemo(
    () => ({
      fillColor: "#fe4500",
      fillOpacity: 0.2,
      strokeColor: "#fe4500",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      editable: false,
      draggable: false,
      clickable: true,
    }),
    []
  );

  const effectiveKey =
    apiKey ||
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
    import.meta.env.VITE_MAP_KEY ||
    "";
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: effectiveKey,
    libraries: ["places", "geometry"],
  });

  if (loadError) {
    return (
      <div
        style={{
          height: containerStyle.height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid #eee",
          borderRadius: 6,
          flexDirection: "column",
          padding: "20px",
        }}
      >
        <Alert variant="danger">
          <strong>Map failed to load</strong>
          <br />
          <small>Error: {loadError.message}</small>
        </Alert>
      </div>
    );
  }

  return isLoaded ? (
    <div style={{ position: "relative", width: "100%" }}>
      {/* Search Bar */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
          width: "400px",
          maxWidth: "80%",
        }}
      >
        <div style={{ position: "relative" }}>
          <Form.Control
            ref={searchInputRef}
            type="text"
            placeholder="🔍 Search for locations..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => searchQuery && setShowSuggestions(true)}
            style={{
              borderRadius: "25px",
              padding: "12px 20px",
              fontSize: "14px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              border: "2px solid #fe4500",
            }}
          />
          {isSearching && (
            <div
              style={{
                position: "absolute",
                right: "15px",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            >
              <Spinner animation="border" size="sm" variant="primary" />
            </div>
          )}

          {/* Search Suggestions */}
          {showSuggestions && searchSuggestions.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                backgroundColor: "white",
                border: "1px solid #ddd",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                maxHeight: "200px",
                overflowY: "auto",
                zIndex: 1001,
              }}
            >
              {searchSuggestions.map((prediction) => (
                <div
                  key={prediction.place_id}
                  style={{
                    padding: "12px 15px",
                    cursor: "pointer",
                    borderBottom: "1px solid #f0f0f0",
                    fontSize: "14px",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#f8f9fa";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "white";
                  }}
                  onClick={() => handlePlaceSelect(prediction.place_id)}
                >
                  <div style={{ fontWeight: "bold", color: "#333" }}>
                    {prediction.structured_formatting.main_text}
                  </div>
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    {prediction.structured_formatting.secondary_text}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={13}
        onLoad={onMapLoad}
        onClick={handleMapClick}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: true,
          fullscreenControl: true,
          draggableCursor: isDrawing ? "crosshair" : "grab",
          draggingCursor: isDrawing ? "crosshair" : "grabbing",
        }}
      >
        {/* Draggable markers for each point when editing */}
        {(isEditing || isDrawing) &&
          paths.map((path, index) => (
            <Marker
              key={index}
              position={path}
              label={{
                text: (index + 1).toString(),
                color: "white",
                fontWeight: "bold",
                fontSize: "12px",
              }}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: draggedPointIndex === index ? "#ff0000" : "#fe4500",
                fillOpacity: 1,
                strokeColor: "white",
                strokeWeight: 3,
              }}
              draggable={isEditing || isDrawing}
              onDrag={(event) => handleMarkerDrag(index, event)}
              onDragEnd={(event) => handleMarkerDragEnd(index, event)}
              cursor="move"
              ref={(marker) => {
                if (marker) {
                  markersRef.current[index] = marker;
                }
              }}
            />
          ))}

        {/* Render polygon when we have at least 2 points */}
        {paths.length >= 2 && (
          <Polygon paths={paths} options={polygonOptions} ref={polygonRef} />
        )}
      </GoogleMap>

      {editable && (
        <>
          {/* Control Buttons */}
          <div
            style={{
              position: "absolute",
              top: "70px",
              right: "10px",
              zIndex: 1000,
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {!isDrawing && !isEditing && paths.length === 0 && (
              <Button
                variant="primary"
                onClick={startDrawing}
                size="lg"
                style={{
                  backgroundColor: "#fe4500",
                  borderColor: "#fe4500",
                  fontWeight: "bold",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                  padding: "12px 20px",
                  fontSize: "16px",
                }}
              >
                ✏️ Start Drawing
              </Button>
            )}

            {isDrawing && (
              <>
                <Button
                  variant="success"
                  onClick={completePolygon}
                  size="lg"
                  disabled={paths.length < 3}
                  style={{
                    fontWeight: "bold",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                    padding: "12px 20px",
                    fontSize: "16px",
                    opacity: paths.length < 3 ? 0.6 : 1,
                  }}
                >
                  ✅ Complete Polygon
                </Button>
                <Button
                  variant="warning"
                  onClick={stopDrawing}
                  size="sm"
                  style={{
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  }}
                >
                  ❌ Cancel
                </Button>
              </>
            )}

            {isEditing && paths.length >= 3 && (
              <>
                <Button
                  variant="info"
                  onClick={addPoint}
                  size="sm"
                  style={{
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  }}
                >
                  ➕ Add More Points
                </Button>
                <Button
                  variant="secondary"
                  onClick={stopDrawing}
                  size="sm"
                  style={{
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  }}
                >
                  🔚 Finish Editing
                </Button>
              </>
            )}

            {paths.length > 0 && (
              <Button
                variant="danger"
                onClick={clearPolygon}
                size="sm"
                style={{
                  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                }}
              >
                🗑️ Clear Polygon
              </Button>
            )}
          </div>

          {/* Instructions Panel */}
          <div
            style={{
              position: "absolute",
              top: "70px",
              left: "10px",
              backgroundColor: "white",
              padding: "15px",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              zIndex: 1000,
              fontSize: "13px",
              maxWidth: "320px",
              border: "2px solid #fe4500",
            }}
          >
            <div
              style={{
                color: "#fe4500",
                fontWeight: "bold",
                marginBottom: "8px",
                fontSize: "15px",
              }}
            >
              📍 Polygon Drawing Tool
            </div>

            {isDrawing && (
              <div style={{ lineHeight: "1.8", marginBottom: "10px" }}>
                <strong>Drawing Mode:</strong>
                <br />
                • Click on map to add points
                <br />• Need {Math.max(3 - paths.length, 0)} more points
                <br />• Click <strong>"Complete Polygon"</strong> when done
              </div>
            )}

            {isEditing && (
              <div style={{ lineHeight: "1.8", marginBottom: "10px" }}>
                <strong>Editing Mode:</strong>
                <br />• <strong>Drag the numbered circles</strong> to adjust
                points
                <br />• Click <strong>"Add More Points"</strong> to continue
                drawing
                <br />• Click <strong>"Finish Editing"</strong> when done
              </div>
            )}

            {!isDrawing && !isEditing && paths.length === 0 && (
              <div style={{ lineHeight: "1.8", marginBottom: "10px" }}>
                • Search for a location above
                <br />• Click <strong>"Start Drawing"</strong> to begin
              </div>
            )}

            {isDrawing && (
              <Alert
                variant="info"
                style={{ marginTop: "10px", padding: "8px", fontSize: "12px" }}
              >
                <strong>Click anywhere on the map to add points</strong>
              </Alert>
            )}

            {isEditing && (
              <Alert
                variant="success"
                style={{ marginTop: "10px", padding: "8px", fontSize: "12px" }}
              >
                <strong>Drag the orange circles to adjust the shape</strong>
                <br />
                <small>Points turn red when being dragged</small>
              </Alert>
            )}

            {drawingError && (
              <Alert
                variant="danger"
                style={{ marginTop: "10px", padding: "8px", fontSize: "11px" }}
              >
                {drawingError}
              </Alert>
            )}

            {paths.length > 0 && (
              <div
                style={{
                  marginTop: "10px",
                  paddingTop: "10px",
                  borderTop: "2px solid #fe4500",
                  fontSize: "12px",
                  color: "#666",
                  fontWeight: "bold",
                }}
              >
                ✓ {paths.length} points
                {isEditing && (
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#fe4500",
                      marginTop: "5px",
                    }}
                  >
                    Drag points to fine-tune the shape
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  ) : (
    <div
      style={{
        height: containerStyle.height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid #eee",
        borderRadius: 6,
        flexDirection: "column",
      }}
    >
      <Spinner
        animation="border"
        variant="primary"
        style={{ width: "3rem", height: "3rem" }}
      />
      <span style={{ marginTop: "15px", fontSize: "16px" }}>
        Loading map...
      </span>
    </div>
  );
};

export default AreaSelector;
