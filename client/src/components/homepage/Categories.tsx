"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  Grid,
  Typography,
  useTheme,
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";

const categories = [
  {
    id: 1,
    title: "Electronics",
    image: "/images/categories/electronics.jpg",
    description: "Explore the latest gadgets and devices.",
    link: "/categories/electronics",
  },
  {
    id: 2,
    title: "Fashion",
    image: "/images/categories/fashion.jpg",
    description: "Stay trendy with our fashion collection.",
    link: "/categories/fashion",
  },
  {
    id: 3,
    title: "Home & Living",
    image: "/images/categories/home-living.jpg",
    description: "Make your home cozy and stylish.",
    link: "/categories/home-living",
  },
  {
    id: 4,
    title: "Beauty & Health",
    image: "/images/categories/beauty-health.jpg",
    description: "Look and feel your best.",
    link: "/categories/beauty-health",
  },
  {
    id: 5,
    title: "Sports & Fitness",
    image: "/images/categories/sports-fitness.jpg",
    description: "Gear up for an active lifestyle.",
    link: "/categories/sports-fitness",
  },
  {
    id: 6,
    title: "Books & Stationery",
    image: "/images/categories/books-stationery.jpg",
    description: "Fuel your mind and creativity.",
    link: "/categories/books-stationery",
  },
];

export default function Categories() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.paper,
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
          Shop by Category
        </Typography>
        <Grid container spacing={4}>
          {categories.map((category) => (
            <Grid item xs={12} sm={6} md={4} key={category.id}>
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
                    src={category.image}
                    alt={category.title}
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
                      {category.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.text.secondary,
                        mb: 2,
                      }}
                    >
                      {category.description}
                    </Typography>
                  </Box>
                  <Button
                    component={Link}
                    href={category.link}
                    variant="outlined"
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      width: "100%",
                      borderWidth: 2,
                      "&:hover": { borderWidth: 2 },
                    }}
                  >
                    Shop Now
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
