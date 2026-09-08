import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Categories from "./pages/Categories";
import Wallets from "./pages/Wallets";
import Budgets from "./pages/Budgets";
import PaymentReminders from "./pages/PaymentReminders";
import SavingGoals from "./pages/SavingGoals";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AdminManagement from "./pages/AdminManagement";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="categories" element={<Categories />} />
          <Route path="wallets" element={<Wallets />} />
          <Route path="budgets" element={<Budgets />} />
          <Route path="payment-reminders" element={<PaymentReminders />} />
          <Route path="saving-goals" element={<SavingGoals />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
          <Route element={<AdminRoute />}>
            <Route path="admin" element={<AdminManagement />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
