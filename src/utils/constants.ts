/**
 * API Configuration Constants
 */

export const API = {
  EDHRECCardlists: 'https://json.edhrec.com/cards',
  EDHRECCards: 'https://json.edhrec.com/pages/cards',
  EDHRECCommander: 'https://json.edhrec.com/pages/commanders',
  SCRYFALL: 'https://api.scryfall.com',
  USER_AGENT: 'MTGCommanderBuilder/1.0',
} as const;

/**
 * EDHREC Category Filters
 * Used to categorize cards from the cardlists endpoint
 */
export const EDHREC_CATEGORIES = {
  TOP_COMMANDERS: 'top-commanders',
  NEW_CARDS: 'new-cards',
  HIGH_SYNERGY: 'high-synergy-cards',
  TOP_CARDS: 'top-cards',
  GAME_CHANGERS: 'game-changers',
  CREATURES: 'creatures',
  INSTANTS: 'instants',
  SORCERIES: 'sorceries',
  UTILITY_ARTIFACTS: 'utility-artifacts',
  ENCHANTMENTS: 'enchantments',
  PLANESWALKERS: 'planeswalkers',
  UTILITY_LANDS: 'utility-lands',
  MANA_ARTIFACTS: 'mana-artifacts',
  LANDS: 'lands',
} as const;
