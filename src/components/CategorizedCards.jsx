import { useMemo, useState, useEffect } from 'react';
import CardCarousel from './CardCarousel';

function CategorizedCards({ edhrecData, onAddToDeck, onCardClick, activeCategory, onCategoryChange }) {
  const categorizedCards = useMemo(() => {
    if (!edhrecData?.container?.json_dict?.cardlists) {
      return [];
    }

    // Filter out basic lands from all categories
    const basicLandNames = [
      'island',
      'plains',
      'swamp',
      'mountain',
      'forest',
      'wastes'
    ];

    // Categories to skip (already displayed separately)
    const skipCategories = [
      'high synergy cards',
      'top cards',
      'signature cards'
    ];

    return edhrecData.container.json_dict.cardlists
      .filter(cardlist => {
        const header = cardlist.header.toLowerCase();
        return !skipCategories.includes(header);
      })
      .map(cardlist => ({
        header: cardlist.header,
        tag: cardlist.tag,
        cards: (cardlist.cardviews || []).filter(
          card => !basicLandNames.includes(card.name.toLowerCase())
        ),
      }))
      .filter(category => category.cards.length > 0); // Remove empty categories
  }, [edhrecData]);

  const [activeTab, setActiveTab] = useState(0);

  // Update active tab when activeCategory changes from sidebar
  useEffect(() => {
    if (activeCategory && categorizedCards.length > 0) {
      const index = categorizedCards.findIndex(
        cat => getCategoryId(cat.header) === activeCategory
      );
      if (index !== -1 && index >= 0) {
        setActiveTab(index);
      }
    }
  }, [activeCategory, categorizedCards]);

  if (categorizedCards.length === 0) {
    return null;
  }


  const getCategoryId = header => {
    return header
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  };

  const handleTabClick = (index, categoryId) => {
    setActiveTab(index);
    if (onCategoryChange) {
      onCategoryChange(categoryId);
    }
  };

  const activeCategory_data = categorizedCards[activeTab];
  const categoryId = getCategoryId(activeCategory_data.header);

  // Enrich cards with synergy/inclusion data
  const enrichedCards = activeCategory_data.cards.map(card => ({
    ...card,
    synergy: card.synergy,
    inclusion: card.inclusion,
    num_decks: card.num_decks,
    potential_decks: card.potential_decks,
  }));

  return (
    <div className="mb-8">
      {/* Tab Navigation */}
      <div className="glass-card p-4 mb-4">
        <div className="flex flex-wrap gap-2">
          {categorizedCards.map((category, index) => {
            const tabId = getCategoryId(category.header);
            
            return (
              <button
                key={tabId}
                onClick={() => handleTabClick(index, tabId)}
                className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${
                  activeTab === index
                    ? 'bg-magic-blue text-white shadow-lg shadow-magic-blue/30'
                    : 'bg-white/5 text-text-secondary hover:bg-white/10 hover:text-text-primary border border-white/10'
                }`}
              >
                <span>{category.header}</span>
                <span className="text-xs opacity-75">({category.cards.length})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tab Content */}
      <div key={categoryId} id={categoryId} className="scroll-mt-24">
        <CardCarousel
          title={activeCategory_data.header}
          cards={enrichedCards}
          onAddToDeck={onAddToDeck}
          onCardClick={onCardClick}
          showCount={true}
        />
      </div>
    </div>
  );
}

export default CategorizedCards;

