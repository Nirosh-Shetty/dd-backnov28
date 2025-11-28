import React, { useState, useEffect, useMemo } from "react";
import { Button, Modal, Table, Image, Form, Spinner } from "react-bootstrap";
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { AiFillDelete } from "react-icons/ai";
import { BiSolidEdit } from "react-icons/bi";
import { BsSearch } from "react-icons/bs";
import axios from "axios";
import moment from "moment";
import ImportExcel from "./ImportExcel";
import TagsManager from './TagsManager';
import * as XLSX from "xlsx";
import DownloadIcon from "@mui/icons-material/Download";
import ReactPaginate from "react-paginate";

const Add_Products = () => {
  // Modal states
  const [show3, setShow3] = useState(false);
  const [show4, setShow4] = useState(false);
  const [show5, setShow5] = useState(false);
  const [show1, setShow1] = useState(false);
  const [show, setShow] = useState(false);
  const [show2, setShow2] = useState(false);
  const [showTagsManager, setShowTagsManager] = useState(false);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);

  // Modal handlers
  const handleClose3 = () => setShow3(false);
  const handleShow3 = () => setShow3(true);
  const handleClose4 = () => setShow4(false);
  const handleShow4 = (item) => {
    setShow4(true);
    setData1(item);
    setCategory(item?.foodcategory);
    setAggregatedPrice(item?.aggregatedprice);
    setMenuCategory(item?.menuCategory);
    setPriority(item?.Priority);
    setProductPrice(item?.foodprice);
    setTotalStock(item?.totalstock);
    setProductDesc(item?.fooddescription);
    setRemainingStock(item?.Remainingstock);
    setProductName(item?.foodname);
    setTotalAmount(item?.totalprice);
    setUnit(item?.unit);
    setLoadDate(item?.loaddate);
    setLoadTime(item?.loadtime);
    setGST(item?.gst);
    setQuantity(item?.quantity);
    setMealType(item?.foodmealtype);
    setAggregatedPrice(item?.aggregatedPrice);
  };
  const handleClose5 = () => setShow5(false);
  const handleShow5 = () => setShow5(true);
  const handleClose1 = () => setShow1(false);
  const handleShow1 = () => setShow1(true);
  const handleClose = () => setShow(false);
  const handleShow = (item) => {
    setData(item);
    setShow(true);
  };
  const handleClose2 = () => setShow2(false);
  const handleShow2 = () => setShow2(true);

  // Form data states
  const [Category, setCategory] = useState("");
  const [categoryname, setcategoryname] = useState("");
  const [ProductName, setProductName] = useState("");
  const [ProductImage, setProductImage] = useState("");
  const [ProductPrice, setProductPrice] = useState("");
  const [aggregatedPrice, setAggregatedPrice] = useState("");
  const [GST, setGST] = useState("");
  const [Priority, setPriority] = useState("");
  const [TotalAmount, setTotalAmount] = useState(0);
  const [TotalStock, setTotalStock] = useState(10);
  const [RemainingStock, setRemainingStock] = useState(10);
  const [Unit, setUnit] = useState("");
  const [Quantity, setQuantity] = useState(2);
  const [ProductDesc, setProductDesc] = useState("");
  const [LoadDate, setLoadDate] = useState("");
  const [LoadTime, setLoadTime] = useState("");
  const [MealType, setMealType] = useState("");
  const [Addproducts, setAddproducts] = useState([]);
  const [nochangedata, setNoChangeData] = useState([]);
  const [delData, setdelData] = useState("");
  const [Data, setData] = useState();
  const [Data1, setData1] = useState({});
  const [View, setView] = useState({});
  const [gstlist, setGstList] = useState([]);
  const [searchTerm, setSearchH] = useState("");
  const [categoryName, setCategoryName] = useState([]);
  const [tagsList, setTagsList] = useState([]);
  // selectedTags will hold tag id strings for simple Select multiple
  const [selectedTags, setSelectedTags] = useState([]);

  // MenuProps to limit dropdown height (from MUI example)
  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };
  const [menu, setMenu] = useState([]);
  const [menuCategory, setMenuCategory] = useState("");

  // Pagination
  const [pageNumber, setPageNumber] = useState(0);
  const usersPerPage = 6;
  const pagesVisited = pageNumber * usersPerPage;
  const pageCount = Math.ceil(Addproducts.length / usersPerPage);
  const changePage = ({ selected }) => {
    setPageNumber(selected);
  };

  // Get products
  const getAddproducts = async () => {
    try {
      setIsDataLoading(true);
      let res = await axios.get("http://localhost:7013/api/admin/getFoodItems");
      if (res.status === 200) {
        setAddproducts(res.data.data);
        setNoChangeData(res.data.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsDataLoading(false);
    }
  };

  // Get categories
  const fetchCategories = async () => {
    try {
      const res = await axios.get(
        "http://localhost:7013/api/admin/getcategory"
      );
      setCategoryName(res.data.categories);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMenuCategories = async () => {
    try {
      const res = await axios.get(
        "http://localhost:7013/api/admin/menuCategory/getmenucategory"
      );
      setMenu(res.data.categories);
    } catch (error) {
      console.error(error);
    }
  };

  // Get GST
  const getGst = async () => {
    try {
      setIsDataLoading(true);
      let res = await axios.get("http://localhost:7013/api/admin/getgst");
      if (res.status === 200) {
        setGstList(res.data.gst.reverse());
        setGST(res.data.gst.reverse()[0] || 0);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsDataLoading(false);
    }
  };

  // Get Tags
  const getTags = async () => {
    try {
      const res = await axios.get("http://localhost:7013/api/admin/food-tags");
      if (res.status === 200) setTagsList(res.data.data || []);
    } catch (error) {
      console.error('Error fetching tags', error);
    }
  };

  // Add product
  const Addproductdetails = async () => {
    try {
      if (!Category) return alert("Please Add Product Type");
      if (!ProductName) return alert("Please Add Product Name");
      if (!ProductImage) return alert("Please Add Product Image");
      if (!ProductPrice) return alert("Please Add Product Price");
      // if (!TotalStock) return alert("Please Add Product Total Stock");
      if (!Unit) return alert("Please Add Product Unit");
      if (!ProductDesc) return alert("Please Add Product Description");
      if (!categoryname) return alert("Please Add Category");
      if (!menuCategory) return alert("Please Add Menu Category");

      const allowedImageTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/gif",
      ];
      if (!allowedImageTypes.includes(ProductImage.type)) {
        return alert(
          "Invalid file type. Please upload an image (JPEG, PNG, JPG, or GIF)."
        );
      }

      const formdata = new FormData();
      formdata.append("foodcategory", Category);
      formdata.append("categoryName", categoryname);
      formdata.append("menuCategory", menuCategory);
      formdata.append("foodname", ProductName);
      formdata.append("Foodgallery", ProductImage);
      formdata.append("foodprice", ProductPrice);
      formdata.append("Priority", Priority);
      formdata.append("totalprice", TotalAmount);
      // formdata.append("totalstock", TotalStock);
      // formdata.append("Remainingstock", RemainingStock);
      formdata.append("unit", Unit);
      formdata.append("quantity", Quantity);
      formdata.append("fooddescription", ProductDesc);
      if (selectedTags && selectedTags.length > 0) {
        formdata.append('foodTags', JSON.stringify(selectedTags));
      }
      formdata.append("aggregatedPrice", aggregatedPrice);

      setIsLoading(true);
      const config = {
        url: "admin/addFoodItem",
        method: "post",
        baseURL: "http://localhost:7013/api",
        headers: { "Content-Type": "multipart/form-data" },
        data: formdata,
      };
      let res = await axios(config);
      if (res.status === 200) {
        alert("Product Added Successfully");
        handleClose3();
        await getAddproducts();
        setCategory("");
        setProductName("");
        setProductImage("");
        setProductPrice("");
        setPriority("");
        setTotalAmount(0);
        setAggregatedPrice(0);
        // setTotalStock("");
        // setRemainingStock("");
        setUnit("");
        setQuantity("");
        setProductDesc("");
        setSelectedTags([]);
      }
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.error || "Error adding product");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete product
  const deleteProduct = async () => {
    try {
      setIsLoading(true);
      let res = await axios.delete(
        `http://localhost:7013/api/admin/deleteFoodItem/${delData._id}`
      );
      if (res.status === 200) {
        alert("Product Deleted Successfully");
        handleClose5();
        await getAddproducts();
      }
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.error || "Error deleting product");
    } finally {
      setIsLoading(false);
    }
  };

  // Edit product
  const Editproducts = async (id) => {
    try {
      if (!Category) return alert("Please Add Product Type");
      if (!ProductName) return alert("Please Add Product Name");
      if (!ProductPrice) return alert("Please Add Product Price");
      // if (!TotalStock) return alert("Please Add Product Total Stock");
      if (!Unit) return alert("Please Add Product Unit");
      if (!ProductDesc) return alert("Please Add Product Description");
      // if (!categoryname) return alert("Please Add Packer Category");
      // if (!menuCategory) return alert("Please Add Menu Product Category");

      if (ProductImage) {
        const allowedImageTypes = [
          "image/jpeg",
          "image/png",
          "image/jpg",
          "image/gif",
        ];
        if (!allowedImageTypes.includes(ProductImage.type)) {
          return alert(
            "Invalid file type. Please upload an image (JPEG, PNG, JPG, or GIF)."
          );
        }
      }

      const formdata = new FormData();
      formdata.append("foodcategory", Category);
      formdata.append("categoryName", categoryname);
      formdata.append("menuCategory", menuCategory);
      formdata.append("foodname", ProductName);
      if (ProductImage) formdata.append("Foodgallery", ProductImage);
      formdata.append("foodprice", ProductPrice);
      formdata.append("Priority", Priority);
      formdata.append("totalprice", TotalAmount);
      // formdata.append("totalstock", TotalStock);
      // formdata.append("Remainingstock", RemainingStock);
      formdata.append("unit", Unit);
      formdata.append("quantity", Quantity);
      formdata.append("fooddescription", ProductDesc);
      formdata.append("aggregatedPrice", aggregatedPrice);
      formdata.append("userid", id);
      if (selectedTags && selectedTags.length > 0) {
        formdata.append('foodTags', JSON.stringify(selectedTags));
      }

      setIsLoading(true);
      const config = {
        url: `admin/updateFoodItem`,
        method: "put",
        baseURL: "http://localhost:7013/api/",
        headers: { "content-type": "multipart/form-data" },
        data: formdata,
      };

      const res = await axios(config);
      if (res.status === 200) {
        alert("Successfully updated");
        handleClose4();
        await getAddproducts();
        setProductImage("");
        setSelectedTags([]);
      }
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.error || "Error updating product");
    } finally {
      setIsLoading(false);
    }
  };

  // Block/Unblock product
  const handleBlockUnblock = async (items) => {
    try {
      setIsLoading(true);
      const config = {
        url: `/admin/toggleFoodItemStatus/${items?._id}`,
        method: "put",
        baseURL: "http://localhost:7013/api",
        headers: { "Content-Type": "application/json" },
      };
      const res = await axios(config);
      if (res.status === 200) {
        alert(
          items?.blocked === false
            ? "Successfully blocked"
            : "Successfully Unblocked"
        );
        await getAddproducts();
      }
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.error || "Error toggling status");
    } finally {
      setIsLoading(false);
    }
  };

  // const [searchTerm,setSearchH]=useState("")
  // Search filter
  const handleFilterH = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearchH(searchTerm);
    if (searchTerm !== "") {
      const filteredData = nochangedata?.filter((user) =>
        Object.values(user).some((value) =>
          String(value).toLowerCase().includes(searchTerm)
        )
      );
      setAddproducts(filteredData);
    } else {
      setAddproducts(nochangedata);
    }
  };

  // Excel download
  const downloadExcel = () => {
    const filteredRecords = Addproducts.map(
      ({
        createdAt,
        updatedAt,
        __v,
        Foodgallery,
        gst,
        foodmealtype,
        ...rest
      }) => rest
    );
    const worksheet = XLSX.utils.json_to_sheet(filteredRecords);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Table Data");
    XLSX.writeFile(workbook, "Products.xlsx");
  };

  useEffect(() => {
    getAddproducts();
    getGst();
    fetchCategories();
    getTags();
    fetchMenuCategories();
  }, []);

  // when opening edit modal, if Data1 has foodTags, preselect them as id strings
  useEffect(() => {
    if (Data1 && Data1.foodTags) {
      const arr = Data1.foodTags.map((ft) => (typeof ft === 'object' ? String(ft._id) : String(ft)));
      setSelectedTags(arr);
    }
  }, [Data1]);

  useEffect(() => {
    setTotalAmount(
      Number(ProductPrice) +
      (Number(GST?.TotalGst || 0) / 100) * Number(ProductPrice)
    );
  }, [ProductPrice, GST]);

  const [filterType, setFilterType] = useState("");
  const handleFilterType = (e) => {
    const value = e.target.value;
    setFilterType(value);
    applyFilters(searchTerm, value);
  };

  const applyFilters = (search, type) => {
    let filteredData = [...nochangedata];

    if (search) {
      filteredData = filteredData.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(search.toLowerCase())
        )
      );
    }

    if (type) {
      switch (type) {
        case "blocked":
          filteredData = filteredData.filter((item) => item.blocked);
          break;
        case "unblocked":
          filteredData = filteredData.filter((item) => !item.blocked);
          break;
        case "sold_out":
          filteredData = filteredData.filter(
            (item) => item.Remainingstock === 0
          );
          break;
        case "in_stock":
          filteredData = filteredData.filter((item) => item.Remainingstock > 0);
          break;
        default:
          break;
      }
    }

    setAddproducts(filteredData);
    setPageNumber(0);
  };

  const markAllSoldOut = async () => {
    try {
      setIsLoading(true);
      await axios.put(`http://localhost:7013/api/admin/makeSoldout`, {
        headers: { "Content-Type": "application/json" },
      });
      alert("All products marked as sold out");
      await getAddproducts();
    } catch (error) {
      console.error(error);
      alert("Error marking products as sold out");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="header-c ">Products</h2>
        <div className="d-flex gap-3 align-items-center">
          <select
            className="form-select border-dark"
            style={{ width: "200px", marginRight: "10px" }}
            onChange={handleFilterType}
            value={filterType}
          >
            <option value="">All Products</option>
            <option value="blocked">Blocked Products</option>
            <option value="unblocked">Unblocked Products</option>
            {/* <option value="sold_out">Sold Out Products</option> */}
            {/* <option value="in_stock">In Stock Products</option> */}
          </select>
          {/* <Button
      variant="warning"
      className="text-white fw-semibold"
      style={{ backgroundColor: "#ff6200", border: "none" }}
      onClick={markAllSoldOut}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Spinner animation="border" size="sm" className="me-2" />
          Marking...
        </>
      ) : (
        "Mark All Sold Out"
      )}
    </Button> */}
        </div>
      </div>

      <div className="customerhead p-2">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="col-lg-4 d-flex justify-content-center">
            <div className="input-group">
              <span className="input-group-text" id="basic-addon1">
                <BsSearch />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search..."
                aria-describedby="basic-addon1"
                onChange={handleFilterH}
              />
            </div>
          </div>
          <Button
            variant="contained"
            onClick={downloadExcel}
            style={{ border: "1px solid black" }}
          >
            Export Excel
          </Button>
          <ImportExcel />
          <Button variant="success" onClick={handleShow3}>
            + ADD
          </Button>
          <Button variant="outline-secondary" onClick={() => setShowTagsManager(true)}>Manage Tags</Button>
        </div>

        <div className="mb-3">
          {isDataLoading ? (
            <div className="text-center my-5">
              <Spinner animation="border" variant="oranged" />
              <p>Loading products...</p>
            </div>
          ) : (
            <>
              <Table
                responsive
                bordered
                style={{ width: "-webkit-fill-available" }}
              >
                <thead>
                  <tr>
                    <th>Sl. No</th>
                    <th>Load Date</th>
                    <th>Load Time</th>
                    {/* <th>Priority</th> */}
                    <th>Packer Category</th>
                    <th>Menu Category</th>
                    <th>Type</th>

                    <th>Name</th>
                    <th>Tags</th>
                    <th>Image</th>
                    <th>Unit</th>
                    <th>Description</th>
                    <th>Base Price</th>
                    <th>Aggregated Price</th>
                    {/* <th>Total Stock</th> */}
                    {/* <th>Remaining Stock</th> */}
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {Addproducts?.slice(
                    pagesVisited,
                    pagesVisited + usersPerPage
                  )?.map((items, i) => (
                    <tr key={i}>
                      <td style={{ paddingTop: "20px" }}>
                        {i + 1 + usersPerPage * pageNumber}
                      </td>
                      <td style={{ paddingTop: "20px" }}>
                        {items?.updatedAt
                          ? new Date(items.updatedAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td style={{ paddingTop: "20px" }}>
                        {items?.updatedAt
                          ? new Date(items.updatedAt).toLocaleTimeString()
                          : "N/A"}
                      </td>
                      {/* <td style={{ paddingTop: "20px" }}>{items.Priority}</td> */}
                      <td style={{ paddingTop: "20px" }}>
                        {items.categoryName}
                      </td>
                      <td style={{ paddingTop: "20px" }}>
                        {items.menuCategory}
                      </td>
                      <td style={{ paddingTop: "20px" }}>
                        {items.foodcategory}
                      </td>
                      <td style={{ paddingTop: "20px" }}>{items?.foodname}</td>
                      <td style={{ paddingTop: "20px", fontSize:"0.7rem", lineHeight:"0.9rem"  }}>
                        {items?.foodTags && items.foodTags.length > 0 ? (
                          items.foodTags.map((t, idx) => (
                            <span key={idx} style={{ display: 'inline-block', marginRight: 6, padding: '2px 6px', background: t.tagColor || '#eee', borderRadius: 6 }}>{t.tagName || t}</span>
                          ))
                        ) : (
                          <span>—</span>
                        )}
                      </td>
                      <td style={{ paddingTop: "20px" }}>
                        <div>
                          <img
                            src={`${items?.Foodgallery[0]?.image2}`}
                            alt="img"
                            style={{ width: "60px", height: "60px" }}
                          />
                        </div>
                      </td>
                      <td style={{ paddingTop: "20px" }}>{items?.unit}</td>
                      <div
                        style={{
                          maxHeight: "100px",
                          overflowY: "auto",
                          overflowX: "hidden",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {items?.fooddescription}
                      </div>
                      <td style={{ paddingTop: "20px" }}>{items?.foodprice}</td>
                      <td style={{ paddingTop: "20px" }}>
                        {items?.aggregatedPrice}
                      </td>
                      {/* <td style={{ paddingTop: "20px" }}>
                        {items?.totalstock}
                      </td>
                      <td style={{ paddingTop: "20px" }}>
                        {items?.Remainingstock}
                      </td> */}
                      <td style={{ paddingTop: "20px" }}>
                        <Button
                          variant={items?.blocked ? "success" : "danger"}
                          onClick={() => handleBlockUnblock(items)}
                          disabled={isLoading}
                        >
                          {items?.blocked ? "Unblock" : "Block"}
                        </Button>
                      </td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            gap: "20px",
                            justifyContent: "center",
                          }}
                        >
                          <BiSolidEdit
                            className="text-success"
                            style={{ cursor: "pointer", fontSize: "20px" }}
                            onClick={() => handleShow4(items)}
                          />
                          <AiFillDelete
                            className="text-danger"
                            style={{ cursor: "pointer", fontSize: "20px" }}
                            onClick={() => {
                              handleShow5();
                              setdelData(items);
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {Addproducts.length == 0 && (
                    <tr>
                      <td colSpan={14}>Not Any Products</td>
                    </tr>
                  )}
                </tbody>
              </Table>
              <div style={{ display: "flex" }} className="reactPagination">
                <p style={{ width: "100%", marginTop: "20px" }}>
                  Total Count: {Addproducts?.length}
                </p>
                <ReactPaginate
                  previousLabel={"Back"}
                  nextLabel={"Next"}
                  pageCount={pageCount}
                  onPageChange={changePage}
                  containerClassName={"paginationBttns"}
                  previousLinkClassName={"previousBttn"}
                  nextLinkClassName={"nextBttn"}
                  disabledClassName={"paginationDisabled"}
                  activeClassName={"paginationActive"}
                />
              </div>
            </>
          )}
        </div>

        {/* Add modal for Products */}
        <Modal show={show3} onHide={handleClose3} style={{ zIndex: "99999" }}>
          <Modal.Header closeButton>
            <Modal.Title>Add Products Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="row">
              <div className="do-sear mt-2">
                <label>Select Packers Category Name</label>
                <select
                  onChange={(e) => setcategoryname(e.target.value)}
                  className="form-select vi_0"
                  value={categoryname}
                >
                  <option value="">Select Category</option>
                  {categoryName.map((cat) => (
                    <option key={cat._id} value={cat.CategoryName}>
                      {cat.CategoryName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="row">
              <div className="do-sear mt-2">
                <label>Select Menu Category </label>
                <select
                  onChange={(e) => setMenuCategory(e.target.value)}
                  className="form-select vi_0"
                  value={menuCategory}
                >
                  <option value="">Select Category</option>
                  {menu.map((cat) => (
                    <option key={cat._id} value={cat.menuCategory}>
                      {cat.menuCategory}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="row">
              <div className="do-sear mt-2">
                <label>Select Type</label>
                <select
                  onChange={(e) => setCategory(e.target.value)}
                  className="vi_0"
                  value={Category}
                >
                  <option value="">Select Type</option>
                  <option value="Veg">Veg</option>
                  <option value="Nonveg">Nonveg</option>
                  <option value="Egg">Egg</option>
                </select>
              </div>
            </div>
            <div className="row">
              <div className="do-sear mt-2">
                <label>Tags</label>
                {/* simple native multi-select (keeps dropdown inside modal) */}
                <select
                  multiple
                  className="form-select"
                  value={selectedTags}
                  onChange={(e) => {
                    const vals = Array.from(e.target.selectedOptions).map((o) => o.value);
                    setSelectedTags(vals);
                  }}
                  style={{ minHeight: 120 }}
                >
                  {tagsList.map((tag) => (
                    <option key={tag._id} value={String(tag._id)}>
                      {tag.tagName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="row">
              <div className="do-sear mt-2">
                <label> Food Name</label>
                <input
                  type="text"
                  className="vi_0"
                  placeholder="Enter Food Name"
                  value={ProductName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </div>
            </div>
            {/* <div className="row">
              <div className="do-sear mt-2">
                <label>Menu Priority</label>
                <input
                  type="number"
                  className="vi_0"
                  min={0}
                  placeholder="Enter Food menu priority"
                  value={Priority}
                  onChange={(e) => setPriority(e.target.value)}
                />
              </div>
            </div> */}
            <div className="row">
              <div className="do-sear mt-2">
                <label> Food Image</label>
                <input
                  type="file"
                  multiple
                  className="vi_0"
                  onChange={(e) => setProductImage(e.target.files[0])}
                />
              </div>
            </div>
            <div className="row">
              <div className="do-sear mt-2">
                <label>Base Price</label>
                <input
                  type="number"
                  className="vi_0"
                  min={0}
                  placeholder="Enter Product Price"
                  value={ProductPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                />
              </div>
            </div>
            <div className="row">
              <div className="do-sear mt-2">
                <label>Aggregate Price</label>
                <input
                  type="number"
                  className="vi_0"
                  min={0}
                  placeholder="Enter Aggregate Product Price"
                  value={aggregatedPrice}
                  onChange={(e) => setAggregatedPrice(e.target.value)}
                />
              </div>
            </div>
            {/* <div className="row">
              <div className="do-sear mt-2">
                <label>Add Total Stock</label>
                <input
                  type="number"
                  className="vi_0"
                  placeholder="Enter Total Stock"
                  value={TotalStock}
                  onChange={(e) => setTotalStock(e.target.value)}
                />
              </div>
            </div>
            <div className="row">
              <div className="do-sear mt-2">
                <label>Add Remaining Stock</label>
                <input
                  type="number"
                  className="vi_0"
                  placeholder="Enter Remaining Stock"
                  value={RemainingStock}
                  onChange={(e) => setRemainingStock(e.target.value)}
                />
              </div>
            </div> */}
            <div className="row">
              <div className="do-sear mt-2">
                <label>Item Short Description</label>
                <input
                  type="text"
                  className="vi_0"
                  placeholder="Enter Item Short Description"
                  value={Unit}
                  onChange={(e) => setUnit(e.target.value)}
                />
              </div>
            </div>
            <div className="row">
              <div className="do-sear mt-2">
                <label> Description</label>
                <input
                  type="text"
                  className="vi_0"
                  placeholder="Enter Description"
                  value={ProductDesc}
                  onChange={(e) => setProductDesc(e.target.value)}
                />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div className="d-flex">
              <Button
                className="mx-2 modal-close-btn"
                variant=""
                onClick={handleClose3}
                disabled={isLoading}
              >
                Close
              </Button>
              <Button
                className="mx-2 modal-add-btn"
                variant=""
                onClick={Addproductdetails}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    />
                    <span className="ms-2">Adding...</span>
                  </>
                ) : (
                  "Add"
                )}
              </Button>
            </div>
          </Modal.Footer>
        </Modal>

        <Modal show={showTagsManager} onHide={() => setShowTagsManager(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Manage Food Tags</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <TagsManager />
          </Modal.Body>
        </Modal>

        {/* Edit modal for Products */}
        <Modal show={show4} onHide={handleClose4} style={{ zIndex: "99999" }}>
          <Modal.Header closeButton>
            <Modal.Title style={{ color: "black" }}>
              Edit Product Details
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="row">
              <div className="do-sear mt-2">
                <label>Select Packers Category</label>
                <select
                  onChange={(e) => setcategoryname(e.target.value)}
                  className="form-select vi_0"
                  value={categoryname}
                >
                  <option value="">{Data1?.categoryName}</option>
                  {categoryName.map((cat) => (
                    <option key={cat._id} value={cat.CategoryName}>
                      {cat.CategoryName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="row">
              <div className="do-sear mt-2">
                <label>Select Menu Category </label>
                <select
                  onChange={(e) => setMenuCategory(e.target.value)}
                  className="form-select vi_0"
                  value={menuCategory}
                >
                  <option value="">{Data1?.menuCategory}</option>
                  {menu.map((cat) => (
                    <option key={cat._id} value={cat.menuCategory}>
                      {cat.menuCategory}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="row">
              <div className="do-sear mt-2">
                <label>Select Type</label>
                <select
                  onChange={(e) => setCategory(e.target.value)}
                  className="vi_0"
                  value={Category}
                >
                  <option value="">{Data1?.foodcategory}</option>
                  <option value="Veg">Veg</option>
                  <option value="Nonveg">Nonveg</option>
                  <option value="Egg">Egg</option>
                </select>
              </div>
            </div>
            <div className="row">
              <div className="do-sear mt-2">
                <label> Food Name</label>
                <input
                  type="text"
                  className="vi_0"
                  value={ProductName}
                  placeholder={Data1?.foodname}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </div>
            </div>
            {/* <div className="row">
              <div className="do-sear mt-2">
                <label>Food Menu Priority</label>
                <input
                  type="number"
                  className="vi_0"
                  value={Priority}
                  placeholder={Data1?.Priority}
                  onChange={(e) => setPriority(e.target.value)}
                />
              </div>
            </div> */}
            <div className="row">
              <div className="do-sear mt-2">
                <label> Food Image</label>
                <input
                  type="file"
                  multiple
                  className="vi_0"
                  onChange={(e) => setProductImage(e.target.files[0])}
                />
              </div>
            </div>
            <div className="row">
              <div className="do-sear mt-2">
                <label>Base Price</label>
                <input
                  type="number"
                  className="vi_0"
                  value={ProductPrice}
                  placeholder={Data1?.foodprice}
                  onChange={(e) => setProductPrice(e.target.value)}
                />
              </div>
            </div>
            <div className="row">
              <div className="do-sear mt-2">
                <label>Aggregated Price</label>
                <input
                  type="number"
                  className="vi_0"
                  value={aggregatedPrice}
                  placeholder={Data1?.aggregatedPrice}
                  onChange={(e) => setAggregatedPrice(e.target.value)}
                />
              </div>
            </div>
            {/* <div className="row">
              <div className="do-sear mt-2">
                <label>Add Total Stock</label>
                <input
                  type="number"
                  className="vi_0"
                  value={TotalStock}
                  placeholder={Data1?.totalstock}
                  onChange={(e) => setTotalStock(e.target.value)}
                />
              </div>
            </div>
            <div className="row">
              <div className="do-sear mt-2">
                <label>Add Remaining Stock</label>
                <input
                  type="number"
                  className="vi_0"
                  value={RemainingStock}
                  placeholder={Data1?.Remainingstock}
                  onChange={(e) => setRemainingStock(e.target.value)}
                />
              </div>
            </div> */}
            <div className="row">
              <div className="do-sear mt-2">
                <label>Item Short Description</label>
                <input
                  type="text"
                  className="vi_0"
                  value={Unit}
                  placeholder={Data1?.unit}
                  onChange={(e) => setUnit(e.target.value)}
                />
              </div>
            </div>
            <div className="row">
              <div className="do-sear mt-2">
                <label> Description</label>
                <input
                  type="text"
                  className="vi_0"
                  value={ProductDesc}
                  placeholder={Data1?.fooddescription}
                  onChange={(e) => setProductDesc(e.target.value)}
                />
              </div>
            </div>
            <div className="row">
              <div className="do-sear mt-2">
                <label>Tags</label>
                {/* simple native multi-select (keeps dropdown inside modal) */}
                <select
                  multiple
                  className="form-select"
                  value={selectedTags}
                  onChange={(e) => {
                    const vals = Array.from(e.target.selectedOptions).map((o) => o.value);
                    setSelectedTags(vals);
                  }}
                  style={{ minHeight: 120 }}
                >
                  {tagsList.map((tag) => (
                    <option key={tag._id} value={String(tag._id)}>
                      {tag.tagName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant=""
              className="modal-close-btn"
              onClick={handleClose4}
              disabled={isLoading}
            >
              Close
            </Button>
            <Button
              variant=""
              className="modal-add-btn"
              onClick={() => Editproducts(Data1?._id)}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                  <span className="ms-2">Updating...</span>
                </>
              ) : (
                "Update"
              )}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Delete modal for Products */}
        <Modal show={show5} onHide={handleClose5} style={{ zIndex: "99999" }}>
          <Modal.Header closeButton>
            <Modal.Title>Warning</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="row">
              <div className="col-md-12">
                <p className="fs-4" style={{ color: "red" }}>
                  Are you sure?
                  <br /> you want to delete this data?
                </p>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant=""
              className="modal-close-btn"
              onClick={handleClose5}
              disabled={isLoading}
            >
              Close
            </Button>
            <Button
              variant=""
              className="modal-add-btn"
              onClick={deleteProduct}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                  <span className="ms-2">Deleting...</span>
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default Add_Products;
