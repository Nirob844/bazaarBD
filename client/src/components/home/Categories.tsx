"use client";

import { fetchCategories } from "@/services/categories";
import { Category } from "@/types/category";
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
import { useEffect, useState } from "react";

export default function Categories() {
  const theme = useTheme();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    getCategories();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h6">Loading categories...</Typography>
      </Container>
    );
  }

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
                    src={category.imageUrl || "/default-image.jpg"}
                    alt={category.name}
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
                      {category.name}
                    </Typography>
                    {/* <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.text.secondary,
                        mb: 2,
                      }}
                    >
                      {category.description}
                    </Typography> */}
                  </Box>
                  <Button
                    component={Link}
                    href={`/shop?categoryId=${category.id}`}
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
