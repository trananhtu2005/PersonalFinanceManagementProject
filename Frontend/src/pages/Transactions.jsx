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
  amount: "",
  note: "",
  date: "",
  walletId: "",
  categoryId: "",
};
const getErr = (e) => e.response?.data?.message;
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const formatMoney = (val) => Number(val || 0).toLocaleString("en-US");
function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const observerRef = useRef(null);
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    categoryId: "",
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [formData, setFormData] = useState(initForm);
  const fetchCategories = async () => {
    try {
      setCategories((await axiosClient.get(Apis.CATEGORIES)).data);
    } catch (e) {
      showError(getErr(e));
    }
  };
  const fetchWallets = async () => {
    try {
      setWallets((await axiosClient.get(Apis.WALLETS)).data);
    } catch (e) {
      showError(getErr(e));
    }
  };
  const fetchTransactions = async (pageNumber = 0, reset = false) => {
    if (loading || (!reset && !hasMore)) return;

    setLoading(true);

    try {
      const params = {
        page: pageNumber,
        size: PAGE_SIZE,
        month: filters.month,
        year: filters.year,
      };
      if (filters.categoryId) params.categoryId = Number(filters.categoryId);

      const { data } = await axiosClient.get(Apis.TRANSACTIONS, { params });
      setTransactions((prev) =>
        reset ? data.content : [...prev, ...data.content],
      );
      setPage(data.number);
      setHasMore(!data.last);
    } catch (e) {
      showError(getErr(e));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchCategories();
    fetchWallets();
  }, []);
  useEffect(() => {
    setTransactions([]);
    setPage(0);
    setHasMore(true);
    fetchTransactions(0, true);
  }, [filters]);
  useEffect(() => {
    if (!observerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore)
          fetchTransactions(page + 1);
      },
      { threshold: 0.1 },
    );
    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [page, hasMore, loading, filters]);

  const handleFilterChange = (e) =>
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleOpenDialog = (transaction = null) => {
    setEditingTransaction(transaction);
    setFormData(
      transaction
        ? {
            amount: "",
            note: transaction.note || "",
            date: transaction.date ? transaction.date.slice(0, 16) : "",
            walletId: "",
            categoryId: "",
          }
        : initForm,
    );
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    if (loading) return;
    setOpenDialog(false);
    setEditingTransaction(null);
    setFormData(initForm);
  };
  const handleSubmit = async () => {
    const isEdit = Boolean(editingTransaction);
    const { amount, note, date, walletId, categoryId } = formData;
    setLoading(true);

    try {
      if (isEdit) {
        const payload = {};
        if (amount !== "") payload.amount = Number(amount);
        if (note.trim() !== "") payload.note = note.trim();
        if (date !== "") payload.date = new Date(date).toISOString();
        if (walletId !== "") payload.walletId = Number(walletId);
        if (categoryId !== "") payload.categoryId = Number(categoryId);

        await axiosClient.patch(
          `${Apis.TRANSACTIONS}/${editingTransaction.id}`,
          payload,
        );
      } else {
        await axiosClient.post(Apis.TRANSACTIONS, {
          amount: Number(amount),
          note: note.trim(),
          date: new Date(date).toISOString(),
          walletId: Number(walletId),
          categoryId: Number(categoryId),
        });
      }
      await showSuccess("Save successful!");
      handleCloseDialog();
      setTransactions([]);
      fetchTransactions(0, true);
    } catch (e) {
      showError(getErr(e));
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (transaction) => {
    const result = await showConfirm(
      "The transaction will be deleted. Are you sure?",
    );

    if (!result.isConfirmed) return;
    try {
      await axiosClient.delete(`${Apis.TRANSACTIONS}/${transaction.id}`);
      await showSuccess("Delete successful!");
      setTransactions((prev) =>
        prev.filter((item) => item.id !== transaction.id),
      );
    } catch (e) {
      showError(getErr(e));
    }
  };
  const getCategoryType = (name) =>
    categories.find((c) => c.name === name)?.type;
  const formatDate = (date) => new Date(date).toLocaleString("en-US");
  const getTypeColor = (type) => {
    if (type === "INCOME") return "#2e7d32";
    if (type === "EXPENSE") return "#d32f2f";
    if (type === "SAVING") return "#0288d1";
    return "inherit";
  };

  return (
    <Box>
      <Box sx={{ display: "flex", width: "100%", mb: 3 }}>
        <TextField
          select
          name="month"
          value={filters.month}
          onChange={handleFilterChange}
          sx={{ flex: 1 }}
        >
          {MONTHS.map((m, i) => (
            <MenuItem key={i + 1} value={i + 1}>
              {m}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          name="year"
          type="number"
          placeholder="Year"
          value={filters.year}
          onChange={handleFilterChange}
          sx={{ flex: 1, ml: "-1px" }}
        />
        <TextField
          select
          name="categoryId"
          value={filters.categoryId}
          onChange={handleFilterChange}
          displayEmpty
          sx={{ flex: 2, ml: "-1px" }}
        >
          <MenuItem value="">All categories</MenuItem>
          {categories
            .filter((c) => c.type === "INCOME" || c.type === "EXPENSE")
            .map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
        </TextField>
        <Button
          variant="contained"
          disableElevation
          onClick={() => handleOpenDialog()}
          sx={{ ml: "-1px", px: 4, whiteSpace: "nowrap" }}
        >
          ADD TRANSACTION
        </Button>
      </Box>
      {transactions.length === 0 && !loading ? (
        <Typography
          color="text.secondary"
          sx={{ py: 3, textAlign: "center", border: "1px solid #e0e0e0" }}
        >
          No transactions
        </Typography>
      ) : (
        <Box>
          {transactions.map((t) => {
            const type = getCategoryType(t.categoryName);
            return (
              <Box
                key={t.id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  p: 2,
                  border: "1px solid #e0e0e0",
                  mt: "-1px",
                }}
              >
                <Box>
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    sx={{ color: getTypeColor(type) }}
                  >
                    {type === "INCOME" ? "+" : "-"}
                    {formatMoney(t.amount)}
                  </Typography>
                  <Typography>{t.categoryName}</Typography>
                  <Typography>{t.walletName}</Typography>
                  <Typography>{formatDate(t.date)}</Typography>
                  {t.note && <Typography>{t.note}</Typography>}
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <IconButton onClick={() => handleOpenDialog(t)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(t)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            );
          })}
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
      )}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle align="center">
          {editingTransaction ? "Edit transaction" : "Add transaction"}
        </DialogTitle>
        <DialogContent sx={{ pb: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", mt: 1 }}>
            <TextField
              name="amount"
              type="number"
              placeholder={
                editingTransaction
                  ? String(editingTransaction.amount)
                  : "Amount"
              }
              value={formData.amount}
              onChange={handleChange}
              fullWidth
              autoFocus
              slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
            />
            <TextField
              name="note"
              placeholder={
                editingTransaction && editingTransaction.note
                  ? editingTransaction.note
                  : "Note"
              }
              value={formData.note}
              onChange={handleChange}
              fullWidth
              sx={{ mt: "-1px" }}
            />
            <TextField
              name="date"
              type="datetime-local"
              value={formData.date}
              onChange={handleChange}
              fullWidth
              sx={{ mt: "-1px" }}
            />
            <TextField
              select
              name="walletId"
              value={formData.walletId}
              onChange={handleChange}
              displayEmpty
              fullWidth
              sx={{ mt: "-1px" }}
            >
              <MenuItem value="" disabled>
                {editingTransaction
                  ? editingTransaction.walletName
                  : "Select wallet"}
              </MenuItem>
              {wallets.map((w) => (
                <MenuItem key={w.id} value={w.id}>
                  {w.name}
                </MenuItem>
              ))}
            </TextField>
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
                {editingTransaction
                  ? editingTransaction.categoryName
                  : "Select category"}
              </MenuItem>
              {categories
                .filter((c) => c.type === "INCOME" || c.type === "EXPENSE")
                .map((c) => (
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
    </Box>
  );
}

export default Transactions;
