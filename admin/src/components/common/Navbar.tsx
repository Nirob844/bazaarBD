import { AppBar, Toolbar, Typography } from "@mui/material";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <AppBar color="primary" elevation={1} sx={{ margin: 0 }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography
          variant="h6"
          component={Link}
          to="/login"
          sx={{
            color: "white",
            textDecoration: "none",
            "&:hover": {
              textDecoration: "underline",
            },
          }}
        >
          BazarBD
        </Typography>

        {/* <Box>
          <Button color="inherit" component={Link} to="/login">
            Sign in
          </Button>
        </Box> */}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
