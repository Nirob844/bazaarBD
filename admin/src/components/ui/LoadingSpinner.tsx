import { Backdrop, Box, CircularProgress, Typography } from "@mui/material";

interface LoadingSpinnerProps {
  open?: boolean;
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  open = true,
  message = "Loading...",
}) => {
  return (
    <Backdrop
      sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
      open={open}
    >
      <Box
        sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        <CircularProgress color="primary" />
        {message && (
          <Typography variant="h6" sx={{ mt: 2 }}>
            {message}
          </Typography>
        )}
      </Box>
    </Backdrop>
  );
};

export default LoadingSpinner;
