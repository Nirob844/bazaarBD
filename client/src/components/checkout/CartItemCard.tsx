import { CartItem } from "@/types/cart";
import { Product } from "@/types/product";
import {
  Card,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  useTheme,
} from "@mui/material";

interface CartItemCardProps {
  item: CartItem;
  getDiscountedPrice: (product: Product) => number;
}

export default function CartItemCard({
  item,
  getDiscountedPrice,
}: CartItemCardProps) {
  const theme = useTheme();
  const product = item.product;

  const originalPrice = parseFloat(product.price);
  const discountedPrice = getDiscountedPrice(product);
  const hasDiscount = discountedPrice < originalPrice;

  return (
    <Card sx={{ mb: 2 }}>
      <Grid container spacing={2} sx={{ p: 2 }}>
        <Grid item xs={4}>
          <CardMedia
            component="img"
            height="140"
            image={product.imageUrls[0]?.url}
            alt={product.imageUrls[0]?.altText || "Product Image"}
            sx={{ borderRadius: 2 }}
          />
        </Grid>
        <Grid item xs={8}>
          <CardContent>
            <Typography variant="h6" fontWeight={700}>
              {product.name}
            </Typography>

            <Typography variant="body1" color="text.secondary">
              Quantity: {item.quantity}
            </Typography>

            {hasDiscount ? (
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
                <Typography
                  variant="body1"
                  fontWeight={700}
                  color="success.main"
                >
                  ৳{(discountedPrice * item.quantity).toFixed(2)}{" "}
                  <Typography variant="caption" color="error.main">
                    (-{product.promotions[0].discountPercentage}%)
                  </Typography>
                </Typography>
              </>
            ) : (
              <Typography variant="body1" fontWeight={700}>
                ৳{(originalPrice * item.quantity).toFixed(2)}
              </Typography>
            )}
          </CardContent>
        </Grid>
      </Grid>
    </Card>
  );
}
