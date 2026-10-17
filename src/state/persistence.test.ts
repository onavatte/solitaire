import { beforeEach, describe, expect, it } from 'vitest'
import { dealGame, initHistory, recordMove } from '../engine'
import {
  clearSavedGame,
  getDefaultPreferences,
  getDefaultStats,
  loadPreferences,
  loadSavedGame,
  loadStats,
  recordGameStarted,
  recordGameWon,
  resetStats,
  saveCurrentGame,
  savePreferences,
  saveStats,
  STORAGE_KEYS,
} from './persistence'

class MemoryStorage implements Storage {
  private store = new Map<string, string>()

  get length(): number {
    return this.store.size
  }

  clear(): void {
    this.store.clear()
  }

  getItem(key: string): string | null {
    return this.store.get(key) ?? null
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null
  }

  removeItem(key: string): void {
    this.store.delete(key)
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value))
  }
}

describe('persistence', () => {
  const memoryStorage = new MemoryStorage()

  beforeEach(() => {
    Object.defineProperty(globalThis, 'window', {
      value: { localStorage: memoryStorage },
      writable: true,
      configurable: true,
    })
    Object.defineProperty(globalThis, 'localStorage', {
      value: memoryStorage,
      writable: true,
      configurable: true,
    })
    memoryStorage.clear()
  })

  describe('preferences', () => {
    it('renvoie les préférences par défaut si le storage est vide', () => {
      expect(loadPreferences()).toEqual(getDefaultPreferences())
      expect(loadPreferences().drawCount).toBe(1)
      expect(loadPreferences().hapticFeedback).toBe(true)
      expect(loadPreferences().disableAnimations).toBe(false)
      expect(loadPreferences().quickMoveMode).toBe('single-tap')
    })

    it('sauvegarde et charge les préférences correctement', () => {
      savePreferences({ drawCount: 3, hapticFeedback: false, disableAnimations: true, quickMoveMode: 'double-tap' })
      const prefs = loadPreferences()
      expect(prefs.drawCount).toBe(3)
      expect(prefs.hapticFeedback).toBe(false)
      expect(prefs.disableAnimations).toBe(true)
      expect(prefs.quickMoveMode).toBe('double-tap')
    })

    it('permet la mise à jour partielle des préférences', () => {
      savePreferences({ drawCount: 3 })
      expect(loadPreferences().drawCount).toBe(3)
      expect(loadPreferences().hapticFeedback).toBe(true) // conservé par défaut

      savePreferences({ hapticFeedback: false })
      expect(loadPreferences().drawCount).toBe(3) // conservé
      expect(loadPreferences().hapticFeedback).toBe(false)
    })

    it('gère les données de préférences corrompues sans crash', () => {
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, '{"drawCount": "invalid"}')
      expect(loadPreferences()).toEqual(getDefaultPreferences())
    })
  })

  describe('stats', () => {
    it('renvoie les stats par défaut vides', () => {
      const stats = loadStats()
      expect(stats.draw1.gamesPlayed).toBe(0)
      expect(stats.draw1.gamesWon).toBe(0)
      expect(stats.draw1.bestTimeMs).toBeNull()
      expect(stats.draw1.bestMoves).toBeNull()
      expect(stats.draw3.gamesPlayed).toBe(0)
    })

    it('incrémente les parties jouées pour le bon mode de tirage', () => {
      let stats = loadStats()
      stats = recordGameStarted(stats, 1)
      expect(stats.draw1.gamesPlayed).toBe(1)
      expect(stats.draw3.gamesPlayed).toBe(0)

      stats = recordGameStarted(stats, 3)
      expect(stats.draw1.gamesPlayed).toBe(1)
      expect(stats.draw3.gamesPlayed).toBe(1)
    })

    it('met à jour les records de victoire, temps, coups et streaks', () => {
      let stats = loadStats()
      stats = recordGameStarted(stats, 1)

      // 1ère victoire : 120s (120000ms), 85 coups
      stats = recordGameWon(stats, 1, 120000, 85)
      expect(stats.draw1.gamesWon).toBe(1)
      expect(stats.draw1.bestTimeMs).toBe(120000)
      expect(stats.draw1.bestMoves).toBe(85)
      expect(stats.draw1.currentStreak).toBe(1)
      expect(stats.draw1.maxStreak).toBe(1)

      // 2ème victoire : meilleur temps (90s) mais moins bon coups (95)
      stats = recordGameWon(stats, 1, 90000, 95)
      expect(stats.draw1.gamesWon).toBe(2)
      expect(stats.draw1.bestTimeMs).toBe(90000)
      expect(stats.draw1.bestMoves).toBe(85) // conservé
      expect(stats.draw1.currentStreak).toBe(2)
      expect(stats.draw1.maxStreak).toBe(2)
    })

    it('peut réinitialiser les statistiques', () => {
      let stats = loadStats()
      stats = recordGameWon(stats, 1, 60000, 70)
      saveStats(stats)

      const cleared = resetStats()
      expect(cleared.draw1.gamesWon).toBe(0)
      expect(loadStats().draw1.gamesWon).toBe(0)
    })

    it('gère le JSON corrompu pour les stats', () => {
      localStorage.setItem(STORAGE_KEYS.STATS, '{broken json}')
      expect(loadStats()).toEqual(getDefaultStats())
    })
  })

  describe('saved game', () => {
    it('renvoie null si aucune partie sauvegardée', () => {
      expect(loadSavedGame()).toBeNull()
    })

    it('sauvegarde et recharge une partie en cours avec son historique', () => {
      const initial = dealGame({ drawCount: 1, seed: 42 })
      const history = initHistory(initial)
      const modified = { ...initial, moves: 1, elapsedMs: 5000 }
      const historyWithMove = recordMove(history, modified)

      saveCurrentGame({ history: historyWithMove, hasCountedPlayed: true })

      const loaded = loadSavedGame()
      expect(loaded).not.toBeNull()
      expect(loaded?.hasCountedPlayed).toBe(true)
      expect(loaded?.history.present.moves).toBe(1)
      expect(loaded?.history.present.elapsedMs).toBe(5000)
      expect(loaded?.history.past.length).toBe(1)
    })

    it('ne recharge pas une partie déjà gagnée et vide le storage', () => {
      const initial = dealGame({ drawCount: 1, seed: 42 })
      const wonGame = { ...initial, status: 'won' as const }
      const history = initHistory(wonGame)

      saveCurrentGame({ history, hasCountedPlayed: true })
      expect(loadSavedGame()).toBeNull()
      expect(localStorage.getItem(STORAGE_KEYS.SAVED_GAME)).toBeNull()
    })

    it('clearSavedGame supprime la clé', () => {
      const initial = dealGame({ drawCount: 1, seed: 42 })
      saveCurrentGame({ history: initHistory(initial), hasCountedPlayed: false })
      expect(loadSavedGame()).not.toBeNull()

      clearSavedGame()
      expect(loadSavedGame()).toBeNull()
    })
  })
})
