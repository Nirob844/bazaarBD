import { ShoppingCart } from "@mui/icons-material";
import { Button, Card, Typography } from "@mui/material";

interface OrderSummaryProps {
  totalPrice: number;
  isPlacingOrder: boolean;
  handlePlaceOrder: () => void;
  error?: string | null;
}

export default function OrderSummary({
  totalPrice,
  isPlacingOrder,
  handlePlaceOrder,
  error,
}: OrderSummaryProps) {
  return (
    <>
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
        onClick={handlePlaceOrder}
        disabled={isPlacingOrder}
      >
        {isPlacingOrder ? "Placing Order..." : "Place Order"}
      </Button>

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
    </>
  );
}
