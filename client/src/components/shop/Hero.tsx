"use client";
import { Box, Typography, useTheme } from "@mui/material";

export default function Hero() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        height: 300,
        background: theme.palette.primary.main,
        borderRadius: 3,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: theme.palette.primary.contrastText,
        textAlign: "center",
        flexDirection: "column",
        px: 3,
        mb: 4,
        boxShadow: 4,
      }}
    >
      <Typography variant="h2" fontWeight={800} sx={{ mb: 1 }}>
        Elevate Your Shopping Experience
      </Typography>
      <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: 600 }}>
        Discover curated collections of premium products with exclusive member
        benefits.
      </Typography>
    </Box>
  );
}
