import React, { useState } from 'react';
import { Search, Plus, Check, ShoppingBag } from 'lucide-react';
import type { Category, Product } from '../types';

interface MenuGridProps {
  categories: Category[];
  products: Product[];
  selectedCategory: string | null;
  onSelectCategory: (id: string | null) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onAddToCart: (product: Product) => void;
  t: any;
}

export const MenuGrid: React.FC<MenuGridProps> = ({
  categories,
  products,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onAddToCart,
  t,
}) => {
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const handleAdd = (product: Product) => {
    onAddToCart(product);
    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1200);
  };

  return (
    <section>
      <div className="section-header">
        <div>
          <h2 className="section-title">{t.allCategories}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Freshly prepared with premium ingredients
          </p>
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '38px', borderRadius: '9999px' }}
            placeholder={t.searchDishes}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="category-pills" style={{ marginBottom: '30px' }}>
        <button
          className={`category-pill ${selectedCategory === null ? 'active' : ''}`}
          onClick={() => onSelectCategory(null)}
        >
          {t.allCategories}
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`category-pill ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => onSelectCategory(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <ShoppingBag size={48} style={{ margin: '0 auto 15px auto', opacity: 0.5 }} />
          <h3>No products found</h3>
          <p>Try clearing your search or selecting another category.</p>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <div key={product.id} className="glass-card product-card">
              <div className="product-img-wrapper">
                <img
                  src={product.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'}
                  alt={product.name}
                  className="product-img"
                />
                <div className="product-price-badge">{product.price} ₺</div>
              </div>

              <div className="product-body">
                <h3 className="product-title">{product.name}</h3>
                <p className="product-desc">{product.description || 'Delicious handcrafted culinary item.'}</p>

                <button
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  disabled={!product.is_available}
                  onClick={() => handleAdd(product)}
                >
                  {addedIds[product.id] ? <Check size={18} /> : <Plus size={18} />}
                  {addedIds[product.id] ? 'Added' : product.is_available ? t.addToCart : t.unavailable}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
