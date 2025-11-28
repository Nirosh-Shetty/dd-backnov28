import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import "../../Styles/Excel.css";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const ImportExcel = () => {
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  const updateFoodStock = async () => {
    try {
      const config = {
        url: `/admin/updatefoodstocks`,
        method: "put",
        baseURL: "http://localhost:7013/api",
        headers: { "Content-Type": "application/json" },
        data: { data },
      };

      const res = await axios(config);
      if (res.status === 200) {
        console.log("Data updated successfully");
        navigate("/all-products");
      }
    } catch (error) {
      console.error("Error sending data to backend:", error);
    }
  };

  useEffect(() => {
    updateFoodStock();
  }, [data]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();

      // Read file as binary string
      reader.onload = (event) => {
        const binaryStr = event.target.result;
        const workbook = XLSX.read(binaryStr, { type: "binary" });

        // Get first sheet name and data
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(worksheet);
        setData(parsedData); // Update state with parsed data
        console.log("parsed", parsedData);
      };

      reader.readAsBinaryString(file);
    }
  };

  return (
    <div>
      <Button
        component="label"
        role={undefined}
        variant="contained"
        tabIndex={-1}

        // startIcon={<CloudUploadIcon />}
      >
        Import Excel
        <VisuallyHiddenInput
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
          multiple
        />
      </Button>
      {/* <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="importBtn" /> */}
      <div>
        {/* <h3>Excel Data:</h3> */}
        {/* <table border="1" cellPadding="5" cellSpacing="0">
          <thead>
            <tr>
              {data.length > 0 &&
                Object.keys(data[0]).map((key) => <th key={key}>{key}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                {Object.values(row).map((value, i) => (
                  <td key={i}>{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table> */}
      </div>
    </div>
  );
};

export default ImportExcel;
