import CategoryIcon from "@mui/icons-material/Category";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupIcon from "@mui/icons-material/Group";
import InventoryIcon from "@mui/icons-material/Inventory";
import LocalMallIcon from "@mui/icons-material/LocalMall";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
} from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { selectCurrentUser } from "../../redux/slice/authSlice";

// Props Type Definition
interface SidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  isMobile: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  isSidebarOpen,
  toggleSidebar,
  isMobile,
}) => {
  const currentUser = useSelector(selectCurrentUser);
  const role = currentUser?.role?.toLowerCase() ?? "";
  const location = useLocation();

  const drawerWidth = 280;

  const sidebarItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "dashboard" },
    { text: "User Management", icon: <GroupIcon />, path: "user" },
    { text: "Category", icon: <CategoryIcon />, path: "category" },
    { text: "Product", icon: <InventoryIcon />, path: "product" },
    { text: "Promotion", icon: <LocalOfferIcon />, path: "promotion" },
    { text: "Order", icon: <LocalMallIcon />, path: "order" },
  ];

  const isActive = (path: string) =>
    location.pathname.startsWith(`/${role}/${path}`);

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={isMobile ? isSidebarOpen : true}
      onClose={isMobile ? toggleSidebar : undefined}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: "border-box" },
      }}
    >
      <Toolbar />
      <Box>
        <List>
          {sidebarItems.map((item) => (
            <ListItem
              key={item.text}
              component={Link}
              to={`/${role}/${item.path}`}
              sx={{
                bgcolor: isActive(item.path)
                  ? "rgba(0, 0, 0, 0.08)"
                  : "transparent",
                "&:hover": { bgcolor: "rgba(0, 0, 0, 0.04)" },
                color: isActive(item.path) ? "primary.main" : "inherit",
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
