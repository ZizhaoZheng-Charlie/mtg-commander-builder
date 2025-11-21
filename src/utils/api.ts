import { cache } from './cache';
import { EdhrecCommanderResults } from '../types/edhrec';
import { CACHE_KEYS } from '../types/cache';
import { API } from './constants';

/**
 * Extract the front face name from a double-faced card name
 * EDHREC uses only the front face name (e.g., "Chandra, Fire of Kaladesh" not "Chandra, Fire of Kaladesh // Chandra, Roaring Flame")
 */
export function extractFrontFaceName(name: string): string {
  if (!name) return name;

  // Double-faced cards use " // " as separator
  const doubleFaceSeparator = ' // ';
  if (name.includes(doubleFaceSeparator)) {
    return name.split(doubleFaceSeparator)[0].trim();
  }

  return name.trim();
}

export function sanitizeCommanderName(name: string): string {
  // Extract front face name first (for double-faced cards)
  const frontFaceName = extractFrontFaceName(name);

  return frontFaceName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function sanitizeCardName(name: string, layout?: string): string {
  // For split cards, keep the combined name (e.g., "Appeal // Authority")
  // EDHREC uses the combined name format for split cards
  let cardName = name;

  if (layout === 'split') {
    // Keep the full split card name with " // " separator
    cardName = name.trim();
  } else {
    // Extract front face name for double-faced cards (transform, modal, etc.)
    // EDHREC uses only the front face name for non-split cards
    cardName = extractFrontFaceName(name);
  }

  return cardName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function searchCommanders(
  query: string,
  setLoading: (loading: boolean) => void
): Promise<any[]> {
  if (!query) return [];

  setLoading(true);

  try {
    const searchQuery = `${query} is:commander`;
    const cacheKey = `${CACHE_KEYS.COMMANDERS}_${searchQuery}`;
    const url = `${API.SCRYFALL}/cards/search?q=${encodeURIComponent(searchQuery)}`;

    console.log('Searching commanders with query:', searchQuery);

    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log('Found in cache:', cachedData.length, 'commanders');
      setLoading(false);
      return cachedData;
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': API.USER_AGENT,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch commanders');
    }

    const data = await response.json();
    const commanders = data.data || [];

    console.log('Found', commanders.length, 'commanders');

    // Cache the results
    cache.set(cacheKey, commanders);

    setLoading(false);
    return commanders;
  } catch (error) {
    setLoading(false);
    console.error('Error searching commanders:', error);
    alert('Failed to search for commanders. Please try again.');
    return [];
  }
}

export async function getEDHRECData(
  commanderName: string,
  setLoading: (loading: boolean) => void,
  secondCommanderName?: string | null
): Promise<EdhrecCommanderResults | null> {
  // If there's a second commander, combine them for the EDHREC API
  let sanitized: string;
  let cacheKey: string;

  if (secondCommanderName) {
    // Create combined slug: commander1-commander2 (alphabetically sorted)
    const sanitized1 = sanitizeCommanderName(commanderName);
    const sanitized2 = sanitizeCommanderName(secondCommanderName);
    // Sort alphabetically to ensure consistent ordering (e.g., kediss before yoshimaru)
    const sorted = [sanitized1, sanitized2].sort((a, b) => a.localeCompare(b));
    sanitized = `${sorted[0]}-${sorted[1]}`;
    cacheKey = `${CACHE_KEYS.EDHREC}_${sanitized}`;
    console.log(`🤝 Fetching EDHREC data for partner pair: ${sanitized}`);
  } else {
    sanitized = sanitizeCommanderName(commanderName);
    cacheKey = `${CACHE_KEYS.EDHREC}_${sanitized}`;
    console.log(`📊 Fetching EDHREC data for: ${sanitized}`);
  }

  const url = `${API.EDHRECCommander}/${sanitized}.json`;

  // Check cache first
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    console.log('✅ EDHREC data from cache:', sanitized);
    return cachedData;
  }

  setLoading(true);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': API.USER_AGENT,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      // If partner pair fetch failed and we have a second commander, fall back to first commander
      if (secondCommanderName && response.status === 404) {
        console.log(
          `⚠️ Partner pair data not found, falling back to first commander: ${commanderName}`
        );
        setLoading(false);
        // Recursively call with just the first commander (without second commander)
        return getEDHRECData(commanderName, setLoading, null);
      }
      throw new Error('Commander not found in EDHREC');
    }

    const data: EdhrecCommanderResults = await response.json();

    // Cache the results
    cache.set(cacheKey, data);

    console.log(
      `✅ EDHREC data loaded: ${data?.container?.json_dict?.cardlists?.length || 0} card lists`
    );
    setLoading(false);
    return data;
  } catch (error) {
    // If partner pair fetch failed and we have a second commander, fall back to first commander
    if (secondCommanderName) {
      console.log(
        `⚠️ Error fetching partner pair data, falling back to first commander: ${commanderName}`
      );
      setLoading(false);
      // Recursively call with just the first commander (without second commander)
      return getEDHRECData(commanderName, setLoading, null);
    }
    setLoading(false);
    console.error('❌ Error fetching EDHREC data:', error);
    return null;
  }
}

export async function searchCards(
  query: string,
  setLoading: (loading: boolean) => void
): Promise<any[]> {
  if (!query) return [];

  setLoading(true);

  try {
    const cacheKey = `${CACHE_KEYS.CARDS}_${query}`;
    const url = `${API.SCRYFALL}/cards/search?q=${encodeURIComponent(query)}&unique=cards&order=name`;

    // Check cache
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log('Cards from cache:', query);
      setLoading(false);
      return cachedData;
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': API.USER_AGENT,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('No cards found');
    }

    const data = await response.json();
    const cards = data.data || [];

    // Cache results
    cache.set(cacheKey, cards);

    setLoading(false);
    return cards;
  } catch (error) {
    setLoading(false);
    console.error('Error searching cards:', error);
    alert('No cards found. Please try a different search.');
    return [];
  }
}

/**
 * Fetches synergy cards for a given commander from EDHREC
 * @param commanderName - The name of the commander
 * @param setLoading - Loading state setter function
 * @param minSynergy - Minimum synergy score to filter cards (optional, default: 0)
 * @param limit - Maximum number of cards to return (optional)
 * @returns Array of synergy cards with their details
 */
export async function getSynergyCards(
  commanderName: string,
  setLoading: (loading: boolean) => void,
  minSynergy: number = 0,
  limit?: number
): Promise<
  Array<{
    name: string;
    synergy: number;
    inclusion: number;
    num_decks: number;
    potential_decks: number;
    label: string;
    sanitized: string;
    url: string;
  }>
> {
  try {
    // Fetch EDHREC data for the commander
    const edhrecData = await getEDHRECData(commanderName, setLoading);

    if (!edhrecData) {
      console.error('No EDHREC data available for commander:', commanderName);
      return [];
    }

    // Extract all synergy cards from cardlists
    const synergyCards: Array<any> = [];

    const cardlists = edhrecData.container?.json_dict?.cardlists || [];

    // Iterate through all cardlists and collect cards with synergy data
    for (const cardlist of cardlists) {
      if (cardlist.cardviews && Array.isArray(cardlist.cardviews)) {
        for (const card of cardlist.cardviews) {
          // Only include cards with synergy scores
          if (card.synergy !== undefined && card.synergy >= minSynergy) {
            synergyCards.push({
              name: card.name,
              synergy: card.synergy,
              inclusion: card.inclusion,
              num_decks: card.num_decks,
              potential_decks: card.potential_decks,
              label: card.label,
              sanitized: card.sanitized,
              url: card.url,
              category: cardlist.header, // Add category for context
            });
          }
        }
      }
    }

    // Sort by synergy score (highest first)
    synergyCards.sort((a, b) => b.synergy - a.synergy);

    // Apply limit if specified
    const result = limit ? synergyCards.slice(0, limit) : synergyCards;

    console.log(`Found ${result.length} synergy cards for ${commanderName}`);

    return result;
  } catch (error) {
    console.error('Error fetching synergy cards:', error);
    setLoading(false);
    return [];
  }
}

/**
 * Find all categories a card belongs to in EDHREC data
 * @param cardName - The name of the card to search for
 * @param edhrecData - The EDHREC data to search in
 * @returns Array of category objects with card details
 */
export function findCardCategories(
  cardName: string,
  edhrecData: EdhrecCommanderResults | null
): Array<{
  category: string;
  synergy?: number;
  inclusion?: number;
  num_decks?: number;
  potential_decks?: number;
}> {
  if (!edhrecData?.container?.json_dict?.cardlists) {
    return [];
  }

  const categories: Array<any> = [];
  const normalizedSearchName = cardName.toLowerCase().trim();

  const cardlists = edhrecData.container.json_dict.cardlists;

  for (const cardlist of cardlists) {
    if (cardlist.cardviews && Array.isArray(cardlist.cardviews)) {
      const foundCard = cardlist.cardviews.find(
        card => card.name.toLowerCase().trim() === normalizedSearchName
      );

      if (foundCard) {
        categories.push({
          category: cardlist.header,
          synergy: foundCard.synergy,
          inclusion: foundCard.inclusion,
          num_decks: foundCard.num_decks,
          potential_decks: foundCard.potential_decks,
        });
      }
    }
  }

  return categories;
}

/**
 * Fetches EDHREC commander lists from the cardlists endpoint
 * @param setLoading - Loading state setter function
 * @returns Array of commander cards with full data
 */
export async function getEDHRECCardlists(
  setLoading?: (loading: boolean) => void
): Promise<any[]> {
  const cacheKey = `${CACHE_KEYS.EDHREC}_cardlists_all`;

  // Check cache first
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    console.log('✅ EDHREC cardlists from cache');
    return cachedData;
  }

  if (setLoading) setLoading(true);

  try {
    const url = `${API.EDHRECCardlists}`;
    console.log('📊 Fetching EDHREC cardlists from:', url);

    const response = await fetch(url, {
      headers: {
        'User-Agent': API.USER_AGENT,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch EDHREC cardlists');
    }

    const data = await response.json();

    // The response is an array of cards/commanders
    const cards = Array.isArray(data) ? data : [];

    // Cache the results
    cache.set(cacheKey, cards);

    console.log(`✅ Loaded ${cards.length} cards from EDHREC cardlists`);

    if (setLoading) setLoading(false);
    return cards;
  } catch (error) {
    if (setLoading) setLoading(false);
    console.error('❌ Error fetching EDHREC cardlists:', error);
    return [];
  }
}

/**
 * Filters commander cards by category type
 * @param cards - Array of all cards from EDHREC
 * @param category - Category to filter by
 * @returns Filtered array of cards
 */
export function filterCommandersByCategory(
  cards: any[],
  category: string
): any[] {
  if (!cards || cards.length === 0) return [];

  switch (category) {
    case 'top-commanders':
      // Top commanders: legal commanders sorted by popularity/inclusion
      return cards
        .filter(card => card.legal_commander === true)
        .sort((a, b) => {
          // Sort by a combination of factors
          const aScore = (a.inclusion || 0) * 100 + (a.num_decks || 0);
          const bScore = (b.inclusion || 0) * 100 + (b.num_decks || 0);
          return bScore - aScore;
        })
        .slice(0, 100); // Top 100 commanders

    case 'new-cards':
      // New commanders
      return cards
        .filter(card => card.new === true)
        .sort((a, b) => {
          const dateA = new Date(b.released_at || 0).getTime();
          const dateB = new Date(a.released_at || 0).getTime();
          return dateA - dateB;
        });

    case 'game-changers':
      // Game changing commanders
      return cards
        .filter(card => card.game_changer === true)
        .sort((a, b) => (b.num_decks || 0) - (a.num_decks || 0));

    case 'creatures':
      // Legendary creatures
      return cards.filter(
        card =>
          card.type?.toLowerCase().includes('creature') ||
          card.primary_type?.toLowerCase() === 'creature'
      );

    case 'instants':
      // Instant spells (rare but possible as commanders with special rules)
      return cards.filter(
        card =>
          card.type?.toLowerCase().includes('instant') ||
          card.primary_type?.toLowerCase() === 'instant'
      );

    case 'sorceries':
      // Sorcery spells
      return cards.filter(
        card =>
          card.type?.toLowerCase().includes('sorcery') ||
          card.primary_type?.toLowerCase() === 'sorcery'
      );

    case 'utility-artifacts':
    case 'mana-artifacts':
    case 'artifacts':
      // Artifact commanders
      return cards.filter(card => {
        const type = (card.type || card.primary_type || '').toLowerCase();
        return type.includes('artifact');
      });

    case 'enchantments':
      // Enchantment commanders
      return cards.filter(
        card =>
          card.type?.toLowerCase().includes('enchantment') ||
          card.primary_type?.toLowerCase() === 'enchantment'
      );

    case 'planeswalkers':
      // Planeswalker commanders
      return cards.filter(
        card =>
          card.type?.toLowerCase().includes('planeswalker') ||
          card.primary_type?.toLowerCase() === 'planeswalker'
      );

    case 'utility-lands':
    case 'lands':
      // Land commanders (very rare)
      return cards.filter(
        card =>
          card.type?.toLowerCase().includes('land') ||
          card.primary_type?.toLowerCase() === 'land'
      );

    default:
      return cards;
  }
}

/**
 * Gets categorized commander lists from EDHREC
 * @param setLoading - Loading state setter function
 * @returns Object with categorized commander arrays
 */
export async function getEDHRECCategories(
  setLoading?: (loading: boolean) => void
): Promise<{
  topCommanders: any[];
  newCards: any[];
  gameChangers: any[];
  creatures: any[];
  instants: any[];
  sorceries: any[];
  artifacts: any[];
  enchantments: any[];
  planeswalkers: any[];
  lands: any[];
}> {
  const allCards = await getEDHRECCardlists(setLoading);

  return {
    topCommanders: filterCommandersByCategory(allCards, 'top-commanders'),
    newCards: filterCommandersByCategory(allCards, 'new-cards'),
    gameChangers: filterCommandersByCategory(allCards, 'game-changers'),
    creatures: filterCommandersByCategory(allCards, 'creatures'),
    instants: filterCommandersByCategory(allCards, 'instants'),
    sorceries: filterCommandersByCategory(allCards, 'sorceries'),
    artifacts: filterCommandersByCategory(allCards, 'artifacts'),
    enchantments: filterCommandersByCategory(allCards, 'enchantments'),
    planeswalkers: filterCommandersByCategory(allCards, 'planeswalkers'),
    lands: filterCommandersByCategory(allCards, 'lands'),
  };
}

/**
 * Fetches EDHREC category data (Top Commanders, New Cards, Game Changers, etc.)
 * @param categoryEndpoint - The API endpoint key from constants (e.g., 'EDHRECTopCommanders')
 * @param setLoading - Loading state setter function
 * @returns Array of cards/commanders for that category
 */
export async function getEDHRECCategoryData(
  categoryEndpoint: keyof typeof API,
  setLoading?: (loading: boolean) => void
): Promise<any[]> {
  const cacheKey = `${CACHE_KEYS.EDHREC}_category_${categoryEndpoint}`;

  // Check cache first
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    console.log(`✅ ${categoryEndpoint} data from cache`);
    return cachedData;
  }

  if (setLoading) setLoading(true);

  try {
    const url = API[categoryEndpoint];
    console.log(`📊 Fetching ${categoryEndpoint} from:`, url);

    const response = await fetch(url, {
      headers: {
        'User-Agent': API.USER_AGENT,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${categoryEndpoint}`);
    }

    const data = await response.json();

    // The response is an array of cards/commanders
    const cards = Array.isArray(data) ? data : [];

    // Cache the results
    cache.set(cacheKey, cards);

    console.log(`✅ Loaded ${cards.length} items from ${categoryEndpoint}`);

    if (setLoading) setLoading(false);
    return cards;
  } catch (error) {
    if (setLoading) setLoading(false);
    console.error(`❌ Error fetching ${categoryEndpoint}:`, error);
    return [];
  }
}

/**
 * Searches for a specific card in EDHREC cardlists
 * @param cardName - The name of the card to search for
 * @param category - Optional category to search in
 * @returns Card data if found, null otherwise
 */
export async function searchCardInEDHREC(
  cardName: string,
  category?: string
): Promise<any | null> {
  const normalizedSearchName = cardName.toLowerCase().trim();

  try {
    const allCards = await getEDHRECCardlists();

    if (category) {
      // Search in specific category
      const filteredCards = filterCommandersByCategory(allCards, category);
      const foundCard = filteredCards.find(
        card => card.name?.toLowerCase().trim() === normalizedSearchName
      );
      return foundCard || null;
    } else {
      // Search across all cards
      const foundCard = allCards.find(
        card => card.name?.toLowerCase().trim() === normalizedSearchName
      );
      return foundCard || null;
    }
  } catch (error) {
    console.error('Error searching card in EDHREC:', error);
    return null;
  }
}

/**
 * Fetches synergy data for a specific card from EDHREC
 * Similar to commander synergy, but for individual cards
 * @param cardName - The name of the card
 * @param setLoading - Loading state setter function
 * @param layout - Optional card layout (e.g., "split" for split cards)
 * @returns EDHREC data with synergy cards for this specific card
 */
export async function getCardSynergyData(
  cardName: string,
  setLoading?: (loading: boolean) => void,
  layout?: string
): Promise<EdhrecCommanderResults | null> {
  const sanitized = sanitizeCardName(cardName, layout);
  const cacheKey = `${CACHE_KEYS.EDHREC}_card_${sanitized}`;

  console.log(`📊 Fetching card synergy data for: ${sanitized}`);

  // Check cache first
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    console.log('✅ Card synergy data from cache:', sanitized);
    return cachedData;
  }

  if (setLoading) setLoading(true);

  try {
    // Try the pages/cards endpoint for individual cards
    const url = `${API.EDHRECCards}/${sanitized}.json`;
    console.log('📊 Fetching from:', url);

    const response = await fetch(url, {
      headers: {
        'User-Agent': API.USER_AGENT,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Card synergy data not found in EDHREC');
    }

    const data: EdhrecCommanderResults = await response.json();

    // Cache the results
    cache.set(cacheKey, data);

    console.log(
      `✅ Card synergy data loaded: ${data?.container?.json_dict?.cardlists?.length || 0} card lists`
    );
    if (setLoading) setLoading(false);
    return data;
  } catch (error) {
    if (setLoading) setLoading(false);
    console.error('❌ Error fetching card synergy data:', error);
    return null;
  }
}

/**
 * Extracts synergy cards from card-specific EDHREC data
 * @param cardName - The name of the card
 * @param setLoading - Loading state setter function
 * @param layout - Optional card layout (e.g., "split" for split cards)
 * @returns Array of cards that synergize with the given card
 */
export async function getCardsAroundCard(
  cardName: string,
  setLoading?: (loading: boolean) => void,
  layout?: string
): Promise<
  Array<{
    name: string;
    category: string;
    synergy?: number;
    inclusion?: number;
    num_decks?: number;
    potential_decks?: number;
    label?: string;
    sanitized?: string;
    url?: string;
  }>
> {
  try {
    const edhrecData = await getCardSynergyData(cardName, setLoading, layout);

    if (!edhrecData || !edhrecData.container?.json_dict?.cardlists) {
      console.log('No synergy data available for card:', cardName);
      return [];
    }

    const synergyCards: Array<any> = [];
    const cardlists = edhrecData.container.json_dict.cardlists;

    // Iterate through all cardlists and collect cards
    for (const cardlist of cardlists) {
      if (cardlist.cardviews && Array.isArray(cardlist.cardviews)) {
        for (const card of cardlist.cardviews) {
          // Skip basic lands
          const isBasicLand = [
            'island',
            'plains',
            'swamp',
            'mountain',
            'forest',
            'wastes',
          ].includes(card.name.toLowerCase());

          if (isBasicLand) continue;

          synergyCards.push({
            name: card.name,
            category: cardlist.header,
            synergy: card.synergy,
            inclusion: card.inclusion,
            num_decks: card.num_decks,
            potential_decks: card.potential_decks,
            label: card.label,
            sanitized: card.sanitized,
            url: card.url,
          });
        }
      }
    }

    // Sort by synergy score if available, otherwise by inclusion
    synergyCards.sort((a, b) => {
      if (a.synergy !== undefined && b.synergy !== undefined) {
        return b.synergy - a.synergy;
      }
      if (a.inclusion !== undefined && b.inclusion !== undefined) {
        return b.inclusion - a.inclusion;
      }
      return 0;
    });

    console.log(`Found ${synergyCards.length} synergy cards for ${cardName}`);
    return synergyCards;
  } catch (error) {
    console.error('Error fetching cards around card:', error);
    if (setLoading) setLoading(false);
    return [];
  }
}
