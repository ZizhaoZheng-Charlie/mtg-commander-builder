/**
 * File-based Cache for Card Library
 * Uses JSON files to store the large card library dataset (~25MB)
 * Files are named with timestamps for versioning: cardlibrary_{timestamp}.json
 */

import type { ScryfallCard } from '../types/scryfall';

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_DIR_NAME = 'card-library-cache';
const FILE_PREFIX = 'cardlibrary_';

interface CachedLibrary {
  cards: ScryfallCard[];
  timestamp: number;
  version: string;
}

// Type definition for electron API
interface ElectronFS {
  getUserDataPath: () => Promise<string>;
  writeFile: (
    filePath: string,
    data: string
  ) => Promise<{ success: boolean; error?: string }>;
  readFile: (
    filePath: string
  ) => Promise<{ success: boolean; data?: string; error?: string }>;
  deleteFile: (
    filePath: string
  ) => Promise<{ success: boolean; error?: string }>;
  fileExists: (filePath: string) => Promise<boolean>;
  readDir: (
    dirPath: string
  ) => Promise<{ success: boolean; files?: string[]; error?: string }>;
  ensureDir: (dirPath: string) => Promise<{ success: boolean; error?: string }>;
}

declare global {
  interface Window {
    electronAPI?: {
      fs: ElectronFS;
    };
  }
}

class CardLibraryCache {
  private cacheDir: string | null = null;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize the cache directory
   */
  private async init(): Promise<void> {
    if (this.cacheDir) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        // Check if we're in Electron environment
        if (typeof window === 'undefined' || !window.electronAPI?.fs) {
          console.warn('Electron API not available, file caching disabled');
          return;
        }

        const userDataPath = await window.electronAPI.fs.getUserDataPath();
        this.cacheDir = `${userDataPath}/${CACHE_DIR_NAME}`;

        // Ensure the cache directory exists
        const result = await window.electronAPI.fs.ensureDir(this.cacheDir);
        if (result.success) {
          console.log('✅ Cache directory initialized:', this.cacheDir);
        } else {
          console.error('Failed to create cache directory:', result.error);
          this.cacheDir = null;
        }
      } catch (error) {
        console.error('Error initializing cache directory:', error);
        this.cacheDir = null;
      }
    })();

    return this.initPromise;
  }

  /**
   * Get the path for the latest cache file
   */
  private async getLatestCacheFile(): Promise<string | null> {
    try {
      await this.init();
      if (!this.cacheDir || !window.electronAPI?.fs) return null;

      const result = await window.electronAPI.fs.readDir(this.cacheDir);
      if (!result.success || !result.files) {
        return null;
      }

      // Filter for cache files and sort by timestamp (descending)
      const cacheFiles = result.files
        .filter(file => file.startsWith(FILE_PREFIX) && file.endsWith('.json'))
        .map(file => {
          const timestampStr = file
            .replace(FILE_PREFIX, '')
            .replace('.json', '');
          const timestamp = parseInt(timestampStr, 10);
          return { file, timestamp };
        })
        .filter(item => !isNaN(item.timestamp))
        .sort((a, b) => b.timestamp - a.timestamp);

      if (cacheFiles.length === 0) {
        return null;
      }

      return `${this.cacheDir}/${cacheFiles[0].file}`;
    } catch (error) {
      console.error('Error finding latest cache file:', error);
      return null;
    }
  }

  /**
   * Generate a new cache file path with current timestamp
   */
  private async getNewCacheFilePath(): Promise<string | null> {
    await this.init();
    if (!this.cacheDir) return null;

    const timestamp = Date.now();
    return `${this.cacheDir}/${FILE_PREFIX}${timestamp}.json`;
  }

  /**
   * Get cached card library
   */
  async get(): Promise<ScryfallCard[] | null> {
    try {
      if (!window.electronAPI?.fs) {
        console.warn('Electron API not available');
        return null;
      }

      const latestFile = await this.getLatestCacheFile();
      if (!latestFile) {
        console.log('No cached card library found');
        return null;
      }

      const exists = await window.electronAPI.fs.fileExists(latestFile);
      if (!exists) {
        console.log("Cache file doesn't exist");
        return null;
      }

      // Read the file
      const result = await window.electronAPI.fs.readFile(latestFile);
      if (!result.success || !result.data) {
        console.error('Failed to read cache file:', result.error);
        return null;
      }

      const cached: CachedLibrary = JSON.parse(result.data);

      const now = Date.now();
      const age = now - cached.timestamp;
      const ageHours = Math.round(age / 1000 / 60 / 60);

      // Check if cache is expired (older than 24 hours)
      if (age > CACHE_DURATION) {
        console.log(`Card library cache expired (age: ${ageHours}h)`);
        this.clear(); // Clear expired cache
        return null;
      }

      console.log(
        `✅ Card library cache hit! (age: ${ageHours}h, cards: ${cached.cards.length.toLocaleString()}, file: ${latestFile
          .split('/')
          .pop()})`
      );
      return cached.cards;
    } catch (error) {
      console.error('Error reading card library cache:', error);
      return null;
    }
  }

  /**
   * Save card library to cache as JSON file with timestamp
   */
  async set(cards: ScryfallCard[]): Promise<void> {
    try {
      if (!window.electronAPI?.fs) {
        console.warn('Electron API not available, cannot cache');
        return;
      }

      const filePath = await this.getNewCacheFilePath();
      if (!filePath) {
        console.error('Failed to generate cache file path');
        return;
      }

      const timestamp = Date.now();
      const cacheData: CachedLibrary = {
        cards,
        timestamp,
        version: '1.0',
      };

      const jsonData = JSON.stringify(cacheData);
      const result = await window.electronAPI.fs.writeFile(filePath, jsonData);

      if (result.success) {
        const fileName =
          filePath.split('/').pop() || filePath.split('\\').pop();
        console.log(
          `✅ Card library cached successfully (${cards.length.toLocaleString()} cards) to: ${fileName}`
        );

        // Clean up old cache files
        await this.cleanupOldFiles();
      } else {
        console.error('Failed to cache card library:', result.error);
      }
    } catch (error) {
      console.error('Error caching card library:', error);
    }
  }

  /**
   * Delete old cache files (keep only the latest 3)
   */
  private async cleanupOldFiles(): Promise<void> {
    try {
      if (!this.cacheDir || !window.electronAPI?.fs) return;

      const result = await window.electronAPI.fs.readDir(this.cacheDir);
      if (!result.success || !result.files) return;

      // Get all cache files sorted by timestamp
      const cacheFiles = result.files
        .filter(file => file.startsWith(FILE_PREFIX) && file.endsWith('.json'))
        .map(file => {
          const timestampStr = file
            .replace(FILE_PREFIX, '')
            .replace('.json', '');
          const timestamp = parseInt(timestampStr, 10);
          return { file, timestamp };
        })
        .filter(item => !isNaN(item.timestamp))
        .sort((a, b) => b.timestamp - a.timestamp);

      // Keep only the latest 3 files, delete the rest
      const filesToDelete = cacheFiles.slice(3);

      for (const item of filesToDelete) {
        const filePath = `${this.cacheDir}/${item.file}`;
        const deleteResult = await window.electronAPI.fs.deleteFile(filePath);
        if (deleteResult.success) {
          console.log(`🗑️ Deleted old cache file: ${item.file}`);
        }
      }
    } catch (error) {
      console.error('Error cleaning up old cache files:', error);
    }
  }

  /**
   * Clear cached card library (delete latest cache file)
   */
  async clear(): Promise<void> {
    try {
      if (!window.electronAPI?.fs) return;

      const latestFile = await this.getLatestCacheFile();
      if (!latestFile) {
        console.log('No cache file to clear');
        return;
      }

      const result = await window.electronAPI.fs.deleteFile(latestFile);
      if (result.success) {
        const fileName =
          latestFile.split('/').pop() || latestFile.split('\\').pop();
        console.log(`Card library cache cleared: ${fileName}`);
      } else {
        console.error('Failed to clear cache:', result.error);
      }
    } catch (error) {
      console.error('Error clearing card library cache:', error);
    }
  }

  /**
   * Check if cache exists and is valid
   */
  async has(): Promise<boolean> {
    const cached = await this.get();
    return cached !== null;
  }

  /**
   * Get cache info
   */
  async getInfo(): Promise<{
    exists: boolean;
    age?: number;
    cardCount?: number;
    fileName?: string;
  } | null> {
    try {
      if (!window.electronAPI?.fs) return null;

      const latestFile = await this.getLatestCacheFile();
      if (!latestFile) {
        return { exists: false };
      }

      const exists = await window.electronAPI.fs.fileExists(latestFile);
      if (!exists) {
        return { exists: false };
      }

      const result = await window.electronAPI.fs.readFile(latestFile);
      if (!result.success || !result.data) {
        return { exists: false };
      }

      const cached: CachedLibrary = JSON.parse(result.data);
      const age = Date.now() - cached.timestamp;
      const fileName =
        latestFile.split('/').pop() || latestFile.split('\\').pop();

      return {
        exists: true,
        age,
        cardCount: cached.cards.length,
        fileName,
      };
    } catch (error) {
      console.error('Error getting cache info:', error);
      return null;
    }
  }

  /**
   * Clear all cache files (useful for debugging)
   */
  async clearAll(): Promise<void> {
    try {
      if (!this.cacheDir || !window.electronAPI?.fs) return;

      const result = await window.electronAPI.fs.readDir(this.cacheDir);
      if (!result.success || !result.files) return;

      const cacheFiles = result.files.filter(
        file => file.startsWith(FILE_PREFIX) && file.endsWith('.json')
      );

      for (const file of cacheFiles) {
        const filePath = `${this.cacheDir}/${file}`;
        const deleteResult = await window.electronAPI.fs.deleteFile(filePath);
        if (deleteResult.success) {
          console.log(`🗑️ Deleted cache file: ${file}`);
        }
      }

      console.log('All card library cache files cleared');
    } catch (error) {
      console.error('Error clearing all cache files:', error);
    }
  }
}

// Export singleton instance
export const cardLibraryCache = new CardLibraryCache();
