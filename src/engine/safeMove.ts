import { canMove } from './moves'
import type { Card, GameState, Location, Suit } from './types'

/**
 * Retourne les deux enseignes de couleur opposée.
 */
function getOppositeSuits(suit: Suit): [Suit, Suit] {
  if (suit === 'hearts' || suit === 'diamonds') {
    return ['spades', 'clubs']
  }
  return ['hearts', 'diamonds']
}

/**
 * Détermine le rang maximum actuellement atteint en fondation pour une enseigne donnée.
 * Retourne 0 si l'enseigne n'a pas encore de carte en fondation.
 */
function getFoundationRankForSuit(
  suit: Suit,
  foundations: readonly (readonly Card[])[],
): number {
  for (const pile of foundations) {
    if (pile.length > 0) {
      const top = pile[pile.length - 1]
      if (top && top.suit === suit) {
        return top.rank
      }
    }
  }
  return 0
}

/**
 * Détermine si le déplacement d'une carte vers une fondation est tactiquement sécurisé (Safe Play).
 * Règle standard :
 * - As et 2 : toujours sûrs (rang <= 2).
 * - Rang R >= 3 : sûr seulement si les fondations des deux enseignes de couleur adverse
 *   ont au moins atteint le rang R - 1 (aucun risque qu'une carte inférieure cherche à s'y poser).
 */
export function isSafeFoundationMove(
  card: Card,
  foundations: readonly (readonly Card[])[],
): boolean {
  if (card.rank <= 2) {
    return true
  }

  const [opp1, opp2] = getOppositeSuits(card.suit)
  const opp1Rank = getFoundationRankForSuit(opp1, foundations)
  const opp2Rank = getFoundationRankForSuit(opp2, foundations)

  const requiredRank = card.rank - 1
  return opp1Rank >= requiredRank && opp2Rank >= requiredRank
}

export interface FoundationMoveCandidate {
  from: Location
  to: Location
  rank: number
}

export type FoundationAutoMoveMode = 'safe' | 'all'

/**
 * Recherche le prochain coup automatique sécurisé vers les fondations.
 * Examine le sommet des 7 colonnes du tableau et le sommet de la défausse.
 * Si plusieurs cartes sont sûres, choisit en priorité celle de rang le plus bas (As, puis 2...).
 * Retourne null si aucun coup sûr n'est possible.
 */
export function findNextSafeFoundationMove(
  state: GameState,
  mode: FoundationAutoMoveMode = 'safe',
  excludedCardIds?: readonly string[],
): { from: Location; to: Location } | null {
  if (state.status === 'won') {
    return null
  }

  const excludedSet = excludedCardIds && excludedCardIds.length > 0 ? new Set(excludedCardIds) : null
  const candidates: FoundationMoveCandidate[] = []

  // 1. Examiner les sommets du tableau
  for (let col = 0; col < state.tableau.length; col++) {
    const column = state.tableau[col]
    if (!column || column.length === 0) continue

    const topCard = column[column.length - 1]
    if (!topCard || !topCard.faceUp) continue
    if (excludedSet?.has(topCard.id)) continue

    const from: Location = { zone: 'tableau', column: col }

    for (let f = 0; f < state.foundations.length; f++) {
      const to: Location = { zone: 'foundation', foundationIndex: f }
      if (canMove(state, from, to) && (mode === 'all' || isSafeFoundationMove(topCard, state.foundations))) {
        candidates.push({ from, to, rank: topCard.rank })
      }
    }
  }

  // 2. Examiner le sommet de la défausse (waste)
  if (state.waste.length > 0) {
    const topWaste = state.waste[state.waste.length - 1]
    if (topWaste && !excludedSet?.has(topWaste.id)) {
      const from: Location = { zone: 'waste' }
      for (let f = 0; f < state.foundations.length; f++) {
        const to: Location = { zone: 'foundation', foundationIndex: f }
        if (canMove(state, from, to) && (mode === 'all' || isSafeFoundationMove(topWaste, state.foundations))) {
          candidates.push({ from, to, rank: topWaste.rank })
        }
      }
    }
  }

  if (candidates.length === 0) {
    return null
  }

  // Trier par rang croissant (As, puis 2, puis 3...)
  candidates.sort((a, b) => a.rank - b.rank)
  const best = candidates[0]
  if (!best) return null

  return { from: best.from, to: best.to }
}

