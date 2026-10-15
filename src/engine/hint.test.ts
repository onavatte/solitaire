import { describe, expect, it } from 'vitest'
import { findHint } from './hint'
import type { Card, GameState } from './types'

function makeCard(suit: Card['suit'], rank: Card['rank'], faceUp = true): Card {
  return { id: `${suit}-${rank}`, suit, rank, faceUp }
}

function createEmptyState(overrides?: Partial<GameState>): GameState {
  return {
    tableau: [[], [], [], [], [], [], []],
    foundations: [[], [], [], []],
    stock: [],
    waste: [],
    drawCount: 1,
    moves: 0,
    elapsedMs: 0,
    seed: 1,
    status: 'playing',
    ...overrides,
  }
}

describe('findHint', () => {
  it('propose en priorité d’envoyer un As vers une fondation vide', () => {
    const ace = makeCard('hearts', 1)
    const state = createEmptyState({
      tableau: [[ace], [], [], [], [], [], []],
    })

    const hint = findHint(state)
    expect(hint).toEqual({
      type: 'move',
      from: { zone: 'tableau', column: 0 },
      to: { zone: 'foundation', foundationIndex: 0 },
    })
  })

  it('propose de déplacer une carte de la défausse vers le tableau', () => {
    const wasteTop = makeCard('hearts', 7)
    const black8 = makeCard('spades', 8)
    const state = createEmptyState({
      waste: [wasteTop],
      tableau: [[black8], [], [], [], [], [], []],
    })

    const hint = findHint(state)
    expect(hint).toEqual({
      type: 'move',
      from: { zone: 'waste' },
      to: { zone: 'tableau', column: 0 },
    })
  })

  it('propose un déplacement tableau vers tableau qui révèle une carte cachée', () => {
    const hiddenCard = makeCard('clubs', 4, false)
    const red7 = makeCard('hearts', 7, true)
    const black8 = makeCard('spades', 8, true)

    const state = createEmptyState({
      tableau: [[hiddenCard, red7], [black8], [], [], [], [], []],
    })

    const hint = findHint(state)
    expect(hint).toEqual({
      type: 'move',
      from: { zone: 'tableau', column: 0, cardIndex: 1 },
      to: { zone: 'tableau', column: 1 },
    })
  })

  it('propose de piocher si aucun coup sur le plateau n’est disponible', () => {
    const hidden = makeCard('clubs', 2, false)
    const visible = makeCard('clubs', 7, true)
    const state = createEmptyState({
      tableau: [[hidden, visible], [], [], [], [], [], []],
      stock: [makeCard('hearts', 1, false)],
    })

    const hint = findHint(state)
    expect(hint).toEqual({ type: 'draw' })
  })

  it('renvoie null si aucun coup ni pioche n’est possible', () => {
    const state = createEmptyState({
      tableau: [[makeCard('clubs', 7, true)], [], [], [], [], [], []],
      stock: [],
      waste: [],
    })

    const hint = findHint(state)
    expect(hint).toBeNull()
  })
})
