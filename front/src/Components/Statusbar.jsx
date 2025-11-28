import React, { useEffect, useState } from "react";
import { GiHotMeal } from "react-icons/gi";
import "../Styles/Statusbar.css";
import { Carousel } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { IoMdClose } from "react-icons/io";
import axios from "axios"; // Make sure axios is imported for API calls
import moment from "moment";

const Statusbar = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progressWidths, setProgressWidths] = useState([]); // Initialize empty for fetched images
  const [AddWebstory, setAddWebstory] = useState([]); // State to hold fetched stories
  const navigate = useNavigate();

  // Fetch stories when component mounts
  useEffect(() => {
    const getAddWebstory = async () => {
      try {
        let res = await axios.get("http://localhost:7013/api/admin/getstories");
        if (res.status === 200) {
          const stories = res.data.getbanner.reverse(); // Adjust order if needed
          setAddWebstory(stories);
          setProgressWidths(new Array(stories.length).fill(0)); // Initialize progress widths for each story
        }
      } catch (error) {
        console.log(error);
      }
    };
    getAddWebstory();
  }, []);

  // Update progress bars
  useEffect(() => {
    const interval = setInterval(() => {
      setProgressWidths((prevProgressWidths) => {
        const updatedProgress = [...prevProgressWidths];
        if (updatedProgress[currentIndex] < 100) {
          updatedProgress[currentIndex] += 1;
        }
        return updatedProgress;
      });
    }, 30);

    if (progressWidths[currentIndex] >= 100) {
      handleNextSlide();
    }

    return () => clearInterval(interval);
  }, [progressWidths, currentIndex]);

  // Handle slide change or navigation to home after the last slide
  const handleNextSlide = () => {
    if (currentIndex < AddWebstory?.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setProgressWidths((prevProgressWidths) => {
        const updatedProgress = [...prevProgressWidths];
        updatedProgress[currentIndex] = 100; // Ensure the current progress is complete
        updatedProgress[nextIndex] = 0; // Reset the next progress bar
        return updatedProgress;
      });
    } else {
      navigate("/home");
    }
  };

  const handlePrevSlide = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setProgressWidths((prevProgressWidths) => {
        const updatedProgress = [...prevProgressWidths];
        updatedProgress[currentIndex] = 0; // Reset the current progress bar
        updatedProgress[prevIndex] = 0; // Set the previous progress bar to complete
        return updatedProgress;
      });
    } else {
      navigate("/home");
    }
  };

  return (
    <div>
      <div className="status-view">
        <div className="status-header">
          {/* Progress Indicators */}
          {progressWidths?.map((progress, idx) => (
            <div key={idx} className="progress-bar">
              <div className="progress" style={{ width: `${progress}%` }}></div>
            </div>
          ))}

          <div
            style={{ marginTop: "-10px", cursor: "pointer", zIndex: "9999" }}
            onClick={() => navigate("/home")}
          >
            <IoMdClose
              style={{ color: "white", fontSize: "20px", zIndex: "99999" }}
            />
          </div>
        </div>

        <Carousel
          interval={null}
          controls={true}
          activeIndex={currentIndex}
          onSelect={handleNextSlide}
          indicators={false}
          slide={false}
        >
          {AddWebstory?.map((story, index) => (
            <Carousel.Item key={index}>
              <div className="status-container">
                <div className="prev" onClick={handlePrevSlide}>
                  {/* Add custom icon or text for 'Prev' */}
                  &#8592;
                </div>
                <img
                  src={`${story?.StoriesImage}`}
                  alt="StoryImage"
                  className="status-image"
                />
                <div className="nextstatus" onClick={handleNextSlide}>
                  {/* Add custom icon or text for 'Next' */}
                  &#8594;
                </div>
                <div className="status-content">
                  <div className="icon-and-text">
                    <GiHotMeal className="status-icon" />
                    <p className="status-text">{story?.StoriesText}</p>{" "}
                  </div>
                  <p className="timestamp">
                    {moment(story?.updatedAt).format("h:mm A MMMM DD")}
                  </p>{" "}
                </div>
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
      </div>
    </div>
  );
};

export default Statusbar;
