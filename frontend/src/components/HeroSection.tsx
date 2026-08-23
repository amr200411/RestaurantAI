import React, { useState } from 'react';
import { Sparkles, Send } from 'lucide-react';

interface HeroSectionProps {
  onAskAI: (query: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onAskAI }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onAskAI(query);
    }
  };

  const sampleChips = [
    'أريد وجبة رخيصة بدون دجاج',
    'ما أفضل وجبة لشخصين بأقل من 500 ليرة؟',
    'أقترح لي تحلية مميزة مع عصير طازج',
    'Vegetarian pizza options under 200₺',
  ];

  return (
    <section className="hero-section">
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '9999px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem', marginBottom: '20px' }}>
        <Sparkles size={16} /> Powered by AI Culinary Assistant
      </div>

      <h1 className="hero-title">Delicious Gourmet Dining & Smart AI Ordering</h1>
      <p className="hero-subtitle">
        Browse our handcrafted artisanal menu or ask our AI assistant to recommend the perfect dish tailored to your exact taste, budget, and dietary preferences.
      </p>

      <div className="ai-search-box">
        <form onSubmit={handleSubmit} className="ai-input-wrapper">
          <Sparkles size={22} style={{ color: '#ec4899', marginRight: '10px' }} />
          <input
            type="text"
            className="ai-input"
            placeholder="Ask AI: 'أريد وجبة رخيصة بدون دجاج' or 'Best pizza for 2 under 300₺'..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-ai" style={{ borderRadius: '9999px', padding: '8px 22px' }}>
            <Send size={16} /> Ask AI
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
