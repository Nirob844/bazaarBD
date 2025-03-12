export const fetchProducts = async (params: {
  [key: string]: string | number | boolean | undefined;
}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      query.append(key, String(value));
    }
  });

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/products?${query}`
  );
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
