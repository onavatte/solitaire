import type { GameState } from './types'

export { isGameWon } from './rules'

export interface GameHistory {
  readonly past: readonly GameState[]
  readonly present: GameState
}

export function initHistory(initialState: GameState): GameHistory {
  return {
    past: [],
    present: initialState,
  }
}

export function canUndo(history: GameHistory): boolean {
  return history.past.length > 0
}

export function recordMove(
  history: GameHistory,
  nextState: GameState,
): GameHistory {
  if (nextState === history.present) {
    return history
  }

  return {
    past: [...history.past, history.present],
    present: nextState,
  }
}

export function undo(history: GameHistory): GameHistory {
  if (!canUndo(history)) {
    return history
  }

  const previousIndex = history.past.length - 1
  const previousState = history.past[previousIndex]
  if (!previousState) {
    return history
  }

  return {
    past: history.past.slice(0, previousIndex),
    present: previousState,
  }
}

