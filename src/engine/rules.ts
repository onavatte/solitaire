import { colorOf } from './deck'
import type { Card } from './types'

/**
 * Vérifie si une carte peut être posée sur une colonne du tableau.
 * - Si la colonne est vide (targetTopCard undefined) : seul un Roi (rang 13) est autorisé.
 * - Sinon : alternance de couleur et rang immédiatement inférieur (target.rank - 1).
 */
export function canMoveToTableau(
  card: Card,
  targetTopCard: Card | undefined,
): boolean {
  if (!targetTopCard) {
    return card.rank === 13
  }
  return (
    colorOf(card.suit) !== colorOf(targetTopCard.suit) &&
    card.rank === targetTopCard.rank - 1
  )
}

/**
 * Vérifie si une carte peut être posée sur une pile de fondation.
 * - Si la fondation est vide : seul un As (rang 1) est autorisé.
 * - Sinon : même enseigne et rang immédiatement supérieur (target.rank + 1).
 */
export function canMoveToFoundation(
  card: Card,
  targetTopCard: Card | undefined,
): boolean {
  if (!targetTopCard) {
    return card.rank === 1
  }
  return card.suit === targetTopCard.suit && card.rank === targetTopCard.rank + 1
}

/**
 * Vérifie si une sous-suite de cartes forme une séquence valide déplaçable.
 * Doit contenir au moins une carte, toutes face visible, décroissantes et alternées en couleur.
 */
export function isValidTableauSequence(cards: readonly Card[]): boolean {
  if (cards.length === 0) {
    return false
  }

  for (let i = 0; i < cards.length; i++) {
    const current = cards[i]
    if (!current || !current.faceUp) {
      return false
    }

    if (i > 0) {
      const prev = cards[i - 1]
      if (!prev) {
        return false
      }
      if (
        colorOf(current.suit) === colorOf(prev.suit) ||
        current.rank !== prev.rank - 1
      ) {
        return false
      }
    }
  }

  return true
}

/**
 * Vérifie si la partie est gagnée.
 * En Klondike, cela correspond à 4 fondations de 13 cartes chacune (52 cartes au total).
 */
export function isGameWon(state: { readonly foundations: readonly (readonly Card[])[] }): boolean {
  if (state.foundations.length !== 4) {
    return false
  }
  return state.foundations.every((f) => f.length === 13)
}

