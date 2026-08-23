import React, { useState } from 'react';
import { Shield, Plus, Trash2, Edit, DollarSign, ShoppingBag, Clock, PackageCheck, X, Bot, Sparkles, Send } from 'lucide-react';
import type { Category, Order, Product } from '../types';
import { createProduct, updateProduct, deleteProduct, updateOrderStatus, deleteOrder, getAdminAIAnalytics } from '../api';

interface AdminDashboardProps {
  products: Product[];
  categories: Category[];
  orders: Order[];
  onRefreshData: () => void;
  t: any;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  categories,
  orders,
  onRefreshData,
  t,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'products' | 'ai'>('orders');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [pName, setPName] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pImage, setPImage] = useState('');
  const [pCategory, setPCategory] = useState('');

  // AI Admin State
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiHistory, setAiHistory] = useState<{ query: string; reply: string; engine?: string }[]>([
    {
      query: 'Initial System Digest',
      reply: 'مرحباً بك في مساعد الأعمال الذكي من RestaurantAI! يمكنك وسؤالي باللغة العربية أو الإنجليزية حول أداء المطعم، تحليل المبيعات، استدعاء الأدوات التحليلية وتوفير توصيات قائمة على بيانات قاعدة البيانات المباشرة.',
      engine: 'Google Gemini 3.6 Flash (Function Calling)',
    },
  ]);

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_price), 0);
  const pendingCount = orders.filter((o) => o.status === 'Pending').length;

  const sampleAdminQuestions = [
    'ما أكثر المنتجات مبيعًا؟',
    'حلل لي مبيعات هذا الشهر.',
    'ليش مبيعات البيتزا ضعيفة؟',
    'ما المنتج الذي تنصحني أركز عليه؟ ولماذا؟',
    'قارن مبيعات هذا الشهر بالشهر الماضي.',
    'أي تصنيف يحقق أعلى إيرادات؟',
    'ما المنتجات التي لا تحقق مبيعات جيدة؟',
    'إذا أردت زيادة الإيرادات، ماذا تقترح؟',
    'حلل أداء المطعم وأعطني 3 توصيات.',
    'ما أكثر منتج مبيعًا وهل يستحق أن أعمل عليه عرض؟',
  ];

  const handleAdminAISubmit = async (qText: string) => {
    if (!qText.trim()) return;
    setAiLoading(true);
    try {
      const res = await getAdminAIAnalytics(qText);
      setAiHistory((prev) => [...prev, { query: qText, reply: res.reply, engine: res.engine }]);
      setAiQuery('');
    } catch (err: any) {
      setAiHistory((prev) => [
        ...prev,
        { query: qText, reply: `⚠️ Error: ${err.message || 'Failed to fetch admin analytics'}` },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleOpenProductModal = (prod?: Product) => {
    if (prod) {
      setEditingProduct(prod);
      setPName(prod.name);
      setPDesc(prod.description || '');
      setPPrice(String(prod.price));
      setPImage(prod.image_url || '');
      setPCategory(prod.category_id || '');
    } else {
      setEditingProduct(null);
      setPName('');
      setPDesc('');
      setPPrice('');
      setPImage('');
      setPCategory(categories[0]?.id || '');
    }
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: pName,
        description: pDesc,
        price: parseFloat(pPrice),
        image_url: pImage,
        category_id: pCategory || undefined,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
      } else {
        await createProduct(payload);
      }
      setShowProductModal(false);
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to save product');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(id);
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete product');
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order? (Order items will be cascade deleted)')) return;
    try {
      await deleteOrder(orderId);
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete order');
    }
  };

  return (
    <section>
      <div className="section-header">
        <div>
          <h2 className="section-title">
            <Shield style={{ color: '#06b6d4' }} /> {t.adminTitle}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {t.adminSub}
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <span>{t.totalRevenue}</span>
            <DollarSign size={20} style={{ color: 'var(--accent-green)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-green)' }}>{totalRevenue.toFixed(2)} ₺</div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <span>{t.totalOrders}</span>
            <ShoppingBag size={20} style={{ color: 'var(--primary)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{orders.length}</div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <span>{t.pendingOrders}</span>
            <Clock size={20} style={{ color: '#eab308' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#eab308' }}>{pendingCount}</div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <span>{t.menuProducts}</span>
            <PackageCheck size={20} style={{ color: '#06b6d4' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{products.length}</div>
        </div>
      </div>

      {/* Admin Subtabs */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
        <button
          className={`btn ${activeSubTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveSubTab('orders')}
        >
          {t.ordersMgmt} ({orders.length})
        </button>
        <button
          className={`btn ${activeSubTab === 'products' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveSubTab('products')}
        >
          {t.productsMgmt} ({products.length})
        </button>
        <button
          className={`btn ${activeSubTab === 'ai' ? 'btn-ai' : 'btn-secondary'}`}
          onClick={() => setActiveSubTab('ai')}
          style={{ color: activeSubTab === 'ai' ? '#fff' : '#ec4899' }}
        >
          <Bot size={18} /> {t.aiAdminAssistant}
        </button>
      </div>

      {/* AI Business Assistant Section */}
      {activeSubTab === 'ai' && (
        <div className="glass-card" style={{ padding: '25px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div className="ai-avatar">
              <Bot size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>{t.aiExecutiveTitle}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                {t.aiExecutiveSub}
              </p>
            </div>
          </div>

          {/* Quick sample chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
            {sampleAdminQuestions.map((chipText, i) => (
              <button key={i} className="chip" onClick={() => handleAdminAISubmit(chipText)}>
                💡 {chipText}
              </button>
            ))}
          </div>

          {/* Chat History Box */}
          <div
            style={{
              maxHeight: '420px',
              overflowY: 'auto',
              background: 'rgba(15, 23, 42, 0.85)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              border: '1px solid var(--border-light)',
              marginBottom: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
            }}
          >
            {aiHistory.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {idx > 0 && (
                  <div style={{ alignSelf: 'flex-end', background: 'rgba(139, 92, 246, 0.25)', color: '#fff', padding: '8px 14px', borderRadius: '12px 12px 0 12px', fontSize: '0.9rem', maxWidth: '80%' }}>
                    {item.query}
                  </div>
                )}
                <div style={{ alignSelf: 'flex-start', background: 'rgba(255, 255, 255, 0.04)', color: 'var(--text-main)', padding: '14px 18px', borderRadius: '12px 12px 12px 0', fontSize: '0.95rem', border: '1px solid var(--border-light)', whiteSpace: 'pre-line', maxWidth: '90%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px' }}>
                    <span style={{ fontWeight: 700, color: '#ec4899', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles size={14} /> Gemini Executive Advisor
                    </span>
                    {item.engine && (
                      <span style={{ fontSize: '0.75rem', background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', padding: '2px 8px', borderRadius: '9999px' }}>
                        {item.engine}
                      </span>
                    )}
                  </div>
                  {item.reply}
                </div>
              </div>
            ))}
            {aiLoading && (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px' }}>
                <Sparkles className="animate-spin" size={18} style={{ color: '#ec4899' }} /> Gemini LLM is selecting database tools and analyzing PostgreSQL...
              </div>
            )}
          </div>

          {/* AI Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAdminAISubmit(aiQuery);
            }}
            style={{ display: 'flex', gap: '10px' }}
          >
            <input
              type="text"
              className="form-input"
              placeholder={t.askGeminiPlaceholder}
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
            />
            <button type="submit" className="btn btn-ai" disabled={aiLoading}>
              <Send size={16} /> {t.askGeminiBtn}
            </button>
          </form>
        </div>
      )}

      {/* Orders Management View */}
      {activeSubTab === 'orders' && (
        <div className="glass-card" style={{ padding: '20px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <th style={{ padding: '12px' }}>{t.orderId}</th>
                <th style={{ padding: '12px' }}>الأصناف</th>
                <th style={{ padding: '12px' }}>{t.orderTotal}</th>
                <th style={{ padding: '12px' }}>{t.orderStatus}</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '14px', fontWeight: 700 }}>#{o.id.slice(0, 8)}</td>
                  <td style={{ padding: '14px', fontSize: '0.9rem' }}>
                    {o.items.map((item, i) => (
                      <div key={i}>
                        {item.quantity}x {item.product?.name || 'Dish'} ({item.price}₺)
                      </div>
                    ))}
                  </td>
                  <td style={{ padding: '14px', fontWeight: 700, color: 'var(--primary)' }}>{o.total_price} ₺</td>
                  <td style={{ padding: '14px' }}>
                    <select
                      value={o.status}
                      onChange={(e) => handleStatusChange(o.id, e.target.value)}
                      className="form-select"
                      style={{ padding: '6px 12px', width: 'auto', fontSize: '0.85rem', fontWeight: 600 }}
                    >
                      <option value="Pending">Pending (معلق)</option>
                      <option value="Confirmed">Confirmed (مؤكد)</option>
                      <option value="Preparing">Preparing (جاري التحضير)</option>
                      <option value="Ready">Ready (جاهز)</option>
                      <option value="Delivered">Delivered (تم التوصيل)</option>
                      <option value="Cancelled">Cancelled (ملغي)</option>
                    </select>
                  </td>
                  <td style={{ padding: '14px', textAlign: 'right' }}>
                    <button className="btn btn-danger" style={{ padding: '6px 12px' }} onClick={() => handleDeleteOrder(o.id)}>
                      <Trash2 size={14} /> {t.delete}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Products Management View */}
      {activeSubTab === 'products' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
            <button className="btn btn-primary" onClick={() => handleOpenProductModal()}>
              <Plus size={18} /> {t.addNewDish}
            </button>
          </div>

          <div className="glass-card" style={{ padding: '20px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <th style={{ padding: '12px' }}>{t.dishName}</th>
                  <th style={{ padding: '12px' }}>{t.price}</th>
                  <th style={{ padding: '12px' }}>{t.category}</th>
                  <th style={{ padding: '12px' }}>{t.orderStatus}</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {p.image_url && <img src={p.image_url} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />}
                      <div>
                        <div style={{ fontWeight: 700 }}>{p.name}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{p.description}</div>
                      </div>
                    </td>
                    <td style={{ padding: '14px', fontWeight: 700, color: 'var(--primary)' }}>{p.price} ₺</td>
                    <td style={{ padding: '14px', color: 'var(--text-muted)' }}>{p.category?.name || 'General'}</td>
                    <td style={{ padding: '14px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, background: p.is_available ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: p.is_available ? '#10b981' : '#ef4444' }}>
                        {p.is_available ? t.available : t.unavailable}
                      </span>
                    </td>
                    <td style={{ padding: '14px', textAlign: 'right' }}>
                      <button className="btn btn-secondary" style={{ padding: '6px 10px', marginRight: '6px' }} onClick={() => handleOpenProductModal(p)}>
                        <Edit size={14} />
                      </button>
                      <button className="btn btn-danger" style={{ padding: '6px 10px' }} onClick={() => handleDeleteProduct(p.id)}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {showProductModal && (
        <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{editingProduct ? `${t.edit} ${editingProduct.name}` : t.addNewDish}</h3>
              <button onClick={() => setShowProductModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct}>
              <div className="form-group">
                <label className="form-label">{t.dishName}</label>
                <input type="text" className="form-input" required value={pName} onChange={(e) => setPName(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">{t.price}</label>
                <input type="number" step="0.01" className="form-input" required value={pPrice} onChange={(e) => setPPrice(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">{t.category}</label>
                <select className="form-select" value={pCategory} onChange={(e) => setPCategory(e.target.value)}>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">رابط الصورة (Image URL)</label>
                <input type="text" className="form-input" value={pImage} onChange={(e) => setPImage(e.target.value)} placeholder="https://..." />
              </div>

              <div className="form-group">
                <label className="form-label">الوصف التفصيلي (Description)</label>
                <textarea className="form-textarea" rows={3} value={pDesc} onChange={(e) => setPDesc(e.target.value)} />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                {t.saveDish}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
