import { useEffect, useState } from "react";
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

const initForm = { title: "", amount: "", dueAt: "", note: "", categoryId: "" };
const getErrObj = (e) => e.response?.data?.message || "An error occurred!";
const formatAmount = (val) => Number(val).toLocaleString("en-US");
const formatDateTime = (val) => new Date(val).toLocaleString("en-US");
const isOverdue = (dueAt) => new Date(dueAt) < new Date();

function PaymentReminders() {
  const [reminders, setReminders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [formData, setFormData] = useState(initForm);
  const [openExpenseDialog, setOpenExpenseDialog] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [walletId, setWalletId] = useState("");
  const fetchReminders = async () => {
    try {
      const { data } = await axiosClient.get(Apis.PAYMENT_REMINDERS);
      setReminders(data);
    } catch (e) {
      showError(getErrObj(e));
    }
  };
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [catRes, walRes] = await Promise.all([
          axiosClient.get(Apis.CATEGORIES),
          axiosClient.get(Apis.WALLETS),
        ]);
        setCategories(catRes.data.filter((c) => c.type === "EXPENSE"));
        setWallets(walRes.data);
        fetchReminders();
      } catch (e) {
        showError(getErrObj(e));
      }
    };
    fetchInitialData();
  }, []);
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleOpenDialog = (reminder = null) => {
    setEditingReminder(reminder);
    setFormData(
      reminder
        ? {
            title: "",
            amount: "",
            dueAt: reminder.dueAt ? reminder.dueAt.slice(0, 16) : "",
            note: reminder.note || "",
            categoryId: "",
          }
        : initForm,
    );
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    if (loading) return;
    setOpenDialog(false);
    setEditingReminder(null);
    setFormData(initForm);
  };
  const handleSubmit = async () => {
    const isEdit = Boolean(editingReminder);
    const { title, amount, dueAt, note, categoryId } = formData;
    const numAmount = Number(amount);
    setLoading(true);

    try {
      if (isEdit) {
        const payload = {};
        if (title.trim()) payload.title = title.trim();
        if (amount !== "") payload.amount = numAmount;
        if (dueAt) payload.dueAt = new Date(dueAt).toISOString();
        if (note.trim()) payload.note = note.trim();
        if (categoryId) payload.categoryId = Number(categoryId);

        await axiosClient.patch(
          `${Apis.PAYMENT_REMINDERS}/${editingReminder.id}`,
          payload,
        );
      } else {
        await axiosClient.post(Apis.PAYMENT_REMINDERS, {
          title: title.trim(),
          amount: numAmount,
          dueAt: new Date(dueAt).toISOString(),
          note: note.trim(),
          categoryId: Number(categoryId),
        });
      }
      await showSuccess("Save successful!");
      handleCloseDialog();
      fetchReminders();
    } catch (e) {
      showError(getErrObj(e));
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (reminder) => {
    const result = await showConfirm(
      "Are you sure you want to delete this payment reminder?",
    );

    if (!result.isConfirmed) return;
    try {
      await axiosClient.delete(`${Apis.PAYMENT_REMINDERS}/${reminder.id}`);
      await showSuccess("Delete successful!");
      fetchReminders();
    } catch (e) {
      showError(getErrObj(e));
    }
  };
  const handleOpenExpense = (reminder) => {
    setSelectedReminder(reminder);
    setWalletId("");
    setOpenExpenseDialog(true);
  };
  const handleCloseExpense = () => {
    if (loading) return;
    setOpenExpenseDialog(false);
    setSelectedReminder(null);
    setWalletId("");
  };
  const handleCreateExpense = async () => {
    setLoading(true);
    try {
      await axiosClient.post(
        `${Apis.PAYMENT_REMINDERS}/${selectedReminder.id}/expense`,
        {
          walletId: Number(walletId),
        },
      );
      await showSuccess("Expense created successfully!");
      handleCloseExpense();
      fetchReminders();
    } catch (e) {
      showError(getErrObj(e));
    } finally {
      setLoading(false);
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
          <Typography color="text.secondary">Add payment reminder</Typography>
        </Box>
        {reminders.map((reminder) => (
          <Box
            key={reminder.id}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 2,
              border: "1px solid #e0e0e0",
              mt: "-1px",
            }}
          >
            <Box>
              <Typography variant="h6" fontWeight={600}>
                {reminder.title}
              </Typography>
              <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
                {formatAmount(reminder.amount)}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  mt: 0.5,
                  color: isOverdue(reminder.dueAt)
                    ? "error.main"
                    : "text.primary",
                }}
              >
                {formatDateTime(reminder.dueAt)}
              </Typography>
              {reminder.note && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {reminder.note}
                </Typography>
              )}
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {reminder.categoryName}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Button
                variant="text"
                disableElevation
                onClick={() => handleOpenExpense(reminder)}
              >
                PAY
              </Button>
              <IconButton onClick={() => handleOpenDialog(reminder)}>
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => handleDelete(reminder)} color="error">
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>
        ))}
      </Box>
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle align="center">
          {editingReminder ? "Edit payment reminder" : "Add payment reminder"}
        </DialogTitle>
        <DialogContent sx={{ pb: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", mt: 1 }}>
            <TextField
              placeholder={editingReminder ? editingReminder.title : "Title"}
              name="title"
              value={formData.title}
              onChange={handleChange}
              fullWidth
              autoFocus
            />
            <TextField
              placeholder={
                editingReminder ? String(editingReminder.amount) : "Amount"
              }
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              fullWidth
              sx={{ mt: "-1px" }}
              slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
            />
            <TextField
              name="dueAt"
              type="datetime-local"
              value={formData.dueAt}
              onChange={handleChange}
              fullWidth
              sx={{ mt: "-1px" }}
            />
            <TextField
              placeholder="Note"
              name="note"
              value={formData.note}
              onChange={handleChange}
              fullWidth
              multiline
              minRows={3}
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
                {editingReminder
                  ? editingReminder.categoryName
                  : "Select category"}
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
        open={openExpenseDialog}
        onClose={handleCloseExpense}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle align="center">Create expense</DialogTitle>
        <DialogContent sx={{ pb: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", mt: 1 }}>
            <TextField
              select
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
              displayEmpty
              fullWidth
            >
              <MenuItem value="" disabled>
                Select wallet
              </MenuItem>
              {wallets.map((w) => (
                <MenuItem key={w.id} value={w.id}>
                  {w.name}
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
              <Button onClick={handleCloseExpense} disabled={loading}>
                Cancel
              </Button>
              <Button
                variant="contained"
                disableElevation
                onClick={handleCreateExpense}
                disabled={loading}
              >
                {loading ? "Processing..." : "Pay"}
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default PaymentReminders;
