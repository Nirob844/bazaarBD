/* eslint-disable @typescript-eslint/no-unused-expressions */
"use client";

import {
  Box,
  Button,
  MenuItem,
  Slider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { Category } from "@/types/category";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface ProductFiltersProps {
  categories: Category[];
  selectedCategoryId: string;
}

export default function ProductFilters({
  categories,
  selectedCategoryId,
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [categoryId, setCategoryId] = useState(selectedCategoryId || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [minPrice, setMinPrice] = useState<number>(
    parseInt(searchParams.get("minPrice") || "0")
  );
  const [maxPrice, setMaxPrice] = useState<number>(
    parseInt(searchParams.get("maxPrice") || "5000")
  );
  const [promotionType, setPromotionType] = useState(
    searchParams.get("promotionType") || ""
  );

  // Define the price range limits
  const PRICE_MIN = 0;
  const PRICE_MAX = 5000; // Change this to your max price

  useEffect(() => {
    setCategoryId(selectedCategoryId);
  }, [selectedCategoryId]);

  const handleApplyFilters = () => {
    const params = new URLSearchParams(searchParams);

    categoryId
      ? params.set("categoryId", categoryId)
      : params.delete("categoryId");

    status ? params.set("status", status) : params.delete("status");

    params.set("minPrice", minPrice.toString());
    params.set("maxPrice", maxPrice.toString());

    promotionType
      ? params.set("promotionType", promotionType)
      : params.delete("promotionType");

    params.set("page", "1");

    router.push(`/shop?${params.toString()}`);
  };

  const handleResetFilters = () => {
    setCategoryId("");
    setStatus("");
    setMinPrice(PRICE_MIN);
    setMaxPrice(PRICE_MAX);
    setPromotionType("");

    const params = new URLSearchParams();
    params.set("page", "1");

    router.push(`/shop?${params.toString()}`);
  };

  const allCategories = [{ id: "", name: "All" }, ...categories];

  // Handle price slider change
  const handlePriceChange = (event: Event, newValue: number | number[]) => {
    const [min, max] = newValue as number[];
    setMinPrice(min);
    setMaxPrice(max);
  };

  return (
    <Box
      sx={{
        p: 3,
        borderRadius: 3,
        backgroundColor: "background.paper",
        boxShadow: 3,
      }}
    >
      <Typography variant="h6" fontWeight={700} gutterBottom>
        Filters
      </Typography>

      <Stack spacing={2}>
        {/* Category */}
        <TextField
          select
          label="Category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          fullWidth
        >
          {allCategories.map((category) => (
            <MenuItem key={category.id} value={category.id}>
              {category.name}
            </MenuItem>
          ))}
        </TextField>

        {/* Status */}
        <TextField
          select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          fullWidth
        >
          <MenuItem value="">All Status</MenuItem>
          <MenuItem value="ACTIVE">Available</MenuItem>
          <MenuItem value="INACTIVE">Not Available</MenuItem>
          <MenuItem value="out_of_stock">Out of Stock</MenuItem>
        </TextField>

        {/* Promotion Type */}
        <TextField
          select
          label="Promotion Type"
          value={promotionType}
          onChange={(e) => setPromotionType(e.target.value)}
          fullWidth
        >
          <MenuItem value="">All Promotions</MenuItem>
          <MenuItem value="FEATURED">Featured</MenuItem>
          <MenuItem value="BEST_DEAL">Best Deals</MenuItem>
          <MenuItem value="NEW_ARRIVAL">New Arrival</MenuItem>
        </TextField>

        {/* Price Range Slider */}
        <Box>
          <Typography gutterBottom fontWeight={600}>
            Price Range (৳{minPrice} - ৳{maxPrice})
          </Typography>
          <Slider
            getAriaLabel={() => "Price range"}
            value={[minPrice, maxPrice]}
            onChange={handlePriceChange}
            valueLabelDisplay="auto"
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={100} // Change step size as needed
            sx={{ mt: 2 }}
          />
        </Box>

        {/* Apply & Reset Buttons */}
        <Stack direction="row" spacing={2} mt={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleApplyFilters}
            fullWidth
            sx={{ textTransform: "none", fontWeight: 600, py: 1.5 }}
          >
            Apply Filters
          </Button>

          <Button
            variant="contained"
            color="secondary"
            onClick={handleResetFilters}
            fullWidth
            sx={{ textTransform: "none", fontWeight: 600, py: 1.5 }}
          >
            Reset Filters
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
