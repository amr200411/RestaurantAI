import React, { useState } from 'react';
import { ShoppingBag, Bot, Utensils, Shield, User as UserIcon, LogOut, Clock, Menu as MenuIcon, X, Globe } from 'lucide-react';
import type { User } from '../types';
import type { Language } from '../i18n';

interface NavbarProps {
  activeTab: 'menu' | 'orders' | 'admin';
  setActiveTab: (tab: 'menu' | 'orders' | 'admin') => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenAI: () => void;
  onOpenAuth: () => void;
  user: User | null;
  onLogout: () => void;
  lang: Language;
  onToggleLang: () => void;
  t: any;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  cartCount,
  onOpenCart,
  onOpenAI,
  onOpenAuth,
  user,
  onLogout,
  lang,
  onToggleLang,
  t,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (action: () => void) => {
    action();
    setMobileMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand Logo */}
        <div
          className="brand-logo"
          onClick={() => {
            setActiveTab('menu');
            setMobileMenuOpen(false);
          }}
        >
          <Utensils className="w-8 h-8 text-amber-500" style={{ color: 'var(--primary)' }} />
          Restaurant<span>AI</span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="nav-links desktop-only">
          <button
            className={`nav-item ${activeTab === 'menu' ? 'active' : ''}`}
            onClick={() => setActiveTab('menu')}
          >
            <Utensils size={18} />
            <span>{t.menu}</span>
          </button>

          <button className="nav-item ai-nav-btn" onClick={onOpenAI}>
            <Bot size={18} />
            <span>{t.aiAdvisor}</span>
          </button>

          {user && (
            <button
              className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <Clock size={18} />
              <span>{t.myOrders}</span>
            </button>
          )}

          {user?.role === 'admin' && (
            <button
              className={`nav-item admin-nav-btn ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin')}
            >
              <Shield size={18} />
              <span>{t.adminDashboard}</span>
            </button>
          )}
        </nav>

        {/* Right Header Action Group (Single & Unified) */}
        <div className="header-actions">
          {/* Language Switcher Button (Single) */}
          <button className="btn btn-secondary lang-toggle-btn" onClick={onToggleLang} title="Switch Language / تغيير اللغة">
            <Globe size={18} style={{ color: 'var(--primary)' }} />
            <span className="lang-label">{lang === 'ar' ? 'English' : 'العربية'}</span>
          </button>

          {/* Cart Button (Single) */}
          <button className="btn btn-secondary cart-nav-btn" onClick={onOpenCart}>
            <ShoppingBag size={18} />
            <span className="cart-label desktop-only">{t.cart}</span>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>

          {/* Desktop User Profile / Sign In */}
          <div className="desktop-only">
            {user ? (
              <div className="user-profile-badge">
                <span className="user-name">
                  {user.name} {user.role === 'admin' && <span className="admin-tag">({t.adminTag})</span>}
                </span>
                <button className="btn btn-secondary icon-btn" onClick={onLogout} title={t.signOut}>
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button className="btn btn-primary" onClick={onOpenAuth}>
                <UserIcon size={18} />
                <span>{t.signIn}</span>
              </button>
            )}
          </div>

          {/* Mobile Hamburger Toggle Button (Shown only on mobile) */}
          <button
            className="mobile-toggle-btn mobile-only"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Glass Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="mobile-dropdown-menu glass-card">
          <button
            className={`mobile-nav-item ${activeTab === 'menu' ? 'active' : ''}`}
            onClick={() => handleNavClick(() => setActiveTab('menu'))}
          >
            <Utensils size={20} />
            <span>{t.menu}</span>
          </button>

          <button
            className="mobile-nav-item ai-mobile-btn"
            onClick={() => handleNavClick(onOpenAI)}
          >
            <Bot size={20} />
            <span>{t.aiAdvisor}</span>
          </button>

          {user && (
            <button
              className={`mobile-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => handleNavClick(() => setActiveTab('orders'))}
            >
              <Clock size={20} />
              <span>{t.myOrders}</span>
            </button>
          )}

          {user?.role === 'admin' && (
            <button
              className={`mobile-nav-item admin-mobile-btn ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => handleNavClick(() => setActiveTab('admin'))}
            >
              <Shield size={20} />
              <span>{t.adminDashboard}</span>
            </button>
          )}

          <div className="mobile-divider" />

          {user ? (
            <div className="mobile-user-section">
              <div className="mobile-user-info">
                <UserIcon size={20} style={{ color: 'var(--primary)' }} />
                <div>
                  <div style={{ fontWeight: 700, color: '#fff' }}>{user.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {user.email} {user.role === 'admin' && `• ${t.adminTag}`}
                  </div>
                </div>
              </div>
              <button
                className="btn btn-danger"
                style={{ width: '100%', marginTop: '10px' }}
                onClick={() => handleNavClick(onLogout)}
              >
                <LogOut size={18} /> {t.signOut}
              </button>
            </div>
          ) : (
            <button
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={() => handleNavClick(onOpenAuth)}
            >
              <UserIcon size={18} /> {t.signIn}
            </button>
          )}
        </div>
      )}
    </header>
  );
};
