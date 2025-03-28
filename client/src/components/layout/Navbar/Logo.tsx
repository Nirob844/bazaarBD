import { Box, Typography, useTheme } from "@mui/material";
import Link from "next/link";

const Logo = () => {
  const theme = useTheme();

  return (
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
  );
};

export default Logo;
