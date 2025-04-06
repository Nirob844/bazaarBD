import DashboardLayout from "../layout/dashboard/Dashboard";
import Category from "../pages/category/Category";
import Dashboard from "../pages/dashboard/Dashboard";
import Order from "../pages/order/Order";
import Product from "../pages/product/Product";
import User from "../pages/user/User";
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
      path: "user",
      element: (
        <ProtectedRoute role="ADMIN">
          <User />
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
    {
      path: "order",
      element: (
        <ProtectedRoute role="ADMIN">
          <Order />
        </ProtectedRoute>
      ),
    },
  ],
};

export default adminRoutes;
