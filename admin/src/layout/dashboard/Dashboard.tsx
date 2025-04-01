import { Box, useMediaQuery, useTheme } from "@mui/material";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Footer from "../../components/common/Footer";
import Header from "../../components/dashboard/Header";
import Sidebar from "../../components/dashboard/Sidebar";

const drawerWidth = 240;

const DashboardLayout = () => {
  const theme = useTheme(); // Use MUI Theme
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // MUI's responsive hook

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header toggleSidebar={toggleSidebar} />
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        isMobile={isMobile}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          ml: isMobile ? 0 : `${drawerWidth}px`, // No margin on mobile
          transition: "margin 0.3s ease", // Smooth transition
        }}
      >
        <Outlet />
      </Box>

      <Footer />
    </Box>
  );
};

export default DashboardLayout;
