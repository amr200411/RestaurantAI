import React, { useState } from 'react';
import { X, ShieldAlert } from 'lucide-react';
import { loginUser, registerUser } from '../api';
import type { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User, token: string) => void;
  t: any;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess, t }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const res = await loginUser(email, password);
        onSuccess(res.user, res.access_token);
      } else {
        const res = await registerUser(name, email, password);
        onSuccess(res.user, res.access_token);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoCustomer = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await loginUser('customer@restaurant.ai', 'customer123');
      onSuccess(res.user, res.access_token);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '18px', right: '18px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{isLogin ? t.signIn : t.createAccount}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
            {isLogin ? t.welcomeBack : t.createAccount}
          </p>
        </div>

        {/* Quick Demo Customer Button */}
        <div style={{ marginBottom: '20px' }}>
          <button className="btn btn-secondary" style={{ width: '100%', fontSize: '0.85rem' }} onClick={handleQuickDemoCustomer}>
            👤 {t.quickDemoCustomer}
          </button>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', marginBottom: '20px' }}>
          <button
            style={{ flex: 1, padding: '10px', background: 'transparent', border: 'none', color: isLogin ? 'var(--primary)' : 'var(--text-muted)', borderBottom: isLogin ? '2px solid var(--primary)' : 'none', fontWeight: 600, cursor: 'pointer' }}
            onClick={() => setIsLogin(true)}
          >
            {t.signIn}
          </button>
          <button
            style={{ flex: 1, padding: '10px', background: 'transparent', border: 'none', color: !isLogin ? 'var(--primary)' : 'var(--text-muted)', borderBottom: !isLogin ? '2px solid var(--primary)' : 'none', fontWeight: 600, cursor: 'pointer' }}
            onClick={() => setIsLogin(false)}
          >
            {t.createAccount}
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">{t.nameLabel}</label>
              <input type="text" className="form-input" required value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: أحمد علي" />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">{t.emailLabel}</label>
            <input type="email" className="form-input" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" />
          </div>

          <div className="form-group">
            <label className="form-label">{t.passwordLabel}</label>
            <input type="password" className="form-input" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
            {loading ? '...' : isLogin ? t.signIn : t.createAccount}
          </button>
        </form>
      </div>
    </div>
  );
};
