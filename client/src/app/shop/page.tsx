import Hero from "@/components/shop/Hero";
import ProductFilters from "@/components/shop/ProductFilters";
import ProductGrid from "@/components/shop/ProductGrid";
import { fetchCategories } from "@/services/categories";
import { fetchProducts } from "@/services/products";
import { Search } from "@mui/icons-material";
import {
  Box,
  Container,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";

const Shop = async ({
  searchParams,
}: {
  searchParams: {
    page?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: string;
    categoryId?: string;
  };
}) => {
  const page = parseInt(searchParams.page || "1");
  const limit = parseInt(searchParams.limit || "10");
  const sortBy = searchParams.sortBy || "price";
  const sortOrder = searchParams.sortOrder || "asc";
  const categoryId = searchParams.categoryId || "";

  const [productsResponse, categories] = await Promise.all([
    fetchProducts({ page, limit, sortBy, sortOrder, categoryId }),
    fetchCategories(),
  ]);

  const { data: products, meta } = productsResponse;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Hero />

      {/* Search and Sort Section */}
      <Box sx={{ display: "flex", gap: 3, mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search products..."
          InputProps={{
            startAdornment: <Search color="action" />,
          }}
        />

        <TextField
          select
          variant="outlined"
          sx={{ minWidth: 200 }}
          defaultValue={`${sortBy}-${sortOrder}`}
        >
          <MenuItem value="price-asc">Price: Low to High</MenuItem>
          <MenuItem value="price-desc">Price: High to Low</MenuItem>
          <MenuItem value="name-asc">Name: A to Z</MenuItem>
          <MenuItem value="name-desc">Name: Z to A</MenuItem>
        </TextField>
      </Box>

      {/* Display Meta Information */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="body1">
          Showing {products.length} of {meta.total} products (Page {meta.page}{" "}
          of {Math.ceil(meta.total / meta.limit)})
        </Typography>
      </Box>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Filters Sidebar */}
        <Grid item xs={12} md={3}>
          <ProductFilters
            categories={categories}
            selectedCategoryId={categoryId}
          />
        </Grid>

        {/* Product Grid */}
        <Grid item xs={12} md={9}>
          <ProductGrid products={products} meta={meta} />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Shop;
