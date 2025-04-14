import {
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Rating,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Carousel from "react-material-ui-carousel";
import { useParams } from "react-router-dom";
import { useGetSingleProductQuery } from "../../redux/api/productApi";

interface InventoryHistoryEntry {
  action: string;
  quantityChange: number;
  previousStock: number;
  newStock: number;
  createdAt: string;
}

interface Review {
  user: {
    name: string;
    email: string;
  };
  rating: number;
  comment: string;
}

const ProductDetails = () => {
  const { id } = useParams();

  const { data: product, isLoading } = useGetSingleProductQuery(id);

  if (isLoading) return <CircularProgress />;

  if (!product) return <Typography>No product found.</Typography>;
  console.log("product", product);

  const {
    name,
    description,
    price,
    sku,
    status,
    imageUrls,
    category,
    user,
    inventory,
    promotions,
    reviews,
    createdAt,
  } = product.data;

  const discount = promotions?.[0]?.discountPercentage;
  const discountedPrice =
    discount && price
      ? (parseFloat(price) * (1 - parseFloat(discount) / 100)).toFixed(2)
      : null;

  return (
    <Box p={3}>
      <Grid container spacing={4}>
        {/* Images */}
        <Grid item xs={12} md={6}>
          <Carousel navButtonsAlwaysVisible>
            {imageUrls &&
              imageUrls.map(
                (img: { url: string; altText: string }, idx: number) => (
                  <Box
                    key={idx}
                    component="img"
                    src={img.url}
                    alt={img.altText}
                    sx={{
                      width: "100%",
                      height: 500,
                      objectFit: "cover",
                      borderRadius: 2,
                    }}
                  />
                )
              )}
          </Carousel>
        </Grid>

        {/* Product Info */}
        <Grid item xs={12} md={6}>
          <Typography variant="h4">{name}</Typography>

          <Stack direction="row" spacing={2} alignItems="center" mt={1}>
            <Typography variant="h6" color="primary">
              ${discountedPrice || parseFloat(price).toFixed(2)}
            </Typography>
            {discountedPrice && (
              <>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ textDecoration: "line-through" }}
                >
                  ${parseFloat(price).toFixed(2)}
                </Typography>
                <Chip label={`-${discount}% OFF`} color="success" />
              </>
            )}
          </Stack>

          <Typography mt={2}>{description}</Typography>

          <Stack mt={3} spacing={1}>
            <Typography>SKU: {sku}</Typography>
            <Typography>Status: {status}</Typography>
            <Typography>Category: {category?.name}</Typography>
            <Typography>In Stock: {inventory?.stock}</Typography>
            <Typography>
              Seller: {user?.name} ({user?.email})
            </Typography>
            <Typography>
              Created At: {new Date(createdAt).toLocaleString()}
            </Typography>
          </Stack>
        </Grid>
      </Grid>

      {/* Inventory History */}
      <Box mt={6}>
        <Typography variant="h5" gutterBottom>
          Inventory History
        </Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Action</TableCell>
                <TableCell>Qty Change</TableCell>
                <TableCell>Previous</TableCell>
                <TableCell>New</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inventory?.history?.map(
                (entry: InventoryHistoryEntry, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{entry.action}</TableCell>
                    <TableCell>{entry.quantityChange}</TableCell>
                    <TableCell>{entry.previousStock}</TableCell>
                    <TableCell>{entry.newStock}</TableCell>
                    <TableCell>
                      {new Date(entry.createdAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Customer Reviews */}
      <Box mt={6}>
        <Typography variant="h5" gutterBottom>
          Customer Reviews
        </Typography>
        {reviews?.length > 0 ? (
          <Stack spacing={2}>
            {reviews.map((review: Review, index: number) => (
              <Paper key={index} variant="outlined" sx={{ p: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar>{review.user.name[0]}</Avatar>
                  <Box>
                    <Typography variant="subtitle2">
                      {review.user.name} - {review.user.email}
                    </Typography>
                    <Rating value={review.rating} readOnly />
                    <Typography variant="body2">{review.comment}</Typography>
                  </Box>
                </Stack>
              </Paper>
            ))}
          </Stack>
        ) : (
          <Typography>No reviews yet.</Typography>
        )}
      </Box>
    </Box>
  );
};

export default ProductDetails;
