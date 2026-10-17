import { describe, expect, it } from 'vitest'
import { autocompleteStep, canAutocomplete } from './autocomplete'
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

describe('canAutocomplete', () => {
  it('renvoie false si le stock ou la défausse n’est pas vide', () => {
    const withStock = createEmptyState({
      stock: [makeCard('spades', 5, false)],
      tableau: [[makeCard('hearts', 1)]],
    })
    expect(canAutocomplete(withStock)).toBe(false)

    const withWaste = createEmptyState({
      waste: [makeCard('spades', 5)],
      tableau: [[makeCard('hearts', 1)]],
    })
    expect(canAutocomplete(withWaste)).toBe(false)
  })

  it('renvoie false s’il reste au moins une carte cachée sur le tableau', () => {
    const withHidden = createEmptyState({
      tableau: [
        [makeCard('spades', 2, false), makeCard('hearts', 1, true)],
        [],
        [],
        [],
        [],
        [],
        [],
      ],
    })
    expect(canAutocomplete(withHidden)).toBe(false)
  })

  it('renvoie true quand stock et waste sont vides et toutes les cartes du tableau sont visibles', () => {
    const eligible = createEmptyState({
      tableau: [
        [makeCard('spades', 2, true), makeCard('hearts', 1, true)],
        [makeCard('diamonds', 5, true)],
        [],
        [],
        [],
        [],
        [],
      ],
    })
    expect(canAutocomplete(eligible)).toBe(true)
  })

  it('renvoie false si la partie est déjà gagnée', () => {
    const wonState = createEmptyState({ status: 'won' })
    expect(canAutocomplete(wonState)).toBe(false)
  })
})

describe('autocompleteStep', () => {
  it('monte une carte éligible du tableau vers la fondation', () => {
    const aceHearts = makeCard('hearts', 1)
    const state = createEmptyState({
      tableau: [[aceHearts], [], [], [], [], [], []],
    })

    const next = autocompleteStep(state)
    expect(next).not.toBeNull()
    expect(next?.tableau[0]).toHaveLength(0)
    expect(next?.foundations[0]).toHaveLength(1)
    expect(next?.foundations[0]?.[0]?.id).toBe('hearts-1')
  })

  it('effectue la victoire complète pas à pas', () => {
    // 4 As sur les colonnes du tableau
    let state = createEmptyState({
      tableau: [
        [makeCard('spades', 1)],
        [makeCard('hearts', 1)],
        [makeCard('diamonds', 1)],
        [makeCard('clubs', 1)],
        [],
        [],
        [],
      ],
    })

    // Étape 1
    state = autocompleteStep(state)!
    expect(state).not.toBeNull()

    // Étape 2
    state = autocompleteStep(state)!
    expect(state).not.toBeNull()

    // Étape 3
    state = autocompleteStep(state)!
    expect(state).not.toBeNull()

    // Étape 4 -> toutes les cartes montées
    state = autocompleteStep(state)!
    expect(state).not.toBeNull()
    expect(state.tableau.every((col) => col.length === 0)).toBe(true)

    // Quand plus rien n'est à monter :
    const stepAfter = autocompleteStep(state)
    expect(stepAfter).toBeNull()
  })
})

