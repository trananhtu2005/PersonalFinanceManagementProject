import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
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

const initForm = { name: "", colorId: "", type: "INCOME" };
const getErr = (e) => e.response?.data?.message;
function Categories() {
  const [categories, setCategories] = useState([]);
  const [defaultCategories, setDefaultCategories] = useState([]);
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState(initForm);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [catRes, defCatRes, colRes] = await Promise.all([
          axiosClient.get(Apis.CATEGORIES),
          axiosClient.get(Apis.DEFAULT_CATEGORIES),
          axiosClient.get(Apis.COLORS),
        ]);
        setCategories(catRes.data);
        setDefaultCategories(defCatRes.data);
        setColors(colRes.data);
      } catch (error) {
        showError(getErr(error));
      }
    };
    loadInitialData();
  }, []);

  const reloadCategories = async () => {
    try {
      setCategories((await axiosClient.get(Apis.CATEGORIES)).data);
    } catch (e) {
      showError(getErr(e));
    }
  };
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleOpenDialog = (type, category = null) => {
    setEditingCategory(category);
    setFormData(
      category
        ? {
            name: "",
            colorId: "",
            type: category.type,
          }
        : { ...initForm, type },
    );
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    if (loading) return;
    setOpenDialog(false);
    setEditingCategory(null);
    setFormData(initForm);
  };
  const handleSubmit = async () => {
    const isEdit = Boolean(editingCategory);
    const { name, colorId, type } = formData;
    setLoading(true);

    try {
      if (isEdit) {
        const payload = {};
        if (name.trim()) payload.name = name.trim();
        if (colorId) payload.colorId = Number(colorId);
        await axiosClient.patch(
          `${Apis.CATEGORIES}/${editingCategory.id}`,
          payload,
        );
      } else {
        await axiosClient.post(Apis.CATEGORIES, {
          name: name.trim(),
          colorId: Number(colorId),
          type,
        });
      }
      await showSuccess("Save successful!");
      handleCloseDialog();
      reloadCategories();
    } catch (e) {
      showError(getErr(e));
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (category) => {
    const result = await showConfirm(
      `"${category.name}" will be deleted. Are you sure?`,
    );
    if (!result.isConfirmed) return;

    try {
      await axiosClient.delete(`${Apis.CATEGORIES}/${category.id}`);
      await showSuccess("Delete successful!");
      reloadCategories();
    } catch (e) {
      showError(getErr(e));
    }
  };
  const renderCategoryGroup = (title, type) => {
    const filteredList = categories.filter((c) => c.type === type);

    return (
      <Box>
        <Typography variant="h6" fontWeight={600} align="center" mb={2}>
          {title}
        </Typography>
        <Box sx={{ border: "1px solid #e0e0e0" }}>
          {filteredList.map((c) => (
            <Box
              key={c.id}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 2,
                borderBottom: "1px solid #e0e0e0",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    backgroundColor: c.colorCode,
                    border: "1px solid #e0e0e0",
                  }}
                />
                <Typography>{c.name}</Typography>
              </Box>
              <Box>
                <IconButton onClick={() => handleOpenDialog(type, c)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDelete(c)} color="error">
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
          ))}
          <Box
            onClick={() => handleOpenDialog(type)}
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

  const currentDefaults = defaultCategories.filter(
    (c) => c.type === formData.type,
  );
  const curColorName = editingCategory
    ? colors.find((c) => c.code === editingCategory.colorCode)?.name
    : null;

  return (
    <Box>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          {renderCategoryGroup("Income category", "INCOME")}
        </Grid>
        <Grid item xs={12} md={4}>
          {renderCategoryGroup("Expense category", "EXPENSE")}
        </Grid>
        <Grid item xs={12} md={4}>
          {renderCategoryGroup("Saving category", "SAVING")}
        </Grid>
      </Grid>
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
            {currentDefaults.length > 0 && !editingCategory && (
              <Box sx={{ p: 2, border: "1px solid #e0e0e0", mt: "-1px" }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Suggestions:
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {currentDefaults.map((c) => (
                    <Button
                      key={c.id}
                      variant="outlined"
                      size="small"
                      disableElevation
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, name: c.name }))
                      }
                    >
                      {c.name}
                    </Button>
                  ))}
                </Box>
              </Box>
            )}
            <TextField
              select
              name="colorId"
              value={formData.colorId}
              onChange={handleChange}
              displayEmpty
              fullWidth
              sx={{ mt: "-1px" }}
            >
              <MenuItem value="" disabled>
                {editingCategory ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        backgroundColor: editingCategory.colorCode,
                        border: "1px solid #e0e0e0",
                      }}
                    />
                    <Typography>
                      {curColorName || editingCategory.colorCode}
                    </Typography>
                  </Box>
                ) : (
                  "Select color"
                )}
              </MenuItem>
              {colors.map((color) => (
                <MenuItem key={color.id} value={color.id}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        backgroundColor: color.code,
                        border: "1px solid #e0e0e0",
                      }}
                    />
                    <Typography>{color.name}</Typography>
                  </Box>
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

export default Categories;
