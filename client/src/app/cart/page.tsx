"use client";

import { Add, Delete, Remove } from "@mui/icons-material";
import {
  Box,
  Button,
  Container,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";

const cartItems = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: 99.99,
    image: "/images/products/headphones.jpg",
    quantity: 2,
  },
  {
    id: 2,
    name: "Smart Watch",
    price: 149.99,
    image: "/images/products/smart-watch.jpg",
    quantity: 1,
  },
  {
    id: 3,
    name: "Gaming Laptop",
    price: 1299.99,
    image: "/images/products/gaming-laptop.jpg",
    quantity: 1,
  },
];

export default function Cart() {
  const theme = useTheme();

  // Calculate total cost
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const shipping = 15.0; // Fixed shipping cost
  const total = subtotal + shipping;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 4 }}>
        Your Shopping Cart
      </Typography>

      <Grid container spacing={4}>
        {/* Cart Items Table */}
        <Grid item xs={12} md={8}>
          <TableContainer
            component={Paper}
            sx={{ boxShadow: theme.shadows[2] }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="center">Quantity</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cartItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={80}
                          height={80}
                          style={{ borderRadius: 8, objectFit: "cover" }}
                        />
                        <Typography variant="body1" fontWeight={600}>
                          {item.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 1,
                        }}
                      >
                        <IconButton size="small">
                          <Remove />
                        </IconButton>
                        <TextField
                          value={item.quantity}
                          size="small"
                          sx={{ width: 60 }}
                          inputProps={{ style: { textAlign: "center" } }}
                        />
                        <IconButton size="small">
                          <Add />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" fontWeight={600}>
                        ${item.price.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" fontWeight={600}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton>
                        <Delete color="error" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, boxShadow: theme.shadows[2] }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Order Summary
            </Typography>

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography variant="body1">Subtotal</Typography>
              <Typography variant="body1" fontWeight={600}>
                ${subtotal.toFixed(2)}
              </Typography>
            </Box>

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Typography variant="body1">Shipping</Typography>
              <Typography variant="body1" fontWeight={600}>
                ${shipping.toFixed(2)}
              </Typography>
            </Box>

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}
            >
              <Typography variant="body1" fontWeight={700}>
                Total
              </Typography>
              <Typography variant="body1" fontWeight={700}>
                ${total.toFixed(2)}
              </Typography>
            </Box>

            <Button
              variant="contained"
              fullWidth
              sx={{
                py: 1.5,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 700,
              }}
              component={Link}
              href="/checkout"
            >
              Proceed to Checkout
            </Button>

            <Typography
              variant="body2"
              sx={{ mt: 2, textAlign: "center", color: "text.secondary" }}
            >
              Free shipping on orders over $200
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
