import { Menu, MenuItem, useTheme } from "@mui/material";
import Link from "next/link";

const ProfileMenu = ({
  anchorEl,
  openProfile,
  handleClose,
  handleLogout,
}: {
  anchorEl: HTMLElement | null;
  openProfile: boolean;
  handleClose: () => void;
  handleLogout: () => void;
}) => {
  const theme = useTheme();

  return (
    <Menu
      anchorEl={anchorEl}
      open={openProfile}
      onClose={handleClose}
      sx={{ mt: 1 }}
      PaperProps={{
        sx: {
          minWidth: 200,
          borderRadius: 2,
          boxShadow: theme.shadows[4],
        },
      }}
    >
      <MenuItem onClick={handleClose} component={Link} href="/profile">
        My Account
      </MenuItem>
      <MenuItem onClick={handleClose} component={Link} href="/order">
        My Orders
      </MenuItem>
      <MenuItem onClick={handleLogout}>Sign Out</MenuItem>
    </Menu>
  );
};

export default ProfileMenu;
