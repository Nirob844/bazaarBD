"use client";

import { Category } from "@/types/category";
import { Box, Button, Stack, Typography } from "@mui/material";
import { motion } from "framer-motion";
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
    router.push(`/shop?categoryId=${categoryId}`);
  };

  const allCategories = [{ id: "", name: "All" }, ...categories];

  return (
    <Box
      sx={{
        p: 3,
        borderRadius: 3,
        backgroundColor: "background.paper",
        boxShadow: 3,
      }}
    >
      <Typography
        variant="h6"
        fontWeight={700}
        gutterBottom
        sx={{ color: "text.primary", mb: 2 }}
      >
        Product Categories
      </Typography>

      <Stack spacing={1.5}>
        {allCategories.map((category) => {
          const isSelected = category.id === selectedCategoryId;

          return (
            <motion.div
              key={category.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant={isSelected ? "contained" : "outlined"}
                color={isSelected ? "primary" : "inherit"}
                onClick={() => handleCategoryChange(category.id)}
                sx={{
                  justifyContent: "flex-start",
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  px: 2.5,
                  py: 1.5,
                  transition: "all 0.3s ease",
                  boxShadow: isSelected ? 3 : 1,
                  backgroundColor: isSelected
                    ? "primary.main"
                    : "background.paper",
                  color: isSelected ? "primary.contrastText" : "text.primary",
                  "&:hover": {
                    backgroundColor: isSelected
                      ? "primary.dark"
                      : "action.hover",
                    boxShadow: 3,
                  },
                }}
                fullWidth
              >
                {category.name}
              </Button>
            </motion.div>
          );
        })}
      </Stack>
    </Box>
  );
}
