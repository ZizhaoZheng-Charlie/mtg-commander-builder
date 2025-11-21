import { useState, useEffect } from 'react';
import { cardLibrary } from '../utils/cardLibrary';
import { parseManaSymbols } from '../utils/manaSymbols';

/**
 * PartnerSelector Component
 * Displays available partners, companions, or backgrounds for commanders that require them
 */
function PartnerSelector({
  commander,
  secondCommander,
  edhrecData,
  onAddSecondCommander,
  onRemoveSecondCommander,
  onCardClick,
  showSearch,
  onShowSearchChange,
}) {
  const [availableCards, setAvailableCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCards, setFilteredCards] = useState([]);
  const [filterByCommanderColors, setFilterByCommanderColors] = useState(false);

  useEffect(() => {
    const detectType = () => {
      if (!commander) {
        console.log('⚠️ PartnerSelector - No commander provided');
        setSelectedType(null);
        return;
      }

      let type = null;

      // METHOD 1: Check keywords array (most reliable for Scryfall data)
      const keywords = commander.keywords || [];
      const keywordsLower = keywords.map(k => k.toLowerCase());

      // Check oracle_text from multiple locations
      const oracleText = (
        commander.oracle_text ||
        commander.card_faces?.[0]?.oracle_text ||
        ''
      ).toLowerCase();

      // Check type_line for Background subtype
      const typeLine = (commander.type_line || '').toLowerCase();

      // Check if commander can choose a background (check this first, as it also contains "partner")
      if (oracleText.includes('choose a background')) {
        type = 'background';
      }
      // Check if commander needs a companion
      else if (
        keywordsLower.includes('companion') ||
        oracleText.includes('companion')
      ) {
        type = 'companion';
      }
      // Check for "Friends forever"
      else if (oracleText.includes('friends forever')) {
        type = 'friends';
      }
      // Check if commander has partner ability (including special variants)
      // Use keywords array first, then fall back to oracle text
      else if (
        keywordsLower.some(k => k.includes('partner')) ||
        oracleText.includes('partner')
      ) {
        type = 'partner';
      }

      console.log('🔍 PartnerSelector - Commander:', commander.name);
      console.log('   Keywords:', keywords);
      console.log('   Type line:', commander.type_line);
      console.log('   Detected type:', type);

      setSelectedType(type);
    };

    detectType();
  }, [commander]);

  // Load all available cards when user starts searching
  useEffect(() => {
    const loadAvailableCards = async () => {
      if (!commander || !selectedType) return;

      // For backgrounds, allow reloading when filter changes
      // For others, skip if already loaded
      if (selectedType !== 'background' && availableCards.length > 0) return;

      setLoading(true);
      let cards = [];

      // Check multiple possible oracle_text locations
      const oracleText = (
        commander.oracle_text ||
        commander.card_faces?.[0]?.oracle_text ||
        ''
      ).toLowerCase();

      if (oracleText.includes('choose a background')) {
        cards = await fetchBackgrounds(commander, filterByCommanderColors);
      } else if (oracleText.includes('companion')) {
        cards = await fetchCompanions();
      } else if (oracleText.includes('partner')) {
        cards = await fetchPartners(commander, edhrecData);
      } else if (oracleText.includes('friends forever')) {
        cards = await fetchFriends(commander);
      }

      setAvailableCards(cards);
      setLoading(false);
    };

    if (showSearch) {
      loadAvailableCards();
    }
  }, [
    commander,
    edhrecData,
    selectedType,
    showSearch,
    filterByCommanderColors,
  ]);

  // Filter cards based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCards(availableCards);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = availableCards.filter(card =>
      card.name.toLowerCase().includes(query)
    );
    setFilteredCards(filtered);
  }, [searchQuery, availableCards]);

  // If no special requirements, don't render anything
  if (!selectedType) {
    console.log('⚠️ PartnerSelector - Not rendering, no type detected');
    return null;
  }

  console.log('✅ PartnerSelector - Rendering with type:', selectedType);

  const getTitle = () => {
    switch (selectedType) {
      case 'partner':
        return 'Available Partners';
      case 'companion':
        return 'Available Companions';
      case 'background':
        return 'Available Backgrounds';
      case 'friends':
        return 'Friends Forever';
      default:
        return 'Available Cards';
    }
  };

  const getDescription = () => {
    // Check multiple possible oracle_text locations
    const oracleText =
      commander?.oracle_text || commander?.card_faces?.[0]?.oracle_text || '';

    switch (selectedType) {
      case 'partner':
        // Check for special partner variants
        const partnerMatch = oracleText.match(/Partner[—-]\s*([^\n(]+)/i);
        if (partnerMatch) {
          const variant = partnerMatch[1].trim();
          return `This commander has "Partner—${variant}". Only commanders with the same Partner variant can be paired:`;
        }
        return 'This commander has Partner. Select a partner to add to your deck:';
      case 'companion':
        return 'This commander can have a Companion. Select one that matches your deck building restrictions:';
      case 'background':
        return 'This commander can "Choose a Background". Select a background to add as a second commander:';
      case 'friends':
        return 'This commander has "Friends forever". Select another Friends forever commander to pair with:';
      default:
        return '';
    }
  };

  if (availableCards.length === 0) {
    return null;
  }

  return (
    <section id="partner-selector" className="mb-8 scroll-mt-24">
      <div className="glass-card p-6 border-2 border-magic-purple/30">
        {/* Header with Second Commander Status */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
              🤝 {getTitle()}
            </h2>
            {!secondCommander && (
              <p className="text-amber-400 text-sm mt-1 font-semibold">
                ⚠️ Required for this commander
              </p>
            )}
          </div>
          {secondCommander && (
            <div className="flex items-center gap-3 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
              <span className="text-green-400 font-semibold text-sm">
                ✓ Second Commander:
              </span>
              <span className="text-text-primary font-bold">
                {secondCommander.name}
              </span>
              {onRemoveSecondCommander && (
                <button
                  className="text-red-400 hover:text-red-300 font-bold text-xl"
                  onClick={onRemoveSecondCommander}
                  title="Remove second commander"
                >
                  ×
                </button>
              )}
            </div>
          )}
        </div>

        <p className="text-text-secondary mb-4">{getDescription()}</p>

        {/* Search Button / Search Bar */}
        {!showSearch ? (
          <button
            className="w-full px-6 py-4 bg-magic-purple/20 text-magic-purple border-2 border-magic-purple/30 rounded-lg text-lg font-bold cursor-pointer transition-all hover:bg-magic-purple hover:text-white hover:border-magic-purple flex items-center justify-center gap-3 shadow-lg"
            onClick={() => onShowSearchChange(true)}
          >
            <span className="text-2xl">🔍</span>
            <span>Search for Second Commander</span>
          </button>
        ) : (
          <>
            {/* Search Input */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by card name..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:border-magic-purple focus:ring-2 focus:ring-magic-purple/30"
                  autoFocus
                />
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-text-secondary hover:text-text-primary"
                  onClick={() => {
                    onShowSearchChange(false);
                    setSearchQuery('');
                  }}
                >
                  ✕ Close
                </button>
              </div>
              {loading && (
                <p className="text-text-secondary text-sm mt-2">
                  Loading available cards...
                </p>
              )}
              {!loading && availableCards.length > 0 && (
                <div className="flex items-center justify-between mt-2">
                  <p className="text-text-secondary text-sm">
                    Found {filteredCards.length} compatible{' '}
                    {selectedType === 'partner'
                      ? 'partners'
                      : selectedType === 'background'
                        ? 'backgrounds'
                        : selectedType === 'companion'
                          ? 'companions'
                          : 'cards'}
                  </p>
                  {selectedType === 'background' && (
                    <button
                      onClick={() =>
                        setFilterByCommanderColors(!filterByCommanderColors)
                      }
                      className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-all ${
                        filterByCommanderColors
                          ? 'bg-magic-blue/20 text-magic-blue border border-magic-blue/30'
                          : 'bg-white/5 text-text-secondary border border-white/10'
                      } hover:bg-magic-blue/30`}
                    >
                      {filterByCommanderColors
                        ? '🎨 Matching Colors Only'
                        : '🌈 All Colors'}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Search Results */}
            {!loading && filteredCards.length > 0 && (
              <div className="max-h-[600px] overflow-y-auto">
                <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
                  {filteredCards.map(card => {
                    const imageUri =
                      card.image_uris?.normal ||
                      card.card_faces?.[0]?.image_uris?.normal ||
                      '';
                    const isSelected = secondCommander?.id === card.id;

                    return (
                      <div
                        key={card.id}
                        className={`bg-white/5 border rounded-lg overflow-hidden cursor-pointer transition-all hover:transform hover:-translate-y-1 hover:scale-[1.02] ${
                          isSelected
                            ? 'border-green-500 shadow-[0_10px_30px_rgba(34,197,94,0.3)]'
                            : 'border-white/10 hover:border-magic-purple hover:shadow-[0_10px_30px_rgba(139,92,246,0.3)]'
                        }`}
                        onClick={() => onCardClick(card)}
                      >
                        {imageUri && (
                          <img
                            src={imageUri}
                            alt={card.name}
                            className="w-full h-auto"
                          />
                        )}
                        <div className="p-3">
                          <h3 className="text-sm font-semibold text-text-primary mb-1 truncate">
                            {card.name}
                          </h3>
                          <div
                            className="flex gap-1 items-center mb-2"
                            dangerouslySetInnerHTML={{
                              __html: parseManaSymbols(card.mana_cost) || '',
                            }}
                          />
                          <button
                            className={`w-full px-3 py-1.5 border rounded text-xs font-semibold cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                : 'bg-magic-blue/20 text-magic-blue border-magic-blue/30 hover:bg-magic-blue hover:text-white'
                            }`}
                            onClick={e => {
                              e.stopPropagation();
                              onAddSecondCommander(card);
                              onShowSearchChange(false);
                              setSearchQuery('');
                            }}
                          >
                            {isSelected
                              ? '✓ Selected'
                              : 'Select as 2nd Commander'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!loading &&
              filteredCards.length === 0 &&
              availableCards.length > 0 && (
                <p className="text-text-secondary text-center py-8">
                  No cards found matching "{searchQuery}"
                </p>
              )}
          </>
        )}
      </div>
    </section>
  );
}

/**
 * Extract the partner variant from oracle text
 * Examples: "Partner—Survivors", "Partner with [Name]", just "Partner"
 */
function extractPartnerVariant(card) {
  // Check multiple possible oracle_text locations
  const oracleText =
    card?.oracle_text || card?.card_faces?.[0]?.oracle_text || '';

  if (!oracleText) return null;

  const text = oracleText.toLowerCase();

  // Check for "Partner with [specific card name]"
  const partnerWithMatch = oracleText.match(/Partner with ([^\n(]+)/i);
  if (partnerWithMatch) {
    return {
      type: 'partner_with',
      value: partnerWithMatch[1].trim(),
      original: partnerWithMatch[0],
    };
  }

  // Check for "Partner—[variant]" (with em-dash or regular dash)
  const partnerVariantMatch = oracleText.match(/Partner[—-]\s*([^\n(]+)/i);
  if (partnerVariantMatch) {
    return {
      type: 'partner_variant',
      value: partnerVariantMatch[1].trim(),
      original: partnerVariantMatch[0],
    };
  }

  // Check for generic "Partner" (followed by space/newline/parenthesis)
  if (text.match(/partner[\s\n(]/)) {
    return {
      type: 'partner_generic',
      value: 'generic',
      original: 'Partner',
    };
  }

  return null;
}

/**
 * Check if a card is legal in Commander format
 */
function isCommanderLegal(card) {
  // Check Commander legality
  const legality = card.legalities?.commander;
  if (legality === 'banned' || legality === 'not_legal') {
    return false;
  }

  // Filter out digital-only cards (Alchemy)
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
    return false;
  }

  // Filter cards marked as digital-only
  if (card.digital === true) {
    return false;
  }

  // Filter by set_type for Alchemy
  if (card.set_type === 'alchemy') {
    return false;
  }

  return true;
}

/**
 * Fetch partner commanders from EDHREC data and card library
 */
async function fetchPartners(commander, edhrecData) {
  const partners = [];
  const partnerIds = new Set(); // Track unique partners by ID

  // Determine the partner variant of the commander
  const commanderPartnerVariant = extractPartnerVariant(commander);

  if (!commanderPartnerVariant) {
    console.warn('⚠️ Commander does not have valid partner ability');
    return [];
  }

  console.log(
    `🔍 Commander partner type: ${commanderPartnerVariant.type} - "${commanderPartnerVariant.value}"`
  );

  // First, try to get partners from EDHREC partnercounts
  const partnercounts = edhrecData?.panels?.tribelinks?.partnercounts || [];

  if (partnercounts.length > 0) {
    console.log(
      `🔍 Found ${partnercounts.length} potential partners from EDHREC`
    );

    // Fetch full card details for each partner from card library
    for (const partner of partnercounts) {
      const partnerName = partner.value || partner.alt;
      if (partnerName) {
        try {
          const cards = cardLibrary.lexicalSearch(partnerName, 5);
          if (cards && cards.length > 0) {
            const matchedCard = cards[0];

            // Must be Commander legal
            if (!isCommanderLegal(matchedCard)) {
              continue;
            }

            // Verify the partner has the same variant
            const cardPartnerVariant = extractPartnerVariant(matchedCard);
            if (
              cardPartnerVariant &&
              isCompatiblePartner(
                commanderPartnerVariant,
                cardPartnerVariant,
                commander.name,
                matchedCard.name
              )
            ) {
              if (!partnerIds.has(matchedCard.id)) {
                partnerIds.add(matchedCard.id);
                partners.push(matchedCard);
              }
            }
          }
        } catch (error) {
          console.warn(`Failed to fetch partner: ${partnerName}`, error);
        }
      }
    }
  }

  // If no partners from EDHREC, search card library for all partner commanders
  if (partners.length === 0) {
    console.log('🔍 Searching card library for partner commanders...');
    const allCards = cardLibrary.cards;

    if (allCards && allCards.length > 0) {
      const partnerCards = allCards.filter(card => {
        if (card.id === commander.id) return false; // Exclude same commander

        // Must be Commander legal
        if (!isCommanderLegal(card)) {
          return false;
        }

        // Check keywords array first (more reliable)
        const keywords = card.keywords || [];
        const keywordsLower = keywords.map(k => k.toLowerCase());

        // Check oracle_text from multiple locations
        const oracleText = (
          card.oracle_text ||
          card.card_faces?.[0]?.oracle_text ||
          ''
        ).toLowerCase();
        const typeLine = card.type_line?.toLowerCase() || '';

        // Must be a legendary creature with Partner (but not "Choose a Background" or "Friends forever")
        const hasPartner =
          keywordsLower.some(k => k.includes('partner')) ||
          oracleText.includes('partner');
        const hasBackground = oracleText.includes('choose a background');
        const hasFriends = oracleText.includes('friends forever');
        const isLegendaryCreature =
          typeLine.includes('legendary') && typeLine.includes('creature');

        if (
          !isLegendaryCreature ||
          !hasPartner ||
          hasBackground ||
          hasFriends
        ) {
          return false;
        }

        // Check if partner variant matches
        const cardPartnerVariant = extractPartnerVariant(card);
        return (
          cardPartnerVariant &&
          isCompatiblePartner(
            commanderPartnerVariant,
            cardPartnerVariant,
            commander.name,
            card.name
          )
        );
      });

      console.log(
        `✅ Found ${partnerCards.length} compatible partner commanders`
      );

      // Sort by name and limit to prevent performance issues
      partnerCards.sort((a, b) => a.name.localeCompare(b.name));
      partners.push(...partnerCards.slice(0, 50)); // Increased limit to 50
    }
  }

  console.log(`✅ Total compatible partners available: ${partners.length}`);
  return partners;
}

/**
 * Check if two partner variants are compatible
 */
function isCompatiblePartner(variant1, variant2, name1, name2) {
  // Partner with [specific name] - must match exact card names
  if (variant1.type === 'partner_with' || variant2.type === 'partner_with') {
    // Check if the "partner with" specifies each other
    if (
      variant1.type === 'partner_with' &&
      variant1.value.toLowerCase().includes(name2.toLowerCase())
    ) {
      return true;
    }
    if (
      variant2.type === 'partner_with' &&
      variant2.value.toLowerCase().includes(name1.toLowerCase())
    ) {
      return true;
    }
    return false;
  }

  // Partner—[variant] - both must have the same variant
  if (
    variant1.type === 'partner_variant' &&
    variant2.type === 'partner_variant'
  ) {
    return variant1.value.toLowerCase() === variant2.value.toLowerCase();
  }

  // Generic Partner - any generic partner can pair with any generic partner
  if (
    variant1.type === 'partner_generic' &&
    variant2.type === 'partner_generic'
  ) {
    return true;
  }

  // Mixed types are not compatible
  return false;
}

/**
 * Fetch companion cards from card library
 */
async function fetchCompanions() {
  const allCards = cardLibrary.cards;

  if (!allCards || allCards.length === 0) {
    console.warn('⚠️ Card library not loaded');
    return [];
  }

  const companions = allCards.filter(card => {
    // Must be Commander legal
    if (!isCommanderLegal(card)) {
      return false;
    }

    // Check keywords array first (more reliable)
    const keywords = card.keywords || [];
    const keywordsLower = keywords.map(k => k.toLowerCase());

    // Check oracle_text from multiple locations as fallback
    const oracleText = (
      card.oracle_text ||
      card.card_faces?.[0]?.oracle_text ||
      ''
    ).toLowerCase();

    // Look for "Companion" keyword ability
    return (
      keywordsLower.includes('companion') ||
      oracleText.includes('companion —') ||
      oracleText.includes('companion—')
    );
  });

  // Sort by name
  companions.sort((a, b) => a.name.localeCompare(b.name));

  console.log(`✅ Found ${companions.length} companion cards`);
  return companions;
}

/**
 * Fetch background cards from card library
 */
async function fetchBackgrounds(commander, filterByColors = false) {
  const allCards = cardLibrary.cards;

  if (!allCards || allCards.length === 0) {
    console.warn('⚠️ Card library not loaded');
    return [];
  }

  // Search for backgrounds using type_line (most reliable)
  let backgrounds = allCards.filter(card => {
    const typeLine = card.type_line?.toLowerCase() || '';

    // Must be Commander legal
    if (!isCommanderLegal(card)) {
      return false;
    }

    // Must be a legendary enchantment with "Background" as a subtype
    // Format: "Legendary Enchantment — Background"
    return (
      typeLine.includes('legendary') &&
      typeLine.includes('enchantment') &&
      typeLine.includes('background')
    );
  });

  console.log(`🔍 Found ${backgrounds.length} total background cards`);

  // Optionally filter by commander's color identity
  if (filterByColors) {
    const commanderColors = commander.color_identity || [];
    backgrounds = backgrounds.filter(card => {
      const backgroundColors = card.color_identity || [];
      // Only show backgrounds that match commander's colors (keeps deck within same colors)
      return backgroundColors.every(color => commanderColors.includes(color));
    });
    console.log(
      `🎨 Filtered to ${backgrounds.length} backgrounds matching ${commanderColors.join('') || 'colorless'} colors`
    );
  } else {
    console.log(
      `🌈 Showing all backgrounds (any color expands your deck's identity)`
    );
  }

  // Sort backgrounds by color identity, then by name for better organization
  backgrounds.sort((a, b) => {
    const aColors = (a.color_identity || []).join('');
    const bColors = (b.color_identity || []).join('');

    // Colorless first, then alphabetically by color
    if (!aColors && bColors) return -1;
    if (aColors && !bColors) return 1;
    if (aColors !== bColors) return aColors.localeCompare(bColors);

    // Same colors, sort by name
    return a.name.localeCompare(b.name);
  });

  return backgrounds;
}

/**
 * Fetch "Friends forever" commanders from card library
 */
async function fetchFriends(commander) {
  const allCards = cardLibrary.cards;

  if (!allCards || allCards.length === 0) {
    console.warn('⚠️ Card library not loaded');
    return [];
  }

  const friendsCards = allCards.filter(card => {
    if (card.id === commander.id) return false; // Exclude same commander

    // Must be Commander legal
    if (!isCommanderLegal(card)) {
      return false;
    }

    // Check keywords array first (more reliable)
    const keywords = card.keywords || [];
    const keywordsLower = keywords.map(k => k.toLowerCase());

    // Check oracle_text from multiple locations as fallback
    const oracleText = (
      card.oracle_text ||
      card.card_faces?.[0]?.oracle_text ||
      ''
    ).toLowerCase();
    const typeLine = card.type_line?.toLowerCase() || '';

    // Must be a legendary creature with "Friends forever"
    const hasFriends =
      keywordsLower.some(k => k.includes('friends forever')) ||
      oracleText.includes('friends forever');
    const isLegendaryCreature =
      typeLine.includes('legendary') && typeLine.includes('creature');

    return isLegendaryCreature && hasFriends;
  });

  // Sort by name
  friendsCards.sort((a, b) => a.name.localeCompare(b.name));

  console.log(`✅ Found ${friendsCards.length} Friends forever commanders`);
  return friendsCards;
}

export default PartnerSelector;
