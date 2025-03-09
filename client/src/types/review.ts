export interface User {
  name: string;
  email: string;
}

export interface Review {
  id: string;
  comment?: string;
  rating: string;
  user: User;
}
