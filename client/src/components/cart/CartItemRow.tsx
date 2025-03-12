import {
  useDeleteCartMutation,
  useUpdateCartMutation,
} from "@/redux/api/cartApi";
import { CartItem } from "@/types/cart";
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
  const [updateCart] = useUpdateCartMutation();
  const [deleteCart] = useDeleteCartMutation();
  const updateQuantity = async (newQuantity: number) => {
    try {
      if (newQuantity < 1) return;
      console.log(newQuantity);
      setQuantity(newQuantity);
      const res = await updateCart({ id: item.id, quantity: newQuantity });
      if (res.data) {
        toast.success("Quantity updated!");
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
      }
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
