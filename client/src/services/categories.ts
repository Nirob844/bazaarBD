import { Category } from "@/types/category";

export const fetchCategories = async (): Promise<Category[]> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/categories`
  );
  if (!res.ok) throw new Error("Failed to fetch categories");
  const data = await res.json();
  return data.data;
};
