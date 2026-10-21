import { describe, expect, it } from 'vitest'
import { isSafeFoundationMove, findNextSafeFoundationMove } from './safeMove'
import type { Card, GameState } from './types'

function makeCard(suit: Card['suit'], rank: Card['rank'], faceUp = true): Card {
  return { id: `${suit}-${rank}`, suit, rank, faceUp }
}

function makeEmptyGame(): GameState {
  return {
    tableau: [[], [], [], [], [], [], []],
    foundations: [[], [], [], []],
    stock: [],
    waste: [],
    drawCount: 1,
    moves: 0,
    elapsedMs: 0,
    score: 0,
    seed: 123,
    status: 'playing',
  }
}

describe('isSafeFoundationMove', () => {
  it('considère les As toujours sûrs même si toutes les fondations sont vides', () => {
    const foundations: Card[][] = [[], [], [], []]
    expect(isSafeFoundationMove(makeCard('hearts', 1), foundations)).toBe(true)
    expect(isSafeFoundationMove(makeCard('spades', 1), foundations)).toBe(true)
  })

  it('considère les 2 toujours sûrs même si les fondations adverses sont vides', () => {
    const foundations: Card[][] = [[], [], [], []]
    expect(isSafeFoundationMove(makeCard('hearts', 2), foundations)).toBe(true)
    expect(isSafeFoundationMove(makeCard('clubs', 2), foundations)).toBe(true)
  })

  it('n autorise un 3 rouge que si les deux fondations noires ont au moins un 2', () => {
    // Fondations : Pique a un As, Trèfle a un 2
    const foundationsWithSpadeAce: Card[][] = [
      [makeCard('spades', 1)],
      [makeCard('clubs', 1), makeCard('clubs', 2)],
      [],
      [],
    ]
    // Pique n'a pas encore son 2 -> 3 de cœur n'est pas encore sûr
    expect(isSafeFoundationMove(makeCard('hearts', 3), foundationsWithSpadeAce)).toBe(false)

    // Fondations : Pique a un 2, Trèfle a un 2
    const foundationsWithBoth2: Card[][] = [
      [makeCard('spades', 1), makeCard('spades', 2)],
      [makeCard('clubs', 1), makeCard('clubs', 2)],
      [],
      [],
    ]
    expect(isSafeFoundationMove(makeCard('hearts', 3), foundationsWithBoth2)).toBe(true)
    expect(isSafeFoundationMove(makeCard('diamonds', 3), foundationsWithBoth2)).toBe(true)
  })

  it('n autorise un 5 noir que si les deux fondations rouges ont au moins un 4', () => {
    const foundations: Card[][] = [
      [],
      [],
      [makeCard('hearts', 1), makeCard('hearts', 2), makeCard('hearts', 3), makeCard('hearts', 4)],
      [makeCard('diamonds', 1), makeCard('diamonds', 2), makeCard('diamonds', 3)], // Carreau seulement à 3
    ]
    expect(isSafeFoundationMove(makeCard('spades', 5), foundations)).toBe(false)

    // On monte Carreau à 4
    const foundationsBoth4: Card[][] = [
      [],
      [],
      [makeCard('hearts', 1), makeCard('hearts', 2), makeCard('hearts', 3), makeCard('hearts', 4)],
      [makeCard('diamonds', 1), makeCard('diamonds', 2), makeCard('diamonds', 3), makeCard('diamonds', 4)],
    ]
    expect(isSafeFoundationMove(makeCard('spades', 5), foundationsBoth4)).toBe(true)
  })
})

describe('findNextSafeFoundationMove', () => {
  it('trouve un As au sommet d une colonne du tableau', () => {
    const game: GameState = {
      ...makeEmptyGame(),
      tableau: [
        [makeCard('spades', 5, false), makeCard('hearts', 1, true)],
        [],
        [],
        [],
        [],
        [],
        [],
      ],
    }

    const move = findNextSafeFoundationMove(game)
    expect(move).toEqual({
      from: { zone: 'tableau', column: 0 },
      to: { zone: 'foundation', foundationIndex: 0 },
    })
  })

  it('trouve un As au sommet de la défausse', () => {
    const game: GameState = {
      ...makeEmptyGame(),
      waste: [makeCard('diamonds', 7), makeCard('clubs', 1)],
    }

    const move = findNextSafeFoundationMove(game)
    expect(move).toEqual({
      from: { zone: 'waste' },
      to: { zone: 'foundation', foundationIndex: 0 },
    })
  })

  it('privilégie le rang le plus bas s il y a plusieurs coups sûrs', () => {
    const game: GameState = {
      ...makeEmptyGame(),
      foundations: [
        [makeCard('hearts', 1)],
        [],
        [],
        [],
      ],
      tableau: [
        [makeCard('spades', 1)], // As de pique
        [makeCard('hearts', 2)], // 2 de cœur
        [],
        [],
        [],
        [],
        [],
      ],
    }

    const move = findNextSafeFoundationMove(game)
    // L'As de pique (rang 1) doit être proposé avant le 2 de cœur (rang 2)
    expect(move?.from).toEqual({ zone: 'tableau', column: 0 })
    expect(move?.to).toEqual({ zone: 'foundation', foundationIndex: 1 })
  })

  it('retourne null si aucune carte ne peut monter de manière sûre', () => {
    const game: GameState = {
      ...makeEmptyGame(),
      tableau: [
        [makeCard('hearts', 3)], // 3 de cœur ne peut pas monter car aucun As/2 n'est en fondation
        [],
        [],
        [],
        [],
        [],
        [],
      ],
    }

    expect(findNextSafeFoundationMove(game)).toBeNull()
  })

  it('retourne null si le jeu est déjà gagné', () => {
    const game: GameState = {
      ...makeEmptyGame(),
      status: 'won',
    }
    expect(findNextSafeFoundationMove(game)).toBeNull()
  })

  it('autorise une carte non sûre en mode all alors qu elle est refusée en mode safe', () => {
    // 3 de pique avec 2 de pique en fondation, mais aucune carte rouge en fondation
    const game: GameState = {
      ...makeEmptyGame(),
      foundations: [
        [makeCard('spades', 1), makeCard('spades', 2)],
        [],
        [],
        [],
      ],
      tableau: [
        [makeCard('spades', 3)],
        [],
        [],
        [],
        [],
        [],
        [],
      ],
    }

    // En mode safe : refusé car les cartes rouges ne sont pas à 2
    expect(findNextSafeFoundationMove(game, 'safe')).toBeNull()

    // En mode all : accepté car le coup est légal
    const move = findNextSafeFoundationMove(game, 'all')
    expect(move).toEqual({
      from: { zone: 'tableau', column: 0 },
      to: { zone: 'foundation', foundationIndex: 0 },
    })
  })

  it('ignore les cartes spécifiées dans excludedCardIds (cartes redescendues manuellement)', () => {
    const ace = makeCard('spades', 1)
    const game: GameState = {
      ...makeEmptyGame(),
      tableau: [[ace], [], [], [], [], [], []],
    }

    // Sans exclusion, l'As monte
    expect(findNextSafeFoundationMove(game, 'all')).not.toBeNull()

    // Avec exclusion de l'As, aucun coup n'est proposé
    expect(findNextSafeFoundationMove(game, 'all', [ace.id])).toBeNull()
  })
})

