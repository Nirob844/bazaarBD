import DashboardLayout from "../layout/dashboard/Dashboard";
import Category from "../pages/category/Category";
import Dashboard from "../pages/dashboard/Dashboard";
import ProtectedRoute from "./ProtectedRoute";

const adminRoutes = {
  path: "/admin",
  element: <DashboardLayout />,
  children: [
    {
      path: "dashboard",
      element: (
        <ProtectedRoute role="ADMIN">
          <Dashboard />
        </ProtectedRoute>
      ),
    },
    {
      path: "category",
      element: (
        <ProtectedRoute role="ADMIN">
          <Category />
        </ProtectedRoute>
      ),
    },
  ],
};

export default adminRoutes;
