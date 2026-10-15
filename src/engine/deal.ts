import { createDeck, createRng, shuffle } from './deck'
import type { Card, DealOptions, GameState } from './types'

export function dealGame(options?: DealOptions): GameState {
  const seed = options?.seed ?? Math.floor(Math.random() * 1_000_000_000)
  const drawCount = options?.drawCount ?? 1

  const rng = createRng(seed)
  const deck = shuffle(createDeck(), rng)

  let cardIndex = 0

  // 7 colonnes de tableau (colonne i contient i + 1 cartes, la dernière est faceUp)
  const tableau: Card[][] = []
  for (let col = 0; col < 7; col++) {
    const columnCards: Card[] = []
    const count = col + 1
    for (let i = 0; i < count; i++) {
      const card = deck[cardIndex]
      if (!card) {
        throw new Error('Erreur inattendue : paquet incomplet lors de la distribution')
      }
      const isTop = i === count - 1
      columnCards.push({
        ...card,
        faceUp: isTop,
      })
      cardIndex++
    }
    tableau.push(columnCards)
  }

  // Les 24 cartes restantes vont dans la pioche (stock), face cachée
  const stock: Card[] = []
  while (cardIndex < deck.length) {
    const card = deck[cardIndex]
    if (card) {
      stock.push({
        ...card,
        faceUp: false,
      })
    }
    cardIndex++
  }

  const foundations: Card[][] = [[], [], [], []]
  const waste: Card[] = []

  return {
    tableau,
    foundations,
    stock,
    waste,
    drawCount,
    moves: 0,
    elapsedMs: 0,
    seed,
    status: 'playing',
  }
}

