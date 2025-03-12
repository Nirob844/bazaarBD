/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import {
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const theme = useTheme(); // Access the custom theme

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      await toast.promise(
        (async () => {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/register`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ name, email, password }),
            }
          );

          const data = await res.json();

          if (!res.ok) {
            throw new Error(
              data.message || "Registration failed. Please try again."
            );
          }

          // Optional: store token if your backend returns one immediately after registration
          // const accessToken = data.data;
          // storeUserInfo(accessToken);

          // Redirect to login page after successful registration
          router.push("/login");
        })(),
        {
          loading: "Registering...",
          success: "Registration successful! Redirecting...",
          error: (err) => err.message || "Something went wrong.",
        }
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Container maxWidth="lg">
        <Grid
          container
          sx={{
            boxShadow: 6,
            borderRadius: theme.shape.borderRadius * 2,
            overflow: "hidden",
            backgroundColor: theme.palette.background.paper,
          }}
        >
          {/* Left Image Section */}
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              display: { xs: "none", md: "block" },
              position: "relative",
              minHeight: "650px",
              backgroundColor: theme.palette.primary.light,
            }}
          >
            <Image
              src="/register.png"
              alt="Register"
              fill
              style={{
                objectFit: "cover",
              }}
            />
          </Grid>

          {/* Right Form Section */}
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              p: { xs: 4, md: 8 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              backgroundColor: theme.palette.background.paper,
            }}
          >
            <Box>
              <Typography
                variant="h4"
                fontWeight={700}
                textAlign="center"
                color={theme.palette.primary.main}
                mb={2}
              >
                Create an Account
              </Typography>

              <Typography
                variant="body1"
                color={theme.palette.text.secondary}
                textAlign="center"
                mb={4}
              >
                Join BazaarBD and enjoy seamless shopping!
              </Typography>

              <form onSubmit={handleRegister}>
                <Stack spacing={3}>
                  <TextField
                    label="Full Name"
                    variant="outlined"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    fullWidth
                  />

                  <TextField
                    label="Email Address"
                    type="email"
                    variant="outlined"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    fullWidth
                  />

                  <TextField
                    label="Password"
                    type="password"
                    variant="outlined"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    fullWidth
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={loading}
                    sx={{
                      py: 1.5,
                      borderRadius: theme.shape.borderRadius,
                      fontWeight: 600,
                      boxShadow: `0px 8px 16px rgba(46, 139, 87, 0.24)`,
                      "&:hover": {
                        backgroundColor: theme.palette.primary.dark,
                      },
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Register Now"
                    )}
                  </Button>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="center"
                  >
                    Already have an account?{" "}
                    <Button
                      variant="text"
                      color="secondary"
                      onClick={() => router.push("/login")}
                      sx={{
                        textTransform: "none",
                        fontWeight: 500,
                        p: 0,
                      }}
                    >
                      Login here
                    </Button>
                  </Typography>
                </Stack>
              </form>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
