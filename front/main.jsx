import React from "react";
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { WalletProvider } from './WalletContext.jsx'
import GlobalZoomDisable from './GlobalZoomDisable.jsx'

createRoot(document.getElementById('root')).render(
   <React.StrictMode>
    <GlobalZoomDisable>
    <WalletProvider>
      <App />
      </WalletProvider>
    </GlobalZoomDisable>
  </React.StrictMode>
)
