import React, { useState, useEffect } from "react";
import { Button, Modal, Table, Image } from "react-bootstrap";
import { AiFillDelete } from "react-icons/ai";
import { BiSolidEdit } from "react-icons/bi";
import { BsSearch } from "react-icons/bs";
import "../Admin/Admin.css";
import axios from "axios";

const Category = () => {
  // Add modal for Banner
  const [show3, setShow3] = useState();
  const handleClose3 = () => setShow3(false);
  const handleShow3 = () => setShow3(true);

  // Edit modal for  Banner
  const [show4, setShow4] = useState();
  const handleClose4 = () => setShow4(false);
  // Delet modal for  Banner
  const [show5, setShow5] = useState();
  const handleClose5 = () => setShow5(false);
  const handleShow5 = () => setShow5(true);

  // ======INTEGRATION=======//

  // integrating post method
  const formdata = new FormData();
  const [SubcatImage, setSubcatImage] = useState("");
  const [CategoryName, setCategoryName] = useState("");
  const [SubcatName, setSubcatName] = useState("");

  const AddCategorydetails = async () => {
    formdata.append("SubcatImage", SubcatImage);
    formdata.append("CategoryName", CategoryName);
    formdata.append("SubcatName", SubcatName);

    try {
      if (!CategoryName) {
        return alert("Please Select Category Name");
      }

      if (!SubcatImage) {
        return alert("Please add Sub Category Image");
      }

      if (!SubcatName) {
        return alert("Please add Sub Category Name");
      }
      const config = {
        url: "/admin/category",
        method: "post",
        baseURL: "http://localhost:7013/api",
        header: { "content-type": "multipart/form-data" },
        data: formdata,
      };
      let res = await axios(config);
      if (res.status === 200) {
        alert(res.data.success);
        getAddCategory();
        handleClose3();
        setSubcatImage("");
        setCategoryName("");
        setSubcatName("");
      }
    } catch (error) {
      console.log(error);
      alert(error.response.data.msg);
    }
  };
  //integrating get  method
  const [AddCategory, setAddCategory] = useState([]);
  const getAddCategory = async () => {
    try {
      let res = await axios.get("http://localhost:7013/api/admin/getcategory");
      if (res.status === 200) {
        setAddCategory(res.data.getcategory);
        setNoChangeData(res.data.getcategory);
      }
    } catch (error) {
      console.log(error);
    }
  };

  //delete method
  const [Data, setData] = useState("");
  const DeleteCategory = async () => {
    try {
      const config = {
        url: "admin/Deletecategory/" + Data,
        method: "delete",
        baseURL: "http://localhost:7013/api/",
        header: { "content-type": "application/json" },
      };
      await axios(config).then((res) => {
        if (res.status === 200) {
          alert("Successfully Delete");
          getAddCategory();
          handleClose5();
        }
      });
    } catch (error) {
      console.log(error);
      alert(error.response.data.msg);
    }
  };

  //update method
  const [Data1, setData1] = useState("");
  const handleShow4 = (items) => {
    setShow4(true);
    setData1(items);
    setSubcatImage(items?.SubcatImage);
    setCategoryName(items?.CategoryName);
    setSubcatName(items?.SubcatName);
  };

  const EditCategory = async (e) => {
    e.preventDefault();
    formdata.append("SubcatImage", SubcatImage);
    formdata.append("CategoryName", CategoryName);
    formdata.append("SubcatName", SubcatName);
    formdata.append("id", Data1?._id);
    try {
      const config = {
        url: "admin/editcategory",
        method: "put",
        baseURL: "http://localhost:7013/api/",
        header: { "content-type": "multipart/form-data" },
        data: formdata,
      };
      await axios(config).then((res) => {
        if (res.status === 200) {
          alert("successfully Update");
          handleClose4();
          getAddCategory();
        }
      });
    } catch (error) {
      console.log(error);
      alert(error.response.data.error);
    }
  };

  useEffect(() => {
    getAddCategory();
  }, []);

  //Pagination
  const [currenpage, setCurrentpage] = useState(1);
  const recordsperpage = 5;
  const lastIndex = currenpage * recordsperpage;
  const firstIndex = lastIndex - recordsperpage;
  const records = AddCategory.slice(firstIndex, lastIndex);
  const npages = Math.ceil(AddCategory.length / recordsperpage);
  const numbers = [...Array(npages + 1).keys()].slice(1);

  function changePage(id) {
    setCurrentpage(id);
  }

  function prevpage() {
    if (currenpage !== firstIndex) {
      setCurrentpage(currenpage - 1);
    }
  }

  function nextpage() {
    if (currenpage !== lastIndex) {
      setCurrentpage(currenpage + 1);
    }
  }

  // Search filter
  const [nochangedata, setNoChangeData] = useState([]);
  const [searchH, setSearchH] = useState("");

  const handleFilterH = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearchH(searchTerm);
    if (searchTerm !== "") {
      const filteredData = nochangedata.filter((user) =>
        Object.values(user).some((value) =>
          String(value).toLowerCase().includes(searchTerm)
        )
      );
      setAddCategory(filteredData);
    } else {
      setAddCategory(nochangedata);
    }
  };

  return (
    <div>
      <div>
        <div className="col-lg-4 d-flex justify-content-center">
          <div class="input-group ">
            <span class="input-group-text" id="basic-addon1">
              <BsSearch />
            </span>
            <input
              type="text"
              class="form-control"
              placeholder="Search..."
              aria-describedby="basic-addon1"
              value={searchH}
              onChange={handleFilterH}
            />
          </div>
        </div>
        <div className="customerhead p-2">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="header-c ">Delivary Location List</h2>
            <div className="d-flex gap-3">
              <button className="admin-add-btn" onClick={handleShow3}>
                Add Delivary Location
              </button>
            </div>
          </div>

          <div className="mb-3">
            <Table
              responsive
              bordered
              style={{ width: "-webkit-fill-available" }}
            >
              <thead>
                <tr>
                  <th>Sl.No</th>
                  <th>Location Type</th>
                  <th>Apartment Name</th>
                  <th>Prefix Code</th>
                  <th>Delivery Type</th>
                  <th>Approximate Delivery Time</th>
                  <th>Delivery Charge </th>

                  {/* <th>Sub Category Image</th>
                  <th>Sub Category Name</th> */}
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {/* {records?.map((items, i) => {
                  return ( */}
                <tr>
                  <td style={{ paddingTop: "20px" }}>1</td>
                  <td style={{ paddingTop: "20px" }}>Apartment</td>
                  <td style={{ paddingTop: "20px" }}>Apartment name</td>
                  <td style={{ paddingTop: "20px" }}>Prefix Code</td>
                  <td style={{ paddingTop: "20px" }}>Door</td>
                  <td style={{ paddingTop: "20px" }}>30 mins</td>
                  <td style={{ paddingTop: "20px" }}>30</td>

                  {/* <td>
                        <Image
                          src={`http://localhost:7013/Category/${items?.SubcatImage}`}
                          alt="pic"
                          style={{ width: "75px", height: "75px" }}
                        />
                      </td>
                      <td style={{ paddingTop: "20px" }}>{items.SubcatName}</td> */}

                  <td>
                    {" "}
                    <div
                      style={{
                        display: "flex",
                        gap: "20px",
                        justifyContent: "center",
                      }}
                    >
                      <div>
                        <BiSolidEdit
                          className="text-success"
                          style={{ cursor: "pointer", fontSize: "20px" }}
                          onClick={() => {
                            handleShow4();
                            // setData1(items);
                          }}
                        />{" "}
                      </div>
                      <div>
                        <AiFillDelete
                          className="text-danger"
                          style={{ cursor: "pointer", fontSize: "20px" }}
                          onClick={() => {
                            handleShow5();
                            // setData(items?._id);
                          }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
                {/* );
                })} */}
              </tbody>
            </Table>

            <div>
              <nav>
                <ul className="pagination">
                  <li className="not-allow">
                    <span>
                      <li className="next-prev">
                        <a
                          onClick={() => {
                            prevpage();
                          }}
                        >
                          &lt;
                        </a>{" "}
                      </li>
                    </span>
                  </li>
                  {numbers?.map((n, i) => {
                    return (
                      <li className="active-next" key={i}>
                        <a
                          href="#"
                          className="inactive"
                          onClick={() => changePage(n)}
                        >
                          {n}
                        </a>
                      </li>
                    );
                  })}

                  <li className="not-allow">
                    <span>
                      <li
                        className="next-prev"
                        onClick={() => {
                          nextpage();
                        }}
                      >
                        &gt;{" "}
                      </li>
                    </span>
                  </li>
                </ul>
              </nav>
            </div>
          </div>

          {/* Add Package modal for Category */}
          <Modal show={show3} onHide={handleClose3} style={{ zIndex: "99999" }}>
            <Modal.Header closeButton>
              <Modal.Title>Add Delivary Location</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="row">
                <div className="do-sear mt-2">
                  <label>Select Location Type</label>
                  <select
                    name=""
                    id=""
                    className="vi_0"
                    onChange={(e) => setCategoryName(e.target.value)}
                  >
                    <option value="">Select Location Type</option>
                    <option value="veg">Apartment</option>
                    <option value="nonveg">Corporate</option>
                  </select>
                </div>
              </div>

              <div className="row">
                <div className="do-sear mt-2">
                  <label>Add Apartment Name</label>
                  <input
                    type="text"
                    className="vi_0"
                    placeholder="Enter Apartment Name"
                    // onChange={(e) => setSubcatName(e.target.value)}
                  />
                </div>
              </div>

              <div className="row">
                <div className="do-sear mt-2">
                  <label>Add Prefix Code</label>
                  <input
                    type="text"
                    className="vi_0"
                    placeholder="Enter Prefix Code"
                    // onChange={(e) => setSubcatName(e.target.value)}
                  />
                </div>
              </div>

              <div className="row">
                <div className="do-sear mt-2">
                  <label>Select Delivary Type</label>
                  <select
                    name=""
                    id=""
                    className="vi_0"
                    onChange={(e) => setCategoryName(e.target.value)}
                  >
                    <option value="">Select Delivary Type</option>
                    <option value="veg">Gate</option>
                    <option value="nonveg">Door</option>
                    <option value="nonveg">Tower</option>
                  </select>
                </div>
              </div>

              <div className="row">
                <div className="do-sear mt-2">
                  <label>Add Approximate Delivery Time</label>
                  <input
                    type="text"
                    className="vi_0"
                    placeholder="Enter Approximate Delivery Time"
                    // onChange={(e) => setSubcatName(e.target.value)}
                  />
                </div>
              </div>

              <div className="row">
                <div className="do-sear mt-2">
                  <label>Add Delivery Charge</label>
                  <input
                    type="text"
                    className="vi_0"
                    placeholder="Enter Delivery Charge"
                    // onChange={(e) => setSubcatName(e.target.value)}
                  />{" "}
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <div className="d-flex">
                <Button
                  className="mx-2 modal-close-btn"
                  variant=""
                  onClick={handleClose3}
                >
                  Close
                </Button>
                <Button
                  className="mx-2 modal-add-btn"
                  variant=""
                  onClick={handleClose3}
                >
                  Add
                </Button>
              </div>
            </Modal.Footer>
          </Modal>

          {/* Edit Package modal for Category */}
          <Modal
            show={show4}
            onHide={handleClose4}
            backdrop="static"
            keyboard={false}
            style={{ zIndex: "99999" }}
          >
            <Modal.Header closeButton>
              <Modal.Title style={{ color: "black" }}>
                Edit Delivary Location
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="row">
                <div className="do-sear mt-2">
                  <label>Select Location Type</label>
                  <select
                    name=""
                    id=""
                    className="vi_0"
                    onChange={(e) => setCategoryName(e.target.value)}
                  >
                    <option value="">Select Location Type</option>
                    <option value="veg">Apartment</option>
                    <option value="nonveg">Corporate</option>
                  </select>
                </div>
              </div>

              <div className="row">
                <div className="do-sear mt-2">
                  <label>Add Apartment Name</label>
                  <input
                    type="text"
                    className="vi_0"
                    placeholder="Enter Apartment Name"
                    // onChange={(e) => setSubcatName(e.target.value)}
                  />
                </div>
              </div>

              <div className="row">
                <div className="do-sear mt-2">
                  <label>Add Prefix Code</label>
                  <input
                    type="text"
                    className="vi_0"
                    placeholder="Enter Prefix Code"
                    // onChange={(e) => setSubcatName(e.target.value)}
                  />
                </div>
              </div>

              <div className="row">
                <div className="do-sear mt-2">
                  <label>Select Delivary Type</label>
                  <select
                    name=""
                    id=""
                    className="vi_0"
                    onChange={(e) => setCategoryName(e.target.value)}
                  >
                    <option value="">Select Delivary Type</option>
                    <option value="veg">Gate</option>
                    <option value="nonveg">Door</option>
                    <option value="nonveg">Tower</option>
                  </select>
                </div>
              </div>

              <div className="row">
                <div className="do-sear mt-2">
                  <label>Add Approximate Delivery Time</label>
                  <input
                    type="text"
                    className="vi_0"
                    placeholder="Enter Approximate Delivery Time"
                    // onChange={(e) => setSubcatName(e.target.value)}
                  />
                </div>
              </div>

              <div className="row">
                <div className="do-sear mt-2">
                  <label>Add Delivery Charge</label>
                  <input
                    type="text"
                    className="vi_0"
                    placeholder="EnterDelivery Charge"
                    // onChange={(e) => setSubcatName(e.target.value)}
                  />{" "}
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant=""
                className="modal-close-btn"
                onClick={handleClose4}
              >
                Close
              </Button>
              <Button
                variant=""
                className="modal-add-btn"
                onClick={handleClose4}
              >
                Update
              </Button>
            </Modal.Footer>
          </Modal>

          {/*Delet Package modal for Category */}
          <Modal
            show={show5}
            onHide={handleClose5}
            backdrop="static"
            keyboard={false}
            style={{ zIndex: "99999" }}
          >
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
              >
                Close
              </Button>
              <Button
                variant=""
                className="modal-add-btn"
                onClick={handleClose5}
              >
                Delete
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default Category;
