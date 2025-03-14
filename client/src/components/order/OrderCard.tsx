import { Order, OrderItem } from "@/types/order";
import { Box, Card, Chip, Divider, List, Typography } from "@mui/material";
import { format } from "date-fns";
import OrderItemCard from "./OrderItemCard";

interface OrderCardProps {
  order: Order;
}

export default function OrderCard({ order }: OrderCardProps) {
  const statusColor =
    order.status === "PENDING"
      ? "warning"
      : order.status === "DELIVERED"
      ? "success"
      : "error";

  return (
    <Card sx={{ p: 3, borderRadius: 3, boxShadow: 4 }}>
      {/* Order Info */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        flexDirection={{ xs: "column", sm: "row" }}
        mb={2}
      >
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            Order ID
          </Typography>
          <Typography variant="body1" fontWeight={700}>
            {order.id}
          </Typography>
        </Box>

        <Chip
          label={order.status}
          color={statusColor}
          sx={{ fontWeight: 700, mt: { xs: 2, sm: 0 } }}
        />

        <Box textAlign={{ xs: "left", sm: "right" }}>
          <Typography variant="subtitle2" color="text.secondary">
            Date
          </Typography>
          <Typography variant="body1" fontWeight={700}>
            {format(new Date(order.createdAt), "dd MMM yyyy, hh:mm a")}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Ordered Items */}
      <List>
        {order.items.map((item: OrderItem) => (
          <OrderItemCard key={item.id} item={item} />
        ))}
      </List>

      <Divider sx={{ my: 2 }} />

      {/* Order Summary */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
      >
        <Typography variant="subtitle1" fontWeight={700}>
          Total Paid:
        </Typography>
        <Typography variant="h6" color="primary" fontWeight={800}>
          ৳{parseFloat(order.total).toFixed(2)}
        </Typography>
      </Box>
    </Card>
  );
}
