"use client";

import { Product } from "@/types/product";
import { ShoppingCart } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Typography,
} from "@mui/material";

export default function ProductCard({ product }: { product: Product }) {
  const hasDiscount = product.promotions.some((p) => p.type === "DISCOUNT");
  const isNew = product.promotions.some((p) => p.type === "NEW_ARRIVAL");
  const mainImage = product.imageUrls[0]?.url || "/placeholder-product.jpg";

  return (
    <Card
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: 2,
        transition: "all 0.3s",
        "&:hover": { transform: "translateY(-5px)", boxShadow: 4 },
      }}
    >
      {hasDiscount && (
        <Chip
          label={`-${
            product.promotions.find((p) => p.type === "DISCOUNT")
              ?.discountPercentage
          }%`}
          color="error"
          sx={{ position: "absolute", top: 16, left: 16, fontWeight: 700 }}
        />
      )}
      {isNew && (
        <Chip
          label="New"
          color="success"
          sx={{ position: "absolute", top: 16, right: 16, fontWeight: 700 }}
        />
      )}

      <CardMedia
        component="img"
        height="240"
        image={mainImage}
        alt={product.imageUrls[0]?.altText || product.name}
        sx={{ objectFit: "cover" }}
      />

      <CardContent>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          {product.name}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Typography
            variant="h6"
            color="primary"
            fontWeight={800}
            sx={{ mr: 1 }}
          >
            ${parseFloat(product.price).toFixed(2)}
          </Typography>
          {hasDiscount && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textDecoration: "line-through" }}
            >
              ${(parseFloat(product.price) * 1.3).toFixed(2)}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Chip label={product.category.name} variant="outlined" />
          <Typography variant="body2" color="text.secondary">
            Stock: {product.inventory.stock}
          </Typography>
        </Box>

        <Button
          variant="contained"
          fullWidth
          startIcon={<ShoppingCart />}
          sx={{
            borderRadius: 2,
            py: 1.5,
            textTransform: "none",
            fontWeight: 700,
          }}
        >
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  );
}
