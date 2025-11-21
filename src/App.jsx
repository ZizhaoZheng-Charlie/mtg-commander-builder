import { useState, useEffect } from 'react';
import Header from './components/Header';
import CommanderSearch from './components/CommanderSearch';
import CommanderDisplay from './components/CommanderDisplay';
import PartnerSelector from './components/PartnerSelector';
import SynergyCards from './components/SynergyCards';
import TopCards from './components/TopCards';
import DeckBuilder from './components/DeckBuilder';
import CardSearch from './components/CardSearch';
import LoadingOverlay from './components/LoadingOverlay';
import CardModal from './components/CardModal';
import Footer from './components/Footer';
import LibraryLoadingBanner from './components/LibraryLoadingBanner';
import CategorizedCards from './components/CategorizedCards';
import { cache } from './utils/cache';
import { addToDeck } from './utils/deckUtils';
import { cardLibrary } from './utils/cardLibrary';

/**
 * Check if a commander requires a second commander
 */
function requiresSecondCommander(commander) {
  if (!commander) return false;

  // Check keywords array first (most reliable for Scryfall data)
  const keywords = commander.keywords || [];
  const keywordsLower = keywords.map(k => k.toLowerCase());

  // Check multiple possible oracle_text locations
  const oracleText = (
    commander.oracle_text ||
    commander.card_faces?.[0]?.oracle_text ||
    ''
  ).toLowerCase();

  // Check for abilities that require a second commander
  // Check keywords first, then fall back to oracle text
  return (
    keywordsLower.some(k => k.includes('partner')) ||
    keywordsLower.includes('companion') ||
    oracleText.includes('partner') ||
    oracleText.includes('choose a background') ||
    oracleText.includes('friends forever')
  );
}

function App() {
  const [selectedCommander, setSelectedCommander] = useState(null);
  const [secondCommander, setSecondCommander] = useState(null);
  const [deck, setDeck] = useState([]);
  const [synergyCards, setSynergyCards] = useState([]);
  const [topCards, setTopCards] = useState([]);
  const [edhrecData, setEdhrecData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalCard, setModalCard] = useState(null);
  const [previousCard, setPreviousCard] = useState(null);
  const [activeCategory, setActiveCategory] = useState('high-synergy');
  const [showPartnerSearch, setShowPartnerSearch] = useState(false);

  // Clean up expired cache entries and load card library on mount
  useEffect(() => {
    cache.clearOldEntries();
    console.log('MTG Commander Builder initialized!');
    console.log('Search for a commander to get started.');
    console.log('Cache system: localStorage with 1-hour expiration');
    console.log('Electron User Agent:', navigator.userAgent);
    console.log('Environment:', import.meta.env.MODE);

    // Expose cardLibrary to window for debugging
    if (typeof window !== 'undefined') {
      window.cardLibrary = cardLibrary;
      console.log('💡 Debug: window.cardLibrary is available in console');
    }

    // Load the complete Scryfall card library
    setLoading(true);
    console.log('⏳ Starting card library load...');

    cardLibrary
      .loadLibrary()
      .then(cards => {
        const stats = cardLibrary.getStats();
        console.log('📊 Card Library Stats:', stats);
        console.log(`✅ Successfully loaded ${cards?.length || 0} cards`);
        setLoading(false);
      })
      .catch(error => {
        console.error('❌ Failed to load card library:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });
        alert(
          `Failed to load card library: ${error.message}\n\nSome search features may be limited. Please check your internet connection.`
        );
        setLoading(false);
      });
  }, []);

  // Reset deck and add commander(s) when selected/changed
  useEffect(() => {
    if (selectedCommander) {
      const commanders = [
        { ...selectedCommander, quantity: 1, isCommander: true },
      ];

      // Add second commander if present
      if (secondCommander) {
        commanders.push({
          ...secondCommander,
          quantity: 1,
          isCommander: true,
          isSecondCommander: true,
        });
      }

      setDeck(commanders);
    } else {
      // Clear deck when commander is removed
      setDeck([]);
      setSecondCommander(null);
    }
  }, [selectedCommander, secondCommander]);

  // Return to commander search when deck becomes empty
  useEffect(() => {
    if (deck.length === 0 && selectedCommander) {
      setSelectedCommander(null);
      setSecondCommander(null);
    }
  }, [deck]);

  // Handler for adding a second commander (from PartnerSelector)
  const handleAddSecondCommander = async card => {
    if (!selectedCommander) {
      alert('Please select a commander first!');
      return;
    }

    // If card doesn't have full Scryfall data, fetch it
    if (!card.image_uris && !card.card_faces) {
      setLoading(true);
      try {
        const scryfallCards = cardLibrary.lexicalSearch(card.name, 5);
        const fullCard =
          scryfallCards.find(
            c => c.name.toLowerCase() === card.name.toLowerCase()
          ) || scryfallCards[0];

        if (fullCard) {
          setSecondCommander(fullCard);
          console.log('✅ Second commander added:', fullCard.name);
        } else {
          alert(`Could not find card: ${card.name}`);
        }
      } catch (error) {
        console.error('Error fetching card details:', error);
        alert(`Error adding second commander: ${card.name}`);
      } finally {
        setLoading(false);
      }
    } else {
      setSecondCommander(card);
      console.log('✅ Second commander added:', card.name);
    }
  };

  const handleAddToDeck = async card => {
    if (!selectedCommander) {
      alert(
        'Please select a commander first before adding cards to your deck!'
      );
      return;
    }

    // If card doesn't have full Scryfall data, fetch it
    if (!card.image_uris && !card.card_faces) {
      setLoading(true);
      try {
        const scryfallCards = cardLibrary.lexicalSearch(card.name, 5);
        const fullCard =
          scryfallCards.find(
            c => c.name.toLowerCase() === card.name.toLowerCase()
          ) || scryfallCards[0];

        if (fullCard) {
          setDeck(prev => addToDeck(prev, fullCard, false));
        } else {
          alert(`Could not find card: ${card.name}`);
        }
      } catch (error) {
        console.error('Error fetching card details:', error);
        alert(`Error adding card: ${card.name}`);
      } finally {
        setLoading(false);
      }
    } else {
      setDeck(prev => addToDeck(prev, card, false));
    }
  };

  const handleCardClick = async card => {
    // Save current modal card as previous if it exists
    if (modalCard) {
      setPreviousCard(modalCard);
    }

    // If card doesn't have full Scryfall data, fetch it
    if (!card.image_uris && !card.card_faces) {
      setLoading(true);
      try {
        const scryfallCards = cardLibrary.lexicalSearch(card.name, 5);
        const fullCard =
          scryfallCards.find(
            c => c.name.toLowerCase() === card.name.toLowerCase()
          ) || scryfallCards[0];

        if (fullCard) {
          setModalCard(fullCard);
        } else {
          alert(`Could not find card details: ${card.name}`);
        }
      } catch (error) {
        console.error('Error fetching card details:', error);
        alert(`Error loading card: ${card.name}`);
      } finally {
        setLoading(false);
      }
    } else {
      setModalCard(card);
    }
  };

  const handleBackToPrevious = () => {
    if (previousCard) {
      setModalCard(previousCard);
      setPreviousCard(null); // Clear previous card after going back
    }
  };

  return (
    <div className="min-h-screen relative">
      <div className="background-gradient"></div>
      <LibraryLoadingBanner />
      <Header />

      <main className="container mx-auto px-4 max-w-7xl py-8">
        {!selectedCommander && (
          <CommanderSearch
            onCommanderSelect={setSelectedCommander}
            setLoading={setLoading}
          />
        )}

        {selectedCommander && (
          <>
            <CommanderDisplay
              commander={selectedCommander}
              secondCommander={secondCommander}
              onSynergyData={setSynergyCards}
              onTopCardsData={setTopCards}
              onEdhrecData={setEdhrecData}
              setLoading={setLoading}
            />

            <PartnerSelector
              commander={selectedCommander}
              secondCommander={secondCommander}
              edhrecData={edhrecData}
              onAddSecondCommander={handleAddSecondCommander}
              onRemoveSecondCommander={() => setSecondCommander(null)}
              onCardClick={handleCardClick}
              showSearch={showPartnerSearch}
              onShowSearchChange={setShowPartnerSearch}
            />

            <DeckBuilder
              deck={deck}
              commander={selectedCommander}
              secondCommander={secondCommander}
              onDeckChange={setDeck}
              onCardClick={handleCardClick}
              onChangeCommander={() => setSelectedCommander(null)}
              onRemoveSecondCommander={() => setSecondCommander(null)}
              requiresSecondCommander={requiresSecondCommander(
                selectedCommander
              )}
              onOpenPartnerSearch={() => setShowPartnerSearch(true)}
            />

            <div id="high-synergy" className="scroll-mt-24">
              {synergyCards.length > 0 && (
                <SynergyCards
                  cards={synergyCards}
                  onAddToDeck={handleAddToDeck}
                  onCardClick={handleCardClick}
                />
              )}
            </div>

            <div id="top-cards" className="scroll-mt-24">
              {topCards.length > 0 && (
                <TopCards
                  cards={topCards}
                  onAddToDeck={handleAddToDeck}
                  onCardClick={handleCardClick}
                />
              )}
            </div>

            <CategorizedCards
              edhrecData={edhrecData}
              onAddToDeck={handleAddToDeck}
              onCardClick={handleCardClick}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
          </>
        )}

        <CardSearch
          onAddToDeck={handleAddToDeck}
          onCardClick={handleCardClick}
          setLoading={setLoading}
          commander={selectedCommander}
          secondCommander={secondCommander}
        />
      </main>

      <LoadingOverlay loading={loading} />
      <CardModal
        card={modalCard}
        onClose={() => {
          setModalCard(null);
          setPreviousCard(null);
        }}
        edhrecData={edhrecData}
        onCardClick={handleCardClick}
        previousCard={previousCard}
        onBack={handleBackToPrevious}
      />
      <Footer />
    </div>
  );
}

export default App;
