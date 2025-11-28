// import React, { useState, useEffect } from "react";
// import { useLocation } from "react-router-dom";
import { BaseLogo } from "./BaseLogo";
import { PhoneTypography } from "./PhoneTypography";
// import image1 from "./image.svg";
import levels from "../assets/leaf-banana.svg";
// import marginLine from "./margin-line.svg";
import "../Styles/login.css";

export const LoginPage = () => {
  return (
    <div className="landing">
      <div className="div-2">
        <div className="status-bar">
          <div className="time">
            <div className="text-wrapper">9:41</div>
          </div>

          <img className="levels" alt="Levels" src={levels} />
        </div>

        <div className="frame">
          <div className="hero">
            <div className="leaf-frame">
              <BaseLogo
                className="base-logo-instance"
                dailydish="dailydish-2.png"
                dailydishClassName="base-logo-3"
                overlapGroupClassName="design-component-instance-node"
                property1="variant-3"
                subt="image.png"
                subtClassName="base-logo-2"
              />
            </div>
          </div>

          <div className="input">
            <div className="login">
              <div className="section-margin">
                {/* <img
                  className="margin-line"
                  alt="Margin line"
                  src={marginLine}
                /> */}

                <PhoneTypography
                  className="phone-typography-scale"
                  divClassName="phone-typography-instance"
                  text="Log in or Sign-up"
                  textRole="badge-chip"
                />
                {/* <img className="margin-line" alt="Margin line" src={image1} /> */}
              </div>

              <div className="box">
                <PhoneTypography
                  className="phone-typography-scale-instance"
                  divClassName="phone-typography-2"
                  text1="Enter your full name"
                  textRole="body-l"
                />
              </div>

              <div className="otp">
                <div className="box-2">
                  <div className="phone-typography-wrapper">
                    <PhoneTypography
                      className="phone-typography-3"
                      divClassName="phone-typography-4"
                      text2="+91"
                      textRole="body-m"
                    />
                  </div>

                  <PhoneTypography
                    className="phone-typography-3"
                    divClassName="phone-typography-5"
                    text2="Enter your phone number"
                    textRole="body-m"
                  />
                </div>

                <div className="continue">
                  <div className="text">
                    <PhoneTypography
                      className="phone-typography-6"
                      text3="Get an OTP"
                      textRole="card-title"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="overlap">
          <div className="section-margin-wrapper">
            <div className="div-wrapper">
              <div className="badge-chip-text-wrapper">
                <p className="badge-chip-text">
                  <span className="span">By Signing in, you agree to our </span>

                  <span className="text-wrapper-2">
                    Terms &amp; Conditions{" "}
                  </span>

                  <span className="span">and </span>

                  <span className="text-wrapper-2">
                    Privacy Policy&nbsp;&nbsp;{" "}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="home-indicator">
            <div className="home-indicator-2" />
          </div>
        </div>

        <div className="t-and-c">
          <div className="contents">
            <div className="div-wrapper">
              <div className="badge-chip-text-wrapper">
                <p className="badge-chip-text">
                  <span className="span">By Signing in, you agree to our </span>

                  <span className="text-wrapper-2">
                    Terms &amp; Conditions{" "}
                  </span>

                  <span className="span">and </span>

                  <span className="text-wrapper-2">
                    Privacy Policy&nbsp;&nbsp;{" "}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <PhoneTypography
          className="phone-typography-7"
          divClassName="phone-typography-8"
          text3="Skip, Just here for the Menu"
          textRole="card-title"
        />
      </div>
    </div>
  );
};
