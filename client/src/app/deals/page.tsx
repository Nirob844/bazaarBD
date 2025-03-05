/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ShoppingCart } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Container,
  Grid,
  Typography,
  useTheme,
} from "@mui/material";
import Countdown from "react-countdown";

const deals = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: 99.99,
    originalPrice: 149.99,
    discount: 33,
    image: "https://source.unsplash.com/random/400x300?headphones",
    endDate: "2024-12-31T23:59:59",
  },
  {
    id: 2,
    name: "Smart Watch",
    price: 149.99,
    originalPrice: 199.99,
    discount: 25,
    image: "https://source.unsplash.com/random/400x300?smartwatch",
    endDate: "2024-12-31T23:59:59",
  },
  {
    id: 3,
    name: "Gaming Laptop",
    price: 1299.99,
    originalPrice: 1599.99,
    discount: 19,
    image: "https://source.unsplash.com/random/400x300?laptop",
    endDate: "2024-12-31T23:59:59",
  },
  {
    id: 4,
    name: "Wireless Earbuds",
    price: 79.99,
    originalPrice: 99.99,
    discount: 20,
    image: "https://source.unsplash.com/random/400x300?earbuds",
    endDate: "2024-12-31T23:59:59",
  },
];

export default function Deals() {
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
              backgroundColor: theme.palette.error.main,
              color: theme.palette.common.white,
              px: 2,
              py: 1,
              borderRadius: 1,
              fontWeight: 700,
            }}
          >
            {days}d
          </Box>
          <Box
            sx={{
              backgroundColor: theme.palette.error.main,
              color: theme.palette.common.white,
              px: 2,
              py: 1,
              borderRadius: 1,
              fontWeight: 700,
            }}
          >
            {hours}h
          </Box>
          <Box
            sx={{
              backgroundColor: theme.palette.error.main,
              color: theme.palette.common.white,
              px: 2,
              py: 1,
              borderRadius: 1,
              fontWeight: 700,
            }}
          >
            {minutes}m
          </Box>
          <Box
            sx={{
              backgroundColor: theme.palette.error.main,
              color: theme.palette.common.white,
              px: 2,
              py: 1,
              borderRadius: 1,
              fontWeight: 700,
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
        backgroundColor: theme.palette.background.default,
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
          Limited-Time Deals
        </Typography>
        <Grid container spacing={4}>
          {deals.map((deal) => (
            <Grid key={deal.id} item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
                  boxShadow: theme.shadows[2],
                  transition: "all 0.3s",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: theme.shadows[6],
                  },
                }}
              >
                <Box sx={{ position: "relative" }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={deal.image}
                    alt={deal.name}
                    sx={{ objectFit: "cover" }}
                  />
                  <Chip
                    label={`${deal.discount}% Off`}
                    color="error"
                    sx={{
                      position: "absolute",
                      top: 16,
                      left: 16,
                      fontWeight: 700,
                    }}
                  />
                </Box>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    {deal.name}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Typography
                      variant="h6"
                      color="primary"
                      fontWeight={800}
                      sx={{ mr: 1 }}
                    >
                      ৳{deal.price}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ textDecoration: "line-through" }}
                    >
                      ৳{deal.originalPrice}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Countdown date={deal.endDate} renderer={renderCountdown} />
                  </Box>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<ShoppingCart />}
                    sx={{
                      borderRadius: 2,
                      py: 1.5,
                      textTransform: "none",
                      fontWeight: 700,
                    }}
                  >
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
