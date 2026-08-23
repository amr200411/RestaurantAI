export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  is_active: boolean;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_available: boolean;
  category_id?: string;
  category?: Category;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  id?: string;
  product_id: string;
  quantity: number;
  price: number;
  product?: Product;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Preparing' | 'Ready' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  total_price: number;
  items: OrderItem[];
  created_at?: string;
}

export interface AIResponse {
  reply: string;
  recommended_products: Product[];
}

export interface AIAdminResponse {
  reply: string;
  metrics?: Record<string, any>;
  engine?: string;
}


export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}
