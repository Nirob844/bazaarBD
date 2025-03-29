import { Box, Container, Typography } from "@mui/material";

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        mt: "auto",
        backgroundColor: "primary.main",
        color: "white",
        textAlign: "center",
        position: "fixed",
        bottom: 0,
        width: "100%",
      }}
    >
      <Container>
        <Typography variant="body2">
          © {new Date().getFullYear()} BazaarBD Admin Panel. All rights
          reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
