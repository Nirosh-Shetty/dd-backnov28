import React from "react";
import Side from "./Side";
import Adminheader from "./AdminHeader";
// import { useTheme } from "../Context/ThemeContext";
import "../Admin/Admin.css";

const Main = (props) => {
  return (
    <div>
      <div className="dash">
        <div className="admin-all">
          <div className="admin-sidebar-display" >
            <div
              className="left-side"
              style={{ position: "sticky", top: "0", height: "100vh" }}
            >
              <Side />
            </div>
          </div>

          <div className="right-admin main-content">
            <Adminheader />
            {props.children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
