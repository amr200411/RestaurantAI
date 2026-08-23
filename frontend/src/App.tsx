import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { MenuGrid } from './components/MenuGrid';
import { AIModal } from './components/AIModal';
import { CartDrawer } from './components/CartDrawer';
import { OrdersView } from './components/OrdersView';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';

import type { Category, Product, CartItem, Order, User } from './types';
import { translations } from './i18n';
import type { Language } from './i18n';

import {
  fetchCategories,
  fetchProducts,
  fetchMyOrders,
  fetchAllOrders,
  createOrder,
  getCurrentUser,
} from './api';

export function App() {
  const [activeTab, setActiveTab] = useState<'menu' | 'orders' | 'admin'>('menu');
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Language State (Default: 'ar')
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('restaurant_ai_lang');
    return (saved as Language) || 'ar';
  });

  const t = translations[lang];

  const handleToggleLang = () => {
    setLang((prev) => {
      const nextLang = prev === 'ar' ? 'en' : 'ar';
      localStorage.setItem('restaurant_ai_lang', nextLang);
      return nextLang;
    });
  };

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // AI Modal State
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [aiInitialQuery, setAiInitialQuery] = useState('');

  // Auth Modal State
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Orders State
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [adminOrders, setAdminOrders] = useState<Order[]>([]);

  // Load initial data
  const loadData = async () => {
    try {
      const [cats, prods] = await Promise.all([fetchCategories(), fetchProducts()]);
      setCategories(cats);
      setProducts(prods);
    } catch (err) {
      console.error('Error fetching menu data:', err);
    }
  };

  const loadUserAndOrders = async () => {
    const token = localStorage.getItem('restaurant_ai_token');
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const userData = await getCurrentUser();
      setUser(userData);

      const ordersData = await fetchMyOrders();
      setMyOrders(ordersData);

      if (userData.role === 'admin') {
        const allOrders = await fetchAllOrders();
        setAdminOrders(allOrders);
      }
    } catch (err) {
      console.error('Failed restoring auth session:', err);
      localStorage.removeItem('restaurant_ai_token');
      setUser(null);
    }
  };

  useEffect(() => {
    loadData();
    loadUserAndOrders();
  }, []);

  // Filter products by selected category and search term
  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory ? p.category_id === selectedCategory : true;
    const matchesSearch = searchQuery
      ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    return matchesCat && matchesSearch;
  });

  // Cart Actions
  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleCheckout = async () => {
    if (!user) {
      setIsCartOpen(false);
      setIsAuthOpen(true);
      throw new Error(lang === 'ar' ? 'يرجى تسجيل الدخول أولاً لإتمام الطلب.' : 'Please sign in to place an order.');
    }

    const orderPayload = cart.map((item) => ({
      product_id: item.product.id,
      quantity: item.quantity,
    }));

    await createOrder(orderPayload, user.id);
    setCart([]);
    await loadUserAndOrders();
    setActiveTab('orders');
  };

  const handleAskAI = (query: string) => {
    setAiInitialQuery(query);
    setIsAIOpen(true);
  };

  const handleAuthSuccess = (loggedUser: User, token: string) => {
    localStorage.setItem('restaurant_ai_token', token);
    setUser(loggedUser);
    loadUserAndOrders();
  };

  const handleLogout = () => {
    localStorage.removeItem('restaurant_ai_token');
    setUser(null);
    setMyOrders([]);
    setAdminOrders([]);
    setActiveTab('menu');
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="app-container">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAI={() => {
          setAiInitialQuery('');
          setIsAIOpen(true);
        }}
        onOpenAuth={() => setIsAuthOpen(true)}
        user={user}
        onLogout={handleLogout}
        lang={lang}
        onToggleLang={handleToggleLang}
        t={t}
      />

      <main>
        {activeTab === 'menu' && (
          <>
            <HeroSection onAskAI={handleAskAI} t={t} />
            <MenuGrid
              categories={categories}
              products={filteredProducts}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onAddToCart={handleAddToCart}
              t={t}
            />
          </>
        )}

        {activeTab === 'orders' && <OrdersView orders={myOrders} t={t} />}

        {activeTab === 'admin' && (
          <AdminDashboard
            products={products}
            categories={categories}
            orders={adminOrders}
            onRefreshData={() => {
              loadData();
              loadUserAndOrders();
            }}
            t={t}
          />
        )}
      </main>

      <AIModal
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        initialQuery={aiInitialQuery}
        onAddToCart={handleAddToCart}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={handleCheckout}
        t={t}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
        t={t}
      />
    </div>
  );
}

export default App;
