import { ReactNode } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

import { logout, useCurrentToken } from "../redux/slice/authSlice";
import { decodeToken } from "../utils/jwt";

// Define the expected props
interface ProtectedRouteProps {
  children: ReactNode;
  role?: string;
}

// Define user type
interface DecodedUser {
  userId: string;
  role: string;
  exp: number;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const token = useSelector(useCurrentToken) as string;
  const dispatch = useDispatch();
  let user: DecodedUser | null = null;

  if (token) {
    user = decodeToken(token) as DecodedUser;
  }

  // Check for role if specified
  if (role !== undefined && role !== user?.role) {
    toast.error("Forbidden Access");
    dispatch(logout());
    return <Navigate to="/login" replace />;
  }

  // Redirect if no token
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children; // Render the protected component
};

export default ProtectedRoute;
