"use client";

import CartTable from "@/components/cart/CartTable";
import OrderSummary from "@/components/cart/OrderSummary";
import { useGetCartQuery } from "@/redux/api/cartApi";
import { getUserInfo } from "@/utils/auth";
import { CircularProgress, Container, Grid, Typography } from "@mui/material";

const Cart = () => {
  const { userId } = getUserInfo() as { userId: string };

  const { data: cart, isLoading } = useGetCartQuery(userId);

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  const { items } = cart.data || { items: [] };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 4 }}>
        Your Shopping Cart
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <CartTable cartItems={items || []} />
        </Grid>

        <Grid item xs={12} md={4}>
          <OrderSummary cartItems={items || []} />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Cart;
