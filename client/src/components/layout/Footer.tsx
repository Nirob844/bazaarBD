"use client";

import {
  Email,
  Facebook,
  Instagram,
  LinkedIn,
  LocationOn,
  Phone,
  Twitter,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Container,
  Divider,
  Grid,
  IconButton,
  InputBase,
  Link,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

const Footer = () => {
  const theme = useTheme(); // Use the custom theme

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: theme.palette.primary.main, // Use primary color from theme
        color: theme.palette.common.white, // White text color
        py: 6,
        mt: "auto",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            <Box>
              <Link href="/about" color="inherit" underline="hover">
                About Us
              </Link>
            </Box>
            <Box>
              <Link href="/shop" color="inherit" underline="hover">
                Shop
              </Link>
            </Box>
            <Box>
              <Link href="/deals" color="inherit" underline="hover">
                Deals
              </Link>
            </Box>
            <Box>
              <Link href="/contact" color="inherit" underline="hover">
                Contact Us
              </Link>
            </Box>
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Contact Us
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <LocationOn sx={{ mr: 1 }} />
              <Typography variant="body2">
                123 Main Street, City, Country
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Phone sx={{ mr: 1 }} />
              <Typography variant="body2">+1 (123) 456-7890</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Email sx={{ mr: 1 }} />
              <Typography variant="body2">info@bazaarbd.com</Typography>
            </Box>
          </Grid>

          {/* Social Media */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Follow Us
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <IconButton
                href="https://facebook.com"
                target="_blank"
                rel="noopener"
                color="inherit"
              >
                <Facebook />
              </IconButton>
              <IconButton
                href="https://twitter.com"
                target="_blank"
                rel="noopener"
                color="inherit"
              >
                <Twitter />
              </IconButton>
              <IconButton
                href="https://instagram.com"
                target="_blank"
                rel="noopener"
                color="inherit"
              >
                <Instagram />
              </IconButton>
              <IconButton
                href="https://linkedin.com"
                target="_blank"
                rel="noopener"
                color="inherit"
              >
                <LinkedIn />
              </IconButton>
            </Box>
          </Grid>

          {/* Newsletter */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Newsletter
            </Typography>
            <Typography variant="body2" gutterBottom>
              Subscribe to our newsletter for the latest updates and deals.
            </Typography>
            <Box
              component="form"
              sx={{ display: "flex", alignItems: "center", mt: 2 }}
            >
              <InputBase
                placeholder="Your email"
                sx={{
                  backgroundColor: "#ffffff",
                  borderRadius: 1,
                  px: 2,
                  py: 1,
                  mr: 1,
                  flexGrow: 1,
                }}
              />
              <Button
                variant="contained"
                color="primary"
                sx={{
                  textTransform: "none",
                  backgroundColor: theme.palette.secondary.main, // Use secondary color for button
                }}
              >
                Subscribe
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* Divider */}
        <Divider sx={{ my: 4, backgroundColor: "rgba(255, 255, 255, 0.1)" }} />

        {/* Copyright */}
        <Typography variant="body2" align="center">
          © {new Date().getFullYear()} BazaarBD. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
