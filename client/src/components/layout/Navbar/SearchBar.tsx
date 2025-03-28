import { Search } from "@mui/icons-material";
import { InputBase, alpha, styled, useTheme } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";

const SearchField = styled(InputBase)(({ theme }) => ({
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 2),
    borderRadius: 30,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    "&:hover, &:focus": {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
  },
}));

const SearchBar = ({
  searchTerm,
  setSearchTerm,
}: {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}) => {
  const theme = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchTerm) params.set("searchTerm", searchTerm);
    else params.delete("searchTerm");

    params.set("page", "1");
    router.push(`/shop?${params.toString()}`);
    setSearchTerm("");
  };

  return (
    <form
      onSubmit={handleSearch}
      style={{
        flexGrow: 1,
        display: "flex",
        alignItems: "center",
        maxWidth: 400,
        margin: "0 32px",
      }}
    >
      <SearchField
        fullWidth
        placeholder="Search products..."
        sx={{ color: theme.palette.common.white }}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        startAdornment={
          <Search sx={{ color: theme.palette.common.white, mr: 1 }} />
        }
      />
    </form>
  );
};

export default SearchBar;
