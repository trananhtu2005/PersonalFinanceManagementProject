import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";
import Apis from "../utils/Apis";
import axiosClient from "../utils/axiosClient";
import { showError, showSuccess } from "../utils/Swal";

const getErrObj = (e) => e.response?.data?.message || "An error occurred!";
const formatMoney = (val) => Number(val || 0).toLocaleString("en-US");
const formatDate = (val) =>
  val ? new Date(val).toLocaleDateString("en-US") : "";
const formatDiff = (diff, isExpense = false) => {
  const val = Number(diff || 0);

  if (val === 0) return { text: "0", color: "text.secondary" };

  const sign = val > 0 ? "+" : "-";
  const amount = formatMoney(Math.abs(val));
  const text = `${sign} ${amount}`;
  let color = "text.primary";

  if (isExpense) {
    color = val > 0 ? "error.main" : "success.main";
  } else {
    color = val > 0 ? "success.main" : "error.main";
  }

  return { text, color };
};

const currYear = new Date().getFullYear();
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const YEARS = Array.from({ length: 5 }, (_, i) => currYear - 2 + i);
const BORDER_STYLE = "1px solid #000000";

function Dashboard() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(currYear);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [openAiDialog, setOpenAiDialog] = useState(false);
  const fetchDashboard = async () => {
    setLoading(true);

    try {
      const { data } = await axiosClient.get(Apis.DASHBOARD, {
        params: { month, year },
      });
      setDashboard(data);
    } catch (e) {
      showError(getErrObj(e));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchDashboard();
  }, [month, year]);
  const handleExport = async () => {
    setExporting(true);

    try {
      const response = await axiosClient.get(Apis.DASHBOARD_EXPORT, {
        params: { month, year },
        responseType: "blob",
      });
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `dashboard-${month}-${year}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      await showSuccess("Exported to Excel successfully!");
    } catch (e) {
      showError("Failed to export Excel!");
    } finally {
      setExporting(false);
    }
  };
  const handleAiAnalysis = async () => {
    setAnalyzing(true);
    try {
      const { data } = await axiosClient.get(Apis.DASHBOARD_AI_ANALYSIS, {
        params: { month, year },
      });
      setAiAnalysis(data);
      setOpenAiDialog(true);
    } catch (e) {
      showError(getErrObj(e));
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading && !dashboard) {
    return (
      <Typography sx={{ mt: 3, textAlign: "center" }}>
        Loading dashboard...
      </Typography>
    );
  }
  if (!dashboard) return null;

  const pieData = (dashboard.categories || []).map((c, i) => ({
    id: i,
    value: c.amount,
    label: c.name,
    color: c.colorCode,
  }));

  return (
    <Box sx={{ pb: 5 }}>
      <Box sx={{ borderTop: BORDER_STYLE, borderLeft: BORDER_STYLE }}>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
          <Box
            sx={{
              borderRight: BORDER_STYLE,
              borderBottom: BORDER_STYLE,
              display: "flex",
              alignItems: "center",
              p: 1,
            }}
          >
            <Typography sx={{ mr: 1, ml: 1 }}>Month</Typography>
            <TextField
              select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              variant="standard"
              InputProps={{ disableUnderline: true }}
              sx={{ flex: 1 }}
            >
              {MONTHS.map((m) => (
                <MenuItem key={m} value={m}>
                  {m}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          <Box
            sx={{
              borderRight: BORDER_STYLE,
              borderBottom: BORDER_STYLE,
              display: "flex",
              alignItems: "center",
              p: 1,
            }}
          >
            <Typography sx={{ mr: 1, ml: 1 }}>Year</Typography>
            <TextField
              select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              variant="standard"
              InputProps={{ disableUnderline: true }}
              sx={{ flex: 1 }}
            >
              {YEARS.map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          <Button
            onClick={handleExport}
            disabled={exporting}
            sx={{
              borderRight: BORDER_STYLE,
              borderBottom: BORDER_STYLE,
              borderRadius: 0,
              textTransform: "none",
            }}
          >
            Export Excel
          </Button>
          <Button
            onClick={handleAiAnalysis}
            disabled={analyzing}
            sx={{
              borderRight: BORDER_STYLE,
              borderBottom: BORDER_STYLE,
              borderRadius: 0,
              textTransform: "none",
            }}
          >
            AI analysis
          </Button>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
          <Box
            sx={{ borderRight: BORDER_STYLE, borderBottom: BORDER_STYLE, p: 2 }}
          >
            <Typography variant="body1">Total balance</Typography>
            <Typography variant="h5" fontWeight={400}>
              {formatMoney(dashboard.sumBalance)}
            </Typography>
          </Box>
          <Box
            sx={{ borderRight: BORDER_STYLE, borderBottom: BORDER_STYLE, p: 2 }}
          >
            <Typography variant="body1">Total income</Typography>
            <Typography variant="h5" fontWeight={400}>
              {formatMoney(dashboard.income?.amount)}
            </Typography>
            {(() => {
              const diff = formatDiff(dashboard.income?.difference, false);
              return (
                diff && (
                  <Typography variant="body2" sx={{ color: diff.color }}>
                    {diff.text}
                  </Typography>
                )
              );
            })()}
          </Box>
          <Box
            sx={{ borderRight: BORDER_STYLE, borderBottom: BORDER_STYLE, p: 2 }}
          >
            <Typography variant="body1">Total expense</Typography>
            <Typography variant="h5" fontWeight={400}>
              {formatMoney(dashboard.expense?.amount)}
            </Typography>
            {(() => {
              const diff = formatDiff(dashboard.expense?.difference, true);
              return (
                diff && (
                  <Typography variant="body2" sx={{ color: diff.color }}>
                    {diff.text}
                  </Typography>
                )
              );
            })()}
          </Box>
          <Box
            sx={{ borderRight: BORDER_STYLE, borderBottom: BORDER_STYLE, p: 2 }}
          >
            <Typography variant="body1">Total saving</Typography>
            <Typography variant="h5" fontWeight={400}>
              {formatMoney(dashboard.saving?.amount)}
            </Typography>
            {(() => {
              const diff = formatDiff(dashboard.saving?.difference, false);
              return (
                diff && (
                  <Typography variant="body2" sx={{ color: diff.color }}>
                    {diff.text}
                  </Typography>
                )
              );
            })()}
          </Box>
        </Box>
        <Box
          sx={{ display: "grid", gridTemplateColumns: "4fr 2fr 2fr 2fr 2fr" }}
        >
          <Box
            sx={{
              borderRight: BORDER_STYLE,
              borderBottom: BORDER_STYLE,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography
              variant="body1"
              align="center"
              sx={{ py: 1.5, borderBottom: BORDER_STYLE }}
            >
              Expense by category
            </Typography>
            <Box
              sx={{
                flex: 1,
                p: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f9f9f9",
              }}
            >
              {pieData.length === 0 ? (
                <Typography color="text.secondary">No data</Typography>
              ) : (
                <PieChart
                  series={[
                    {
                      data: pieData,
                    },
                  ]}
                  height={300}
                  slotProps={{
                    legend: {
                      direction: "row",
                      position: { vertical: "bottom", horizontal: "middle" },
                      padding: 0,
                    },
                  }}
                />
              )}
            </Box>
          </Box>
          <Box
            sx={{
              borderRight: BORDER_STYLE,
              borderBottom: BORDER_STYLE,
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#f9f9f9",
            }}
          >
            <Typography
              variant="body1"
              align="center"
              sx={{ py: 1.5, borderBottom: BORDER_STYLE }}
            >
              Budget list
            </Typography>
            <Box sx={{ flex: 1, p: 1 }}>
              {dashboard.budgets?.map((b) => (
                <Box key={b.id} sx={{ mb: 2 }}>
                  <Typography variant="body2">{b.categoryName}</Typography>
                  <Typography variant="body2" display="block">
                    {formatMoney(b.spent)} / {formatMoney(b.amount)}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
          <Box
            sx={{
              borderRight: BORDER_STYLE,
              borderBottom: BORDER_STYLE,
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#f9f9f9",
            }}
          >
            <Typography
              variant="body1"
              align="center"
              sx={{ py: 1.5, borderBottom: BORDER_STYLE }}
            >
              Wallet list
            </Typography>
            <Box sx={{ flex: 1, p: 1 }}>
              {dashboard.wallets?.map((w) => (
                <Box key={w.id} sx={{ mb: 2 }}>
                  <Typography variant="body2">{w.name}</Typography>
                  <Typography variant="body2" display="block">
                    {formatMoney(w.balance)}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
          <Box
            sx={{
              borderRight: BORDER_STYLE,
              borderBottom: BORDER_STYLE,
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#f9f9f9",
            }}
          >
            <Typography
              variant="body1"
              align="center"
              sx={{ py: 1.5, borderBottom: BORDER_STYLE }}
            >
              Payment reminder list
            </Typography>
            <Box sx={{ flex: 1, p: 1 }}>
              {dashboard.paymentReminders?.map((r) => (
                <Box key={r.id} sx={{ mb: 2 }}>
                  <Typography variant="body2">{r.title}</Typography>
                  <Typography variant="body2" display="block">
                    {formatMoney(r.amount)}
                  </Typography>
                  <Typography variant="body2" display="block">
                    {formatDate(r.dueAt)}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
          <Box
            sx={{
              borderRight: BORDER_STYLE,
              borderBottom: BORDER_STYLE,
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#f9f9f9",
            }}
          >
            <Typography
              variant="body1"
              align="center"
              sx={{ py: 1.5, borderBottom: BORDER_STYLE }}
            >
              Saving goal list
            </Typography>
            <Box sx={{ flex: 1, p: 1 }}>
              {dashboard.savingGoals?.map((g) => (
                <Box key={g.id} sx={{ mb: 2 }}>
                  <Typography variant="body2">{g.title}</Typography>
                  <Typography variant="body2" display="block">
                    {formatMoney(g.currentAmount)} / {formatMoney(g.target)}
                  </Typography>
                  <Typography variant="body2" display="block">
                    {formatDate(g.endAt)}
                  </Typography>
                  {g.categoryName && (
                    <Typography variant="body2" display="block">
                      {g.categoryName}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
      <Dialog
        open={openAiDialog}
        onClose={() => setOpenAiDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>AI Financial Analysis</DialogTitle>
        <DialogContent>
          <Typography sx={{ whiteSpace: "pre-line", mt: 1 }}>
            {aiAnalysis}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            variant="contained"
            disableElevation
            onClick={() => setOpenAiDialog(false)}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Dashboard;
