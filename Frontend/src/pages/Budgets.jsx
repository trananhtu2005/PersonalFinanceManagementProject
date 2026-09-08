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

const currYear = new Date().getFullYear();
const currMonth = new Date().getMonth() + 1;
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
const initForm = { amount: "", categoryId: "" };
const getErrObj = (e) => e.response?.data?.message || "An error occurred!";
const formatMoney = (val) => Number(val || 0).toLocaleString("en-US");
function Budgets() {
  const [monthlyBudgets, setMonthlyBudgets] = useState([]);
  const [categoryBudgets, setCategoryBudgets] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(currMonth);
  const [year, setYear] = useState(currYear);
  const [activeCategory, setActiveCategory] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [formData, setFormData] = useState(initForm);
  const fetchMonthlyBudgets = async (m, y) => {
    try {
      const { data } = await axiosClient.get(Apis.BUDGET_BY_MONTH, {
        params: { month: m, year: y },
      });
      setMonthlyBudgets(data);
    } catch (e) {
      showError(getErrObj(e));
    }
  };
  const fetchCategoryBudgets = async (cId, y) => {
    if (!cId) return setCategoryBudgets([]);
    try {
      const { data } = await axiosClient.get(Apis.BUDGET_BY_CATEGORY, {
        params: { categoryId: cId, year: y },
      });
      setCategoryBudgets(data);
    } catch (e) {
      showError(getErrObj(e));
    }
  };
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [suggRes, catRes] = await Promise.all([
          axiosClient.get(Apis.BUDGET_SUGGESTION),
          axiosClient.get(Apis.CATEGORIES),
        ]);
        setSuggestions(suggRes.data);
        setCategories(
          catRes.data.filter(
            (c) => c.type === "EXPENSE" || c.type === "SAVING",
          ),
        );
        fetchMonthlyBudgets(currMonth, currYear);
      } catch (e) {
        showError(getErrObj(e));
      }
    };
    loadInitialData();
  }, []);
  const reloadData = () => {
    fetchMonthlyBudgets(month, year);
    if (activeCategory) fetchCategoryBudgets(activeCategory.id, year);
  };
  const getCategoryId = (budget) => {
    return (
      budget.categoryId ||
      categories.find((c) => c.name === budget.categoryName)?.id
    );
  };
  const handleOpenDialog = (catId = "", budget = null) => {
    setEditingBudget(budget);
    let budgetCatId = catId;
    if (budget) {
      budgetCatId = getCategoryId(budget) || "";
    }
    setFormData({ amount: "", categoryId: budgetCatId });
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    if (loading) return;
    setOpenDialog(false);
    setEditingBudget(null);
    setFormData(initForm);
  };
  const handleSubmit = async () => {
    const { amount, categoryId } = formData;
    const numAmt = Number(amount);
    const isEdit = Boolean(editingBudget);
    setLoading(true);

    try {
      if (isEdit) {
        const payload = {};
        if (amount !== "") payload.amount = numAmt;
        await axiosClient.patch(`${Apis.BUDGETS}/${editingBudget.id}`, payload);
      } else {
        await axiosClient.post(Apis.BUDGETS, {
          amount: numAmt,
          categoryId: Number(categoryId),
        });
      }
      await showSuccess("Save successful!");
      handleCloseDialog();
      reloadData();
    } catch (e) {
      showError(getErrObj(e));
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (budget) => {
    const result = await showConfirm(
      "Are you sure you want to delete this budget?",
    );

    if (!result.isConfirmed) return;
    try {
      await axiosClient.delete(`${Apis.BUDGETS}/${budget.id}`);
      await showSuccess("Delete successful!");
      const cId = getCategoryId(budget);

      if (activeCategory?.id === cId) {
        setActiveCategory(null);
        setCategoryBudgets([]);
      }
      reloadData();
    } catch (e) {
      showError(getErrObj(e));
    }
  };
  const handleToggleStatistic = (budget) => {
    const cId = getCategoryId(budget);

    if (!cId) {
      showError("Category data not found.");
      return;
    }
    setActiveCategory({ id: cId, name: budget.categoryName });
    fetchCategoryBudgets(cId, year);
  };

  return (
    <Box>
      <Box sx={{ display: "flex", width: "100%", mb: 3 }}>
        <TextField
          select
          value={month}
          onChange={(e) => {
            const m = Number(e.target.value);
            setMonth(m);
            fetchMonthlyBudgets(m, year);
          }}
          sx={{ flex: 1 }}
        >
          {MONTHS.map((m, i) => (
            <MenuItem key={i + 1} value={i + 1}>
              {m}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          type="number"
          placeholder="Year"
          value={year}
          onChange={(e) => {
            const y = Number(e.target.value);
            setYear(y);
            fetchMonthlyBudgets(month, y);
            if (activeCategory) fetchCategoryBudgets(activeCategory.id, y);
          }}
          sx={{ flex: 1, ml: "-1px" }}
        />
        <Button
          variant="contained"
          disableElevation
          onClick={() => handleOpenDialog()}
          sx={{ ml: "-1px", px: 4, whiteSpace: "nowrap" }}
        >
          ADD BUDGET
        </Button>
      </Box>

      {suggestions.length > 0 && (
        <Box sx={{ p: 2, border: "1px solid #e0e0e0", mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Suggestions
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {suggestions.map((c) => (
              <Button
                key={c.id}
                variant="outlined"
                disableElevation
                onClick={() => handleOpenDialog(c.id)}
                sx={{ display: "flex", gap: 1 }}
              >
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: c.colorCode,
                  }}
                />
                {c.name}
              </Button>
            ))}
          </Box>
        </Box>
      )}
      {monthlyBudgets.length === 0 ? (
        <Typography
          color="text.secondary"
          sx={{ py: 3, textAlign: "center", border: "1px solid #e0e0e0" }}
        >
          No budgets
        </Typography>
      ) : (
        <Box>
          {monthlyBudgets.map((b) => {
            const cId = getCategoryId(b);
            const isActive = activeCategory?.id === cId;
            return (
              <Box
                key={b.id}
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
                    {b.categoryName}
                  </Typography>
                  <Typography
                    color={b.exceeded ? "error.main" : "text.primary"}
                  >
                    {formatMoney(b.spent)} / {formatMoney(b.amount)}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Button
                    variant="text"
                    disableElevation
                    onClick={() => handleToggleStatistic(b)}
                    sx={{ fontWeight: isActive ? "bold" : "normal" }}
                  >
                    STATISTIC
                  </Button>
                  <IconButton onClick={() => handleOpenDialog("", b)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(b)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
      {activeCategory && (
        <Box sx={{ mt: 3, p: 3, border: "1px solid #e0e0e0" }}>
          <Typography variant="h6" fontWeight={600} mb={3} align="center">
            {activeCategory.name} in {year}
          </Typography>
          {categoryBudgets.length === 0 ? (
            <Typography color="text.secondary" align="center">
              No data
            </Typography>
          ) : (
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-end",
                gap: 2,
                height: 250,
                overflowX: "auto",
                px: 1,
              }}
            >
              {categoryBudgets.map((cb) => {
                const maxVal = Math.max(
                  ...categoryBudgets.map((b) => Math.max(b.spent, b.amount)),
                  1,
                );
                const height = (cb.spent / maxVal) * 180;
                return (
                  <Box
                    key={cb.id}
                    sx={{
                      minWidth: 60,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Typography variant="caption" sx={{ mb: 0.5 }}>
                      {formatMoney(cb.spent)}
                    </Typography>
                    <Box
                      sx={{
                        width: 40,
                        height: `${Math.max(height, 4)}px`,
                        backgroundColor: cb.exceeded
                          ? "error.main"
                          : "primary.main",
                      }}
                    />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      {MONTHS[cb.month - 1].slice(0, 3)}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      )}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle align="center">
          {editingBudget ? "Edit budget" : "Add budget"}
        </DialogTitle>
        <DialogContent sx={{ pb: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", mt: 1 }}>
            {!editingBudget && (
              <TextField
                select
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
                displayEmpty
                fullWidth
                sx={{ mb: "-1px" }}
              >
                <MenuItem value="" disabled>
                  Select category
                </MenuItem>
                {suggestions.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
            <TextField
              type="number"
              placeholder={
                editingBudget ? String(editingBudget.amount) : "Amount"
              }
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              fullWidth
              autoFocus={!!editingBudget}
              slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
            />
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

export default Budgets;
