import { describe, expect, it } from 'vitest'
import type { Card, GameState } from '../engine'
import { initHistory } from '../engine'
import { getDefaultStats } from './persistence'
import { gameReducer, type GameStoreState } from './useGame'

function createMockStore(game: GameState): GameStoreState {
  return {
    history: initHistory(game),
    selectedLocation: null,
    activeHint: null,
    isPaused: false,
    isAutocompleting: false,
    hasCountedPlayed: false,
    stats: getDefaultStats(),
    allowAutoFoundation: true,
  }
}

describe('gameReducer - SAFE_FOUNDATION_STEP', () => {
  const aceSpades: Card = { id: 'spades-1', suit: 'spades', rank: 1, faceUp: true }

  const baseGameState: GameState = {
    stock: [],
    waste: [],
    foundations: [[], [], [], []],
    tableau: [[aceSpades], [], [], [], [], [], []],
    drawCount: 1,
    status: 'playing',
    moves: 0,
    score: 0,
    elapsedMs: 0,
    seed: 12345,
  }

  it('ne monte pas l As automatiquement si moves === 0 (juste après la donne initiale)', () => {
    const store = createMockStore(baseGameState)
    const nextStore = gameReducer(store, { type: 'SAFE_FOUNDATION_STEP' })

    // Aucune carte ne doit avoir bougé vers la fondation
    expect(nextStore.history.present.moves).toBe(0)
    expect(nextStore.history.present.foundations[0]).toHaveLength(0)
    expect(nextStore.history.present.tableau[0]).toHaveLength(1)
  })

  it('monte l As automatiquement dès que le joueur a joué au moins un coup (moves > 0)', () => {
    const gameStateWithMoves: GameState = {
      ...baseGameState,
      moves: 1,
    }
    const store = createMockStore(gameStateWithMoves)
    const nextStore = gameReducer(store, { type: 'SAFE_FOUNDATION_STEP' })

    // L'As doit être monté en fondation
    expect(nextStore.history.present.moves).toBe(2)
    expect(nextStore.history.present.foundations[0]).toHaveLength(1)
    expect(nextStore.history.present.foundations[0]?.[0]?.id).toBe('spades-1')
    expect(nextStore.history.present.tableau[0]).toHaveLength(0)
  })
})
