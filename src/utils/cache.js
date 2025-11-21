// Cache configuration
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
const CACHE_PREFIX = 'mtg_commander_';

// Persistent cache using localStorage with timestamps
export const cache = {
  // Get item from localStorage cache
  get(key) {
    try {
      const cacheKey = CACHE_PREFIX + key;
      const cached = localStorage.getItem(cacheKey);

      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is expired (older than 1 hour)
      if (now - timestamp > CACHE_DURATION) {
        console.log(`Cache expired for: ${key}`);
        localStorage.removeItem(cacheKey);
        return null;
      }

      console.log(
        `Cache hit for: ${key} (age: ${Math.round((now - timestamp) / 1000 / 60)}min)`
      );
      return data;
    } catch (error) {
      console.error('Error reading from cache:', error);
      return null;
    }
  },

  // Set item in localStorage cache with timestamp
  set(key, data) {
    try {
      const cacheKey = CACHE_PREFIX + key;
      const cacheData = {
        data: data,
        timestamp: Date.now(),
      };

      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      console.log(`Cached: ${key}`);
    } catch (error) {
      console.error('Error writing to cache:', error);
      // If localStorage is full, clear old MTG cache entries
      if (error.name === 'QuotaExceededError') {
        this.clearOldEntries();
        // Try again after clearing
        try {
          localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        } catch (retryError) {
          console.error('Still failed to cache after clearing:', retryError);
        }
      }
    }
  },

  // Check if item exists and is valid
  has(key) {
    return this.get(key) !== null;
  },

  // Clear all MTG Commander cache entries
  clearAll() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    console.log('All cache cleared');
  },

  // Clear entries older than 1 hour
  clearOldEntries() {
    const keys = Object.keys(localStorage);
    const now = Date.now();
    let cleared = 0;

    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const { timestamp } = JSON.parse(cached);
            if (now - timestamp > CACHE_DURATION) {
              localStorage.removeItem(key);
              cleared++;
            }
          }
        } catch (error) {
          // If parse fails, remove the corrupted entry
          localStorage.removeItem(key);
          cleared++;
        }
      }
    });

    console.log(`Cleared ${cleared} old cache entries`);
  },
};
