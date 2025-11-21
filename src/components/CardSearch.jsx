import { useState, useMemo } from 'react';
import { cardLibrary } from '../utils/cardLibrary';

function CardSearch({
  onAddToDeck,
  onCardClick,
  setLoading,
  commander,
  secondCommander,
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  // Combine color identities from both commanders
  const combinedColorIdentity = useMemo(() => {
    if (!commander) return null;

    const colors = new Set(commander.color_identity || []);

    // Add second commander's colors if present
    if (secondCommander && secondCommander.color_identity) {
      secondCommander.color_identity.forEach(color => colors.add(color));
    }

    return Array.from(colors).sort();
  }, [commander, secondCommander]);

  const handleSearch = async () => {
    if (!query.trim()) return;

    if (!cardLibrary.isLoaded) {
      alert('Card library is still loading. Please wait a moment.');
      return;
    }

    setLoading(true);

    try {
      const searchQuery = query.trim();
      // Use combined color identity for filtering
      const cards = cardLibrary.lexicalSearch(
        searchQuery,
        100,
        combinedColorIdentity
      );

      setResults(cards);
      console.log(
        `Found ${cards.length} cards matching combined color identity:`,
        combinedColorIdentity
      );
    } catch (error) {
      console.error('Search error:', error);
      alert('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = e => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleAddToDeck = (e, card) => {
    e.stopPropagation();
    onAddToDeck(card);
  };

  return (
    <section className="glass-card p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6 text-text-primary flex items-center gap-2">
        <span className="text-xl">🔎</span>
        Card Search
        <span className="text-sm font-normal text-text-secondary ml-2">
          (
          {cardLibrary.isLoaded
            ? `${cardLibrary.cards.length.toLocaleString()} cards loaded`
            : 'Loading...'}
          )
        </span>
        {commander && (
          <span className="text-sm font-normal text-magic-blue ml-2">
            Filtered by {commander.name}
            {secondCommander && ` + ${secondCommander.name}`}'s color identity
            {combinedColorIdentity && ` (${combinedColorIdentity.join('')})`}
          </span>
        )}
      </h2>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          className="flex-1 px-4 py-3 bg-white/5 border-2 border-white/10 rounded-lg text-text-primary text-base font-sans transition-all focus:outline-none focus:border-magic-blue focus:bg-white/10 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] placeholder:text-text-muted"
          placeholder="Search for cards by name or text..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          autoComplete="off"
        />
        <button
          className="px-6 py-3 bg-gradient-to-r from-magic-blue to-magic-purple text-white text-base font-semibold rounded-lg cursor-pointer transition-all inline-flex items-center gap-2 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(59,130,246,0.4)] active:translate-y-0 whitespace-nowrap"
          onClick={handleSearch}
        >
          <span className="text-xl">🔍</span>
          Search
        </button>
      </div>
      {results.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-6">
          {results.map(card => {
            const imageUri =
              card.image_uris?.normal ||
              (card.card_faces && card.card_faces[0]?.image_uris?.normal) ||
              '';

            return (
              <div
                key={card.id}
                className="bg-white/3 border border-white/10 rounded-lg overflow-hidden cursor-pointer transition-all relative hover:-translate-y-1 hover:scale-[1.02] hover:border-magic-purple hover:shadow-[0_10px_30px_rgba(139,92,246,0.3)] animate-[fadeIn_0.5s_ease-in-out]"
                onClick={() => onCardClick(card)}
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
                  <p className="text-sm text-text-secondary">
                    {card.type_line || 'Card'}
                  </p>
                </div>
                <button
                  className="absolute bottom-4 right-4 px-3 py-1 bg-magic-blue/20 text-magic-blue text-sm font-semibold rounded border border-magic-blue/30 hover:bg-magic-blue hover:text-white transition-all"
                  onClick={e => handleAddToDeck(e, card)}
                >
                  + Add
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default CardSearch;
