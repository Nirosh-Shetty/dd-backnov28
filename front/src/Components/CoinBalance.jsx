import React, { useState } from "react";
import { Card, Container } from "react-bootstrap";
// import { InfoCircle } from "react-bootstrap-icons";
import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/coin-balance.css";
import { BiInfoCircle } from "react-icons/bi";
import coinsgif from './../assets/coinsgif.gif';
import moment from "moment";
import { RxCross2 } from "react-icons/rx";


const CoinBalance = ({ wallet, transactions, expiryDays, setExpiryDays, setShow }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const addresstype = localStorage.getItem("addresstype");
  const address = JSON.parse(localStorage.getItem(addresstype === "apartment" ? "address" : "coporateaddress"));
  const today = moment();
  const walletAmount = wallet?.balance || 0;

  const validCredits = transactions
    ?.filter((ele) => ele?.type === "credit" && moment(ele?.expiryDate).isAfter(today))
    .sort((a, b) => moment(a.expiryDate) - moment(b.expiryDate)); // Nearest expiring

  const upcomingExpiry = validCredits?.[0];

  let expiryMessage = "";

  if (walletAmount <= 0 || !upcomingExpiry) {
    expiryMessage = "Continue buying to get more bonus!";
  } else {
    const expiryDays1 = moment(upcomingExpiry.expiryDate).diff(today, "days");
    if (expiryDays === 0) {
      expiryMessage = "Expiring Today!";
    } else {
      expiryMessage = `Expiring in ${expiryDays1} Days`;
    }
    setExpiryDays(expiryDays1);
  }



  return (
    <div className="ban-container">
      <div className="mobile-banner" style={{position: 'relative'}}>
        {user && !address && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#f9f8f6',
            zIndex: 10,
            pointerEvents: 'none',
            opacity: 0.8
          }}></div>
        )}
        {/* <div className="coin-card mt-3">
        <div className="coin-header">
          <div className="coin-stack">
            <img src={coinsgif} alt="" />
          </div>
          <div className="balance-text">
            <span className="balance-amount">₹ {wallet?.balance}</span>
          </div>
          <div className="info-icon">
            <BiInfoCircle size={25} />
          </div>
        </div>
        {transactions?.length>0 && <div className="expiring-notice">
          <span className="expiring-text">{expiryMessage}</span>
        </div>}
       

      </div> */}

        <div className="coin-balance-card mb-3">

          <p className="coin-balance-text">🎉 <b>₹{wallet?.balance}</b> is waiting in your wallet, but only for {expiryDays === 0 ? "today" : `${expiryDays} more days`}. Hurry up and dig in!</p>
          <RxCross2 onClick={() => setShow(false)} className="coin-balance-text-icon" />

        </div>

      </div></div>
  );
};

export default CoinBalance;