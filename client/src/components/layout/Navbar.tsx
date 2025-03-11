"use client";

import { authKey } from "@/constants/storage";
import { isLoggedIn, removeUserInfo } from "@/utils/auth";
import {
  Close,
  Home,
  LocalOffer,
  Menu as MenuIcon,
  Search,
  ShoppingCart,
  Store,
} from "@mui/icons-material";
import {
  AppBar,
  Badge,
  Box,
  Button,
  Drawer,
  IconButton,
  InputBase,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Menu as MuiMenu,
  Toolbar,
  Typography,
  alpha,
  styled,
  useTheme,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const SearchField = styled(InputBase)(({ theme }) => ({
  width: "100%",
  transition: "all 0.3s ease",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 2),
    borderRadius: 30,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    "&:hover": {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    "&:focus": {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
  },
}));

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mounted, setMounted] = useState(false);

  const openProfile = Boolean(anchorEl);
  const theme = useTheme();
  const router = useRouter();
  const loggedIn = isLoggedIn();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleDrawer = (open: boolean) => () => setMobileOpen(open);

  const handleProfileMenu = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);

  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    removeUserInfo(authKey);
    handleClose();
    router.push("/login");
  };

  const menuItems = [
    { text: "Home", icon: <Home />, path: "/" },
    { text: "Shop", icon: <Store />, path: "/shop" },
    { text: "Deals", icon: <LocalOffer />, path: "/deals" },
  ];

  const drawer = (
    <Box sx={{ width: 300 }} role="presentation">
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
        }}
      >
        <Typography variant="h6">BazaarBD</Typography>
        <IconButton onClick={toggleDrawer(false)}>
          <Close />
        </IconButton>
      </Box>

      <List>
        {menuItems.map((item) => (
          <ListItem
            key={item.text}
            component={Link}
            href={item.path}
            onClick={toggleDrawer(false)}
            sx={{
              "&:hover": { backgroundColor: theme.palette.action.hover },
              borderRadius: 2,
              my: 1,
              mx: 2,
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{ fontWeight: 500 }}
            />
          </ListItem>
        ))}

        {loggedIn ? (
          <>
            <ListItem
              component={Link}
              href="/profile"
              onClick={toggleDrawer(false)}
              sx={{
                "&:hover": { backgroundColor: theme.palette.action.hover },
                borderRadius: 2,
                my: 1,
                mx: 2,
              }}
            >
              <ListItemText
                primary="Profile"
                primaryTypographyProps={{ fontWeight: 500 }}
              />
            </ListItem>

            <ListItem
              onClick={() => {
                handleLogout();
                toggleDrawer(false)();
              }}
              sx={{
                "&:hover": { backgroundColor: theme.palette.action.hover },
                borderRadius: 2,
                my: 1,
                mx: 2,
              }}
            >
              <ListItemText
                primary="Logout"
                primaryTypographyProps={{ fontWeight: 500 }}
              />
            </ListItem>
          </>
        ) : (
          <>
            <ListItem
              component={Link}
              href="/login"
              onClick={toggleDrawer(false)}
              sx={{
                "&:hover": { backgroundColor: theme.palette.action.hover },
                borderRadius: 2,
                my: 1,
                mx: 2,
              }}
            >
              <ListItemText
                primary="Login"
                primaryTypographyProps={{ fontWeight: 500 }}
              />
            </ListItem>

            <ListItem
              component={Link}
              href="/register"
              onClick={toggleDrawer(false)}
              sx={{
                "&:hover": { backgroundColor: theme.palette.action.hover },
                borderRadius: 2,
                my: 1,
                mx: 2,
              }}
            >
              <ListItemText
                primary="Register"
                primaryTypographyProps={{ fontWeight: 500 }}
              />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  if (!mounted) return null;

  return (
    <AppBar
      position="sticky"
      sx={{
        background: theme.palette.primary.main,
        boxShadow: theme.shadows[4],
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Toolbar sx={{ maxWidth: 1440, margin: "auto", width: "100%" }}>
        {/* Mobile Menu */}
        <IconButton
          edge="start"
          color="inherit"
          onClick={toggleDrawer(true)}
          sx={{ display: { xs: "flex", md: "none" }, mr: 1 }}
        >
          <MenuIcon />
        </IconButton>

        {/* Logo */}
        <Typography
          variant="h5"
          component={Link}
          href="/"
          sx={{
            flexGrow: 1,
            fontWeight: 800,
            letterSpacing: "-0.5px",
            textDecoration: "none",
            color: theme.palette.common.white,
            "&:hover": { opacity: 0.9 },
          }}
        >
          BazaarBD
          <Box
            component="span"
            sx={{ fontSize: 12, fontWeight: 400, ml: 1, opacity: 0.8 }}
          >
            Premium Marketplace
          </Box>
        </Typography>

        {/* Desktop Navigation */}
        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1, mx: 4 }}>
          {menuItems.map((item) => (
            <Button
              key={item.text}
              component={Link}
              href={item.path}
              startIcon={item.icon}
              sx={{
                color: theme.palette.common.white,
                "&:hover": {
                  backgroundColor: alpha(theme.palette.common.white, 0.1),
                },
                borderRadius: 3,
                px: 3,
              }}
            >
              {item.text}
            </Button>
          ))}
        </Box>

        {/* Search Bar */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            alignItems: "center",
            flexGrow: 1,
            maxWidth: 400,
            mx: 4,
            width: "100%",
          }}
        >
          <SearchField
            fullWidth
            placeholder="Search products..."
            sx={{ color: theme.palette.common.white }}
            startAdornment={
              <Search sx={{ color: theme.palette.common.white, mr: 1 }} />
            }
          />
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {loggedIn ? (
            <>
              {/* Cart Button */}
              <IconButton
                component={Link}
                href="/cart"
                sx={{
                  color: theme.palette.common.white,
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.common.white, 0.1),
                  },
                  borderRadius: 2,
                }}
              >
                <Badge badgeContent={2} color="error">
                  <ShoppingCart />
                </Badge>
              </IconButton>

              {/* Profile Menu */}
              <Button
                onClick={handleProfileMenu}
                sx={{
                  color: theme.palette.common.white,
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.common.white, 0.1),
                  },
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 500,
                }}
              >
                My Account
              </Button>
            </>
          ) : (
            <>
              {/* Login Button */}
              <Button
                component={Link}
                href="/login"
                sx={{
                  color: theme.palette.common.white,
                  backgroundColor: theme.palette.secondary.main,
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.secondary.main, 0.8),
                  },
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 500,
                  padding: "8px 16px",
                  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                  transition:
                    "background-color 0.3s ease, box-shadow 0.3s ease",
                }}
              >
                Login
              </Button>
            </>
          )}
        </Box>

        {/* Profile Dropdown Menu */}
        <MuiMenu
          anchorEl={anchorEl}
          open={openProfile}
          onClose={handleClose}
          sx={{ mt: 1 }}
          PaperProps={{
            sx: {
              minWidth: 200,
              borderRadius: 2,
              boxShadow: theme.shadows[4],
            },
          }}
        >
          <MenuItem onClick={handleClose} component={Link} href="/profile">
            My Account
          </MenuItem>
          <MenuItem onClick={handleClose} component={Link} href="/orders">
            My Orders
          </MenuItem>
          <MenuItem onClick={handleLogout}>Sign Out</MenuItem>
        </MuiMenu>
      </Toolbar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={toggleDrawer(false)}
        ModalProps={{ keepMounted: true }}
        PaperProps={{ sx: { width: { xs: "100%", sm: 300 } } }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
};

export default Navbar;
