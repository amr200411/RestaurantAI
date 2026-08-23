import React, { useState } from 'react';
import { Sparkles, Send } from 'lucide-react';

interface HeroSectionProps {
  onAskAI: (query: string) => void;
  t: any;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onAskAI, t }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onAskAI(query);
    }
  };

  const sampleChips = [
    t.chip1,
    t.chip2,
    t.chip3,
    t.chip4,
  ];

  return (
    <section className="hero-section">
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '9999px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem', marginBottom: '20px' }}>
        <Sparkles size={16} /> RestaurantAI Culinary Assistant
      </div>

      <h1 className="hero-title">{t.heroTitle}</h1>
      <p className="hero-subtitle">{t.heroSubtitle}</p>

      <div className="ai-search-box">
        <form onSubmit={handleSubmit} className="ai-input-wrapper">
          <Sparkles size={22} style={{ color: '#ec4899', marginRight: '10px' }} />
          <input
            type="text"
            className="ai-input"
            placeholder={t.aiSearchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-ai" style={{ borderRadius: '9999px', padding: '8px 22px' }}>
            <Send size={16} /> {t.askAI}
          </button>
        </form>

        <div className="ai-chips">
          {sampleChips.map((chipText, i) => (
            <button key={i} className="chip" onClick={() => onAskAI(chipText)}>
              ✨ {chipText}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
