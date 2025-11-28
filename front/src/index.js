import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "rsuite/dist/rsuite.min.css";
import GlobalZoomDisable from "./GlobalZoomDisable";
import { WalletProvider } from "./WalletContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <GlobalZoomDisable>
    <WalletProvider>
      <App />
      </WalletProvider>
    </GlobalZoomDisable>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
