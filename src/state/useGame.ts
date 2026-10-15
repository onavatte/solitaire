import { useEffect, useReducer } from 'react'
import type { DealOptions, GameHistory, Hint, Location } from '../engine'
import {
  autocompleteStep,
  canAutocomplete,
  canMove,
  dealGame,
  draw,
  findHint,
  initHistory,
  moveCards,
  recordMove,
  undo,
} from '../engine'

export interface GameStoreState {
  readonly history: GameHistory
  readonly selectedLocation: Location | null
  readonly activeHint: Hint | null
  readonly isPaused: boolean
}

export type GameAction =
  | { type: 'DRAW' }
  | { type: 'MOVE_CARDS'; from: Location; to: Location }
  | { type: 'SELECT_LOCATION'; location: Location | null }
  | { type: 'UNDO' }
  | { type: 'SHOW_HINT' }
  | { type: 'CLEAR_HINT' }
  | { type: 'NEW_GAME'; options?: DealOptions }
  | { type: 'AUTOCOMPLETE_STEP' }
  | { type: 'TICK_TIME'; deltaMs: number }
  | { type: 'SET_PAUSED'; isPaused: boolean }

function createInitialStore(options?: DealOptions): GameStoreState {
  const initialGame = dealGame(options)
  return {
    history: initHistory(initialGame),
    selectedLocation: null,
    activeHint: null,
    isPaused: false,
  }
}

function gameReducer(state: GameStoreState, action: GameAction): GameStoreState {
  switch (action.type) {
    case 'DRAW': {
      const nextGame = draw(state.history.present)
      if (nextGame === state.history.present) {
        return state
      }
      return {
        ...state,
        history: recordMove(state.history, nextGame),
        selectedLocation: null,
        activeHint: null,
      }
    }

    case 'MOVE_CARDS': {
      const nextGame = moveCards(state.history.present, action.from, action.to)
      if (nextGame === state.history.present) {
        return state
      }
      return {
        ...state,
        history: recordMove(state.history, nextGame),
        selectedLocation: null,
        activeHint: null,
      }
    }

    case 'SELECT_LOCATION': {
      return {
        ...state,
        selectedLocation: action.location,
        activeHint: null,
      }
    }

    case 'UNDO': {
      const nextHistory = undo(state.history)
      if (nextHistory === state.history) {
        return state
      }
      return {
        ...state,
        history: nextHistory,
        selectedLocation: null,
        activeHint: null,
      }
    }

    case 'SHOW_HINT': {
      const hint = findHint(state.history.present)
      return {
        ...state,
        activeHint: hint,
      }
    }

    case 'CLEAR_HINT': {
      return {
        ...state,
        activeHint: null,
      }
    }

    case 'NEW_GAME': {
      return createInitialStore(action.options)
    }

    case 'AUTOCOMPLETE_STEP': {
      const nextGame = autocompleteStep(state.history.present)
      if (!nextGame) {
        return state
      }
      return {
        ...state,
        history: recordMove(state.history, nextGame),
        selectedLocation: null,
        activeHint: null,
      }
    }

    case 'TICK_TIME': {
      if (
        state.isPaused ||
        state.history.present.status !== 'playing' ||
        state.history.present.moves === 0
      ) {
        return state
      }
      return {
        ...state,
        history: {
          ...state.history,
          present: {
            ...state.history.present,
            elapsedMs: state.history.present.elapsedMs + action.deltaMs,
          },
        },
      }
    }

    case 'SET_PAUSED': {
      return {
        ...state,
        isPaused: action.isPaused,
      }
    }

    default:
      return state
  }
}

export function useGame(initialOptions?: DealOptions) {
  const [store, dispatch] = useReducer(gameReducer, initialOptions, createInitialStore)
  const game = store.history.present

  // Chronomètre : s'incrémente chaque seconde dès le premier coup, en pause en arrière-plan
  useEffect(() => {
    if (game.status !== 'playing' || game.moves === 0 || store.isPaused) {
      return
    }

    const timer = setInterval(() => {
      dispatch({ type: 'TICK_TIME', deltaMs: 1000 })
    }, 1000)

    return () => clearInterval(timer)
  }, [game.status, game.moves, store.isPaused])

  // Pause automatique lors du passage en arrière-plan (visibilitychange)
  useEffect(() => {
    const handleVisibilityChange = () => {
      dispatch({ type: 'SET_PAUSED', isPaused: document.hidden })
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  // Interaction : clic sur la pioche
  const handleStockClick = () => {
    dispatch({ type: 'DRAW' })
  }

  // Interaction : clic sur une carte ou pile
  const handleSelectOrMove = (targetLocation: Location) => {
    const selected = store.selectedLocation

    if (!selected) {
      dispatch({ type: 'SELECT_LOCATION', location: targetLocation })
      return
    }

    // Même emplacement : on désélectionne
    if (
      selected.zone === targetLocation.zone &&
      ('column' in selected && 'column' in targetLocation
        ? selected.column === targetLocation.column && selected.cardIndex === targetLocation.cardIndex
        : true)
    ) {
      dispatch({ type: 'SELECT_LOCATION', location: null })
      return
    }

    // Tente de déplacer
    if (canMove(game, selected, targetLocation)) {
      dispatch({ type: 'MOVE_CARDS', from: selected, to: targetLocation })
    } else {
      // Si le déplacement n'est pas possible, change la sélection vers la nouvelle cible si elle est jouable
      dispatch({ type: 'SELECT_LOCATION', location: targetLocation })
    }
  }

  // Double-tap : envoi rapide vers la fondation la plus appropriée
  const handleQuickMoveToFoundation = (fromLocation: Location) => {
    for (let f = 0; f < game.foundations.length; f++) {
      const target: Location = { zone: 'foundation', foundationIndex: f }
      if (canMove(game, fromLocation, target)) {
        dispatch({ type: 'MOVE_CARDS', from: fromLocation, to: target })
        return
      }
    }
  }

  return {
    game,
    canUndo: store.history.past.length > 0,
    selectedLocation: store.selectedLocation,
    activeHint: store.activeHint,
    canAutocomplete: canAutocomplete(game),
    onStockClick: handleStockClick,
    onSelectOrMove: handleSelectOrMove,
    onMoveCards: (from: Location, to: Location) => dispatch({ type: 'MOVE_CARDS', from, to }),
    onQuickMoveToFoundation: handleQuickMoveToFoundation,
    onUndo: () => dispatch({ type: 'UNDO' }),
    onHint: () => dispatch({ type: 'SHOW_HINT' }),
    onNewGame: (options?: DealOptions) => dispatch({ type: 'NEW_GAME', options }),
    onAutocompleteStep: () => dispatch({ type: 'AUTOCOMPLETE_STEP' }),
  }
}

