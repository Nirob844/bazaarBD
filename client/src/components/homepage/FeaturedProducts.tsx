"use client";

import { ShoppingCart } from "@mui/icons-material";
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  Grid,
  IconButton,
  Typography,
  useTheme,
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";

const featuredProducts = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: 99.99,
    image: "/images/products/headphones.jpg",
    link: "/products/wireless-headphones",
  },
  {
    id: 2,
    name: "Smart Watch",
    price: 149.99,
    image: "/images/products/smart-watch.jpg",
    link: "/products/smart-watch",
  },
  {
    id: 3,
    name: "Gaming Laptop",
    price: 1299.99,
    image: "/images/products/gaming-laptop.jpg",
    link: "/products/gaming-laptop",
  },
  {
    id: 4,
    name: "Wireless Earbuds",
    price: 79.99,
    image: "/images/products/earbuds.jpg",
    link: "/products/wireless-earbuds",
  },
  {
    id: 5,
    name: "4K Smart TV",
    price: 799.99,
    image: "/images/products/smart-tv.jpg",
    link: "/products/4k-smart-tv",
  },
  {
    id: 6,
    name: "DSLR Camera",
    price: 599.99,
    image: "/images/products/dslr-camera.jpg",
    link: "/products/dslr-camera",
  },
];

export default function FeaturedProducts() {
  const theme = useTheme();

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
        <Grid container spacing={4}>
          {featuredProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 2,
                  boxShadow: theme.shadows[2],
                  transition: "transform 0.3s, box-shadow 0.3s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: theme.shadows[6],
                  },
                }}
              >
                <CardMedia
                  sx={{
                    position: "relative",
                    height: 200,
                  }}
                >
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </CardMedia>
                <CardContent
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography
                      variant="h6"
                      component="h3"
                      sx={{
                        fontWeight: 700,
                        color: theme.palette.text.primary,
                        mb: 1,
                      }}
                    >
                      {product.name}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: theme.palette.text.secondary,
                        fontWeight: 600,
                        mb: 2,
                      }}
                    >
                      ${product.price.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Button
                      component={Link}
                      href={product.link}
                      variant="contained"
                      size="small"
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        px: 3,
                        py: 1,
                        flexGrow: 1,
                      }}
                    >
                      View Details
                    </Button>
                    <IconButton
                      aria-label="add to cart"
                      sx={{
                        color: theme.palette.primary.main,
                        "&:hover": {
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.1
                          ),
                        },
                      }}
                    >
                      <ShoppingCart />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
