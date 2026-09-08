import { useState } from "react";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Apis from "../utils/Apis";
import { showSuccess, showError } from "../utils/Swal";

const initForgot = { email: "", otp: "", password: "", confirmPassword: "" };
const getErr = (e) => e.response?.data?.message;

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ login: "", password: "" });
  const [forgotData, setForgotData] = useState(initForgot);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const handleChange = (setter) => (e) =>
    setter((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data } = await axios.post(Apis.LOGIN, formData);
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("role", data.role);
      await showSuccess("Login successfully!");
      navigate("/dashboard");
    } catch (error) {
      showError(getErr(error));
    } finally {
      setIsLoading(false);
    }
  };
  const handleSendOtp = async () => {
    setIsSendingOtp(true);

    try {
      const { data } = await axios.post(Apis.FORGET_PASSWORD, {
        email: forgotData.email.trim(),
      });
      await showSuccess(data.message);
    } catch (error) {
      showError(getErr(error));
    } finally {
      setIsSendingOtp(false);
    }
  };
  const handleResetPassword = async () => {
    setIsLoading(true);

    try {
      const payload = {
        ...forgotData,
        email: forgotData.email.trim(),
        otp: forgotData.otp.trim(),
      };
      const { data } = await axios.post(Apis.RESET_PASSWORD, payload);
      await showSuccess(data.message);
      setIsForgotOpen(false);
    } catch (error) {
      showError(getErr(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper sx={{ width: "100%", p: 4 }}>
          <Typography variant="h5" fontWeight={600} mb={3} align="center">
            Login
          </Typography>
          <Box
            component="form"
            onSubmit={handleLogin}
            sx={{ display: "flex", flexDirection: "column" }}
          >
            <TextField
              placeholder="Email / Username"
              name="login"
              value={formData.login}
              onChange={handleChange(setFormData)}
              fullWidth
            />
            <TextField
              placeholder="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange(setFormData)}
              fullWidth
              sx={{ mt: "-1px" }}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{ mt: "-1px", py: 1.5 }}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
            <Button
              variant="text"
              onClick={() => {
                setForgotData(initForgot);
                setIsForgotOpen(true);
              }}
              disabled={isLoading}
            >
              Forget password
            </Button>
            <Button
              variant="text"
              onClick={() => navigate("/register")}
              disabled={isLoading}
            >
              Register
            </Button>
          </Box>
        </Paper>
      </Box>
      <Dialog
        open={isForgotOpen}
        onClose={() => !isLoading && !isSendingOtp && setIsForgotOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle align="center">Forget password</DialogTitle>
        <DialogContent sx={{ pb: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", mt: 1 }}>
            <Box sx={{ display: "flex" }}>
              <TextField
                placeholder="Email"
                name="email"
                type="email"
                value={forgotData.email}
                onChange={handleChange(setForgotData)}
                fullWidth
                autoFocus
              />
              <Button
                variant="outlined"
                onClick={handleSendOtp}
                disabled={isSendingOtp || isLoading}
                sx={{ height: 56, minWidth: 120, ml: "-1px" }}
              >
                {isSendingOtp ? "Sending..." : "Receive OTP"}
              </Button>
            </Box>
            <TextField
              placeholder="OTP"
              name="otp"
              value={forgotData.otp}
              onChange={handleChange(setForgotData)}
              fullWidth
              sx={{ mt: "-1px" }}
            />
            <TextField
              placeholder="New password"
              name="password"
              type="password"
              value={forgotData.password}
              onChange={handleChange(setForgotData)}
              fullWidth
              sx={{ mt: "-1px" }}
            />
            <TextField
              placeholder="Confirm new password"
              name="confirmPassword"
              type="password"
              value={forgotData.confirmPassword}
              onChange={handleChange(setForgotData)}
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
                onClick={() => setIsForgotOpen(false)}
                disabled={isLoading || isSendingOtp}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleResetPassword}
                disabled={isLoading || isSendingOtp}
              >
                {isLoading ? "Processing..." : "Reset Password"}
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
}

export default Login;
