import { useEffect, useState, useCallback } from 'react';
import { parseManaSymbols, parseOracleText } from '../utils/manaSymbols';
import { findCardCategories, getCardsAroundCard } from '../utils/api';
import { cardLibrary } from '../utils/cardLibrary';

function CardModal({
  card,
  onClose,
  actionButton,
  edhrecData,
  onCardClick,
  previousCard,
  onBack,
  isCommanderModal = false,
}) {
  const [showCategories, setShowCategories] = useState(false);
  const [cardSynergyData, setCardSynergyData] = useState([]);
  const [loadingSynergy, setLoadingSynergy] = useState(false);
  const [showSynergies, setShowSynergies] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredCardData, setHoveredCardData] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleEscape = e => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (card) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [card, onClose]);

  // Fetch card synergy data when sync is triggered
  const handleSyncSynergy = useCallback(async () => {
    if (!card || loadingSynergy) return;

    setLoadingSynergy(true);
    setShowSynergies(true);

    try {
      // For split cards, pass the layout so EDHREC search uses combined name
      const synergies = await getCardsAroundCard(
        card.name,
        undefined,
        card.layout
      );
      setCardSynergyData(synergies);
      console.log(
        `Found ${synergies.length} cards that synergize with ${card.name} (layout: ${card.layout})`
      );
      setLoadingSynergy(false);
    } catch (error) {
      console.error('Error fetching card synergies:', error);
      setLoadingSynergy(false);
    }
  }, [card, loadingSynergy]);

  // Reset synergy data when card changes and auto-fetch (only for non-commander modals)
  useEffect(() => {
    setCardSynergyData([]);
    setShowSynergies(false);
    setLoadingSynergy(false);
    setExpandedCategories({});

    // Auto-fetch synergy data when card is opened (skip for commander modals)
    if (card && !isCommanderModal) {
      // Delay slightly to ensure state is reset first
      const timer = setTimeout(() => {
        handleSyncSynergy();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [card?.id, handleSyncSynergy, isCommanderModal]);

  if (!card) return null;

  const imageUri =
    card.image_uris?.large ||
    card.image_uris?.normal ||
    (card.card_faces && card.card_faces[0]?.image_uris?.large) ||
    (card.card_faces && card.card_faces[0]?.image_uris?.normal) ||
    '';

  // Find card categories in EDHREC data (from commander context)
  const cardCategories = edhrecData
    ? findCardCategories(card.name, edhrecData)
    : [];
  const hasCategories = cardCategories.length > 0;

  const getCategoryIcon = category => {
    const c = category.toLowerCase();
    if (c.includes('creature')) return '🦁';
    if (c.includes('instant')) return '⚡';
    if (c.includes('sorcery') || c.includes('sorceries')) return '🔮';
    if (c.includes('artifact')) return '⚙️';
    if (c.includes('enchantment')) return '✨';
    if (c.includes('planeswalker')) return '👤';
    if (c.includes('land')) return '🌍';
    if (c.includes('utility')) return '💎';
    if (c.includes('mana')) return '💰';
    if (c.includes('new')) return '🆕';
    if (c.includes('synergy')) return '🔗';
    if (c.includes('top')) return '🏆';
    return '📋';
  };

  // Group synergy cards by category
  const groupedSynergies = cardSynergyData.reduce((acc, card) => {
    if (!acc[card.category]) {
      acc[card.category] = [];
    }
    acc[card.category].push(card);
    return acc;
  }, {});

  // Use all grouped synergies (no filtering)
  const filteredSynergyData = groupedSynergies;

  // Toggle category expansion
  const toggleCategory = category => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // Expand all categories
  const expandAll = () => {
    const allExpanded = {};
    Object.keys(filteredSynergyData).forEach(cat => {
      allExpanded[cat] = true;
    });
    setExpandedCategories(allExpanded);
  };

  // Collapse all categories
  const collapseAll = () => {
    setExpandedCategories({});
  };

  // Handle card hover to show preview
  const handleCardHover = async (cardName, event) => {
    setHoveredCard(cardName);

    // Update hover position based on mouse
    setHoverPosition({
      x: event.clientX,
      y: event.clientY,
    });

    // Fetch card data if not already cached
    if (cardLibrary.isLoaded) {
      const cards = cardLibrary.lexicalSearch(cardName, 5);
      const foundCard =
        cards.find(c => c.name.toLowerCase() === cardName.toLowerCase()) ||
        cards[0];

      if (foundCard) {
        setHoveredCardData(foundCard);
      }
    }
  };

  // Update hover position as mouse moves
  const handleCardMouseMove = event => {
    if (hoveredCard) {
      setHoverPosition({
        x: event.clientX,
        y: event.clientY,
      });
    }
  };

  // Handle card hover end
  const handleCardLeave = () => {
    setHoveredCard(null);
    setHoveredCardData(null);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex justify-center items-center p-8">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div
        className={`relative max-w-[1200px] w-full max-h-[90vh] overflow-y-auto z-10 glass-card p-6 ${isCommanderModal ? 'border-2 border-magic-purple/50' : ''}`}
      >
        <div className="absolute top-6 right-6 flex items-center gap-2 z-10">
          {previousCard && onBack && !isCommanderModal && (
            <button
              className="w-10 h-10 bg-white/10 border border-white/10 rounded-full text-text-primary text-lg cursor-pointer transition-all flex items-center justify-center hover:bg-magic-blue/30 hover:border-magic-blue hover:text-magic-blue"
              onClick={onBack}
              title={`Back to ${previousCard.name}`}
            >
              ←
            </button>
          )}
          {isCommanderModal && actionButton && (
            <button
              className="px-4 py-2 bg-gradient-to-r from-magic-blue to-magic-purple text-white text-sm font-semibold rounded-lg cursor-pointer transition-all inline-flex items-center gap-2 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(59,130,246,0.4)] active:translate-y-0"
              onClick={actionButton.onClick}
              title={actionButton.label}
            >
              <span className="text-lg">{actionButton.icon}</span>
              {actionButton.label}
            </button>
          )}
          <button
            className="w-10 h-10 bg-white/10 border border-white/10 rounded-full text-text-primary text-xl cursor-pointer transition-all flex items-center justify-center hover:bg-red-500/30 hover:border-red-500 hover:text-red-500"
            onClick={onClose}
            title="Close"
          >
            &times;
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8 items-start">
          {imageUri && (
            <div className="w-full md:sticky top-6 max-w-[300px] mx-auto md:mx-0">
              <img
                src={imageUri}
                alt={card.name}
                className="w-full rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.5)] block"
              />
            </div>
          )}

          <div className="flex flex-col gap-4 min-w-0">
            {/* Card Info */}
            <div className="flex flex-col gap-2 mb-2">
              <h2 className="text-3xl font-bold m-0 bg-gradient-to-r from-magic-blue to-magic-purple bg-clip-text text-transparent leading-tight">
                {card.name}
              </h2>
              <div
                className="flex gap-1 items-center flex-wrap"
                dangerouslySetInnerHTML={{
                  __html: parseManaSymbols(card.mana_cost) || '',
                }}
              />
            </div>
            <p className="text-lg font-medium text-text-secondary m-0">
              {card.type_line || 'Unknown'}
            </p>
            {card.oracle_text && (
              <div className="text-base leading-[1.8] text-text-primary">
                {card.oracle_text.split('\n').map((line, i) => (
                  <p
                    key={i}
                    className="my-3 first:mt-0 last:mb-0"
                    dangerouslySetInnerHTML={{
                      __html: parseOracleText(line),
                    }}
                  />
                ))}
              </div>
            )}
            {card.power && card.toughness && (
              <div className="bg-magic-blue/20 px-4 py-1 rounded-md text-lg font-bold text-magic-blue inline-block mt-2">
                {card.power}/{card.toughness}
              </div>
            )}
            {card.loyalty && (
              <div className="bg-magic-purple/20 px-4 py-1 rounded-md text-lg font-bold text-magic-purple inline-block mt-2">
                Loyalty: {card.loyalty}
              </div>
            )}

            {/* Commander EDHREC Categories */}
            {hasCategories && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                    <span className="text-xl">📊</span>
                    Commander Categories
                  </h3>
                  <button
                    onClick={() => setShowCategories(!showCategories)}
                    className="px-3 py-1.5 bg-magic-blue/20 text-magic-blue text-sm font-semibold rounded-lg border border-magic-blue/30 hover:bg-magic-blue hover:text-white transition-all flex items-center gap-2"
                  >
                    <span>{showCategories ? '▼' : '▶'}</span>
                    {showCategories ? 'Hide' : 'Show'} Details
                  </button>
                </div>

                {showCategories ? (
                  <div className="space-y-3">
                    {cardCategories.map((cat, index) => (
                      <div
                        key={index}
                        className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/8 transition-all"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">
                              {getCategoryIcon(cat.category)}
                            </span>
                            <span className="font-semibold text-text-primary">
                              {cat.category}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          {cat.synergy !== undefined && (
                            <div className="flex flex-col">
                              <span className="text-text-muted text-xs">
                                Synergy
                              </span>
                              <span className="text-magic-blue font-bold">
                                {(cat.synergy * 100).toFixed(1)}%
                              </span>
                            </div>
                          )}
                          {cat.inclusion !== undefined && (
                            <div className="flex flex-col">
                              <span className="text-text-muted text-xs">
                                Inclusion
                              </span>
                              <span className="text-magic-purple font-bold">
                                {(cat.inclusion * 100).toFixed(0)}%
                              </span>
                            </div>
                          )}
                          {cat.num_decks !== undefined && (
                            <div className="flex flex-col">
                              <span className="text-text-muted text-xs">
                                In Decks
                              </span>
                              <span className="text-text-primary font-semibold">
                                {cat.num_decks.toLocaleString()}
                              </span>
                            </div>
                          )}
                          {cat.potential_decks !== undefined && (
                            <div className="flex flex-col">
                              <span className="text-text-muted text-xs">
                                Potential Decks
                              </span>
                              <span className="text-text-primary font-semibold">
                                {cat.potential_decks.toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {cardCategories.map((cat, index) => (
                      <div
                        key={index}
                        className="px-3 py-1.5 bg-magic-blue/20 text-magic-blue text-sm font-medium rounded-lg border border-magic-blue/30 flex items-center gap-2"
                      >
                        <span>{getCategoryIcon(cat.category)}</span>
                        <span>{cat.category}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Card Synergy Section - Hidden for Commander Modals */}
        {!isCommanderModal && (
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                <span className="text-xl">🔗</span>
                Cards That Synergize With {card.name}
                {cardSynergyData.length > 0 && (
                  <span className="text-sm font-normal text-text-muted ml-2">
                    ({cardSynergyData.length} total)
                  </span>
                )}
              </h3>
            </div>

            {loadingSynergy ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-magic-blue"></div>
                <p className="text-text-secondary mt-4">
                  Loading synergy cards from EDHREC...
                </p>
              </div>
            ) : cardSynergyData.length > 0 ? (
              <div className="space-y-4">
                {/* Expand/Collapse All Controls */}
                <div className="flex justify-end gap-2 mb-2">
                  <button
                    onClick={expandAll}
                    className="px-3 py-1.5 bg-white/5 border border-white/10 text-text-secondary text-xs rounded-lg hover:bg-white/10 hover:text-magic-blue transition-all"
                  >
                    ▼ Expand All
                  </button>
                  <button
                    onClick={collapseAll}
                    className="px-3 py-1.5 bg-white/5 border border-white/10 text-text-secondary text-xs rounded-lg hover:bg-white/10 hover:text-magic-blue transition-all"
                  >
                    ▶ Collapse All
                  </button>
                </div>

                {/* Category Sections */}
                {Object.entries(filteredSynergyData).map(
                  ([category, cards]) => {
                    const isExpanded = expandedCategories[category];

                    return (
                      <div
                        key={category}
                        className="bg-white/3 border border-white/10 rounded-lg overflow-hidden"
                      >
                        {/* Category Header - Clickable */}
                        <button
                          onClick={() => toggleCategory(category)}
                          className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-all"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">
                              {getCategoryIcon(category)}
                            </span>
                            <h4 className="text-lg font-semibold text-text-primary">
                              {category}
                            </h4>
                            <span className="text-sm text-text-muted">
                              ({cards.length} cards)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {!isExpanded && (
                              <span className="text-xs text-magic-blue">
                                Click to view
                              </span>
                            )}
                            <span
                              className={`text-magic-blue transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                            >
                              ▶
                            </span>
                          </div>
                        </button>

                        {/* Category Content - Collapsible */}
                        {isExpanded && (
                          <div className="p-4 pt-0 border-t border-white/10">
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-3">
                              {cards.map((synergyCard, idx) => (
                                <div
                                  key={idx}
                                  className="bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 hover:border-magic-blue transition-all cursor-pointer relative"
                                  onClick={() => {
                                    handleCardLeave(); // Clear hover preview when clicked
                                    onCardClick &&
                                      onCardClick({ name: synergyCard.name });
                                  }}
                                  onMouseEnter={e =>
                                    handleCardHover(synergyCard.name, e)
                                  }
                                  onMouseMove={handleCardMouseMove}
                                  onMouseLeave={handleCardLeave}
                                >
                                  <p className="text-sm font-semibold text-text-primary mb-1 line-clamp-2">
                                    {synergyCard.name}
                                  </p>
                                  {synergyCard.synergy !== undefined && (
                                    <p className="text-xs text-magic-blue">
                                      {(synergyCard.synergy * 100).toFixed(0)}%
                                      synergy
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-text-secondary">
                  No synergy data available for this card on EDHREC.
                </p>
              </div>
            )}
          </div>
        )}
        {/* Action Buttons - Only show for non-commander modals */}
        {!isCommanderModal && actionButton && (
          <div className="flex justify-end items-center mt-6 pt-6 border-t border-white/10 gap-4 flex-wrap">
            <button
              className="px-6 py-3 bg-gradient-to-r from-magic-blue to-magic-purple text-white text-base font-semibold rounded-lg cursor-pointer transition-all inline-flex items-center gap-2 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(59,130,246,0.4)] active:translate-y-0"
              onClick={actionButton.onClick}
            >
              <span className="text-xl">{actionButton.icon}</span>
              {actionButton.label}
            </button>
          </div>
        )}
      </div>

      {/* Card Preview on Hover */}
      {hoveredCard && hoveredCardData && (
        <div
          className="fixed z-[10001] pointer-events-none transition-opacity duration-150"
          style={{
            left:
              hoverPosition.x > window.innerWidth / 2
                ? hoverPosition.x - 270
                : hoverPosition.x + 20,
            top: Math.max(
              20,
              Math.min(hoverPosition.y - 50, window.innerHeight - 390)
            ),
          }}
        >
          <div className="bg-slate-900/98 backdrop-blur-md border-2 border-magic-purple/80 rounded-lg shadow-[0_0_40px_rgba(139,92,246,0.6)] overflow-hidden">
            {hoveredCardData.image_uris?.normal ||
            hoveredCardData.card_faces?.[0]?.image_uris?.normal ? (
              <img
                src={
                  hoveredCardData.image_uris?.normal ||
                  hoveredCardData.card_faces?.[0]?.image_uris?.normal
                }
                alt={hoveredCard}
                className="w-[250px] h-auto block"
                onError={e => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-[250px] h-[350px] flex items-center justify-center bg-slate-800 text-text-secondary p-4 text-center">
                <div>
                  <p className="font-bold mb-2 text-text-primary">
                    {hoveredCard}
                  </p>
                  <p className="text-xs">Image not available</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CardModal;
