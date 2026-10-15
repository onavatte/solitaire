import { describe, expect, it } from 'vitest'
import { dealGame } from './deal'
import type { Card } from './types'

describe('dealGame', () => {
  it('crée un état initial valide avec 7 colonnes, fondations vides, pioche et défausse', () => {
    const game = dealGame({ seed: 'test-seed-1', drawCount: 1 })

    // 7 colonnes
    expect(game.tableau).toHaveLength(7)

    // Vérification de chaque colonne (i + 1 cartes, seule la dernière visible)
    game.tableau.forEach((col, index) => {
      expect(col).toHaveLength(index + 1)
      col.forEach((card, cardIndex) => {
        if (cardIndex === col.length - 1) {
          expect(card.faceUp).toBe(true)
        } else {
          expect(card.faceUp).toBe(false)
        }
      })
    })

    // 4 fondations vides
    expect(game.foundations).toHaveLength(4)
    expect(game.foundations.every((f) => f.length === 0)).toBe(true)

    // Défausse vide
    expect(game.waste).toEqual([])

    // Pioche avec 24 cartes cachées (52 - 28 = 24)
    expect(game.stock).toHaveLength(24)
    expect(game.stock.every((c) => !c.faceUp)).toBe(true)

    // Métadonnées
    expect(game.drawCount).toBe(1)
    expect(game.moves).toBe(0)
    expect(game.elapsedMs).toBe(0)
    expect(game.status).toBe('playing')
    expect(game.seed).toBe('test-seed-1')
  })

  it('conserve exactement 52 cartes uniques réparties sur le plateau', () => {
    const game = dealGame({ seed: 42 })

    const allCards: Card[] = [
      ...game.tableau.flat(),
      ...game.foundations.flat(),
      ...game.waste,
      ...game.stock,
    ]

    expect(allCards).toHaveLength(52)
    const ids = new Set(allCards.map((c) => c.id))
    expect(ids.size).toBe(52)
  })

  it('génère une donne déterministe pour une même graine', () => {
    const game1 = dealGame({ seed: 'solitaire-du-jour' })
    const game2 = dealGame({ seed: 'solitaire-du-jour' })
    const game3 = dealGame({ seed: 'autre-graine' })

    const extractIds = (g: typeof game1) => ({
      tableau: g.tableau.map((c) => c.map((card) => card.id)),
      stock: g.stock.map((card) => card.id),
    })

    expect(extractIds(game1)).toEqual(extractIds(game2))
    expect(extractIds(game1)).not.toEqual(extractIds(game3))
  })

  it('utilise 1 carte de pioche par défaut ou accepte 3 cartes', () => {
    const gameDefault = dealGame()
    expect(gameDefault.drawCount).toBe(1)

    const gameDraw3 = dealGame({ drawCount: 3 })
    expect(gameDraw3.drawCount).toBe(3)
  })
})

