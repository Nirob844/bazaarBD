import { CartItem } from "@/types/cart";
import { Box, Button, Paper, Typography, useTheme } from "@mui/material";
import Link from "next/link";

export default function OrderSummary({ cartItems }: { cartItems: CartItem[] }) {
  const theme = useTheme();

  const subtotal = cartItems.reduce(
    (acc, item) => acc + Number(item.product.price) * item.quantity,
    0
  );
  const shipping = 15.0;
  const total = subtotal + shipping;

  return (
    <Paper sx={{ p: 3, boxShadow: theme.shadows[2] }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        Order Summary
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
        <Typography variant="body1">Subtotal</Typography>
        <Typography variant="body1" fontWeight={600}>
          ${subtotal.toFixed(2)}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="body1">Shipping</Typography>
        <Typography variant="body1" fontWeight={600}>
          ${shipping.toFixed(2)}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
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
  );
}
