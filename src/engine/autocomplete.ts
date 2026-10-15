import { canMove, moveCards } from './moves'
import type { GameState, Location } from './types'

/**
 * Détermine si la partie est éligible à l'autocomplétion.
 * Condition : stock et waste vides, et toutes les cartes du tableau sont retournées face visible.
 */
export function canAutocomplete(state: GameState): boolean {
  if (state.status === 'won') {
    return false
  }

  if (state.stock.length > 0 || state.waste.length > 0) {
    return false
  }

  for (const col of state.tableau) {
    for (const card of col) {
      if (!card.faceUp) {
        return false
      }
    }
  }

  return true
}

/**
 * Joue une étape de l'autocomplétion vers les fondations.
 * Choisit en priorité la carte de rang le plus bas parmi les sommets de colonnes.
 * Retourne le nouvel état, ou null si aucune carte ne peut plus être montée.
 */
export function autocompleteStep(state: GameState): GameState | null {
  if (!canAutocomplete(state)) {
    return null
  }

  interface Candidate {
    from: Location
    to: Location
    rank: number
  }

  const candidates: Candidate[] = []

  for (let col = 0; col < state.tableau.length; col++) {
    const column = state.tableau[col]
    if (!column || column.length === 0) continue

    const topCard = column[column.length - 1]
    if (!topCard) continue

    const from: Location = { zone: 'tableau', column: col }

    for (let f = 0; f < state.foundations.length; f++) {
      const to: Location = { zone: 'foundation', foundationIndex: f }
      if (canMove(state, from, to)) {
        candidates.push({ from, to, rank: topCard.rank })
      }
    }
  }

  if (candidates.length === 0) {
    return null
  }

  // Trier par rang croissant (les As puis les 2, 3...)
  candidates.sort((a, b) => a.rank - b.rank)
  const best = candidates[0]
  if (!best) return null

  return moveCards(state, best.from, best.to)
}

