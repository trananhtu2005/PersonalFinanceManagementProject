import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import Apis from "../utils/Apis";
import axiosClient from "../utils/axiosClient";
import { showError, showSuccess } from "../utils/Swal";

const PAGE_SIZE = 10;
const getErrObj = (e) => e.response?.data?.message || "An error occurred!";
const formatDateTime = (date) =>
  date ? new Date(date).toLocaleString("en-US") : "";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(0);
  const [last, setLast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const observerRef = useRef(null);
  const fetchNotifications = async (pageNumber = 0, reset = false) => {
    if (loading || (!reset && pageNumber > 0 && last)) return;

    setLoading(true);

    try {
      const { data } = await axiosClient.get(Apis.NOTIFICATIONS, {
        params: { page: pageNumber, size: PAGE_SIZE },
      });
      setNotifications((prev) =>
        reset ? data.content : [...prev, ...data.content],
      );
      setPage(data.number);
      setLast(data.last);
    } catch (error) {
      showError(getErrObj(error));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchNotifications(0, true);
  }, []);
  const lastNotificationRef = (node) => {
    if (loading) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !last) fetchNotifications(page + 1);
      },
      { threshold: 0.1 },
    );

    if (node) observerRef.current.observe(node);
  };
  useEffect(() => () => observerRef.current?.disconnect(), []);
  const handleOpenNotification = async (notification) => {
    try {
      const { data } = await axiosClient.get(
        `${Apis.NOTIFICATIONS}/${notification.id}`,
      );
      setSelectedNotification(data);
    } catch (error) {
      showError(getErrObj(error));
    }
  };
  const handleCloseNotification = () => {
    setSelectedNotification(null);
    fetchNotifications(0, true);
  };
  const handleReadAll = async () => {
    try {
      const { data } = await axiosClient.patch(Apis.NOTIFICATIONS_READ_ALL);
      await showSuccess(data.message || "Marked all as read!");
      fetchNotifications(0, true);
    } catch (error) {
      showError(getErrObj(error));
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          mb: 3,
        }}
      >
        {notifications.some((n) => !n.read) && (
          <Button variant="contained" disableElevation onClick={handleReadAll}>
            Mark all as read
          </Button>
        )}
      </Box>
      <Box>
        {notifications.length === 0 && !loading ? (
          <Typography
            color="text.secondary"
            sx={{
              py: 3,
              textAlign: "center",
              border: "1px solid #e0e0e0",
            }}
          >
            No notifications
          </Typography>
        ) : (
          notifications.map((notification, idx) => (
            <Box
              key={notification.id}
              ref={
                idx === notifications.length - 1 ? lastNotificationRef : null
              }
              onClick={() => handleOpenNotification(notification)}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                p: 2,
                border: "1px solid #e0e0e0",
                mt: "-1px",
                cursor: "pointer",
                backgroundColor: notification.read
                  ? "transparent"
                  : "action.hover",
                "&:hover": { backgroundColor: "action.selected" },
              }}
            >
              <Box sx={{ flex: 1, pr: 2 }}>
                <Typography fontWeight={notification.read ? 400 : 600}>
                  {notification.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {formatDateTime(notification.createdAt)}
                </Typography>
              </Box>

              {!notification.read && (
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: "primary.main",
                    mt: 1,
                    flexShrink: 0,
                  }}
                />
              )}
            </Box>
          ))
        )}
        <Box
          sx={{
            minHeight: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mt: 2,
          }}
        >
          {loading && <CircularProgress size={28} />}
        </Box>
      </Box>
      <Dialog
        open={Boolean(selectedNotification)}
        onClose={handleCloseNotification}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{selectedNotification?.title}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {formatDateTime(selectedNotification?.createdAt)}
          </Typography>
          <Typography sx={{ whiteSpace: "pre-wrap" }}>
            {selectedNotification?.content}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            variant="contained"
            disableElevation
            onClick={handleCloseNotification}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Notifications;
