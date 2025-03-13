// app/best-deals/page.tsx
import ProductCard from "@/components/shop/ProductCard";
import { Product } from "@/types/product";
import { Box, Container, Grid, Typography } from "@mui/material";

export default async function BestDeals() {
  // Fetch promotion products directly in the Server Component
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/products/promotions?limit=6`,
    {
      cache: "no-store",
    }
  );

  const data = await res.json();

  const dealProducts: Product[] = data?.data || [];

  return (
    <Box
      sx={{
        py: 8,
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          component="h2"
          sx={{
            fontWeight: 800,

            mb: 4,
            textAlign: "center",
          }}
        >
          Limited-Time Deals
        </Typography>

        <Grid container spacing={4}>
          {dealProducts.length === 0 ? (
            <Typography align="center" width="100%">
              No deals products found.
            </Typography>
          ) : (
            dealProducts.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product.id}>
                <ProductCard product={product} />
              </Grid>
            ))
          )}
        </Grid>
      </Container>
    </Box>
  );
}
