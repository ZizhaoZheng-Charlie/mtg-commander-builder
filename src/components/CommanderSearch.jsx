import { useState, useEffect, useRef } from 'react';
import { cardLibrary } from '../utils/cardLibrary';
import CardModal from './CardModal';

function CommanderSearch({ onCommanderSelect, setLoading }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedCommanderForModal, setSelectedCommanderForModal] =
    useState(null);
  const debounceTimerRef = useRef(null);

  const handleSearch = async (searchQuery) => {
    const trimmedQuery = searchQuery?.trim() || query.trim();
    
    if (!trimmedQuery) {
      setResults([]);
      return;
    }

    if (!cardLibrary.isLoaded) {
      console.warn('Card library is still loading...');
      return;
    }

    setLoading(true);

    try {
      const commanders = cardLibrary.searchCommanders(trimmedQuery);
      setResults(commanders);
      console.log(`Found ${commanders.length} commanders`);
    } catch (error) {
      console.error('Commander search error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-search as user types with debouncing
  useEffect(() => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Clear results if query is empty
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    // Wait 300ms after user stops typing before searching
    debounceTimerRef.current = setTimeout(() => {
      handleSearch(query);
    }, 300);

    // Cleanup function
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query]);

  const handleKeyPress = e => {
    if (e.key === 'Enter') {
      // Clear debounce timer and search immediately
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      handleSearch(query);
    }
  };

  const handleCommanderClick = commander => {
    setSelectedCommanderForModal(commander);
  };

  const handleAddCommander = () => {
    onCommanderSelect(selectedCommanderForModal);
    setSelectedCommanderForModal(null);
    setResults([]);
    setQuery('');
  };

  return (
    <>
      <section className="glass-card p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6 text-text-primary">
          Find Your Commander
          <span className="text-sm font-normal text-text-secondary ml-2">
            (
            {cardLibrary.isLoaded ? 'Local search ready' : 'Loading library...'}
            )
          </span>
        </h2>
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            className="flex-1 px-4 py-3 bg-white/5 border-2 border-white/10 rounded-lg text-text-primary text-base font-sans transition-all focus:outline-none focus:border-magic-blue focus:bg-white/10 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] placeholder:text-text-muted"
            placeholder="Start typing to search for commanders..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            autoComplete="off"
          />
          <button
            className="px-6 py-3 bg-gradient-to-r from-magic-blue to-magic-purple text-white text-base font-semibold rounded-lg cursor-pointer transition-all inline-flex items-center gap-2 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(59,130,246,0.4)] active:translate-y-0 whitespace-nowrap"
            onClick={() => {
              if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
              }
              handleSearch(query);
            }}
          >
            <span className="text-xl">🔍</span>
            Search
          </button>
        </div>
        {results.length > 0 && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
            {results.map(commander => {
              const imageUri =
                commander.image_uris?.normal ||
                (commander.card_faces &&
                  commander.card_faces[0]?.image_uris?.normal) ||
                '';

              return (
                <div
                  key={commander.id}
                  className="bg-white/5 border border-white/10 rounded-lg p-6 cursor-pointer transition-all hover:transform hover:-translate-y-1 hover:scale-[1.02] hover:border-magic-purple hover:shadow-[0_10px_30px_rgba(139,92,246,0.3)] animate-[fadeIn_0.5s_ease-in-out]"
                  onClick={() => handleCommanderClick(commander)}
                >
                  {imageUri && (
                    <img
                      src={imageUri}
                      alt={commander.name}
                      className="w-full rounded-lg mb-4"
                    />
                  )}
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    {commander.name}
                  </h3>
                  <p className="text-text-secondary">
                    {commander.type_line || 'Legendary Creature'}
                  </p>
                </div>
              );
            })}
          </div>
        )}
        {results.length === 0 && query.trim() && cardLibrary.isLoaded && (
          <div className="text-center py-8">
            <p className="text-text-secondary">
              No commanders found. Try a different search term.
            </p>
          </div>
        )}
      </section>

      <CardModal
        card={selectedCommanderForModal}
        onClose={() => setSelectedCommanderForModal(null)}
        actionButton={{
          label: 'Add Commander',
          icon: '⚔️',
          onClick: handleAddCommander,
        }}
        isCommanderModal={true}
      />
    </>
  );
}

export default CommanderSearch;
