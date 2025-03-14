import { Home, LocalOffer, Store } from "@mui/icons-material";
import { alpha, Box, Button, useTheme } from "@mui/material";
import Link from "next/link";

const menuItems = [
  { text: "Home", icon: <Home />, path: "/" },
  { text: "Shop", icon: <Store />, path: "/shop" },
  { text: "Deals", icon: <LocalOffer />, path: "/deals" },
];

const DesktopMenu = () => {
  const theme = useTheme();

  return (
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
  );
};

export default DesktopMenu;
