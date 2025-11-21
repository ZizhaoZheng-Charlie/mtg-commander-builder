import { useEffect } from 'react';
import { getEDHRECData, extractFrontFaceName } from '../utils/api';
import { cardLibrary } from '../utils/cardLibrary';

function CommanderDisplay({
  commander,
  secondCommander,
  onSynergyData,
  onTopCardsData,
  onEdhrecData,
  setLoading,
}) {
  useEffect(() => {
    const loadCommanderData = async () => {
      if (!commander) return;

      setLoading(true);

      // Extract front face name for double-faced cards (EDHREC uses front face only)
      const commanderName = commander.card_faces?.[0]?.name || commander.name;
      const secondCommanderName =
        secondCommander?.card_faces?.[0]?.name || secondCommander?.name;

      if (secondCommander) {
        console.log(
          '🤝 Fetching EDHREC data for partner pair:',
          commanderName,
          '+',
          secondCommanderName
        );
      } else {
        console.log('🔍 Fetching EDHREC data for:', commanderName);
      }

      try {
        // Get EDHREC data - pass second commander if present
        const edhrecData = await getEDHRECData(
          commanderName,
          setLoading,
          secondCommanderName
        );
        onEdhrecData(edhrecData);

        if (edhrecData && edhrecData.container?.json_dict?.cardlists) {
          console.log('✅ EDHREC data loaded successfully');

          // Extract synergy cards from cardlists
          const synergyCardsData = [];
          const topCardsData = [];
          const cardlists = edhrecData.container.json_dict.cardlists;

          console.log(`📋 Found ${cardlists.length} card categories`);

          // Process each cardlist
          for (const cardlist of cardlists) {
            const header = cardlist.header || '';
            const cardviews = cardlist.cardviews || [];

            console.log(`  - ${header}: ${cardviews.length} cards`);

            for (const cardview of cardviews) {
              // Skip basic lands - they're not useful recommendations
              const isBasicLand = [
                'island',
                'plains',
                'swamp',
                'mountain',
                'forest',
                'wastes',
              ].includes(cardview.name.toLowerCase());

              if (isBasicLand) {
                continue;
              }

              const cardInfo = {
                name: cardview.name,
                synergy: cardview.synergy,
                inclusion: cardview.inclusion,
                num_decks: cardview.num_decks,
                potential_decks: cardview.potential_decks,
                label: cardview.label,
                url: cardview.url,
                sanitized: cardview.sanitized,
                category: header,
              };

              // Cards with synergy score go to synergy list
              if (cardview.synergy !== undefined && cardview.synergy > 0) {
                synergyCardsData.push(cardInfo);
              }

              // All cards go to top cards list (we'll filter later)
              topCardsData.push(cardInfo);
            }
          }

          // Sort by synergy (highest first) and limit to top 30
          synergyCardsData.sort((a, b) => b.synergy - a.synergy);
          const topSynergyCards = synergyCardsData.slice(0, 30);

          // Sort by inclusion rate for top cards and limit to top 30
          topCardsData.sort((a, b) => b.inclusion - a.inclusion);
          const topPopularCards = topCardsData.slice(0, 30);

          console.log(`✨ Found ${topSynergyCards.length} high synergy cards`);
          console.log(`🏆 Found ${topPopularCards.length} popular cards`);

          // Fetch full card details from Scryfall for synergy cards
          const synergyCardsWithDetails = await fetchCardDetails(
            topSynergyCards,
            'synergy'
          );
          onSynergyData(synergyCardsWithDetails);

          // Fetch full card details from Scryfall for top cards
          const topCardsWithDetails = await fetchCardDetails(
            topPopularCards,
            'popular'
          );
          onTopCardsData(topCardsWithDetails);
        } else {
          console.log('⚠️ No EDHREC data available for:', commanderName);
          onSynergyData([]);
          onTopCardsData([]);
        }
      } catch (error) {
        console.error('❌ Error loading commander data:', error);
        onSynergyData([]);
        onTopCardsData([]);
      } finally {
        setLoading(false);
      }
    };

    loadCommanderData();
  }, [
    commander,
    secondCommander,
    onSynergyData,
    onTopCardsData,
    onEdhrecData,
    setLoading,
  ]);

  // Don't render any UI, just handle data loading
  return null;
}

/**
 * Get the front face name from a Scryfall card
 * Handles both double-faced cards (with " // " separator) and cards with card_faces array
 */
function getScryfallFrontFaceName(scryfallCard) {
  // Check card_faces first (most reliable)
  if (scryfallCard.card_faces && scryfallCard.card_faces.length > 0) {
    return scryfallCard.card_faces[0].name || scryfallCard.name;
  }

  // Fall back to extracting from name string
  return extractFrontFaceName(scryfallCard.name);
}

/**
 * Fetch full card details from Scryfall for EDHREC cards
 */
async function fetchCardDetails(cards, type = 'cards') {
  console.log(`🔎 Fetching ${type} card details from card library...`);

  const cardsWithDetails = [];

  for (const card of cards) {
    try {
      // Use the card library to search for the exact card
      const scryfallCards = cardLibrary.lexicalSearch(card.name, 10);

      if (scryfallCards && scryfallCards.length > 0) {
        // EDHREC card name (usually just front face for double-faced cards)
        const edhrecCardName = card.name.toLowerCase().trim();

        // Find matching card by comparing front face names
        // This handles double-faced cards where EDHREC has "Chandra, Fire of Kaladesh"
        // but Scryfall has "Chandra, Fire of Kaladesh // Chandra, Roaring Flame"
        const scryfallCard =
          scryfallCards.find(c => {
            const scryfallFrontFace = getScryfallFrontFaceName(c)
              .toLowerCase()
              .trim();
            return scryfallFrontFace === edhrecCardName;
          }) ||
          scryfallCards.find(c => {
            // Fallback: exact name match
            return c.name.toLowerCase() === edhrecCardName;
          }) ||
          scryfallCards[0]; // Last resort: first result

        // Merge EDHREC data with Scryfall data
        cardsWithDetails.push({
          ...scryfallCard,
          synergy: card.synergy,
          inclusion: card.inclusion,
          num_decks: card.num_decks,
          potential_decks: card.potential_decks,
          edhrecCategory: card.category,
          percentage: card.inclusion
            ? Math.round((card.num_decks / card.potential_decks) * 100)
            : null,
        });
      } else {
        console.warn(`⚠️ Card not found in library: ${card.name}`);
      }
    } catch (error) {
      console.error(`❌ Error fetching card: ${card.name}`, error);
    }
  }

  console.log(
    `✅ Successfully fetched ${cardsWithDetails.length}/${cards.length} ${type} card details`
  );

  return cardsWithDetails;
}

export default CommanderDisplay;
