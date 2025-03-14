/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import LoadingSpinner from "@/components/common/LoadingSpinner";
import {
  useProfileQuery,
  useUpdateProfileMutation,
} from "@/redux/api/profileApi";
import {
  Avatar,
  Box,
  Button,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const EditProfile = () => {
  const theme = useTheme();
  const router = useRouter();

  const { data: userProfile, isLoading, isError } = useProfileQuery({});
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    profile: {
      phone: "",
      address: "",
      dob: null,
      gender: null,
      bio: "",
      avatar: null as File | string | null,
    },
  });

  // Initialize form data with useEffect
  useEffect(() => {
    if (userProfile?.data) {
      const { name, email, profile } = userProfile.data;
      setFormData({
        name: name || "",
        email: email || "",
        profile: {
          phone: profile?.phone || "",
          address: profile?.address || "",
          dob: profile?.dob || "",
          gender: profile?.gender || "",
          bio: profile?.bio || "",
          avatar: profile?.avatar || null,
        },
      });
    }
  }, [userProfile]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Handle nested profile fields
    if (name.startsWith("profile.")) {
      const profileField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          [profileField]: value,
        },
      }));
    } else {
      // Handle top-level fields
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          avatar: file,
        },
      }));
    }
  };

  const handleGenderChange = (e: any) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        gender: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isoDob =
        formData.profile.dob !== null
          ? new Date(formData.profile.dob).toISOString()
          : null;

      const formDataToSubmit = new FormData();
      const updateData = {
        name: formData.name,
        email: formData.email,
        profile: {
          phone: formData.profile.phone,
          address: formData.profile.address,
          dob: isoDob,
          gender: formData.profile.gender || null,
          bio: formData.profile.bio,
        },
      };

      // Append JSON stringified profile data
      formDataToSubmit.append("data", JSON.stringify(updateData));

      // Append avatar if it's a File object
      if (formData.profile.avatar instanceof File) {
        formDataToSubmit.append("file", formData.profile.avatar);
      }

      await updateProfile(formDataToSubmit).unwrap();
      router.push("/profile");
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  if (isError || !userProfile?.data) {
    return <Typography color="error">Failed to load profile data.</Typography>;
  }

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
          Edit Profile
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            {/* Avatar Section */}
            <Grid
              item
              xs={12}
              sm={4}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Avatar
                sx={{ width: 120, height: 120, mb: 2 }}
                src={
                  formData.profile.avatar instanceof File
                    ? URL.createObjectURL(formData.profile.avatar)
                    : (formData.profile.avatar as string) ||
                      "/default-avatar.png"
                }
              />
              <Button variant="outlined" component="label">
                Change Avatar
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </Button>
            </Grid>

            {/* Form Fields */}
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={formData.email}
                sx={{ mb: 2 }}
                disabled
              />
              <TextField
                fullWidth
                label="Phone"
                name="profile.phone"
                value={formData.profile.phone}
                onChange={handleChange}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Address"
                name="profile.address"
                value={formData.profile.address}
                onChange={handleChange}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Date of Birth"
                name="profile.dob"
                type="date"
                value={formData.profile.dob}
                onChange={handleChange}
                sx={{ mb: 2 }}
                InputLabelProps={{
                  shrink: true,
                }}
              />

              {/* GENDER SELECT FIELD */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="gender-label">Gender</InputLabel>
                <Select
                  labelId="gender-label"
                  name="profile.gender"
                  value={formData.profile.gender}
                  label="Gender"
                  onChange={handleGenderChange}
                >
                  <MenuItem value="MALE">MALE</MenuItem>
                  <MenuItem value="FEMALE">FEMALE</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Bio"
                name="profile.bio"
                value={formData.profile.bio}
                onChange={handleChange}
                sx={{ mb: 2 }}
                multiline
                rows={4}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={isUpdating}
            >
              {isUpdating ? "Updating..." : "Save Changes"}
            </Button>
          </Box>
        </form>
      </Container>
    </Box>
  );
};

export default EditProfile;
