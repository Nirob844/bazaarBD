import { authKey } from "@/constants/storage";
import { CartItem } from "@/types/cart";
import { getFromLocalStorage } from "@/utils/local-storage";
import { Add, Delete, Remove } from "@mui/icons-material";
import {
  Box,
  IconButton,
  TableCell,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import Image from "next/image";
import { useState } from "react";
import toast from "react-hot-toast";

export default function CartItemRow({ item }: { item: CartItem }) {
  const [quantity, setQuantity] = useState(item.quantity);
  const accessToken = getFromLocalStorage(authKey);

  const updateQuantity = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    setQuantity(newQuantity);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/cart/item/${item.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: accessToken } : {}),
          },
          body: JSON.stringify({ quantity: newQuantity }),
        }
      );

      if (!res.ok) throw new Error("Failed to update quantity");

      toast.success("Quantity updated!");
    } catch (error) {
      console.error("Failed to update quantity:", error);
      toast.error("Failed to update quantity");
    }
  };

  const deleteItem = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/cart/item/${item.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: accessToken } : {}),
          },
        }
      );

      if (!res.ok) throw new Error("Failed to delete item");

      toast.success("Item deleted!");
    } catch (error) {
      console.error("Failed to delete item:", error);
      toast.error("Failed to delete item");
    }
  };

  const product = item.product;
  const totalPrice = Number(product.price) * quantity;
  const mainImage =
    item.product.imageUrls[0]?.url || "/placeholder-product.jpg";

  return (
    <TableRow>
      <TableCell>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Image
            src={mainImage}
            alt={product.name}
            width={80}
            height={80}
            style={{ borderRadius: 8, objectFit: "cover" }}
          />
          <Typography variant="body1" fontWeight={600}>
            {product.name}
          </Typography>
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
          <IconButton size="small" onClick={() => updateQuantity(quantity - 1)}>
            <Remove />
          </IconButton>

          <TextField
            value={quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val)) updateQuantity(val);
            }}
            size="small"
            sx={{ width: 60 }}
            inputProps={{ style: { textAlign: "center" }, min: 1 }}
          />

          <IconButton size="small" onClick={() => updateQuantity(quantity + 1)}>
            <Add />
          </IconButton>
        </Box>
      </TableCell>

      <TableCell align="right">
        <Typography variant="body1" fontWeight={600}>
          ${Number(product.price).toFixed(2)}
        </Typography>
      </TableCell>

      <TableCell align="right">
        <Typography variant="body1" fontWeight={600}>
          ${totalPrice.toFixed(2)}
        </Typography>
      </TableCell>

      <TableCell align="right">
        <IconButton onClick={deleteItem}>
          <Delete color="error" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}
