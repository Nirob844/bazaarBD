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
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ProductCard({ product }: { product: Product }) {
  const mainImage = product.imageUrls[0]?.url || "/placeholder-product.jpg";

  const discountPromotion = product.promotions.find(
    (p) => p.discountPercentage
  );

  const discountPercentage = discountPromotion
    ? parseFloat(discountPromotion.discountPercentage)
    : 0;

  const originalPrice = parseFloat(product.price);
  const discountedPrice =
    discountPercentage > 0
      ? originalPrice * (1 - discountPercentage / 100)
      : originalPrice;

  const getPromoColor = (type: string) => {
    switch (type) {
      case "NEW_ARRIVAL":
        return "success";
      case "FLASH_SALE":
        return "warning";
      case "BEST_DEAL":
        return "info";
      case "TOP_SELLING":
        return "secondary";
      case "FEATURED":
        return "primary";
      default:
        return "default";
    }
  };

  return (
    <motion.div whileHover={{ scale: 1.02 }}>
      <Card
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: 3,
          transition: "all 0.3s",
          position: "relative",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Promotion Chips */}
        <Box sx={{ position: "absolute", top: 16, left: 16, zIndex: 2 }}>
          {discountPercentage > 0 && (
            <Chip
              label={`-${discountPercentage}%`}
              color="error"
              sx={{ fontWeight: 700 }}
            />
          )}
        </Box>

        <Box sx={{ position: "absolute", top: 16, right: 16, zIndex: 2 }}>
          <Stack spacing={1}>
            {product.promotions.map((promo) => (
              <Chip
                key={promo.type}
                label={promo.type.replace(/_/g, " ")}
                color={getPromoColor(promo.type)}
                size="small"
                sx={{
                  fontWeight: 700,
                  textTransform: "capitalize",
                }}
              />
            ))}
          </Stack>
        </Box>

        {/* Link with NO underline and NO text decoration */}
        <Link href={`/shop/${product.id}`} passHref legacyBehavior>
          <Box
            component="a"
            sx={{
              color: "inherit",
              textDecoration: "none", // No underline
              "&:hover": {
                textDecoration: "none", // Ensure no underline on hover
              },
            }}
          >
            {/* Product Image */}
            <CardMedia
              component="img"
              height="240"
              image={mainImage}
              alt={product.imageUrls[0]?.altText || product.name}
              sx={{ objectFit: "cover" }}
            />

            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                pb: 1,
              }}
            >
              {/* Product Name - no underline */}
              <Tooltip title={product.name} arrow>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  noWrap
                  sx={{
                    color: "text.primary",
                    textDecoration: "none", // No underline
                  }}
                >
                  {product.name}
                </Typography>
              </Tooltip>

              {/* Prices - no underline */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  variant="h6"
                  color={discountPercentage > 0 ? "error" : "primary"}
                  fontWeight={800}
                  sx={{
                    textDecoration: "none", // No underline
                  }}
                >
                  ${discountedPrice.toFixed(2)}
                </Typography>

                {discountPercentage > 0 && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      textDecoration: "line-through",
                      fontWeight: 500,
                    }}
                  >
                    ${originalPrice.toFixed(2)}
                  </Typography>
                )}
              </Box>

              {/* Category & Stock - no underline */}
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Chip
                  label={product.category.name}
                  size="small"
                  variant="outlined"
                  sx={{
                    textDecoration: "none", // No underline
                  }}
                />
                <Typography
                  variant="caption"
                  color={
                    product.inventory.stock > 0 ? "success.main" : "error.main"
                  }
                  fontWeight={600}
                  sx={{
                    textDecoration: "none", // No underline
                  }}
                >
                  {product.inventory.stock > 0
                    ? `In Stock: ${product.inventory.stock}`
                    : "Out of Stock"}
                </Typography>
              </Box>
            </CardContent>
          </Box>
        </Link>

        {/* Add to Cart Button */}
        <Box sx={{ p: 2, pt: 0 }}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<ShoppingCart />}
            sx={{
              borderRadius: 2,
              py: 1.5,
              textTransform: "none",
              fontWeight: 700,
              backgroundColor: "primary.main",
              "&:hover": {
                backgroundColor: "primary.dark",
              },
            }}
            disabled={product.inventory.stock === 0}
          >
            {product.inventory.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </Button>
        </Box>
      </Card>
    </motion.div>
  );
}
