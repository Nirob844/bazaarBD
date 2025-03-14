import { isLoggedIn } from "@/utils/auth";
import { Close, Home, LocalOffer, Store } from "@mui/icons-material";
import {
  Box,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
} from "@mui/material";
import Link from "next/link";

const menuItems = [
  { text: "Home", icon: <Home />, path: "/" },
  { text: "Shop", icon: <Store />, path: "/shop" },
  { text: "Deals", icon: <LocalOffer />, path: "/deals" },
];

const MobileDrawer = ({
  toggleDrawer,
  handleLogout,
}: {
  toggleDrawer: (open: boolean) => () => void;
  handleLogout: () => void;
}) => {
  const theme = useTheme();
  const loggedIn = isLoggedIn();

  return (
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
              <ListItemText primary="Profile" />
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
              <ListItemText primary="Logout" />
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
              <ListItemText primary="Login" />
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
              <ListItemText primary="Register" />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );
};

export default MobileDrawer;
