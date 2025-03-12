"use client";

import CartTable from "@/components/cart/CartTable";
import OrderSummary from "@/components/cart/OrderSummary";
import { authKey } from "@/constants/storage";
import { getUserInfo } from "@/utils/auth";
import { getFromLocalStorage } from "@/utils/local-storage";
import { CircularProgress, Container, Grid, Typography } from "@mui/material";
import { useEffect, useState } from "react";

export default function CartPage() {
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);

  const { userId } = getUserInfo() as { userId: string };
  const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/cart/${userId}`;

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const accessToken = getFromLocalStorage(authKey);
        if (!accessToken) {
          console.error("Access token not found!");
          return;
        }

        const res = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: accessToken,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch cart");
        }

        const data = await res.json();
        setCartData(data.data);
      } catch (error) {
        console.error("Failed to fetch cart:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [apiUrl]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  const { items } = cartData || { items: [] };

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
}
