import { Navigate, Outlet } from "react-router-dom";

function AdminRoute() {
  const role = localStorage.getItem("role");

  if (role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default AdminRoute;
