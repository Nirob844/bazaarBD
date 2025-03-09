import { ApiResponse } from "@/types/product";

export const fetchProducts = async ({
  page = 1,
  limit = 10,
  sortBy = "price",
  sortOrder = "asc",
  categoryId = "",
}: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
  categoryId?: string;
}): Promise<ApiResponse> => {
  const url = new URL(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/products`);

  // Add query parameters
  url.searchParams.append("page", page.toString());
  url.searchParams.append("limit", limit.toString());
  url.searchParams.append("sortBy", sortBy);
  url.searchParams.append("sortOrder", sortOrder);
  if (categoryId) {
    url.searchParams.append("categoryId", categoryId);
  }

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to fetch products");
  const data = await res.json();
  return data;
};
