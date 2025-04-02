import DashboardLayout from "../layout/dashboard/Dashboard";
import Category from "../pages/category/Category";
import Dashboard from "../pages/dashboard/Dashboard";
import Product from "../pages/product/Product";
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
    {
      path: "product",
      element: (
        <ProtectedRoute role="ADMIN">
          <Product />
        </ProtectedRoute>
      ),
    },
  ],
};

export default adminRoutes;
