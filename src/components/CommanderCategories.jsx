import { useState, useEffect } from 'react';
import { getEDHRECCardlists, filterCommandersByCategory } from '../utils/api';
import CardModal from './CardModal';

function CommanderCategories({ onCommanderSelect, setLoading }) {
  const [activeCategory, setActiveCategory] = useState('top-commanders');
  const [allCards, setAllCards] = useState([]);
  const [displayCards, setDisplayCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isLoadingCards, setIsLoadingCards] = useState(false);

  const categories = [
    { id: 'top-commanders', label: 'Top Commanders', icon: '👑' },
    { id: 'new-cards', label: 'New Cards', icon: '🆕' },
    { id: 'high-synergy-cards', label: 'High Synergy Cards', icon: '🔗' },
    { id: 'top-cards', label: 'Top Cards', icon: '🏆' },
    { id: 'game-changers', label: 'Game Changers', icon: '💎' },
    { id: 'creatures', label: 'Creatures', icon: '🦁' },
    { id: 'instants', label: 'Instants', icon: '⚡' },
    { id: 'sorceries', label: 'Sorceries', icon: '🔮' },
    { id: 'utility-artifacts', label: 'Utility Artifacts', icon: '⚙️' },
    { id: 'enchantments', label: 'Enchantments', icon: '✨' },
    { id: 'planeswalkers', label: 'Planeswalkers', icon: '👤' },
    { id: 'utility-lands', label: 'Utility Lands', icon: '🗺️' },
    { id: 'mana-artifacts', label: 'Mana Artifacts', icon: '💰' },
    { id: 'lands', label: 'Lands', icon: '🌍' },
  ];

  // Load EDHREC cardlists on mount
  useEffect(() => {
    const loadCards = async () => {
      setIsLoadingCards(true);
      const cards = await getEDHRECCardlists(setLoading);
      setAllCards(cards);
      setIsLoadingCards(false);
    };

    loadCards();
  }, [setLoading]);

  // Update displayed cards when category or all cards change
  useEffect(() => {
    if (allCards.length > 0) {
      const filtered = filterCommandersByCategory(allCards, activeCategory);
      setDisplayCards(filtered);
      console.log(`📋 ${activeCategory}: ${filtered.length} cards`);
    }
  }, [activeCategory, allCards]);

  const handleCategoryClick = categoryId => {
    setActiveCategory(categoryId);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCardClick = card => {
    setSelectedCard(card);
  };

  const handleAddCommander = () => {
    if (selectedCard) {
      onCommanderSelect(selectedCard);
      setSelectedCard(null);
    }
  };

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <aside className="w-64 glass-card p-4 h-fit sticky top-24">
        <h3 className="text-lg font-bold mb-4 text-text-primary flex items-center gap-2">
          <span className="text-xl">📊</span>
          Categories
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

        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left text-text-secondary hover:bg-white/5 hover:text-text-primary mt-4 border-t border-white/10 pt-4"
        >
          <span className="text-lg">↑</span>
          <span>Back to Top</span>
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        <section className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
              <span className="text-2xl">
                {categories.find(c => c.id === activeCategory)?.icon}
              </span>
              {categories.find(c => c.id === activeCategory)?.label}
            </h2>
            <span className="text-text-secondary text-sm">
              {isLoadingCards ? 'Loading...' : `${displayCards.length} cards`}
            </span>
          </div>

          {isLoadingCards ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-magic-blue"></div>
              <p className="text-text-secondary mt-4">Loading cards...</p>
            </div>
          ) : displayCards.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-6">
              {displayCards.map(card => {
                const imageUri = card.image_uris?.[0] || card.image_uri || '';

                return (
                  <div
                    key={card.id}
                    className="bg-white/3 border border-white/10 rounded-lg overflow-hidden cursor-pointer transition-all relative hover:-translate-y-1 hover:scale-[1.02] hover:border-magic-purple hover:shadow-[0_10px_30px_rgba(139,92,246,0.3)] animate-[fadeIn_0.5s_ease-in-out]"
                    onClick={() => handleCardClick(card)}
                  >
                    {imageUri && (
                      <img
                        src={imageUri}
                        alt={card.name}
                        className="w-full block"
                      />
                    )}
                    <div className="p-4">
                      <h3 className="text-base font-semibold text-text-primary mb-1">
                        {card.name}
                      </h3>
                      <p className="text-sm text-text-secondary mb-2">
                        {card.type || 'Card'}
                      </p>
                      {card.num_decks && (
                        <p className="text-xs text-magic-blue">
                          {card.num_decks.toLocaleString()} decks
                        </p>
                      )}
                    </div>

                    {/* Badges */}
                    <div className="absolute top-2 right-2 flex flex-col gap-1">
                      {card.new && (
                        <span className="px-2 py-1 bg-green-500/90 text-white text-xs font-bold rounded">
                          NEW
                        </span>
                      )}
                      {card.game_changer && (
                        <span className="px-2 py-1 bg-purple-500/90 text-white text-xs font-bold rounded">
                          💎
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-text-secondary">
                No cards found in this category.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Card Modal */}
      <CardModal
        card={selectedCard}
        onClose={() => setSelectedCard(null)}
        actionButton={
          selectedCard?.legal_commander
            ? {
                label: 'Add as Commander',
                icon: '⚔️',
                onClick: handleAddCommander,
              }
            : undefined
        }
        isCommanderModal={true}
      />
    </div>
  );
}

export default CommanderCategories;
