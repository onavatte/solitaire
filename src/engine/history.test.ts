import { describe, expect, it } from 'vitest'
import {
  canUndo,
  initHistory,
  isGameWon,
  recordMove,
  undo,
} from './history'
import { moveCards } from './moves'
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
    score: 0,
    seed: 1,
    status: 'playing',
    ...overrides,
  }
}

describe('isGameWon', () => {
  it('détecte la victoire quand les 4 fondations sont complètes (13 cartes chacune)', () => {
    const fullFoundation = (suit: Card['suit']) =>
      Array.from({ length: 13 }, (_, i) => makeCard(suit, (i + 1) as Card['rank']))

    const winningState = createEmptyState({
      foundations: [
        fullFoundation('spades'),
        fullFoundation('hearts'),
        fullFoundation('diamonds'),
        fullFoundation('clubs'),
      ],
    })

    expect(isGameWon(winningState)).toBe(true)
  })

  it('renvoie false si une fondation n’est pas complète', () => {
    const fullFoundation = (suit: Card['suit']) =>
      Array.from({ length: 13 }, (_, i) => makeCard(suit, (i + 1) as Card['rank']))

    const almostWonState = createEmptyState({
      foundations: [
        fullFoundation('spades'),
        fullFoundation('hearts'),
        fullFoundation('diamonds'),
        fullFoundation('clubs').slice(0, 12), // 12 cartes au lieu de 13
      ],
    })

    expect(isGameWon(almostWonState)).toBe(false)
  })
})

describe('moveCards & status won', () => {
  it('passe automatiquement le statut du jeu à won lors du coup gagnant', () => {
    const fullFoundation = (suit: Card['suit']) =>
      Array.from({ length: 13 }, (_, i) => makeCard(suit, (i + 1) as Card['rank']))

    const kingOfClubs = makeCard('clubs', 13)

    const state = createEmptyState({
      tableau: [[kingOfClubs], [], [], [], [], [], []],
      foundations: [
        fullFoundation('spades'),
        fullFoundation('hearts'),
        fullFoundation('diamonds'),
        fullFoundation('clubs').slice(0, 12),
      ],
    })

    const next = moveCards(
      state,
      { zone: 'tableau', column: 0 },
      { zone: 'foundation', foundationIndex: 3 },
    )

    expect(next.status).toBe('won')
  })
})

describe('GameHistory (Undo illimité)', () => {
  it('initialise l’historique sans passé', () => {
    const state = createEmptyState()
    const history = initHistory(state)

    expect(history.present).toBe(state)
    expect(history.past).toHaveLength(0)
    expect(canUndo(history)).toBe(false)
  })

  it('enregistre un nouveau coup dans la pile du passé', () => {
    const s0 = createEmptyState({ moves: 0 })
    const s1 = createEmptyState({ moves: 1 })

    const h0 = initHistory(s0)
    const h1 = recordMove(h0, s1)

    expect(h1.present).toBe(s1)
    expect(h1.past).toEqual([s0])
    expect(canUndo(h1)).toBe(true)
  })

  it('ignore un enregistrement si l’état n’a pas changé', () => {
    const s0 = createEmptyState()
    const h0 = initHistory(s0)
    const h1 = recordMove(h0, s0)

    expect(h1).toBe(h0)
    expect(h1.past).toHaveLength(0)
  })

  it('permet l’annulation successive d’une série de coups', () => {
    const s0 = createEmptyState({ moves: 0 })
    const s1 = createEmptyState({ moves: 1 })
    const s2 = createEmptyState({ moves: 2 })

    let history = initHistory(s0)
    history = recordMove(history, s1)
    history = recordMove(history, s2)

    expect(history.present.moves).toBe(2)
    expect(history.past).toHaveLength(2)

    // 1er undo -> retour à s1
    history = undo(history)
    expect(history.present.moves).toBe(1)
    expect(history.past).toHaveLength(1)
    expect(canUndo(history)).toBe(true)

    // 2e undo -> retour à s0
    history = undo(history)
    expect(history.present.moves).toBe(0)
    expect(history.past).toHaveLength(0)
    expect(canUndo(history)).toBe(false)

    // 3e undo quand la pile est vide -> inchangé
    const noopHistory = undo(history)
    expect(noopHistory).toBe(history)
  })
})

