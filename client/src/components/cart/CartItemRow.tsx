import {
  useDeleteCartMutation,
  useUpdateCartMutation,
} from "@/redux/api/cartApi";
import { CartItem } from "@/types/cart";
import { Add, Delete, Remove } from "@mui/icons-material";
import {
  Box,
  Chip,
  IconButton,
  TableCell,
  TextField,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import toast from "react-hot-toast";

export default function CartItemRow({ item }: { item: CartItem }) {
  const [quantity, setQuantity] = useState(item.quantity);
  const [updateCart, { isLoading: isUpdating }] = useUpdateCartMutation();
  const [deleteCart, { isLoading: isDeleting }] = useDeleteCartMutation();

  const updateQuantity = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      setQuantity(newQuantity);
      const res = await updateCart({ id: item.id, quantity: newQuantity });

      if (res.data) {
        toast.success("Quantity updated!");
      } else {
        toast.error("Failed to update quantity.");
      }
    } catch (error) {
      console.error("Failed to update quantity:", error);
      toast.error("Failed to update quantity");
    }
  };

  const deleteItem = async () => {
    try {
      const res = await deleteCart(item.id);

      if (res.data) {
        toast.success("Item deleted!");
      } else {
        toast.error("Failed to delete item.");
      }
    } catch (error) {
      console.error("Failed to delete item:", error);
      toast.error("Failed to delete item");
    }
  };

  const product = item.product;
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

  const totalPrice = discountedPrice * quantity;

  return (
    <motion.tr
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <TableCell>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: 2,
              overflow: "hidden",
              border: "1px solid #eee",
              transition: "transform 0.3s",
              "&:hover": { transform: "scale(1.05)" },
            }}
          >
            <Image
              src={mainImage}
              alt={product.name}
              width={80}
              height={80}
              style={{ objectFit: "cover" }}
            />
          </Box>
          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              sx={{
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              {product.name}
            </Typography>
            {discountPercentage > 0 && (
              <Chip
                label={`-${discountPercentage}%`}
                color="error"
                size="small"
                sx={{ mt: 1 }}
              />
            )}
          </Box>
        </Box>
      </TableCell>

      <TableCell align="center">
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
          }}
        >
          <IconButton
            size="small"
            onClick={() => updateQuantity(quantity - 1)}
            disabled={quantity <= 1 || isUpdating}
            sx={{ border: "1px solid #ccc", borderRadius: 1 }}
          >
            <Remove />
          </IconButton>

          <TextField
            value={quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val)) updateQuantity(val);
            }}
            size="small"
            sx={{
              width: 60,
              "& input": { textAlign: "center", fontWeight: 600 },
            }}
            inputProps={{ min: 1 }}
            disabled={isUpdating}
          />

          <IconButton
            size="small"
            onClick={() => updateQuantity(quantity + 1)}
            disabled={isUpdating}
            sx={{ border: "1px solid #ccc", borderRadius: 1 }}
          >
            <Add />
          </IconButton>
        </Box>
      </TableCell>

      <TableCell align="right">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
          }}
        >
          <Typography variant="body1" fontWeight={700} color="primary">
            ${discountedPrice.toFixed(2)}
          </Typography>
          {discountPercentage > 0 && (
            <Typography
              variant="caption"
              sx={{ textDecoration: "line-through", color: "text.secondary" }}
            >
              ${originalPrice.toFixed(2)}
            </Typography>
          )}
        </Box>
      </TableCell>

      <TableCell align="right">
        <Typography variant="body1" fontWeight={700}>
          ${totalPrice.toFixed(2)}
        </Typography>
      </TableCell>

      <TableCell align="right">
        <IconButton
          onClick={deleteItem}
          disabled={isDeleting}
          sx={{
            color: "error.main",
            transition: "transform 0.3s",
            "&:hover": { transform: "scale(1.2)" },
          }}
        >
          <Delete />
        </IconButton>
      </TableCell>
    </motion.tr>
  );
}
