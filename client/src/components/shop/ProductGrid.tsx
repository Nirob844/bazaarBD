"use client";

import ProductCard from "@/components/shop/ProductCard";
import { Meta, Product } from "@/types/product";
import { Box, Grid, Pagination } from "@mui/material";
import { useRouter } from "next/navigation";

interface ProductGridProps {
  products: Product[];
  meta: Meta;
}

export default function ProductGrid({ products, meta }: ProductGridProps) {
  const router = useRouter();

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    router.push(`/shop?page=${value}&limit=${meta.limit}`);
  };

  return (
    <>
      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <ProductCard product={product} />
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <Pagination
          count={Math.ceil(meta.total / meta.limit)}
          page={meta.page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
    </>
  );
}
