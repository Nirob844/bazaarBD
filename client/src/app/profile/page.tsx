"use client";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useProfileQuery } from "@/redux/api/profileApi";
import {
  Avatar,
  Box,
  Button,
  Container,
  Grid,
  Typography,
  useTheme,
} from "@mui/material";
import { useRouter } from "next/navigation";

export default function Profile() {
  const theme = useTheme();
  const router = useRouter();

  const { data: userProfile, isLoading, error } = useProfileQuery({});

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <Typography align="center" color="error">
        There was an error loading the profile. Please try again later.
      </Typography>
    );
  }

  const { name, email, role, isVerified, profile } = userProfile.data;

  const handleEditProfile = () => {
    router.push("/profile/edit"); // Navigate to the edit profile page
  };

  return (
    <Box sx={{ backgroundColor: theme.palette.background.paper, py: 8 }}>
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
          Account Profile
        </Typography>

        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} sm={4}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              <Avatar
                sx={{ width: 120, height: 120, mb: 2 }}
                src={profile?.avatar || "/default-avatar.png"}
              />
              <Typography variant="h6">{name}</Typography>
              <Typography variant="body2" color="textSecondary">
                {role}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {isVerified ? "Verified" : "Not Verified"}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={8}>
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Typography variant="h6">Personal Information</Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                <strong>Email:</strong> {email}
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                <strong>Phone:</strong> {profile?.phone || "Not Provided"}
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                <strong>Address:</strong> {profile?.address || "Not Provided"}
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                <strong>Date of Birth:</strong> {profile?.dob || "Not Provided"}
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                <strong>Gender:</strong> {profile?.gender || "Not Provided"}
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                <strong>Bio:</strong> {profile?.bio || "No Bio Available"}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleEditProfile}
          >
            Edit Profile
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
