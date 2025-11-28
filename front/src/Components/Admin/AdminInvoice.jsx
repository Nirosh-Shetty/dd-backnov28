import React, { useState, useEffect, useMemo } from "react";
import { Row, Col } from "reactstrap";
import { MdArrowBackIosNew } from "react-icons/md";
import Table from "react-bootstrap/Table";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import moment from "moment";
import { useLocation, useNavigate } from "react-router-dom";
function AdminInvoice() {
  let location = useLocation();
  const { item } = location?.state;

  const createPDF = async () => {
    // setRotate(360);
    const pageWidth = 80;
    const pageHeight = 120;

    const pdf = new jsPDF({ unit: "mm", format: [pageWidth, pageHeight] });

    const data = await html2canvas(document.querySelector("#pdf"));
    const img = data.toDataURL("image/png");
    const imgProperties = pdf.getImageProperties(img);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;
    pdf.addImage(img, "PNG", 0, 0, pageWidth, pageHeight);
    pdf.save("Invoice.pdf");
  };
  const navigate = useNavigate();

  const subtotal = useMemo(() => {
    return item?.allProduct?.reduce((acc, item) => {
      return (
        Number(acc) + Number(item.quantity) * Number(item.foodItemId.totalprice)
      );
    }, 0);
  }, [item]);

  const total = useMemo(() => {
    return (
      Number(item?.subTotal) +
      Number(item?.Cutlery) +
      Number(item?.tax) +
      Number(item?.delivarytype)
    );
  }, [subtotal, item]);

  return (
    <>
      <MdArrowBackIosNew
        onClick={() => navigate("/dashboard")}
        style={{
          color: "black",
          fontSize: "26px",
          marginLeft: "5px",
          marginTop: "5px",
        }}
      />

      <div style={{ backgroundColor: "white", padding: "5%" }}>
        <div id="pdf" className="pl-1 pr-1">
          <div
            style={{
              textAlign: "center",
              fontSize: "30px",
              fontWeight: "700",
              fontFamily: "Imperial Script",
            }}
          >
            DailyDish
          </div>
          <div style={{ textAlign: "center", fontSize: "12px" }}>Banglore</div>
          <div style={{ textAlign: "center", fontSize: "12px" }}>
            GSTIN : 29AAMCC3615N1Z6
          </div>

          <span className="mt-3">Type:{item?.orderdelivarytype}</span>
          <br />
          <span>Prefix Code:{item?.prefixcode}</span>
          <br></br>
          <span>Name:{item?.username}</span>
          <br></br>

          <span>
            Address:{item?.delivarylocation},{item?.addressline}
          </span>
          <br></br>
          <span>Contact:{item?.Mobilenumber}</span>
          <br />
          <span>Order:{item?.orderid}</span>
          <br></br>
          {/* <span style={{marginTop:'10px',marginBottom:'10px' }}>
                    Order Date:
                  </span>{" "}
                  {moment(item?.Placedon).format("DD/MM/YYYY")}
          <br /> */}
          {/* <span style={{marginTop:'10px',marginBottom:'10px' }}>
                    Payment Type :{" "}
                  </span>
                  {item?.paymentmethod} */}
          <Row>
            <Col md={"12"}>
              <Table striped responsive className="mt-3">
                <thead>
                  <tr
                    style={{
                      color: "Black",
                      fontWeight: "600",
                      textAlign: "center",
                    }}
                    className="tableHead"
                  >
                    <th style={{ fontSize: "12px" }}>Order</th>
                    {/* <th style={{ fontSize: "12px" }}>Volumetype</th> */}
                    <th style={{ fontSize: "12px" }}>Qty</th>
                    <th style={{ fontSize: "12px" }}>Price</th>
                    <th style={{ fontSize: "12px" }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {item?.allProduct?.map((items) => {
                    return (
                      <tr style={{ textAlign: "center" }}>
                        <td style={{ fontSize: "12px", textAlign: "center" }}>
                          {items?.foodItemId.foodname}
                        </td>
                        {/* <td style={{ fontSize: "12px", textAlign: "center" }}>
                        {items?.foodItemId.quantity}
                        {items?.foodItemId.unit}
                      </td> */}
                        <td style={{ fontSize: "12px", textAlign: "center" }}>
                          {items?.quantity}
                        </td>
                        <td style={{ fontSize: "12px", textAlign: "center" }}>
                          {items?.foodItemId.foodprice}{" "}
                        </td>
                        <td style={{ fontSize: "12px", textAlign: "center" }}>
                          {(
                            items?.quantity * items?.foodItemId.foodprice
                          ).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
              <Table>
                <thead></thead>
                <tbody>
                  <tr>
                    <td
                      style={{
                        textAlign: "left",
                        fontSize: "14px",
                        fontWeight: "400",
                      }}
                    >
                      Subtotal
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        fontSize: "14px",
                        fontWeight: "400",
                      }}
                    >
                      {" "}
                      ₹ {item?.subTotal}
                    </td>
                  </tr>
                  {item?.delivarytype <= 0 ? (
                    <tr>
                      <td
                        style={{
                          textAlign: "left",
                          fontSize: "14px",
                          fontWeight: "400",
                        }}
                      >
                        Delivery Charge
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          fontSize: "14px",
                          fontWeight: "400",
                        }}
                      >
                        {" "}
                        Free
                      </td>
                    </tr>
                  ) : (
                    <tr>
                      <td
                        style={{
                          textAlign: "left",
                          fontSize: "14px",
                          fontWeight: "400",
                        }}
                      >
                        Delivery Charge
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          fontSize: "14px",
                          fontWeight: "400",
                        }}
                      >
                        {" "}
                        ₹ {item?.delivarytype}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td
                      style={{
                        textAlign: "left",
                        fontSize: "14px",
                        fontWeight: "400",
                      }}
                    >
                      Tax (5%)
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        fontSize: "14px",
                        fontWeight: "400",
                      }}
                    >
                      {" "}
                      ₹ {item?.tax?.toFixed(2)}
                    </td>
                  </tr>
                  {item?.Cutlery > 0 ? (
                    <>
                      <tr>
                        <td
                          style={{
                            textAlign: "left",
                            fontSize: "14px",
                            fontWeight: "400",
                          }}
                        >
                          Cutley
                        </td>
                        <td
                          style={{
                            textAlign: "right",
                            fontSize: "14px",
                            fontWeight: "400",
                          }}
                        >
                          {" "}
                          ₹ {item?.Cutlery}
                        </td>
                      </tr>
                    </>
                  ) : (
                    <></>
                  )}
                  {item?.coupon > 0 ? (
                    <>
                      <tr>
                        <td
                          style={{
                            textAlign: "left",
                            fontSize: "14px",
                            fontWeight: "400",
                          }}
                        >
                          Coupon Discount
                        </td>
                        <td
                          style={{
                            textAlign: "right",
                            fontSize: "14px",
                            fontWeight: "400",
                            color: "green",
                          }}
                        >
                          {" "}
                          ₹ {item?.coupon}
                        </td>
                      </tr>
                    </>
                  ) : (
                    <></>
                  )}
                  {item?.discountWallet > 0 ? (
                    <>
                      <tr>
                        <td
                          style={{
                            textAlign: "left",
                            fontSize: "14px",
                            fontWeight: "400",
                          }}
                        >
                          Apply Wallet
                        </td>
                        <td
                          style={{
                            textAlign: "right",
                            fontSize: "14px",
                            fontWeight: "400",
                            color: "green",
                          }}
                        >
                          {" "}
                          ₹ {item?.discountWallet}
                        </td>
                      </tr>
                    </>
                  ) : (
                    <></>
                  )}

                  <tr>
                    <td
                      style={{
                        textAlign: "left",
                        fontSize: "14px",
                        fontWeight: "400",
                      }}
                    >
                      Total
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        fontSize: "14px",
                        fontWeight: "400",
                      }}
                    >
                      {" "}
                      ₹ {total?.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Col>
          </Row>
          <b>Invoice Number : {item?.orderid}</b>
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            style={{
              textAlign: "center",
              cursor: "pointer",
              marginTop: "30px",
              backgroundColor: "rgb(216 29 74)",
              color: "white",
              border: "none",
              padding: "15px",
              border: "1px solid white",
            }}
            onClick={createPDF}
          >
            DOWNLOAD
          </button>
        </div>
      </div>
    </>
  );
}

export default AdminInvoice;
