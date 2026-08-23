import React, { useState } from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, CheckCircle2, ArrowRight } from 'lucide-react';
import type { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => Promise<void>;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleCheckoutSubmit = async () => {
    if (items.length === 0) return;
    setSubmitting(true);
    try {
      await onCheckout();
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      alert('Failed to place order. Please try signing in first.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingBag style={{ color: 'var(--primary)' }} size={24} />
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Your Order Cart</h2>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        {success ? (
          <div style={{ textAlign: 'center', margin: 'auto 0' }}>
            <CheckCircle2 size={64} style={{ color: 'var(--accent-green)', margin: '0 auto 15px auto' }} />
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '10px' }}>Order Placed Successfully!</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Your order is being sent directly to the kitchen.</p>
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', margin: 'auto 0', color: 'var(--text-muted)' }}>
            <ShoppingBag size={54} style={{ margin: '0 auto 15px auto', opacity: 0.3 }} />
            <h3>Your cart is empty</h3>
            <p style={{ fontSize: '0.9rem', marginTop: '8px' }}>Select delicious dishes from our menu to begin.</p>
          </div>
        ) : (
          <>
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
              {items.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 0',
                    borderBottom: '1px solid var(--border-light)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {product.image_url && (
                      <img src={product.image_url} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} />
                    )}
                    <div>
                      <h4 style={{ fontWeight: 600, fontSize: '0.95rem' }}>{product.name}</h4>
                      <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem' }}>{product.price} ₺</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '4px 8px', borderRadius: '6px' }}
                      onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                    >
                      <Minus size={14} />
                    </button>
                    <span style={{ fontWeight: 700, width: '20px', textAlign: 'center' }}>{quantity}</span>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '4px 8px', borderRadius: '6px' }}
                      onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', marginLeft: '6px' }}
                      onClick={() => onRemoveItem(product.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ paddingTop: '20px', borderTop: '1px solid var(--border-light)' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Payment Method</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-green)' }}>💵 Cash on Delivery</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Amount</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>{total.toFixed(2)} ₺</span>
              </div>

              <button
                className="btn btn-primary"
                style={{ width: '100%', padding: '14px', fontSize: '1.05rem' }}
                disabled={submitting}
                onClick={handleCheckoutSubmit}
              >
                {submitting ? 'Placing Order...' : 'Confirm & Place Order'}
                <ArrowRight size={18} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
