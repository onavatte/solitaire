import { describe, expect, it } from 'vitest'
import {
  canMoveToFoundation,
  canMoveToTableau,
  isValidTableauSequence,
} from './rules'
import type { Card } from './types'

function makeCard(suit: Card['suit'], rank: Card['rank'], faceUp = true): Card {
  return { id: `${suit}-${rank}`, suit, rank, faceUp }
}

describe('canMoveToTableau', () => {
  it('n’autorise qu’un Roi sur une colonne vide', () => {
    const king = makeCard('spades', 13)
    const queen = makeCard('spades', 12)
    const ace = makeCard('hearts', 1)

    expect(canMoveToTableau(king, undefined)).toBe(true)
    expect(canMoveToTableau(queen, undefined)).toBe(false)
    expect(canMoveToTableau(ace, undefined)).toBe(false)
  })

  it('autorise une carte de rang immédiatement inférieur et de couleur opposée', () => {
    const targetBlack8 = makeCard('spades', 8)
    const red7 = makeCard('hearts', 7)
    const redDiamond7 = makeCard('diamonds', 7)
    const black7 = makeCard('clubs', 7)
    const red6 = makeCard('hearts', 6)
    const red8 = makeCard('hearts', 8)

    // Rouge sur noir, 7 sur 8 : valide
    expect(canMoveToTableau(red7, targetBlack8)).toBe(true)
    expect(canMoveToTableau(redDiamond7, targetBlack8)).toBe(true)

    // Même couleur (noir sur noir) : invalide
    expect(canMoveToTableau(black7, targetBlack8)).toBe(false)

    // Rang non consécutif : invalide
    expect(canMoveToTableau(red6, targetBlack8)).toBe(false)
    expect(canMoveToTableau(red8, targetBlack8)).toBe(false)
  })
})

describe('canMoveToFoundation', () => {
  it('n’autorise qu’un As sur une fondation vide', () => {
    const aceSpades = makeCard('spades', 1)
    const aceHearts = makeCard('hearts', 1)
    const twoSpades = makeCard('spades', 2)
    const kingSpades = makeCard('spades', 13)

    expect(canMoveToFoundation(aceSpades, undefined)).toBe(true)
    expect(canMoveToFoundation(aceHearts, undefined)).toBe(true)
    expect(canMoveToFoundation(twoSpades, undefined)).toBe(false)
    expect(canMoveToFoundation(kingSpades, undefined)).toBe(false)
  })

  it('autorise la carte suivante de la même enseigne (rang + 1)', () => {
    const aceSpades = makeCard('spades', 1)
    const twoSpades = makeCard('spades', 2)
    const threeSpades = makeCard('spades', 3)
    const twoHearts = makeCard('hearts', 2)

    expect(canMoveToFoundation(twoSpades, aceSpades)).toBe(true)
    expect(canMoveToFoundation(threeSpades, aceSpades)).toBe(false)
    expect(canMoveToFoundation(twoHearts, aceSpades)).toBe(false)
  })
})

describe('isValidTableauSequence', () => {
  it('valide une séquence de cartes toutes visibles, décroissantes et alternées', () => {
    const seq = [
      makeCard('spades', 10),
      makeCard('hearts', 9),
      makeCard('clubs', 8),
      makeCard('diamonds', 7),
    ]
    expect(isValidTableauSequence(seq)).toBe(true)
  })

  it('invalide une séquence si une carte est cachée', () => {
    const seq = [
      makeCard('spades', 10, true),
      makeCard('hearts', 9, false),
      makeCard('clubs', 8, true),
    ]
    expect(isValidTableauSequence(seq)).toBe(false)
  })

  it('invalide une séquence si deux cartes successives ont la même couleur ou mauvais rang', () => {
    const badColors = [
      makeCard('spades', 10),
      makeCard('clubs', 9), // Noir sur noir
    ]
    expect(isValidTableauSequence(badColors)).toBe(false)

    const badRanks = [
      makeCard('spades', 10),
      makeCard('hearts', 8), // Écart de 2
    ]
    expect(isValidTableauSequence(badRanks)).toBe(false)
  })

  it('valide une carte unique face visible', () => {
    expect(isValidTableauSequence([makeCard('hearts', 5)])).toBe(true)
    expect(isValidTableauSequence([makeCard('hearts', 5, false)])).toBe(false)
    expect(isValidTableauSequence([])).toBe(false)
  })
})

