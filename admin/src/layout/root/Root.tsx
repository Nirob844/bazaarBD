import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import Footer from "../../components/common/Footer";
import Navbar from "../../components/common/Navbar";

const RootLayout = () => {
  return (
    <Box
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <Navbar />
      <Box style={{ flex: 1, marginBottom: "2rem" }}>
        <Outlet />
      </Box>
      <Footer />
    </Box>
  );
};

export default RootLayout;
