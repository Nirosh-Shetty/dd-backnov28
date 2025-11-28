import React, { useState, useEffect } from "react";
import { Button, Modal, Table, Image } from "react-bootstrap";
import { AiFillDelete } from "react-icons/ai";
import { BiSolidEdit } from "react-icons/bi";
import { BsSearch } from "react-icons/bs";
import "../Admin/Admin.css";
import axios from "axios";

const HomeBanner = () => {
  // Add modal for Banner
  const [show3, setShow3] = useState();
  const handleClose3 = () => setShow3(false);
  const handleShow3 = () => setShow3(true);

  // Delet modal for  Banner
  const [show5, setShow5] = useState();
  const handleClose5 = () => setShow5(false);
  const handleShow5 = () => setShow5(true);

  // ======INTEGRATION=======//

  // integrating post method
  const formdata = new FormData();
  const [BannerImage, setBannerImage] = useState("");
  const [BannerText, setBannerText] = useState("");
  const [BannerDesc, setBannerDesc] = useState("");

  const AddBannerdetails = async () => {
    formdata.append("BannerImage", BannerImage);
    formdata.append("BannerText", BannerText);
    formdata.append("BannerDesc", BannerDesc);

    try {
      if (!BannerImage) {
        return alert("Please add Banner Image");
      }
      if (!BannerText) {
        return alert("Please add Title");
      }
      if (!BannerDesc) {
        return alert("Please add Tagline");
      }
      const config = {
        url: "/admin/banner",
        method: "post",
        baseURL: "http://localhost:7013/api",
        header: { "content-type": "multipart/form-data" },
        data: formdata,
      };
      let res = await axios(config);
      if (res.status === 200) {
        alert(res.data.success);
        getAddBanner();
        handleClose3();
      }
    } catch (error) {
      console.log(error);
      alert(error.response.data.msg);
    }
  };
  //integrating get  method
  const [AddBanner, setAddBanner] = useState([]);
  const getAddBanner = async () => {
    try {
      let res = await axios.get("http://localhost:7013/api/admin/getbanner");
      if (res.status === 200) {
        setAddBanner(res.data.getbanner);
      }
    } catch (error) {
      console.log(error);
    }
  };

  //delete method
  const [Data, setData] = useState("");
  const DeleteBanner = async () => {
    try {
      const config = {
        url: "admin/Deletebanner/" + Data,
        method: "delete",
        baseURL: "http://localhost:7013/api/",
        header: { "content-type": "application/json" },
      };
      await axios(config).then((res) => {
        if (res.status === 200) {
          alert("Successfully Delete");
          getAddBanner();
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
  const [show4, setShow4] = useState();
  const handleClose4 = () => setShow4(false);
  const handleShow4 = (items) => {
    setShow4(true);
    setData1(items);
    setBannerImage(items?.BannerImage);
    setBannerText(items?.BannerText);
    setBannerDesc(items?.BannerDesc);
  };

  const EditBanner = async (e) => {
    e.preventDefault();
    formdata.append("BannerImage", BannerImage);
    formdata.append("BannerText", BannerText);
    formdata.append("BannerDesc", BannerDesc);

    formdata.append("id", Data1?._id);
    try {
      const config = {
        url: "admin/editbanner",
        method: "put",
        baseURL: "http://localhost:7013/api/",
        header: { "content-type": "multipart/form-data" },
        data: formdata,
      };
      await axios(config).then((res) => {
        if (res.status === 200) {
          alert("successfully Update");
          handleClose4();
          getAddBanner();
        }
      });
    } catch (error) {
      console.log(error);
      alert(error.response.data.error);
    }
  };

  useEffect(() => {
    getAddBanner();
  }, []);

  return (
    <div>
      <div className="customerhead p-2">
        <div className="d-flex justify-content-between align-items-center">
          <h2 className="header-c ">Home Banner</h2>
          <div className="d-flex gap-3">
            {AddBanner?.length !== 0 ? (
              <></>
            ) : (
              <>
                <Button variant="success" onClick={handleShow3}>
                  + ADD
                </Button>
              </>
            )}
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
                <th>Banner Image</th>
                <th>Title</th>
                <th>Text</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {AddBanner?.map((item, i) => {
                return (
                  <tr key={i}>
                    <td style={{ paddingTop: "20px" }}>{i + 1}</td>
                    <td style={{ paddingTop: "20px" }}>
                      <Image
                        src={`${item?.BannerImage}`}
                        alt="pic"
                        style={{ width: "75px", height: "75px" }}
                      />
                    </td>
                    <td style={{ paddingTop: "20px" }}>{item.BannerText}</td>
                    <td style={{ paddingTop: "20px" }}>{item.BannerDesc}</td>

                    <td style={{ paddingTop: "20px" }}>
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
                              handleShow4(item);
                              setData1(item);
                            }}
                          />{" "}
                        </div>
                        <div>
                          <AiFillDelete
                            className="text-danger"
                            style={{ cursor: "pointer", fontSize: "20px" }}
                            onClick={() => {
                              handleShow5();
                              setData(item?._id);
                            }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>

        {/* Add Package modal for Banner */}
        <Modal show={show3} onHide={handleClose3} style={{ zIndex: "99999" }}>
          <Modal.Header closeButton>
            <Modal.Title style={{ color: "black" }}>
              Add Home Banner
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="row">
              <div className="do-sear mt-2">
                <label>Add Banner Image</label>
                <input
                  type="file"
                  name=""
                  id=""
                  className="vi_0"
                  onChange={(e) => setBannerImage(e.target.files[0])}
                />
              </div>
            </div>
            <div className="row">
              <div className="do-sear mt-2">
                <label>Add Banner Title</label>
                <input
                  type="text"
                  className="vi_0"
                  placeholder="Enter Banner Title"
                  onChange={(e) => setBannerText(e.target.value)}
                />
              </div>
            </div>
            <div className="row">
              <div className="do-sear mt-2">
                <label>Add Banner Text</label>
                <input
                  type="text"
                  className="vi_0"
                  placeholder="Enter Banner Text"
                  onChange={(e) => setBannerDesc(e.target.value)}
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
              >
                Close
              </Button>
              <Button
                className="mx-2 modal-add-btn"
                variant=""
                onClick={AddBannerdetails}
              >
                Add
              </Button>
            </div>
          </Modal.Footer>
        </Modal>

        {/* Edit Package modal for Banner */}
        <Modal
          show={show4}
          onHide={handleClose4}
          backdrop="static"
          keyboard={false}
          style={{ zIndex: "99999" }}
        >
          <Modal.Header closeButton>
            <Modal.Title style={{ color: "black" }}>
              Edit Home Banner
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="row">
              <div className="do-sear mt-2">
                <label>Edit Banner Image</label>
                <input
                  type="file"
                  name=""
                  id=""
                  className="vi_0"
                  onChange={(e) => setBannerImage(e.target.files[0])}
                />
              </div>
            </div>
            <div className="row">
              <div className="do-sear mt-2">
                <label>Edit Banner Title</label>
                <input
                  type="text"
                  className="vi_0"
                  value={BannerText}
                  placeholder={Data1.BannerText}
                  onChange={(e) => setBannerText(e.target.value)}
                />
              </div>
            </div>
            <div className="row">
              <div className="do-sear mt-2">
                <label>Edit Banner Text</label>
                <input
                  type="text"
                  className="vi_0"
                  value={BannerDesc}
                  placeholder={Data1.BannerDesc}
                  onChange={(e) => setBannerDesc(e.target.value)}
                />
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
            <Button variant="" className="modal-add-btn" onClick={EditBanner}>
              Update
            </Button>
          </Modal.Footer>
        </Modal>

        {/*Delet Package modal for Banner */}
        <Modal
          show={show5}
          onHide={handleClose5}
          backdrop="static"
          keyboard={false}
          style={{ zIndex: "99999" }}
        >
          <Modal.Header closeButton>
            <Modal.Title style={{ color: "black" }}>Warning</Modal.Title>
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
            <Button variant="" className="modal-add-btn" onClick={DeleteBanner}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default HomeBanner;
