import { CartItem } from "@/types/cart";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
} from "@mui/material";
import CartItemRow from "./CartItemRow";

export default function CartTable({ cartItems }: { cartItems: CartItem[] }) {
  const theme = useTheme();

  return (
    <TableContainer component={Paper} sx={{ boxShadow: theme.shadows[2] }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Product</TableCell>
            <TableCell align="center">Quantity</TableCell>
            <TableCell align="right">Price</TableCell>
            <TableCell align="right">Total</TableCell>
            <TableCell align="right">Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {cartItems.map((item) => (
            <CartItemRow key={item.id} item={item} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
