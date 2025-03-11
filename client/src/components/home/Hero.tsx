"use client";

import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  useTheme,
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import image from "../../../public/images/hero.png";

export default function Hero() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.default,
        py: 10,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          {/* Left Column: Text Content */}
          <Grid item xs={12} md={6}>
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontWeight: 800,
                color: theme.palette.text.primary,
                mb: 3,
                lineHeight: 1.2,
              }}
            >
              Welcome to{" "}
              <Box component="span" sx={{ color: theme.palette.primary.main }}>
                BazaarBD
              </Box>
            </Typography>
            <Typography
              variant="h5"
              component="p"
              sx={{
                color: theme.palette.text.secondary,
                mb: 4,
                fontWeight: 400,
              }}
            >
              Discover the best deals on premium products. Shop smart, save big,
              and enjoy a seamless shopping experience with BazaarBD.
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                component={Link}
                href="/shop"
                variant="contained"
                size="large"
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                }}
              >
                Shop Now
              </Button>
              <Button
                component={Link}
                href="/deals"
                variant="outlined"
                size="large"
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  borderWidth: 2,
                  "&:hover": { borderWidth: 2 },
                }}
              >
                View Deals
              </Button>
            </Box>
          </Grid>

          {/* Right Column: Image */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                position: "relative",
                width: "100%",
                height: { xs: 300, md: 400 },
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <Image
                src={image} // Replace with your image path
                alt="BazaarBD Hero Image"
                fill
                style={{ objectFit: "cover" }}
                priority
              />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
