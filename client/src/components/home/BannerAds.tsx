"use client";

import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import Link from "next/link";

const bannerAds = [
  {
    id: 1,
    title: "Summer Sale!",
    subtitle: "Up to 50% Off",
    description: "Don't miss out on our biggest sale of the season. Shop now!",
    image: "/images/banners/summer-sale.jpg",
    link: "/summer-sale",
    buttonText: "Shop Now",
  },
  {
    id: 2,
    title: "New Arrivals",
    subtitle: "Explore the Latest Trends",
    description: "Discover our newest collection. Be the first to shop!",
    image: "/images/banners/new-arrivals.jpg",
    link: "/new-arrivals",
    buttonText: "Explore",
  },
];

export default function BannerAds() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        py: 8,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {bannerAds.map((banner) => (
            <Grid item xs={12} md={6} key={banner.id}>
              <Box
                sx={{
                  position: "relative",
                  height: 300,
                  borderRadius: 4,
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  color: theme.palette.common.white,
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    zIndex: 1,
                    backgroundColor: alpha(theme.palette.common.black, 0.5),
                    p: 4,
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="h4"
                    component="h3"
                    sx={{
                      fontWeight: 800,
                      mb: 1,
                    }}
                  >
                    {banner.title}
                  </Typography>
                  <Typography
                    variant="h6"
                    component="p"
                    sx={{
                      fontWeight: 600,
                      mb: 2,
                    }}
                  >
                    {banner.subtitle}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      mb: 3,
                    }}
                  >
                    {banner.description}
                  </Typography>
                  <Button
                    component={Link}
                    href={banner.link}
                    variant="contained"
                    size="large"
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      px: 4,
                      py: 1.5,
                    }}
                  >
                    {banner.buttonText}
                  </Button>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
