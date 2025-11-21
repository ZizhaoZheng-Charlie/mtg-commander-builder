import { useState, useEffect, useMemo } from 'react';

function CardCategoriesSidebar({
  activeCategory,
  onCategoryClick,
  edhrecData,
}) {
  const [isVisible, setIsVisible] = useState(true);

  const categories = useMemo(() => {
    const baseCategories = [
      { id: 'high-synergy', label: 'High Synergy Cards', icon: '✨' },
      { id: 'top-cards', label: 'Top Cards', icon: '🏆' },
    ];

    if (!edhrecData?.container?.json_dict?.cardlists) {
      return baseCategories;
    }

    const getCategoryIcon = header => {
      const h = header.toLowerCase();
      if (h.includes('creature')) return '🦁';
      if (h.includes('instant')) return '⚡';
      if (h.includes('sorcery') || h.includes('sorceries')) return '🔮';
      if (h.includes('artifact')) return '⚙️';
      if (h.includes('enchantment')) return '✨';
      if (h.includes('planeswalker')) return '👤';
      if (h.includes('land')) return '🌍';
      if (h.includes('utility')) return '💎';
      if (h.includes('mana')) return '💰';
      if (h.includes('new')) return '🆕';
      return '📋';
    };

    const getCategoryId = header => {
      return header
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
    };

    // Skip categories already displayed separately
    const skipCategories = [
      'high synergy cards',
      'top cards',
      'signature cards',
    ];

    const dynamicCategories = edhrecData.container.json_dict.cardlists
      .filter(cardlist => {
        const header = cardlist.header.toLowerCase();
        return (
          !skipCategories.includes(header) &&
          (cardlist.cardviews?.length || 0) > 0
        );
      })
      .map(cardlist => ({
        id: getCategoryId(cardlist.header),
        label: cardlist.header,
        icon: getCategoryIcon(cardlist.header),
      }));

    return [...baseCategories, ...dynamicCategories];
  }, [edhrecData]);

  useEffect(() => {
    const handleScroll = () => {
      // Hide sidebar on scroll down, show on scroll up
      const scrollTop = window.scrollY;
      setIsVisible(scrollTop < 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCategoryClick = categoryId => {
    if (onCategoryClick) {
      onCategoryClick(categoryId);
    }

    // For High Synergy and Top Cards, scroll to them
    if (categoryId === 'high-synergy' || categoryId === 'top-cards') {
      const element = document.getElementById(categoryId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      // For other categories, scroll to the categorized cards section
      const element = document.getElementById(categoryId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <aside
      className={`fixed left-0 top-20 h-[calc(100vh-5rem)] w-56 bg-gradient-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-md border-r border-white/10 overflow-y-auto transition-transform duration-300 z-40 theme-scrollbar ${
        isVisible ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="p-4">
        <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4">
          Card Categories
        </h3>
        <nav className="space-y-1">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                activeCategory === category.id
                  ? 'bg-magic-blue text-white shadow-lg shadow-magic-blue/30'
                  : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
              }`}
            >
              <span className="text-lg">{category.icon}</span>
              <span>{category.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Toggle button for mobile */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed left-0 top-1/2 -translate-y-1/2 bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-r-lg p-2 transition-all hover:bg-slate-800 lg:hidden"
        style={{ left: isVisible ? '14rem' : '0' }}
      >
        <span className="text-white text-xl">{isVisible ? '◀' : '▶'}</span>
      </button>
    </aside>
  );
}

export default CardCategoriesSidebar;
