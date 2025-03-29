/* eslint-disable @typescript-eslint/no-explicit-any */
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MenuIcon from "@mui/icons-material/Menu";
import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { logout } from "../../redux/slice/authSlice";

const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const dispatch = useDispatch();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const drawer = (
    <List>
      <ListItem button component={Link as any} to="/dashboard">
        <ListItemText primary="Dashboard" />
      </ListItem>
      <ListItem button component={Link as any} to="/products">
        <ListItemText primary="Products" />
      </ListItem>
      <ListItem button component={Link as any} to="/orders">
        <ListItemText primary="Orders" />
      </ListItem>
      <ListItem button component={Link as any} to="/users">
        <ListItemText primary="Users" />
      </ListItem>
    </List>
  );

  return (
    <>
      {/* Top Navbar */}
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            BazaarBD Admin
          </Typography>

          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            <Button color="inherit" component={Link} to="/dashboard">
              Dashboard
            </Button>
            <Button color="inherit" component={Link} to="/products">
              Products
            </Button>
            <Button color="inherit" component={Link} to="/orders">
              Orders
            </Button>
            <Button color="inherit" component={Link} to="/users">
              Users
            </Button>
          </Box>

          <IconButton color="inherit" onClick={handleLogout}>
            <AccountCircleIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Mobile Sidebar */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{ display: { sm: "none" } }}
      >
        {drawer}
      </Drawer>

      {/* Space below AppBar */}
      <Toolbar />
    </>
  );
};

export default Navbar;
