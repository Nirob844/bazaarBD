import { ApiResponse } from "@/types/product";

export const fetchProducts = async ({
  page = 1,
  limit = 10,
  sortBy = "price",
  sortOrder = "asc",
  categoryId = "",
  inventoryId = "",
  promotionId = "",
  searchTerm = "",
}: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
  categoryId?: string;
  inventoryId?: string;
  promotionId?: string;
  searchTerm?: string;
}): Promise<ApiResponse> => {
  const url = new URL(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/products`);

  url.searchParams.append("page", page.toString());
  url.searchParams.append("limit", limit.toString());
  url.searchParams.append("sortBy", sortBy);
  url.searchParams.append("sortOrder", sortOrder);

  if (categoryId) {
    url.searchParams.append("categoryId", categoryId);
  }
  if (inventoryId) {
    url.searchParams.append("inventoryId", inventoryId);
  }
  if (promotionId) {
    url.searchParams.append("promotionId", promotionId);
  }
  if (searchTerm) {
    url.searchParams.append("searchTerm", searchTerm);
  }

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to fetch products");
  const data = await res.json();
  return data;
};

export const fetchProduct = async (id: string) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/products/${id}`,
      {
        cache: "no-cache",
      }
    );
    const { data } = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
};
