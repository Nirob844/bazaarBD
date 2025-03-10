"use client";

import { Review } from "@/types/review";
import { Box, Divider, Rating, Typography } from "@mui/material";

interface ProductReviewsProps {
  reviews: Review[];
}

export default function ProductReviews({ reviews }: ProductReviewsProps) {
  return (
    <Box sx={{ mt: 8 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Customer Reviews
      </Typography>

      <Divider sx={{ mb: 3 }} />

      {reviews.map((review, idx) => (
        <Box key={idx} sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Typography variant="subtitle2" fontWeight={700}>
              {review.user.name}
            </Typography>
            <Rating
              value={parseFloat(review.rating)}
              size="small"
              readOnly
              sx={{ ml: 1 }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {review.comment}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
