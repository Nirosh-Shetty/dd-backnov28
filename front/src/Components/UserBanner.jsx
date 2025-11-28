import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from "react-router-dom";

const UserBanner = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef(null);

  // Fetch banners on component mount
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await axios.get("http://localhost:7013/api/admin/banners");
        console.log(res.getbanner, "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb");
        if (res.status === 200) {
          const bannerData = res.data.getbanner || res.data.getbanner || [];
          // console.log('Fetched banners:', bannerData); // Debug log
          bannerData.forEach((banner) => {
            // console.log('BannerText:', banner.BannerText); // Debug BannerText
          });
          setBanners(
            bannerData.filter((banner) => banner._id && banner.BannerImage)
          );
        }
      } catch (error) {
        // Swal.fire({
        //   toast: true,
        //   position: 'top-end',
        //   title: 'Error',
        //   text: 'Failed to load banners.',
        //   icon: 'error',
        //   showConfirmButton: false,
        //   timer: 3000,
        //   timerProgressBar: true,
        // });
        // console.error('Error fetching banners:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Initialize carousel programmatically
  useEffect(() => {
    if (banners.length > 1 && carouselRef.current) {
      try {
        const bootstrap = window.bootstrap;
        if (bootstrap) {
          const carousel = new bootstrap.Carousel(carouselRef.current, {
            ride: "carousel",
            interval: 4000,
            touch: true,
          });
          carousel.cycle();
          console.log("Carousel initialized"); // Debug log
          return () => carousel.dispose();
        }
      } catch (error) {
        console.error("Error initializing carousel:", error);
      }
    }
  }, [banners]);

  return (
    <div
      className="container-fluid p-0 d-block"
      style={{
        maxWidth: "576px",
        margin: "0 auto",
        padding: "10px 0",
        marginBottom: "10px",
      }}
    >
      <style>
        {`
          /* Carousel fade transition */
          .carousel-fade .carousel-item {
            transition: opacity 0.8s ease-in-out;
          }

          /* Typewriter effect for title and description */
          .typewriter-title, .typewriter-desc {
            overflow: hidden;
            white-space: nowrap;
            display: inline-block;
            position: relative;
          }

          /* Blinking cursor */
          .typewriter-title::after, .typewriter-desc::after {
            content: '|';
            color: #6B8E23;
            animation: blink 0.7s infinite;
            position: absolute;
            right: -10px;
          }

          /* Title typewriter animation (3s) */
          .typewriter-title {
            animation: typing-title 3s steps(20, end) infinite !important;
          }

          /* Description typewriter animation (4s) */
          .typewriter-desc {
            animation: typing-desc 4s steps(50, end) infinite;
          }

          /* Keyframes for title typing */
          @keyframes typing-title {
            0% { width: 0; }
            60% { width: 100%; }
            85% { width: 100%; }
            100% { width: 0; }
          }

          /* Keyframes for description typing */
          @keyframes typing-desc {
            0% { width: 0; }
            60% { width: 100%; }
            85% { width: 100%;}
            95% {width: 100%; text-wrap:wrap;}
            100% { width: 0; }
          }

          /* Blinking cursor animation */
          @keyframes blink {
            50% { opacity: 0; }
          }

          /* Carousel indicators */
          .carousel-indicators [data-bs-target] {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background-color:rgb(153, 197, 64);
            transition: transform 0.3s;
          }

          /* Active indicator */
          .carousel-indicators .active {
            transform: scale(1.5);
            background-color: #6B8E23;
          }

          /* Background zoom effect */
          .banner-image {
            animation: bgZoom 8s infinite;
          }

          /* Keyframes for background zoom */
          @keyframes bgZoom {
            0%, 100% { background-size: 100%; }
            50% { background-size: 110%; }
          }
              @media (max-width: 576px) {
    .banner-image {
      height: 140px !important;
    }
  }
        `}
      </style>
      <div
        id="mobileBannerCarousel"
        className="carousel slide carousel-fade"
        data-bs-ride="carousel"
        data-bs-interval="4000"
        data-bs-touch="true"
        ref={carouselRef}
      >
        <div
          className="carousel-inner"
          style={{
            borderRadius: "15px",
            overflow: "hidden",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          }}
        >
          {banners.map((banner, index) => (
            <div
              key={banner._id}
              className={`carousel-item ${index === 0 ? "active" : ""}`}
            >
              <Link to="/refer">
                <div
                  className="banner-image"
                  style={{
                    backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.1)), url(${banner.BannerImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    height: "200px",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    className="banner-content text-center p-3"
                    style={{
                      fontFamily: "'Roboto', -apple-system, sans-serif",
                      maxWidth: "90%",
                    }}
                  >
                    {/* {banner.BannerText && (
                      <h3
                        className="fw-bold mb-2"
                        style={{
                          color: "#6B8E23",
                          fontSize: "1.8rem",
                          textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
                          lineHeight: "1.2",
                        }}
                      >
                        {banner.BannerText}
                      </h3>
                    )}
                    {banner.BannerDesc && (
                      <p
                        className="mb-0 typewriter-desc"
                        style={{
                          color: "white",
                          fontSize: "1rem",
                          textShadow: "1px 1px 3px rgba(0, 0, 0, 0.5)",
                          lineHeight: "1.4",
                        }}
                      >
                        {banner.BannerDesc}
                      </p>
                    )} */}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
        {banners.length > 1 && (
          <>
            <button
              className="carousel-control-prev"
              type="button"
              data-bs-target="#mobileBannerCarousel"
              data-bs-slide="prev"
              style={{ width: "15%", opacity: "0.5" }}
            >
              <span
                className="carousel-control-prev-icon"
                aria-hidden="true"
              ></span>
              <span className="visually-hidden">Previous</span>
            </button>
            <button
              className="carousel-control-next"
              type="button"
              data-bs-target="#mobileBannerCarousel"
              data-bs-slide="next"
              style={{ width: "15%", opacity: "0.5" }}
            >
              <span
                className="carousel-control-next-icon"
                aria-hidden="true"
              ></span>
              <span className="visually-hidden">Next</span>
            </button>
            <div className="carousel-indicators">
              {banners.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  data-bs-target="#mobileBannerCarousel"
                  data-bs-slide-to={index}
                  className={index === 0 ? "active" : ""}
                  aria-current={index === 0 ? "true" : "false"}
                  aria-label={`Slide ${index + 1}`}
                ></button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserBanner;
