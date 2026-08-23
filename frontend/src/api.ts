import type { AuthResponse, Category, Order, Product, User, AIResponse, AIAdminResponse } from './types';

const API_BASE_URL = 'http://127.0.0.1:8000';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('restaurant_ai_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Login failed');
  }
  return res.json();
}

export async function registerUser(name: string, email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Registration failed');
  }
  return res.json();
}


export async function getCurrentUser(): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) {
    throw new Error('Failed to fetch user');
  }
  return res.json();
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE_URL}/categories/`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

export async function fetchProducts(categoryId?: string, search?: string): Promise<Product[]> {
  const params = new URLSearchParams();
  if (categoryId) params.append('category_id', categoryId);
  if (search) params.append('search', search);

  const url = `${API_BASE_URL}/products/?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function createProduct(productData: Partial<Product>): Promise<Product> {
  const res = await fetch(`${API_BASE_URL}/products/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(productData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to create product');
  }
  return res.json();
}

export async function updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
  const res = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(productData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to update product');
  }
  return res.json();
}

export async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to delete product');
  }
}

export async function createOrder(items: { product_id: string; quantity: number }[], userId?: string): Promise<Order> {
  const res = await fetch(`${API_BASE_URL}/orders/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ user_id: userId, items }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to create order');
  }
  return res.json();
}

export async function fetchMyOrders(): Promise<Order[]> {
  const res = await fetch(`${API_BASE_URL}/orders/my-orders`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
}

export async function fetchAllOrders(): Promise<Order[]> {
  const res = await fetch(`${API_BASE_URL}/orders/`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error('Failed to fetch all orders');
  return res.json();
}

export async function updateOrderStatus(orderId: string, status: string): Promise<Order> {
  const res = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to update order status');
  }
  return res.json();
}

export async function deleteOrder(orderId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
    method: 'DELETE',
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to delete order');
  }
}

export async function getAIRecommendations(query: string): Promise<AIResponse> {
  const res = await fetch(`${API_BASE_URL}/ai/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'AI service error');
  }
  return res.json();
}

export async function getAdminAIAnalytics(query: string): Promise<AIAdminResponse> {
  const res = await fetch(`${API_BASE_URL}/ai/admin-analytics`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Admin AI service error');
  }
  return res.json();
}

