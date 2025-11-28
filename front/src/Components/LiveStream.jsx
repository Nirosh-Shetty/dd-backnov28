import React from "react";
import "../Styles/Livestream.css"
import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { MdArrowBackIosNew } from "react-icons/md";

const LiveStreams = () => {
  const navigate = useNavigate()

    const videos = [
        { url: "https://www.youtube.com/watch?v=XXXXXX" },
        { url: "https://www.youtube.com/watch?v=YYYYYY" },
        { url: "https://www.youtube.com/watch?v=ZZZZZZ" },
        { url: "https://www.youtube.com/watch?v=AAAAAA" },
      ];

  return (
    <>
      <MdArrowBackIosNew
        onClick={() => navigate("/home")}
        style={{
          color: "black",
          fontSize: "26px",
          marginLeft: "5px",
          marginTop: "5px",
        }}
      />

    <div className="livecontainer">
           <Container className="livestream">
      <h1 className="text-center mt-4">Live Streams</h1>
      <div className="container mt-4 ">
        <div className="row">
          {videos.map((video, index) => (
            <div key={index} className="col-12 col-sm-12 col-md-12 mb-4">
              <div className="video-item">
                <video controls width="100%" height="100%">
                  <source src='Assets/header-video-1.mp4' type="video/mp4" />
                </video>
                <h5 className="text-center">{video.title}</h5>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Container>
    </div>
    </>
  )
}

export default LiveStreams