import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Modal,
  CircularProgress,
} from "@mui/material";
// ++ Added MonetizationOn icon ++
import {
  PeopleAlt,
  Star,
  CalendarMonth,
  CardGiftcard,
  MonetizationOn,
} from "@mui/icons-material";
import axios from "axios";
import Swal2 from "sweetalert2";
import { Download } from "lucide-react";
import FileSaver from "file-saver";
import moment from "moment";
// IMPORTANT: Set this to your correct local backend URL
axios.defaults.baseURL = "http://localhost:7013/api";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const AdminReferralDashboard = () => {
  const [kpiData, setKpiData] = useState(null);
  const [referrersList, setReferrersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [defaultReferrerReward, setDefaultReferrerReward] = useState("");
  const [defaultFriendReward, setDefaultFriendReward] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [customReward, setCustomReward] = useState("");

  // ++ State for payout totals ++
  const [totalFriendPayout, setTotalFriendPayout] = useState(0);
  const [totalReferrerPayout, setTotalReferrerPayout] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch settings (includes initial payout totals)
        const settingsRes = await axios.get("/admin/referral-settings");
        if (settingsRes.data.success) {
          setDefaultReferrerReward(
            settingsRes.data.settings.referrerRewardAmount
          );
          setDefaultFriendReward(settingsRes.data.settings.friendRewardAmount);
          setTotalFriendPayout(
            settingsRes.data.settings.totalFriendPayout || 0
          );
          setTotalReferrerPayout(
            settingsRes.data.settings.totalReferrerPayout || 0
          );
        }

        // Fetch stats (includes more up-to-date payouts and KPIs)
        const statsRes = await axios.get("/admin/referral-settings/stats");
        if (statsRes.data.success) {
          setKpiData(statsRes.data.stats);
          // Update payouts from stats response
          setTotalFriendPayout(statsRes.data.stats.totalFriendPayout || 0);
          setTotalReferrerPayout(statsRes.data.stats.totalReferrerPayout || 0);
        }

        // Fetch the list of referrers for the table
        const referrersRes = await axios.get(
          "/admin/referral-settings/referrers-list"
        );
        if (referrersRes.data.success) {
          setReferrersList(referrersRes.data.users);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        Swal2.fire("Error", "Could not load dashboard data", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleExportExcel = async () => {
    // ++ MAKE THE FUNCTION ASYNC ++
    try {
      // 1. Show a loading message
      Swal2.fire({
        title: "Generating Report",
        text: "Please wait...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal2.showLoading();
        },
      });

      // 2. Call the API
      const response = await axios.get(
        "/admin/referral-settings/export-referrers",
        {
          responseType: "blob", // This is crucial for file downloads
        }
      );

      // 3. Create a blob from the response
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // 4. Use FileSaver to trigger the download
      const fileName = `referrers_list_${moment().format("YYYY-MM-DD")}.xlsx`;
      FileSaver.saveAs(blob, fileName);

      Swal2.close(); // Close the loading message
    } catch (error) {
      console.error("Error exporting Excel:", error);
      Swal2.fire(
        "Error",
        "Could not generate the report. Please try again.",
        "error"
      );
    }
  };

  // Modal Handlers
  const handleOpenEditModal = (user) => {
    setCurrentUser(user);
    setCustomReward(user.customReferralReward ?? ""); // Use ?? for nullish coalescing
    setEditModalOpen(true);
  };
  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setCurrentUser(null);
    setCustomReward("");
  };

  // API Call Handlers
  const handleSaveCustomReward = async () => {
    try {
      const payload = {
        // Send null if the input is empty, otherwise send the number
        rewardAmount: customReward === "" ? null : Number(customReward),
      };
      const res = await axios.post(
        `/admin/referral-settings/user/${currentUser._id}/custom-reward`,
        payload
      );
      if (res.data.success) {
        setReferrersList((prevList) =>
          prevList.map((user) =>
            user._id === currentUser._id
              ? {
                  ...user,
                  customReferralReward: res.data.user.customReferralReward,
                } // Use the updated user data from response
              : user
          )
        );
        Swal2.fire("Success", "Custom reward updated!", "success");
        handleCloseEditModal();
      }
    } catch (error) {
      console.error("Error saving custom reward:", error);
      Swal2.fire(
        "Error",
        "Could not save custom reward. " +
          (error.response?.data?.message || ""),
        "error"
      );
    }
  };

  const handleSaveDefaultRewards = async () => {
    try {
      const payload = {
        referrerRewardAmount: Number(defaultReferrerReward),
        friendRewardAmount: Number(defaultFriendReward),
      };
      const res = await axios.post("/admin/referral-settings", payload);
      if (res.data.success) {
        setDefaultReferrerReward(res.data.settings.referrerRewardAmount);
        setDefaultFriendReward(res.data.settings.friendRewardAmount);
        Swal2.fire("Success", "Default rewards updated!", "success");
      }
    } catch (error) {
      console.error("Error saving default rewards:", error);
      Swal2.fire(
        "Error",
        "Could not save default settings. " +
          (error.response?.data?.message || ""),
        "error"
      );
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Helper to format names for the top referrer card
  const formatTopReferrerNames = (names = []) => {
    if (!names || names.length === 0) return "N/A";
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} & ${names[1]}`;
    return `${names.slice(0, 2).join(", ")} & others`; // Show first two + others if more than 2 tied
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Referral Program Dashboard
      </Typography>

      {/* KPI Cards Grid */}
      {kpiData && (
        <Grid container spacing={3} mb={3}>
          {/* Row 1 */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: "#e3f2fd", height: "100%" }}>
              <CardContent>
                <PeopleAlt fontSize="large" color="primary" />
                <Typography variant="h5">{kpiData.totalReferrals}</Typography>
                <Typography color="textSecondary">
                  Successful Referrals
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: "#fff3e0", height: "100%" }}>
              <CardContent>
                <Star fontSize="large" style={{ color: "#ff9800" }} />
                <Typography
                  variant="h5"
                  noWrap
                  title={kpiData.topReferrer.names.join(", ")}
                >
                  {formatTopReferrerNames(kpiData.topReferrer.names)} (
                  {kpiData.topReferrer.count})
                </Typography>
                <Typography color="textSecondary">Top Referrer(s)</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: "#e8f5e9", height: "100%" }}>
              <CardContent>
                <CalendarMonth fontSize="large" color="success" />
                <Typography variant="h5">
                  {kpiData.thisMonthReferrals}
                </Typography>
                <Typography color="textSecondary">
                  New Referred Users (This Month)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          {/* Row 2 - Payouts */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: "#ede7f6", height: "100%" }}>
              <CardContent>
                <MonetizationOn fontSize="large" style={{ color: "#673ab7" }} />
                <Typography variant="h5">
                  ₹{totalReferrerPayout.toFixed(2)}
                </Typography>
                <Typography color="textSecondary">
                  Total Referrer Payout
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: "#e0f2f1", height: "100%" }}>
              <CardContent>
                <MonetizationOn fontSize="large" color="secondary" />
                <Typography variant="h5">
                  ₹{totalFriendPayout.toFixed(2)}
                </Typography>
                <Typography color="textSecondary">
                  Total Friend Payout
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Admin Settings */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Default Referral Settings
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <TextField
            label="Default Referrer Reward (₹)"
            type="number"
            variant="outlined"
            value={defaultReferrerReward}
            onChange={(e) => setDefaultReferrerReward(e.target.value)}
            size="small"
            InputProps={{ inputProps: { min: 0 } }} // Prevent negative numbers
          />
          <TextField
            label="Default Friend Reward (₹)"
            type="number"
            variant="outlined"
            value={defaultFriendReward}
            onChange={(e) => setDefaultFriendReward(e.target.value)}
            size="small"
            InputProps={{ inputProps: { min: 0 } }} // Prevent negative numbers
          />
          <Button variant="contained" onClick={handleSaveDefaultRewards}>
            Save Defaults
          </Button>
        </Box>
      </Paper>

      {/* Referrers Table */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
          Referrers List
        </Typography>
        <Button
          variant="contained"
          color="success"
          startIcon={<Download />}
          onClick={handleExportExcel}
        >
          Export Excel
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table stickyHeader>
          <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell>Referrer Name</TableCell>
              <TableCell>Phone Number</TableCell>
              <TableCell align="center">Successful Referrals</TableCell>
              <TableCell align="center">Total Earned (₹)</TableCell>
              <TableCell align="center">Custom Reward (₹)</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {referrersList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No referrers found yet.
                </TableCell>
              </TableRow>
            ) : (
              referrersList.map((user) => (
                <TableRow key={user._id} hover>
                  <TableCell>{user.Fname || "N/A"}</TableCell>
                  <TableCell>{user.Mobile}</TableCell>
                  <TableCell align="center">{user.referralCount}</TableCell>
                  <TableCell align="center">
                    {(user.referralEarnings || 0).toFixed(2)}
                  </TableCell>
                  <TableCell align="center">
                    {user.customReferralReward != null ? ( // Check explicitly for non-null/undefined
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 0.5,
                        }}
                      >
                        <CardGiftcard fontSize="small" color="success" />
                        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                          ₹{user.customReferralReward}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="caption" color="textSecondary">
                        (Default: ₹{defaultReferrerReward})
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleOpenEditModal(user)}
                    >
                      Change Reward
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Reward Modal */}
      <Modal open={editModalOpen} onClose={handleCloseEditModal}>
        <Box sx={style}>
          <Typography variant="h6" component="h2">
            Set Custom Reward for {currentUser?.Fname || currentUser?.Mobile}
          </Typography>
          <TextField
            label="Custom Reward Amount (₹)"
            type="number"
            fullWidth
            value={customReward}
            onChange={(e) => setCustomReward(e.target.value)}
            sx={{ mt: 2 }}
            placeholder={`Leave blank for default (₹${defaultReferrerReward})`}
            InputProps={{ inputProps: { min: 0 } }} // Prevent negative
          />
          <Box
            sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 1 }}
          >
            <Button onClick={handleCloseEditModal}>Cancel</Button>
            <Button variant="contained" onClick={handleSaveCustomReward}>
              Save
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default AdminReferralDashboard;
