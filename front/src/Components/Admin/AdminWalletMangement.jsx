import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  Table,
  Modal,
  Form,
  InputGroup,
  FormControl,
  Spinner,
} from "react-bootstrap";
import moment from "moment";
import { LuPartyPopper, LuDownload } from "react-icons/lu";
import { GiPartyPopper } from "react-icons/gi";
import { FaSearch } from "react-icons/fa";

import { CSVLink } from "react-csv";
import ReactPaginate from "react-paginate"; // Import ReactPaginate

// CSS for ReactPaginate (add to your CSS file or a <style> tag)

const AdminWalletManagement = () => {
  const [AllWallet, setAllWallet] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState({
    current: 0,
    total: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");

  const AdminWallet = async (page = 1, search = "") => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search: search,
        sortBy: "_id",
        sortOrder: "desc",
      });

      const response = await axios.get(
        `http://localhost:7013/api/wallet/all?${params}`
      );
      setAllWallet(response.data.success);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching wallets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    AdminWallet(1, searchQuery);
  }, [searchQuery]);

  const [selectedWallet, setSelectedWallet] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [actionType, setActionType] = useState("add");
  const [loading, setLoading] = useState(false);

  // Pagination states for transactions
  const [txnPage, setTxnPage] = useState(0);
  const transactionsPerPage = 5;

  // Pagination logic for transactions
  const txnPageCount = Math.ceil(transactions.length / transactionsPerPage);
  const indexOfLastTxn = (txnPage + 1) * transactionsPerPage;
  const indexOfFirstTxn = indexOfLastTxn - transactionsPerPage;
  const currentTransactions = transactions.slice(
    indexOfFirstTxn,
    indexOfLastTxn
  );

  // Handle page change for wallets
  const changePage = ({ selected }) => {
    const newPage = selected + 1; // ReactPaginate uses 0-based indexing, our API uses 1-based
    AdminWallet(newPage, searchQuery);
  };

  // Handle page change for transactions
  const changeTxnPage = ({ selected }) => {
    setTxnPage(selected);
  };

  // Function to fetch all wallets for export in chunks
  const fetchAllWalletsForExport = async () => {
    setIsExporting(true);
    setExportProgress({ current: 0, total: 0 });

    try {
      let allWallets = [];
      let currentPage = 1;
      let hasMorePages = true;
      let totalCount = 0;

      while (hasMorePages) {
        const params = new URLSearchParams({
          search: searchQuery,
          page: currentPage.toString(),
          limit: "1000", // Process 1000 records at a time
        });

        const response = await axios.get(
          `http://localhost:7013/api/wallet/export-all?${params}`
        );
        const chunkData = response.data.success;
        const pagination = response.data.pagination;

        allWallets = [...allWallets, ...chunkData];
        hasMorePages = pagination.hasNextPage;
        currentPage++;
        totalCount = pagination.totalCount;

        // Update progress
        setExportProgress({
          current: allWallets.length,
          total: totalCount,
        });
      }

      return allWallets;
    } catch (error) {
      console.error("Error fetching wallets for export:", error);
      return [];
    } finally {
      setIsExporting(false);
      setExportProgress({ current: 0, total: 0 });
    }
  };

  // Handle search with debouncing
  const handleSearch = (value) => {
    setSearchQuery(value);
    AdminWallet(1, value); // Reset to first page when searching
  };

  const handleManageWallet = (wallet, type) => {
    setSelectedWallet(wallet);
    setActionType(type);
    setAmount(0);
    setDescription("");
    setExpiryDate("");
    setShowModal(true);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await axios.post(
        actionType === "add"
          ? "http://localhost:7013/api/wallet/add-free-cash"
          : "http://localhost:7013/api/wallet/deduct-cash",
        {
          userId: selectedWallet?.userId?._id,
          amount: amount,
          description,
          expiryDays: actionType === "add" ? expiryDate : null,
        }
      );
      setShowModal(false);
      AdminWallet(pagination.currentPage, searchQuery);
    } catch (error) {
      console.error("Error updating wallet:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      {/* Inject pagination styles */}
      {/* <style>{paginationStyles}</style> */}

      <h2 className="text-center mb-4  ">
        <LuPartyPopper className="header-c  me-2" /> Admin Wallet Management
      </h2>

      {/* Search and Export */}
      <div className="d-flex justify-content-between mb-4 flex-wrap">
        <InputGroup className="w-50" style={{ minWidth: "200px" }}>
          <InputGroup.Text>
            <FaSearch />
          </InputGroup.Text>
          <FormControl
            placeholder="Search by Mobile or Username..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </InputGroup>
        <Button
          variant="outline-success"
          className="mt-2 mt-md-0"
          disabled={isExporting}
          onClick={async () => {
            try {
              const allWallets = await fetchAllWalletsForExport();

              if (allWallets.length === 0) {
                alert("No data to export");
                return;
              }

              // Optimized CSV generation for large datasets
              const headers = [
                "Mobile",
                "FirstName",
                "LastName",
                "Email",
                "Balance",
                "CompanyId",
                "CreatedAt",
                "UpdatedAt",
                "TotalTransactions",
              ];

              // Build CSV content efficiently
              let csvContent = headers.join(",") + "\n";

              for (const wallet of allWallets) {
                const row = [
                  wallet.userId?.Mobile ? String(wallet.userId.Mobile) : "N/A",
                  wallet.userId?.Fname || "Unknown",
                  wallet.userId?.Lname || "",
                  wallet.userId?.Email || "",
                  wallet.balance?.toFixed(2) || "0.00",
                  wallet.companyId || "",
                  wallet.createdAt
                    ? moment(wallet.createdAt).format("YYYY-MM-DD HH:mm:ss")
                    : "",
                  wallet.updatedAt
                    ? moment(wallet.updatedAt).format("YYYY-MM-DD HH:mm:ss")
                    : "",
                  wallet.transactions?.length || 0,
                ];

                // Escape CSV values and join
                csvContent +=
                  row
                    .map((value) => `"${String(value).replace(/"/g, '""')}"`)
                    .join(",") + "\n";
              }

              // Download CSV
              const blob = new Blob([csvContent], {
                type: "text/csv;charset=utf-8;",
              });
              const link = document.createElement("a");
              const url = URL.createObjectURL(blob);
              link.setAttribute("href", url);
              link.setAttribute(
                "download",
                `wallets_${moment().format("YYYYMMDD")}.csv`
              );
              link.style.visibility = "hidden";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);

              // Clean up the URL object
              URL.revokeObjectURL(url);
            } catch (error) {
              console.error("Export failed:", error);
              alert("Export failed. Please try again.");
            }
          }}
        >
          {isExporting ? (
            <>
              <Spinner size="sm" className="me-2" />
              {exportProgress.total > 0
                ? `Exporting... ${exportProgress.current}/${exportProgress.total}`
                : "Exporting..."}
            </>
          ) : (
            <>
              <LuDownload className="me-2" /> Export All to CSV
            </>
          )}
        </Button>
      </div>

      {/* Wallet Table */}
      <Table
        striped
        bordered
        hover
        responsive
        className="text-center shadow-sm"
      >
        <thead className="table-dark">
          <tr>
            <th>Mobile Number</th>
            <th>User Name</th>
            <th>Balance</th>
            <th>Last Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={5}>
                <Spinner animation="border" variant="primary" />
              </td>
            </tr>
          ) : AllWallet.length > 0 ? (
            AllWallet.map((wallet) => (
              <tr key={wallet._id}>
                <td>
                  {wallet.userId?.Mobile ? String(wallet.userId.Mobile) : "N/A"}
                </td>
                <td>{wallet.userId?.Fname || "Unknown"}</td>
                <td className="text-success">
                  ₹{wallet.balance?.toFixed(2) || "0.00"}
                </td>
                <td>{moment(wallet.updatedAt).format("lll")}</td>
                <td>
                  <Button
                    variant="outline-success"
                    size="sm"
                    className="me-2"
                    onClick={() => handleManageWallet(wallet, "add")}
                  >
                    <LuPartyPopper /> Add Bonus
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    className="me-2"
                    onClick={() => handleManageWallet(wallet, "deduct")}
                  >
                    Deduct
                  </Button>
                  <Button
                    variant="outline-info"
                    size="sm"
                    onClick={() => {
                      setTxnPage(0);
                      setTransactions(wallet?.transactions?.reverse() || []);
                      setSelectedWallet(wallet);
                      setShowTransactionModal(true);
                    }}
                  >
                    Transactions
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5}>No wallets found</td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Pagination for Wallets with ReactPaginate */}
      <ReactPaginate
        previousLabel={"Back"}
        nextLabel={"Next"}
        pageCount={pagination.totalPages}
        onPageChange={changePage}
        containerClassName={"paginationBttns"}
        previousLinkClassName={"previousBttn"}
        nextLinkClassName={"nextBttn"}
        disabledClassName={"paginationDisabled"}
        activeClassName={"paginationActive"}
        forcePage={pagination.currentPage - 1} // Convert to 0-based for ReactPaginate
      />

      {/* Wallet Management Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        className="animate__animated animate__fadeIn"
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title
            className={actionType === "add" ? "text-success" : "text-danger"}
          >
            {actionType === "add" ? "Add Bonus" : "Deduct Amount"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <strong>User:</strong> {selectedWallet?.userId?.Fname || "Unknown"}
          </p>
          <p>
            <strong>Current Balance:</strong> ₹
            {selectedWallet?.balance?.toFixed(2) || "0.00"}
          </p>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description"
              />
            </Form.Group>
            {actionType === "add" && (
              <Form.Group className="mb-3">
                <Form.Label>Expiry Date</Form.Label>
                <Form.Control
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </Form.Group>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowModal(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant={actionType === "add" ? "success" : "danger"}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <Spinner size="sm" />
            ) : actionType === "add" ? (
              "Add Bonus"
            ) : (
              "Deduct Amount"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Transaction History Modal */}
      <Modal
        show={showTransactionModal}
        onHide={() => setShowTransactionModal(false)}
        centered
        size="lg"
        className="animate__animated animate__fadeIn"
        style={{ zIndex: 9999999 }}
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>
            Transaction History - {selectedWallet?.userId?.Fname || "Unknown"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentTransactions.length > 0 ? (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Amount</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th>Expiry</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {currentTransactions.map((txn, index) => (
                  <tr key={index}>
                    <td
                      style={{ color: txn.type === "credit" ? "green" : "red" }}
                    >
                      {txn.type === "credit"
                        ? `+₹${txn.amount}`
                        : `-₹${Math.abs(txn.amount)}`}
                    </td>
                    <td
                      style={{ color: txn.type === "credit" ? "green" : "red" }}
                    >
                      {txn.type === "credit" && (
                        <GiPartyPopper color="#efa633" size={20} />
                      )}{" "}
                      {txn.description}
                    </td>
                    <td
                      style={{ color: txn.type === "credit" ? "green" : "red" }}
                    >
                      {moment(txn.createdAt).format("lll")}
                    </td>
                    <td
                      style={{ color: txn.type === "credit" ? "green" : "red" }}
                    >
                      {txn.expiryDate
                        ? moment(txn.expiryDate).format("lll")
                        : "-"}
                    </td>
                    <td
                      style={{ color: txn.type === "credit" ? "green" : "red" }}
                    >
                      {txn.type}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-center text-muted">No transactions found.</p>
          )}
          {/* Pagination for Transactions with ReactPaginate */}
          <ReactPaginate
            previousLabel={"Back"}
            nextLabel={"Next"}
            pageCount={txnPageCount}
            onPageChange={changeTxnPage}
            containerClassName={"paginationBttns"}
            previousLinkClassName={"previousBttn"}
            nextLinkClassName={"nextBttn"}
            disabledClassName={"paginationDisabled"}
            activeClassName={"paginationActive"}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowTransactionModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminWalletManagement;
