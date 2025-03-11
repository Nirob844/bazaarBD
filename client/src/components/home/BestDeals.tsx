/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ShoppingCart } from "@mui/icons-material";
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  Grid,
  IconButton,
  Typography,
  useTheme,
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import Countdown from "react-countdown";

const bestDeals = [
  {
    id: 1,
    name: "Wireless Headphones",
    originalPrice: 129.99,
    salePrice: 99.99,
    image: "/images/products/headphones.jpg",
    link: "/products/wireless-headphones",
    endDate: "2024-12-31T23:59:59", // Countdown end date
  },
  {
    id: 2,
    name: "Smart Watch",
    originalPrice: 199.99,
    salePrice: 149.99,
    image: "/images/products/smart-watch.jpg",
    link: "/products/smart-watch",
    endDate: "2024-12-31T23:59:59",
  },
  {
    id: 3,
    name: "Gaming Laptop",
    originalPrice: 1499.99,
    salePrice: 1299.99,
    image: "/images/products/gaming-laptop.jpg",
    link: "/products/gaming-laptop",
    endDate: "2024-12-31T23:59:59",
  },
  {
    id: 4,
    name: "Wireless Earbuds",
    originalPrice: 99.99,
    salePrice: 79.99,
    image: "/images/products/earbuds.jpg",
    link: "/products/wireless-earbuds",
    endDate: "2024-12-31T23:59:59",
  },
];

export default function BestDeals() {
  const theme = useTheme();

  // Countdown renderer
  const renderCountdown = ({
    days,
    hours,
    minutes,
    seconds,
    completed,
  }: any) => {
    if (completed) {
      return <Typography variant="body2">Deal Ended</Typography>;
    } else {
      return (
        <Box
          sx={{
            display: "flex",
            gap: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.common.white,
              px: 2,
              py: 1,
              borderRadius: 1,
            }}
          >
            {days}d
          </Box>
          <Box
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.common.white,
              px: 2,
              py: 1,
              borderRadius: 1,
            }}
          >
            {hours}h
          </Box>
          <Box
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.common.white,
              px: 2,
              py: 1,
              borderRadius: 1,
            }}
          >
            {minutes}m
          </Box>
          <Box
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.common.white,
              px: 2,
              py: 1,
              borderRadius: 1,
            }}
          >
            {seconds}s
          </Box>
        </Box>
      );
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.paper,
        py: 8,
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          component="h2"
          sx={{
            fontWeight: 800,
            color: theme.palette.text.primary,
            mb: 4,
            textAlign: "center",
          }}
        >
          Best Deals
        </Typography>
        <Grid container spacing={4}>
          {bestDeals.map((deal) => (
            <Grid item xs={12} sm={6} md={3} key={deal.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 2,
                  boxShadow: theme.shadows[2],
                  transition: "transform 0.3s, box-shadow 0.3s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: theme.shadows[6],
                  },
                }}
              >
                <CardMedia
                  sx={{
                    position: "relative",
                    height: 200,
                  }}
                >
                  <Image
                    src={deal.image}
                    alt={deal.name}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </CardMedia>
                <CardContent
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography
                      variant="h6"
                      component="h3"
                      sx={{
                        fontWeight: 700,
                        color: theme.palette.text.primary,
                        mb: 1,
                      }}
                    >
                      {deal.name}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                      <Typography
                        variant="body1"
                        sx={{
                          color: theme.palette.error.main,
                          fontWeight: 600,
                        }}
                      >
                        ${deal.salePrice.toFixed(2)}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: theme.palette.text.secondary,
                          textDecoration: "line-through",
                        }}
                      >
                        ${deal.originalPrice.toFixed(2)}
                      </Typography>
                    </Box>
                    <Countdown date={deal.endDate} renderer={renderCountdown} />
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mt: 2,
                    }}
                  >
                    <Button
                      component={Link}
                      href={deal.link}
                      variant="contained"
                      size="small"
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        px: 3,
                        py: 1,
                        flexGrow: 1,
                      }}
                    >
                      Shop Now
                    </Button>

                    <IconButton
                      aria-label="add to cart"
                      sx={{
                        color: theme.palette.primary.main,
                        "&:hover": {
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.1
                          ),
                        },
                      }}
                    >
                      <ShoppingCart />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
