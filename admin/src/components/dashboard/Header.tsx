import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import {
  AppBar,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Stack,
  Toolbar,
  Typography,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { logout, selectCurrentUser } from "../../redux/slice/authSlice";
import ModalComponent from "../ui/ModalComponent";

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const role = currentUser?.role ?? "";

  const handleLogoutConfirm = async () => {
    try {
      setIsLoggingOut(true); // Show spinner while logging out
      await dispatch(logout()); // Ensure logout completes
      toast.success("Logged out successfully!");
      navigate("/login"); // Navigate after logout
    } catch {
      toast.error("Failed to log out. Please try again.");
    } finally {
      setIsLogoutModalOpen(false); // Close the modal
      setIsLoggingOut(false); // Hide spinner
    }
  };

  return (
    <>
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          {/* Sidebar Toggle Button (Mobile) */}
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleSidebar}
            sx={{ display: { xs: "block", md: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo */}
          <Typography
            variant="h6"
            component={Link}
            to="/login"
            sx={{
              color: "white",
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            BazarBD
          </Typography>

          {/* User Role & Logout Button */}
          <Box>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="h6" sx={{ color: "white" }}>
                {role}
              </Typography>
              <Button
                startIcon={<LogoutIcon />}
                variant="outlined"
                color="inherit"
                onClick={() => setIsLogoutModalOpen(true)}
              >
                Logout
              </Button>
            </Stack>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Logout Confirmation Modal */}
      <ModalComponent
        open={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Confirm Logout"
      >
        <Typography>Are you sure you want to log out?</Typography>
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleLogoutConfirm}
            disabled={isLoggingOut}
            startIcon={
              isLoggingOut ? (
                <CircularProgress size={20} color="inherit" />
              ) : null
            }
          >
            {isLoggingOut ? "Logging out..." : "Yes, Logout"}
          </Button>
          <Button
            variant="outlined"
            onClick={() => setIsLogoutModalOpen(false)}
          >
            Cancel
          </Button>
        </Stack>
      </ModalComponent>
    </>
  );
};

export default Header;
