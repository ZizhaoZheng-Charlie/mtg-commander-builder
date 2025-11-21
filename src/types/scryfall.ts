/**
 * Scryfall API Types
 */

export interface ScryfallImageUris {
  small?: string;
  normal?: string;
  large?: string;
  png?: string;
  art_crop?: string;
  border_crop?: string;
}

export interface ScryfallCardFace {
  name: string;
  type_line?: string;
  oracle_text?: string;
  mana_cost?: string;
  colors?: string[];
  power?: string;
  toughness?: string;
  loyalty?: string;
  image_uris?: ScryfallImageUris;
}

export type LegalityStatus = 'legal' | 'not_legal' | 'restricted' | 'banned';

export interface ScryfallLegalities {
  standard?: LegalityStatus;
  future?: LegalityStatus;
  historic?: LegalityStatus;
  timeless?: LegalityStatus;
  gladiator?: LegalityStatus;
  pioneer?: LegalityStatus;
  modern?: LegalityStatus;
  legacy?: LegalityStatus;
  pauper?: LegalityStatus;
  vintage?: LegalityStatus;
  penny?: LegalityStatus;
  commander?: LegalityStatus;
  oathbreaker?: LegalityStatus;
  standardbrawl?: LegalityStatus;
  brawl?: LegalityStatus;
  alchemy?: LegalityStatus;
  paupercommander?: LegalityStatus;
  duel?: LegalityStatus;
  oldschool?: LegalityStatus;
  premodern?: LegalityStatus;
  predh?: LegalityStatus;
}

export interface ScryfallPrices {
  usd?: string | null;
  usd_foil?: string | null;
  usd_etched?: string | null;
  eur?: string | null;
  eur_foil?: string | null;
  tix?: string | null;
}

export interface ScryfallRelatedUris {
  gatherer?: string;
  tcgplayer_infinite_articles?: string;
  tcgplayer_infinite_decks?: string;
  edhrec?: string;
}

export interface ScryfallPurchaseUris {
  tcgplayer?: string;
  cardmarket?: string;
  cardhoarder?: string;
}

export interface ScryfallCard {
  // Core card identifiers
  object: string;
  id: string;
  oracle_id: string;
  multiverse_ids?: number[];
  mtgo_id?: number;
  mtgo_foil_id?: number;
  arena_id?: number; // Only for Arena-available cards
  tcgplayer_id?: number;
  cardmarket_id?: number;

  // Core card information
  name: string;
  lang: string;
  released_at: string;
  uri: string;
  scryfall_uri: string;
  layout: string;

  // Image information
  highres_image: boolean;
  image_status: string;
  image_uris?: ScryfallImageUris;

  // Gameplay information
  mana_cost?: string;
  cmc: number;
  type_line: string;
  oracle_text?: string;
  colors?: string[];
  color_identity: string[];
  keywords?: string[];
  produced_mana?: string[]; // Only for lands that produce mana
  power?: string; // Only for creatures
  toughness?: string; // Only for creatures
  loyalty?: string; // Only for planeswalkers

  // Multi-faced cards
  card_faces?: ScryfallCardFace[];

  // Legality information
  legalities: ScryfallLegalities;

  // Availability
  games: string[];
  reserved: boolean;
  game_changer: boolean;
  foil: boolean;
  nonfoil: boolean;
  finishes: string[];
  oversized: boolean;
  promo: boolean;
  reprint: boolean;
  variation: boolean;

  // Set information
  set_id: string;
  set: string;
  set_name: string;
  set_type: string;
  set_uri: string;
  set_search_uri: string;
  scryfall_set_uri: string;
  rulings_uri: string;
  prints_search_uri: string;
  collector_number: string;

  // Print information
  digital: boolean;
  rarity: string;
  flavor_text?: string;
  card_back_id?: string;
  artist?: string;
  artist_ids?: string[];
  illustration_id?: string;
  border_color: string;
  frame: string;
  frame_effects?: string[];
  security_stamp?: string; // Only on rares/mythics with hologram
  full_art: boolean;
  textless: boolean;
  booster: boolean;
  story_spotlight: boolean;

  // Community rankings (optional)
  edhrec_rank?: number;
  penny_rank?: number;

  // Pricing information
  prices: ScryfallPrices;

  // Related content
  related_uris: ScryfallRelatedUris;
  purchase_uris: ScryfallPurchaseUris;
}

export interface ScryfallBulkData {
  object: string;
  id: string;
  type: string;
  updated_at: string;
  uri: string;
  name: string;
  description: string;
  compressed_size: number;
  download_uri: string;
  content_type: string;
  content_encoding: string;
}

export interface ScryfallBulkDataList {
  object: string;
  has_more: boolean;
  data: ScryfallBulkData[];
}

export interface LibraryStats {
  totalCards: number;
  commanders: number;
  colors: {
    white: number;
    blue: number;
    black: number;
    red: number;
    green: number;
    colorless: number;
  };
}
