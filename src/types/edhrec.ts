/**
 * EDHREC API Types
 *
 * API Endpoint: https://json.edhrec.com/pages/commanders/{creature-name}.json
 *
 * Replace {creature-name} with the commander name in lowercase with:
 * - No symbols
 * - Dashes instead of spaces
 *
 * Example: https://json.edhrec.com/pages/commanders/uril-the-miststalker.json
 *
 * Use the sanitizeCommanderName() function from src/utils/api.ts to format names properly.
 */

// MTG Color type
export type Color = 'W' | 'U' | 'B' | 'R' | 'G' | 'C';

/**
 * Commander Card Interface
 * Represents a single commander card from EDHREC's commander list
 */
export interface EdhrecCommander {
  background_chooser?: boolean;
  banned: boolean;
  cardmarket_id: number;
  cmc: number;
  color_identity: Color[];
  combo_url: string;
  game_changer: boolean;
  id: string;
  image_uri: string;
  image_uris: string[];
  layout: string;
  legal_commander: boolean;
  legal_companion: boolean;
  legal_partner: boolean;
  mana_cost: string;
  name: string;
  names: string[];
  new: boolean;
  oracle_id: string;
  oracle_text: string;
  power?: string;
  precon: boolean;
  prices: {
    cardhoarder?: {
      price: number;
      slug: string;
      url: string;
    };
    cardkingdom?: {
      price: number;
      slug: string;
      url: string;
    };
    cardmarket?: {
      price: number;
      url: string;
    };
    face2face?: {
      price: number;
      slug: string;
      url: string;
    };
    manapool?: {
      price: number;
      slug: string;
    };
    mtgstocks?: {
      price: number;
      slug: string;
      url: string;
    };
    scg?: {
      price: number;
      slug: string;
    };
    tcgl?: {
      price: number;
      slug: string;
    };
    tcgplayer?: {
      price: number;
      slug: string;
      url: string;
    };
  };
  primary_type: string;
  rarity: string;
  released_at: string;
  salt: number;
  tags?: string[];
  toughness?: string;
  type: string;
  scryfall_uri: string;
  sets: string[];
  spellbook_uri: string;
  spoiled_at: string;
  subtypes: string[];
  types: string[];
  unique_artwork: Array<{
    artist: string;
    collector_number: string;
    set: string;
    set_name: string;
    image_uris: string[];
  }>;
  unofficial: boolean;
  universes_beyond?: boolean;
  url: string;
  weird: boolean;
}

export interface EdhrecCommanderResults {
  container: {
    breadcrumb: Array<{
      [key: string]: string;
    }>;
    description: string;
    json_dict: {
      cardlists: Array<{
        header: string;
        tag: string;
        cardviews: Array<{
          name: string;
          sanitized: string;
          sanitized_wo: string;
          url: string;
          synergy: number;
          inclusion: number;
          label: string;
          num_decks: number;
          potential_decks: number;
          cards?: Array<{
            name: string;
            url: string;
          }>;
        }>;
      }>;
      card: {
        inclusion: number;
        num_decks: number;
        potential_decks: number;
        aetherhub_uri: string;
        archidekt_uri: string;
        color_identity: Array<Color>;
        cmc: number;
        deckstats_uri: string;
        image_uris: [
          {
            small: string;
            normal: string;
            large: string;
            png: string;
            art_crop: string;
            border_crop: string;
          },
        ];
        layout: string;
        moxfield_uri: string;
        mtggoldfish_uri: string;
        name: string;
        names: Array<string>;
        prices: {
          cardhoarder: {
            price: number | null;
            url: string;
          };
          cardkingdom: {
            price: number | null;
            url: string;
          };
          cardmarket: {
            price: number | null;
            url: string;
          };
          face2face: {
            price: number | null;
            url: string;
          };
          mtgstocks: {
            price: number | null;
            url: string;
          };
          tcgplayer: {
            price: number | null;
            url: string;
          };
        };
        primary_type: string;
        rarity: string;
        salt: number;
        sanitized: string;
        sanitized_wo: string;
        scryfall_uri: string | null;
        spellbook_uri: string | null;
        type: string;
        is_commander: boolean;
        label: string;
        legal_commander: boolean;
        precon?: string;
        url: string | null;
      };
      keywords: string;
      title: string;
    };
  };
  creature: number;
  instant: number;
  sorcery: number;
  artifact: number;
  enchantment: number;
  planeswalker: number;
  land: number;
  basic: number;
  nonbasic: number;
  archidekt: Array<{
    c: string;
    f: number;
    q: number;
    u: string;
  }>;
  parternetcounts: Array<{
    count: number;
    href: string;
    value: string;
  }>;
  similar: Array<{
    cards: Array<{
      cards: Array<{
        object: string;
        id: string;
        oracle_id: string;
        multiverse_ids: [number];
        mtgo_id: number;
        tcgplayer_id: number;
        cardmarket_id: number;
        name: string;
        lang: string;
        released_at: string;
        uri: string;
        scryfall_uri: string;
        layout: string;
        highres_image: true;
        image_status: string;
        image_uris: {
          small: string;
          normal: string;
          large: string;
          png: string;
          art_crop: string;
          border_crop: string;
        };
        mana_cost: string;
        cmc: number;
        type_line: string;
        oracle_text: string;
        power: string;
        toughness: string;
        colors: [string, string];
        color_identity: [string, string];
        keywords: [string];
        legalities: {
          standard: string;
          future: string;
          historic: string;
          gladiator: string;
          pioneer: string;
          explorer: string;
          modern: string;
          legacy: string;
          pauper: string;
          vintage: string;
          penny: string;
          commander: string;
          oathbreaker: string;
          brawl: string;
          historicbrawl: string;
          alchemy: string;
          paupercommander: string;
          duel: string;
          oldschool: string;
          premodern: string;
          predh: string;
        };
        games: [string, string];
        reserved: false;
        foil: false;
        nonfoil: true;
        finishes: [string];
        oversized: false;
        promo: false;
        reprint: true;
        variation: false;
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
        digital: false;
        rarity: string;
        flavor_text: 'string\nstring';
        card_back_id: string;
        artist: string;
        artist_ids: [string];
        illustration_id: string;
        border_color: string;
        frame: string;
        frame_effects: [string];
        security_stamp: string;
        full_art: false;
        textless: false;
        booster: false;
        story_spotlight: false;
        edhrec_rank: number;
        penny_rank: number;
        prices: {
          cardhoarder: {
            price: number;
            url: string;
          };
          cardkingdom: {
            price: number;
            url: string;
          };
          cardmarket: {
            price: number;
            url: string;
          };
          facenumberface: {
            price: number;
            url: string;
          };
          mtgstocks: {
            price: number;
            url: string;
          };
          tcgplayer: {
            price: number;
            url: string;
          };
        };
        related_uris: {
          gatherer: string;
          tcgplayer_infinite_articles: string;
          tcgplayer_infinite_decks: string;
          edhrec: string;
        };
        purchase_uris: {
          tcgplayer: string;
          cardmarket: string;
          cardhoarder: string;
        };
        scryfall_name: string;
        names: [string];
        banned: false;
        legal_commander: true;
        legal_partner: false;
        legal_companion: false;
        precon: string;
        salt: number;
        salt_2021: number;
        salt_2020: number;
        salt_2019: number;
        earliest_set: string;
        latest_print: string;
        latest_set: string;
        sets: [string, string, string];
        new: false;
        tags: [string];
        unique_artwork: [
          {
            artist: string;
            collector_number: string;
            set: string;
            set_name: string;
            image_uris: [string];
          },
          {
            artist: string;
            collector_number: string;
            set: string;
            set_name: string;
            image_uris: [string];
          },
        ];
        unofficial: false;
        aetherhub_uri: string;
        deckstats_uri: string;
        moxfield_uri: string;
        archidekt_uri: string;
        mtggoldfish_uri: string;
        url: string;
        spellbook_uri: null;
        type: string;
        subtypes: Array<string>;
        supertypes: Array<string>;
        types: Array<string>;
        primary_type: string;
      }>;
      aetherhub_uri: string;
      archidekt_uri: string;
      color_identity: Array<string>;
      cmc: number;
      deckstats_uri: string;
      image_uris: Array<{
        small: string;
        normal: string;
        large: string;
        png: string;
        art_crop: string;
        border_crop: string;
      }>;
      layout: string;
      moxfield_uri: string;
      mtggoldfish_uri: string;
      name: string;
      names: Array<string>;
      prices: {
        cardhoarder: {
          price: number;
          url: string;
        };
        cardkingdom: {
          price: number;
          url: string;
        };
        cardmarket: {
          price: number;
          url: string;
        };
        facenumberface: {
          price: number;
          url: string;
        };
        mtgstocks: {
          price: number;
          url: string;
        };
        tcgplayer: {
          price: number;
          url: string;
        };
      };
      primary_type: string;
      rarity: string;
      salt: number;
      sanitized: string;
      sanitized_wo: string;
      scryfall_uri: string;
      spellbook_uri: null;
      type: string;
      legal_commander: true;
      precon: string;
      url: string;
    }>;
    aetherhub_uri: string;
    archidekt_uri: string;
    color_identity: Array<string>;
    cmc: number;
    deckstats_uri: string;
    image_uris: Array<{
      small: string;
      normal: string;
      large: string;
      png: string;
      art_crop: string;
      border_crop: string;
    }>;
    layout: string;
    moxfield_uri: string;
    mtggoldfish_uri: string;
    name: string;
    names: Array<string>;
    prices: {
      cardhoarder: {
        price: number;
        url: string;
      };
      cardkingdom: {
        price: number;
        url: string;
      };
      cardmarket: {
        price: number;
        url: string;
      };
      face2face: {
        price: number;
        url: string;
      };
      mtgstocks: {
        price: number;
        url: string;
      };
      tcgplayer: {
        price: number;
        url: string;
      };
    };
    primary_type: string;
    rarity: string;
    salt: number;
    sanitized: string;
    sanitized_wo: string;
    scryfall_uri: string;
    spellbook_uri: null;
    type: string;
    legal_commander: boolean;
    precon: string;
    url: string;
  }>;
  header: string;
  panels: {
    piechart: {
      content: Array<{
        label: string;
        value: number;
        color: string;
      }>;
      title: string;
    };
    links: Array<{
      header: string;
      items: Array<{
        href: string;
        value: string;
        current?: boolean;
        alt?: string | null;
        external?: boolean;
      }>;
      separator?: boolean;
    }>;
    tribelinks: {
      budget: Array<{
        count: number;
        'href-suffix': string;
        value: string;
      }>;
      themes: Array<{
        count: number;
        'href-suffix': string;
        value: string;
      }>;
      mana_curve: {
        [key: number]: number;
      };
      partnercounts: Array<{
        alt: string | null;
        href: string;
        value: string;
      }>;
      combocounts: Array<{
        value: string;
        alt: string | null;
        href: string;
      }>;
      articles: Array<{
        alt: string;
        author: {
          avatar: string;
          id: number;
          link: string;
          name: string;
        };
        date: string;
        excerpt: string;
        href: string;
        site: {
          api: string;
          id: string;
          name: string;
          parent_page_id: number;
          tags: boolean;
        };
        value: string;
        media: string;
      }>;
      related_video: {
        author: {
          avatar: string;
          id: number;
          link: string;
          name: string;
        };
        cards: Array<string>;
        categories: Array<{
          id: number;
          link: string;
          name: string;
        }>;
        date: string;
        date_gmt: string;
        excerpt: string;
        id: number;
        site: {
          api: string;
          id: string;
          name: string;
          parent_page_id: number;
          tags: boolean;
        };
        link: string;
        modified_gmt: string;
        title: string;
        tags: Array<{
          id: number;
          link: string;
          name: string;
        }>;
        youtube: string;
      };
    };
  };
  description: string;
  cardlist: Array<{
    name: string;
    sanitized: string;
    sanitized_wo: string;
    url: string;
    synergy: number;
    num_decks: number;
    potential_decks: number;
    cards?: Array<{
      name: string;
      url: string;
    }>;
  }>;
}
