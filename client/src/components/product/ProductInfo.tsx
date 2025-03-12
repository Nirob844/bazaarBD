/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useAddCartMutation } from "@/redux/api/cartApi";
import { Promotion } from "@/types/product";
import { getUserInfo } from "@/utils/auth";
import { Add, Remove, ShoppingCart } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Rating,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

interface ProductInfoProps {
  name: string;
  description: string;
  price: string;
  sku: string;
  status: string;
  promotions: Promotion[];
  category: { name: string };
  inventory: { stock: number };
  user: { name: string; email: string };
  averageRating: number;
  reviewsCount: number;
  productId: string;
}

export default function ProductInfo({
  name,
  description,
  price,
  sku,
  status,
  promotions,
  category,
  inventory,
  user,
  averageRating,
  reviewsCount,
  productId,
}: ProductInfoProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState<number>(1);

  const [addCart] = useAddCartMutation();
  const { userId } = getUserInfo() as { userId: string };

  const discountPromo = promotions.find((p) => p.discountPercentage);
  const discountPercentage = discountPromo?.discountPercentage || null;
  const discountedPrice = discountPercentage
    ? (parseFloat(price) * (1 - parseFloat(discountPercentage) / 100)).toFixed(
        2
      )
    : null;

  const handleAddToCart = async () => {
    if (!userId) {
      toast.error("Please log in to add items to your cart.");
      router.push("/login");
      return;
    }

    if (inventory.stock === 0) {
      toast.error("Sorry, this product is out of stock!");
      return;
    }

    try {
      setLoading(true);
      const res = await addCart({
        userId,
        productId,
        quantity,
      });

      if (res?.data) {
        toast.success("Added to cart!");
      } else if (res?.error) {
        toast.error("Failed to add to cart.");
      }
    } catch (error: any) {
      toast.error("Something went wrong. Please try again.");
      console.error("Add to cart error:", error);
    } finally {
      setLoading(false);
    }
  };

  const increaseQuantity = () => {
    if (quantity < inventory.stock) {
      setQuantity(quantity + 1);
    } else {
      toast.error(`Maximum stock limit reached (${inventory.stock})`);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        mx: "auto",
      }}
    >
      {/* Product Name */}
      <Typography variant="h4" fontWeight={700} mb={2} color="text.primary">
        {name}
      </Typography>

      {/* Ratings */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Rating value={averageRating} precision={0.5} readOnly />
        <Typography variant="body2" sx={{ ml: 1 }} color="text.secondary">
          {reviewsCount} review{reviewsCount !== 1 ? "s" : ""}
        </Typography>
      </Box>

      {/* Pricing */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        {discountedPrice ? (
          <>
            <Typography variant="h5" color="primary" fontWeight={800} mr={1}>
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

      {/* SKU & Status */}
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <Chip label={`SKU: ${sku}`} variant="outlined" />
        <Chip
          label={status}
          color={status.toLowerCase() === "active" ? "success" : "warning"}
        />
      </Box>

      {/* Description */}
      <Typography variant="body1" color="text.secondary" mb={3}>
        {description}
      </Typography>

      {/* Category & Stock Info */}
      <Box sx={{ mb: 3 }}>
        <Chip
          label={category.name}
          color="primary"
          variant="outlined"
          sx={{ mr: 1 }}
        />
        <Typography
          variant="body2"
          color={inventory.stock > 0 ? "success.main" : "error.main"}
          fontWeight={500}
          mt={1}
        >
          {inventory.stock > 0
            ? `In Stock (${inventory.stock})`
            : "Out of Stock"}
        </Typography>
      </Box>

      {/* Quantity Control */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 3,
          gap: 2,
        }}
      >
        <Typography variant="body1" fontWeight={600}>
          Quantity:
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            borderRadius: 1,
            border: "1px solid #ccc",
            px: 1,
            py: 0.5,
            backgroundColor: "#f9f9f9",
          }}
        >
          <IconButton
            size="small"
            onClick={decreaseQuantity}
            disabled={quantity <= 1}
          >
            <Remove />
          </IconButton>
          <Typography
            variant="body1"
            fontWeight={600}
            sx={{ mx: 2, minWidth: 32, textAlign: "center" }}
          >
            {quantity}
          </Typography>
          <IconButton
            size="small"
            onClick={increaseQuantity}
            disabled={quantity >= inventory.stock}
          >
            <Add />
          </IconButton>
        </Box>
      </Box>

      {/* Add to Cart Button */}
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
        onClick={handleAddToCart}
        disabled={loading || inventory.stock === 0}
      >
        {inventory.stock === 0
          ? "Out of Stock"
          : loading
          ? "Adding..."
          : `Add ${quantity} to Cart`}
      </Button>

      <Divider sx={{ my: 4 }} />

      {/* Seller Info */}
      <Typography variant="body2" color="text.secondary">
        Sold by:{" "}
        <Typography
          component="span"
          variant="body2"
          fontWeight={600}
          color="text.primary"
        >
          {user.name}
        </Typography>{" "}
        ({user.email})
      </Typography>
    </Box>
  );
}
