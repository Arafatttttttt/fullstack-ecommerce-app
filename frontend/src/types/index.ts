export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[] | null; // Array of image URLs/paths
  category: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
  averageRating?: number; // Average rating from reviews
  totalReviews?: number; // Total number of reviews
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  product: Product;
  createdAt: string;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  product: Product;
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  total: number;
  status: string;
  paymentId: string | null;
  cancellationReason: string | null;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string | null;
  user: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProductReviewsResponse {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  canReview: boolean;
}
