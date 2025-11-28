import React, { useState } from "react";
import axios from "axios";
import { IoIosEye } from "react-icons/io";
import { IoIosEyeOff } from "react-icons/io";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const [REmail, setREmail] = useState("");
  const [RPassword, setRPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const login = async () => {
    try {
      // Validate inputs
      if (!REmail) {
        return toast.warning("Enter Correct Email ID");
      }
      if (!RPassword) {
        return toast.warning("Enter Correct Password");
      }

      const config = {
        url: "/admin/adminLogin",
        method: "post",
        baseURL: "http://localhost:7013/api",
        headers: { "content-type": "application/json" },
        data: { REmail: REmail, RPassword: RPassword },
      };

      let res = await axios(config);

      // Check if login was successful
      if (res.status === 200) {
        if (res.data.success) {
          toast.success("Successfully logged in");
          window.localStorage.setItem(
            "admin",
            JSON.stringify(res.data.success)
          );
          // window.location.assign("/dashboard");
          navigate("/dashboard");
        } else {
          toast.warning("Incorrect email or password");
        }
      }
    } catch (error) {
      // Handle error scenarios
      if (error.response && error.response.data && error.response.data.error) {
        alert(error.response.data.error);
      } else {
        alert("An unexpected error occurred");
      }
      console.log(error);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <ToastContainer
        position="top-center" // Set position to top-center
        autoClose={2000} // Automatically close after 3 seconds
        hideProgressBar={true} // Show the progress bar
        closeOnClick // Close on click
        draggable // Allow dragging the toast
      />
      <div className="admin-login-bg">
        <div className="add">
          <div className="container">
            <div className="fw_90">
              <div className="add_0">
                <div className="im09 p-4">
                  <div className="d-flex">
                    <a href="/" className="tail-text">
                      <img
                        src="../Assets/dailydishlogo.jpeg"
                        alt="Logo"
                        className="admin-login-logo"
                      />
                    </a>
                  </div>
                </div>
                <div className="add-90">
                  <form>
                    <div className="sd_00 mb-2">
                      <label>Email</label> <br />
                      <input
                        type="email"
                        placeholder="email@gmail.com"
                        className="name_0"
                        // value={REmail}
                        required
                        onChange={(e) => setREmail(e.target.value)}
                      />
                    </div>
                    <div className="sd_00 mb-2">
                      <label>Password</label>
                      <br />
                      <div
                        className="password-wrapper"
                        style={{ position: "relative" }}
                      >
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="password"
                          className="name_0"
                          value={RPassword}
                          onChange={(e) => setRPassword(e.target.value)}
                          required
                        />
                        <span
                          type="button"
                          onClick={togglePasswordVisibility}
                          style={{
                            position: "absolute",
                            right: "10px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          {showPassword ? (
                            <IoIosEye
                              style={{ color: "black", fontSize: "20px" }}
                            />
                          ) : (
                            <IoIosEyeOff
                              style={{ color: "black", fontSize: "20px" }}
                            />
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="sd_00 mt-2">
                      <button
                        type="button"
                        style={{ background: "white", color: "black" }}
                        onClick={login}
                      >
                        Login
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminLogin;
