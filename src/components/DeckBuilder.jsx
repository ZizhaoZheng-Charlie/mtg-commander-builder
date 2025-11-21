import { useMemo, useState, useEffect, useCallback } from 'react';
import {
  getDeckCount,
  removeFromDeck,
  updateCardQuantity,
} from '../utils/deckUtils';
import { parseManaSymbols } from '../utils/manaSymbols';

function DeckBuilder({
  deck,
  commander,
  secondCommander,
  onDeckChange,
  onCardClick,
  onChangeCommander,
  onRemoveSecondCommander,
  requiresSecondCommander,
  onOpenPartnerSearch,
}) {
  const deckCount = useMemo(() => getDeckCount(deck), [deck]);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [deckText, setDeckText] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const handleRemoveCard = cardId => {
    onDeckChange(removeFromDeck(deck, cardId));
  };

  const handleQuantityChange = (cardId, newQuantity) => {
    onDeckChange(updateCardQuantity(deck, cardId, parseInt(newQuantity) || 1));
  };

  const handleClearDeck = () => {
    if (window.confirm('Are you sure you want to clear your deck?')) {
      onDeckChange([]);
      onChangeCommander(); // Reset to commander search
    }
  };

  // Format deck as quantity card name (no brackets)
  const formatDeck = useMemo(() => {
    return deck
      .map(card => {
        const quantity = card.quantity || 1;
        return `${quantity} ${card.name}`;
      })
      .join('\n');
  }, [deck]);

  // Update deck text when modal opens
  useEffect(() => {
    if (showCopyModal) {
      setDeckText(formatDeck);
    }
  }, [showCopyModal, formatDeck]);

  const handleOpenCopyModal = () => {
    if (deck.length === 0) {
      return;
    }
    setShowCopyModal(true);
  };

  const handleCloseCopyModal = useCallback(() => {
    setShowCopyModal(false);
    setCopySuccess(false);
  }, []);

  const handleCopyFromModal = async () => {
    if (!deckText.trim()) {
      return;
    }

    try {
      await navigator.clipboard.writeText(deckText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy deck:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = deckText;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = e => {
      if (e.key === 'Escape' && showCopyModal) {
        handleCloseCopyModal();
      }
    };

    if (showCopyModal) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showCopyModal, handleCloseCopyModal]);

  const commanderImage =
    commander?.image_uris?.normal ||
    (commander?.card_faces && commander.card_faces[0]?.image_uris?.normal) ||
    '';

  // Get card price (from prices.usd or default to 0)
  const getCardPrice = card => {
    if (card.prices?.usd) {
      return parseFloat(card.prices.usd);
    }
    return 0;
  };

  // Group cards by type
  const organizedDeck = useMemo(() => {
    const groups = {
      commander: [],
      creatures: [],
      instants: [],
      sorceries: [],
      enchantments: [],
      artifacts: [],
      planeswalkers: [],
      lands: [],
      other: [],
    };

    deck.forEach(card => {
      if (card.isCommander) {
        groups.commander.push(card);
      } else {
        const typeLine = (card.type_line || '').toLowerCase();
        if (typeLine.includes('creature')) {
          groups.creatures.push(card);
        } else if (typeLine.includes('instant')) {
          groups.instants.push(card);
        } else if (typeLine.includes('sorcery')) {
          groups.sorceries.push(card);
        } else if (typeLine.includes('enchantment')) {
          groups.enchantments.push(card);
        } else if (typeLine.includes('artifact')) {
          groups.artifacts.push(card);
        } else if (typeLine.includes('planeswalker')) {
          groups.planeswalkers.push(card);
        } else if (typeLine.includes('land')) {
          groups.lands.push(card);
        } else {
          groups.other.push(card);
        }
      }
    });

    return groups;
  }, [deck]);

  const renderCardGroup = (title, cards) => {
    if (cards.length === 0) return null;

    // Calculate total count and price for this group
    const totalCount = cards.reduce(
      (sum, card) => sum + (card.quantity || 1),
      0
    );
    const totalPrice = cards.reduce((sum, card) => {
      const price = getCardPrice(card);
      return sum + price * (card.quantity || 1);
    }, 0);

    return (
      <div className="bg-white/2 border border-white/10 rounded-xl overflow-hidden mb-6">
        <div className="bg-magic-blue/10 px-4 py-2 border-b border-white/10">
          <div className="text-base font-bold text-magic-blue flex items-center gap-2">
            {title} ({totalCount}) - ${totalPrice.toFixed(2)}
          </div>
        </div>
        <div className="flex flex-col">
          {cards.map(card => {
            const quantity = card.quantity || 1;
            const price = getCardPrice(card);
            const totalCardPrice = price * quantity;
            const isSecondCommander = card.isSecondCommander;

            return (
              <div
                key={card.id}
                className="grid grid-cols-[40px_1fr_auto_auto_40px] gap-4 items-center px-4 py-2 border-b border-white/3 transition-all hover:bg-white/5 cursor-pointer last:border-b-0"
                onClick={() => onCardClick(card)}
              >
                <div className="text-text-secondary font-semibold text-center">
                  {quantity}
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-text-primary font-medium cursor-pointer transition-colors hover:text-magic-blue">
                    {card.name}
                  </div>
                  {isSecondCommander && (
                    <span className="text-xs bg-magic-purple/20 text-magic-purple px-2 py-0.5 rounded">
                      2nd Commander
                    </span>
                  )}
                </div>
                <div
                  className="flex gap-1 items-center"
                  dangerouslySetInnerHTML={{
                    __html: parseManaSymbols(card.mana_cost) || '',
                  }}
                />
                <div className="text-text-secondary text-sm font-semibold min-w-[60px] text-right">
                  ${totalCardPrice.toFixed(2)}
                </div>
                <button
                  className="bg-transparent border border-red-500/30 text-red-500 w-7 h-7 rounded-full cursor-pointer font-semibold transition-all flex items-center justify-center text-sm hover:bg-red-500 hover:text-white hover:border-red-500"
                  onClick={e => {
                    e.stopPropagation();
                    if (isSecondCommander && onRemoveSecondCommander) {
                      onRemoveSecondCommander();
                    } else if (
                      card.isCommander &&
                      !isSecondCommander &&
                      onChangeCommander
                    ) {
                      // Main commander removed: reset deck and go back to commander search
                      onChangeCommander();
                    } else {
                      handleRemoveCard(card.id);
                    }
                  }}
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <section className="mb-8">
      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <span className="text-xl">📋</span>
            Your Deck
            <span className="text-magic-blue">{deckCount}/100</span>
          </h2>
          <div className="flex gap-3">
            {onChangeCommander && (
              <button
                className="px-4 py-2 bg-white/10 text-text-primary border border-white/10 rounded-lg text-sm font-semibold cursor-pointer transition-all inline-flex items-center gap-2 hover:bg-white/15 hover:border-magic-blue"
                onClick={onChangeCommander}
              >
                🔄 Change Commander
              </button>
            )}
            <button
              className="px-6 py-3 bg-white/10 text-text-primary border border-white/10 rounded-lg text-base font-semibold cursor-pointer transition-all inline-flex items-center gap-2 hover:bg-white/15 hover:border-magic-blue disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleOpenCopyModal}
              disabled={deck.length === 0}
            >
              📋 Copy Deck
            </button>
            <button
              className="px-6 py-3 bg-white/10 text-text-primary border border-white/10 rounded-lg text-base font-semibold cursor-pointer transition-all inline-flex items-center gap-2 hover:bg-white/15 hover:border-magic-blue"
              onClick={handleClearDeck}
            >
              Clear Deck
            </button>
          </div>
        </div>

        {/* Warning if second commander is required but not selected */}
        {requiresSecondCommander && !secondCommander && (
          <div className="mb-4 p-4 bg-red-500/10 border-2 border-red-500/30 rounded-lg animate-pulse">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="text-red-400 font-bold text-base">
                    Second Commander Required!
                  </p>
                  <p className="text-red-300 text-sm">
                    {commander?.name} requires a second commander to complete
                    your deck.
                  </p>
                </div>
              </div>
              {onOpenPartnerSearch && (
                <button
                  onClick={() => {
                    onOpenPartnerSearch();
                    // Scroll to partner selector
                    document
                      .getElementById('partner-selector')
                      ?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                      });
                  }}
                  className="px-6 py-3 bg-magic-purple/30 text-magic-purple border-2 border-magic-purple/50 rounded-lg text-base font-bold cursor-pointer transition-all hover:bg-magic-purple hover:text-white whitespace-nowrap flex items-center gap-2"
                >
                  🔍 Search 2nd Commander
                </button>
              )}
            </div>
          </div>
        )}

        <div className="min-h-[400px]">
          <div className="flex flex-col gap-6">
            {renderCardGroup('Commander', organizedDeck.commander)}
            {renderCardGroup('Instants', organizedDeck.instants)}
            {renderCardGroup('Creatures', organizedDeck.creatures)}
            {renderCardGroup('Artifacts', organizedDeck.artifacts)}
            {renderCardGroup('Sorceries', organizedDeck.sorceries)}
            {renderCardGroup('Enchantments', organizedDeck.enchantments)}
            {renderCardGroup('Planeswalkers', organizedDeck.planeswalkers)}
            {renderCardGroup('Lands', organizedDeck.lands)}
            {renderCardGroup('Other', organizedDeck.other)}
            {deck.length === 0 && (
              <p className="text-text-secondary text-center py-8">
                Your deck is empty. Add cards to get started!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Copy Deck Modal */}
      {showCopyModal && (
        <div className="fixed inset-0 z-[10000] flex justify-center items-center p-8">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleCloseCopyModal}
          ></div>
          <div className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto z-10 glass-card p-6">
            <div className="absolute top-6 right-6 flex items-center gap-2 z-10">
              <button
                className="w-10 h-10 bg-white/10 border border-white/10 rounded-full text-text-primary text-xl cursor-pointer transition-all flex items-center justify-center hover:bg-red-500/30 hover:border-red-500 hover:text-red-500"
                onClick={handleCloseCopyModal}
                title="Close"
              >
                &times;
              </button>
            </div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2 mb-2">
                <span className="text-xl">📋</span>
                Deck List
              </h2>
              <p className="text-text-secondary text-sm">
                Edit your deck list below, then copy to clipboard
              </p>
            </div>
            <textarea
              value={deckText}
              onChange={e => setDeckText(e.target.value)}
              className="w-full h-[60vh] min-h-[400px] bg-white/5 border border-white/20 rounded-lg p-4 text-text-primary font-mono text-sm leading-relaxed resize-none focus:outline-none focus:border-magic-blue focus:ring-2 focus:ring-magic-blue/20"
              placeholder="Deck list will appear here..."
            />
            <div className="flex justify-end items-center gap-3 mt-6 pt-6 border-t border-white/10">
              <button
                className="px-6 py-3 bg-white/10 text-text-primary border border-white/10 rounded-lg text-base font-semibold cursor-pointer transition-all inline-flex items-center gap-2 hover:bg-white/15 hover:border-magic-blue"
                onClick={handleCloseCopyModal}
              >
                Cancel
              </button>
              <button
                className="px-6 py-3 bg-gradient-to-r from-magic-blue to-magic-purple text-white text-base font-semibold rounded-lg cursor-pointer transition-all inline-flex items-center gap-2 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(59,130,246,0.4)] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                onClick={handleCopyFromModal}
                disabled={!deckText.trim()}
              >
                {copySuccess ? '✓ Copied!' : '📋 Copy to Clipboard'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default DeckBuilder;
