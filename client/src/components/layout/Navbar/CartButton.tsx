/* eslint-disable @typescript-eslint/no-explicit-any */
import { ShoppingCart } from "@mui/icons-material";
import { Badge, IconButton, alpha, useTheme } from "@mui/material";
import Link from "next/link";

const CartButton = ({ cart }: { cart: any }) => {
  const theme = useTheme();

  return (
    <IconButton
      component={Link}
      href="/cart"
      sx={{
        color: theme.palette.common.white,
        "&:hover": {
          backgroundColor: alpha(theme.palette.common.white, 0.1),
        },
        borderRadius: 2,
      }}
    >
      <Badge badgeContent={cart?.data?.items.length || 0} color="error">
        <ShoppingCart />
      </Badge>
    </IconButton>
  );
};

export default CartButton;
