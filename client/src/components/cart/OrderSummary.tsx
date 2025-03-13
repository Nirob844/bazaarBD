import { CartItem } from "@/types/cart";
import { Box, Button, Paper, Typography, useTheme } from "@mui/material";
import Link from "next/link";

export default function OrderSummary({ cartItems }: { cartItems: CartItem[] }) {
  const theme = useTheme();

  const calculateDiscountedPrice = (item: CartItem) => {
    const product = item.product;

    const discountPromotion = product.promotions.find(
      (promotion) => promotion.discountPercentage
    );

    const discountPercentage = discountPromotion
      ? parseFloat(discountPromotion.discountPercentage)
      : 0;

    const originalPrice = parseFloat(product.price);

    // Calculate discounted price
    const discountedPrice =
      discountPercentage > 0
        ? originalPrice * (1 - discountPercentage / 100)
        : originalPrice;

    return discountedPrice;
  };

  const subtotal = cartItems.reduce((acc, item) => {
    const discountedPrice = calculateDiscountedPrice(item);
    return acc + discountedPrice * item.quantity;
  }, 0);

  const shipping = subtotal >= 200 ? 0 : 15.0; // Free shipping over $200
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
        {subtotal >= 200
          ? "You got free shipping!"
          : "Free shipping on orders over $200"}
      </Typography>
    </Paper>
  );
}
