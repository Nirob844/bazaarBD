import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Typography,
  useTheme,
} from "@mui/material";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import loginImage from "../../assets/images/login.png"; // Correct Image Import
import Form from "../../components/forms/Form";
import FormInput from "../../components/forms/FormInput";
import { useUserLoginMutation } from "../../redux/api/authApi";
import { useAppDispatch } from "../../redux/hooks";
import { setUser, TUser } from "../../redux/slice/authSlice";
import { decodeToken } from "../../utils/jwt";

// Define the data structure
interface LoginData {
  email: string;
  password: string;
}

const Login = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [userLogin, { isLoading }] = useUserLoginMutation();

  const onSubmit = async (data: LoginData) => {
    try {
      const res = await userLogin(data).unwrap();
      if (res?.data) {
        const user = decodeToken(res.data.accessToken) as TUser;
        dispatch(setUser({ user: user, token: res.data.accessToken }));
        const role = user.role;
        if (role) {
          toast.success(res?.data?.message || "Login Successful");
          navigate(`/${role.toLowerCase()}/dashboard`);
        }
      } else {
        toast.error(res?.error?.data?.message || "Login failed");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "An error occurred during login");
      } else {
        toast.error("An unknown error occurred during login");
      }
    }
  };

  const defaultValues = {
    email: "",
    password: "",
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            boxShadow: 6,
            borderRadius: 2,
            overflow: "hidden",
            backgroundColor: theme.palette.background.paper,
          }}
        >
          {/* Left Image Section */}
          <Box
            sx={{
              flex: 1,
              display: { xs: "none", md: "block" },
              backgroundColor: theme.palette.primary.light,
            }}
          >
            <Box
              component="img"
              src={loginImage}
              alt="Login Illustration"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </Box>

          {/* Right Form Section */}
          <Box
            sx={{
              flex: 1,
              p: { xs: 4, md: 6 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: theme.palette.background.paper,
            }}
          >
            <Box sx={{ width: "100%", maxWidth: 400 }}>
              {/* User Icon */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mb: 2,
                }}
              >
                <AccountCircleIcon
                  sx={{ fontSize: 50, color: theme.palette.primary.main }}
                />
              </Box>

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

              <Form submitHandler={onSubmit} defaultValues={defaultValues}>
                <FormInput
                  name="email"
                  type="email"
                  label="Email Address"
                  required
                />
                <FormInput
                  name="password"
                  type="password"
                  label="Password"
                  required
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isLoading}
                  startIcon={
                    isLoading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : null
                  }
                  sx={{
                    mt: 3,
                    mb: 2,
                    py: 1.5,
                    fontSize: "1rem",
                    fontWeight: "bold",
                    borderRadius: "8px",
                  }}
                >
                  Log In
                </Button>
              </Form>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;
