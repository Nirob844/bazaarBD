"use client";

import { Promotion } from "@/types/product";
import { ShoppingCart } from "@mui/icons-material";
import { Box, Button, Chip, Divider, Rating, Typography } from "@mui/material";

interface ProductInfoProps {
  name: string;
  description: string;
  price: string;
  promotions: Promotion[];
  category: { name: string };
  inventory: { stock: number };
  user: { name: string; email: string };
  averageRating: number;
  reviewsCount: number;
}

export default function ProductInfo({
  name,
  description,
  price,
  promotions,
  category,
  inventory,
  user,
  averageRating,
  reviewsCount,
}: ProductInfoProps) {
  const discountPromo = promotions.find((p) => p.discountPercentage);
  const discountPercentage = discountPromo?.discountPercentage || null;
  const discountedPrice = discountPercentage
    ? (parseFloat(price) * (1 - parseFloat(discountPercentage) / 100)).toFixed(
        2
      )
    : null;

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        {name}
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Rating value={averageRating} precision={0.5} readOnly />
        <Typography variant="body2" sx={{ ml: 1 }}>
          ({reviewsCount} review{reviewsCount !== 1 ? "s" : ""})
        </Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        {discountedPrice ? (
          <>
            <Typography
              variant="h5"
              color="primary"
              fontWeight={800}
              sx={{ mr: 1 }}
            >
              ${discountedPrice}
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ textDecoration: "line-through" }}
            >
              ${parseFloat(price).toFixed(2)}
            </Typography>
            <Chip
              label={`-${discountPercentage}%`}
              color="error"
              size="small"
              sx={{ ml: 1, fontWeight: 700 }}
            />
          </>
        ) : (
          <Typography variant="h5" color="primary" fontWeight={800}>
            ${parseFloat(price).toFixed(2)}
          </Typography>
        )}
      </Box>

      <Typography variant="body1" sx={{ mb: 3 }}>
        {description}
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eaque eos
        inventore quae corporis error placeat dolores aspernatur nisi
        consectetur vero unde eveniet dolore blanditiis necessitatibus dolorem
        adipisci architecto, ullam sit facilis reprehenderit voluptatum vitae,
        ducimus voluptates! Blanditiis eum, tempore dolores vel voluptates
        libero omnis minus hic adipisci similique ex praesentium quae.
        Repellendus error rerum culpa, quo saepe nisi omnis numquam animi nihil
        nam, similique et possimus deleniti? Omnis iure animi pariatur incidunt
        officiis consequatur voluptas deserunt, earum porro asperiores aliquam
        error minima architecto temporibus, expedita ex cupiditate provident,
        similique at perferendis corporis. Provident, totam illum? Ipsum, a! Ex,
        eligendi vel.
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Chip label={category.name} variant="outlined" />
        <Typography
          variant="body2"
          color={inventory.stock > 0 ? "success.main" : "error"}
        >
          {inventory.stock > 0
            ? `In Stock (${inventory.stock})`
            : "Out of Stock"}
        </Typography>
      </Box>

      <Button
        variant="contained"
        size="large"
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

      <Divider sx={{ my: 4 }} />

      <Typography variant="body2" color="text.secondary">
        Sold by: <strong>{user.name}</strong> ({user.email})
      </Typography>
    </Box>
  );
}
