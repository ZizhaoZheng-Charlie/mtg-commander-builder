import { useRef, useState } from 'react';
import { cardLibrary } from '../utils/cardLibrary';

function TopCards({ cards, onAddToDeck, onCardClick }) {
  const scrollContainerRef = useRef(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredCardData, setHoveredCardData] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });

  if (!cards || cards.length === 0) return null;

  const scroll = direction => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft +
        (direction === 'left' ? -scrollAmount : scrollAmount);
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
    }
  };

  const handleCardClick = card => {
    onCardClick(card);
  };

  const handleAddToDeck = card => {
    onAddToDeck(card);
  };

  const handleMouseEnter = (card, e) => {
    // Don't show tooltip if hovering over the add button
    if (e.target.closest('button')) {
      return;
    }
    setHoveredCard(card);
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverPosition({
      x: rect.left + rect.width / 2,
      y: rect.top,
    });

    // Fetch full card data from card library for image
    if (cardLibrary.isLoaded && card.name) {
      const cards = cardLibrary.lexicalSearch(card.name, 5);
      const foundCard =
        cards.find(c => c.name.toLowerCase() === card.name.toLowerCase()) ||
        cards[0];
      if (foundCard) {
        setHoveredCardData(foundCard);
      } else {
        setHoveredCardData(null);
      }
    } else {
      setHoveredCardData(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredCard(null);
    setHoveredCardData(null);
  };

  const handleMouseMove = (card, e) => {
    if (hoveredCard && hoveredCard.id === card.id) {
      const rect = e.currentTarget.getBoundingClientRect();
      setHoverPosition({
        x: rect.left + rect.width / 2,
        y: rect.top,
      });
    }
  };

  return (
    <section className="mb-8">
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
              <span className="text-xl">🏆</span>
              Top Cards
            </h2>
            <p className="text-text-secondary text-sm mt-1">
              {cards.length} most popular cards in this commander deck
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-magic-blue transition-all flex items-center justify-center"
              aria-label="Scroll left"
            >
              ←
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-magic-blue transition-all flex items-center justify-center"
              aria-label="Scroll right"
            >
              →
            </button>
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scroll-smooth pb-4 hide-scrollbar"
        >
          {cards.map((card, index) => {
            const synergyPercentage = card.synergy
              ? Math.round(card.synergy * 100)
              : null;

            return (
              <div
                key={card.id || index}
                className="flex-shrink-0 w-[240px] bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 cursor-pointer transition-all hover:bg-slate-700/50 hover:border-magic-purple/50 hover:shadow-lg relative group"
                onClick={() => handleCardClick(card)}
                onMouseEnter={e => handleMouseEnter(card, e)}
                onMouseLeave={handleMouseLeave}
                onMouseMove={e => handleMouseMove(card, e)}
              >
                <div className="space-y-3 pb-8">
                  <h3 className="text-base font-bold text-white line-clamp-2 min-h-[3rem]">
                    {card.name}
                  </h3>
                  
                  <div className="flex flex-col gap-2">
                    {synergyPercentage !== null && synergyPercentage > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="text-emerald-400 font-semibold text-sm">
                          {synergyPercentage}% synergy
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-slate-400">
                    {card.num_decks?.toLocaleString() || '0'} decks
                  </p>
                </div>

                <button
                  className="absolute bottom-2 right-2 px-3 py-1.5 bg-magic-blue/20 text-magic-blue text-xs font-bold rounded border border-magic-blue/40 opacity-0 group-hover:opacity-100 transition-all hover:bg-magic-blue hover:text-white z-10"
                  onClick={e => {
                    e.stopPropagation();
                    handleAddToDeck(card);
                  }}
                  onMouseEnter={e => {
                    e.stopPropagation();
                    setHoveredCard(null);
                    setHoveredCardData(null);
                  }}
                >
                  + Add
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hover Card Image Tooltip */}
      {hoveredCard && hoveredCardData &&
        (() => {
          const hoveredImageUri =
            hoveredCardData.image_uris?.normal ||
            hoveredCardData.image_uris?.large ||
            (hoveredCardData.card_faces &&
              hoveredCardData.card_faces[0]?.image_uris?.normal) ||
            (hoveredCardData.card_faces &&
              hoveredCardData.card_faces[0]?.image_uris?.large) ||
            '';

          return (
            <div
              className="fixed z-40 pointer-events-none transition-opacity duration-200"
              style={{
                left: Math.max(
                  20,
                  Math.min(hoverPosition.x - 125, window.innerWidth - 270)
                ),
                top: Math.max(
                  20,
                  Math.min(hoverPosition.y + 20, window.innerHeight - 390)
                ),
              }}
            >
              <div className="bg-slate-900/98 backdrop-blur-md border-2 border-magic-purple/80 rounded-lg shadow-[0_0_40px_rgba(139,92,246,0.6)] overflow-hidden">
                {hoveredImageUri ? (
                  <img
                    src={hoveredImageUri}
                    alt={hoveredCard.name}
                    className="w-[250px] h-auto block"
                    onError={e => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-[250px] h-[350px] flex items-center justify-center bg-slate-800 text-text-secondary p-4 text-center">
                    <div>
                      <p className="font-bold mb-2 text-text-primary">
                        {hoveredCard.name}
                      </p>
                      <p className="text-xs">Image not available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
    </section>
  );
}

export default TopCards;
