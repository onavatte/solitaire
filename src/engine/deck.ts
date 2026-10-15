import type { Card, CardColor, Rank, Suit } from './types'

export const SUITS: readonly Suit[] = ['spades', 'hearts', 'diamonds', 'clubs']
export const RANKS: readonly Rank[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]

export function colorOf(suit: Suit): CardColor {
  return suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black'
}

export function createDeck(): Card[] {
  const deck: Card[] = []
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        id: `${suit}-${rank}`,
        suit,
        rank,
        faceUp: false,
      })
    }
  }
  return deck
}

function hashString(str: string): number {
  let hash = 2166136261
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

/**
 * Générateur pseudo-aléatoire déterministe Mulberry32.
 * Retourne une fonction générant un flottant dans [0, 1).
 */
export function createRng(seed: number | string): () => number {
  let a = typeof seed === 'number' ? seed >>> 0 : hashString(seed)

  return function next(): number {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Mélange un tableau de façon immuable avec l'algorithme de Fisher-Yates.
 */
export function shuffle<T>(array: readonly T[], rng: () => number = Math.random): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    const itemI = result[i]
    const itemJ = result[j]
    if (itemI !== undefined && itemJ !== undefined) {
      result[i] = itemJ
      result[j] = itemI
    }
  }
  return result
}

