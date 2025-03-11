/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { storeUserInfo } from "@/utils/auth";
import {
  Alert,
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

export default function LoginPage() {
  const router = useRouter();
  const theme = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await res.json();
      const accessToken = data.data;
      storeUserInfo(accessToken);
      if (!res.ok) {
        setError(data.message || "Login failed. Please try again.");
        return;
      }

      setSuccess("Login successful! Redirecting...");

      setTimeout(() => {
        router.push("/shop");
      }, 2000);
    } catch (err: any) {
      setError("Something went wrong. Please try again.");
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
              src="/login.png"
              alt="Login"
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
                Welcome Back!
              </Typography>

              <Typography
                variant="body1"
                color={theme.palette.text.secondary}
                textAlign="center"
                mb={4}
              >
                Login to continue shopping at BazaarBD
              </Typography>

              <form onSubmit={handleLogin}>
                <Stack spacing={3}>
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

                  {error && <Alert severity="error">{error}</Alert>}
                  {success && <Alert severity="success">{success}</Alert>}

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
                      "Login Now"
                    )}
                  </Button>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="center"
                  >
                    Don&apos;t have an account?{" "}
                    <Button
                      variant="text"
                      color="secondary"
                      onClick={() => router.push("/register")}
                      sx={{
                        textTransform: "none",
                        fontWeight: 500,
                        p: 0,
                      }}
                    >
                      Register here
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
