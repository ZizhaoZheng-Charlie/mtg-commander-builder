import { useState, useEffect } from 'react';
import { cardLibrary } from '../utils/cardLibrary';

function LibraryLoadingBanner() {
  const [isLoaded, setIsLoaded] = useState(cardLibrary.isLoaded);
  const [isLoading, setIsLoading] = useState(cardLibrary.isLoading);
  const [error, setError] = useState(cardLibrary.loadError);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Subscribe to library load events
    const unsubscribe = cardLibrary.onLibraryLoaded(() => {
      setIsLoaded(true);
      setIsLoading(false);
      setError(null);
      setStats(cardLibrary.getStats());
    });

    // Check initial state
    if (cardLibrary.isLoaded) {
      setIsLoaded(true);
      setStats(cardLibrary.getStats());
    }
    if (cardLibrary.loadError) {
      setError(cardLibrary.loadError);
      setIsLoading(false);
    }

    return unsubscribe;
  }, []);

  // Don't show anything if loaded successfully
  if (isLoaded && !error) {
    return null;
  }

  if (error) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-red-500/90 backdrop-blur-sm text-white px-6 py-4 shadow-lg">
        <div className="container mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-semibold">Failed to load card library</p>
              <p className="text-sm opacity-90">
                Some search features may be limited. Try refreshing the page.
              </p>
            </div>
          </div>
          <button
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
            onClick={() => window.location.reload()}
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-magic-blue/90 backdrop-blur-sm text-white px-6 py-4 shadow-lg">
        <div className="container mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="animate-spin text-2xl">⚙️</div>
            <div>
              <p className="font-semibold">Loading card library...</p>
              <p className="text-sm opacity-90">
                Downloading ~70,000+ cards from Scryfall (~25MB). This may take
                5-15 seconds.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white animate-[loading_2s_ease-in-out_infinite] w-1/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default LibraryLoadingBanner;
