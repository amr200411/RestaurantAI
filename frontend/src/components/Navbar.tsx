import React, { useState } from 'react';
import { ShoppingBag, Bot, Utensils, Shield, User as UserIcon, LogOut, Clock, Menu as MenuIcon, X } from 'lucide-react';
import type { User } from '../types';

interface NavbarProps {
  activeTab: 'menu' | 'orders' | 'admin';
  setActiveTab: (tab: 'menu' | 'orders' | 'admin') => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenAI: () => void;
  onOpenAuth: () => void;
  user: User | null;
  onLogout: () => void;
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
            Menu
          </button>

          <button className="nav-item ai-nav-btn" onClick={onOpenAI}>
            <Bot size={18} />
            AI Assistant
          </button>

          {user && (
            <button
              className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <Clock size={18} />
              My Orders
            </button>
          )}

          {user?.role === 'admin' && (
            <button
              className={`nav-item admin-nav-btn ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin')}
            >
              <Shield size={18} />
              Admin Dashboard
            </button>
          )}

          <button className="btn btn-secondary cart-nav-btn" onClick={onOpenCart}>
            <ShoppingBag size={18} />
            Cart
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>

          {user ? (
            <div className="user-profile-badge">
              <span className="user-name">
                {user.name} {user.role === 'admin' && <span className="admin-tag">(Admin)</span>}
              </span>
              <button className="btn btn-secondary icon-btn" onClick={onLogout} title="Logout">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button className="btn btn-primary" onClick={onOpenAuth}>
              <UserIcon size={18} />
              Sign In
            </button>
          )}
        </nav>

        {/* Mobile Quick Action Group (Cart + Hamburger Toggle) */}
        <div className="mobile-actions mobile-only">
          <button className="btn btn-secondary cart-nav-btn" onClick={onOpenCart}>
            <ShoppingBag size={18} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>

          <button
            className="mobile-toggle-btn"
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
            <span>Browse Menu</span>
          </button>

          <button
            className="mobile-nav-item ai-mobile-btn"
            onClick={() => handleNavClick(onOpenAI)}
          >
            <Bot size={20} />
            <span>AI Food Advisor</span>
          </button>

          {user && (
            <button
              className={`mobile-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => handleNavClick(() => setActiveTab('orders'))}
            >
              <Clock size={20} />
              <span>My Live Orders</span>
            </button>
          )}

          {user?.role === 'admin' && (
            <button
              className={`mobile-nav-item admin-mobile-btn ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => handleNavClick(() => setActiveTab('admin'))}
            >
              <Shield size={20} />
              <span>Admin Control Dashboard</span>
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
                    {user.email} {user.role === 'admin' && '• Admin'}
                  </div>
                </div>
              </div>
              <button
                className="btn btn-danger"
                style={{ width: '100%', marginTop: '10px' }}
                onClick={() => handleNavClick(onLogout)}
              >
                <LogOut size={18} /> Sign Out
              </button>
            </div>
          ) : (
            <button
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={() => handleNavClick(onOpenAuth)}
            >
              <UserIcon size={18} /> Sign In / Register
            </button>
          )}
        </div>
      )}
    </header>
  );
};
