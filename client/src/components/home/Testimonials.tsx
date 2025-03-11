"use client";

import {
  Avatar,
  Box,
  Container,
  Grid,
  Typography,
  useTheme,
} from "@mui/material";
import Image from "next/image";

const testimonials = [
  {
    id: 1,
    name: "John Doe",
    role: "Happy Customer",
    feedback:
      "BazaarBD has the best deals! I got my new headphones at an amazing price. Highly recommended!",
    image: "/images/testimonials/john-doe.jpg",
  },
  {
    id: 2,
    name: "Jane Smith",
    role: "Frequent Shopper",
    feedback:
      "The delivery was super fast, and the product quality is excellent. I’ll definitely shop here again!",
    image: "/images/testimonials/jane-smith.jpg",
  },
  {
    id: 3,
    name: "Alice Johnson",
    role: "Satisfied Buyer",
    feedback:
      "I love the variety of products available. The customer service is also top-notch. Great experience!",
    image: "/images/testimonials/alice-johnson.jpg",
  },
];

export default function Testimonials() {
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
          What Our Customers Say
        </Typography>
        <Grid container spacing={4}>
          {testimonials.map((testimonial) => (
            <Grid item xs={12} sm={6} md={4} key={testimonial.id}>
              <Box
                sx={{
                  backgroundColor: theme.palette.background.default,
                  borderRadius: 4,
                  p: 4,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    mb: 2,
                  }}
                >
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={80}
                    height={80}
                    style={{ objectFit: "cover", borderRadius: "50%" }}
                  />
                </Avatar>
                <Typography
                  variant="h6"
                  component="h3"
                  sx={{
                    fontWeight: 700,
                    color: theme.palette.text.primary,
                    mb: 1,
                  }}
                >
                  {testimonial.name}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.secondary,
                    mb: 2,
                  }}
                >
                  {testimonial.role}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: theme.palette.text.primary,
                    fontStyle: "italic",
                  }}
                >
                  &ldquo;{testimonial.feedback}&rdquo;
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
