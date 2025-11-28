import React, { useState, useEffect } from "react";
import { Button, Modal, Table, Image } from "react-bootstrap";
import { AiFillDelete } from "react-icons/ai";
import { BiSolidEdit } from "react-icons/bi";
import { BsSearch } from "react-icons/bs";
import "../Admin/Admin.css";
import axios from "axios";
import { IoMdEye } from "react-icons/io";

const Livestreams = () => {
  // vedio add
  const [show2, setShow2] = useState();
  const handleClose2 = () => setShow2(false);
  const handleShow2 = () => setShow2(true);

  // vedio delt
  const [show5, setShow5] = useState();
  const handleClose5 = () => setShow5(false);
  const handleShow5 = () => setShow5(true);

  // integrating post method
  const formdata = new FormData();
  const [Livestream, setLivestream] = useState("");
  const [LivestreamTitle, setLivestreamTitle] = useState("");

  const AddLivestreamdetails = async () => {
    if (!Livestream) {
      return alert("Please add a video.");
    }

    // Check if Livestream is a valid video file
    const allowedVideoTypes = [
      "video/mp4",
      "video/webm",
      "video/ogg",
      "video/avi",
      "video/mkv",
    ];
    if (!allowedVideoTypes.includes(Livestream.type)) {
      return alert(
        "Invalid file type. Please upload a valid video (MP4, WEBM, OGG, AVI, MKV)."
      );
    }

    formdata.append("Livestream", Livestream);
    formdata.append("LivestreamTitle", LivestreamTitle);

    try {
      const config = {
        url: "admin/Livestream",
        method: "post",
        baseURL: "http://localhost:7013/api/",
        header: { "content-type": "multipart/form-data" },
        data: formdata,
      };

      let res = await axios(config);
      if (res.status === 200) {
        alert(res.data.success);
        getAddLivestream();
        handleClose2();
        setLivestream(" ");
        window.location.reload();
      }
    } catch (error) {
      console.log(error);
      alert(error.response.data.msg);
    }
  };

  //integrating get  method
  const [AddLivestream, setAddLivestream] = useState([]);
  const getAddLivestream = async () => {
    try {
      let res = await axios.get(
        "http://localhost:7013/api/admin/getLivestream"
      );
      if (res.status === 200) {
        // Sort by date (updatedAt or other date field) or ObjectId (_id)
        const sortedVideos = res.data.getLivestream.sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );
        setAddLivestream(sortedVideos);
      }
    } catch (error) {
      console.log(error);
    }
  };

  //delete method
  const [Datav, setDatav] = useState("");
  const DeleteVedio = async () => {
    try {
      const config = {
        url: "admin/DeleteLivestream/" + Datav,
        method: "delete",
        baseURL: "http://localhost:7013/api/",
        header: { "content-type": "application/json" },
      };
      await axios(config).then((res) => {
        if (res.status === 200) {
          alert("Successfully Delete");
          getAddLivestream();
          handleClose5();
          window.location.reload();
        }
      });
    } catch (error) {
      console.log(error);
      alert(error.response.data.msg);
    }
  };

  //update method
  const [Datavd, setDatavd] = useState("");
  const [show6, setShow6] = useState(false);
  const handleClose6 = () => setShow6(false);
  const handleShow6 = (item) => {
    setShow6(true);
    setDatavd(item);
    setLivestreamTitle(item?.LivestreamTitle);
  };

  const EditVedio = async (e) => {
    e.preventDefault();
    formdata.append("Livestream", Livestream);
    formdata.append("LivestreamTitle", LivestreamTitle);
    formdata.append("id", Datavd?._id);
    try {
      const config = {
        url: "admin/editLivestream",
        method: "put",
        baseURL: "http://localhost:7013/api/",
        header: { "content-type": "multipart/form-data" },
        data: formdata,
      };
      await axios(config).then((res) => {
        if (res.status === 200) {
          alert("successfully Update");
          getAddLivestream();
          handleClose6();
        }
      });
    } catch (error) {
      console.log(error);
      alert(error.response.data.error);
    }
  };

  useEffect(() => {
    getAddLivestream();
  }, []);

  // pagination
  const [currenpage1, setCurrentpage1] = useState(1);
  const recordsperpage1 = 5;
  const lastIndex1 = currenpage1 * recordsperpage1;
  const firstIndex1 = lastIndex1 - recordsperpage1;
  const records1 = AddLivestream.slice(firstIndex1, lastIndex1);
  const npages1 = Math.ceil(AddLivestream.length / recordsperpage1);
  const numbers1 = [...Array(npages1 + 1).keys()].slice(1);

  function changePage(id) {
    setCurrentpage1(id);
  }

  function prevpage() {
    if (currenpage1 !== firstIndex1) {
      setCurrentpage1(currenpage1 - 1);
    }
  }

  function nextpage() {
    if (currenpage1 !== lastIndex1) {
      setCurrentpage1(currenpage1 + 1);
    }
  }

  return (
    <div>
      <div className="customerhead p-2">
        {/* <div className="col-lg-4 d-flex justify-content-center">
              <div class="input-group ">
                <span class="input-group-text" id="basic-addon1">
                  <BsSearch />
                </span>
                <input
                  type="text"
                  class="form-control"
                  placeholder="Search..."
                  aria-describedby="basic-addon1"
                  onChange={handleFilterH}
                />
              </div>
            </div> */}

        <div className="d-flex justify-content-between align-items-center">
          <h2 className="header-c ">Live Stream</h2>
          <Button variant="success" onClick={handleShow2}>
            + ADD
          </Button>
        </div>

        <div className="mb-3">
          <Table
            responsive
            bordered
            style={{ width: "-webkit-fill-available" }}
          >
            <thead>
              <tr>
                <th>S.No</th>
                <th>Video</th>
                {/* <th>Title</th> */}
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {records1?.map((item, i) => {
                return (
                  <tr key={i}>
                    <td style={{ paddingTop: "20px" }}>
                      {i + 1 + firstIndex1}
                    </td>
                    <td style={{ paddingTop: "20px" }}>
                      <video width="auto" height="150" controls>
                        <source
                          src={`${item?.Livestream}`}
                          type="video/mp4"
                          style={{ width: "100px", height: "80px" }}
                        />
                      </video>
                    </td>

                    {/* <td style={{ paddingTop: "20px" }}>
                          {item.LivestreamTitle}
                        </td> */}

                    <td style={{ paddingTop: "20px" }}>
                      {" "}
                      <div
                        style={{
                          display: "flex",
                          gap: "20px",
                          justifyContent: "center",
                        }}
                      >
                        {/* <div>
                              <BiSolidEdit
                                className="text-success"
                                style={{ cursor: "pointer", fontSize: "20px" }}
                                onClick={() => handleShow6(item)}
                              />{" "}
                            </div> */}
                        <div>
                          <AiFillDelete
                            className="text-danger"
                            style={{ cursor: "pointer", fontSize: "20px" }}
                            onClick={() => {
                              handleShow5();
                              setDatav(item?._id);
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
                {numbers1?.map((n, i) => {
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

        {/* Add vedio modal */}
        <Modal show={show2} onHide={handleClose2} style={{ zIndex: "99999" }}>
          <Modal.Header closeButton>
            <Modal.Title style={{ color: "black" }}>
              Add Gallery Videos
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {/* <div className="row">
                  <div className="do-sear mt-2">
                    <label>Add Video Title</label>
                    <input
                      type="text"
                      className="vi_0"
                      placeholder="Enter Video Title"
                      onChange={(e) => setLivestreamTitle(e.target.value)}
                    />
                  </div>
                </div> */}

            <div className="row mb-2">
              <div className="do-sear mt-2">
                <label>Add Video</label>
                <input
                  type="file"
                  name=""
                  id=""
                  accept=".mp4,.webm"
                  className="vi_0"
                  onChange={(e) => setLivestream(e.target.files[0])}
                />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div className="d-flex">
              <Button
                className="mx-2 modal-close-btn"
                variant=""
                onClick={handleClose2}
              >
                Close
              </Button>
              <Button
                className="mx-2 modal-add-btn"
                variant=""
                onClick={AddLivestreamdetails}
              >
                Add
              </Button>
            </div>
          </Modal.Footer>
        </Modal>

        {/* Edit Package modal */}
        <Modal
          show={show6}
          onHide={handleClose6}
          backdrop="static"
          keyboard={false}
          style={{ zIndex: "99999" }}
        >
          <Modal.Header closeButton>
            <Modal.Title style={{ color: "black" }}>
              Edit Gallery Videos
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {/* <div className="row">
                  <div className="do-sear mt-2">
                    <label>Edit Video Title</label>
                    <input
                      type="text"
                      className="vi_0"
                      placeholder="Enter Video Title"
                      value={LivestreamTitle}
                      onChange={(e) => setLivestreamTitle(e.target.value)}
                    />
                  </div>
                </div> */}

            <div className="row mb-2">
              <div className="do-sear mt-2">
                <label>Edit Gallery Video</label>
                <input
                  type="file"
                  name=""
                  id=""
                  className="vi_0"
                  onChange={(e) => setLivestream(e.target.value)}
                />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant=""
              className="modal-close-btn"
              onClick={handleClose6}
            >
              Close
            </Button>
            <Button variant="" className="modal-add-btn" onClick={EditVedio}>
              Update
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Delet modal  */}
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
            <Button variant="" className="modal-add-btn" onClick={DeleteVedio}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default Livestreams;
