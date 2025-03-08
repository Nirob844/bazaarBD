"use client";

import { Category } from "@/types/category";
import { Box, List, ListItem, ListItemText, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

interface ProductFiltersProps {
  categories: Category[];
  selectedCategoryId: string;
}

export default function ProductFilters({
  categories,
  selectedCategoryId,
}: ProductFiltersProps) {
  const router = useRouter();

  const handleCategoryChange = (categoryId: string) => {
    // Update the URL with the selected category
    router.push(`/shop?categoryId=${categoryId}`);
  };

  const allCategories = [{ id: "", name: "All" }, ...categories];

  return (
    <Box
      sx={{
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
        {allCategories.map((category) => (
          <ListItem
            button
            key={category.id}
            selected={category.id === selectedCategoryId}
            onClick={() => handleCategoryChange(category.id)}
            sx={{ borderRadius: 2, mb: 1 }}
          >
            <ListItemText
              primary={category.name}
              primaryTypographyProps={{ fontWeight: 600 }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
