import React, { useState, useEffect } from 'react';
import { Bot, X, Sparkles, Plus, Check } from 'lucide-react';
import type { Product } from '../types';
import { getAIRecommendations } from '../api';

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  onAddToCart: (product: Product) => void;
}

export const AIModal: React.FC<AIModalProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
  onAddToCart,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState<string | null>(null);
  const [recommended, setRecommended] = useState<Product[]>([]);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const res = await getAIRecommendations(searchQuery);
      setReply(res.reply);
      setRecommended(res.recommended_products);
    } catch (err: any) {
      setReply('عذراً، حدث خطأ أثناء الاتصال بالذكاء الاصطناعي.');
      setRecommended([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && initialQuery) {
      setQuery(initialQuery);
      handleSearch(initialQuery);
    }
  }, [isOpen, initialQuery]);

  if (!isOpen) return null;

  const handleAdd = (prod: Product) => {
    onAddToCart(prod);
    setAddedIds((prev) => ({ ...prev, [prod.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [prod.id]: false }));
    }, 1500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={24} />
        </button>

        <div className="ai-modal-header">
          <div className="ai-avatar">
            <Bot size={26} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>RestaurantAI Assistant</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Ask anything about our menu, budget meals, or dietary options</p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(query);
          }}
          style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}
        >
          <input
            type="text"
            className="form-input"
            placeholder="Type your question e.g. 'وجبة لشخصين بأقل من 300'..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-ai" disabled={loading}>
            {loading ? <Sparkles className="animate-spin" size={18} /> : 'Ask AI'}
          </button>
        </form>

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <Sparkles size={32} style={{ color: '#ec4899', margin: '0 auto 10px auto', display: 'block' }} />
            <p>AI is inspecting the menu and crafting recommendations...</p>
          </div>
        )}

        {!loading && reply && (
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <p style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '15px' }}>
              🤖 {reply}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '15px' }}>
              {recommended.map((prod) => (
                <div
                  key={prod.id}
                  style={{
                    background: 'rgba(15, 23, 42, 0.8)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                    border: '1px solid var(--border-light)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    {prod.image_url && (
                      <img
                        src={prod.image_url}
                        alt={prod.name}
                        style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }}
                      />
                    )}
                    <h4 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>{prod.name}</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '10px' }}>{prod.description}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                    <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}>{prod.price} ₺</span>
                    <button
                      className="btn btn-primary"
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      onClick={() => handleAdd(prod)}
                    >
                      {addedIds[prod.id] ? <Check size={14} /> : <Plus size={14} />}
                      {addedIds[prod.id] ? 'Added' : 'Add'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
