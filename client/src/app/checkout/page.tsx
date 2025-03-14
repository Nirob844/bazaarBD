/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useGetCartQuery } from "@/redux/api/cartApi";
import { useCheckoutMutation } from "@/redux/api/orderApi";
import { CartItem } from "@/types/cart";
import { Product } from "@/types/product";
import { getUserInfo } from "@/utils/auth";
import { Container, Grid, List, Typography } from "@mui/material";
import { useState } from "react";
// import { toast } from "react-hot-toast"; // Optional: for success/error message
import CartItemCard from "@/components/checkout/CartItemCard";
import OrderSummary from "@/components/checkout/OrderSummary";
import { useRouter } from "next/navigation"; // Optional: redirect user
import toast from "react-hot-toast";

export default function Checkout() {
  const router = useRouter();
  const { userId } = getUserInfo() as { userId: string };
  const { data, isLoading, refetch } = useGetCartQuery(userId);
  const [checkout, { isLoading: isPlacingOrder }] = useCheckoutMutation();

  const [error, setError] = useState<string | null>(null);

  if (isLoading) return <LoadingSpinner />;

  const cart = data.data;
  const cartItems = cart.items;

  // Helper: Calculate discounted price
  const getDiscountedPrice = (product: Product) => {
    const price = parseFloat(product.price);
    const hasPromotion = product.promotions && product.promotions.length > 0;

    if (hasPromotion) {
      const discount = parseFloat(product.promotions[0].discountPercentage);
      const discountedPrice = price - (price * discount) / 100;
      return discountedPrice;
    }

    return price;
  };

  // Calculate total
  const totalPrice = cartItems.reduce(
    (total: number, item: { product: Product; quantity: number }) => {
      const discountedPrice = getDiscountedPrice(item.product);
      return total + discountedPrice * item.quantity;
    },
    0
  );

  // Place order handler
  const handlePlaceOrder = async () => {
    setError(null);
    try {
      const payload = { cartId: cart.id, userId: userId };
      const response = await checkout(payload).unwrap();

      console.log("Order successful:", response);

      toast.success("Order placed successfully!");

      refetch();
      router.push("/order");
    } catch (err: any) {
      console.error("Order failed:", err);
      setError(err?.data?.message || "Failed to place order");
      toast.error(err?.data?.message || "Failed to place order");
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 4 }}>
        Checkout
      </Typography>

      <Grid container spacing={4}>
        {/* Cart Items */}
        <Grid item xs={12} md={8}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            Your Cart
          </Typography>
          <List>
            {cartItems.map((item: CartItem) => (
              <CartItemCard
                key={item.id}
                item={item}
                getDiscountedPrice={getDiscountedPrice}
              />
            ))}
          </List>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <OrderSummary
            totalPrice={totalPrice}
            isPlacingOrder={isPlacingOrder}
            handlePlaceOrder={handlePlaceOrder}
            error={error}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
