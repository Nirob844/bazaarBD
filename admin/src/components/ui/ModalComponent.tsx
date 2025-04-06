import { Box, Modal, Typography } from "@mui/material";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "small" | "medium" | "large"; // Optional size prop
}

const ModalComponent: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  size = "medium", // Default to medium
}) => {
  const getWidth = () => {
    switch (size) {
      case "small":
        return 300;
      case "large":
        return 800;
      case "medium":
      default:
        return 500;
    }
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="modal-title">
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: getWidth(),
          bgcolor: "background.paper",
          boxShadow: 24,
          borderRadius: 2,
          p: 4,
        }}
      >
        <Typography id="modal-title" variant="h6" component="h2" mb={2}>
          {title}
        </Typography>
        {children}
      </Box>
    </Modal>
  );
};

export default ModalComponent;
