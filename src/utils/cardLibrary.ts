/**
 * Card Library Service
 * Fetches and manages the complete Scryfall card library for local searching
 */

import { API } from './constants';
import { cardLibraryCache } from './cardLibraryCache';
import type {
  ScryfallCard,
  ScryfallBulkDataList,
  LibraryStats,
} from '../types/scryfall';

class CardLibrary {
  public cards: ScryfallCard[] = [];
  public isLoaded: boolean = false;
  public isLoading: boolean = false;
  public loadError: Error | null = null;
  private listeners: Array<(cards: ScryfallCard[]) => void> = [];

  constructor() {
    // Empty constructor - properties initialized above
  }

  /**
   * Fetch the bulk data download URI from Scryfall
   */
  async getBulkDataUri(): Promise<string> {
    try {
      console.log('Fetching bulk data list from Scryfall...');
      const response = await fetch(`${API.SCRYFALL}/bulk-data`, {
        headers: {
          'User-Agent': API.USER_AGENT,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch bulk data list: ${response.status} ${response.statusText}`
        );
      }

      const data: ScryfallBulkDataList = await response.json();

      // Find the "Oracle Cards" bulk data - this is the default/standard card data
      const oracleCards = data.data.find(item => item.type === 'oracle_cards');

      if (!oracleCards) {
        throw new Error('Oracle cards bulk data not found');
      }

      console.log('Bulk data info:', {
        size: `${(oracleCards.compressed_size / 1024 / 1024).toFixed(2)} MB`,
        updated: oracleCards.updated_at,
        name: oracleCards.name,
      });

      return oracleCards.download_uri;
    } catch (error) {
      console.error('Error fetching bulk data URI:', error);
      throw error;
    }
  }

  /**
   * Load EDHREC reference data to supplement Scryfall data
   */
  private async loadEDHRECCommanders(): Promise<ScryfallCard[]> {
    try {
      console.log('📥 Loading EDHREC reference commanders...');

      // Import the EDHREC data directly
      const edhrecData = await import('../../reference/edhrec.json');
      const commanders = edhrecData.default || edhrecData;

      if (!Array.isArray(commanders)) {
        console.warn('Invalid EDHREC reference format');
        return [];
      }

      console.log(
        `✅ Loaded ${commanders.length} commanders from EDHREC reference`
      );
      return commanders as ScryfallCard[];
    } catch (error) {
      console.warn('Error loading EDHREC reference data:', error);
      return [];
    }
  }

  /**
   * Download and load the complete card library
   */
  async loadLibrary(): Promise<ScryfallCard[]> {
    if (this.isLoaded || this.isLoading) {
      console.log('Card library already loaded or loading...');
      return this.cards;
    }

    this.isLoading = true;
    this.loadError = null;
    console.log('🎴 Starting to load Scryfall card library...');

    try {
      // Try to load from cache first
      console.log('🔍 Checking IndexedDB cache...');
      const cachedCards = await cardLibraryCache.get();

      if (cachedCards && cachedCards.length > 0) {
        console.log(
          `✅ Loaded from cache! ${cachedCards.length.toLocaleString()} cards`
        );
        this.cards = cachedCards;

        // Still supplement with EDHREC data even when using cache
        const edhrecCommanders = await this.loadEDHRECCommanders();
        if (edhrecCommanders.length > 0) {
          this.cards = this.mergeCardData(this.cards, edhrecCommanders);
          console.log(
            `✅ Total cards after EDHREC merge: ${this.cards.length.toLocaleString()}`
          );
        }

        this.isLoaded = true;
        this.isLoading = false;
        this.notifyListeners();
        return this.cards;
      }

      console.log('Cache miss - downloading from Scryfall...');

      // Get the download URI
      const downloadUri = await this.getBulkDataUri();

      // Download the card data
      console.log('📥 Downloading card data from:', downloadUri);
      const response = await fetch(downloadUri, {
        headers: {
          Accept: 'application/json',
          'User-Agent': API.USER_AGENT,
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to download card library: ${response.status} ${response.statusText}`
        );
      }

      // Check content type
      const contentType = response.headers.get('content-type');
      console.log('Response content type:', contentType);

      // Parse the JSON
      console.log('Parsing card data...');
      let cards: ScryfallCard[] = await response.json();

      if (!Array.isArray(cards)) {
        throw new Error('Invalid card data format - expected array');
      }

      // Supplement with EDHREC commanders
      const edhrecCommanders = await this.loadEDHRECCommanders();
      if (edhrecCommanders.length > 0) {
        cards = this.mergeCardData(cards, edhrecCommanders);
      }

      this.cards = cards;
      this.isLoaded = true;
      this.isLoading = false;

      console.log(
        `✅ Card library loaded successfully! ${cards.length.toLocaleString()} cards available.`
      );

      // Cache the cards for next time
      console.log('💾 Caching card library to IndexedDB...');
      cardLibraryCache.set(cards).catch(err => {
        console.warn('Failed to cache card library:', err);
        // Don't throw - caching failure shouldn't break the app
      });

      // Notify listeners
      this.notifyListeners();

      return cards;
    } catch (error) {
      console.error('❌ Error loading card library:', error);
      this.loadError = error as Error;
      this.isLoading = false;
      throw error;
    }
  }

  /**
   * Merge EDHREC commanders with Scryfall data
   * Adds new cards that don't exist in Scryfall yet
   */
  private mergeCardData(
    scryfallCards: ScryfallCard[],
    edhrecCards: ScryfallCard[]
  ): ScryfallCard[] {
    const cardMap = new Map<string, ScryfallCard>();

    // Add all Scryfall cards
    scryfallCards.forEach(card => {
      cardMap.set(card.name.toLowerCase(), card);
    });

    // Add EDHREC cards that don't exist in Scryfall
    let newCardsAdded = 0;
    edhrecCards.forEach(card => {
      const key = card.name.toLowerCase();
      if (!cardMap.has(key)) {
        cardMap.set(key, card);
        newCardsAdded++;
      }
    });

    if (newCardsAdded > 0) {
      console.log(
        `➕ Added ${newCardsAdded} new commanders from EDHREC reference`
      );
    }

    return Array.from(cardMap.values());
  }

  /**
   * Subscribe to library load events
   */
  onLibraryLoaded(callback: (cards: ScryfallCard[]) => void): () => void {
    this.listeners.push(callback);

    // If already loaded, call immediately
    if (this.isLoaded) {
      callback(this.cards);
    }

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach(callback => {
      try {
        callback(this.cards);
      } catch (error) {
        console.error('Error in library loaded callback:', error);
      }
    });
  }

  /**
   * Check if a card is legal in Commander format
   */
  private isCommanderLegal(card: ScryfallCard): boolean {
    return card.legalities?.commander === 'legal';
  }

  /**
   * Extract colors from oracle text by detecting land type references
   * Maps land types to their mana colors:
   * Forest = {G}, Island = {U}, Mountain = {R}, Swamp = {B}, Plains = {W}, Wastes = {C}
   */
  private extractColorsFromOracleText(card: ScryfallCard): string[] {
    const colors = new Set<string>();

    // Combine oracle text from main card and all card_faces
    const allOracleText = [
      card.oracle_text || '',
      ...(card.card_faces?.map(face => face.oracle_text || '') || []),
    ]
      .filter(text => text)
      .join(' ')
      .toLowerCase();

    if (!allOracleText) return [];

    // Map land types to their mana colors
    const landTypeMap: { [key: string]: string } = {
      forest: 'G',
      island: 'U',
      mountain: 'R',
      swamp: 'B',
      plains: 'W',
      wastes: 'C',
    };

    // Check for land type references in oracle text
    // Look for patterns like "Forest", "Island", "Mountain", "Swamp", "Plains", "Wastes"
    // Match whole words to avoid false positives (e.g., "Forest" not "Forests")
    Object.keys(landTypeMap).forEach(landType => {
      // Use word boundary regex to match whole words only
      const regex = new RegExp(`\\b${landType}\\b`, 'i');
      if (regex.test(allOracleText)) {
        const color = landTypeMap[landType];
        colors.add(color);
      }
    });

    return Array.from(colors);
  }

  /**
   * Check if a card's color identity is valid for a commander's color identity
   * This includes checking both the card's color_identity field and colors
   * that can be produced from oracle text (e.g., land type references)
   */
  private isValidColorIdentity(
    card: ScryfallCard,
    commanderColorIdentity: string[] | null
  ): boolean {
    // If no commander is specified, allow all cards
    if (!commanderColorIdentity) return true;

    // Get colors from card's color_identity field
    const cardColorIdentity = card.color_identity || [];

    // Extract colors from oracle text (e.g., land type references)
    const oracleTextColors = this.extractColorsFromOracleText(card);

    // Combine all colors the card can produce or use
    const allCardColors = new Set([...cardColorIdentity, ...oracleTextColors]);

    // If card has no color identity and no oracle text colors (truly colorless), it's always allowed
    if (allCardColors.size === 0) return true;

    // Check if every color in the card's identity (including oracle text colors)
    // is in the commander's identity
    return Array.from(allCardColors).every(color =>
      commanderColorIdentity.includes(color)
    );
  }

  /**
   * Lexical search - exact text matching in name and oracle text
   */
  lexicalSearch(
    query: string,
    limit: number = 100,
    commanderColorIdentity: string[] | null = null
  ): ScryfallCard[] {
    if (!this.isLoaded) {
      console.warn('Card library not loaded yet');
      return [];
    }

    const queryLower = query.toLowerCase().trim();
    const queryNoSpaces = queryLower.replace(/\s+/g, '');

    const results = this.cards
      .filter(card => this.isCommanderLegal(card))
      .filter(card => this.isValidColorIdentity(card, commanderColorIdentity))
      .filter(card => {
        const nameLower = card.name.toLowerCase();
        const nameNoSpaces = nameLower.replace(/\s+/g, '');

        // Search in name (exact match)
        if (nameLower.includes(queryLower)) return true;

        // Search in name (without spaces to handle "counter spell" vs "Counterspell")
        if (nameNoSpaces.includes(queryNoSpaces)) return true;

        // Search in oracle text
        if (
          card.oracle_text &&
          card.oracle_text.toLowerCase().includes(queryLower)
        )
          return true;

        return false;
      });

    return results.slice(0, limit);
  }

  /**
   * Semantic search - searches by card attributes, mechanics, and relationships
   */
  semanticSearch(
    query: string,
    limit: number = 100,
    commanderColorIdentity: string[] | null = null
  ): ScryfallCard[] {
    if (!this.isLoaded) {
      console.warn('Card library not loaded yet');
      return [];
    }

    const queryLower = query.toLowerCase().trim();
    const searchTerms = queryLower.split(/\s+/);

    const results = this.cards
      .filter(card => this.isCommanderLegal(card))
      .filter(card => this.isValidColorIdentity(card, commanderColorIdentity))
      .map(card => {
        let score = 0;
        const cardData = {
          name: card.name.toLowerCase(),
          text: (card.oracle_text || '').toLowerCase(),
          type: (card.type_line || '').toLowerCase(),
          colors: (card.colors || []).join('').toLowerCase(),
          colorIdentity: (card.color_identity || []).join('').toLowerCase(),
          keywords: (card.keywords || []).map(k => k.toLowerCase()),
          manaValue: card.cmc || 0,
          power: card.power,
          toughness: card.toughness,
          loyalty: card.loyalty,
        };

        // Score based on matching in different fields
        searchTerms.forEach(term => {
          // Name match (highest weight)
          if (cardData.name.includes(term)) score += 10;

          // Oracle text match (high weight)
          if (cardData.text.includes(term)) score += 5;

          // Type line match
          if (cardData.type.includes(term)) score += 7;

          // Keywords match
          if (cardData.keywords.some(k => k.includes(term))) score += 8;

          // Color identity match
          if (
            cardData.colors.includes(term) ||
            cardData.colorIdentity.includes(term)
          )
            score += 3;

          // Specific attribute searches
          if (term.match(/^\d+$/) && cardData.manaValue === parseInt(term))
            score += 5;
        });

        return { card, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.card);

    return results;
  }

  /**
   * Check if a card is banned or illegal in Commander format
   */
  private isIllegalCommander(card: ScryfallCard): boolean {
    // Explicitly banned or not legal in Commander
    if (
      card.legalities?.commander === 'banned' ||
      card.legalities?.commander === 'not_legal'
    ) {
      return true;
    }

    // Filter out digital-only cards (Alchemy sets usually start with 'y')
    const set = (card.set || '').toLowerCase();
    const digitalOnlySets = [
      'alchemy',
      'arena',
      'arenasup',
      'yneo',
      'ydmu',
      'ysnc',
      'yone',
      'ymid',
      'yafr',
      'ykhm',
      'yznr',
      'yeld',
      'yikr',
      'yiko',
      'ythb',
      'ylci',
      'ymkm',
      'yotj',
    ];

    // Check if set matches digital-only sets or starts with 'y' (Alchemy convention)
    if (
      digitalOnlySets.includes(set) ||
      (set.startsWith('y') && set.length === 4)
    ) {
      return true;
    }

    // Filter cards marked as digital-only
    if (card.digital === true) {
      return true;
    }

    // Filter by set_type for Alchemy
    if (card.set_type === 'alchemy') {
      return true;
    }

    // Additional check: if card is only legal in Historic/Alchemy but not in other formats
    // This catches cards that might slip through
    if (card.legalities) {
      const legalities = card.legalities;
      const isOnlyDigital =
        legalities.commander === 'not_legal' &&
        (legalities.vintage === 'not_legal' ||
          legalities.legacy === 'not_legal');

      if (isOnlyDigital) {
        return true;
      }
    }

    return false;
  }

  /**
   * Search for commanders only
   */
  searchCommanders(query: string, limit: number = 100): ScryfallCard[] {
    if (!this.isLoaded) {
      console.warn('Card library not loaded yet');
      return [];
    }

    const queryLower = query.toLowerCase().trim();
    const queryNoSpaces = queryLower.replace(/\s+/g, '');

    // Do text search on ALL cards (not filtered by Commander legality yet)
    const results = this.cards.filter(card => {
      const nameLower = card.name.toLowerCase();
      const nameNoSpaces = nameLower.replace(/\s+/g, '');

      // Search in name (exact match)
      if (nameLower.includes(queryLower)) return true;

      // Search in name (without spaces)
      if (nameNoSpaces.includes(queryNoSpaces)) return true;

      // Search in card_faces names (for transform/modal DFC cards)
      if (card.card_faces && card.card_faces.length > 0) {
        for (const face of card.card_faces) {
          const faceNameLower = face.name?.toLowerCase() || '';
          const faceNameNoSpaces = faceNameLower.replace(/\s+/g, '');
          if (
            faceNameLower.includes(queryLower) ||
            faceNameNoSpaces.includes(queryNoSpaces)
          ) {
            return true;
          }
        }
      }

      // Search in oracle text
      if (
        card.oracle_text &&
        card.oracle_text.toLowerCase().includes(queryLower)
      )
        return true;

      // Search in card_faces oracle text
      if (card.card_faces && card.card_faces.length > 0) {
        for (const face of card.card_faces) {
          if (
            face.oracle_text &&
            face.oracle_text.toLowerCase().includes(queryLower)
          ) {
            return true;
          }
        }
      }

      return false;
    });

    // Filter for commanders
    const commanders = results.filter(card => {
      // Filter out explicitly illegal cards (banned, not_legal, digital-only)
      if (this.isIllegalCommander(card)) {
        console.log(
          `🚫 Filtered out illegal commander: ${card.name} (set: ${card.set}, digital: ${card.digital}, legality: ${card.legalities?.commander})`
        );
        return false;
      }

      // Check main card and card_faces for type_line, oracle_text, power/toughness
      const typeLine = (
        card.type_line ||
        card.card_faces?.[0]?.type_line ||
        ''
      ).toLowerCase();
      // Combine oracle text from main card and all card_faces
      const allOracleText = [
        card.oracle_text || '',
        ...(card.card_faces?.map(face => face.oracle_text || '') || []),
      ]
        .filter(text => text)
        .join(' ')
        .toLowerCase();
      const isLegendary = typeLine.includes('legendary');

      // Cards with power/toughness (creatures) - check main card and first face
      const hasPowerToughness =
        (card.power !== undefined && card.toughness !== undefined) ||
        (card.card_faces?.[0]?.power !== undefined &&
          card.card_faces?.[0]?.toughness !== undefined);

      // Cards with loyalty counters (planeswalkers) - check main card and first face
      const hasLoyalty =
        card.loyalty !== undefined ||
        card.card_faces?.[0]?.loyalty !== undefined;

      // Two-commander mechanics (REQUIRE a second commander):

      // Partner - Can have any other Partner as second commander
      // Check both main card and card_faces
      const hasPartner =
        card.keywords?.some(k => k.toLowerCase() === 'partner') ||
        (allOracleText.includes('partner') &&
          !allOracleText.includes('partner with'));

      // Partner with [name] - Must have specific partner as second commander
      const hasPartnerWith =
        card.keywords?.some(k => k.toLowerCase().includes('partner with')) ||
        allOracleText.includes('partner with');

      // Choose a Background - Must have a Background enchantment as second commander
      const hasChooseBackground = allOracleText.includes('choose a background');

      // Friends Forever - Can have any other Friends Forever as second commander
      const hasFriendsForever =
        card.keywords?.some(k => k.toLowerCase().includes('friends forever')) ||
        allOracleText.includes('friends forever');

      // Doctor's companion - Can pair with Doctor commanders
      const hasDoctorsCompanion =
        allOracleText.includes("doctor's companion") ||
        allOracleText.includes('the doctor');

      // Cards with explicit "can be your commander" text
      const canBeCommander = allOracleText.includes('can be your commander');

      // Allow legendary cards with any of these characteristics:
      // 1. Has power/toughness (creatures)
      // 2. Has loyalty (planeswalkers)
      // 3. Has Partner ability (requires second Partner commander)
      // 4. Has Partner with (requires specific second commander)
      // 5. Has Choose a Background (requires Background second commander)
      // 6. Has Friends Forever (requires second Friends Forever commander)
      // 7. Has Doctor's companion or related mechanics
      // 8. Explicitly states it can be a commander
      return (
        isLegendary &&
        (hasPowerToughness ||
          hasLoyalty ||
          hasPartner ||
          hasPartnerWith ||
          hasChooseBackground ||
          hasFriendsForever ||
          hasDoctorsCompanion ||
          canBeCommander)
      );
    });

    return commanders.slice(0, limit);
  }

  /**
   * Get library statistics
   */
  getStats(): LibraryStats | null {
    if (!this.isLoaded) {
      return null;
    }

    const stats = {
      totalCards: this.cards.length,
      commanders: this.cards.filter(card => {
        const typeLine = (card.type_line || '').toLowerCase();
        return typeLine.includes('legendary') && typeLine.includes('creature');
      }).length,
      colors: {
        white: this.cards.filter(c => c.colors?.includes('W')).length,
        blue: this.cards.filter(c => c.colors?.includes('U')).length,
        black: this.cards.filter(c => c.colors?.includes('B')).length,
        red: this.cards.filter(c => c.colors?.includes('R')).length,
        green: this.cards.filter(c => c.colors?.includes('G')).length,
        colorless: this.cards.filter(c => !c.colors || c.colors.length === 0)
          .length,
      },
    };

    return stats;
  }

  /**
   * Clear the cache (useful for forcing a refresh)
   */
  async clearCache(): Promise<void> {
    console.log('🗑️ Clearing card library cache...');
    await cardLibraryCache.clear();
  }

  /**
   * Get cache information
   */
  async getCacheInfo() {
    return await cardLibraryCache.getInfo();
  }
}

// Export singleton instance
export const cardLibrary = new CardLibrary();
