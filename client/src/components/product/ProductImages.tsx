"use client";

import { ImageUrl } from "@/types/product";
import { Box, Grid } from "@mui/material";
import Image from "next/image";
import { useState } from "react";

interface ProductImagesProps {
  imageUrls: ImageUrl[];
  productName: string;
}

export default function ProductImages({
  imageUrls,
  productName,
}: ProductImagesProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Main Image */}
      <Box
        sx={{
          borderRadius: 4,
          overflow: "hidden",
          border: "1px solid #eee",
          position: "relative",
          aspectRatio: "1/1",
        }}
      >
        <Image
          src={imageUrls[selectedImage]?.url || "/placeholder-product.jpg"}
          alt={imageUrls[selectedImage]?.altText || productName}
          fill
          style={{ objectFit: "cover" }}
        />
      </Box>

      {/* Thumbnail Gallery */}
      <Grid container spacing={2}>
        {imageUrls.map((img, index) => (
          <Grid item xs={3} key={img.id}>
            <Box
              sx={{
                borderRadius: 2,
                overflow: "hidden",
                border: `2px solid ${
                  selectedImage === index ? "primary.main" : "#eee"
                }`,
                cursor: "pointer",
                aspectRatio: "1/1",
                position: "relative",
              }}
              onClick={() => setSelectedImage(index)}
            >
              <Image
                src={img.url}
                alt={img.altText}
                fill
                style={{ objectFit: "cover" }}
              />
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
