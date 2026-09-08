import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import Apis from "../utils/Apis";
import axiosClient from "../utils/axiosClient";
import { showError, showSuccess } from "../utils/Swal";

const initPassword = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};
const getErrObj = (e) => e.response?.data?.message || "An error occurred!";

function Profile() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [passwordForm, setPasswordForm] = useState(initPassword);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingUsername, setLoadingUsername] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [openUsernameDialog, setOpenUsernameDialog] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const fetchProfile = async () => {
    setLoadingProfile(true);
    try {
      const { data } = await axiosClient.get(Apis.PROFILE);
      setUser(data);
      setUsername(data.username);
    } catch (error) {
      showError(getErrObj(error));
    } finally {
      setLoadingProfile(false);
    }
  };
  useEffect(() => {
    fetchProfile();
  }, []);
  const handleChangeUsername = async () => {
    const trimmedUsername = username.trim();
    setLoadingUsername(true);

    try {
      const { data } = await axiosClient.patch(Apis.CHANGE_USERNAME, {
        username: trimmedUsername,
      });
      await showSuccess(data.message || "Username changed successfully!");
      setOpenUsernameDialog(false);
      fetchProfile();
    } catch (error) {
      showError(getErrObj(error));
    } finally {
      setLoadingUsername(false);
    }
  };
  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    setLoadingPassword(true);

    try {
      const { data } = await axiosClient.patch(
        Apis.CHANGE_PASSWORD,
        passwordForm,
      );
      await showSuccess(data.message || "Password changed successfully!");
      setOpenPasswordDialog(false);
      setPasswordForm(initPassword);
    } catch (error) {
      showError(getErrObj(error));
    } finally {
      setLoadingPassword(false);
    }
  };
  const handlePasswordChange = (e) =>
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });

  if (loadingProfile && !user)
    return (
      <Typography sx={{ mt: 3, textAlign: "center" }}>Loading...</Typography>
    );
  if (!user) return null;

  return (
    <Box>
      <Box sx={{ border: "1px solid #e0e0e0" }}>
        <Box sx={{ display: "flex", p: 2, borderBottom: "1px solid #e0e0e0" }}>
          <Typography sx={{ width: 120, fontWeight: 600 }}>Email</Typography>
          <Typography color="text.secondary">{user.email}</Typography>
        </Box>
        <Box sx={{ display: "flex", p: 2 }}>
          <Typography sx={{ width: 120, fontWeight: 600 }}>Username</Typography>
          <Typography color="text.secondary">{user.username}</Typography>
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
        <Button
          variant="contained"
          disableElevation
          onClick={() => {
            setUsername(user.username);
            setOpenUsernameDialog(true);
          }}
        >
          Change username
        </Button>
        <Button
          variant="contained"
          disableElevation
          onClick={() => {
            setPasswordForm(initPassword);
            setOpenPasswordDialog(true);
          }}
        >
          Change password
        </Button>
      </Box>
      <Dialog
        open={openUsernameDialog}
        onClose={() => !loadingUsername && setOpenUsernameDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle align="center">Change username</DialogTitle>
        <DialogContent sx={{ pb: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", mt: 1 }}>
            <TextField
              placeholder={user.username}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
              <Button
                onClick={() => setOpenUsernameDialog(false)}
                disabled={loadingUsername}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                disableElevation
                onClick={handleChangeUsername}
                disabled={loadingUsername}
              >
                {loadingUsername ? "Saving..." : "Save"}
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
      <Dialog
        open={openPasswordDialog}
        onClose={() => !loadingPassword && setOpenPasswordDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle align="center">Change password</DialogTitle>
        <DialogContent sx={{ pb: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", mt: 1 }}>
            <TextField
              placeholder="Current password"
              name="currentPassword"
              type="password"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              fullWidth
              autoFocus
            />
            <TextField
              placeholder="New password"
              name="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              fullWidth
              sx={{ mt: "-1px" }}
            />
            <TextField
              placeholder="Confirm new password"
              name="confirmPassword"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
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
              <Button
                onClick={() => setOpenPasswordDialog(false)}
                disabled={loadingPassword}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                disableElevation
                onClick={handleChangePassword}
                disabled={loadingPassword}
              >
                {loadingPassword ? "Processing..." : "Save"}
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default Profile;
