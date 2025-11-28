import React, { useState, useEffect, useContext } from "react";
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
import { WalletContext } from "../../WalletContext";
import { CSVLink } from "react-csv";
import ReactPaginate from "react-paginate"; // Import ReactPaginate

// CSS for ReactPaginate (add to your CSS file or a <style> tag)

const CorparateWallet = () => {
  //   const { AllWallet, AdminWallet } = useContext(WalletContext);

  const [AllWallet, setAllWallet] = useState([]);

  const corparate = JSON.parse(localStorage.getItem("corparate"));

  const getCorporateWallet = async () => {
    try {
      const response = await axios.get(
        `http://localhost:7013/api/wallet/getAllWalletCompsny/${corparate._id}`
      );
      setAllWallet(response.data);
    } catch (error) {
      console.error("Error fetching corporate wallet:", error);
    }
  };

  useEffect(() => {
    if (corparate?._id) {
      getCorporateWallet();
    }
  }, [corparate?._id]);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [actionType, setActionType] = useState("add");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0); // ReactPaginate uses 0-based indexing
  const [txnPage, setTxnPage] = useState(0);
  const walletsPerPage = 5;
  const transactionsPerPage = 5;

  // Search logic with safe string conversion
  const filteredWallets = AllWallet.filter((wallet) => {
    const mobile = wallet.userId?.Mobile ? String(wallet.userId.Mobile) : "";
    const fname = wallet.userId?.Fname ? String(wallet.userId.Fname) : "";
    return (
      mobile.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fname.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Pagination logic for wallets
  const pageCount = Math.ceil(filteredWallets.length / walletsPerPage);
  const indexOfLastWallet = (currentPage + 1) * walletsPerPage;
  const indexOfFirstWallet = indexOfLastWallet - walletsPerPage;
  const currentWallets = filteredWallets.slice(
    indexOfFirstWallet,
    indexOfLastWallet
  );

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
    setCurrentPage(selected);
  };

  // Handle page change for transactions
  const changeTxnPage = ({ selected }) => {
    setTxnPage(selected);
  };

  // CSV export data with safe string conversion
  const csvData = AllWallet.map((wallet) => ({
    Mobile: wallet.userId?.Mobile ? String(wallet.userId.Mobile) : "N/A",
    Username: wallet.userId?.Fname || "Unknown",
    Balance: `₹${wallet.balance?.toFixed(2) || "0.00"}`,
    LastUpdated: moment(wallet.updatedAt).format("lll"),
  }));

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
      getCorporateWallet();
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
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(0); // Reset to first page on search
            }}
          />
        </InputGroup>
        <CSVLink
          data={csvData}
          filename={`wallets_${moment().format("YYYYMMDD")}.csv`}
          className="btn btn-outline-success mt-2 mt-md-0"
        >
          <LuDownload className="me-2" /> Export to CSV
        </CSVLink>
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
          {loading ? (
            <tr>
              <td colSpan={5}>
                <Spinner animation="border" variant="primary" />
              </td>
            </tr>
          ) : currentWallets.length > 0 ? (
            currentWallets.map((wallet) => (
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
        pageCount={pageCount}
        onPageChange={changePage}
        containerClassName={"paginationBttns"}
        previousLinkClassName={"previousBttn"}
        nextLinkClassName={"nextBttn"}
        disabledClassName={"paginationDisabled"}
        activeClassName={"paginationActive"}
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

export default CorparateWallet;
