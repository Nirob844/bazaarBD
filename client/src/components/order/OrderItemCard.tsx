import { OrderItem } from "@/types/order";
import { CardMedia, Grid, ListItem, Typography, useTheme } from "@mui/material";

interface OrderItemCardProps {
  item: OrderItem;
}

export default function OrderItemCard({ item }: OrderItemCardProps) {
  const theme = useTheme();
  const product = item.product;

  const originalPrice = parseFloat(product.price);
  const discount = parseFloat(
    product.promotions?.[0]?.discountPercentage || "0"
  );
  const discountedPrice = originalPrice - (originalPrice * discount) / 100;

  return (
    <ListItem disableGutters sx={{ mb: 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={3} sm={2}>
          <CardMedia
            component="img"
            height="100"
            image={product?.imageUrls?.[0]?.url || "/placeholder.png"}
            alt={product?.imageUrls?.[0]?.altText || product.name}
            sx={{ borderRadius: 2 }}
          />
        </Grid>

        <Grid item xs={9} sm={4}>
          <Typography variant="body1" fontWeight={700}>
            {product.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Quantity: {item.quantity}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6} textAlign="right">
          {discount > 0 ? (
            <>
              <Typography
                variant="body2"
                sx={{
                  textDecoration: "line-through",
                  color: theme.palette.grey[600],
                }}
              >
                ৳{(originalPrice * item.quantity).toFixed(2)}
              </Typography>
              <Typography variant="body1" fontWeight={700} color="success.main">
                ৳{(discountedPrice * item.quantity).toFixed(2)}{" "}
                <Typography
                  variant="caption"
                  color="error.main"
                  component="span"
                >
                  (-{discount}%)
                </Typography>
              </Typography>
            </>
          ) : (
            <Typography variant="body1" fontWeight={700}>
              ৳{(originalPrice * item.quantity).toFixed(2)}
            </Typography>
          )}
        </Grid>
      </Grid>
    </ListItem>
  );
}
