import type { DrawCount, GameHistory, GameState } from '../engine'

export interface ModeStats {
  readonly gamesPlayed: number
  readonly gamesWon: number
  readonly bestTimeMs: number | null
  readonly bestMoves: number | null
  readonly bestScore: number | null
  readonly currentStreak: number
  readonly maxStreak: number
}

export interface GameStats {
  readonly draw1: ModeStats
  readonly draw3: ModeStats
}

export type QuickMoveMode = 'single-tap' | 'double-tap'

export type AutoFoundationMode = 'safe' | 'disabled'

export interface UserPreferences {
  readonly drawCount: DrawCount
  readonly hapticFeedback: boolean
  readonly disableAnimations: boolean
  readonly quickMoveMode: QuickMoveMode
  readonly autoFoundationMode: AutoFoundationMode
}

export interface SavedGame {
  readonly history: GameHistory
  readonly hasCountedPlayed: boolean
}

export const STORAGE_KEYS = {
  SAVED_GAME: 'solitaire_saved_game_v1',
  STATS: 'solitaire_stats_v1',
  PREFERENCES: 'solitaire_prefs_v1',
} as const

const DEFAULT_MODE_STATS: ModeStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  bestTimeMs: null,
  bestMoves: null,
  bestScore: null,
  currentStreak: 0,
  maxStreak: 0,
}

export function getDefaultStats(): GameStats {
  return {
    draw1: { ...DEFAULT_MODE_STATS },
    draw3: { ...DEFAULT_MODE_STATS },
  }
}

export function getDefaultPreferences(): UserPreferences {
  return {
    drawCount: 1,
    hapticFeedback: true,
    disableAnimations: false,
    quickMoveMode: 'single-tap',
    autoFoundationMode: 'safe',
  }
}

function isObject(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null
}

function isValidGameState(obj: unknown): obj is GameState {
  if (!isObject(obj)) return false
  return (
    Array.isArray(obj['tableau']) &&
    obj['tableau'].length === 7 &&
    Array.isArray(obj['foundations']) &&
    obj['foundations'].length === 4 &&
    Array.isArray(obj['stock']) &&
    Array.isArray(obj['waste']) &&
    (obj['drawCount'] === 1 || obj['drawCount'] === 3) &&
    typeof obj['moves'] === 'number' &&
    typeof obj['elapsedMs'] === 'number' &&
    (obj['status'] === 'playing' || obj['status'] === 'won')
  )
}

function sanitizeGameState(state: GameState): GameState {
  return {
    ...state,
    score:
      typeof state.score === 'number' && Number.isFinite(state.score)
        ? Math.max(0, state.score)
        : 0,
    moves:
      typeof state.moves === 'number' && Number.isFinite(state.moves)
        ? Math.max(0, state.moves)
        : 0,
    elapsedMs:
      typeof state.elapsedMs === 'number' && Number.isFinite(state.elapsedMs)
        ? Math.max(0, state.elapsedMs)
        : 0,
  }
}

export function isValidGameHistory(obj: unknown): obj is GameHistory {
  if (!isObject(obj)) return false
  if (!Array.isArray(obj['past'])) return false
  return isValidGameState(obj['present'])
}

function getStorage(): Storage | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null
    }
    return window.localStorage
  } catch {
    return null
  }
}

export function loadSavedGame(): SavedGame | null {
  const storage = getStorage()
  if (!storage) return null

  try {
    const raw = storage.getItem(STORAGE_KEYS.SAVED_GAME)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    if (!isObject(parsed)) return null

    if (isValidGameHistory(parsed['history'])) {
      // Si la partie sauvegardée était déjà gagnée, on ne la restaure pas
      if (parsed['history'].present.status === 'won') {
        clearSavedGame()
        return null
      }
      const history: GameHistory = {
        past: parsed['history'].past.map((s) => (isValidGameState(s) ? sanitizeGameState(s) : s)),
        present: sanitizeGameState(parsed['history'].present),
      }
      return {
        history,
        hasCountedPlayed: Boolean(parsed['hasCountedPlayed']),
      }
    }
    return null
  } catch {
    return null
  }
}

export function saveCurrentGame(saved: SavedGame): void {
  const storage = getStorage()
  if (!storage) return

  try {
    // Si la partie est gagnée, on vide la sauvegarde de partie en cours
    if (saved.history.present.status === 'won') {
      clearSavedGame()
      return
    }
    storage.setItem(STORAGE_KEYS.SAVED_GAME, JSON.stringify(saved))
  } catch {
    // Échec silencieux (quota plein ou navigation privée restrictive)
  }
}

export function clearSavedGame(): void {
  const storage = getStorage()
  if (!storage) return

  try {
    storage.removeItem(STORAGE_KEYS.SAVED_GAME)
  } catch {
    // Échec silencieux
  }
}

export function loadPreferences(): UserPreferences {
  const storage = getStorage()
  const defaults = getDefaultPreferences()
  if (!storage) return defaults

  try {
    const raw = storage.getItem(STORAGE_KEYS.PREFERENCES)
    if (!raw) return defaults
    const parsed = JSON.parse(raw) as unknown
    if (!isObject(parsed)) return defaults

    const drawCount =
      parsed['drawCount'] === 1 || parsed['drawCount'] === 3
        ? parsed['drawCount']
        : defaults.drawCount
    const hapticFeedback =
      typeof parsed['hapticFeedback'] === 'boolean'
        ? parsed['hapticFeedback']
        : defaults.hapticFeedback
    const disableAnimations =
      typeof parsed['disableAnimations'] === 'boolean'
        ? parsed['disableAnimations']
        : defaults.disableAnimations
    const quickMoveMode: QuickMoveMode =
      parsed['quickMoveMode'] === 'single-tap' || parsed['quickMoveMode'] === 'double-tap'
        ? parsed['quickMoveMode']
        : defaults.quickMoveMode
    const autoFoundationMode: AutoFoundationMode =
      parsed['autoFoundationMode'] === 'safe' || parsed['autoFoundationMode'] === 'disabled'
        ? parsed['autoFoundationMode']
        : defaults.autoFoundationMode

    return { drawCount, hapticFeedback, disableAnimations, quickMoveMode, autoFoundationMode }
  } catch {
    return defaults
  }
}

export function savePreferences(prefs: Partial<UserPreferences>): void {
  const storage = getStorage()
  if (!storage) return

  try {
    const current = loadPreferences()
    const updated: UserPreferences = {
      ...current,
      ...prefs,
    }
    storage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(updated))
  } catch {
    // Échec silencieux
  }
}

function sanitizeModeStats(raw: unknown): ModeStats {
  if (!isObject(raw)) return { ...DEFAULT_MODE_STATS }
  return {
    gamesPlayed: typeof raw['gamesPlayed'] === 'number' && raw['gamesPlayed'] >= 0 ? raw['gamesPlayed'] : 0,
    gamesWon: typeof raw['gamesWon'] === 'number' && raw['gamesWon'] >= 0 ? raw['gamesWon'] : 0,
    bestTimeMs: typeof raw['bestTimeMs'] === 'number' && raw['bestTimeMs'] > 0 ? raw['bestTimeMs'] : null,
    bestMoves: typeof raw['bestMoves'] === 'number' && raw['bestMoves'] > 0 ? raw['bestMoves'] : null,
    bestScore: typeof raw['bestScore'] === 'number' && raw['bestScore'] >= 0 ? raw['bestScore'] : null,
    currentStreak: typeof raw['currentStreak'] === 'number' && raw['currentStreak'] >= 0 ? raw['currentStreak'] : 0,
    maxStreak: typeof raw['maxStreak'] === 'number' && raw['maxStreak'] >= 0 ? raw['maxStreak'] : 0,
  }
}

export function loadStats(): GameStats {
  const storage = getStorage()
  if (!storage) return getDefaultStats()

  try {
    const raw = storage.getItem(STORAGE_KEYS.STATS)
    if (!raw) return getDefaultStats()
    const parsed = JSON.parse(raw) as unknown
    if (!isObject(parsed)) return getDefaultStats()

    return {
      draw1: sanitizeModeStats(parsed['draw1']),
      draw3: sanitizeModeStats(parsed['draw3']),
    }
  } catch {
    return getDefaultStats()
  }
}

export function saveStats(stats: GameStats): void {
  const storage = getStorage()
  if (!storage) return

  try {
    storage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats))
  } catch {
    // Échec silencieux
  }
}

export function recordGameStarted(stats: GameStats, drawCount: DrawCount): GameStats {
  const key = drawCount === 1 ? 'draw1' : 'draw3'
  const current = stats[key]
  const updated: ModeStats = {
    ...current,
    gamesPlayed: current.gamesPlayed + 1,
  }
  const nextStats: GameStats = {
    ...stats,
    [key]: updated,
  }
  saveStats(nextStats)
  return nextStats
}

export function recordGameWon(
  stats: GameStats,
  drawCount: DrawCount,
  elapsedMs: number,
  moves: number,
  score = 0,
): GameStats {
  const key = drawCount === 1 ? 'draw1' : 'draw3'
  const current = stats[key]
  const newGamesWon = current.gamesWon + 1
  const newStreak = current.currentStreak + 1
  const newMaxStreak = Math.max(current.maxStreak, newStreak)

  const newBestTime =
    current.bestTimeMs === null ? elapsedMs : Math.min(current.bestTimeMs, elapsedMs)
  const newBestMoves =
    current.bestMoves === null ? moves : Math.min(current.bestMoves, moves)
  const safeScore = Number.isFinite(score) ? Math.max(0, score) : 0
  const newBestScore =
    current.bestScore === null ? safeScore : Math.max(current.bestScore, safeScore)

  const updated: ModeStats = {
    gamesPlayed: Math.max(current.gamesPlayed, newGamesWon),
    gamesWon: newGamesWon,
    bestTimeMs: newBestTime,
    bestMoves: newBestMoves,
    bestScore: newBestScore,
    currentStreak: newStreak,
    maxStreak: newMaxStreak,
  }

  const nextStats: GameStats = {
    ...stats,
    [key]: updated,
  }
  saveStats(nextStats)
  return nextStats
}

export function resetStats(): GameStats {
  const defaults = getDefaultStats()
  saveStats(defaults)
  return defaults
}

