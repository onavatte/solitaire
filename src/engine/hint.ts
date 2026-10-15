import { canMove } from './moves'
import type { GameState, Location } from './types'

export type Hint =
  | { readonly type: 'move'; readonly from: Location; readonly to: Location }
  | { readonly type: 'draw' }

/**
 * Recherche le coup le plus pertinent à suggérer au joueur selon les priorités Klondike :
 * 1. Monter une carte vers une fondation depuis le tableau
 * 2. Monter une carte vers une fondation depuis la défausse
 * 3. Déplacer une séquence sur le tableau qui révèle une carte cachée
 * 4. Déplacer une carte depuis la défausse vers le tableau
 * 5. Autre déplacement valide sur le tableau (évite les déplacements futiles de Roi vers case vide)
 * 6. Piocher (draw) si la pioche ou le recyclage le permet
 * Retourne null si aucun coup n'est possible.
 */
export function findHint(state: GameState): Hint | null {
  // 1. Fondation depuis le tableau
  for (let col = 0; col < state.tableau.length; col++) {
    const column = state.tableau[col]
    if (!column || column.length === 0) continue
    const from: Location = { zone: 'tableau', column: col }
    for (let f = 0; f < state.foundations.length; f++) {
      const to: Location = { zone: 'foundation', foundationIndex: f }
      if (canMove(state, from, to)) {
        return { type: 'move', from, to }
      }
    }
  }

  // 2. Fondation depuis la défausse
  if (state.waste.length > 0) {
    const from: Location = { zone: 'waste' }
    for (let f = 0; f < state.foundations.length; f++) {
      const to: Location = { zone: 'foundation', foundationIndex: f }
      if (canMove(state, from, to)) {
        return { type: 'move', from, to }
      }
    }
  }

  // 3. Déplacement tableau vers tableau révélant une carte cachée
  for (let fromCol = 0; fromCol < state.tableau.length; fromCol++) {
    const col = state.tableau[fromCol]
    if (!col || col.length <= 1) continue

    const firstFaceUpIndex = col.findIndex((c) => c.faceUp)
    if (firstFaceUpIndex > 0) {
      const from: Location = {
        zone: 'tableau',
        column: fromCol,
        cardIndex: firstFaceUpIndex,
      }
      for (let toCol = 0; toCol < state.tableau.length; toCol++) {
        if (toCol === fromCol) continue
        const to: Location = { zone: 'tableau', column: toCol }
        if (canMove(state, from, to)) {
          return { type: 'move', from, to }
        }
      }
    }
  }

  // 4. Défausse vers le tableau
  if (state.waste.length > 0) {
    const from: Location = { zone: 'waste' }
    for (let toCol = 0; toCol < state.tableau.length; toCol++) {
      const to: Location = { zone: 'tableau', column: toCol }
      if (canMove(state, from, to)) {
        return { type: 'move', from, to }
      }
    }
  }

  // 5. Autre déplacement tableau vers tableau
  for (let fromCol = 0; fromCol < state.tableau.length; fromCol++) {
    const col = state.tableau[fromCol]
    if (!col || col.length === 0) continue
    const firstFaceUpIndex = col.findIndex((c) => c.faceUp)
    if (firstFaceUpIndex < 0) continue

    const movingCard = col[firstFaceUpIndex]
    const isKingAlone = firstFaceUpIndex === 0 && movingCard?.rank === 13

    if (!isKingAlone) {
      const from: Location = {
        zone: 'tableau',
        column: fromCol,
        cardIndex: firstFaceUpIndex,
      }
      for (let toCol = 0; toCol < state.tableau.length; toCol++) {
        if (toCol === fromCol) continue
        const to: Location = { zone: 'tableau', column: toCol }
        if (canMove(state, from, to)) {
          return { type: 'move', from, to }
        }
      }
    }
  }

  // 6. Piocher si possible
  if (state.stock.length > 0 || state.waste.length > 0) {
    return { type: 'draw' }
  }

  return null
}

