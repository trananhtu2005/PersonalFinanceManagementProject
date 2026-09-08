import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Apis from "../utils/Apis";
import axiosClient from "../utils/axiosClient";
import { showConfirm, showError, showSuccess } from "../utils/Swal";

const PAGE_SIZE = 10;
const initForm = {
  title: "",
  description: "",
  target: "",
  endAt: "",
  categoryId: "",
};
const initDeposit = { amount: "", note: "", walletId: "" };
const STATUS_MAP = {
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
};
const getErrObj = (e) => e.response?.data?.message || "An error occurred!";
const formatMoney = (val) => Number(val || 0).toLocaleString("en-US");
const formatDate = (val) => (val ? val.split("-").reverse().join("/") : "");
const getProgress = (g) =>
  !g.target || g.target <= 0
    ? 0
    : Math.min(100, (Number(g.currentAmount) / Number(g.target)) * 100);
const getStatusColor = (status) => {
  if (status === "IN_PROGRESS") return "#ed6c02";
  if (status === "COMPLETED") return "#2e7d32";
  return "text.secondary";
};

function SavingGoals() {
  const [savingGoals, setSavingGoals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const observerRef = useRef(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState(initForm);
  const [openDepositDialog, setOpenDepositDialog] = useState(false);
  const [depositGoal, setDepositGoal] = useState(null);
  const [depositData, setDepositData] = useState(initDeposit);
  const [depositLoading, setDepositLoading] = useState(false);
  const fetchCategories = async () => {
    try {
      const { data } = await axiosClient.get(Apis.CATEGORIES, {
        params: { type: "SAVING" },
      });
      setCategories(data);
    } catch (e) {
      showError(getErrObj(e));
    }
  };
  const fetchWallets = async () => {
    try {
      const { data } = await axiosClient.get(Apis.WALLETS);
      setWallets(data);
    } catch (e) {
      showError(getErrObj(e));
    }
  };
  const fetchSavingGoals = async (pageNumber = 0, reset = false) => {
    if (loading || (!reset && !hasMore)) return;

    setLoading(true);

    try {
      const { data } = await axiosClient.get(Apis.SAVING_GOALS, {
        params: { page: pageNumber, size: PAGE_SIZE },
      });
      setSavingGoals((prev) =>
        reset ? data.content : [...prev, ...data.content],
      );
      setPage(data.number);
      setHasMore(!data.last);
    } catch (e) {
      showError(getErrObj(e));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchCategories();
    fetchWallets();
    fetchSavingGoals(0, true);
  }, []);
  useEffect(() => {
    if (!observerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          fetchSavingGoals(page + 1);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [page, hasMore, loading]);
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleOpenDialog = (goal = null) => {
    setEditingGoal(goal);
    setFormData(
      goal
        ? {
            title: "",
            description: goal.description || "",
            target: "",
            endAt: goal.endAt || "",
            categoryId: "",
          }
        : initForm,
    );
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    if (loading) return;
    setOpenDialog(false);
    setEditingGoal(null);
    setFormData(initForm);
  };
  const handleSubmit = async () => {
    const isEdit = Boolean(editingGoal);
    const { title, description, target, endAt, categoryId } = formData;
    const numTarget = Number(target);
    setLoading(true);

    try {
      if (isEdit) {
        const payload = {};
        if (title.trim()) payload.title = title.trim();
        if (description.trim() !== "") payload.description = description.trim();
        if (target !== "") payload.target = numTarget;
        if (endAt) payload.endAt = endAt;
        if (categoryId) payload.categoryId = Number(categoryId);

        await axiosClient.patch(
          `${Apis.SAVING_GOALS}/${editingGoal.id}`,
          payload,
        );
      } else {
        await axiosClient.post(Apis.SAVING_GOALS, {
          title: title.trim(),
          description: description.trim(),
          target: numTarget,
          endAt,
          categoryId: Number(categoryId),
        });
      }
      await showSuccess("Save successful!");
      handleCloseDialog();
      fetchSavingGoals(0, true);
    } catch (e) {
      showError(getErrObj(e));
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (goal) => {
    const result = await showConfirm(
      `"${goal.title}" will be deleted. Are you sure?`,
    );

    if (!result.isConfirmed) return;
    try {
      await axiosClient.delete(`${Apis.SAVING_GOALS}/${goal.id}`);
      await showSuccess("Delete successful!");
      fetchSavingGoals(0, true);
    } catch (e) {
      showError(getErrObj(e));
    }
  };
  const handleDepositChange = (e) =>
    setDepositData({ ...depositData, [e.target.name]: e.target.value });
  const handleOpenDeposit = (goal) => {
    setDepositGoal(goal);
    setDepositData(initDeposit);
    setOpenDepositDialog(true);
  };
  const handleCloseDeposit = () => {
    if (depositLoading) return;

    setOpenDepositDialog(false);
    setDepositGoal(null);
    setDepositData(initDeposit);
  };
  const handleDeposit = async () => {
    const { amount, note, walletId } = depositData;
    const numAmount = Number(amount);
    setDepositLoading(true);

    try {
      await axiosClient.post(`${Apis.SAVING_GOALS}/${depositGoal.id}/deposit`, {
        amount: numAmount,
        note: note.trim(),
        walletId: Number(walletId),
      });
      await showSuccess("Deposit successful!");
      handleCloseDeposit();
      fetchSavingGoals(0, true);
    } catch (e) {
      showError(getErrObj(e));
    } finally {
      setDepositLoading(false);
    }
  };

  return (
    <Box>
      <Box>
        <Box
          onClick={() => handleOpenDialog()}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: 2,
            cursor: "pointer",
            border: "1px solid #e0e0e0",
            "&:hover": { backgroundColor: "action.hover" },
          }}
        >
          <Typography
            variant="h6"
            fontWeight={600}
            sx={{ ml: 0.5, lineHeight: 1, color: "text.secondary" }}
          >
            +
          </Typography>
          <Typography color="text.secondary">Add saving goal</Typography>
        </Box>
        {savingGoals.length === 0 && !loading ? (
          <Typography
            color="text.secondary"
            sx={{
              py: 3,
              textAlign: "center",
              border: "1px solid #e0e0e0",
              mt: "-1px",
            }}
          >
            No saving goals
          </Typography>
        ) : (
          savingGoals.map((goal) => (
            <Box
              key={goal.id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 2,
                border: "1px solid #e0e0e0",
                mt: "-1px",
              }}
            >
              <Box sx={{ flex: 1, mr: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  {goal.title}
                </Typography>
                {goal.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    {goal.description}
                  </Typography>
                )}
                <Box
                  sx={{
                    position: "relative",
                    height: 24,
                    bgcolor: "action.hover",
                    mt: 1.5,
                    overflow: "hidden",
                    borderRadius: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: `${getProgress(goal)}%`,
                      height: "100%",
                      bgcolor: "primary.main",
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      fontWeight: 600,
                      color: getProgress(goal) > 55 ? "white" : "text.primary",
                      zIndex: 1,
                      pointerEvents: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatMoney(goal.currentAmount)} /{" "}
                    {formatMoney(goal.target)}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                  <Typography variant="body2">
                    {formatDate(goal.startAt)} - {formatDate(goal.endAt)}
                  </Typography>
                  <Typography variant="body2">{goal.categoryName}</Typography>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{ color: getStatusColor(goal.status) }}
                  >
                    {STATUS_MAP[goal.status] || goal.status}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Button
                  variant="text"
                  disableElevation
                  onClick={() => handleOpenDeposit(goal)}
                >
                  DEPOSIT
                </Button>
                <IconButton onClick={() => handleOpenDialog(goal)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDelete(goal)} color="error">
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
          ))
        )}
        <Box
          ref={observerRef}
          sx={{
            minHeight: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mt: 2,
          }}
        >
          {loading && (
            <Typography color="text.secondary">Loading...</Typography>
          )}
        </Box>
      </Box>
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle align="center">
          {editingGoal ? "Edit goal" : "Add goal"}
        </DialogTitle>
        <DialogContent sx={{ pb: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", mt: 1 }}>
            <TextField
              name="title"
              placeholder={editingGoal ? editingGoal.title : "Title"}
              value={formData.title}
              onChange={handleChange}
              fullWidth
              autoFocus
            />
            <TextField
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              multiline
              minRows={3}
              sx={{ mt: "-1px" }}
            />
            <TextField
              name="target"
              type="number"
              placeholder={
                editingGoal ? String(editingGoal.target) : "Target amount"
              }
              value={formData.target}
              onChange={handleChange}
              fullWidth
              sx={{ mt: "-1px" }}
              slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
            />
            <TextField
              name="endAt"
              type="date"
              value={formData.endAt}
              onChange={handleChange}
              fullWidth
              sx={{ mt: "-1px" }}
            />
            <TextField
              select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              displayEmpty
              fullWidth
              sx={{ mt: "-1px" }}
            >
              <MenuItem value="" disabled>
                {editingGoal ? editingGoal.categoryName : "Select category"}
              </MenuItem>
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 1,
                mt: 3,
              }}
            >
              <Button onClick={handleCloseDialog} disabled={loading}>
                Cancel
              </Button>
              <Button
                variant="contained"
                disableElevation
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Processing..." : "Save"}
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
      <Dialog
        open={openDepositDialog}
        onClose={handleCloseDeposit}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle align="center">
          Deposit {depositGoal ? `- ${depositGoal.title}` : ""}
        </DialogTitle>
        <DialogContent sx={{ pb: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", mt: 1 }}>
            <TextField
              name="amount"
              type="number"
              placeholder="Amount"
              value={depositData.amount}
              onChange={handleDepositChange}
              fullWidth
              autoFocus
              slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
            />
            <TextField
              name="note"
              placeholder="Note"
              value={depositData.note}
              onChange={handleDepositChange}
              fullWidth
              multiline
              minRows={2}
              sx={{ mt: "-1px" }}
            />
            <TextField
              select
              name="walletId"
              value={depositData.walletId}
              onChange={handleDepositChange}
              displayEmpty
              fullWidth
              sx={{ mt: "-1px" }}
            >
              <MenuItem value="" disabled>
                Select wallet
              </MenuItem>
              {wallets.map((w) => (
                <MenuItem key={w.id} value={w.id}>
                  {w.name} - {formatMoney(w.balance)}
                </MenuItem>
              ))}
            </TextField>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 1,
                mt: 3,
              }}
            >
              <Button onClick={handleCloseDeposit} disabled={depositLoading}>
                Cancel
              </Button>
              <Button
                variant="contained"
                disableElevation
                onClick={handleDeposit}
                disabled={depositLoading}
              >
                {depositLoading ? "Processing..." : "Deposit"}
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default SavingGoals;
