import {
  Box,
  FormControl,
  MenuItem,
  Pagination,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";

interface PaginationProps {
  page: number;
  rowsPerPage: number;
  totalItems: number;
  onPageChange: (event: React.ChangeEvent<unknown>, page: number) => void;
  onRowsPerPageChange: (event: SelectChangeEvent<number>) => void;
}

const PaginationComponent: React.FC<PaginationProps> = ({
  page,
  rowsPerPage,
  totalItems,
  onPageChange,
  onRowsPerPageChange,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mt: 3,
      }}
    >
      {/* Total Items on the Left */}
      <Typography variant="body2" sx={{ ml: 2 }}>
        {`Total: ${totalItems}`}
      </Typography>

      {/* Pagination Center */}
      <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
        <Pagination
          count={Math.ceil(totalItems / rowsPerPage)}
          page={page}
          onChange={onPageChange}
          variant="outlined"
          shape="rounded"
        />
      </Box>

      {/* Rows per page selector on the Right */}
      {totalItems && (
        <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
          <Typography variant="body2" sx={{ mr: 2 }}>
            Per page
          </Typography>
          <FormControl size="small">
            <Select
              labelId="rows-per-page-select-label"
              id="rows-per-page-select"
              value={rowsPerPage}
              onChange={onRowsPerPageChange}
              sx={{ minWidth: 100 }}
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </Select>
          </FormControl>
        </Box>
      )}
    </Box>
  );
};

export default PaginationComponent;
