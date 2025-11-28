import React, { useState, useEffect } from "react";
import { Button, Modal, Table, Image, Spinner } from "react-bootstrap";
import { AiFillDelete } from "react-icons/ai";
import { BiSolidEdit } from "react-icons/bi";
import { BsSearch } from "react-icons/bs";
import "../Admin/Admin.css";
import axios from "axios";
import moment from "moment";

const WebStory = () => {
  // Modal states
  const [show3, setShow3] = useState(false);
  const [show4, setShow4] = useState(false);
  const [show5, setShow5] = useState(false);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);

  const handleClose3 = () => setShow3(false);
  const handleShow3 = () => setShow3(true);
  const handleClose4 = () => setShow4(false);
  const handleShow4 = (items) => {
    setShow4(true);
    setData1(items);
    setStoriesImage(items?.StoriesImage);
    setStoriesText(items?.StoriesText);
  };
  const handleClose5 = () => setShow5(false);
  const handleShow5 = () => setShow5(true);

  // Form data states
  const [StoriesImage, setStoriesImage] = useState("");
  const [StoriesText, setStoriesText] = useState("");
  const [AddWebstory, setAddWebstory] = useState([]);
  const [Data, setData] = useState("");
  const [Data1, setData1] = useState("");

  // Get web stories
  const getAddWebstory = async () => {
    try {
      setIsDataLoading(true);
      let res = await axios.get("http://localhost:7013/api/admin/getstories");
      if (res.status === 200) {
        setAddWebstory(res.data.getbanner.reverse());
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsDataLoading(false);
    }
  };

  // Add web story
  const AddWebstorydata = async () => {
    if (!StoriesImage) {
      return alert("Please add an image.");
    }

    const allowedImageTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/gif",
    ];
    if (!allowedImageTypes.includes(StoriesImage.type)) {
      return alert(
        "Invalid file type. Please upload an image (JPEG, PNG, JPG, or GIF)."
      );
    }

    if (!StoriesText) {
      return alert("Please add a title.");
    }

    const formdata = new FormData();
    formdata.append("StoriesImage", StoriesImage);
    formdata.append("StoriesText", StoriesText);

    try {
      setIsLoading(true);
      const config = {
        url: "/admin/Addstories",
        method: "post",
        baseURL: "http://localhost:7013/api",
        headers: { "content-type": "multipart/form-data" },
        data: formdata,
      };
      let res = await axios(config);
      if (res.status === 200) {
        alert(res.data.success);
        await getAddWebstory();
        handleClose3();
        setStoriesImage("");
        setStoriesText("");
      }
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.msg || "Error adding story");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete web story
  const DeleteWebstory = async () => {
    try {
      setIsLoading(true);
      const config = {
        url: "admin/Deletestories/" + Data,
        method: "delete",
        baseURL: "http://localhost:7013/api/",
        headers: { "content-type": "application/json" },
      };
      await axios(config).then((res) => {
        if (res.status === 200) {
          alert("Successfully Deleted");
          getAddWebstory();
          handleClose5();
        }
      });
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.msg || "Error deleting story");
    } finally {
      setIsLoading(false);
    }
  };

  // Update web story
  const EditStory = async (e) => {
    e.preventDefault();
    const formdata = new FormData();
    formdata.append("StoriesImage", StoriesImage);
    formdata.append("StoriesText", StoriesText);
    formdata.append("id", Data1?._id);

    try {
      setIsLoading(true);
      const config = {
        url: "admin/editstories",
        method: "put",
        baseURL: "http://localhost:7013/api/",
        headers: { "content-type": "multipart/form-data" },
        data: formdata,
      };
      await axios(config).then((res) => {
        if (res.status === 200) {
          alert("Successfully Updated");
          handleClose4();
          getAddWebstory();
          setStoriesImage("");
          setStoriesText("");
        }
      });
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.error || "Error updating story");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAddWebstory();
  }, []);

  return (
    <div>
      <div className="customerhead p-2">
        <div className="d-flex justify-content-between align-items-center">
          <h2 className="header-c">Web Story</h2>
          <Button variant="success" onClick={handleShow3}>
            + ADD
          </Button>
        </div>

        <div className="mb-3">
          {isDataLoading ? (
            <div className="text-center my-5">
              <Spinner animation="border" variant="primary" />
              <p>Loading stories...</p>
            </div>
          ) : (
            <Table
              responsive
              bordered
              style={{ width: "-webkit-fill-available" }}
            >
              <thead>
                <tr>
                  <th>Sl.No</th>
                  <th>Image</th>
                  <th>Text</th>
                  <th>Date / Time</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {AddWebstory?.map((item, i) => (
                  <tr key={i}>
                    <td style={{ paddingTop: "20px" }}>{i + 1}</td>
                    <td style={{ paddingTop: "20px" }}>
                      <Image
                        src={`${item?.StoriesImage}`}
                        alt="pic"
                        style={{ width: "65px", height: "65px" }}
                      />
                    </td>
                    <td style={{ paddingTop: "20px" }}>{item?.StoriesText}</td>
                    <td style={{ paddingTop: "20px" }}>
                      {moment(item?.createdAt).format("MM/DD/YYYY, h:mm A")}
                    </td>
                    <td style={{ paddingTop: "20px" }}>
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
                          onClick={() => handleShow4(item)}
                        />
                        <AiFillDelete
                          className="text-danger"
                          style={{ cursor: "pointer", fontSize: "20px" }}
                          onClick={() => {
                            handleShow5();
                            setData(item?._id);
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>

        {/* Add Web Story Modal */}
        <Modal show={show3} onHide={handleClose3} style={{ zIndex: "99999" }}>
          <Modal.Header closeButton>
            <Modal.Title>Add Web Story</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="row">
              <div className="do-sear mt-2">
                <label>Add Image</label>
                <input
                  type="file"
                  className="vi_0"
                  onChange={(e) => setStoriesImage(e.target.files[0])}
                />
              </div>
            </div>
            <div className="row">
              <div className="do-sear mt-2">
                <label>Add Text</label>
                <input
                  type="text"
                  className="vi_0"
                  placeholder="Enter Text"
                  value={StoriesText}
                  onChange={(e) => setStoriesText(e.target.value)}
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
                onClick={AddWebstorydata}
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

        {/* Edit Web Story Modal */}
        <Modal show={show4} onHide={handleClose4} style={{ zIndex: "99999" }}>
          <Modal.Header closeButton>
            <Modal.Title style={{ color: "black" }}>Edit Web Story</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="row">
              <div className="do-sear mt-2">
                <label>Edit Image</label>
                <input
                  type="file"
                  className="vi_0"
                  onChange={(e) => setStoriesImage(e.target.files[0])}
                />
              </div>
            </div>
            <div className="row">
              <div className="do-sear mt-2">
                <label>Edit Text</label>
                <input
                  type="text"
                  className="vi_0"
                  value={StoriesText}
                  onChange={(e) => setStoriesText(e.target.value)}
                />
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
              onClick={EditStory}
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

        {/* Delete Web Story Modal */}
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
              onClick={DeleteWebstory}
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

export default WebStory;
