import { useEffect, useReducer } from 'react'
import type { DealOptions, GameHistory, GameState, Hint, Location } from '../engine'
import {
  autocompleteStep,
  canAutocomplete,
  canMove,
  dealGame,
  draw,
  findAutoMove,
  findHint,
  findNextSafeFoundationMove,
  getMovingCards,
  initHistory,
  moveCards,
  recordMove,
  undo,
} from '../engine'
import type { AutoFoundationMode, GameStats } from './persistence'
import {
  clearSavedGame,
  loadPreferences,
  loadSavedGame,
  loadStats,
  recordGameStarted,
  recordGameWon,
  resetStats,
  saveCurrentGame,
} from './persistence'

export interface GameStoreState {
  readonly history: GameHistory
  readonly selectedLocation: Location | null
  readonly activeHint: Hint | null
  readonly isPaused: boolean
  readonly isAutocompleting: boolean
  readonly hasCountedPlayed: boolean
  readonly stats: GameStats
  readonly allowAutoFoundation: boolean
  readonly pulledFromFoundationIds: readonly string[]
}

export type GameAction =
  | { type: 'DRAW' }
  | { type: 'MOVE_CARDS'; from: Location; to: Location }
  | { type: 'SELECT_LOCATION'; location: Location | null }
  | { type: 'UNDO' }
  | { type: 'SHOW_HINT' }
  | { type: 'CLEAR_HINT' }
  | { type: 'NEW_GAME'; options?: DealOptions }
  | { type: 'START_AUTOCOMPLETE' }
  | { type: 'STOP_AUTOCOMPLETE' }
  | { type: 'AUTOCOMPLETE_STEP' }
  | { type: 'SAFE_FOUNDATION_STEP'; mode?: AutoFoundationMode }
  | { type: 'TICK_TIME'; deltaMs: number }
  | { type: 'SET_PAUSED'; isPaused: boolean }
  | { type: 'RESET_STATS' }

function createInitialStore(options?: DealOptions): GameStoreState {
  const stats = loadStats()
  const saved = loadSavedGame()
  const targetDrawCount = options?.drawCount ?? loadPreferences().drawCount

  if (
    saved &&
    (!options?.drawCount || options.drawCount === saved.history.present.drawCount)
  ) {
    return {
      history: saved.history,
      selectedLocation: null,
      activeHint: null,
      isPaused: false,
      isAutocompleting: false,
      hasCountedPlayed: saved.hasCountedPlayed,
      stats,
      allowAutoFoundation: true,
      pulledFromFoundationIds: saved.pulledFromFoundationIds ?? [],
    }
  }

  const initialGame = dealGame({ drawCount: targetDrawCount, seed: options?.seed })
  return {
    history: initHistory(initialGame),
    selectedLocation: null,
    activeHint: null,
    isPaused: false,
    isAutocompleting: false,
    hasCountedPlayed: false,
    stats,
    allowAutoFoundation: true,
    pulledFromFoundationIds: [],
  }
}

function applyGameMove(
  state: GameStoreState,
  nextGame: GameState,
): GameStoreState {
  if (nextGame === state.history.present) {
    return state
  }

  let nextStats = state.stats
  let hasCounted = state.hasCountedPlayed

  // Comptabiliser la partie jouée dès le premier coup
  if (!hasCounted && nextGame.moves > 0) {
    nextStats = recordGameStarted(nextStats, nextGame.drawCount)
    hasCounted = true
  }

  // Comptabiliser la victoire
  if (nextGame.status === 'won' && state.history.present.status !== 'won') {
    nextStats = recordGameWon(
      nextStats,
      nextGame.drawCount,
      nextGame.elapsedMs,
      nextGame.moves,
      nextGame.score,
    )
  }

  return {
    ...state,
    history: recordMove(state.history, nextGame),
    selectedLocation: null,
    activeHint: null,
    hasCountedPlayed: hasCounted,
    stats: nextStats,
    allowAutoFoundation: true,
  }
}

export function gameReducer(state: GameStoreState, action: GameAction): GameStoreState {
  switch (action.type) {
    case 'DRAW': {
      const nextGame = draw(state.history.present)
      return applyGameMove(state, nextGame)
    }

    case 'MOVE_CARDS': {
      let updatedPulledIds = state.pulledFromFoundationIds

      // 1. Si une carte est retirée d'une fondation, l'enregistrer dans les exceptions d'auto-fondation
      if (action.from.zone === 'foundation') {
        const sourcePile = state.history.present.foundations[action.from.foundationIndex]
        const pulledCard = sourcePile?.[sourcePile.length - 1]
        if (pulledCard && !updatedPulledIds.includes(pulledCard.id)) {
          updatedPulledIds = [...updatedPulledIds, pulledCard.id]
        }
      }

      // 2. Si une carte retourne en fondation, la retirer des exceptions
      if (action.to.zone === 'foundation') {
        const moving = getMovingCards(state.history.present, action.from)
        if (moving && moving.length > 0) {
          const movedIds = new Set(moving.map((c) => c.id))
          updatedPulledIds = updatedPulledIds.filter((id) => !movedIds.has(id))
        }
      }

      const nextGame = moveCards(state.history.present, action.from, action.to)
      return {
        ...applyGameMove(state, nextGame),
        pulledFromFoundationIds: updatedPulledIds,
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
        allowAutoFoundation: false,
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
      clearSavedGame()
      const initialGame = dealGame(action.options)
      return {
        history: initHistory(initialGame),
        selectedLocation: null,
        activeHint: null,
        isPaused: false,
        isAutocompleting: false,
        hasCountedPlayed: false,
        stats: state.stats,
        allowAutoFoundation: true,
        pulledFromFoundationIds: [],
      }
    }

    case 'START_AUTOCOMPLETE': {
      return {
        ...state,
        isAutocompleting: true,
        selectedLocation: null,
        activeHint: null,
      }
    }

    case 'STOP_AUTOCOMPLETE': {
      return {
        ...state,
        isAutocompleting: false,
      }
    }

    case 'AUTOCOMPLETE_STEP': {
      const nextGame = autocompleteStep(state.history.present)
      if (!nextGame) {
        return {
          ...state,
          isAutocompleting: false,
        }
      }
      const nextStore = applyGameMove(state, nextGame)
      return {
        ...nextStore,
        isAutocompleting: nextGame.status !== 'won',
      }
    }

    case 'SAFE_FOUNDATION_STEP': {
      if (
        state.isAutocompleting ||
        state.history.present.status !== 'playing' ||
        state.history.present.moves === 0
      ) {
        return state
      }
      const foundationMode = action.mode === 'all' ? 'all' : 'safe'
      const move = findNextSafeFoundationMove(
        state.history.present,
        foundationMode,
        state.pulledFromFoundationIds,
      )
      if (!move) {
        return state
      }
      const nextGame = moveCards(state.history.present, move.from, move.to)
      return applyGameMove(state, nextGame)
    }

    case 'RESET_STATS': {
      const reset = resetStats()
      return {
        ...state,
        stats: reset,
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

export interface UseGameConfig {
  readonly autoFoundationEnabled?: boolean
  readonly autoFoundationMode?: AutoFoundationMode
  readonly isDealing?: boolean
}

export function useGame(initialOptions?: DealOptions, config?: UseGameConfig) {
  const [store, dispatch] = useReducer(gameReducer, initialOptions, createInitialStore)
  const game = store.history.present
  const autoFoundationMode =
    config?.autoFoundationMode ?? (config?.autoFoundationEnabled === false ? 'disabled' : 'safe')
  const isDealing = config?.isDealing ?? false

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

  // Cadencement automatique de l'autocomplétion (1 coup toutes les 240 ms)
  useEffect(() => {
    if (!store.isAutocompleting || game.status !== 'playing') {
      return
    }

    const timer = setTimeout(() => {
      dispatch({ type: 'AUTOCOMPLETE_STEP' })
    }, 240)

    return () => clearTimeout(timer)
  }, [store.isAutocompleting, game])

  // Cadencement automatique de la montée des cartes vers les fondations
  useEffect(() => {
    if (
      autoFoundationMode === 'disabled' ||
      !store.allowAutoFoundation ||
      isDealing ||
      store.isAutocompleting ||
      game.status !== 'playing' ||
      game.moves === 0
    ) {
      return
    }

    const foundationMode = autoFoundationMode === 'all' ? 'all' : 'safe'
    const move = findNextSafeFoundationMove(game, foundationMode, store.pulledFromFoundationIds)
    if (!move) {
      return
    }

    const timer = setTimeout(() => {
      dispatch({ type: 'SAFE_FOUNDATION_STEP', mode: autoFoundationMode })
    }, 180)

    return () => clearTimeout(timer)
  }, [
    autoFoundationMode,
    store.allowAutoFoundation,
    store.pulledFromFoundationIds,
    isDealing,
    store.isAutocompleting,
    game,
  ])

  // Interaction : clic sur la pioche
  const handleStockClick = () => {
    if (store.isAutocompleting) return
    dispatch({ type: 'DRAW' })
  }

  // Interaction : clic sur une carte ou pile
  const handleSelectOrMove = (targetLocation: Location) => {
    if (store.isAutocompleting) return
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

  // Double-tap : coup rapide intelligent (fondation, séquence tableau ou colonne vide pour Roi)
  const handleQuickMove = (fromLocation: Location) => {
    if (store.isAutocompleting) return
    const target = findAutoMove(game, fromLocation)
    if (target) {
      dispatch({ type: 'MOVE_CARDS', from: fromLocation, to: target })
    }
  }

  // Sauvegarde automatique de la partie en cours
  useEffect(() => {
    if (store.history.present.status === 'playing') {
      saveCurrentGame({
        history: store.history,
        hasCountedPlayed: store.hasCountedPlayed,
        pulledFromFoundationIds: store.pulledFromFoundationIds,
      })
    } else if (store.history.present.status === 'won') {
      clearSavedGame()
    }
  }, [store.history, store.hasCountedPlayed, store.pulledFromFoundationIds])

  return {
    game,
    stats: store.stats,
    canUndo: store.history.past.length > 0 && !store.isAutocompleting,
    selectedLocation: store.selectedLocation,
    activeHint: store.activeHint,
    canAutocomplete: canAutocomplete(game),
    isAutocompleting: store.isAutocompleting,
    startAutocomplete: () => dispatch({ type: 'START_AUTOCOMPLETE' }),
    onStockClick: handleStockClick,
    onSelectOrMove: handleSelectOrMove,
    onMoveCards: (from: Location, to: Location) => {
      if (store.isAutocompleting) return
      dispatch({ type: 'MOVE_CARDS', from, to })
    },
    onQuickMove: handleQuickMove,
    onQuickMoveToFoundation: handleQuickMove,
    onUndo: () => dispatch({ type: 'UNDO' }),
    onHint: () => dispatch({ type: 'SHOW_HINT' }),
    onNewGame: (options?: DealOptions) => dispatch({ type: 'NEW_GAME', options }),
    onResetStats: () => dispatch({ type: 'RESET_STATS' }),
    onAutocompleteStep: () => dispatch({ type: 'AUTOCOMPLETE_STEP' }),
  }
}

