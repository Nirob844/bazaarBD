"use client";

import { Box, Container, Grid, Typography, useTheme } from "@mui/material";
import Image from "next/image";

const reasons = [
  {
    id: 1,
    title: "Fast Delivery",
    description: "Get your orders delivered to your doorstep in record time.",
    icon: "/images/icons/fast-delivery.png",
  },
  {
    id: 2,
    title: "Quality Products",
    description: "We offer only the best products from trusted brands.",
    icon: "/images/icons/quality-products.png",
  },
  {
    id: 3,
    title: "Secure Payments",
    description:
      "Enjoy safe and secure payment options for all your purchases.",
    icon: "/images/icons/secure-payments.png",
  },
  {
    id: 4,
    title: "24/7 Support",
    description: "Our customer support team is always here to help you.",
    icon: "/images/icons/customer-support.png",
  },
];

export default function WhyChooseUs() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.default,
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
          Why Choose Us?
        </Typography>
        <Grid container spacing={4}>
          {reasons.map((reason) => (
            <Grid item xs={12} sm={6} md={3} key={reason.id}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: theme.palette.primary.main,
                    borderRadius: "50%",
                  }}
                >
                  <Image
                    src={reason.icon}
                    alt={reason.title}
                    width={40}
                    height={40}
                  />
                </Box>
                <Typography
                  variant="h6"
                  component="h3"
                  sx={{
                    fontWeight: 700,
                    color: theme.palette.text.primary,
                    mb: 1,
                  }}
                >
                  {reason.title}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: theme.palette.text.secondary,
                  }}
                >
                  {reason.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
