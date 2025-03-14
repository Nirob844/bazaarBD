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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mounted, setMounted] = useState(false);

  const openProfile = Boolean(anchorEl);
  const theme = useTheme();
  const router = useRouter();
  const loggedIn = isLoggedIn();

  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("searchTerm") || "";
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  const { userId } = getUserInfo() as { userId: string };

  const toggleDrawer = (open: boolean) => () => setMobileOpen(open);

  const handleProfileMenu = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);

  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    removeUserInfo(authKey);
    handleClose();
    router.push("/login");
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: cart, isLoading } = useGetCartQuery(userId);
  const { data: userData, isLoading: profileLoading } = useProfileQuery({});

  if (!mounted || isLoading || profileLoading) return null;

  const { name, profile } = userData?.data;

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
                  {name ? name.toUpperCase() : "U"}
                </Avatar>
                {/* <Typography
                  variant="body2"
                  sx={{ color: theme.palette.common.white }}
                >
                  {name || "My Account"}
                </Typography> */}
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
