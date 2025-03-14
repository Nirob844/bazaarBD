export interface Promotion {
  type: string;
  discountPercentage: string;
}

export interface ImageUrl {
  id: string;
  url: string;
  altText: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  sku: string;
  discountPercentage: string | null;
  status: string;
  category: {
    name: string;
  };
  imageUrls: ImageUrl[];
  promotions: Promotion[];
  inventory: {
    stock: number;
  };
}

export interface Meta {
  total: number;
  page: number;
  limit: number;
}

export interface ApiResponse {
  meta: Meta;
  data: Product[];
}
