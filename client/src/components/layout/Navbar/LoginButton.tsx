import { Button, alpha, useTheme } from "@mui/material";
import Link from "next/link";

const LoginButton = () => {
  const theme = useTheme();

  return (
    <Button
      component={Link}
      href="/login"
      sx={{
        color: theme.palette.common.white,
        backgroundColor: theme.palette.secondary.main,
        "&:hover": {
          backgroundColor: alpha(theme.palette.secondary.main, 0.8),
        },
        borderRadius: 3,
        textTransform: "none",
        fontWeight: 500,
        padding: "8px 16px",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
        transition: "background-color 0.3s ease, box-shadow 0.3s ease",
      }}
    >
      Login
    </Button>
  );
};

export default LoginButton;
