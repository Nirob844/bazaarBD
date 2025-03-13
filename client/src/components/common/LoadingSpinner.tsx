import { Box, CircularProgress } from "@mui/material";

export default function LoadingSpinner() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        minHeight: "200px",
        width: "100%",
      }}
    >
      <CircularProgress size={60} thickness={5} />
    </Box>
  );
}
