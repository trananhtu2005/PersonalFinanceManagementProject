import { useState } from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Apis from "../utils/Apis";
import { showSuccess, showError } from "../utils/Swal";

const getErr = (e) => e.response?.data?.message;

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.post(Apis.REGISTER, formData);
      await showSuccess(data.message);
      navigate("/login");
    } catch (error) {
      showError(getErr(error));
    } finally {
      setLoading(false);
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
        <Paper
          elevation={0}
          square
          sx={{ width: "100%", p: 4, border: "1px solid #e0e0e0" }}
        >
          <Typography variant="h5" fontWeight={600} mb={3} align="center">
            Register
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column" }}
          >
            <TextField
              placeholder="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              placeholder="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              fullWidth
              sx={{ mt: "-1px" }}
            />
            <TextField
              placeholder="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              fullWidth
              sx={{ mt: "-1px" }}
            />
            <TextField
              placeholder="Confirm password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              fullWidth
              sx={{ mt: "-1px" }}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              disableElevation
              disabled={loading}
              sx={{ mt: "-1px", py: 1.5 }}
            >
              {loading ? "Registering..." : "Register"}
            </Button>
            <Button
              variant="text"
              onClick={() => navigate("/login")}
              disabled={loading}
            >
              Login
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default Register;
