"use client";

import LoadingSpinner from "@/components/common/LoadingSpinner";
import OrderCard from "@/components/order/OrderCard";
import { useGetOrderQuery } from "@/redux/api/orderApi";
import { Order } from "@/types/order";
import { Container, Grid, Typography } from "@mui/material";

const Orders = () => {
  const { data, isLoading } = useGetOrderQuery({});

  if (isLoading) return <LoadingSpinner />;

  const orders = data?.data || [];

  if (orders.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 6, textAlign: "center" }}>
        <Typography variant="h5" fontWeight={700}>
          You have no orders yet.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 4 }}>
        My Orders
      </Typography>

      <Grid container spacing={4}>
        {orders.map((order: Order) => (
          <Grid item xs={12} key={order.id}>
            <OrderCard order={order} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Orders;
