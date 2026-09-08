import { useEffect, useState } from "react";
import { Box, List, ListItemButton, ListItemText } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

const menuItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Transactions", path: "/transactions" },
  { label: "Categories", path: "/categories" },
  { label: "Wallets", path: "/wallets" },
  { label: "Budgets", path: "/budgets" },
  { label: "Payment Reminders", path: "/payment-reminders" },
  { label: "Saving Goals", path: "/saving-goals" },
  { label: "Profile", path: "/profile" },
];

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState(localStorage.getItem("role"));
  useEffect(() => {
    const handleRoleChange = () => setRole(localStorage.getItem("role"));
    window.addEventListener("user-role-changed", handleRoleChange);
    return () =>
      window.removeEventListener("user-role-changed", handleRoleChange);
  }, []);

  return (
    <Box
      component="aside"
      sx={{
        width: 240,
        flexShrink: 0,
        borderRight: 1,
        borderColor: "divider",
        minHeight: "calc(100vh - 64px)",
        backgroundColor: "background.paper",
      }}
    >
      <List disablePadding>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.path}
            selected={location.pathname === item.path}
            onClick={() => navigate(item.path)}
          >
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
        {role === "ADMIN" && (
          <ListItemButton
            selected={location.pathname === "/admin"}
            onClick={() => navigate("/admin")}
          >
            <ListItemText primary="Admin" />
          </ListItemButton>
        )}
      </List>
    </Box>
  );
}

export default Sidebar;
