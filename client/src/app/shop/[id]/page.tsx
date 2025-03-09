import { Promotion } from "@/types/product";
import { Review } from "@/types/review";
import { ShoppingCart } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Grid,
  Rating,
  Typography,
} from "@mui/material";
import Image from "next/image";

const getProduct = async (id: string) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/products/${id}`,
      {
        cache: "no-cache",
      }
    );
    const { data } = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
};

const ProductPage = async ({ params }: { params: { id: string } }) => {
  const product = await getProduct(params.id);

  if (!product) {
    return (
      <Container maxWidth="md" sx={{ py: 10 }}>
        <Typography variant="h4" color="error" align="center">
          Product not found!
        </Typography>
      </Container>
    );
  }

  const {
    name,
    description,
    price,
    promotions,
    category,
    inventory,
    imageUrls,
    user,
    reviews,
  } = product;

  const discountPromo = promotions.find((p: Promotion) => p.discountPercentage);
  const discountPercentage = discountPromo?.discountPercentage || null;
  const discountedPrice = discountPercentage
    ? (parseFloat(price) * (1 - parseFloat(discountPercentage) / 100)).toFixed(
        2
      )
    : null;

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc: number, r: Review) => acc + r.rating, 0) /
        reviews.length
      : 0;

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <Grid container spacing={6}>
        {/* Left Side: Images */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              borderRadius: 4,
              overflow: "hidden",
              border: "1px solid #eee",
            }}
          >
            <Image
              src={imageUrls[0]?.url || "/placeholder-product.jpg"}
              alt={imageUrls[0]?.altText || name}
              width={400}
              height={600}
              style={{ objectFit: "cover", width: "100%", height: "auto" }}
            />
          </Box>

          <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
            {promotions.map((promo: Promotion, idx: number) => (
              <Chip
                key={idx}
                label={promo.type.replace("_", " ")}
                color={
                  promo.type === "NEW_ARRIVAL"
                    ? "success"
                    : promo.type === "FLASH_SALE"
                    ? "error"
                    : "primary"
                }
                sx={{ fontWeight: 700 }}
              />
            ))}
          </Box>
        </Grid>

        {/* Right Side: Product Info */}
        <Grid item xs={12} md={6}>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            {name}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Rating value={averageRating} precision={0.5} readOnly />
            <Typography variant="body2" sx={{ ml: 1 }}>
              ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            {discountedPrice ? (
              <>
                <Typography
                  variant="h5"
                  color="primary"
                  fontWeight={800}
                  sx={{ mr: 1 }}
                >
                  ${discountedPrice}
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ textDecoration: "line-through" }}
                >
                  ${parseFloat(price).toFixed(2)}
                </Typography>
                <Chip
                  label={`-${discountPercentage}%`}
                  color="error"
                  size="small"
                  sx={{ ml: 1, fontWeight: 700 }}
                />
              </>
            ) : (
              <Typography variant="h5" color="primary" fontWeight={800}>
                ${parseFloat(price).toFixed(2)}
              </Typography>
            )}
          </Box>

          <Typography variant="body1" sx={{ mb: 3 }}>
            {description}
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Chip label={category.name} variant="outlined" />
            <Typography
              variant="body2"
              color={inventory.stock > 0 ? "success.main" : "error"}
            >
              {inventory.stock > 0
                ? `In Stock (${inventory.stock})`
                : "Out of Stock"}
            </Typography>
          </Box>

          <Button
            variant="contained"
            size="large"
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

          <Divider sx={{ my: 4 }} />

          <Typography variant="body2" color="text.secondary">
            Sold by: <strong>{user.name}</strong> ({user.email})
          </Typography>
        </Grid>
      </Grid>

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <Box sx={{ mt: 8 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Customer Reviews
          </Typography>

          <Divider sx={{ mb: 3 }} />

          {reviews.map((review: Review, idx: number) => (
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
      )}
    </Container>
  );
};

export default ProductPage;
