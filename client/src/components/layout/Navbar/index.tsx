"use client";

import { authKey } from "@/constants/storage";
import { useGetCartQuery } from "@/redux/api/cartApi";
import { useProfileQuery } from "@/redux/api/profileApi";
import { getUserInfo, isLoggedIn, removeUserInfo } from "@/utils/auth";
import { Menu as MenuIcon } from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Drawer,
  IconButton,
  Toolbar,
  alpha,
  useTheme,
} from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import CartButton from "./CartButton";
import DesktopMenu from "./DesktopMenu";
import LoginButton from "./LoginButton";
import Logo from "./Logo";
import MobileDrawer from "./MobileDrawer";
import ProfileMenu from "./ProfileMenu";
import SearchBar from "./SearchBar";

const Navbar = () => {
  const theme = useTheme();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const openProfile = Boolean(anchorEl);

  // Search bar logic
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("searchTerm") || "";
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  // Control drawer open/close
  const toggleDrawer = (open: boolean) => () => setMobileOpen(open);

  // Profile menu handlers
  const handleProfileMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    removeUserInfo(authKey);
    handleClose();
    router.push("/login");
  };

  // Use effect to handle client-only logic (window, localStorage)
  useEffect(() => {
    setMounted(true);

    const loginStatus = isLoggedIn();
    const user = getUserInfo() as { userId: string };

    setLoggedIn(loginStatus);
    setUserId(user?.userId ?? null);
  }, [getUserInfo(), isLoggedIn()]);

  const { data: cart, isLoading: cartLoading } = useGetCartQuery(userId, {
    skip: !userId,
  });

  const { data: userData, isLoading: profileLoading } = useProfileQuery(
    {},
    { skip: !loggedIn }
  );

  if (!mounted || cartLoading || profileLoading) {
    return null; // or <div>Loading...</div> if you want to show something
  }

  const { name, profile } = userData?.data || {};

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
        {/* Mobile Menu Icon */}
        <IconButton
          edge="start"
          color="inherit"
          onClick={toggleDrawer(true)}
          sx={{ display: { xs: "flex", md: "none" }, mr: 1 }}
        >
          <MenuIcon />
        </IconButton>

        <Logo />

        <DesktopMenu />

        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        {/* Action Buttons */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {loggedIn ? (
            <>
              <CartButton cart={cart} />
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
                <Avatar
                  alt={name || "User"}
                  src={profile?.avatar || ""}
                  sx={{ width: 32, height: 32 }}
                >
                  {name ? name.charAt(0).toUpperCase() : "U"}
                </Avatar>
              </Button>
            </>
          ) : (
            <LoginButton />
          )}
        </Box>

        <ProfileMenu
          anchorEl={anchorEl}
          openProfile={openProfile}
          handleClose={handleClose}
          handleLogout={handleLogout}
        />
      </Toolbar>

      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={toggleDrawer(false)}
        ModalProps={{ keepMounted: true }}
        PaperProps={{ sx: { width: { xs: "100%", sm: 300 } } }}
      >
        <MobileDrawer toggleDrawer={toggleDrawer} handleLogout={handleLogout} />
      </Drawer>
    </AppBar>
  );
};

export default Navbar;
