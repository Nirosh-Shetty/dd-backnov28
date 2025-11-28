// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const LocationRequest = () => {
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [stats, setStats] = useState(null);
//   const [filters, setFilters] = useState({
//     status: '',
//     page: 1,
//     limit: 10
//   });
//   const [pagination, setPagination] = useState({});
//   const [selectedRequest, setSelectedRequest] = useState(null);
//   const [updateStatus, setUpdateStatus] = useState('');
//   const [updateNotes, setUpdateNotes] = useState('');

//   // Fetch service requests
//   const fetchRequests = async () => {
//     try {
//       setLoading(true);

//       const params = new URLSearchParams();
//       if (filters.status) params.append('status', filters.status);
//       params.append('page', filters.page);
//       params.append('limit', filters.limit);

//       const response = await axios.get(`http://localhost:7013/api/service-requests?${params}`);

//       console.log(response,"/////b//////////")

//       if (response.data.success) {
//         setRequests(response.data.data.requests);
//         setPagination(response.data.data.pagination);
//       } else {
//         throw new Error(response.data.message);
//       }
//     } catch (error) {
//       console.error('Error fetching requests:', error);
//       setError(error.response?.data?.message || error.message || 'Failed to fetch requests');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch statistics
//   const fetchStats = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get('http://localhost:7013/api/service-requests/stats', {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });

//       if (response.data.success) {
//         setStats(response.data.data);
//       }
//     } catch (error) {
//       console.error('Error fetching stats:', error);
//     }
//   };

//   // Update request status
//   const handleUpdateStatus = async (requestId) => {
//     try {
//       const token = localStorage.getItem('token');

//       const response = await axios.put(
//         `http://localhost:7013/api/service-requests/${requestId}`,
//         {
//           status: updateStatus,
//           notes: updateNotes
//         },
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         }
//       );

//       if (response.data.success) {
//         alert('Status updated successfully!');
//         setSelectedRequest(null);
//         setUpdateStatus('');
//         setUpdateNotes('');
//         fetchRequests();
//         fetchStats();
//       } else {
//         throw new Error(response.data.message);
//       }
//     } catch (error) {
//       console.error('Error updating status:', error);
//       setError(error.response?.data?.message || error.message || 'Failed to update status');
//     }
//   };

//   // Handle filter changes
//   const handleFilterChange = (key, value) => {
//     setFilters(prev => ({
//       ...prev,
//       [key]: value,
//       page: 1
//     }));
//   };

//   // Handle pagination
//   const handlePageChange = (newPage) => {
//     setFilters(prev => ({
//       ...prev,
//       page: newPage
//     }));
//   };

//   // Format date
//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   // Status badge style
//   const getStatusBadge = (status) => {
//     switch (status) {
//       case 'pending':
//         return 'bg-warning text-dark';
//       case 'reviewed':
//         return 'bg-info text-white';
//       case 'approved':
//         return 'bg-success text-white';
//       case 'rejected':
//         return 'bg-danger text-white';
//       default:
//         return 'bg-secondary text-white';
//     }
//   };

//   // Load data on component mount and when filters change
//   useEffect(() => {
//     fetchRequests();
//     fetchStats();
//   }, [filters]);

//   if (loading && requests.length === 0) {
//     return (
//       <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
//         <div className="text-center">
//           <div className="spinner-border text-primary" role="status">
//             <span className="visually-hidden">Loading...</span>
//           </div>
//           <p className="mt-3 text-muted">Loading service requests...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-vh-100 bg-light p-4">
//       <div className="container-fluid">
//         {/* Header */}
//         <div className="row mb-4">
//           <div className="col-12">
//             <h1 className="h2 fw-bold text-dark mb-2">Location Service Requests</h1>
//             <p className="text-muted">Manage customer requests for service expansion</p>
//           </div>
//         </div>

//         {/* Statistics */}
//         {stats && (
//           <div className="row mb-4">
//             <div className="col-md-2 col-6 mb-3">
//               <div className="card border-0 shadow-sm h-100">
//                 <div className="card-body text-center">
//                   <h3 className="card-title fw-bold text-dark">{stats.statusStats.total}</h3>
//                   <p className="card-text text-muted mb-0">Total Requests</p>
//                 </div>
//               </div>
//             </div>
//             <div className="col-md-2 col-6 mb-3">
//               <div className="card border-0 shadow-sm h-100 bg-warning bg-opacity-10">
//                 <div className="card-body text-center">
//                   <h3 className="card-title fw-bold text-warning">{stats.statusStats.pending}</h3>
//                   <p className="card-text text-warning mb-0">Pending</p>
//                 </div>
//               </div>
//             </div>
//             <div className="col-md-2 col-6 mb-3">
//               <div className="card border-0 shadow-sm h-100 bg-info bg-opacity-10">
//                 <div className="card-body text-center">
//                   <h3 className="card-title fw-bold text-info">{stats.statusStats.reviewed}</h3>
//                   <p className="card-text text-info mb-0">Reviewed</p>
//                 </div>
//               </div>
//             </div>
//             <div className="col-md-2 col-6 mb-3">
//               <div className="card border-0 shadow-sm h-100 bg-success bg-opacity-10">
//                 <div className="card-body text-center">
//                   <h3 className="card-title fw-bold text-success">{stats.statusStats.approved}</h3>
//                   <p className="card-text text-success mb-0">Approved</p>
//                 </div>
//               </div>
//             </div>
//             <div className="col-md-2 col-6 mb-3">
//               <div className="card border-0 shadow-sm h-100 bg-danger bg-opacity-10">
//                 <div className="card-body text-center">
//                   <h3 className="card-title fw-bold text-danger">{stats.statusStats.rejected}</h3>
//                   <p className="card-text text-danger mb-0">Rejected</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Error Message */}
//         {error && (
//           <div className="row mb-4">
//             <div className="col-12">
//               <div className="alert alert-danger alert-dismissible fade show" role="alert">
//                 <div className="d-flex align-items-center">
//                   <i className="bi bi-exclamation-triangle-fill me-2"></i>
//                   <div>
//                     <strong>Error</strong>
//                     <p className="mb-0">{error}</p>
//                   </div>
//                 </div>
//                 <button
//                   type="button"
//                   className="btn-close"
//                   onClick={() => setError('')}
//                 ></button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Filters */}
//         <div className="row mb-4">
//           <div className="col-12">
//             <div className="card shadow-sm">
//               <div className="card-body">
//                 <div className="row g-3 align-items-end">
//                   <div className="col-md-3 col-sm-6">
//                     <label className="form-label fw-semibold">Status Filter</label>
//                     <select
//                       value={filters.status}
//                       onChange={(e) => handleFilterChange('status', e.target.value)}
//                       className="form-select"
//                     >
//                       <option value="">All Status</option>
//                       <option value="pending">Pending</option>
//                       <option value="reviewed">Reviewed</option>
//                       <option value="approved">Approved</option>
//                       <option value="rejected">Rejected</option>
//                     </select>
//                   </div>
//                   <div className="col-md-3 col-sm-6">
//                     <label className="form-label fw-semibold">Items per page</label>
//                     <select
//                       value={filters.limit}
//                       onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
//                       className="form-select"
//                     >
//                       <option value="10">10</option>
//                       <option value="25">25</option>
//                       <option value="50">50</option>
//                     </select>
//                   </div>
//                   <div className="col-md-3 col-sm-6">
//                     <button
//                       onClick={() => setFilters({ status: '', page: 1, limit: 10 })}
//                       className="btn btn-outline-secondary w-100"
//                     >
//                       Reset Filters
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Requests Table */}
//         <div className="row">
//           <div className="col-12">
//             <div className="card shadow-sm">
//               <div className="card-header bg-white">
//                 <h5 className="card-title mb-0">Service Requests</h5>
//               </div>
//               <div className="card-body p-0">
//                 <div className="table-responsive">
//                   <table className="table table-hover mb-0">
//                     <thead className="table-light">
//                       <tr>
//                         <th scope="col" className="px-4">Customer</th>
//                         <th scope="col" className="px-4">Phone</th>
//                         <th scope="col" className="px-4">Location</th>
//                         <th scope="col" className="px-4">Status</th>
//                         <th scope="col" className="px-4">Requested</th>
//                         <th scope="col" className="px-4">Actions</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {requests.map((request) => (
//                         <tr key={request._id}>
//                           <td className="px-4">
//                             <div className="fw-semibold text-dark">
//                               {request.customerId?.Fname || 'N/A'}
//                             </div>
//                             <small className="text-muted">{request.name}</small>
//                           </td>
//                           <td className="px-4">
//                             <span className="text-dark">{request.phone}</span>
//                           </td>
//                           <td className="px-4">
//                             <div className="text-dark text-truncate" style={{ maxWidth: '200px' }}>
//                               {request.address}
//                             </div>
//                             <small className="text-muted">
//                               Coordinates: {request.location?.coordinates?.join(', ')}
//                             </small>
//                           </td>
//                           <td className="px-4">
//                             <span className={`badge ${getStatusBadge(request.status)}`}>
//                               {request.status}
//                             </span>
//                           </td>
//                           <td className="px-4">
//                             <small className="text-muted">
//                               {formatDate(request.createdAt)}
//                             </small>
//                           </td>
//                           <td className="px-4">
//                             <button
//                               onClick={() => setSelectedRequest(request)}
//                               className="btn btn-sm btn-outline-primary"
//                             >
//                               View Details
//                             </button>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>

//                 {/* Empty State */}
//                 {requests.length === 0 && !loading && (
//                   <div className="text-center py-5">
//                     <div className="text-muted mb-3" style={{ fontSize: '3rem' }}>📭</div>
//                     <h5 className="text-dark mb-2">No requests found</h5>
//                     <p className="text-muted">No service requests match your current filters.</p>
//                   </div>
//                 )}
//               </div>

//               {/* Pagination */}
//               {pagination.totalPages > 1 && (
//                 <div className="card-footer bg-white">
//                   <div className="d-flex justify-content-between align-items-center">
//                     <div className="text-muted">
//                       Showing {((filters.page - 1) * filters.limit) + 1} to{' '}
//                       {Math.min(filters.page * filters.limit, pagination.totalRequests)} of{' '}
//                       {pagination.totalRequests} results
//                     </div>
//                     <div className="d-flex gap-2">
//                       <button
//                         onClick={() => handlePageChange(filters.page - 1)}
//                         disabled={!pagination.hasPrev}
//                         className={`btn btn-sm ${pagination.hasPrev ? 'btn-outline-primary' : 'btn-outline-secondary'}`}
//                       >
//                         Previous
//                       </button>
//                       <button
//                         onClick={() => handlePageChange(filters.page + 1)}
//                         disabled={!pagination.hasNext}
//                         className={`btn btn-sm ${pagination.hasNext ? 'btn-outline-primary' : 'btn-outline-secondary'}`}
//                       >
//                         Next
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Request Details Modal */}
//         {selectedRequest && (
//           <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
//             <div className="modal-dialog modal-lg modal-dialog-centered">
//               <div className="modal-content">
//                 <div className="modal-header">
//                   <h5 className="modal-title fw-bold">Request Details</h5>
//                   <button
//                     type="button"
//                     className="btn-close"
//                     onClick={() => setSelectedRequest(null)}
//                   ></button>
//                 </div>
//                 <div className="modal-body">
//                   <div className="row g-3">
//                     <div className="col-md-6">
//                       <label className="form-label fw-semibold">Customer Name</label>
//                       <p className="form-control-plaintext">{selectedRequest.name}</p>
//                     </div>
//                     <div className="col-md-6">
//                       <label className="form-label fw-semibold">Phone</label>
//                       <p className="form-control-plaintext">{selectedRequest.phone}</p>
//                     </div>
//                     <div className="col-12">
//                       <label className="form-label fw-semibold">Address</label>
//                       <p className="form-control-plaintext">{selectedRequest.address}</p>
//                     </div>
//                     <div className="col-md-6">
//                       <label className="form-label fw-semibold">Coordinates</label>
//                       <p className="form-control-plaintext">
//                         {selectedRequest.location?.coordinates?.join(', ')}
//                       </p>
//                     </div>
//                     <div className="col-md-6">
//                       <label className="form-label fw-semibold">Requested On</label>
//                       <p className="form-control-plaintext">
//                         {formatDate(selectedRequest.createdAt)}
//                       </p>
//                     </div>
//                     <div className="col-12">
//                       <label className="form-label fw-semibold">Current Status</label>
//                       <div>
//                         <span className={`badge ${getStatusBadge(selectedRequest.status)}`}>
//                           {selectedRequest.status}
//                         </span>
//                       </div>
//                     </div>

//                     {/* Update Status Form */}
//                     <div className="col-12 border-top pt-4">
//                       <h6 className="fw-bold mb-3">Update Status</h6>
//                       <div className="row g-3">
//                         <div className="col-md-6">
//                           <label className="form-label fw-semibold">New Status</label>
//                           <select
//                             value={updateStatus}
//                             onChange={(e) => setUpdateStatus(e.target.value)}
//                             className="form-select"
//                           >
//                             <option value="">Select Status</option>
//                             <option value="pending">Pending</option>
//                             <option value="reviewed">Reviewed</option>
//                             <option value="approved">Approved</option>
//                             <option value="rejected">Rejected</option>
//                           </select>
//                         </div>
//                         <div className="col-12">
//                           <label className="form-label fw-semibold">Notes (Optional)</label>
//                           <textarea
//                             value={updateNotes}
//                             onChange={(e) => setUpdateNotes(e.target.value)}
//                             rows="3"
//                             className="form-control"
//                             placeholder="Add any notes or comments..."
//                           />
//                         </div>
//                         <div className="col-12">
//                           <div className="d-flex gap-2 justify-content-end">
//                             <button
//                               onClick={() => setSelectedRequest(null)}
//                               className="btn btn-outline-secondary"
//                             >
//                               Cancel
//                             </button>
//                             <button
//                               onClick={() => handleUpdateStatus(selectedRequest._id)}
//                               disabled={!updateStatus}
//                               className="btn btn-primary"
//                             >
//                               Update Status
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default LocationRequest;

// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";

// const LocationRequest = () => {
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [stats, setStats] = useState(null);
//   const [filters, setFilters] = useState({
//     status: "",
//     page: 1,
//     limit: 10,
//   });
//   const [pagination, setPagination] = useState({});
//   const [selectedRequest, setSelectedRequest] = useState(null);
//   const [updateStatus, setUpdateStatus] = useState("");
//   const [updateNotes, setUpdateNotes] = useState("");
//   const [showMapModal, setShowMapModal] = useState(false);
//   const [mapLocation, setMapLocation] = useState(null);

//   const mapRef = useRef(null);
//   const mapInstanceRef = useRef(null);
//   const markerRef = useRef(null);

//   // Fetch service requests
//   const fetchRequests = async () => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem("token");

//       const params = new URLSearchParams();
//       if (filters.status) params.append("status", filters.status);
//       params.append("page", filters.page);
//       params.append("limit", filters.limit);

//       const response = await axios.get(
//         `http://localhost:7013/api/service-requests?${params}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       if (response.data.success) {
//         setRequests(response.data.data.requests);
//         setPagination(response.data.data.pagination);
//       } else {
//         throw new Error(response.data.message);
//       }
//     } catch (error) {
//       console.error("Error fetching requests:", error);
//       setError(
//         error.response?.data?.message ||
//           error.message ||
//           "Failed to fetch requests"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch statistics
//   const fetchStats = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const response = await axios.get(
//         "http://localhost:7013/api/service-requests/stats",
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       if (response.data.success) {
//         setStats(response.data.data);
//       }
//     } catch (error) {
//       console.error("Error fetching stats:", error);
//     }
//   };

//   // Update request status
//   const handleUpdateStatus = async (requestId) => {
//     try {
//       const token = localStorage.getItem("token");

//       const response = await axios.put(
//         `http://localhost:7013/api/service-requests/${requestId}`,
//         {
//           status: updateStatus,
//           notes: updateNotes,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       if (response.data.success) {
//         alert("Status updated successfully!");
//         setSelectedRequest(null);
//         setUpdateStatus("");
//         setUpdateNotes("");
//         fetchRequests();
//         fetchStats();
//       } else {
//         throw new Error(response.data.message);
//       }
//     } catch (error) {
//       console.error("Error updating status:", error);
//       setError(
//         error.response?.data?.message ||
//           error.message ||
//           "Failed to update status"
//       );
//     }
//   };

//   // Handle filter changes
//   const handleFilterChange = (key, value) => {
//     setFilters((prev) => ({
//       ...prev,
//       [key]: value,
//       page: 1,
//     }));
//   };

//   // Handle pagination
//   const handlePageChange = (newPage) => {
//     setFilters((prev) => ({
//       ...prev,
//       page: newPage,
//     }));
//   };

//   // Format date
//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   // Status badge style
//   const getStatusBadge = (status) => {
//     switch (status) {
//       case "pending":
//         return "bg-warning text-dark";
//       case "reviewed":
//         return "bg-info text-white";
//       case "approved":
//         return "bg-success text-white";
//       case "rejected":
//         return "bg-danger text-white";
//       default:
//         return "bg-secondary text-white";
//     }
//   };

//   // Show location on map
//   const handleShowLocation = (request) => {
//     const coordinates = request.location?.coordinates;
//     if (coordinates && coordinates.length === 2) {
//       // MongoDB stores coordinates as [lng, lat], Google Maps uses {lat, lng}
//       const location = {
//         lat: coordinates[1],
//         lng: coordinates[0],
//       };
//       setMapLocation({
//         coordinates: location,
//         address: request.address,
//         customerName: request.name,
//       });
//       setShowMapModal(true);
//     } else {
//       alert("Location coordinates not available");
//     }
//   };

//   // Initialize map when modal opens
//   useEffect(() => {
//     if (showMapModal && mapLocation && window.google) {
//       const initializeMap = () => {
//         if (mapRef.current) {
//           const map = new window.google.maps.Map(mapRef.current, {
//             zoom: 15,
//             center: mapLocation.coordinates,
//             mapTypeControl: false,
//             streetViewControl: false,
//             fullscreenControl: true,
//             zoomControl: true,
//             styles: [
//               {
//                 featureType: "poi",
//                 elementType: "labels",
//                 stylers: [{ visibility: "on" }],
//               },
//             ],
//           });

//           mapInstanceRef.current = map;

//           // Create marker
//           markerRef.current = new window.google.maps.Marker({
//             position: mapLocation.coordinates,
//             map: map,
//             title: `Location for ${mapLocation.customerName}`,
//             animation: window.google.maps.Animation.DROP,
//           });

//           // Create info window
//           const infoWindow = new window.google.maps.InfoWindow({
//             content: `
//               <div style="padding: 8px; max-width: 200px;">
//                 <strong>${mapLocation.customerName}</strong><br/>
//                 <small>${mapLocation.address}</small>
//               </div>
//             `,
//           });

//           markerRef.current.addListener("click", () => {
//             infoWindow.open(map, markerRef.current);
//           });

//           // Open info window automatically
//           infoWindow.open(map, markerRef.current);
//         }
//       };

//       // Small delay to ensure DOM is ready
//       setTimeout(initializeMap, 100);
//     }
//   }, [showMapModal, mapLocation]);

//   // Clean up map when modal closes
//   useEffect(() => {
//     if (!showMapModal) {
//       if (markerRef.current) {
//         markerRef.current.setMap(null);
//         markerRef.current = null;
//       }
//       if (mapInstanceRef.current) {
//         mapInstanceRef.current = null;
//       }
//     }
//   }, [showMapModal]);

//   // Load data on component mount and when filters change
//   useEffect(() => {
//     fetchRequests();
//     fetchStats();
//   }, [filters]);

//   // Load Google Maps script
//   useEffect(() => {
//     if (showMapModal && !window.google) {
//       const API_KEY = import.meta.env.VITE_MAP_KEY;

//       if (document.querySelector(`script[src*="maps.googleapis.com"]`)) {
//         return;
//       }

//       const script = document.createElement("script");
//       script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}`;
//       script.async = true;
//       script.defer = true;
//       document.head.appendChild(script);
//     }
//   }, [showMapModal]);

//   if (loading && requests.length === 0) {
//     return (
//       <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
//         <div className="text-center">
//           <div className="spinner-border text-primary" role="status">
//             <span className="visually-hidden">Loading...</span>
//           </div>
//           <p className="mt-3 text-muted">Loading service requests...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-vh-100 bg-light p-4">
//       <div className="container-fluid">
//         {/* Header */}
//         <div className="row mb-4">
//           <div className="col-12">
//             <h1 className="h2 fw-bold text-dark mb-2">
//               Location Service Requests
//             </h1>
//             <p className="text-muted">
//               Manage customer requests for service expansion
//             </p>
//           </div>
//         </div>

//         {/* Statistics */}
//         {stats && (
//           <div className="row mb-4">
//             <div className="col-md-2 col-6 mb-3">
//               <div className="card border-0 shadow-sm h-100">
//                 <div className="card-body text-center">
//                   <h3 className="card-title fw-bold text-dark">
//                     {stats.statusStats.total}
//                   </h3>
//                   <p className="card-text text-muted mb-0">Total Requests</p>
//                 </div>
//               </div>
//             </div>
//             <div className="col-md-2 col-6 mb-3">
//               <div className="card border-0 shadow-sm h-100 bg-warning bg-opacity-10">
//                 <div className="card-body text-center">
//                   <h3 className="card-title fw-bold text-warning">
//                     {stats.statusStats.pending}
//                   </h3>
//                   <p className="card-text text-warning mb-0">Pending</p>
//                 </div>
//               </div>
//             </div>
//             <div className="col-md-2 col-6 mb-3">
//               <div className="card border-0 shadow-sm h-100 bg-info bg-opacity-10">
//                 <div className="card-body text-center">
//                   <h3 className="card-title fw-bold text-info">
//                     {stats.statusStats.reviewed}
//                   </h3>
//                   <p className="card-text text-info mb-0">Reviewed</p>
//                 </div>
//               </div>
//             </div>
//             <div className="col-md-2 col-6 mb-3">
//               <div className="card border-0 shadow-sm h-100 bg-success bg-opacity-10">
//                 <div className="card-body text-center">
//                   <h3 className="card-title fw-bold text-success">
//                     {stats.statusStats.approved}
//                   </h3>
//                   <p className="card-text text-success mb-0">Approved</p>
//                 </div>
//               </div>
//             </div>
//             <div className="col-md-2 col-6 mb-3">
//               <div className="card border-0 shadow-sm h-100 bg-danger bg-opacity-10">
//                 <div className="card-body text-center">
//                   <h3 className="card-title fw-bold text-danger">
//                     {stats.statusStats.rejected}
//                   </h3>
//                   <p className="card-text text-danger mb-0">Rejected</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Error Message */}
//         {error && (
//           <div className="row mb-4">
//             <div className="col-12">
//               <div
//                 className="alert alert-danger alert-dismissible fade show"
//                 role="alert"
//               >
//                 <div className="d-flex align-items-center">
//                   <i className="bi bi-exclamation-triangle-fill me-2"></i>
//                   <div>
//                     <strong>Error</strong>
//                     <p className="mb-0">{error}</p>
//                   </div>
//                 </div>
//                 <button
//                   type="button"
//                   className="btn-close"
//                   onClick={() => setError("")}
//                 ></button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Filters */}
//         <div className="row mb-4">
//           <div className="col-12">
//             <div className="card shadow-sm">
//               <div className="card-body">
//                 <div className="row g-3 align-items-end">
//                   <div className="col-md-3 col-sm-6">
//                     <label className="form-label fw-semibold">
//                       Status Filter
//                     </label>
//                     <select
//                       value={filters.status}
//                       onChange={(e) =>
//                         handleFilterChange("status", e.target.value)
//                       }
//                       className="form-select"
//                     >
//                       <option value="">All Status</option>
//                       <option value="pending">Pending</option>
//                       <option value="reviewed">Reviewed</option>
//                       <option value="approved">Approved</option>
//                       <option value="rejected">Rejected</option>
//                     </select>
//                   </div>
//                   <div className="col-md-3 col-sm-6">
//                     <label className="form-label fw-semibold">
//                       Items per page
//                     </label>
//                     <select
//                       value={filters.limit}
//                       onChange={(e) =>
//                         handleFilterChange("limit", parseInt(e.target.value))
//                       }
//                       className="form-select"
//                     >
//                       <option value="10">10</option>
//                       <option value="25">25</option>
//                       <option value="50">50</option>
//                     </select>
//                   </div>
//                   <div className="col-md-3 col-sm-6">
//                     <button
//                       onClick={() =>
//                         setFilters({ status: "", page: 1, limit: 10 })
//                       }
//                       className="btn btn-outline-secondary w-100"
//                     >
//                       Reset Filters
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Requests Table */}
//         <div className="row">
//           <div className="col-12">
//             <div className="card shadow-sm">
//               <div className="card-header bg-white">
//                 <h5 className="card-title mb-0">Service Requests</h5>
//               </div>
//               <div className="card-body p-0">
//                 <div className="table-responsive">
//                   <table className="table table-hover mb-0">
//                     <thead className="table-light">
//                       <tr>
//                         <th scope="col" className="px-4">
//                           Customer
//                         </th>
//                         <th scope="col" className="px-4">
//                           Phone
//                         </th>
//                         <th scope="col" className="px-4">
//                           Location
//                         </th>
//                         <th scope="col" className="px-4">
//                           Status
//                         </th>
//                         <th scope="col" className="px-4">
//                           Requested
//                         </th>
//                         <th scope="col" className="px-4">
//                           Actions
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {requests.map((request) => (
//                         <tr key={request._id}>
//                           <td className="px-4">
//                             <div className="fw-semibold text-dark">
//                               {request.customerId?.Fname || "N/A"}
//                             </div>
//                             <small className="text-muted">{request.name}</small>
//                           </td>
//                           <td className="px-4">
//                             <span className="text-dark">{request.phone}</span>
//                           </td>
//                           <td className="px-4">
//                             <div
//                               className="text-dark text-truncate"
//                               style={{ maxWidth: "200px" }}
//                             >
//                               {request.address}
//                             </div>
//                             <small className="text-muted">
//                               Coordinates:{" "}
//                               {request.location?.coordinates?.join(", ")}
//                             </small>
//                           </td>
//                           <td className="px-4">
//                             <span
//                               className={`badge ${getStatusBadge(
//                                 request.status
//                               )}`}
//                             >
//                               {request.status}
//                             </span>
//                           </td>
//                           <td className="px-4">
//                             <small className="text-muted">
//                               {formatDate(request.createdAt)}
//                             </small>
//                           </td>
//                           <td className="px-4">
//                             <div className="btn-group btn-group-sm">
//                               <button
//                                 onClick={() => setSelectedRequest(request)}
//                                 className="btn btn-outline-primary"
//                               >
//                                 Details
//                               </button>
//                               <button
//                                 onClick={() => handleShowLocation(request)}
//                                 className="btn btn-outline-info"
//                                 title="View on Map"
//                               >
//                                 <i className="bi bi-geo-alt"></i> Map
//                               </button>
//                             </div>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>

//                 {/* Empty State */}
//                 {requests.length === 0 && !loading && (
//                   <div className="text-center py-5">
//                     <div
//                       className="text-muted mb-3"
//                       style={{ fontSize: "3rem" }}
//                     >
//                       📭
//                     </div>
//                     <h5 className="text-dark mb-2">No requests found</h5>
//                     <p className="text-muted">
//                       No service requests match your current filters.
//                     </p>
//                   </div>
//                 )}
//               </div>

//               {/* Pagination */}
//               {pagination.totalPages > 1 && (
//                 <div className="card-footer bg-white">
//                   <div className="d-flex justify-content-between align-items-center">
//                     <div className="text-muted">
//                       Showing {(filters.page - 1) * filters.limit + 1} to{" "}
//                       {Math.min(
//                         filters.page * filters.limit,
//                         pagination.totalRequests
//                       )}{" "}
//                       of {pagination.totalRequests} results
//                     </div>
//                     <div className="d-flex gap-2">
//                       <button
//                         onClick={() => handlePageChange(filters.page - 1)}
//                         disabled={!pagination.hasPrev}
//                         className={`btn btn-sm ${
//                           pagination.hasPrev
//                             ? "btn-outline-primary"
//                             : "btn-outline-secondary"
//                         }`}
//                       >
//                         Previous
//                       </button>
//                       <button
//                         onClick={() => handlePageChange(filters.page + 1)}
//                         disabled={!pagination.hasNext}
//                         className={`btn btn-sm ${
//                           pagination.hasNext
//                             ? "btn-outline-primary"
//                             : "btn-outline-secondary"
//                         }`}
//                       >
//                         Next
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Request Details Modal */}
//         {selectedRequest && (
//           <div
//             className="modal fade show d-block"
//             tabIndex="-1"
//             style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
//           >
//             <div className="modal-dialog modal-lg modal-dialog-centered">
//               <div className="modal-content">
//                 <div className="modal-header">
//                   <h5 className="modal-title fw-bold">Request Details</h5>
//                   <button
//                     type="button"
//                     className="btn-close"
//                     onClick={() => setSelectedRequest(null)}
//                   ></button>
//                 </div>
//                 <div className="modal-body">
//                   <div className="row g-3">
//                     <div className="col-md-6">
//                       <label className="form-label fw-semibold">
//                         Customer Name
//                       </label>
//                       <p className="form-control-plaintext">
//                         {selectedRequest.name}
//                       </p>
//                     </div>
//                     <div className="col-md-6">
//                       <label className="form-label fw-semibold">Phone</label>
//                       <p className="form-control-plaintext">
//                         {selectedRequest.phone}
//                       </p>
//                     </div>
//                     <div className="col-12">
//                       <label className="form-label fw-semibold">Address</label>
//                       <p className="form-control-plaintext">
//                         {selectedRequest.address}
//                       </p>
//                     </div>
//                     <div className="col-md-6">
//                       <label className="form-label fw-semibold">
//                         Coordinates
//                       </label>
//                       <p className="form-control-plaintext">
//                         {selectedRequest.location?.coordinates?.join(", ")}
//                       </p>
//                     </div>
//                     <div className="col-md-6">
//                       <label className="form-label fw-semibold">
//                         Requested On
//                       </label>
//                       <p className="form-control-plaintext">
//                         {formatDate(selectedRequest.createdAt)}
//                       </p>
//                     </div>
//                     <div className="col-12">
//                       <label className="form-label fw-semibold">
//                         Current Status
//                       </label>
//                       <div>
//                         <span
//                           className={`badge ${getStatusBadge(
//                             selectedRequest.status
//                           )}`}
//                         >
//                           {selectedRequest.status}
//                         </span>
//                       </div>
//                     </div>

//                     {/* Update Status Form */}
//                     <div className="col-12 border-top pt-4">
//                       <h6 className="fw-bold mb-3">Update Status</h6>
//                       <div className="row g-3">
//                         <div className="col-md-6">
//                           <label className="form-label fw-semibold">
//                             New Status
//                           </label>
//                           <select
//                             value={updateStatus}
//                             onChange={(e) => setUpdateStatus(e.target.value)}
//                             className="form-select"
//                           >
//                             <option value="">Select Status</option>
//                             <option value="pending">Pending</option>
//                             <option value="reviewed">Reviewed</option>
//                             <option value="approved">Approved</option>
//                             <option value="rejected">Rejected</option>
//                           </select>
//                         </div>
//                         <div className="col-12">
//                           <label className="form-label fw-semibold">
//                             Notes (Optional)
//                           </label>
//                           <textarea
//                             value={updateNotes}
//                             onChange={(e) => setUpdateNotes(e.target.value)}
//                             rows="3"
//                             className="form-control"
//                             placeholder="Add any notes or comments..."
//                           />
//                         </div>
//                         <div className="col-12">
//                           <div className="d-flex gap-2 justify-content-end">
//                             <button
//                               onClick={() => setSelectedRequest(null)}
//                               className="btn btn-outline-secondary"
//                             >
//                               Cancel
//                             </button>
//                             <button
//                               onClick={() =>
//                                 handleUpdateStatus(selectedRequest._id)
//                               }
//                               disabled={!updateStatus}
//                               className="btn btn-primary"
//                             >
//                               Update Status
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Map Modal */}
//         {showMapModal && mapLocation && (
//           <div
//             className="modal fade show d-block"
//             tabIndex="-1"
//             style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
//           >
//             <div className="modal-dialog modal-xl modal-dialog-centered">
//               <div className="modal-content">
//                 <div className="modal-header">
//                   <h5 className="modal-title fw-bold">
//                     <i className="bi bi-geo-alt me-2"></i>
//                     Location: {mapLocation.customerName}
//                   </h5>
//                   <button
//                     type="button"
//                     className="btn-close"
//                     onClick={() => setShowMapModal(false)}
//                   ></button>
//                 </div>
//                 <div className="modal-body p-0">
//                   <div className="row g-0">
//                     <div className="col-md-8">
//                       <div
//                         ref={mapRef}
//                         style={{
//                           height: "500px",
//                           width: "100%",
//                           backgroundColor: "#e9ecef",
//                         }}
//                       >
//                         {!window.google && (
//                           <div className="d-flex align-items-center justify-content-center h-100">
//                             <div className="text-center">
//                               <div
//                                 className="spinner-border text-primary"
//                                 role="status"
//                               >
//                                 <span className="visually-hidden">
//                                   Loading map...
//                                 </span>
//                               </div>
//                               <p className="mt-2 text-muted">Loading map...</p>
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                     <div className="col-md-4">
//                       <div className="p-4">
//                         <h6 className="fw-bold mb-3">Location Details</h6>
//                         <div className="mb-3">
//                           <strong>Customer:</strong>
//                           <p className="mb-0 text-muted">
//                             {mapLocation.customerName}
//                           </p>
//                         </div>
//                         <div className="mb-3">
//                           <strong>Address:</strong>
//                           <p className="mb-0 text-muted small">
//                             {mapLocation.address}
//                           </p>
//                         </div>
//                         <div className="mb-3">
//                           <strong>Coordinates:</strong>
//                           <p className="mb-0 text-muted small">
//                             Lat: {mapLocation.coordinates.lat.toFixed(6)}
//                             <br />
//                             Lng: {mapLocation.coordinates.lng.toFixed(6)}
//                           </p>
//                         </div>
//                         <div className="mt-4">
//                           <button
//                             onClick={() => {
//                               const url = `https://www.google.com/maps?q=${mapLocation.coordinates.lat},${mapLocation.coordinates.lng}`;
//                               window.open(url, "_blank");
//                             }}
//                             className="btn btn-outline-primary btn-sm w-100"
//                           >
//                             <i className="bi bi-box-arrow-up-right me-2"></i>
//                             Open in Google Maps
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default LocationRequest;

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const LocationRequest = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({});
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [updateStatus, setUpdateStatus] = useState("");
  const [updateNotes, setUpdateNotes] = useState("");
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapLocation, setMapLocation] = useState(null);
  const [showAllLocationsMap, setShowAllLocationsMap] = useState(false);
  const [allLocations, setAllLocations] = useState([]);
  const [mapLoading, setMapLoading] = useState(false);

  const mapRef = useRef(null);
  const allLocationsMapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const allLocationsMapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  // Fetch service requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      params.append("page", filters.page);
      params.append("limit", filters.limit);

      const response = await axios.get(
        `http://localhost:7013/api/service-requests?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setRequests(response.data.data.requests);
        setPagination(response.data.data.pagination);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch requests"
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch all locations for map view
  const fetchAllLocations = async () => {
    try {
      setMapLoading(true);
      const token = localStorage.getItem("token");

      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);

      const response = await axios.get(
        `http://localhost:7013/api/service-requests/map-locations?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setAllLocations(response.data.data.locations);
        setShowAllLocationsMap(true);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch locations"
      );
    } finally {
      setMapLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:7013/api/service-requests/stats",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // Update request status
  const handleUpdateStatus = async (requestId) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `http://localhost:7013/api/service-requests/${requestId}`,
        {
          status: updateStatus,
          notes: updateNotes,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        alert("Status updated successfully!");
        setSelectedRequest(null);
        setUpdateStatus("");
        setUpdateNotes("");
        fetchRequests();
        fetchStats();
        // Refresh locations if all locations map is open
        if (showAllLocationsMap) {
          fetchAllLocations();
        }
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to update status"
      );
    }
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Status badge style
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return "bg-warning text-dark";
      case "reviewed":
        return "bg-info text-white";
      case "approved":
        return "bg-success text-white";
      case "rejected":
        return "bg-danger text-white";
      default:
        return "bg-secondary text-white";
    }
  };

  // Get status color for map markers
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#ffc107"; // yellow
      case "reviewed":
        return "#0dcaf0"; // blue
      case "approved":
        return "#198754"; // green
      case "rejected":
        return "#dc3545"; // red
      default:
        return "#6c757d"; // gray
    }
  };

  // Show single location on map
  const handleShowLocation = (request) => {
    const coordinates = request.location?.coordinates;
    if (coordinates && coordinates.length === 2) {
      const location = {
        lat: coordinates[1],
        lng: coordinates[0],
      };
      setMapLocation({
        coordinates: location,
        address: request.address,
        customerName: request.name,
        status: request.status,
      });
      setShowMapModal(true);
    } else {
      alert("Location coordinates not available");
    }
  };

  // Initialize single location map
  const initializeSingleMap = () => {
    if (mapRef.current && mapLocation && window.google) {
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 15,
        center: mapLocation.coordinates,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
      });

      mapInstanceRef.current = map;

      // Create marker
      markerRef.current = new window.google.maps.Marker({
        position: mapLocation.coordinates,
        map: map,
        title: `Location for ${mapLocation.customerName}`,
        animation: window.google.maps.Animation.DROP,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: getStatusColor(mapLocation.status),
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
          scale: 10,
        },
      });

      // Create info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 200px;">
            <strong>${mapLocation.customerName}</strong><br/>
            <small>${mapLocation.address}</small><br/>
            <span class="badge" style="background-color: ${getStatusColor(
              mapLocation.status
            )}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px;">
              ${mapLocation.status}
            </span>
          </div>
        `,
      });

      markerRef.current.addListener("click", () => {
        infoWindow.open(map, markerRef.current);
      });

      infoWindow.open(map, markerRef.current);
    }
  };

  // Initialize all locations map
  const initializeAllLocationsMap = () => {
    if (
      allLocationsMapRef.current &&
      allLocations.length > 0 &&
      window.google
    ) {
      // Calculate bounds to fit all markers
      const bounds = new window.google.maps.LatLngBounds();

      const map = new window.google.maps.Map(allLocationsMapRef.current, {
        zoom: 10,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
      });

      allLocationsMapInstanceRef.current = map;

      // Clear existing markers
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];

      // Add markers for all locations
      allLocations.forEach((location) => {
        const marker = new window.google.maps.Marker({
          position: location.coordinates,
          map: map,
          title: `${location.customerName} - ${location.status}`,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: getStatusColor(location.status),
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
            scale: 8,
          },
        });

        // Extend bounds to include this marker
        bounds.extend(location.coordinates);

        // Create info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; max-width: 250px;">
              <strong>${location.customerName}</strong><br/>
              <small>${location.name} - ${location.phone}</small><br/>
              <small>${location.address}</small><br/>
              <span class="badge" style="background-color: ${getStatusColor(
                location.status
              )}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px;">
                ${location.status}
              </span><br/>
              <small>Requested: ${formatDate(location.requestedAt)}</small>
            </div>
          `,
        });

        marker.addListener("click", () => {
          infoWindow.open(map, marker);
        });

        markersRef.current.push(marker);
      });

      // Fit map to bounds
      if (allLocations.length > 1) {
        map.fitBounds(bounds);
      } else if (allLocations.length === 1) {
        map.setCenter(allLocations[0].coordinates);
        map.setZoom(15);
      }
    }
  };

  // Clean up maps when modals close
  useEffect(() => {
    if (!showMapModal) {
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
    }

    if (!showAllLocationsMap) {
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
      if (allLocationsMapInstanceRef.current) {
        allLocationsMapInstanceRef.current = null;
      }
    }
  }, [showMapModal, showAllLocationsMap]);

  // Initialize maps when data is ready
  useEffect(() => {
    if (showMapModal && mapLocation && window.google) {
      setTimeout(initializeSingleMap, 100);
    }
  }, [showMapModal, mapLocation]);

  useEffect(() => {
    if (showAllLocationsMap && allLocations.length > 0 && window.google) {
      setTimeout(initializeAllLocationsMap, 100);
    }
  }, [showAllLocationsMap, allLocations]);

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchRequests();
    fetchStats();
  }, [filters]);

  // Load Google Maps script
  useEffect(() => {
    if ((showMapModal || showAllLocationsMap) && !window.google) {
      const API_KEY = import.meta.env.VITE_MAP_KEY;

      if (document.querySelector(`script[src*="maps.googleapis.com"]`)) {
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, [showMapModal, showAllLocationsMap]);

  if (loading && requests.length === 0) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading service requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light p-4">
      <div className="container-fluid">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <h1 className="h2 fw-bold text-dark mb-2">
              Location Service Requests
            </h1>
            <p className="text-muted">
              Manage customer requests for service expansion
            </p>
          </div>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="row mb-4">
            <div className="col-md-2 col-6 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center">
                  <h3 className="card-title fw-bold text-dark">
                    {stats.statusStats.total}
                  </h3>
                  <p className="card-text text-muted mb-0">Total Requests</p>
                </div>
              </div>
            </div>
            <div className="col-md-2 col-6 mb-3">
              <div className="card border-0 shadow-sm h-100 bg-warning bg-opacity-10">
                <div className="card-body text-center">
                  <h3 className="card-title fw-bold text-warning">
                    {stats.statusStats.pending}
                  </h3>
                  <p className="card-text text-warning mb-0">Pending</p>
                </div>
              </div>
            </div>
            <div className="col-md-2 col-6 mb-3">
              <div className="card border-0 shadow-sm h-100 bg-info bg-opacity-10">
                <div className="card-body text-center">
                  <h3 className="card-title fw-bold text-info">
                    {stats.statusStats.reviewed}
                  </h3>
                  <p className="card-text text-info mb-0">Reviewed</p>
                </div>
              </div>
            </div>
            <div className="col-md-2 col-6 mb-3">
              <div className="card border-0 shadow-sm h-100 bg-success bg-opacity-10">
                <div className="card-body text-center">
                  <h3 className="card-title fw-bold text-success">
                    {stats.statusStats.approved}
                  </h3>
                  <p className="card-text text-success mb-0">Approved</p>
                </div>
              </div>
            </div>
            <div className="col-md-2 col-6 mb-3">
              <div className="card border-0 shadow-sm h-100 bg-danger bg-opacity-10">
                <div className="card-body text-center">
                  <h3 className="card-title fw-bold text-danger">
                    {stats.statusStats.rejected}
                  </h3>
                  <p className="card-text text-danger mb-0">Rejected</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="row mb-4">
            <div className="col-12">
              <div
                className="alert alert-danger alert-dismissible fade show"
                role="alert"
              >
                <div className="d-flex align-items-center">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  <div>
                    <strong>Error</strong>
                    <p className="mb-0">{error}</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setError("")}
                ></button>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="row g-3 align-items-end">
                  <div className="col-md-3 col-sm-6">
                    <label className="form-label fw-semibold">
                      Status Filter
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) =>
                        handleFilterChange("status", e.target.value)
                      }
                      className="form-select"
                    >
                      <option value="">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div className="col-md-3 col-sm-6">
                    <label className="form-label fw-semibold">
                      Items per page
                    </label>
                    <select
                      value={filters.limit}
                      onChange={(e) =>
                        handleFilterChange("limit", parseInt(e.target.value))
                      }
                      className="form-select"
                    >
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                    </select>
                  </div>
                  <div className="col-md-3 col-sm-6">
                    <button
                      onClick={() =>
                        setFilters({ status: "", page: 1, limit: 10 })
                      }
                      className="btn btn-outline-secondary w-100"
                    >
                      Reset Filters
                    </button>
                  </div>
                  <div className="col-md-3 col-sm-6">
                    <button
                      onClick={fetchAllLocations}
                      disabled={mapLoading}
                      className="btn btn-primary w-100"
                    >
                      {mapLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Loading Map...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-map me-2"></i>
                          View All on Map
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Requests Table */}
        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-header bg-white">
                <h5 className="card-title mb-0">Service Requests</h5>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th scope="col" className="px-4">
                          Customer
                        </th>
                        <th scope="col" className="px-4">
                          Phone
                        </th>
                        <th scope="col" className="px-4">
                          Location
                        </th>
                        <th scope="col" className="px-4">
                          Status
                        </th>
                        <th scope="col" className="px-4">
                          Requested
                        </th>
                        <th scope="col" className="px-4">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map((request) => (
                        <tr key={request._id}>
                          <td className="px-4">
                            <div className="fw-semibold text-dark">
                              {request.customerId?.Fname || "N/A"}
                            </div>
                            <small className="text-muted">{request.name}</small>
                          </td>
                          <td className="px-4">
                            <span className="text-dark">{request.phone}</span>
                          </td>
                          <td className="px-4">
                            <div
                              className="text-dark text-truncate"
                              style={{ maxWidth: "200px" }}
                            >
                              {request.address}
                            </div>
                            <small className="text-muted">
                              Coordinates:{" "}
                              {request.location?.coordinates?.join(", ")}
                            </small>
                          </td>
                          <td className="px-4">
                            <span
                              className={`badge ${getStatusBadge(
                                request.status
                              )}`}
                            >
                              {request.status}
                            </span>
                          </td>
                          <td className="px-4">
                            <small className="text-muted">
                              {formatDate(request.createdAt)}
                            </small>
                          </td>
                          <td className="px-4">
                            <div className="btn-group btn-group-sm">
                              <button
                                onClick={() => setSelectedRequest(request)}
                                className="btn btn-outline-primary"
                              >
                                Details
                              </button>
                              <button
                                onClick={() => handleShowLocation(request)}
                                className="btn btn-outline-info"
                                title="View on Map"
                              >
                                <i className="bi bi-geo-alt"></i> Map
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Empty State */}
                {requests.length === 0 && !loading && (
                  <div className="text-center py-5">
                    <div
                      className="text-muted mb-3"
                      style={{ fontSize: "3rem" }}
                    >
                      📭
                    </div>
                    <h5 className="text-dark mb-2">No requests found</h5>
                    <p className="text-muted">
                      No service requests match your current filters.
                    </p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="card-footer bg-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="text-muted">
                      Showing {(filters.page - 1) * filters.limit + 1} to{" "}
                      {Math.min(
                        filters.page * filters.limit,
                        pagination.totalRequests
                      )}{" "}
                      of {pagination.totalRequests} results
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        onClick={() => handlePageChange(filters.page - 1)}
                        disabled={!pagination.hasPrev}
                        className={`btn btn-sm ${
                          pagination.hasPrev
                            ? "btn-outline-primary"
                            : "btn-outline-secondary"
                        }`}
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => handlePageChange(filters.page + 1)}
                        disabled={!pagination.hasNext}
                        className={`btn btn-sm ${
                          pagination.hasNext
                            ? "btn-outline-primary"
                            : "btn-outline-secondary"
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Request Details Modal */}
        {selectedRequest && (
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">Request Details</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setSelectedRequest(null)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Customer Name
                      </label>
                      <p className="form-control-plaintext">
                        {selectedRequest.name}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Phone</label>
                      <p className="form-control-plaintext">
                        {selectedRequest.phone}
                      </p>
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">Address</label>
                      <p className="form-control-plaintext">
                        {selectedRequest.address}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Coordinates
                      </label>
                      <p className="form-control-plaintext">
                        {selectedRequest.location?.coordinates?.join(", ")}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Requested On
                      </label>
                      <p className="form-control-plaintext">
                        {formatDate(selectedRequest.createdAt)}
                      </p>
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">
                        Current Status
                      </label>
                      <div>
                        <span
                          className={`badge ${getStatusBadge(
                            selectedRequest.status
                          )}`}
                        >
                          {selectedRequest.status}
                        </span>
                      </div>
                    </div>

                    {/* Update Status Form */}
                    <div className="col-12 border-top pt-4">
                      <h6 className="fw-bold mb-3">Update Status</h6>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">
                            New Status
                          </label>
                          <select
                            value={updateStatus}
                            onChange={(e) => setUpdateStatus(e.target.value)}
                            className="form-select"
                          >
                            <option value="">Select Status</option>
                            <option value="pending">Pending</option>
                            <option value="reviewed">Reviewed</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                        <div className="col-12">
                          <label className="form-label fw-semibold">
                            Notes (Optional)
                          </label>
                          <textarea
                            value={updateNotes}
                            onChange={(e) => setUpdateNotes(e.target.value)}
                            rows="3"
                            className="form-control"
                            placeholder="Add any notes or comments..."
                          />
                        </div>
                        <div className="col-12">
                          <div className="d-flex gap-2 justify-content-end">
                            <button
                              onClick={() => setSelectedRequest(null)}
                              className="btn btn-outline-secondary"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() =>
                                handleUpdateStatus(selectedRequest._id)
                              }
                              disabled={!updateStatus}
                              className="btn btn-primary"
                            >
                              Update Status
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Single Location Map Modal */}
        {showMapModal && mapLocation && (
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-xl modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">
                    <i className="bi bi-geo-alt me-2"></i>
                    Location: {mapLocation.customerName}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowMapModal(false)}
                  ></button>
                </div>
                <div className="modal-body p-0">
                  <div className="row g-0">
                    <div className="col-md-8">
                      <div
                        ref={mapRef}
                        style={{
                          height: "500px",
                          width: "100%",
                          backgroundColor: "#e9ecef",
                        }}
                      >
                        {!window.google && (
                          <div className="d-flex align-items-center justify-content-center h-100">
                            <div className="text-center">
                              <div
                                className="spinner-border text-primary"
                                role="status"
                              >
                                <span className="visually-hidden">
                                  Loading map...
                                </span>
                              </div>
                              <p className="mt-2 text-muted">Loading map...</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-4">
                        <h6 className="fw-bold mb-3">Location Details</h6>
                        <div className="mb-3">
                          <strong>Customer:</strong>
                          <p className="mb-0 text-muted">
                            {mapLocation.customerName}
                          </p>
                        </div>
                        <div className="mb-3">
                          <strong>Address:</strong>
                          <p className="mb-0 text-muted small">
                            {mapLocation.address}
                          </p>
                        </div>
                        <div className="mb-3">
                          <strong>Coordinates:</strong>
                          <p className="mb-0 text-muted small">
                            Lat: {mapLocation.coordinates.lat.toFixed(6)}
                            <br />
                            Lng: {mapLocation.coordinates.lng.toFixed(6)}
                          </p>
                        </div>
                        <div className="mb-3">
                          <strong>Status:</strong>
                          <div>
                            <span
                              className={`badge ${getStatusBadge(
                                mapLocation.status
                              )}`}
                            >
                              {mapLocation.status}
                            </span>
                          </div>
                        </div>
                        <div className="mt-4">
                          <button
                            onClick={() => {
                              const url = `https://www.google.com/maps?q=${mapLocation.coordinates.lat},${mapLocation.coordinates.lng}`;
                              window.open(url, "_blank");
                            }}
                            className="btn btn-outline-primary btn-sm w-100"
                          >
                            <i className="bi bi-box-arrow-up-right me-2"></i>
                            Open in Google Maps
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* All Locations Map Modal */}
        {showAllLocationsMap && (
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 9999 }}
          >
            <div className="modal-dialog modal-fullscreen">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">
                    <i className="bi bi-map me-2"></i>
                    All Service Request Locations ({allLocations.length})
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowAllLocationsMap(false)}
                  ></button>
                </div>
                <div
                  className="modal-body p-0 position-relative"
                  style={{ zIndex: 9999 }}
                >
                  {/* Map Legend */}
                  <div
                    className="position-absolute top-0 end-0 m-3 z-3"
                    style={{ zIndex: 9999 }}
                  >
                    <div className="card shadow-sm">
                      <div className="card-body p-3">
                        <h6 className="card-title mb-2">Status Legend</h6>
                        <div className="d-flex flex-column gap-1">
                          <div className="d-flex align-items-center">
                            <div
                              className="rounded-circle me-2"
                              style={{
                                width: "12px",
                                height: "12px",
                                backgroundColor: "#ffc107",
                              }}
                            ></div>
                            <small>Pending</small>
                          </div>
                          <div className="d-flex align-items-center">
                            <div
                              className="rounded-circle me-2"
                              style={{
                                width: "12px",
                                height: "12px",
                                backgroundColor: "#0dcaf0",
                              }}
                            ></div>
                            <small>Reviewed</small>
                          </div>
                          <div className="d-flex align-items-center">
                            <div
                              className="rounded-circle me-2"
                              style={{
                                width: "12px",
                                height: "12px",
                                backgroundColor: "#198754",
                              }}
                            ></div>
                            <small>Approved</small>
                          </div>
                          <div className="d-flex align-items-center">
                            <div
                              className="rounded-circle me-2"
                              style={{
                                width: "12px",
                                height: "12px",
                                backgroundColor: "#dc3545",
                              }}
                            ></div>
                            <small>Rejected</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Map Container */}
                  <div
                    ref={allLocationsMapRef}
                    style={{
                      height: "100vh",
                      width: "100%",
                      backgroundColor: "#e9ecef",
                    }}
                  >
                    {!window.google && (
                      <div className="d-flex align-items-center justify-content-center h-100">
                        <div className="text-center">
                          <div
                            className="spinner-border text-primary"
                            role="status"
                          >
                            <span className="visually-hidden">
                              Loading map...
                            </span>
                          </div>
                          <p className="mt-2 text-muted">Loading map...</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Locations Summary */}
                  <div
                    className="position-absolute bottom-0 start-0 w-100 z-3"
                    style={{ zIndex: 1000 }}
                  >
                    <div className="card m-3">
                      <div className="card-body py-2">
                        <div className="row text-center">
                          <div className="col">
                            <small className="text-muted">
                              Total Locations
                            </small>
                            <div className="fw-bold text-dark">
                              {allLocations.length}
                            </div>
                          </div>
                          <div className="col">
                            <small className="text-muted">Pending</small>
                            <div className="fw-bold text-warning">
                              {
                                allLocations.filter(
                                  (loc) => loc.status === "pending"
                                ).length
                              }
                            </div>
                          </div>
                          <div className="col">
                            <small className="text-muted">Reviewed</small>
                            <div className="fw-bold text-info">
                              {
                                allLocations.filter(
                                  (loc) => loc.status === "reviewed"
                                ).length
                              }
                            </div>
                          </div>
                          <div className="col">
                            <small className="text-muted">Approved</small>
                            <div className="fw-bold text-success">
                              {
                                allLocations.filter(
                                  (loc) => loc.status === "approved"
                                ).length
                              }
                            </div>
                          </div>
                          <div className="col">
                            <small className="text-muted">Rejected</small>
                            <div className="fw-bold text-danger">
                              {
                                allLocations.filter(
                                  (loc) => loc.status === "rejected"
                                ).length
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationRequest;
