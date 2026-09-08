import { useEffect, useState } from "react";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  Badge,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Apis from "../utils/Apis";
import axiosClient from "../utils/axiosClient";
import { showSuccess, showError } from "../utils/Swal";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axiosClient.get(Apis.PROFILE);
        localStorage.setItem("role", response.data.role);
        window.dispatchEvent(new Event("user-role-changed"));
      } catch (error) {
        showError(error.response?.data?.message);
      }
    };

    fetchProfile();
  }, []);
  useEffect(() => {
    const fetchUnreadStatus = async () => {
      try {
        const response = await axiosClient.get(
          "/notifications/exist-unread-notification",
        );
        setHasUnread(response.data.existed);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchUnreadStatus();
    const intervalId = setInterval(fetchUnreadStatus, 10000);
    window.addEventListener("focus", fetchUnreadStatus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", fetchUnreadStatus);
    };
  }, [location.pathname]);
  const handleLogout = async () => {
    setIsLoading(true);

    try {
      const refreshToken = localStorage.getItem("refreshToken");
      const response = await axios.post(Apis.LOGOUT, { refreshToken });
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("role");
      window.dispatchEvent(new Event("user-role-changed"));
      await showSuccess(response.data.message);
      navigate("/login", { replace: true });
    } catch (error) {
      showError(error.response?.data?.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppBar position="sticky" elevation={1}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Typography
          variant="h6"
          onClick={() => navigate("/dashboard")}
          sx={{ fontWeight: 600, cursor: "pointer" }}
        >
          Personal Finance Management
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            color="inherit"
            onClick={() => navigate("/notifications")}
          >
            <Badge color="error" variant="dot" invisible={!hasUnread}>
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <IconButton
            color="inherit"
            onClick={handleLogout}
            disabled={isLoading}
            title="Logout"
          >
            <LogoutIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
