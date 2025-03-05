/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ShoppingCart } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  Grid,
  List,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

const cartItems = [
  {
    id: 1,
    name: "Premium Product 1",
    price: "120.00",
    image: "https://source.unsplash.com/random/400x300",
    quantity: 2,
  },
  {
    id: 2,
    name: "Premium Product 2",
    price: "80.00",
    image: "https://source.unsplash.com/random/400x300",
    quantity: 1,
  },
];

export default function Checkout() {
  //const theme = useTheme();
  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const totalPrice = cartItems.reduce(
    (total, item) => total + parseFloat(item.price) * item.quantity,
    0
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 4 }}>
        Checkout
      </Typography>

      <Grid container spacing={4}>
        {/* Cart Items */}
        <Grid item xs={12} md={8}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            Your Cart
          </Typography>
          <List>
            {cartItems.map((item) => (
              <Card key={item.id} sx={{ mb: 2 }}>
                <Grid container spacing={2} sx={{ p: 2 }}>
                  <Grid item xs={4}>
                    <CardMedia
                      component="img"
                      height="140"
                      image={item.image}
                      alt={item.name}
                      sx={{ borderRadius: 2 }}
                    />
                  </Grid>
                  <Grid item xs={8}>
                    <CardContent>
                      <Typography variant="h6" fontWeight={700}>
                        {item.name}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        ৳{item.price} x {item.quantity}
                      </Typography>
                      <Typography variant="body1" fontWeight={700}>
                        ৳{(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </Typography>
                    </CardContent>
                  </Grid>
                </Grid>
              </Card>
            ))}
          </List>
        </Grid>

        {/* Shipping and Payment Info */}
        <Grid item xs={12} md={4}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            Shipping Information
          </Typography>
          <Box component="form" sx={{ mb: 4 }}>
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={shippingInfo.name}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Address"
              name="address"
              value={shippingInfo.address}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="City"
              name="city"
              value={shippingInfo.city}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="State"
              name="state"
              value={shippingInfo.state}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="ZIP Code"
              name="zip"
              value={shippingInfo.zip}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
          </Box>

          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            Order Summary
          </Typography>
          <Card sx={{ p: 2, mb: 4 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Subtotal: ৳{totalPrice.toFixed(2)}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Shipping: ৳0.00
            </Typography>
            <Typography variant="h6" fontWeight={700}>
              Total: ৳{totalPrice.toFixed(2)}
            </Typography>
          </Card>

          <Button
            variant="contained"
            fullWidth
            size="large"
            startIcon={<ShoppingCart />}
            sx={{ py: 1.5, fontWeight: 700 }}
          >
            Place Order
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
}
