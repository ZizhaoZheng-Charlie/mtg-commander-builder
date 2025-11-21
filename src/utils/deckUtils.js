// Deck management utilities

export function addToDeck(deck, card, isCommander = false) {
  // Remove existing commander if adding a new one
  if (isCommander) {
    const existingCommanderIndex = deck.findIndex(c => c.isCommander);
    if (existingCommanderIndex !== -1) {
      deck.splice(existingCommanderIndex, 1);
    }
  }

  // Check if card already exists in deck
  const existingIndex = deck.findIndex(c => c.id === card.id && !c.isCommander);

  if (existingIndex !== -1) {
    // Increment quantity
    const updatedDeck = [...deck];
    updatedDeck[existingIndex] = {
      ...updatedDeck[existingIndex],
      quantity: (updatedDeck[existingIndex].quantity || 1) + 1,
    };
    return updatedDeck;
  } else {
    // Add new card
    return [...deck, { ...card, quantity: 1, isCommander }];
  }
}

export function removeFromDeck(deck, cardId) {
  return deck.filter(card => card.id !== cardId);
}

export function updateCardQuantity(deck, cardId, quantity) {
  if (quantity <= 0) {
    return removeFromDeck(deck, cardId);
  }

  return deck.map(card => (card.id === cardId ? { ...card, quantity } : card));
}

export function getDeckCount(deck) {
  return deck.reduce((total, card) => total + (card.quantity || 1), 0);
}

export function clearDeck() {
  return [];
}
