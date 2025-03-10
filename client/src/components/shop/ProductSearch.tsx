"use client";

import { Search } from "@mui/icons-material";
import { TextField } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const ProductSearch = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("searchTerm") || "";
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const params = new URLSearchParams(searchParams);
    if (searchTerm) {
      params.set("searchTerm", searchTerm);
    } else {
      params.delete("searchTerm");
    }

    params.set("page", "1");

    router.push(`/shop?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} style={{ flexGrow: 1 }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search products..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: <Search color="action" />,
        }}
      />
    </form>
  );
};

export default ProductSearch;
