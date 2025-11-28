import React, { useEffect, useRef } from "react";
import { MdArrowBackIosNew } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";

function MultipleInvoice() {
  const location = useLocation();
  const { items } = location?.state || { items: [] }; // Expect array of orders
  const navigate = useNavigate();
  const receiptContainerRef = useRef(null);
  const hasPrinted = useRef(false);

  // Function to print all receipts - SIMPLE WORKING VERSION
  const printReceipts = () => {
    if (!items.length) {
      navigate(-1);
      return;
    }

    // Simple approach: just trigger browser print
    window.print();
  };

  useEffect(() => {
    if (hasPrinted.current) return; // Prevent multiple prints

    if (document.readyState === "complete") {
      const timer = setTimeout(() => {
        printReceipts();
        hasPrinted.current = true;
      }, 500);

      return () => clearTimeout(timer);
    } else {
      const handleLoad = () => {
        const timer = setTimeout(() => {
          printReceipts();
          hasPrinted.current = true;
        }, 2000);

        window.removeEventListener("load", handleLoad);
      };

      window.addEventListener("load", handleLoad);

      return () => window.removeEventListener("load", handleLoad);
    }
  }, []);

  // Alternative manual print function for the button
  const handleManualPrint = () => {
    printReceipts();
  };

  return (
    <>
      {/* Add CSS to hide header during print */}
      <style>
        {`
          @media print {
            @page {
              margin: 10mm;
            }
            
            .no-print {
              display: none !important;
            }
            
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              height: auto !important;
            }
            
            .receipt-container {
              background: white !important;
              padding: 0 !important;
              margin: 0 !important;
            }
            
            .thermal-receipt {
              page-break-before: always;
              page-break-after: always;
              page-break-inside: avoid;
              margin: 0 auto !important;
              padding: 8mm !important;
              box-shadow: none !important;
              border-radius: 0 !important;
            }
            
            .thermal-receipt:first-child {
              page-break-before: avoid;
            }
            
            .thermal-receipt:last-child {
              page-break-after: avoid;
            }
          }
        `}
      </style>

      {/* Header - Add no-print class */}
      <div
        className="no-print"
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "10px",
          backgroundColor: "#f5f5f5",
          alignItems: "center",
        }}
      >
        <MdArrowBackIosNew
          onClick={() => navigate("/packer-dashboard")} // Use navigate instead of window.location.assign
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
          onClick={handleManualPrint} // Use the manual print function instead of reload
          onMouseOver={(e) => (e.target.style.backgroundColor = "#b5173e")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#d81d4a")}
        >
          PRINT ALL RECEIPTS
        </button>
      </div>

      <div
        className="receipt-container"
        style={{
          display: "flex",
          justifyContent: "center",
          backgroundColor: "#f5f5f5",
          padding: "20px",
        }}
      >
        <div ref={receiptContainerRef}>
          {items.map((item, index) => (
            <div
              key={item.orderid || index}
              className="thermal-receipt"
              style={{
                width: "80mm",
                backgroundColor: "white",
                padding: "8mm",
                fontFamily: "'Courier New', monospace",
                fontSize: "12px",
                lineHeight: "1.4",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                borderRadius: "4px",
                marginBottom: "10px",
                marginLeft: "auto", // Center horizontally
                marginRight: "auto",
                fontWeight: 600
              }}
            >
              {/* Header */}
              <div style={{ textAlign: "center", marginBottom: "10px" }}>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    marginBottom: "4px",
                    fontFamily: "'Imperial Script', cursive",
                    letterSpacing: "1px",
                  }}
                >
                  DailyDish
                </div>
                <div style={{ fontSize: "11px" }}>Bangalore, Karnataka</div>
                <div style={{ fontSize: "11px" }}>GSTIN: 29AAMCC3615N1Z6</div>
                <div
                  style={{ borderBottom: "1px dashed #000", margin: "10px 0" }}
                ></div>
              </div>

              {/* Order Info */}
              <div style={{ marginBottom: "10px" }}>
                <table style={{ width: "100%", fontSize: "11px" }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: "2px 0" }}>Order #:</td>
                      <td style={{ textAlign: "right", padding: "2px 0" }}>
                        {item?.orderid || "-"}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "2px 0" }}>Type:</td>
                      <td style={{ textAlign: "right", padding: "2px 0" }}>
                        {item?.orderdelivarytype || "-"}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "2px 0" }}>Booking Date:</td>
                      <td style={{ textAlign: "right", padding: "2px 0" }}>
                        {item?.createdAt
                          ? moment(item.createdAt).format("DD-MM-YYYY")
                          : "-"}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "2px 0" }}>Booking Slot:</td>
                      <td style={{ textAlign: "right", padding: "2px 0" }}>
                        {item?.slot ? item.slot : "-"}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "2px 0" }}>Delivery Date:</td>
                      <td style={{ textAlign: "right", padding: "2px 0" }}>
                        {item?.updatedAt
                          ? moment(item.updatedAt).format("DD-MM-YYYY hh:mm A")
                          : "-"}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "2px 0" }}>Customer:</td>
                      <td style={{ textAlign: "right", padding: "2px 0" }}>
                        {item?.username || "-"}
                      </td>
                    </tr>
                    {item?.studentName && (
                      <tr>
                        <td style={{ padding: "2px 0" }}>Student:</td>
                        <td style={{ textAlign: "right", padding: "2px 0" }}>
                          {item?.studentName || "-"} {item?.studentClass || "-"}{" "}
                          {item?.studentSection || "-"}
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td style={{ padding: "2px 0" }}>Customer Type:</td>
                      <td style={{ textAlign: "right", padding: "2px 0" }}>
                        {item?.customerType || "Normal"}
                      </td>
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
                <div
                  style={{ borderBottom: "1px dashed #000", margin: "10px 0" }}
                ></div>
              </div>

              {/* Items Table */}
              <div>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "separate",
                    borderSpacing: "0",
                    fontSize: "11px",
                    fontWeight: 600
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        fontWeight: "bold",
                        borderBottom: "1px dashed #000",
                      }}
                    >
                      <td
                        style={{
                          width: "40%",
                          textAlign: "left",
                          padding: "4px 2px",
                          border: "0.5px solid #555",
                        }}
                      >
                        Item
                      </td>
                      <td
                        style={{
                          width: "15%",
                          textAlign: "center",
                          padding: "4px 2px",
                          border: "0.5px solid #555",
                        }}
                      >
                        Qty
                      </td>
                      <td
                        style={{
                          width: "25%",
                          textAlign: "right",
                          padding: "4px 2px",
                          border: "0.5px solid #555",
                        }}
                      >
                        Price
                      </td>
                      <td
                        style={{
                          width: "20%",
                          textAlign: "right",
                          padding: "4px 2px",
                          border: "0.5px solid #555",
                        }}
                      >
                        Amount
                      </td>
                    </tr>
                  </thead>
                  <tbody>
                    {item?.allProduct?.map((items, idx) => (
                      <tr key={idx}>
                        <td
                          style={{
                            textAlign: "left",
                            padding: "4px 2px",
                            wordBreak: "break-word",
                            border: "0.5px solid #555",
                          }}
                        >
                          {items?.foodItemId?.foodname || items?.name}
                        </td>
                        <td
                          style={{
                            textAlign: "center",
                            padding: "4px 2px",
                            border: "0.5px solid #555",
                          }}
                        >
                          {items?.quantity || 0}
                        </td>
                        <td
                          style={{
                            textAlign: "right",
                            padding: "4px 2px",
                            border: "0.5px solid #555",
                          }}
                        >
                          ₹{" "}
                          {items?.totalPrice
                            ? Number(items?.totalPrice/items?.quantity).toFixed(2)
                            : "0.00"}
                        </td>
                        <td
                          style={{
                            textAlign: "right",
                            padding: "4px 2px",
                            border: "0.5px solid #555",
                          }}
                        >
                          ₹{" "}
                          {items?.quantity
                            ? items?.totalPrice.toFixed(2)
                            : "0.00"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div
                  style={{ borderBottom: "1px dashed #000", margin: "10px 0" }}
                ></div>
              </div>

              {/* Totals */}
              <div>
                <table style={{ width: "100%", fontSize: "11px" }}>
                  <tbody>
                    <tr>
                      <td style={{ textAlign: "left", padding: "2px 0" }}>
                        Subtotal:
                      </td>
                      <td style={{ textAlign: "right", padding: "2px 0" }}>
                        ₹{" "}
                        {item?.subTotal
                          ? Number(item.subTotal).toFixed(2)
                          : "0.00"}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ textAlign: "left", padding: "2px 0" }}>
                        Delivery:
                      </td>
                      <td style={{ textAlign: "right", padding: "2px 0" }}>
                        {item?.delivarytype <= 0
                          ? "Free"
                          : `₹ ${Number(item.delivarytype).toFixed(2)}`}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ textAlign: "left", padding: "2px 0" }}>
                        Tax (5%):
                      </td>
                      <td style={{ textAlign: "right", padding: "2px 0" }}>
                        ₹ {item?.tax ? Number(item.tax).toFixed(2) : "0.00"}
                      </td>
                    </tr>
                    {item?.Cutlery > 0 && (
                      <tr>
                        <td style={{ textAlign: "left", padding: "2px 0" }}>
                          Cutlery:
                        </td>
                        <td style={{ textAlign: "right", padding: "2px 0" }}>
                          ₹ {Number(item.Cutlery).toFixed(2)}
                        </td>
                      </tr>
                    )}
                    {item?.coupon > 0 && (
                      <tr>
                        <td style={{ textAlign: "left", padding: "2px 0" }}>
                          Discount:
                        </td>
                        <td style={{ textAlign: "right", padding: "2px 0" }}>
                          -₹ {Number(item.coupon).toFixed(2)}
                        </td>
                      </tr>
                    )}
                    {item?.discountWallet > 0 && (
                      <tr>
                        <td style={{ textAlign: "left", padding: "2px 0" }}>
                          Apply Wallet:
                        </td>
                        <td style={{ textAlign: "right", padding: "2px 0" }}>
                          -₹ {Number(item.discountWallet).toFixed(2)}
                        </td>
                      </tr>
                    )}
                    <tr
                      style={{
                        borderTop: "1px dashed #000",
                        fontWeight: "bold",
                      }}
                    >
                      <td style={{ textAlign: "left", padding: "6px 0 2px" }}>
                        TOTAL:
                      </td>
                      <td style={{ textAlign: "right", padding: "6px 0 2px" }}>
                        ₹{" "}
                        {item?.allTotal
                          ? Number(item.allTotal).toFixed(2)
                          : "0.00"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div
                style={{
                  marginTop: "15px",
                  textAlign: "center",
                  fontSize: "10px",
                }}
              >
                <div>Invoice #: {item?.orderid || "-"}</div>
                <div style={{ marginTop: "6px", fontWeight: "600" }}>
                  Thank you for your order!
                </div>
                <div>Visit us again soon</div>
                <div
                  style={{
                    borderTop: "1px dashed #000",
                    marginTop: "10px",
                    paddingTop: "10px",
                  }}
                >
                  {moment().format("DD-MM-YYYY hh:mm A")}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default MultipleInvoice;