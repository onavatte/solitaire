import {
  canMoveToFoundation,
  canMoveToTableau,
  isGameWon,
  isValidTableauSequence,
} from './rules'
import type { Card, GameState, Location } from './types'

/**
 * Pioche 1 ou 3 cartes depuis le talon (stock) vers la défausse (waste),
 * ou recycle la défausse dans le talon si le talon est vide.
 */
export function draw(state: GameState): GameState {
  if (state.stock.length > 0) {
    const count = Math.min(state.drawCount, state.stock.length)
    const newStock = state.stock.slice(0, state.stock.length - count)
    const drawnCards = state.stock
      .slice(state.stock.length - count)
      .reverse()
      .map((c) => ({ ...c, faceUp: true }))

    const currentScore = Number.isFinite(state.score) ? Math.max(0, state.score) : 0

    return {
      ...state,
      stock: newStock,
      waste: [...state.waste, ...drawnCards],
      moves: state.moves + 1,
      score: currentScore,
    }
  }

  if (state.waste.length > 0) {
    // Recyclage : la défausse redevient le stock face cachée
    const recycledStock = [...state.waste]
      .reverse()
      .map((c) => ({ ...c, faceUp: false }))

    const currentScore = Number.isFinite(state.score) ? Math.max(0, state.score) : 0
    const penalty = state.drawCount === 1 ? 100 : 20
    const newScore = Math.max(0, currentScore - penalty)

    return {
      ...state,
      stock: recycledStock,
      waste: [],
      moves: state.moves + 1,
      score: newScore,
    }
  }

  return state
}

/**
 * Récupère les cartes ciblées par l'emplacement source.
 */
export function getMovingCards(
  state: GameState,
  from: Location,
): readonly Card[] | null {
  if (from.zone === 'waste') {
    const topCard = state.waste[state.waste.length - 1]
    return topCard ? [topCard] : null
  }

  if (from.zone === 'foundation') {
    const pile = state.foundations[from.foundationIndex]
    if (!pile || pile.length === 0) return null
    const topCard = pile[pile.length - 1]
    return topCard ? [topCard] : null
  }

  if (from.zone === 'tableau') {
    const column = state.tableau[from.column]
    if (!column || column.length === 0) return null
    const startIndex = from.cardIndex ?? column.length - 1
    if (startIndex < 0 || startIndex >= column.length) return null

    const sequence = column.slice(startIndex)
    if (!isValidTableauSequence(sequence)) {
      return null
    }
    return sequence
  }

  return null
}

/**
 * Vérifie si un déplacement entre deux emplacements est légal.
 */
export function canMove(
  state: GameState,
  from: Location,
  to: Location,
): boolean {
  if (from.zone === 'tableau' && to.zone === 'tableau' && from.column === to.column) {
    return false
  }

  const movingCards = getMovingCards(state, from)
  if (!movingCards || movingCards.length === 0) {
    return false
  }

  const firstCard = movingCards[0]
  if (!firstCard) {
    return false
  }

  if (to.zone === 'foundation') {
    if (movingCards.length !== 1) {
      return false
    }
    const pile = state.foundations[to.foundationIndex]
    if (!pile) return false
    const topCard = pile[pile.length - 1]
    return canMoveToFoundation(firstCard, topCard)
  }

  if (to.zone === 'tableau') {
    const column = state.tableau[to.column]
    if (!column) return false
    const topCard = column[column.length - 1]
    return canMoveToTableau(firstCard, topCard)
  }

  return false
}

/**
 * Applique un déplacement de cartes de manière immuable.
 * Révèle automatiquement la carte cachée libérée en haut de colonne.
 */
export function moveCards(
  state: GameState,
  from: Location,
  to: Location,
): GameState {
  if (!canMove(state, from, to)) {
    return state
  }

  const movingCards = getMovingCards(state, from)
  if (!movingCards || movingCards.length === 0) {
    return state
  }

  let newWaste = state.waste
  let newStock = state.stock
  let newFoundations = state.foundations.map((f) => [...f])
  let newTableau = state.tableau.map((col) => [...col])
  let scoreDelta = 0

  // Points selon l'origine et la destination
  if (from.zone === 'waste') {
    if (to.zone === 'tableau') {
      scoreDelta += 5
    } else if (to.zone === 'foundation') {
      scoreDelta += 10
    }
  } else if (from.zone === 'tableau') {
    if (to.zone === 'foundation') {
      scoreDelta += 10
    }
  } else if (from.zone === 'foundation') {
    if (to.zone === 'tableau') {
      scoreDelta -= 15
    }
  }

  // Retirer les cartes de la source
  if (from.zone === 'waste') {
    newWaste = state.waste.slice(0, -1)
  } else if (from.zone === 'foundation') {
    const pile = newFoundations[from.foundationIndex]
    if (pile) {
      newFoundations[from.foundationIndex] = pile.slice(0, -1)
    }
  } else if (from.zone === 'tableau') {
    const column = newTableau[from.column]
    if (column) {
      const cutIndex = from.cardIndex ?? column.length - 1
      const remaining = column.slice(0, cutIndex)
      if (remaining.length > 0) {
        const lastIndex = remaining.length - 1
        const lastCard = remaining[lastIndex]
        if (lastCard && !lastCard.faceUp) {
          remaining[lastIndex] = { ...lastCard, faceUp: true }
          scoreDelta += 5 // +5 pour révélation d'une carte cachée
        }
      }
      newTableau[from.column] = remaining
    }
  }

  // Ajouter les cartes à la destination
  if (to.zone === 'foundation') {
    const pile = newFoundations[to.foundationIndex]
    if (pile) {
      newFoundations[to.foundationIndex] = [...pile, ...movingCards]
    }
  } else if (to.zone === 'tableau') {
    const column = newTableau[to.column]
    if (column) {
      newTableau[to.column] = [...column, ...movingCards]
    }
  }

  const won = isGameWon({ foundations: newFoundations })
  const currentScore = Number.isFinite(state.score) ? Math.max(0, state.score) : 0
  const newScore = Math.max(0, currentScore + scoreDelta)

  return {
    ...state,
    waste: newWaste,
    stock: newStock,
    foundations: newFoundations,
    tableau: newTableau,
    moves: state.moves + 1,
    score: newScore,
    status: won ? 'won' : state.status,
  }
}

/**
 * Recherche le meilleur coup automatique pour une carte donnée (Smart Move).
 * Priorités :
 * 1. Fondation
 * 2. Colonne du tableau avec cartes
 * 3. Colonne vide (pour les Rois uniquement, s'ils libèrent une carte cachée ou proviennent de la défausse)
 */
export function findAutoMove(
  state: GameState,
  from: Location,
): Location | null {
  const movingCards = getMovingCards(state, from)
  if (!movingCards || movingCards.length === 0) {
    return null
  }

  const firstCard = movingCards[0]
  if (!firstCard) {
    return null
  }

  // 1. Fondation en priorité (uniquement pour 1 carte seule)
  if (movingCards.length === 1) {
    for (let f = 0; f < state.foundations.length; f++) {
      const target: Location = { zone: 'foundation', foundationIndex: f }
      if (canMove(state, from, target)) {
        return target
      }
    }
  }

  // 2. Colonne non vide du tableau
  for (let c = 0; c < state.tableau.length; c++) {
    if (from.zone === 'tableau' && from.column === c) continue
    const col = state.tableau[c]
    if (col && col.length > 0) {
      const target: Location = { zone: 'tableau', column: c }
      if (canMove(state, from, target)) {
        return target
      }
    }
  }

  // 3. Colonne vide du tableau (pour un Roi uniquement, s'il provient de la défausse ou libère des cartes)
  if (firstCard.rank === 13) {
    const isKingAloneAtRoot =
      from.zone === 'tableau' && (from.cardIndex ?? 0) === 0

    if (!isKingAloneAtRoot) {
      for (let c = 0; c < state.tableau.length; c++) {
        if (from.zone === 'tableau' && from.column === c) continue
        const col = state.tableau[c]
        if (col && col.length === 0) {
          const target: Location = { zone: 'tableau', column: c }
          if (canMove(state, from, target)) {
            return target
          }
        }
      }
    }
  }

  return null
}

