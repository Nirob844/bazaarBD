"use client";

import { Product } from "@/types/product";
import { Box, Container, Grid, Typography, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import ProductCard from "../shop/ProductCard";

export default function FeaturedProducts() {
  const theme = useTheme();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/products/?promotionType=FEATURED&limit=3`
        );
        const json = await res.json();

        setFeaturedProducts(json?.data || []);
      } catch (error) {
        console.error("Error fetching featured products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.default,
        py: 8,
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          component="h2"
          sx={{
            fontWeight: 800,
            color: theme.palette.text.primary,
            mb: 4,
            textAlign: "center",
          }}
        >
          Featured Products
        </Typography>

        {loading ? (
          <Typography align="center">Loading...</Typography>
        ) : (
          <Grid container spacing={4}>
            {featuredProducts.length === 0 ? (
              <Typography align="center" width="100%">
                No featured products found.
              </Typography>
            ) : (
              featuredProducts.map((product) => (
                <Grid item xs={12} sm={6} md={4} key={product.id}>
                  <ProductCard product={product} />
                </Grid>
              ))
            )}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
