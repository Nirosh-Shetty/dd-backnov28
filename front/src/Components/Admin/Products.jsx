// import React, { useState, useEffect } from "react";
// import { Button, Modal, Table, Image, Form } from "react-bootstrap";
// import { AiFillDelete } from "react-icons/ai";
// import { BiSolidEdit } from "react-icons/bi";
// import { BsSearch } from "react-icons/bs";
// import "../Admin/Admin.css";
// import { CKEditor } from "@ckeditor/ckeditor5-react";
// import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
// import axios from "axios";
// import parse from "html-react-parser";

// const Products = () => {
//   // Add modal product for Slider
//   const [show3, setShow3] = useState();
//   const handleClose3 = () => setShow3(false);
//   const handleShow3 = () => setShow3(true);

//   // Delet modal product for  Slider
//   const [show5, setShow5] = useState();
//   const handleClose5 = () => setShow5(false);
//   const handleShow5 = () => setShow5(true);

//   // IMAGE View  modal
//   const [View, setView] = useState({});
//   const [show1, setShow1] = useState();
//   const handleClose1 = () => setShow1(false);
//   const handleShow1 = () => setShow1(true);

//   //Delet img  modal
//   const [show, setShow] = useState();
//   const handleClose = () => setShow(false);
//   const [Data, setData] = useState();
//   const handleShow = (item) => {
//     setData(item);
//     setShow(true);
//   };

//   //Image Add modal
//   const [show2, setShow2] = useState();
//   const handleClose2 = () => setShow2(false);
//   const handleShow2 = () => setShow2(true);

//   // --------------Integration------------------

//   // Post Method
//   const [productcategory, setproductcategory] = useState("");
//   const [productsubcategory, setproductsubcategory] = useState("");
//   const [productbrand, setproductbrand] = useState("");
//   const [productname, setproductname] = useState("");
//   const [productprice, setproductprice] = useState("");
//   const [productdiscount, setproductdiscount] = useState("");
//   const [tax, settax] = useState("");
//   const [productwarrantytype, setproductwarrantytype] = useState("");
//   const [productwarranty, setproductwarranty] = useState("");
//   const [hsncode, sethsncode] = useState("");
//   const [productvolumetype, setproductvolumetype] = useState("");
//   const [productvolume, setproductvolume] = useState("");
//   const [productmodelno, setproductmodelno] = useState("");
//   const [totalstock, settotalstock] = useState("");
//   const [remainingstock, setremainingstock] = useState("");
//   const [Expirytime, setExpirytime] = useState(0);
//   const [countryorigin, setcountryorigin] = useState("");
//   const [Fssailicense, setFssailicense] = useState("");
//   const [Customercaredetails, setCustomercaredetails] = useState("");
//   const [returnpolicy, setreturnpolicy] = useState("");
//   const [sellerdetails, setsellerdetails] = useState("");
//   const [Selletfssai, setSelletfssai] = useState("");
//   const [productdesc, setproductdesc] = useState("");

//   //Image
//   const [productimage, setproductimage] = useState();

//   const Addproductdetails = async (user) => {
//     try {
//       if (!productcategory) {
//         alert("Please Add Product Category");
//       }
//       if (!productsubcategory) {
//         alert("Please Add Product Sub Category");
//       }
//       if (!productbrand) {
//         alert("Please Add Product Brand");
//       }
//       if (!productname) {
//         alert("Please Add Product Name");
//       }
//       if (!productprice) {
//         alert("Please Add Product Price");
//       }
//       if (!productdiscount) {
//         alert("Please Add Product Discount");
//       }
//       if (!tax) {
//         alert("Please Add Product Tax Price");
//       }
//       if (!productwarrantytype) {
//         alert("Please Add Product Warranty Type");
//       }
//       if (!productwarranty) {
//         alert("Please Add Product Warranty Period");
//       }
//       if (!hsncode) {
//         alert("Please Add Product HSN code");
//       }
//       if (!productvolumetype) {
//         alert("Please Add Product Product Volume Type");
//       }
//       if (!productvolume) {
//         alert("Please Add Product Volume");
//       }
//       if (!productmodelno) {
//         alert("Please Add Product Modal Number");
//       }
//       if (!totalstock) {
//         alert("Please Add Product Total Stock");
//       }
//       if (!remainingstock) {
//         alert("Please Add Product Remaining Stock");
//       }
//       if (!Expirytime) {
//         alert("Please Add Product Expiry Time");
//       }
//       if (!countryorigin) {
//         alert("Please Add Product country origin");
//       }
//       if (!Fssailicense) {
//         alert("Please Add Product Fssailicense");
//       }
//       if (!Customercaredetails) {
//         alert("Please Add Customer care details");
//       }
//       if (!returnpolicy) {
//         alert("Please Add Product return policy");
//       }
//       if (!sellerdetails) {
//         alert("Please Add Seller Details");
//       }
//       if (!Selletfssai) {
//         alert("Please Add Selletfssai");
//       }
//       if (!productdesc) {
//         alert("Please Add Product Description");
//       }

//       const formdata = new FormData();
//       formdata.append("productcategory", productcategory);
//       formdata.append("productsubcategory", productsubcategory);
//       formdata.append("productbrand", productbrand);
//       formdata.append("productname", productname);
//       formdata.append("productprice", productprice);
//       formdata.append("productdiscount", productdiscount);
//       formdata.append("tax", tax);
//       formdata.append("productwarrantytype", productwarrantytype);
//       formdata.append("productwarranty", productwarranty);
//       formdata.append("hsncode", hsncode);
//       formdata.append("productvolumetype", productvolumetype);
//       formdata.append("productvolume", productvolume);
//       formdata.append("productmodelno", productmodelno);
//       formdata.append("totalstock", totalstock);
//       formdata.append("remainingstock", remainingstock);
//       formdata.append("Expirytime", Expirytime);
//       formdata.append("countryorigin", countryorigin);
//       formdata.append("Fssailicense", Fssailicense);
//       formdata.append("Customercaredetails", Customercaredetails);
//       formdata.append("returnpolicy", returnpolicy);
//       formdata.append("sellerdetails", sellerdetails);
//       formdata.append("Selletfssai", Selletfssai);
//       formdata.append("vendor", user?.Fname);

//       //Image
//       formdata.append("productimage", productimage);

//       const config = {
//         url: "admin/admin/addproduct",
//         method: "post",
//         baseURL: "http://localhost:7013/api",
//         headers: { "Content-Type": "multipart/form-data" },
//         data: {
//           productcategory: productcategory,
//           productsubcategory: productsubcategory,
//           productbrand: productbrand,
//           productname: productname,
//           productprice: productprice,
//           productdiscount: productdiscount,
//           tax: tax,
//           productwarrantytype: productwarrantytype,
//           productwarranty: productwarranty,
//           hsncode: hsncode,
//           productvolumetype: productvolumetype,
//           productvolume: productvolume,
//           productmodelno: productmodelno,
//           totalstock: totalstock,
//           remainingstock: remainingstock,
//           Expirytime: Expirytime,
//           countryorigin: countryorigin,
//           Fssailicense: Fssailicense,
//           Customercaredetails: Customercaredetails,
//           returnpolicy: returnpolicy,
//           sellerdetails: sellerdetails,
//           Selletfssai: Selletfssai,
//           productdesc: productdesc,
//           // img
//           productimage: productimage,
//         },
//       };
//       let res = await axios(config);
//       if (res.status === 200) {
//         alert("Product Added Successfully");
//         handleClose3();
//         getAddproducts();
//         setproductcategory("");
//         setproductsubcategory("");
//         setproductbrand("");
//         setproductname("");
//         setproductprice("");
//         setproductdiscount("");
//         settax("");
//         setproductwarrantytype("");
//         setproductwarranty("");
//         sethsncode("");
//         setproductvolumetype("");
//         setproductvolume("");
//         setproductmodelno("");
//         settotalstock("");
//         setremainingstock("");
//         setExpirytime("");
//         setcountryorigin("");
//         setFssailicense("");
//         setCustomercaredetails("");
//         setreturnpolicy("");
//         setsellerdetails("");
//         setSelletfssai("");
//         setproductdesc("");
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   //integrating get method
//   const [Addproducts, setAddproducts] = useState([]);
//   const getAddproducts = async () => {
//     try {
//       let res = await axios.get(
//         "http://localhost:7013/api/admin/admin/product"
//       );
//       if (res.status === 200) {
//         setAddproducts(res.data.products);
//         setNoChangeData(res.data.products);
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   // Delete
//   const [delData, setdelData] = useState("");
//   let deleteProduct = async () => {
//     try {
//       let res = await axios.delete(
//         `http://localhost:7013/api/admin/admin/deleteproduct/${delData._id}`
//       );
//       if (res) {
//         alert(`Products Details Deleted Successfully`);
//         handleClose5();
//         getAddproducts();
//       }
//     } catch (error) {
//       alert(error.message);
//     }
//   };

//   //Edit Method
//   const [Data1, setData1] = useState({});
//   const [show4, setShow4] = useState(false);
//   const handleClose4 = () => setShow4(false);
//   const handleShow4 = (item) => {
//     setShow4(true);
//     setData1(item);
//     setproductcategory(item?.productcategory);
//     setproductsubcategory(item?.productsubcategory);
//     setproductbrand(item?.productbrand);
//     setproductname(item?.productname);
//     setproductprice(item?.productprice);
//     setproductdiscount(item?.productdiscount);
//     settax(item?.tax);
//     setproductwarrantytype(item?.productwarrantytype);
//     setproductwarranty(item?.productwarranty);
//     sethsncode(item?.hsncode);
//     setproductvolumetype(item?.productvolumetype);
//     setproductvolume(item?.productvolume);
//     setproductmodelno(item?.productmodelno);
//     settotalstock(item?.totalstock);
//     setremainingstock(item?.remainingstock);
//     setExpirytime(item?.Expirytime);
//     setcountryorigin(item?.countryorigin);
//     setFssailicense(item?.Fssailicense);
//     setCustomercaredetails(item?.Customercaredetails);
//     setreturnpolicy(item?.returnpolicy);
//     setsellerdetails(item?.sellerdetails);
//     setSelletfssai(item?.Selletfssai);
//     setproductdesc(item?.productdesc);
//   };

//   const Editproducts = async (e) => {
//     e.preventDefault();

//     try {
//       const config = {
//         url: `admin/admin/editProduct`,
//         method: "put",
//         baseURL: "http://localhost:7013/api/",
//         headers: { "Content-Type": "multipart/form-data" },
//         data: {
//           productcategory: productcategory,
//           productsubcategory: productsubcategory,
//           productbrand: productbrand,
//           productname: productname,
//           productprice: productprice,
//           productdiscount: productdiscount,
//           tax: tax,
//           productwarrantytype: productwarrantytype,
//           productwarranty: productwarranty,
//           hsncode: hsncode,
//           productvolumetype: productvolumetype,
//           productvolume: productvolume,
//           productmodelno: productmodelno,
//           totalstock: totalstock,
//           remainingstock: remainingstock,
//           Expirytime: Expirytime,
//           countryorigin: countryorigin,
//           Fssailicense: Fssailicense,
//           Customercaredetails: Customercaredetails,
//           returnpolicy: returnpolicy,
//           sellerdetails: sellerdetails,
//           Selletfssai: Selletfssai,
//           productdesc: productdesc,
//           productId: Data1?._id,
//         },
//       };

//       const res = await axios(config);

//       if (res.status === 200) {
//         alert("Successfully updated");
//         handleClose4();
//         getAddproducts();
//       }
//     } catch (error) {
//       console.log(error);
//       alert(error.response?.data?.error || "Something went wrong"); // error handling fixed
//     }
//   };

//   useEffect(() => {
//     getAddproducts();
//   }, []);

//   //Pagination
//   const [currenpage, setCurrentpage] = useState(1);
//   const recordsperpage = 10;
//   const lastIndex = currenpage * recordsperpage;
//   const firstIndex = lastIndex - recordsperpage;
//   const records = Addproducts.slice(firstIndex, lastIndex);
//   const npages = Math.ceil(Addproducts.length / recordsperpage);
//   const numbers = [...Array(npages + 1).keys()].slice(1);

//   function changePage(id) {
//     setCurrentpage(id);
//   }

//   function prevpage() {
//     if (currenpage !== firstIndex) {
//       setCurrentpage(currenpage - 1);
//     }
//   }

//   function nextpage() {
//     if (currenpage !== lastIndex) {
//       setCurrentpage(currenpage + 1);
//     }
//   }

//   // Search filter
//   const [nochangedata, setNoChangeData] = useState([]);
//   const [searchH, setSearchH] = useState("");

//   const handleFilterH = (e) => {
//     const searchTerm = e.target.value.toLowerCase();
//     setSearchH(searchTerm);
//     if (searchTerm !== "") {
//       const filteredData = nochangedata.filter((user) =>
//         Object.values(user).some((value) =>
//           String(value).toLowerCase().includes(searchTerm)
//         )
//       );
//       setAddproducts(filteredData);
//     } else {
//       setAddproducts(nochangedata);
//     }
//   };

//   //integrating get method fo Category
//   const [AddCategory, setAddCategory] = useState([]);
//   const getAddCategory = async () => {
//     try {
//       let res = await axios.get("http://localhost:7013/api/admin/getcategory");
//       if (res.status === 200) {
//         setAddCategory(res.data.getcategory);
//         setNoChangeData(res.data.getcategory);
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   useEffect(() => {
//     getAddCategory();
//   }, []);

//   //Update Image
//   const [selectedImage, setSelectedImage] = useState(null); // store the selected image
//   const handleImageEdit = (e, imageId) => {
//     setSelectedImage({ file: e.target.files[0], id: imageId });
//     handleClose2();
//   };

//   const updateImage = async (imageid) => {
//     const formData = new FormData();
//     formData.append("galleryid", imageid?._id); // the id of the image
//     formData.append("activityid", View?._id); // pass the activity/product id
//     formData.append(
//       "image",
//       selectedImage.file ? selectedImage.file : imageid?.image
//     );

//     try {
//       const response = await axios.put(
//         "http://localhost:7013/api/admin/admin/updateGalleryImages",
//         formData,
//         {
//           headers: { "Content-Type": "multipart/form-data" },
//         }
//       );
//       if (response.status === 200) {
//         alert("Image updated successfully");
//         handleClose1();
//         setSelectedImage(" ");
//         getAddproducts();

//         // Optionally refresh the product gallery here
//       }
//     } catch (error) {
//       console.error("Failed to update image", error);
//     }
//   };

//   //Delet Image
//   const deleteImage = async () => {
//     try {
//       const config = {
//         url: `http://localhost:7013/api/admin/admin/DeleteGalleryimage/${Data?._id}`,
//         method: "delete",
//         baseURL: "http://localhost:7013/api/",
//         header: { "content-type": "application/json" },
//         data: { productId: View?._id },
//       };
//       await axios(config).then((res) => {
//         if (res.status === 200) {
//           alert("Successfully Deleted");
//           handleClose();
//           handleClose1();
//           getAddproducts();
//         }
//       });
//     } catch (error) {
//       console.log(error);
//       alert(error.response.data.msg);
//     }
//   };

//   //Add GALLERY IMG
//   const Addgalleryimg = async (productid) => {
//     const formdata1 = new FormData();
//     formdata1.append("image", productimage); // Add the image file
//     formdata1.append("productid", productid?._id); // Add

//     const config = {
//       url: "/admin/admin/addgallery",
//       method: "put",
//       baseURL: "http://localhost:7013/api",
//       headers: { "Content-Type": "multipart/form-data" },
//       data: formdata1,
//     };

//     try {
//       let res = await axios(config);
//       if (res.status === 200) {
//         alert("Image Added Successfully");
//         handleClose2();
//         handleClose1();
//         getAddproducts();
//       }
//     } catch (error) {
//       console.error("Error uploading image:", error);
//       alert("Image upload failed");
//     }
//   };
//   const handleBlockUnblock = async (items) => {
//     try {
//       const config = {
//         url: `/admin/admin/Acceptorrejectproduct/${items?._id}`,
//         method: "put",
//         baseURL: "http://localhost:7013/api",
//         headers: { "Content-Type": "application/json" },
//       };

//       const res = await axios(config);
//       if (res.status === 200) {
//         alert(
//           items?.status === "approved"
//             ? "Successfully Rejected"
//             : "Successfully Accepted"
//         );
//         getAddproducts();
//       }
//     } catch (error) {
//       console.error(error);
//       alert(error?.response?.data?.error || "An error occurred.");
//     }
//   };

//   return (
//     <div>
//       <h2 className="header-c ">Products</h2>
//       <div className="customerhead p-2">
//         <div className="d-flex justify-content-between align-items-center mb-3">
//           <div className="col-lg-4 d-flex justify-content-center">
//             <div class="input-group ">
//               <span class="input-group-text" id="basic-addon1">
//                 <BsSearch />
//               </span>
//               <input
//                 type="text"
//                 class="form-control"
//                 placeholder="Search..."
//                 aria-describedby="basic-addon1"
//                 value={searchH}
//                 onChange={handleFilterH}
//               />
//             </div>
//           </div>
//           <div className="d-flex gap-3">
//             <Button variant="success" onClick={handleShow3}>
//               + Add
//             </Button>
//           </div>
//         </div>

//         <div className="mb-3">
//           <Table
//             responsive
//             bordered
//             style={{ width: "-webkit-fill-available" }}
//           >
//             <thead>
//               <tr>
//                 <th>Sl.No</th>
//                 <th> Category</th>
//                 <th> Name</th>
//                 <th> Image</th>
//                 <th> Price</th>
//                 <th> Discount</th>
//                 <th>Offer Price</th>
//                 <th>Unit</th>
//                 <th> Quantity</th>
//                 <th>Total Stock</th>
//                 <th>Remaining Stock</th>
//                 <th> Description</th>
//                 <th>Status</th>
//                 <th>Load Date</th>
//                 <th>Load Time</th>
//                 <th>Meal Type</th>

//                 <th>Action</th>
//               </tr>
//             </thead>

//             <tbody>
//             {records?.map((items, i) => {
//                 return (
//                   <tr key={i}>
//                     <td style={{ paddingTop: "20px" }}>{i + 1 + firstIndex}</td>
//                     <td style={{ paddingTop: "20px" }}>
//                       {items.productcategory}
//                     </td>
//                     <td style={{ paddingTop: "20px" }}>
//                       {items.productsubcategory}
//                     </td>
//                     <td style={{ paddingTop: "20px" }}>
//                       <div>
//                         <img
//                           src={`${items.productimage[0]?.image}`}
//                           alt="img"
//                           style={{ width: "100px", height: "60px" }}
//                         />
//                         <Button
//                           onClick={() => {
//                             handleShow1();
//                             setView(items);
//                           }}
//                           className="mt-2 mb-2"
//                           style={{ fontSize: "14px" }}
//                         >
//                           View More
//                         </Button>
//                       </div>
//                     </td>
//                     <td style={{ paddingTop: "20px" }}>{items.productname}</td>
//                     <td style={{ paddingTop: "20px" }}>{items.productbrand}</td>

//                     <td style={{ paddingTop: "20px" }}>{items.productprice}</td>
//                     <td style={{ paddingTop: "20px" }}>
//                       {items.productdiscount}
//                     </td>
//                     <td style={{ paddingTop: "20px" }}>{items.tax}</td>
//                     <td style={{ paddingTop: "20px" }}>
//                       {items.productwarrantytype}
//                     </td>
//                     <td style={{ paddingTop: "20px" }}>
//                       {items.productwarranty}
//                     </td>
//                     <td style={{ paddingTop: "20px" }}>{items.hsncode}</td>
//                     <td style={{ paddingTop: "20px" }}>
//                       {items.productvolumetype}
//                     </td>
//                     <td style={{ paddingTop: "20px" }}>
//                       {items.productvolume}
//                     </td>
//                     <td style={{ paddingTop: "20px" }}>
//                       {items.productmodelno}
//                     </td>
//                     <td style={{ paddingTop: "20px" }}>{items.totalstock}</td>
//                     <td style={{ paddingTop: "20px" }}>
//                       {items.remainingstock}{" "}
//                     </td>
//                     <td style={{ paddingTop: "20px" }}>{items.Expirytime}</td>
//                     <td style={{ paddingTop: "20px" }}>
//                       {items.countryorigin}
//                     </td>
//                     <td style={{ paddingTop: "20px" }}>{items.Fssailicense}</td>
//                     <td style={{ paddingTop: "20px" }}>
//                       {items.Customercaredetails}
//                     </td>
//                     <td style={{ paddingTop: "20px" }}>
//                       <div className="scroller">{items.returnpolicy}</div>
//                     </td>
//                     <td style={{ paddingTop: "20px" }}>
//                       <div className="scroller">{items.sellerdetails}</div>
//                     </td>
//                     <td style={{ paddingTop: "20px" }}>{items.Selletfssai}</td>

//                     <td style={{ paddingTop: "20px" }}>
//                       <div className="scroller">{items.productdesc}</div>
//                     </td>

//                     <td style={{ paddingTop: "20px" }}>
//                       {items?.status === "approved" ? (
//                         <Button onClick={() => handleBlockUnblock(items)}>
//                           Accepted
//                         </Button>
//                       ) : (
//                         <Button
//                           variant="danger"
//                           onClick={() => handleBlockUnblock(items)}
//                         >
//                           Pending
//                         </Button>
//                       )}
//                     </td>
//                     <td>
//                       {" "}
//                       <div
//                         style={{
//                           display: "flex",
//                           gap: "20px",
//                           justifyContent: "center",
//                         }}
//                       >
//                         <div>
//                           <BiSolidEdit
//                             className="text-success"
//                             style={{ cursor: "pointer", fontSize: "20px" }}
//                             onClick={() => {
//                               handleShow4(items);
//                               setData1(items);
//                             }}
//                           />{" "}
//                         </div>
//                         <div>
//                           <AiFillDelete
//                             className="text-danger"
//                             style={{ cursor: "pointer", fontSize: "20px" }}
//                             onClick={() => {
//                               handleShow5();
//                               setdelData(items);
//                             }}
//                           />
//                         </div>
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </Table>

//           <div>
//             <nav>
//               <ul className="pagination">
//                 <li className="not-allow">
//                   <span>
//                     <li className="next-prev">
//                       <a
//                         onClick={() => {
//                           prevpage();
//                         }}
//                       >
//                         &lt;
//                       </a>{" "}
//                     </li>
//                   </span>
//                 </li>
//                 {numbers?.map((n, i) => {
//                   return (
//                     <li className="active-next" key={i}>
//                       <a
//                         href="#"
//                         className="inactive"
//                         onClick={() => changePage(n)}
//                       >
//                         {n}
//                       </a>
//                     </li>
//                   );
//                 })}

//                 <li className="not-allow">
//                   <span>
//                     <li
//                       className="next-prev"
//                       onClick={() => {
//                         nextpage();
//                       }}
//                     >
//                       &gt;{" "}
//                     </li>
//                   </span>
//                 </li>
//               </ul>
//             </nav>
//           </div>
//         </div>

//         {/* Add Package modal for Products */}
//         <Modal show={show3} onHide={handleClose3} style={{ zIndex: "99999" }}>
//           <Modal.Header closeButton>
//             <Modal.Title>Add Products Details</Modal.Title>
//           </Modal.Header>
//           <Modal.Body>
//             <div className="row">
//               <div className="do-sear mt-2">
//                 <label>Add Category Name </label>
//                 <select
//                   name=""
//                   id=""
//                   onChange={(e) => setproductcategory(e.target.value)}
//                   className="vi_0"
//                 >
//                   <option value="">Select Category</option>
//                   {AddCategory?.map((item) => {
//                     return (
//                       <option value={item.CategoryName}>
//                         {item.CategoryName}
//                       </option>
//                     );
//                   })}
//                 </select>
//               </div>
//             </div>

//             <div className="row">
//               <div className="do-sear mt-2">
//                 <label>Add Sub Category Name </label>
//                 <select
//                   name=""
//                   id=""
//                   onChange={(e) => setproductsubcategory(e.target.value)}
//                   className="vi_0"
//                 >
//                   <option value="">Select Sub Category</option>
//                   {AddCategory?.map((item) => {
//                     return (
//                       <option value={item.SubcatName}>{item.SubcatName}</option>
//                     );
//                   })}
//                 </select>
//               </div>
//             </div>

//             <div className="row">
//               <div className="do-sear mt-2">
//                 <label>Add Product Image</label>
//                 <input
//                   type="file"
//                   id=""
//                   name=""
//                   multiple
//                   className="vi_0"
//                   onChange={(e) => setproductimage(e.target.files)}
//                 />
//               </div>
//             </div>

//             <div className="row">
//               <div className="do-sear mt-2">
//                 <label>Product Brands</label>
//                 <input
//                   type="text"
//                   className="vi_0"
//                   placeholder="Enter Brand Name"
//                   onChange={(e) => setproductbrand(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div className="row">
//               <div className="do-sear mt-2">
//                 <label>Add Product Name</label>
//                 <input
//                   type="text"
//                   name=""
//                   className="vi_0"
//                   placeholder="Enter Product Name"
//                   onChange={(e) => setproductname(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div className="row">
//               <div className="do-sear mt-2">
//                 <label>Add Product Price</label>
//                 <input
//                   type="number"
//                   className="vi_0"
//                   placeholder="Enter Product Price"
//                   onChange={(e) => setproductprice(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div className="row">
//               <div className="do-sear mt-2">
//                 <label>Add Product Discount</label>
//                 <input
//                   type="number"
//                   className="vi_0"
//                   placeholder="Enter Product Discount"
//                   onChange={(e) => setproductdiscount(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div className="row">
//               <div className="do-sear mt-2">
//                 <label>Add Tax</label>
//                 <input
//                   type="number"
//                   className="vi_0"
//                   placeholder="Enter Tax"
//                   onChange={(e) => settax(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div className="row">
//               <div className="do-sear mt-2">
//                 <label>Add Product Warranty Type (Months / Year) </label>
//                 <input
//                   type="text"
//                   className="vi_0"
//                   placeholder="Enter Product Warranty Type"
//                   onChange={(e) => setproductwarrantytype(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div className="row">
//               <div className="do-sear mt-2">
//                 <label>Add Product Warranty (Number)</label>
//                 <input
//                   type="number"
//                   className="vi_0"
//                   placeholder="Enter Product Warranty"
//                   onChange={(e) => setproductwarranty(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div className="row">
//               <div className="do-sear mt-2">
//                 <label>Add Hsn Code</label>
//                 <input
//                   type="number"
//                   className="vi_0"
//                   placeholder="Enter Hsn Code"
//                   onChange={(e) => sethsncode(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div className="row">
//               <div className="do-sear mt-2">
//                 <label>Add Product Volume Type (gram,kg,pieces)</label>
//                 <input
//                   type="text"
//                   className="vi_0"
//                   placeholder="Enter Product Volume Type"
//                   onChange={(e) => setproductvolumetype(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div className="row">
//               <div className="do-sear mt-2">
//                 <label>Add Product Volume (Number)</label>
//                 <input
//                   type="number"
//                   className="vi_0"
//                   placeholder="Enter Product Volume"
//                   onChange={(e) => setproductvolume(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div className="row">
//               <div className="do-sear mt-2">
//                 <label>Add Product Model No</label>
//                 <input
//                   type="number"
//                   className="vi_0"
//                   placeholder="Enter Product Model No"
//                   onChange={(e) => setproductmodelno(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div className="row">
//               <div className="do-sear mt-2">
//                 <label>Add Total Stock</label>
//                 <input
//                   type="number"
//                   className="vi_0"
//                   placeholder="Enter Total Stock"
//                   onChange={(e) => settotalstock(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div className="row">
//               <div className="do-sear mt-2">
//                 <label>Add Remaining Stock</label>
//                 <input
//                   type="number"
//                   className="vi_0"
//                   placeholder="Enter Remaining Stock"
//                   onChange={(e) => setremainingstock(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div className="row">
//               <div className="do-sear mt-2">
//                 <label>Add Expiry Time</label>
//                 <input
//                   type="month"
//                   className="vi_0"
//                   placeholder="Enter Expiry Time"
//                   onChange={(e) => setExpirytime(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div className="row">
//               <div className="do-sear mt-2">
//                 <label>Add Country Origin</label>
//                 <input
//                   type="text"
//                   className="vi_0"
//                   placeholder="Enter Country Origin"
//                   onChange={(e) => setcountryorigin(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div className="row">
//               <div className="do-sear mt-2">
//                 <label>Add Fssai license</label>
//                 <input
//                   type="text"
//                   className="vi_0"
//                   placeholder="Enter Fssai license"
//                   onChange={(e) => setFssailicense(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div className="row">
//               <div className="do-sear mt-2">
//                 <label>Add Customer Care details</label>
//                 <input
//                   type="number"
//                   className="vi_0"
//                   placeholder="Enter Customer Care details"
//                   onChange={(e) => setCustomercaredetails(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div className="row">
//               <div className="do-sear mt-2">
//                 <label>Add Return Policy</label>
//                 <input
//                   type="text"
//                   className="vi_0"
//                   placeholder="Enter Return Policy"
//                   onChange={(e) => setreturnpolicy(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div className="row">
//               <div className="do-sear mt-2">
//                 <label>Add Seller Details</label>
//                 <input
//                   type="text"
//                   className="vi_0"
//                   placeholder="Enter Seller Details"
//                   onChange={(e) => setsellerdetails(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div className="row">
//               <div className="do-sear mt-2">
//                 <label>Add Selletfssai</label>
//                 <input
//                   type="text"
//                   className="vi_0"
//                   placeholder="Enter Selletfssai"
//                   onChange={(e) => setSelletfssai(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div className="row">
//               <div className="do-sear mt-2">
//                 <label>Add Product Description</label>
//                 <input
//                   type="text"
//                   className="vi_0"
//                   placeholder="Enter Product Description"
//                   onChange={(e) => setproductdesc(e.target.value)}
//                 />
//               </div>
//             </div>
//           </Modal.Body>
//           <Modal.Footer>
//             <div className="d-flex">
//               <Button
//                 className="mx-2 modal-close-btn"
//                 variant=""
//                 onClick={handleClose3}
//               >
//                 Close
//               </Button>
//               <Button
//                 className="mx-2 modal-add-btn"
//                 variant=""
//                 onClick={Addproductdetails}
//               >
//                 Add
//               </Button>
//             </div>
//           </Modal.Footer>
//         </Modal>

//         {/* Edit Package modal for Products */}
//         <Modal
//           show={show4}
//           onHide={handleClose4}
//           backdrop="static"
//           keyboard={false}
//           style={{ zIndex: "99999" }}
//         >
//           <Modal.Header closeButton>
//             <Modal.Title style={{ color: "black" }}>
//               Edit Grocery Products
//             </Modal.Title>
//           </Modal.Header>
//           <Modal.Body>
//             <div className="row">
//               <div className="do-sear mt-2">
//                 <label>Edit Category Name </label>
//                 <select
//                   name=""
//                   id=""
//                   onChange={(e) => setproductcategory(e.target.value)}
//                   className="vi_0"
//                 >
//                   <option value="">Select Category</option>
//                   {AddCategory?.map((item) => {
//                     return (
//                       <option value={item.CategoryName}>
//                         {item.CategoryName}
//                       </option>
//                     );
//                   })}
//                 </select>
//               </div>
//             </div>

//             <div className="row">
//               <div className="do-sear mt-2">
//                 <label>Edit Sub Category Name </label>
//                 <select
//                   name=""
//                   id=""
//                   onChange={(e) => setproductsubcategory(e.target.value)}
//                   className="vi_0"
//                 >
//                   <option value="">Select Sub Category</option>
//                   {AddCategory?.map((item) => {
//                     return (
//                       <option value={item.SubcatName}>{item.SubcatName}</option>
//                     );
//                   })}
//                 </select>
//               </div>
//             </div>

//             <div className="row">
//               <div className="do-sear mt-2">
//                 <label>Edit Product Image</label>
//                 <input
//                   type="file"
//                   id=""
//                   name=""
//                   multiple
//                   className="vi_0"
//                   onChange={(e) => setproductimage(e.target.files)}
//                 />
//               </div>
//             </div>

//             <div className="row">
//               <div className="do-sear mt-2">
//                 <label>Edit Product Brands</label>
//                 <input
//                   type="text"
//                   className="vi_0"
//                   value={productbrand}
//                   placeholder={Data1?.productbrand}
//                   onChange={(e) => setproductbrand(e.target.value)}
//                 />
//               </div>
//             </div>
//             <div className="row">
//               <div className="do-sear mt-2">
//                 <label>Edit Product Name</label>
//                 <input
//                   type="text"
//                   name=""
//                   id=""
//                   value={productname}
//                   placeholder={Data1?.productname}
//                   className="vi_0"
//                   onChange={(e) => setproductname(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div className="row">
//               <div className="do-sear mt-2">
//                 <label>Edit Product Price</label>
//                 <input
//                   type="number"
//                   className="vi_0"
//                   value={productprice}
//                   placeholder={Data1?.productprice}
//                   onChange={(e) => setproductprice(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div className="row">
//               <div className="do-sear mt-2">
//                 <label>Edit Product Discount</label>
//                 <input
//                   type="number"
//                   className="vi_0"
//                   value={productdiscount}
//                   placeholder={Data1?.productdiscount}
//                   onChange={(e) => setproductdiscount(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div className="row">
//               <div className="do-sear mt-2">
//                 <label>Edit Tax</label>
//                 <input
//                   type="number"
//                   className="vi_0"
//                   value={tax}
//                   placeholder={Data1?.tax}
//                   onChange={(e) => settax(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div className="row">
//               <div className="do-sear mt-2">
//                 <label>Edit Product Warranty Type</label>
//                 <input
//                   type="text"
//                   className="vi_0"
//                   value={productwarrantytype}
//                   placeholder={Data1?.productwarrantytype}
//                   onChange={(e) => setproductwarrantytype(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div className="row">
//               <div className="do-sear mt-2">
//                 <label>Edit Product Warranty</label>
//                 <input
//                   type="number"
//                   className="vi_0"
//                   value={productwarranty}
//                   placeholder={Data1?.productwarranty}
//                   onChange={(e) => setproductwarranty(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div className="row">
//               <div className="do-sear mt-2">
//                 <label>Edit Hsn Code</label>
//                 <input
//                   type="number"
//                   className="vi_0"
//                   value={hsncode}
//                   placeholder={Data1?.hsncode}
//                   onChange={(e) => sethsncode(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div className="row">
//               <div className="do-sear mt-2">
//                 <label>Edit Product Volume Type (gram,kg,pieces)</label>
//                 <input
//                   type="text"
//                   className="vi_0"
//                   value={productvolumetype}
//                   placeholder={Data1?.productvolumetype}
//                   onChange={(e) => setproductvolumetype(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div className="row">
//               <div className="do-sear mt-2">
//                 <label>Edit Product Volume</label>
//                 <input
//                   type="number"
//                   className="vi_0"
//                   value={productvolume}
//                   placeholder={Data1?.productvolume}
//                   onChange={(e) => setproductvolume(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div className="row">
//               <div className="do-sear mt-2">
//                 <label>Edit Product Model No</label>
//                 <input
//                   type="number"
//                   className="vi_0"
//                   value={productmodelno}
//                   placeholder={Data1?.productmodelno}
//                   onChange={(e) => setproductmodelno(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div className="row">
//               <div className="do-sear mt-2">
//                 <label>Edit Total Stock</label>
//                 <input
//                   type="number"
//                   className="vi_0"
//                   value={totalstock}
//                   placeholder={Data1?.totalstock}
//                   onChange={(e) => settotalstock(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div className="row">
//               <div className="do-sear mt-2">
//                 <label>Edit Remaining Stock</label>
//                 <input
//                   type="number"
//                   className="vi_0"
//                   value={remainingstock}
//                   placeholder={Data1?.remainingstock}
//                   onChange={(e) => setremainingstock(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div className="row">
//               <div className="do-sear mt-2">
//                 <label>Edit Expiry Time</label>
//                 <input
//                   type="month"
//                   className="vi_0"
//                   value={Expirytime}
//                   placeholder={Data1?.Expirytime}
//                   onChange={(e) => setExpirytime(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div className="row">
//               <div className="do-sear mt-2">
//                 <label>Edit Country Origin</label>
//                 <input
//                   type="text"
//                   className="vi_0"
//                   placeholder={Data1?.countryorigin}
//                   value={countryorigin}
//                   onChange={(e) => setcountryorigin(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div className="row">
//               <div className="do-sear mt-2">
//                 <label>Edit Fssai license</label>
//                 <input
//                   type="text"
//                   className="vi_0"
//                   value={Fssailicense}
//                   placeholder={Data1?.Fssailicense}
//                   onChange={(e) => setFssailicense(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div className="row">
//               <div className="do-sear mt-2">
//                 <label>Edit Customer Care details</label>
//                 <input
//                   type="number"
//                   className="vi_0"
//                   value={Customercaredetails}
//                   placeholder={Data1?.Customercaredetails}
//                   onChange={(e) => setCustomercaredetails(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div className="row">
//               <div className="do-sear mt-2">
//                 <label>Edit Return Policy</label>
//                 <input
//                   type="text"
//                   className="vi_0"
//                   value={returnpolicy}
//                   placeholder={Data1?.returnpolicy}
//                   onChange={(e) => setreturnpolicy(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div className="row">
//               <div className="do-sear mt-2">
//                 <label>Edit Seller Details</label>
//                 <input
//                   type="text"
//                   className="vi_0"
//                   value={sellerdetails}
//                   placeholder={Data1?.sellerdetails}
//                   onChange={(e) => setsellerdetails(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div className="row">
//               <div className="do-sear mt-2">
//                 <label>Edit Selletfssai</label>
//                 <input
//                   type="text"
//                   className="vi_0"
//                   value={Selletfssai}
//                   placeholder={Data1?.Selletfssai}
//                   onChange={(e) => setSelletfssai(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div className="row">
//               <div className="do-sear mt-2">
//                 <label>Edit Product Description</label>
//                 <input
//                   type="text"
//                   className="vi_0"
//                   value={productdesc}
//                   placeholder={Data1?.productdesc}
//                   onChange={(e) => setproductdesc(e.target.value)}
//                 />
//               </div>
//             </div>
//           </Modal.Body>
//           <Modal.Footer>
//             <Button
//               variant=""
//               className="modal-close-btn"
//               onClick={handleClose4}
//             >
//               Close
//             </Button>
//             <Button variant="" className="modal-add-btn" onClick={Editproducts}>
//               Update
//             </Button>
//           </Modal.Footer>
//         </Modal>

//         {/*Delet Package modal for Products */}
//         <Modal
//           show={show5}
//           onHide={handleClose5}
//           backdrop="static"
//           keyboard={false}
//           style={{ zIndex: "99999" }}
//         >
//           <Modal.Header closeButton>
//             <Modal.Title>Warning</Modal.Title>
//           </Modal.Header>
//           <Modal.Body>
//             <div className="row">
//               <div className="col-md-12">
//                 <p className="fs-4" style={{ color: "red" }}>
//                   Are you sure?
//                   <br /> you want to delete this data?
//                 </p>
//               </div>
//             </div>
//           </Modal.Body>
//           <Modal.Footer>
//             <Button
//               variant=""
//               className="modal-close-btn"
//               onClick={handleClose5}
//             >
//               Close
//             </Button>
//             <Button variant="" className="modal-add-btn" onClick={handleClose5}>
//               Delete
//             </Button>
//           </Modal.Footer>
//         </Modal>
//       </div>
//     </div>
//   );
// };

// export default Products;
