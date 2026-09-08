import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Apis from "../utils/Apis";
import axiosClient from "../utils/axiosClient";
import { showConfirm, showError, showSuccess } from "../utils/Swal";

function AdminManagement() {
  const [categories, setCategories] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "INCOME",
  });
  const [colors, setColors] = useState([]);
  const [openColorDialog, setOpenColorDialog] = useState(false);
  const [editingColor, setEditingColor] = useState(null);
  const [colorFormData, setColorFormData] = useState({
    name: "",
    code: "",
  });
  const [dashboard, setDashboard] = useState({
    totalUsers: 0,
    newUsersThisMonth: 0,
    newUsersToday: 0,
    monthlyUserStats: [],
  });
  const [loading, setLoading] = useState(false);
  const fetchDashboard = async () => {
    try {
      const response = await axiosClient.get(Apis.ADMIN_DASHBOARD);
      setDashboard(response.data);
    } catch (error) {
      const message = error.response?.data?.message || "An error occurred!";
      showError(message);
    }
  };
  const fetchCategories = async () => {
    try {
      const response = await axiosClient.get(Apis.DEFAULT_CATEGORIES);
      setCategories(response.data);
    } catch (error) {
      const message = error.response?.data?.message || "An error occurred!";
      showError(message);
    }
  };
  const fetchColors = async () => {
    try {
      const response = await axiosClient.get(Apis.COLORS);
      setColors(response.data);
    } catch (error) {
      const message = error.response?.data?.message || "An error occurred!";
      showError(message);
    }
  };
  useEffect(() => {
    fetchDashboard();
    fetchCategories();
    fetchColors();
  }, []);
  const incomeCategories = categories.filter(
    (category) => category.type === "INCOME",
  );
  const expenseCategories = categories.filter(
    (category) => category.type === "EXPENSE",
  );
  const savingCategories = categories.filter(
    (category) => category.type === "SAVING",
  );
  const handleOpenCreate = (type) => {
    setEditingCategory(null);
    setFormData({
      name: "",
      type,
    });
    setOpenDialog(true);
  };
  const handleOpenEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: "",
      type: category.type,
    });
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    if (loading) {
      return;
    }
    setOpenDialog(false);
    setEditingCategory(null);
    setFormData({
      name: "",
      type: "INCOME",
    });
  };
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };
  const handleSubmit = async () => {
    setLoading(true);

    try {
      let response;

      if (editingCategory) {
        const data = {};
        if (formData.name.trim()) {
          data.name = formData.name.trim();
        }
        response = await axiosClient.patch(
          `${Apis.ADMIN_DEFAULT_CATEGORIES}/${editingCategory.id}`,
          data,
        );
      } else {
        const data = {
          name: formData.name.trim(),
          type: formData.type,
        };
        response = await axiosClient.post(Apis.ADMIN_DEFAULT_CATEGORIES, data);
      }

      await showSuccess(response.data.message);
      handleCloseDialog();
      await fetchCategories();
    } catch (error) {
      const message = error.response?.data?.message || "An error occurred!";
      showError(message);
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (category) => {
    const result = await showConfirm(
      `Are you sure you want to delete category "${category.name}"?`,
    );

    if (!result.isConfirmed) {
      return;
    }
    try {
      const response = await axiosClient.delete(
        `${Apis.ADMIN_DEFAULT_CATEGORIES}/${category.id}`,
      );
      await showSuccess(response.data.message);
      await fetchCategories();
    } catch (error) {
      const message = error.response?.data?.message || "An error occurred!";
      showError(message);
    }
  };
  const handleOpenCreateColor = () => {
    setEditingColor(null);
    setColorFormData({
      name: "",
      code: "",
    });
    setOpenColorDialog(true);
  };
  const handleOpenEditColor = (color) => {
    setEditingColor(color);
    setColorFormData({
      name: "",
      code: "",
    });
    setOpenColorDialog(true);
  };
  const handleCloseColorDialog = () => {
    if (loading) {
      return;
    }
    setOpenColorDialog(false);
    setEditingColor(null);
    setColorFormData({
      name: "",
      code: "",
    });
  };
  const handleColorChange = (event) => {
    const { name, value } = event.target;
    setColorFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };
  const handleColorSubmit = async () => {
    setLoading(true);

    try {
      let response;

      if (editingColor) {
        const data = {};
        if (colorFormData.name.trim()) {
          data.name = colorFormData.name.trim();
        }
        if (colorFormData.code.trim()) {
          data.code = colorFormData.code.toUpperCase();
        }
        response = await axiosClient.patch(
          `${Apis.ADMIN_COLORS}/${editingColor.id}`,
          data,
        );
      } else {
        const data = {
          name: colorFormData.name.trim(),
          code: colorFormData.code.toUpperCase(),
        };
        response = await axiosClient.post(Apis.ADMIN_COLORS, data);
      }

      await showSuccess(response.data.message);
      handleCloseColorDialog();
      await fetchColors();
    } catch (error) {
      const message = error.response?.data?.message || "An error occurred!";
      showError(message);
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteColor = async (color) => {
    const result = await showConfirm(
      `Are you sure you want to delete color "${color.name}"?`,
    );

    if (!result.isConfirmed) {
      return;
    }
    try {
      const response = await axiosClient.delete(
        `${Apis.ADMIN_COLORS}/${color.id}`,
      );
      await showSuccess(response.data.message);
      await fetchColors();
    } catch (error) {
      const message = error.response?.data?.message || "An error occurred!";
      showError(message);
    }
  };
  const renderCategoryGroup = (title, type, data) => {
    return (
      <Box>
        <Typography variant="h6" fontWeight={600} align="center" mb={2}>
          {title}
        </Typography>
        <Box sx={{ border: "1px solid #e0e0e0" }}>
          {data.map((category) => (
            <Box
              key={category.id}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 2,
                borderBottom: "1px solid #e0e0e0",
              }}
            >
              <Typography>{category.name}</Typography>
              <Box>
                <IconButton onClick={() => handleOpenEdit(category)}>
                  <EditIcon />
                </IconButton>
                <IconButton
                  onClick={() => handleDelete(category)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
          ))}
          <Box
            onClick={() => handleOpenCreate(type)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              p: 2,
              cursor: "pointer",
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
            <Typography color="text.secondary">Add category</Typography>
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography variant="h6">
          Total user: {dashboard.totalUsers.toLocaleString("en-US")}
        </Typography>
        <Typography variant="h6">
          New user today: {dashboard.newUsersToday.toLocaleString("en-US")}
        </Typography>
        <Typography variant="h6">
          New user this month:{" "}
          {dashboard.newUsersThisMonth.toLocaleString("en-US")}
        </Typography>
      </Box>
      <Typography variant="h6" fontWeight={600} mb={3} align="center">
        New user
      </Typography>
      {dashboard.monthlyUserStats.length === 0 ? (
        <Typography color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
          No data
        </Typography>
      ) : (
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "flex-start",
            gap: 2,
            height: 250,
            overflowX: "auto",
            px: 1,
            mb: 5,
          }}
        >
          {dashboard.monthlyUserStats.map((item) => {
            const maxCount = Math.max(
              ...dashboard.monthlyUserStats.map((stat) => stat.count),
              1,
            );
            const height = (item.count / maxCount) * 180;
            return (
              <Box
                key={item.month}
                sx={{
                  minWidth: 50,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "flex-end",
                }}
              >
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  {item.count}
                </Typography>
                <Box
                  sx={{
                    width: 32,
                    height: `${Math.max(height, 4)}px`,
                    backgroundColor: "primary.main",
                  }}
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  M{item.month}
                </Typography>
              </Box>
            );
          })}
        </Box>
      )}
      <Typography variant="h5" fontWeight={600} mb={3}>
        Default category
      </Typography>
      <Grid container spacing={4} sx={{ mb: 5 }}>
        <Grid item xs={12} md={4}>
          {renderCategoryGroup("Income category", "INCOME", incomeCategories)}
        </Grid>
        <Grid item xs={12} md={4}>
          {renderCategoryGroup(
            "Expense category",
            "EXPENSE",
            expenseCategories,
          )}
        </Grid>
        <Grid item xs={12} md={4}>
          {renderCategoryGroup("Saving category", "SAVING", savingCategories)}
        </Grid>
      </Grid>
      <Typography variant="h5" fontWeight={600} mb={3}>
        Category color
      </Typography>
      <Box sx={{ border: "1px solid #e0e0e0" }}>
        <Box
          onClick={handleOpenCreateColor}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: 2,
            cursor: "pointer",
            borderBottom: "1px solid #e0e0e0",
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
          <Typography color="text.secondary">Add color</Typography>
        </Box>
        {colors.length === 0 ? (
          <Typography
            color="text.secondary"
            sx={{ py: 3, textAlign: "center" }}
          >
            No colors available
          </Typography>
        ) : (
          <Box>
            {colors.map((color) => (
              <Box
                key={color.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 2,
                  borderBottom: "1px solid #e0e0e0",
                  "&:last-child": { borderBottom: "none" },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      backgroundColor: color.code,
                      border: "1px solid #e0e0e0",
                    }}
                  />
                  <Box>
                    <Typography>{color.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {color.code}
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <IconButton onClick={() => handleOpenEditColor(color)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeleteColor(color)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle align="center">
          {editingCategory ? "Edit category" : "Add category"}
        </DialogTitle>
        <DialogContent sx={{ pb: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", mt: 1 }}>
            <TextField
              placeholder={
                editingCategory ? editingCategory.name : "Category name"
              }
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              autoFocus
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
      <Dialog
        open={openColorDialog}
        onClose={handleCloseColorDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle align="center">
          {editingColor ? "Edit color" : "Add color"}
        </DialogTitle>
        <DialogContent sx={{ pb: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", mt: 1 }}>
            <TextField
              placeholder={editingColor ? editingColor.name : "Color name"}
              name="name"
              value={colorFormData.name}
              onChange={handleColorChange}
              fullWidth
              autoFocus
            />
            <TextField
              placeholder={editingColor ? editingColor.code : "HEX code"}
              name="code"
              value={colorFormData.code}
              onChange={handleColorChange}
              fullWidth
              sx={{ mt: "-1px" }}
            />
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 1,
                mt: 3,
              }}
            >
              <Button onClick={handleCloseColorDialog} disabled={loading}>
                Cancel
              </Button>
              <Button
                variant="contained"
                disableElevation
                onClick={handleColorSubmit}
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

export default AdminManagement;
