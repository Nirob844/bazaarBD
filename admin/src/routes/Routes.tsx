import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Login from "../pages/login/Login";
import adminRoutes from "./AdminRoutes";
import PublicRoute from "./PublicRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <PublicRoute />,
      },
      {
        path: "/login",
        element: <Login />,
      },
    ],
  },
  adminRoutes,
]);
