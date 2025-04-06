import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CategoryIcon from "@mui/icons-material/Category";
import CodeIcon from "@mui/icons-material/Code";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DateRangeIcon from "@mui/icons-material/DateRange";
import RewardIcon from "@mui/icons-material/EmojiEvents";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import GroupIcon from "@mui/icons-material/Group";
import InventoryIcon from "@mui/icons-material/Inventory";
import LocalMallIcon from "@mui/icons-material/LocalMall";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import CommissionIcon from "@mui/icons-material/Paid";
import PendingIcon from "@mui/icons-material/Pending";
import {
  Box,
  Collapse,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
} from "@mui/material";
import React, { useState } from "react";
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
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const currentUser = useSelector(selectCurrentUser);
  const role = currentUser?.role?.toLowerCase() ?? "";
  const location = useLocation();

  // Toggle submenu
  const handleMenuToggle = (menu: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  const drawerWidth = 280;

  const sidebarItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "dashboard" },
    { text: "User Management", icon: <GroupIcon />, path: "user" },
    { text: "Category", icon: <CategoryIcon />, path: "category" },
    { text: "Product", icon: <InventoryIcon />, path: "product" },
    { text: "Orders", icon: <LocalMallIcon />, path: "order" },
    {
      text: "Promotion",
      icon: <LocalOfferIcon />,
      subItems: [
        {
          text: "Refer Code",
          icon: <CodeIcon />,
          path: "promotion/refer_code",
        },
        {
          text: "Point Price",
          icon: <AttachMoneyIcon />,
          path: "promotion/point_price",
        },
        {
          text: "Commission",
          icon: <CommissionIcon />,
          path: "promotion/commission",
        },
        {
          text: "Commission Pending",
          icon: <PendingIcon />,
          path: "promotion/commission_pending",
        },
        {
          text: "Commission Request",
          icon: <DateRangeIcon />,
          path: "promotion/commission_request",
        },
        {
          text: "Commission Deadline",
          icon: <AccessTimeIcon />,
          path: "promotion/commission_deadline",
        },
        { text: "Reward", icon: <RewardIcon />, path: "promotion/reward" },
        {
          text: "Valid Days",
          icon: <DateRangeIcon />,
          path: "promotion/valid_days",
        },
      ],
    },
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
          {sidebarItems.map((item) =>
            item.subItems ? (
              <React.Fragment key={item.text}>
                <ListItem
                  component="button"
                  onClick={() => handleMenuToggle(item.text)}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                  {openMenus[item.text] ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                <Collapse
                  in={openMenus[item.text]}
                  timeout="auto"
                  unmountOnExit
                >
                  <List component="div" disablePadding>
                    {item.subItems.map((subItem) => (
                      <ListItem
                        key={subItem.text}
                        component={Link}
                        to={`/${role}/${subItem.path}`}
                        sx={{
                          pl: 4,
                          bgcolor: isActive(subItem.path)
                            ? "rgba(0, 0, 0, 0.08)"
                            : "transparent",
                          "&:hover": { bgcolor: "rgba(0, 0, 0, 0.04)" },
                          color: isActive(subItem.path)
                            ? "primary.main"
                            : "inherit",
                        }}
                      >
                        <ListItemIcon>{subItem.icon}</ListItemIcon>
                        <ListItemText primary={subItem.text} />
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </React.Fragment>
            ) : (
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
            )
          )}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
