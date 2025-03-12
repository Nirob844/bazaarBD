import ProductImages from "@/components/product/ProductImages";
import ProductInfo from "@/components/product/ProductInfo";
import ProductReviews from "@/components/product/ProductReviews";
import { fetchProduct } from "@/services/products";
import { Review } from "@/types/review";
import { Container, Grid } from "@mui/material";

const Product = async (props: { params: { id: string } }) => {
  const { params } = props;
  const product = await fetchProduct(params.id);

  const {
    name,
    description,
    sku,
    status,
    price,
    promotions,
    category,
    inventory,
    imageUrls,
    user,
    reviews,
  } = product;

  const averageRating: number =
    reviews.length > 0
      ? reviews.reduce((acc: number, r: Review) => acc + r.rating, 0) /
        reviews.length
      : 0;

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Grid container spacing={6}>
        {/* Left Side: Images */}
        <Grid item xs={12} md={6}>
          <ProductImages imageUrls={imageUrls} productName={name} />
        </Grid>

        {/* Right Side: Product Info */}
        <Grid item xs={12} md={6}>
          <ProductInfo
            name={name}
            description={description}
            price={price}
            sku={sku}
            status={status}
            promotions={promotions}
            category={category}
            inventory={inventory}
            user={user}
            averageRating={averageRating}
            reviewsCount={reviews.length}
            productId={product.id}
          />
        </Grid>
      </Grid>

      {/* Reviews Section */}
      {reviews.length > 0 && <ProductReviews reviews={reviews} />}
    </Container>
  );
};

export default Product;
