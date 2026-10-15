import { describe, expect, it } from 'vitest'
import { colorOf, createDeck, createRng, shuffle } from './deck'
import type { Card, Suit } from './types'

describe('createDeck', () => {
  it('crée un paquet de 52 cartes uniques', () => {
    const deck = createDeck()
    expect(deck).toHaveLength(52)

    const ids = new Set(deck.map((c) => c.id))
    expect(ids.size).toBe(52)
  })

  it('contient 13 cartes par enseigne (de 1 à 13)', () => {
    const deck = createDeck()
    const suits: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs']

    for (const suit of suits) {
      const suitCards = deck.filter((c) => c.suit === suit)
      expect(suitCards).toHaveLength(13)
      const ranks = suitCards.map((c) => c.rank).sort((a, b) => a - b)
      expect(ranks).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])
    }
  })

  it('génère des cartes face cachée par défaut', () => {
    const deck = createDeck()
    expect(deck.every((c) => !c.faceUp)).toBe(true)
  })
})

describe('colorOf', () => {
  it('associe la bonne couleur à chaque enseigne', () => {
    expect(colorOf('hearts')).toBe('red')
    expect(colorOf('diamonds')).toBe('red')
    expect(colorOf('spades')).toBe('black')
    expect(colorOf('clubs')).toBe('black')
  })
})

describe('createRng (Mulberry32)', () => {
  it('est déterministe avec une même graine numérique', () => {
    const rng1 = createRng(12345)
    const rng2 = createRng(12345)

    const seq1 = [rng1(), rng1(), rng1()]
    const seq2 = [rng2(), rng2(), rng2()]

    expect(seq1).toEqual(seq2)
    seq1.forEach((n) => {
      expect(n).toBeGreaterThanOrEqual(0)
      expect(n).toBeLessThan(1)
    })
  })

  it('accepte une graine sous forme de chaîne de caractères', () => {
    const rng1 = createRng('partie-42')
    const rng2 = createRng('partie-42')
    expect(rng1()).toEqual(rng2())

    const rng3 = createRng('autre-graine')
    expect(rng1()).not.toEqual(rng3())
  })
})

describe('shuffle', () => {
  it('mélange sans muter le tableau d’origine', () => {
    const original: readonly number[] = [1, 2, 3, 4, 5, 6, 7, 8]
    const rng = createRng(42)
    const shuffled = shuffle(original, rng)

    expect(shuffled).not.toBe(original)
    expect(original).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    expect(shuffled).toHaveLength(original.length)
    expect([...shuffled].sort()).toEqual([...original].sort())
    expect(shuffled).not.toEqual(original)
  })

  it('produit un mélange reproductible avec la même graine', () => {
    const deck = createDeck()
    const shuffled1 = shuffle(deck, createRng('seed-1'))
    const shuffled2 = shuffle(deck, createRng('seed-1'))
    const shuffled3 = shuffle(deck, createRng('seed-2'))

    const ids1 = shuffled1.map((c: Card) => c.id)
    const ids2 = shuffled2.map((c: Card) => c.id)
    const ids3 = shuffled3.map((c: Card) => c.id)

    expect(ids1).toEqual(ids2)
    expect(ids1).not.toEqual(ids3)
  })
})

