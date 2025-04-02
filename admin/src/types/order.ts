import { Product } from "./product";

// Individual item in an order
export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: string;
  product: Product;
}

// The entire order object
export interface Order {
  id: string;
  userId: string;
  total: string; // total price of the order
  status: "PENDING" | "DELIVERED" | "CANCELLED"; // extend if needed
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}
