import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Apis from "../utils/Apis";
import axiosClient from "../utils/axiosClient";
import { showConfirm, showError, showSuccess } from "../utils/Swal";

const initForm = { name: "", balance: "" };
const getErr = (e) => e.response?.data?.message || "An error occurred!";
const formatMoney = (val) => Number(val || 0).toLocaleString("en-US");
function Wallets() {
  const [wallets, setWallets] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingWallet, setEditingWallet] = useState(null);
  const [formData, setFormData] = useState(initForm);
  const [loading, setLoading] = useState(false);
  const fetchWallets = async () => {
    try {
      const { data } = await axiosClient.get(Apis.WALLETS);
      setWallets(data);
    } catch (error) {
      showError(getErr(error));
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleOpenDialog = (wallet = null) => {
    setEditingWallet(wallet);
    setFormData(initForm);
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    if (loading) return;
    setOpenDialog(false);
    setEditingWallet(null);
    setFormData(initForm);
  };
  const handleSubmit = async () => {
    const { name, balance } = formData;
    const isEdit = Boolean(editingWallet);
    setLoading(true);

    try {
      if (isEdit) {
        const payload = {};
        if (name.trim()) payload.name = name.trim();
        if (balance !== "") payload.balance = Number(balance);
        await axiosClient.patch(`${Apis.WALLETS}/${editingWallet.id}`, payload);
      } else {
        await axiosClient.post(Apis.WALLETS, {
          name: name.trim(),
          balance: Number(balance),
        });
      }
      await showSuccess("Save successful!");
      handleCloseDialog();
      fetchWallets();
    } catch (error) {
      showError(getErr(error));
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (wallet) => {
    const result = await showConfirm(
      `"${wallet.name}" will be deleted. Are you sure?`,
    );

    if (!result.isConfirmed) return;
    try {
      await axiosClient.delete(`${Apis.WALLETS}/${wallet.id}`);
      await showSuccess("Delete successful!");
      fetchWallets();
    } catch (error) {
      showError(getErr(error));
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} mb={3}>
        Wallets
      </Typography>
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
          <Typography color="text.secondary">Add wallet</Typography>
        </Box>
        {wallets.map((wallet) => (
          <Box
            key={wallet.id}
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
                {wallet.name}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                {formatMoney(wallet.balance)}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton onClick={() => handleOpenDialog(wallet)}>
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => handleDelete(wallet)} color="error">
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
          {editingWallet ? "Edit wallet" : "Add wallet"}
        </DialogTitle>
        <DialogContent sx={{ pb: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", mt: 1 }}>
            <TextField
              placeholder={editingWallet ? editingWallet.name : "Wallet name"}
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              autoFocus
            />
            <TextField
              placeholder={
                editingWallet
                  ? String(editingWallet.balance)
                  : "Current balance"
              }
              name="balance"
              type="number"
              value={formData.balance}
              onChange={handleChange}
              fullWidth
              sx={{ mt: "-1px" }}
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

export default Wallets;
