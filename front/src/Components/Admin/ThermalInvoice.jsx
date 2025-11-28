


import React, { useEffect, useRef } from "react";
import { MdArrowBackIosNew } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";

function ThermalInvoice() {
  const location = useLocation();
  const { item } = location?.state;
  const navigate = useNavigate();
  const receiptRef = useRef(null);
  const hasPrinted = useRef(false);

  // Function to print directly to thermal printer
  const printReceipt = () => {
    const originalContents = document.body.innerHTML;
    const printContents = receiptRef.current.innerHTML;

    document.body.innerHTML = printContents;

    window.print();

    document.body.innerHTML = originalContents;

    // Navigate back after printing
    if (item.orderdelivarytype == "corporate") {
      window.location.assign("/corporate-booking-list");
    } else {
      window.location.assign("/apartment-booking-list");
    }

    // navigate(-1)
  };

  useEffect(() => {
    if (hasPrinted.current) return; // Prevent multiple print attempts

    if (document.readyState === "complete") {
      const timer = setTimeout(() => {
        printReceipt();
        hasPrinted.current = true;
      }, 500);

      return () => clearTimeout(timer);
    } else {
      const handleLoad = () => {
        const timer = setTimeout(() => {
          printReceipt();
          hasPrinted.current = true;
        }, 500);

        window.removeEventListener("load", handleLoad);
      };

      window.addEventListener("load", handleLoad);

      return () => window.removeEventListener("load", handleLoad);
    }
  }, []);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", backgroundColor: "#f5f5f5", alignItems: "center" }}>
        <MdArrowBackIosNew
          onClick={() => navigate(-1)}
          style={{ color: "black", fontSize: "26px", cursor: "pointer" }}
        />
        <button
          style={{
            cursor: "pointer",
            backgroundColor: "#d81d4a",
            color: "white",
            border: "none",
            padding: "8px 20px",
            borderRadius: "4px",
            fontWeight: "600",
            fontSize: "14px",
            transition: "background-color 0.2s",
          }}
          onClick={printReceipt}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#b5173e")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#d81d4a")}
        >
          PRINT RECEIPT
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "center", backgroundColor: "#f5f5f5", padding: "20px" }}>
        <div
          id="thermal-receipt"
          ref={receiptRef}
          style={{
            width: "80mm",
            backgroundColor: "white",
            padding: "8mm",
            fontFamily: "'Courier New', monospace",
            fontSize: "12px",
            lineHeight: "1.4",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            borderRadius: "4px",
          }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "10px" }}>
            <div style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "4px", fontFamily: "'Imperial Script', cursive", letterSpacing: "1px" }}>
              DailyDish
            </div>
            <div style={{ fontSize: "11px" }}>Bangalore, Karnataka</div>
            <div style={{ fontSize: "11px" }}>GSTIN: 29AAMCC3615N1Z6</div>
            <div style={{ borderBottom: "1px dashed #000", margin: "10px 0" }}></div>
          </div>

          {/* Order Info */}
          <div style={{ marginBottom: "10px" }}>
            <table style={{ width: "100%", fontSize: "11px" }}>
              <tbody>
                <tr>
                  <td style={{ padding: "2px 0" }}>Order #:</td>
                  <td style={{ textAlign: "right", padding: "2px 0" }}>{item?.orderid || "-"}</td>
                </tr>
                <tr>
                  <td style={{ padding: "2px 0" }}>Type:</td>
                  <td style={{ textAlign: "right", padding: "2px 0" }}>{item?.orderdelivarytype || "-"}</td>
                </tr>
                <tr>
                  <td style={{ padding: "2px 0" }}>Booking Date:</td>
                  <td style={{ textAlign: "right", padding: "2px 0" }}>
                    {item?.createdAt ? `${moment(item.createdAt).format("DD-MM-YYYY")}` : "-"}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "2px 0" }}>Booking Slot:</td>
                  <td style={{ textAlign: "right", padding: "2px 0" }}>
                    {item?.slot ? item?.slot : "-"}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "2px 0" }}>Delivery Date:</td>
                  <td style={{ textAlign: "right", padding: "2px 0" }}>
                    {item?.updatedAt ? moment(item.updatedAt).format("DD-MM-YYYY hh:mm A") : "-"}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "2px 0" }}>Customer:</td>
                  <td style={{ textAlign: "right", padding: "2px 0" }}>{item?.username || "-"}</td>
                </tr>
                <tr>
                <td style={{ padding: "2px 0" }}>Customer Type:</td>
                <td style={{ textAlign: "right", padding: "2px 0" }}>{item?.customerType || "Normal"}</td>
                </tr>
                <tr>
                  <td style={{ padding: "2px 0" }}>Address:</td>
                  <td style={{ textAlign: "right", padding: "2px 0" }}>
                    {item?.delivarylocation && item?.addressline
                      ? `${item.delivarylocation}, ${item.addressline}`
                      : "-"}
                  </td>
                </tr>
              </tbody>
            </table>
            <div style={{ borderBottom: "1px dashed #000", margin: "10px 0" }}></div>
          </div>

          {/* Items Table */}
          <div>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0", fontSize: "11px" }}>
              <thead>
                <tr style={{ fontWeight: "bold", borderBottom: "1px dashed #000" }}>
                  <td style={{ width: "40%", textAlign: "left", padding: "4px 2px", border: "0.5px solid #555" }}>Item</td>
                  <td style={{ width: "15%", textAlign: "center", padding: "4px 2px", border: "0.5px solid #555" }}>Qty</td>
                  <td style={{ width: "25%", textAlign: "right", padding: "4px 2px", border: "0.5px solid #555" }}>Price</td>
                  <td style={{ width: "20%", textAlign: "right", padding: "4px 2px", border: "0.5px solid #555" }}>Amount</td>
                </tr>
              </thead>
              <tbody>
                {item?.allProduct?.map((items, index) => (
                  <tr key={index}>
                    <td style={{ textAlign: "left", padding: "4px 2px", wordBreak: "break-word", border: "0.5px solid #555" }}>
                      {items?.foodItemId?.foodname || "-"}
                    </td>
                    <td style={{ textAlign: "center", padding: "4px 2px", border: "0.5px solid #555" }}>
                      {items?.quantity || 0}
                    </td>
                    <td style={{ textAlign: "right", padding: "4px 2px", border: "0.5px solid #555" }}>
                      ₹ {items?.totalPrice ? Number(items.totalPrice/items?.quantity).toFixed(2) : "0.00"}
                    </td>
                    <td style={{ textAlign: "right", padding: "4px 2px", border: "0.5px solid #555" }}>
                       ₹ {items?.totalPrice ? Number(items.totalPrice).toFixed(2) : "0.00"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ borderBottom: "1px dashed #000", margin: "10px 0" }}></div>
          </div>

          {/* Totals */}
          <div>
            <table style={{ width: "100%", fontSize: "11px" }}>
              <tbody>
                <tr>
                  <td style={{ textAlign: "left", padding: "2px 0" }}>Subtotal:</td>
                  <td style={{ textAlign: "right", padding: "2px 0" }}>
                    ₹ {item?.subTotal ? Number(item.subTotal).toFixed(2) : "0.00"}
                  </td>
                </tr>
                <tr>
                  <td style={{ textAlign: "left", padding: "2px 0" }}>Delivery:</td>
                  <td style={{ textAlign: "right", padding: "2px 0" }}>
                    {item?.delivarytype <= 0 ? "Free" : `₹ ${Number(item.delivarytype).toFixed(2)}`}
                  </td>
                </tr>
                <tr>
                  <td style={{ textAlign: "left", padding: "2px 0" }}>Tax (5%):</td>
                  <td style={{ textAlign: "right", padding: "2px 0" }}>
                    ₹ {item?.tax ? Number(item.tax).toFixed(2) : "0.00"}
                  </td>
                </tr>
                {item?.Cutlery > 0 && (
                  <tr>
                    <td style={{ textAlign: "left", padding: "2px 0" }}>Cutlery:</td>
                    <td style={{ textAlign: "right", padding: "2px 0" }}>
                      ₹ {Number(item.Cutlery).toFixed(2)}
                    </td>
                  </tr>
                )}
                {item?.coupon > 0 && (
                  <tr>
                    <td style={{ textAlign: "left", padding: "2px 0" }}>Discount:</td>
                    <td style={{ textAlign: "right", padding: "2px 0" }}>
                      -₹ {Number(item.coupon).toFixed(2)}
                    </td>
                  </tr>
                )}
                {item?.discountWallet > 0 && (
                  <tr>
                    <td style={{ textAlign: "left", padding: "2px 0" }}>Apply Wallet:</td>
                    <td style={{ textAlign: "right", padding: "2px 0" }}>
                      -₹ {Number(item.discountWallet).toFixed(2)}
                    </td>
                  </tr>
                )}
                <tr style={{ borderTop: "1px dashed #000", fontWeight: "bold" }}>
                  <td style={{ textAlign: "left", padding: "6px 0 2px" }}>TOTAL:</td>
                  <td style={{ textAlign: "right", padding: "6px 0 2px" }}>
                    ₹ {item?.allTotal ? Number(item.allTotal).toFixed(2) : "0.00"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div style={{ marginTop: "15px", textAlign: "center", fontSize: "10px" }}>
            <div>Invoice #: {item?.orderid || "-"}</div>
            <div style={{ marginTop: "6px", fontWeight: "600" }}>Thank you for your order!</div>
            <div>Visit us again soon</div>
            <div style={{ borderTop: "1px dashed #000", marginTop: "10px", paddingTop: "10px" }}>
              {moment().format("DD-MM-YYYY hh:mm A")}
            </div>
          </div>
        </div>
      </div>

      {/* Add print-specific styles */}
      <style type="text/css" media="print">
        {`
          @page {
            size: 80mm auto;
            margin: 0;
          }
          
          body {
            margin: 0;
            padding: 0;
            font-family: 'Courier New', monospace;
          }
          
          #thermal-receipt {
            width: 100%;
            box-shadow: none;
            padding: 8mm;
            font-size: 12px;
            line-height: 1.4;
          }

          table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
          }

          .items-table th, .items-table td {
            padding: 4px 2px;
            border: 0.5px solid #555;
          }

          .items-table th {
            font-weight: bold;
            border-bottom: 1px dashed #000;
          }
        `}
      </style>
    </>
  );
}

export default ThermalInvoice;