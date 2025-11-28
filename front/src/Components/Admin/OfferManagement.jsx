import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";

// Main Admin Panel Component
// const OfferManagement = () => {
//   const [activeTab, setActiveTab] = useState('offer');

//   return (
//     <div className="container py-5" style={{ backgroundColor: '#f8f9fa' }}>
//       <h1 className="text-center mb-4 fw-bold" style={{ color: '#2c3e50' }}>
//         Dailydish Offer Management
//       </h1>
//       <ul className="nav nav-tabs mb-4 justify-content-center">
//         <li className="nav-item">
//           <button
//             className={`nav-link ${activeTab === 'offer' ? 'active' : ''}`}
//             onClick={() => setActiveTab('offer')}
//             style={activeTab === 'offer' ? { backgroundColor: '#f81e0f', color: 'white', borderColor: '#f81e0f' } : { color: '#2c3e50' }}
//           >
//             Manage Offers
//           </button>
//         </li>
//         <li className="nav-item">
//           <button
//             className={`nav-link ${activeTab === 'banner' ? 'active' : ''}`}
//             onClick={() => setActiveTab('banner')}
//             style={activeTab === 'banner' ? { backgroundColor: '#f81e0f', color: 'white', borderColor: '#f81e0f' } : { color: '#2c3e50' }}
//           >
//             Manage Banners
//           </button>
//         </li>
//         <li className="nav-item">
//           <button
//             className={`nav-link ${activeTab === 'reports' ? 'active' : ''}`}
//             onClick={() => setActiveTab('reports')}
//             style={activeTab === 'reports' ? { backgroundColor: '#f81e0f', color: 'white', borderColor: '#f81e0f' } : { color: '#2c3e50' }}
//           >
//             Reports
//           </button>
//         </li>
//       </ul>
//       <div className="card shadow">
//         <div className="card-body">
//           {activeTab === 'offer' && <OfferForm />}
//           {activeTab === 'banner' && <BannerForm />}
//           {activeTab === 'reports' && <Reports />}
//         </div>
//       </div>
//     </div>
//   );
// };

// // Offer Form Component with Product Selection
// const OfferForm = () => {
//   const [products, setProducts] = useState([{ foodItemId: '', price: '', customerType: '', minCart: '' }]);
//   const [startDate, setStartDate] = useState('');
//   const [endDate, setEndDate] = useState('');
//   const [foodItemData, setFoodItemData] = useState([]);
//   const [offers, setOffers] = useState([]);
//   const [loader, setLoader] = useState(false);
//   const [editingOffer, setEditingOffer] = useState(null);
//   const [viewingOffer, setViewingOffer] = useState(null);
//   const getOffers = async () => {
//     try {
//       const res = await axios.get('http://localhost:7013/api/admin/offers');
//       if (res.status === 200) {
//         setOffers(res.data.data);
//       }
//     } catch (error) {
//       console.error('Error fetching offers:', error);
//     }
//   };
//   // Fetch food items and offers on component mount
//   useEffect(() => {
//     const getFoodItems = async () => {
//       setLoader(true);
//       try {
//         const res = await axios.get('http://localhost:7013/api/admin/getFoodItemsUnBlocks');
//         if (res.status === 200) {
//           setFoodItemData(res.data.data);
//           setLoader(false);
//         }
//       } catch (error) {
//         setLoader(false);
//         Swal.fire({
//           title: 'Error',
//           text: 'Check your internet connection!',
//           icon: 'error',
//           confirmButtonText: 'Try Again',
//         });
//         console.error(error);
//       }
//     };

//     getFoodItems();
//     getOffers();
//   }, []);

//   const addProduct = () => {
//     setProducts([...products, { foodItemId: '', price: '', customerType: '', minCart: '' }]);
//   };

//   const handleProductChange = (index, field, value) => {
//     const newProducts = [...products];
//     newProducts[index][field] = value;
//     if (field === 'foodItemId') {
//       const selectedItem = foodItemData.find(item => item._id === value);
//       if (selectedItem) {
//         newProducts[index].price = selectedItem.foodprice || '';
//       }
//     }
//     setProducts(newProducts);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoader(true);
//     const formattedProducts = products.map(product => {
//       const selectedItem = foodItemData.find(item => item._id === product.foodItemId);
//       return {
//         foodItemId: product.foodItemId,
//         price: parseFloat(product.price),
//         customerType: parseInt(product.customerType),
//         minCart: parseFloat(product.minCart),
//         foodname: selectedItem?.foodname || '',
//         image: selectedItem?.Foodgallery[0]?.image2 || '',
//         unit: selectedItem?.unit || '',
//         quantity: selectedItem?.quantity || 1,
//         Quantity: 1,
//         gst: selectedItem?.gst || 0,
//         discount: selectedItem?.discount || 0,
//         foodcategory: selectedItem?.foodcategory || '',
//         remainingstock: selectedItem?.Remainingstock || 0,
//         totalPrice: parseFloat(product.price),
//       };
//     });

//     try {
//       let response;
//       if (editingOffer) {
//         response = await axios.put(`http://localhost:7013/api/admin/offers/${editingOffer._id}`, {
//           products: formattedProducts,
//           startDate,
//           endDate,
//         });
//         getOffers()
//         setEditingOffer(null);
//       } else {
//         response = await axios.post('http://localhost:7013/api/admin/offers', {
//           products: formattedProducts,
//           startDate,
//           endDate,
//         });
//         getOffers()
//       }
//       Swal.fire({
//         title: 'Success',
//         text: editingOffer ? 'Offer updated successfully!' : 'Offer saved successfully!',
//         icon: 'success',
//         confirmButtonText: 'OK',
//       });
//       setProducts([{ foodItemId: '', price: '', customerType: '', minCart: '' }]);
//       setStartDate('');
//       setEndDate('');
//     } catch (error) {
//       Swal.fire({
//         title: 'Error',
//         text: editingOffer ? 'Failed to update offer!' : 'Failed to save offer!',
//         icon: 'error',
//         confirmButtonText: 'Try Again',
//       });
//       console.error(error);
//     } finally {
//       setLoader(false);
//     }
//   };

//   const handleEdit = (offer) => {
//     setEditingOffer(offer);
//     setProducts(offer.products.map(p => ({
//       foodItemId: p.foodItemId,
//       price: p.price,
//       customerType: p.customerType,
//       minCart: p.minCart,
//     })));
//     setStartDate(new Date(offer.startDate).toISOString().split('T')[0]);
//     setEndDate(new Date(offer.endDate).toISOString().split('T')[0]);
//   };

//   const handleView = (offer) => {
//     setViewingOffer(offer);
//   };

//   const handleDelete = async (offerId) => {
//     const result = await Swal.fire({
//       title: 'Are you sure?',
//       text: 'This offer will be permanently deleted!',
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonText: 'Yes, delete it!',
//       cancelButtonText: 'No, cancel!',
//     });

//     if (result.isConfirmed) {
//       try {
//         await axios.delete(`http://localhost:7013/api/admin/offers/${offerId}`);
//         getOffers();
//         Swal.fire({
//           title: 'Deleted!',
//           text: 'Offer has been deleted.',
//           icon: 'success',
//           confirmButtonText: 'OK',
//         });
//       } catch (error) {
//         Swal.fire({
//           title: 'Error',
//           text: 'Failed to delete offer!',
//           icon: 'error',
//           confirmButtonText: 'Try Again',
//         });
//         console.error(error);
//       }
//     }
//   };

//   const handleCancelEdit = () => {
//     setEditingOffer(null);
//     setProducts([{ foodItemId: '', price: '', customerType: '', minCart: '' }]);
//     setStartDate('');
//     setEndDate('');
//   };

//   return (
//     <div>
//       <h3 className="card-header" style={{ backgroundColor: '#2c3e50', color: 'white' }}>
//         {editingOffer ? 'Edit Discount Offer' : 'Create Discount Offer'}
//       </h3>
//       {loader && <div className="text-center my-3"><div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div></div>}
//       <form className="p-4" onSubmit={handleSubmit}>
//         {products.map((product, index) => (
//           <div key={index} className="border p-3 mb-3 rounded">
//             <div className="mb-3">
//               <label className="form-label">Product</label>
//               <select
//                 className="form-select"
//                 value={product.foodItemId}
//                 onChange={(e) => handleProductChange(index, 'foodItemId', e.target.value)}
//                 required
//               >
//                 <option value="">Select a product</option>
//                 {foodItemData.map(item => (
//                   <option key={item._id} value={item._id}>
//                     {item.foodname} (₹{item.foodprice})
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div className="mb-3">
//               <label className="form-label">Offer Price (₹)</label>
//               <input
//                 type="number"
//                 className="form-control"
//                 value={product.price}
//                 onChange={(e) => handleProductChange(index, 'price', e.target.value)}
//                 placeholder="e.g., 1"
//                 min="0"
//                 required
//               />
//             </div>
//             <div className="mb-3">
//               <label className="form-label">Customer Type (Order Number)</label>
//               <input
//                 type="number"
//                 className="form-control"
//                 value={product.customerType}
//                 onChange={(e) => handleProductChange(index, 'customerType', e.target.value)}
//                 placeholder="e.g., 1 for 1st-time customer"
//                 min="1"
//                 required
//               />
//             </div>
//             <div className="mb-3">
//               <label className="form-label">Minimum Cart Value (₹)</label>
//               <input
//                 type="number"
//                 className="form-control"
//                 value={product.minCart}
//                 onChange={(e) => handleProductChange(index, 'minCart', e.target.value)}
//                 placeholder="e.g., 10"
//                 min="0"
//                 required
//               />
//             </div>
//           </div>
//         ))}
//         <button
//           type="button"
//           className="btn mb-3"
//           style={{ borderColor: '#ff6f00', color: '#ff6f00' }}
//           onClick={addProduct}
//           onMouseOver={(e) => {
//             e.target.style.backgroundColor = '#ff6f00';
//             e.target.style.color = 'white';
//           }}
//           onMouseOut={(e) => {
//             e.target.style.backgroundColor = 'transparent';
//             e.target.style.color = '#ff6f00';
//           }}
//         >
//           Add Another Product
//         </button>
//         <div className="mb-3">
//           <label className="form-label">Start Date</label>
//           <input
//             type="date"
//             className="form-control"
//             value={startDate}
//             onChange={(e) => setStartDate(e.target.value)}
//             required
//           />
//         </div>
//         <div className="mb-3">
//           <label className="form-label">End Date</label>
//           <input
//             type="date"
//             className="form-control"
//             value={endDate}
//             onChange={(e) => setEndDate(e.target.value)}
//             required
//           />
//         </div>
//         <div className="d-flex justify-content-end gap-2">
//           <button
//             type="button"
//             className="btn"
//             style={{ borderColor: '#6c757d', color: '#6c757d', display: editingOffer ? 'inline-block' : 'none' }}
//             onClick={handleCancelEdit}
//             onMouseOver={(e) => {
//               e.target.style.backgroundColor = '#6c757d';
//               e.target.style.color = 'white';
//             }}
//             onMouseOut={(e) => {
//               e.target.style.backgroundColor = 'transparent';
//               e.target.style.color = '#6c757d';
//             }}
//           >
//             Cancel Edit
//           </button>
//           <button
//             type="submit"
//             className="btn"
//             style={{ backgroundColor: '#f81e0f', borderColor: '#f81e0f', color: 'white' }}
//             onMouseOver={(e) => {
//               e.target.style.backgroundColor = '#ff6f00';
//               e.target.style.borderColor = '#ff6f00';
//             }}
//             onMouseOut={(e) => {
//               e.target.style.backgroundColor = '#f81e0f';
//               e.target.style.borderColor = '#f81e0f';
//             }}
//           >
//             {editingOffer ? 'Update Offer' : 'Save Offer'}
//           </button>
//         </div>
//       </form>
//       <h4 className="mt-4">Existing Offers</h4>
//       <div className="table-responsive">
//         <table className="table table-bordered table-striped">
//           <thead>
//             <tr>
//               <th>Products</th>
//               <th>Start Date</th>
//               <th>End Date</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {offers.map((offer, index) => (
//               <tr key={index}>
//                 <td>{offer.products.map(p => p.foodname).join(', ')}</td>
//                 <td>{new Date(offer.startDate).toLocaleDateString()}</td>
//                 <td>{new Date(offer.endDate).toLocaleDateString()}</td>
//                 <td>
//                   <button
//                     className="btn btn-sm btn-info me-2"
//                     onClick={() => handleView(offer)}
//                   >
//                     View
//                   </button>
//                   <button
//                     className="btn btn-sm btn-warning me-2"
//                     onClick={() => handleEdit(offer)}
//                   >
//                     Edit
//                   </button>
//                   <button
//                     className="btn btn-sm btn-danger"
//                     onClick={() => handleDelete(offer._id)}
//                   >
//                     Delete
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//       {viewingOffer && (
//         <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
//           <div className="modal-dialog">
//             <div className="modal-content">
//               <div className="modal-header">
//                 <h5 className="modal-title">Offer Details</h5>
//                 <button
//                   type="button"
//                   className="btn-close"
//                   onClick={() => setViewingOffer(null)}
//                 ></button>
//               </div>
//               <div className="modal-body">
//                 <h6>Products:</h6>
//                 <ul>
//                   {viewingOffer.products.map((p, idx) => (
//                     <li key={idx}>
//                       {p.foodname} - ₹{p.price}, Customer Type: {p.customerType}, Min Cart: ₹{p.minCart}
//                     </li>
//                   ))}
//                 </ul>
//                 <p><strong>Start Date:</strong> {new Date(viewingOffer.startDate).toLocaleDateString()}</p>
//                 <p><strong>End Date:</strong> {new Date(viewingOffer.endDate).toLocaleDateString()}</p>
//               </div>
//               <div className="modal-footer">
//                 <button
//                   type="button"
//                   className="btn btn-secondary"
//                   onClick={() => setViewingOffer(null)}
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };
const OfferManagement = () => {
  const [activeTab, setActiveTab] = useState("offer");

  return (
    <div className="container py-5" style={{ backgroundColor: "#f8f9fa" }}>
      <h1 className="text-center mb-4 fw-bold" style={{ color: "#2c3e50" }}>
        Dailydish Offer Management
      </h1>
      <ul className="nav nav-tabs mb-4 justify-content-center">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "offer" ? "active" : ""}`}
            onClick={() => setActiveTab("offer")}
            style={
              activeTab === "offer"
                ? {
                    backgroundColor: "#f81e0f",
                    color: "white",
                    borderColor: "#f81e0f",
                  }
                : { color: "#2c3e50" }
            }
          >
            Manage Offers
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "banner" ? "active" : ""}`}
            onClick={() => setActiveTab("banner")}
            style={
              activeTab === "banner"
                ? {
                    backgroundColor: "#f81e0f",
                    color: "white",
                    borderColor: "#f81e0f",
                  }
                : { color: "#2c3e50" }
            }
          >
            Manage Banners
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "reports" ? "active" : ""}`}
            onClick={() => setActiveTab("reports")}
            style={
              activeTab === "reports"
                ? {
                    backgroundColor: "#f81e0f",
                    color: "white",
                    borderColor: "#f81e0f",
                  }
                : { color: "#2c3e50" }
            }
          >
            Reports
          </button>
        </li>
      </ul>
      <div className="card shadow">
        <div className="card-body">
          {activeTab === "offer" && <OfferForm />}
          {activeTab === "banner" && <BannerForm />}
          {activeTab === "reports" && <Reports />}
        </div>
      </div>
    </div>
  );
};

// Offer Form Component with Product Selection and Hub/Location Selection
const OfferForm = () => {
  const [products, setProducts] = useState([
    { foodItemId: "", price: "", customerType: "", minCart: "" },
  ]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedHubId, setSelectedHubId] = useState("");
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [foodItemData, setFoodItemData] = useState([]);
  const [offers, setOffers] = useState([]);
  const [hubsData, setHubsData] = useState([]);
  const [loader, setLoader] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [viewingOffer, setViewingOffer] = useState(null);

  const getOffers = async () => {
    try {
      const res = await axios.get("http://localhost:7013/api/admin/offers");
      if (res.status === 200) {
        setOffers(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching offers:", error);
    }
  };

  const getHubs = async () => {
    try {
      const res = await axios.get("http://localhost:7013/api/Hub/hubs");
      if (res.status === 200) {
        setHubsData(res.data);
      }
    } catch (error) {
      console.error("Error fetching hubs:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to fetch hubs!",
        icon: "error",
        confirmButtonText: "Try Again",
      });
    }
  };

  // Fetch food items, offers, and hubs on component mount
  useEffect(() => {
    const getFoodItems = async () => {
      setLoader(true);
      try {
        const res = await axios.get(
          "http://localhost:7013/api/admin/getFoodItemsUnBlocks"
        );
        if (res.status === 200) {
          setFoodItemData(res.data.data);
          setLoader(false);
        }
      } catch (error) {
        setLoader(false);
        Swal.fire({
          title: "Error",
          text: "Check your internet connection!",
          icon: "error",
          confirmButtonText: "Try Again",
        });
        console.error(error);
      }
    };

    getFoodItems();
    getOffers();
    getHubs();
  }, []);

  const addProduct = () => {
    setProducts([
      ...products,
      { foodItemId: "", price: "", customerType: "", minCart: "" },
    ]);
  };

  const handleProductChange = (index, field, value) => {
    const newProducts = [...products];
    newProducts[index][field] = value;
    if (field === "foodItemId") {
      const selectedItem = foodItemData.find((item) => item._id === value);
      if (selectedItem) {
        newProducts[index].price = selectedItem.foodprice || "";
      }
    }
    setProducts(newProducts);
  };

  const handleHubChange = (hubId) => {
    setSelectedHubId(hubId);
    setSelectedLocations([]); // Reset locations when hub changes
  };

  const handleLocationChange = (location) => {
    setSelectedLocations((prev) => {
      if (prev.includes(location)) {
        return prev.filter((loc) => loc !== location);
      } else {
        return [...prev, location];
      }
    });
  };

  const getSelectedHub = () => {
    return hubsData.find((hub) => hub._id === selectedHubId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoader(true);

    // Validation
    if (!selectedHubId) {
      Swal.fire({
        title: "Error",
        text: "Please select a hub!",
        icon: "error",
        confirmButtonText: "OK",
      });
      setLoader(false);
      return;
    }

    if (selectedLocations.length === 0) {
      Swal.fire({
        title: "Error",
        text: "Please select at least one location!",
        icon: "error",
        confirmButtonText: "OK",
      });
      setLoader(false);
      return;
    }

    const formattedProducts = products.map((product) => {
      const selectedItem = foodItemData.find(
        (item) => item._id === product.foodItemId
      );
      return {
        foodItemId: product.foodItemId,
        price: parseFloat(product.price),
        customerType: parseInt(product.customerType),
        minCart: parseFloat(product.minCart),
        foodname: selectedItem?.foodname || "",
        image: selectedItem?.Foodgallery[0]?.image2 || "",
        unit: selectedItem?.unit || "",
        quantity: selectedItem?.quantity || 1,
        Quantity: 1,
        gst: selectedItem?.gst || 0,
        discount: selectedItem?.discount || 0,
        foodcategory: selectedItem?.foodcategory || "",
        remainingstock: selectedItem?.Remainingstock || 0,
        totalPrice: parseFloat(product.price),
      };
    });

    const selectedHub = getSelectedHub();

    try {
      let response;
      if (editingOffer) {
        response = await axios.put(
          `http://localhost:7013/api/admin/offers/${editingOffer._id}`,
          {
            products: formattedProducts,
            startDate,
            endDate,
            hubId: selectedHubId,
            hubName: selectedHub?.hubName,
            locations: selectedLocations,
          }
        );
        getOffers();
        setEditingOffer(null);
      } else {
        response = await axios.post("http://localhost:7013/api/admin/offers", {
          products: formattedProducts,
          startDate,
          endDate,
          hubId: selectedHubId,
          hubName: selectedHub?.hubName,
          locations: selectedLocations,
        });
        getOffers();
      }
      Swal.fire({
        title: "Success",
        text: editingOffer
          ? "Offer updated successfully!"
          : "Offer saved successfully!",
        icon: "success",
        confirmButtonText: "OK",
      });
      setProducts([
        { foodItemId: "", price: "", customerType: "", minCart: "" },
      ]);
      setStartDate("");
      setEndDate("");
      setSelectedHubId("");
      setSelectedLocations([]);
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: editingOffer
          ? "Failed to update offer!"
          : "Failed to save offer!",
        icon: "error",
        confirmButtonText: "Try Again",
      });
      console.error(error);
    } finally {
      setLoader(false);
    }
  };

  const handleEdit = (offer) => {
    setEditingOffer(offer);
    setProducts(
      offer.products.map((p) => ({
        foodItemId: p.foodItemId,
        price: p.price,
        customerType: p.customerType,
        minCart: p.minCart,
      }))
    );
    setStartDate(new Date(offer.startDate).toISOString().split("T")[0]);
    setEndDate(new Date(offer.endDate).toISOString().split("T")[0]);
    setSelectedHubId(offer.hubId || "");
    setSelectedLocations(offer.locations || []);
  };

  const handleView = (offer) => {
    setViewingOffer(offer);
  };

  const handleDelete = async (offerId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This offer will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:7013/api/admin/offers/${offerId}`);
        getOffers();
        Swal.fire({
          title: "Deleted!",
          text: "Offer has been deleted.",
          icon: "success",
          confirmButtonText: "OK",
        });
      } catch (error) {
        Swal.fire({
          title: "Error",
          text: "Failed to delete offer!",
          icon: "error",
          confirmButtonText: "Try Again",
        });
        console.error(error);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingOffer(null);
    setProducts([{ foodItemId: "", price: "", customerType: "", minCart: "" }]);
    setStartDate("");
    setEndDate("");
    setSelectedHubId("");
    setSelectedLocations([]);
  };

  return (
    <div>
      <h3
        className="card-header"
        style={{ backgroundColor: "#2c3e50", color: "white" }}
      >
        {editingOffer ? "Edit Discount Offer" : "Create Discount Offer"}
      </h3>
      {loader && (
        <div className="text-center my-3">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
      <form className="p-4" onSubmit={handleSubmit}>
        {/* Hub Selection */}
        <div className="border p-3 mb-3 rounded bg-light">
          <h5 className="mb-3" style={{ color: "#2c3e50" }}>
            Select Hub & Locations
          </h5>
          <div className="mb-3">
            <label className="form-label">Hub</label>
            <select
              className="form-select"
              value={selectedHubId}
              onChange={(e) => handleHubChange(e.target.value)}
              required
            >
              <option value="">Select a hub</option>
              {hubsData.map((hub) => (
                <option key={hub._id} value={hub._id}>
                  {hub.hubName} ({hub.hubId})
                </option>
              ))}
            </select>
          </div>

          {/* Location Selection */}
          {selectedHubId && (
            <div className="mb-3">
              <label className="form-label">Locations (Select multiple)</label>
              <div
                className="border rounded p-2"
                style={{ maxHeight: "200px", overflowY: "auto" }}
              >
                {getSelectedHub()?.locations?.map((location, index) => (
                  <div key={index} className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`location-${index}`}
                      checked={selectedLocations.includes(location)}
                      onChange={() => handleLocationChange(location)}
                    />
                    <label
                      className="form-check-label"
                      htmlFor={`location-${index}`}
                    >
                      {location}
                    </label>
                  </div>
                ))}
              </div>
              <small className="form-text text-muted">
                Selected: {selectedLocations.length} location(s)
              </small>
            </div>
          )}
        </div>

        {/* Product Selection */}
        {products.map((product, index) => (
          <div key={index} className="border p-3 mb-3 rounded">
            <h6 className="mb-2" style={{ color: "#2c3e50" }}>
              Product {index + 1}
            </h6>
            <div className="mb-3">
              <label className="form-label">Product</label>
              <select
                className="form-select"
                value={product.foodItemId}
                onChange={(e) =>
                  handleProductChange(index, "foodItemId", e.target.value)
                }
                required
              >
                <option value="">Select a product</option>
                {foodItemData.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.foodname} (₹{item.foodprice})
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Offer Price (₹)</label>
              <input
                type="number"
                className="form-control"
                value={product.price}
                onChange={(e) =>
                  handleProductChange(index, "price", e.target.value)
                }
                placeholder="e.g., 1"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Customer Type (Order Number)</label>
              <input
                type="number"
                className="form-control"
                value={product.customerType}
                onChange={(e) =>
                  handleProductChange(index, "customerType", e.target.value)
                }
                placeholder="e.g., 1 for 1st-time customer"
                min="1"
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Minimum Cart Value (₹)</label>
              <input
                type="number"
                className="form-control"
                value={product.minCart}
                onChange={(e) =>
                  handleProductChange(index, "minCart", e.target.value)
                }
                placeholder="e.g., 10"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          className="btn mb-3"
          style={{ borderColor: "#ff6f00", color: "#ff6f00" }}
          onClick={addProduct}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = "#ff6f00";
            e.target.style.color = "white";
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = "transparent";
            e.target.style.color = "#ff6f00";
          }}
        >
          Add Another Product
        </button>

        <div className="mb-3">
          <label className="form-label">Start Date</label>
          <input
            type="date"
            className="form-control"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">End Date</label>
          <input
            type="date"
            className="form-control"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>

        <div className="d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn"
            style={{
              borderColor: "#6c757d",
              color: "#6c757d",
              display: editingOffer ? "inline-block" : "none",
            }}
            onClick={handleCancelEdit}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "#6c757d";
              e.target.style.color = "white";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "transparent";
              e.target.style.color = "#6c757d";
            }}
          >
            Cancel Edit
          </button>
          <button
            type="submit"
            className="btn"
            style={{
              backgroundColor: "#f81e0f",
              borderColor: "#f81e0f",
              color: "white",
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "#ff6f00";
              e.target.style.borderColor = "#ff6f00";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "#f81e0f";
              e.target.style.borderColor = "#f81e0f";
            }}
          >
            {editingOffer ? "Update Offer" : "Save Offer"}
          </button>
        </div>
      </form>

      <h4 className="mt-4">Existing Offers</h4>
      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>Products</th>
              <th>Hub</th>
              <th>Locations</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {offers.map((offer, index) => (
              <tr key={index}>
                <td>{offer.products.map((p) => p.foodname).join(", ")}</td>
                <td>{offer.hubName || "N/A"}</td>
                <td>
                  {offer.locations && offer.locations.length > 0 ? (
                    <div>
                      {offer.locations.slice(0, 2).map((loc, idx) => (
                        <div key={idx} className="small text-muted">
                          {loc}
                        </div>
                      ))}
                      {offer.locations.length > 2 && (
                        <small className="text-primary">
                          +{offer.locations.length - 2} more
                        </small>
                      )}
                    </div>
                  ) : (
                    "All locations"
                  )}
                </td>
                <td>{new Date(offer.startDate).toLocaleDateString()}</td>
                <td>{new Date(offer.endDate).toLocaleDateString()}</td>
                <td>
                  <button
                    className="btn btn-sm btn-info me-2"
                    onClick={() => handleView(offer)}
                  >
                    View
                  </button>
                  <button
                    className="btn btn-sm btn-warning me-2"
                    onClick={() => handleEdit(offer)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(offer._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {viewingOffer && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 999999 }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Offer Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setViewingOffer(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6>Hub Information:</h6>
                    <p>
                      <strong>Hub:</strong> {viewingOffer.hubName || "N/A"}
                    </p>
                    <p>
                      <strong>Locations:</strong>
                    </p>
                    <ul className="list-unstyled">
                      {viewingOffer.locations &&
                      viewingOffer.locations.length > 0 ? (
                        viewingOffer.locations.map((loc, idx) => (
                          <li key={idx} className="small text-muted">
                            • {loc}
                          </li>
                        ))
                      ) : (
                        <li className="small text-muted">All locations</li>
                      )}
                    </ul>
                  </div>
                  <div className="col-md-6">
                    <h6>Products:</h6>
                    <ul>
                      {viewingOffer.products.map((p, idx) => (
                        <li key={idx} className="small">
                          {p.foodname} - ₹{p.price}
                          <br />
                          <span className="text-muted">
                            Customer Type: {p.customerType}, Min Cart: ₹
                            {p.minCart}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <p>
                  <strong>Start Date:</strong>{" "}
                  {new Date(viewingOffer.startDate).toLocaleDateString()}
                </p>
                <p>
                  <strong>End Date:</strong>{" "}
                  {new Date(viewingOffer.endDate).toLocaleDateString()}
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setViewingOffer(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
// Banner Form Component
const BannerForm = () => {
  const [banners, setBanners] = useState([
    { file: null, BannerText: "", BannerDesc: "", existingImage: "" },
  ]);
  const [existingBanners, setExistingBanners] = useState([]);
  const [bannerImages, setBannerImages] = useState([]);
  const [loader, setLoader] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [viewingBanner, setViewingBanner] = useState(null);
  const getBanners = async () => {
    try {
      const res = await axios.get("http://localhost:7013/api/admin/banners");
      if (res.status === 200) {
        setExistingBanners(res.data.getbanner);
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
    }
  };
  useEffect(() => {
    const getBannerImages = async () => {
      try {
        const res = await axios.get(
          "http://localhost:7013/api/admin/banners/images"
        );
        if (res.status === 200) {
          setBannerImages(res.data.images);
        }
      } catch (error) {
        console.error("Error fetching banner images:", error);
      }
    };
    getBanners();
    getBannerImages();
  }, []);

  const addBanner = () => {
    setBanners([
      ...banners,
      { file: null, BannerText: "", BannerDesc: "", existingImage: "" },
    ]);
  };

  const handleBannerChange = (index, field, value) => {
    const newBanners = [...banners];
    newBanners[index][field] = value;
    setBanners(newBanners);
  };

  const handleFileChange = (index, file) => {
    const newBanners = [...banners];
    newBanners[index].file = file;
    newBanners[index].existingImage = "";
    setBanners(newBanners);
  };

  const handleImageSelect = (index, imageUrl) => {
    const newBanners = [...banners];
    newBanners[index].existingImage = imageUrl;
    newBanners[index].file = null;
    setBanners(newBanners);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoader(true);

    try {
      const formDataArray = banners.map((banner) => {
        const formData = new FormData();
        if (banner.file) {
          formData.append("BannerImage", banner.file);
        }
        formData.append("BannerText", banner.BannerText);
        formData.append("BannerDesc", banner.BannerDesc);
        if (banner.existingImage) {
          formData.append("BannerImage", banner.existingImage);
        }
        return formData;
      });

      let responses;
      if (editingBanner) {
        const formData = formDataArray[0];
        responses = [
          await axios.put(
            `http://localhost:7013/api/admin/editbanner/${editingBanner._id}`,
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
            }
          ),
        ];
        getBanners();
        setEditingBanner(null);
      } else {
        responses = await Promise.all(
          formDataArray.map((formData) =>
            axios.post("http://localhost:7013/api/admin/banners", formData, {
              headers: { "Content-Type": "multipart/form-data" },
            })
          )
        );
        getBanners();
      }

      setBanners([
        { file: null, BannerText: "", BannerDesc: "", existingImage: "" },
      ]);
      Swal.fire({
        title: "Success",
        text: editingBanner
          ? "Banner updated successfully!"
          : "Banners saved successfully!",
        icon: "success",
        DotNetCore: true,
        iconColor: "#3085d6",
        dismissButton: false,
        dismissButtonLabel: "Close",
        dismissButtonColor: "#555",
        timer: 3000,
        timerProgressBar: true,
        toast: true,
        position: "top-end",
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: editingBanner
          ? "Failed to update banner!"
          : "Failed to save banners!",
        icon: "error",
        confirmButtonText: "Try Again",
      });
      console.error(error);
    } finally {
      setLoader(false);
    }
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setBanners([
      {
        file: null,
        BannerText: banner?.BannerText,
        BannerDesc: banner?.BannerDesc,
        existingImage: banner?.BannerImage,
      },
    ]);
  };

  const handleView = (banner) => {
    setViewingBanner(banner);
  };

  const handleDelete = async (bannerId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This banner will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(
          `http://localhost:7013/api/admin/Deletebanner/${bannerId}`
        );
        setExistingBanners(existingBanners.filter((b) => b._id !== bannerId));
        Swal.fire({
          title: "Deleted!",
          text: "Banner has been deleted.",
          icon: "success",
          confirmButtonText: "OK",
        });
      } catch (error) {
        Swal.fire({
          title: "Error",
          text: "Failed to delete banner!",
          icon: "error",
          confirmButtonText: "Try Again",
        });
        console.error(error);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingBanner(null);
    setBanners([
      { file: null, BannerText: "", BannerDesc: "", existingImage: "" },
    ]);
  };

  return (
    <div>
      <h3
        className="card-header"
        style={{ backgroundColor: "#2c3e50", color: "white" }}
      >
        {editingBanner ? "Edit Banner" : "Manage Banners"}
      </h3>
      {loader && (
        <div className="text-center my-3">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
      <form className="p-4" onSubmit={handleSubmit}>
        {banners.map((banner, index) => (
          <div key={index} className="border p-3 mb-3 rounded">
            <div className="mb-3">
              <label className="form-label">Upload New Banner Image</label>
              <span> (736px × 345 px)</span>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={(e) => handleFileChange(index, e.target.files[0])}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Or Select Existing Image</label>
              <select
                className="form-select"
                value={banner.existingImage}
                onChange={(e) => handleImageSelect(index, e.target.value)}
              >
                <option value="">Select an image</option>
                {bannerImages.map((image, idx) => (
                  <option key={idx} value={image}>
                    {image?.split("/").pop()}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Banner Text</label>
              <input
                type="text"
                className="form-control"
                value={banner.BannerText}
                onChange={(e) =>
                  handleBannerChange(index, "BannerText", e.target.value)
                }
                placeholder="Enter banner text"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Banner Description</label>
              <textarea
                className="form-control"
                value={banner.BannerDesc}
                onChange={(e) =>
                  handleBannerChange(index, "BannerDesc", e.target.value)
                }
                placeholder="Enter banner description"
              />
            </div>
          </div>
        ))}
        <div className="d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn mb-3"
            style={{
              borderColor: "#ff6f00",
              color: "#ff6f00",
              display: editingBanner ? "none" : "inline-block",
            }}
            onClick={addBanner}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "#ff6f00";
              e.target.style.color = "white";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "transparent";
              e.target.style.color = "#ff6f00";
            }}
          >
            Add Another Banner
          </button>
          <button
            type="button"
            className="btn mb-3"
            style={{
              borderColor: "#6c757d",
              color: "#6c757d",
              display: editingBanner ? "inline-block" : "none",
            }}
            onClick={handleCancelEdit}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "#6c757d";
              e.target.style.color = "white";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "transparent";
              e.target.style.color = "#6c757d";
            }}
          >
            Cancel Edit
          </button>
          <button
            type="submit"
            className="btn mb-3"
            style={{
              backgroundColor: "#f81e0f",
              borderColor: "#f81e0f",
              color: "white",
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "#ff6f00";
              e.target.style.borderColor = "#ff6f00";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "#f81e0f";
              e.target.style.borderColor = "#f81e0f";
            }}
          >
            {editingBanner ? "Update Banner" : "Save Banners"}
          </button>
        </div>
      </form>
      <h4 className="mt-4">Existing Banners</h4>
      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>Image</th>
              <th>Banner Text</th>
              <th>Banner Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {existingBanners?.map((banner, index) => (
              <tr key={index}>
                <td>
                  <a
                    href={banner?.BannerImage}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={banner?.BannerImage}
                      alt="Banner"
                      style={{ width: "100px", height: "auto" }}
                    />
                  </a>
                </td>
                <td>{banner?.BannerText}</td>
                <td>{banner?.BannerDesc}</td>
                <td>
                  <button
                    className="btn btn-sm btn-info me-2"
                    onClick={() => handleView(banner)}
                  >
                    View
                  </button>
                  <button
                    className="btn btn-sm btn-warning me-2"
                    onClick={() => handleEdit(banner)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(banner._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {viewingBanner && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Banner Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setViewingBanner(null)}
                ></button>
              </div>
              <div className="modal-body">
                <img
                  src={viewingBanner.BannerImage}
                  alt="Banner"
                  className="img-fluid mb-3"
                />
                <p>
                  <strong>Banner Text:</strong> {viewingBanner.BannerText}
                </p>
                <p>
                  <strong>Banner Description:</strong>{" "}
                  {viewingBanner.BannerDesc}
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setViewingBanner(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Reports Component
const Reports = () => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get(
          "http://localhost:7013/api/admin/reports"
        );
        if (response.status === 200) {
          setReports(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
        Swal.fire({
          title: "Error",
          text: "Failed to fetch reports!",
          icon: "error",
          confirmButtonText: "Try Again",
        });
      }
    };
    fetchReports();
  }, []);

  const handleExport = async () => {
    try {
      window.location.href = "http://localhost:7013/api/admin/reports/export";
      Swal.fire({
        title: "Success",
        text: "Exporting data as CSV...",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Failed to export reports!",
        icon: "error",
        confirmButtonText: "Try Again",
      });
      console.error(error);
    }
  };

  return (
    <div>
      <h3
        className="card-header"
        style={{ backgroundColor: "#2c3e50", color: "white" }}
      >
        Offer Reports
      </h3>
      <div className="p-4">
        <p className="text-muted mb-3">
          View and export data including customer name, phone number, order
          date, total orders, product purchased, cart value, and offer price.
        </p>
        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Phone</th>
                <th>Order Date</th>
                <th>Total Orders</th>
                <th>Product</th>
                <th>Location</th>
                <th>Cart Value</th>
                <th>Offer Price</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report, index) => (
                <tr key={index}>
                  <td>{report.customerName}</td>
                  <td>{report.phone}</td>
                  <td>{new Date(report.orderDate).toLocaleDateString()}</td>
                  <td>{report.totalOrders}</td>
                  <td>{report.product}</td>
                  <td>{report?.location || "N/A"}</td>
                  <td>₹{report.cartValue}</td>
                  <td>₹{report.offerPrice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="d-flex justify-content-end">
          <button
            className="btn mt-3"
            style={{
              backgroundColor: "#f81e0f",
              borderColor: "#f81e0f",
              color: "white",
            }}
            onClick={handleExport}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "#ff6f00";
              e.target.style.borderColor = "#ff6f00";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "#f81e0f";
              e.target.style.borderColor = "#f81e0f";
            }}
          >
            Export as CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfferManagement;
