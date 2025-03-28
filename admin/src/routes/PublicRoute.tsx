import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { selectCurrentUser } from "../redux/slice/authSlice";

const PublicRoute = () => {
  const currentUser = useSelector(selectCurrentUser); // Get the current user state
  const role = currentUser ? currentUser.role : null;

  if (role) {
    return <Navigate to={`/${role.toLowerCase()}/dashboard`} />;
  } else {
    return <Navigate to="/login" />;
  }
};

export default PublicRoute;
