"use client";

import { Search, ShoppingCart } from "@mui/icons-material";
import {
  alpha,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Container,
  Drawer,
  Grid,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Pagination,
  Slider,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useState } from "react";

const categories = [
  "All",
  "Electronics",
  "Fashion",
  "Home & Living",
  "Beauty",
  "Sports",
];
const sortOptions = [
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "newest", label: "New Arrivals" },
  { value: "popular", label: "Most Popular" },
];

const products = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  name: `Premium Product ${i + 1}`,
  price: (Math.random() * 500 + 50).toFixed(2),
  image: "https://source.unsplash.com/random/400x300",
  rating: Math.floor(Math.random() * 5) + 1,
  reviews: Math.floor(Math.random() * 100),
  discount: Math.random() > 0.5 ? Math.floor(Math.random() * 40) + 10 : null,
  isNew: Math.random() > 0.8,
}));

export default function Shop() {
  const theme = useTheme();
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState(sortOptions[0].value);
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    setDrawerOpen(false);
  };

  const filteredProducts = products
    .filter((p) => category === "All" || p.name.includes(category))
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .filter((p) => +p.price >= priceRange[0] && +p.price <= priceRange[1])
    .sort((a, b) => {
      if (sortBy === "price-asc") return +a.price - +b.price;
      if (sortBy === "price-desc") return +b.price - +a.price;
      return 0;
    });

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box
        sx={{
          height: 300,
          background: theme.palette.primary.main,
          borderRadius: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: theme.palette.primary.contrastText,
          textAlign: "center",
          flexDirection: "column",
          px: 3,
          mb: 4,
          boxShadow: 4,
        }}
      >
        <Typography variant="h2" fontWeight={800} sx={{ mb: 1 }}>
          Elevate Your Shopping Experience
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: 600 }}>
          Discover curated collections of premium products with exclusive member
          benefits
        </Typography>
      </Box>

      {/* Controls Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Grid container spacing={3} sx={{ maxWidth: 800 }}>
          <Grid item xs={12} sm={8} md={8}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="primary" />
                  </InputAdornment>
                ),
                sx: { borderRadius: 3, backgroundColor: "background.paper" },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField
              select
              fullWidth
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              variant="outlined"
              sx={{ borderRadius: 3 }}
            >
              {sortOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => setDrawerOpen(true)}
              sx={{
                display: { md: "none" },
                py: 1.5,
                borderRadius: 3,
                borderWidth: 2,
                "&:hover": { borderWidth: 2 },
              }}
            >
              Filters
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Main Content */}
      <Grid container spacing={4}>
        {/* Filters Sidebar */}
        <Grid item xs={12} md={3}>
          <Box
            sx={{
              display: { xs: "none", md: "block" },
              p: 3,
              borderRadius: 3,
              backgroundColor: "background.paper",
              boxShadow: 2,
            }}
          >
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Product Categories
            </Typography>
            <List disablePadding>
              {categories.map((cat) => (
                <ListItem
                  button
                  component="li"
                  key={cat}
                  selected={cat === category}
                  onClick={() => handleCategoryChange(cat)}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    transition: "all 0.2s",
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    },
                    "&.Mui-selected": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.2),
                      color: theme.palette.primary.main,
                    },
                  }}
                >
                  <ListItemText
                    primary={cat}
                    primaryTypographyProps={{ fontWeight: 600 }}
                  />
                </ListItem>
              ))}
            </List>

            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Price Range
              </Typography>
              <Slider
                value={priceRange}
                onChange={(_, newValue) => setPriceRange(newValue as number[])}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `৳${value}`}
                min={0}
                max={500}
                sx={{ color: "primary.main" }}
              />
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Chip label={`৳${priceRange[0]}`} variant="outlined" />
                <Chip label={`৳${priceRange[1]}`} variant="outlined" />
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* Product Grid */}
        <Grid item xs={12} md={9}>
          <Grid container spacing={3}>
            {filteredProducts.map((product) => (
              <Grid key={product.id} item xs={12} sm={6} md={4}>
                <Card
                  sx={{
                    borderRadius: 3,
                    overflow: "hidden",
                    transition: "all 0.3s",
                    boxShadow: 2,
                    position: "relative",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: 4,
                    },
                  }}
                >
                  {product.discount && (
                    <Chip
                      label={`-${product.discount}%`}
                      color="error"
                      sx={{
                        position: "absolute",
                        top: 16,
                        left: 16,
                        fontWeight: 700,
                      }}
                    />
                  )}
                  {product.isNew && (
                    <Chip
                      label="New"
                      color="success"
                      sx={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        fontWeight: 700,
                      }}
                    />
                  )}
                  <CardMedia
                    component="img"
                    height="240"
                    image={product.image}
                    alt={product.name}
                    sx={{ objectFit: "cover" }}
                  />
                  <CardContent>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      {product.name}
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Typography
                        variant="h6"
                        color="primary"
                        fontWeight={800}
                        sx={{ mr: 1 }}
                      >
                        ৳{product.price}
                      </Typography>
                      {product.discount && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ textDecoration: "line-through" }}
                        >
                          ৳
                          {(
                            +product.price *
                            (1 + product.discount / 100)
                          ).toFixed(2)}
                        </Typography>
                      )}
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 1,
                        mb: 2,
                      }}
                    >
                      <Badge
                        badgeContent={product.rating}
                        color="warning"
                        sx={{
                          "& .MuiBadge-badge": {
                            right: -4,
                            top: 8,
                            fontWeight: 700,
                          },
                        }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        ({product.reviews} reviews)
                      </Typography>
                    </Box>

                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<ShoppingCart />}
                      sx={{
                        borderRadius: 2,
                        py: 1.5,
                        textTransform: "none",
                        fontWeight: 700,
                      }}
                    >
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
            <Pagination
              count={5}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
              shape="rounded"
              sx={{
                "& .MuiPaginationItem-root": {
                  fontSize: "1rem",
                  fontWeight: 700,
                  minWidth: 40,
                  height: 40,
                },
              }}
            />
          </Box>
        </Grid>
      </Grid>

      {/* Mobile Filters Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: "80%", maxWidth: 300 } }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Filters
          </Typography>

          <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 2 }}>
            Categories
          </Typography>
          <List>
            {categories.map((cat) => (
              <ListItem
                button
                component="li"
                key={cat}
                selected={cat === category}
                onClick={() => handleCategoryChange(cat)}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  "&.Mui-selected": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.2),
                  },
                }}
              >
                <ListItemText primary={cat} />
              </ListItem>
            ))}
          </List>

          <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 3 }}>
            Price Range
          </Typography>
          <Slider
            value={priceRange}
            onChange={(_, newValue) => setPriceRange(newValue as number[])}
            valueLabelDisplay="auto"
            min={0}
            max={500}
            sx={{ mt: 2 }}
          />
        </Box>
      </Drawer>
    </Container>
  );
}
