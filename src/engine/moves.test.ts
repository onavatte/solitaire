import { describe, expect, it } from 'vitest'
import { canMove, draw, findAutoMove, moveCards } from './moves'
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

describe('draw', () => {
  it('tire 1 carte du stock vers la défausse quand drawCount = 1', () => {
    const card1 = makeCard('spades', 5, false)
    const card2 = makeCard('hearts', 9, false)
    const initial = createEmptyState({
      stock: [card1, card2], // card2 est au sommet
      drawCount: 1,
    })

    const next = draw(initial)

    expect(next.stock).toHaveLength(1)
    expect(next.stock[0]?.id).toBe('spades-5')
    expect(next.waste).toHaveLength(1)
    expect(next.waste[0]?.id).toBe('hearts-9')
    expect(next.waste[0]?.faceUp).toBe(true)
    expect(next.moves).toBe(1)
  })

  it('tire l’unique carte restante du stock sans recycler prématurément', () => {
    const lastCard = makeCard('diamonds', 10, false)
    const existingWaste = makeCard('spades', 3, true)
    const initial = createEmptyState({
      stock: [lastCard],
      waste: [existingWaste],
      drawCount: 1,
    })

    const afterDraw = draw(initial)

    // Le stock doit être vide
    expect(afterDraw.stock).toHaveLength(0)
    // La défausse a reçu la dernière carte
    expect(afterDraw.waste).toHaveLength(2)
    expect(afterDraw.waste[1]?.id).toBe('diamonds-10')
    expect(afterDraw.waste[1]?.faceUp).toBe(true)

    // Uniquement au coup suivant, le clic sur la pioche vide déclenche le recyclage
    const afterRecycle = draw(afterDraw)
    expect(afterRecycle.stock).toHaveLength(2)
    expect(afterRecycle.waste).toHaveLength(0)
    expect(afterRecycle.stock.every((c) => !c.faceUp)).toBe(true)
  })

  it('tire jusqu’à 3 cartes quand drawCount = 3', () => {
    const c1 = makeCard('spades', 1, false)
    const c2 = makeCard('spades', 2, false)
    const c3 = makeCard('spades', 3, false)
    const c4 = makeCard('spades', 4, false)
    const initial = createEmptyState({
      stock: [c1, c2, c3, c4], // Sommet = c4
      drawCount: 3,
    })

    const next = draw(initial)

    expect(next.stock).toHaveLength(1)
    expect(next.stock[0]?.id).toBe('spades-1')
    expect(next.waste).toHaveLength(3)
    // Les 3 cartes tirées sont c4, c3, c2 ; au sommet de waste se trouve c2
    expect(next.waste.map((c) => c.id)).toEqual(['spades-4', 'spades-3', 'spades-2'])
    expect(next.waste.every((c) => c.faceUp)).toBe(true)
    expect(next.moves).toBe(1)
  })

  it('recycle la défausse dans le stock quand la pioche est vide', () => {
    const w1 = makeCard('spades', 1, true)
    const w2 = makeCard('hearts', 2, true)
    const initial = createEmptyState({
      stock: [],
      waste: [w1, w2], // w2 au sommet
    })

    const next = draw(initial)

    expect(next.waste).toHaveLength(0)
    expect(next.stock).toHaveLength(2)
    // En recyclant, w2 (sommet waste) redevient le fond du stock, et w1 redevient le sommet du stock
    expect(next.stock[0]?.id).toBe('hearts-2')
    expect(next.stock[1]?.id).toBe('spades-1')
    expect(next.stock.every((c) => !c.faceUp)).toBe(true)
    expect(next.moves).toBe(1)
  })

  it('ne fait rien si stock et waste sont vides', () => {
    const initial = createEmptyState({ stock: [], waste: [] })
    const next = draw(initial)
    expect(next).toBe(initial)
    expect(next.moves).toBe(0)
  })
})

describe('moveCards & canMove', () => {
  it('déplace une carte de la défausse vers le tableau', () => {
    const wasteTop = makeCard('hearts', 7)
    const tableauTarget = makeCard('spades', 8)

    const initial = createEmptyState({
      waste: [wasteTop],
      tableau: [[tableauTarget], [], [], [], [], [], []],
    })

    const from = { zone: 'waste' as const }
    const to = { zone: 'tableau' as const, column: 0 }

    expect(canMove(initial, from, to)).toBe(true)

    const next = moveCards(initial, from, to)
    expect(next.waste).toHaveLength(0)
    expect(next.tableau[0]).toHaveLength(2)
    expect(next.tableau[0]?.[1]?.id).toBe('hearts-7')
    expect(next.moves).toBe(1)
  })

  it('déplace une carte du tableau vers une fondation', () => {
    const ace = makeCard('hearts', 1)
    const initial = createEmptyState({
      tableau: [[ace], [], [], [], [], [], []],
    })

    const from = { zone: 'tableau' as const, column: 0 }
    const to = { zone: 'foundation' as const, foundationIndex: 0 }

    expect(canMove(initial, from, to)).toBe(true)

    const next = moveCards(initial, from, to)
    expect(next.tableau[0]).toHaveLength(0)
    expect(next.foundations[0]).toHaveLength(1)
    expect(next.foundations[0]?.[0]?.id).toBe('hearts-1')
    expect(next.moves).toBe(1)
  })

  it('retourne automatiquement la carte cachée libérée sur le tableau', () => {
    const hiddenCard = makeCard('clubs', 4, false)
    const ace = makeCard('hearts', 1, true)

    const initial = createEmptyState({
      tableau: [[hiddenCard, ace], [], [], [], [], [], []],
    })

    const from = { zone: 'tableau' as const, column: 0 }
    const to = { zone: 'foundation' as const, foundationIndex: 0 }

    const next = moveCards(initial, from, to)
    expect(next.tableau[0]).toHaveLength(1)
    expect(next.tableau[0]?.[0]?.id).toBe('clubs-4')
    expect(next.tableau[0]?.[0]?.faceUp).toBe(true) // Révélée !
  })

  it('déplace une séquence de plusieurs cartes entre colonnes', () => {
    const col0Card1 = makeCard('spades', 10)
    const col0Card2 = makeCard('hearts', 9)
    const col1Card1 = makeCard('diamonds', 11)

    const initial = createEmptyState({
      tableau: [
        [col0Card1, col0Card2],
        [col1Card1],
        [],
        [],
        [],
        [],
        [],
      ],
    })

    // Déplacement de la séquence [10 de Pique, 9 de Coeur] sur le [11 de Carreau]
    const from = { zone: 'tableau' as const, column: 0, cardIndex: 0 }
    const to = { zone: 'tableau' as const, column: 1 }

    expect(canMove(initial, from, to)).toBe(true)

    const next = moveCards(initial, from, to)
    expect(next.tableau[0]).toHaveLength(0)
    expect(next.tableau[1]).toHaveLength(3)
    expect(next.tableau[1]?.map((c) => c.id)).toEqual([
      'diamonds-11',
      'spades-10',
      'hearts-9',
    ])
  })

  it('autorise de descendre une carte d’une fondation vers le tableau', () => {
    const foundationCard = makeCard('hearts', 7)
    const tableauTarget = makeCard('spades', 8)

    const initial = createEmptyState({
      foundations: [[foundationCard], [], [], []],
      tableau: [[tableauTarget], [], [], [], [], [], []],
    })

    const from = { zone: 'foundation' as const, foundationIndex: 0 }
    const to = { zone: 'tableau' as const, column: 0 }

    expect(canMove(initial, from, to)).toBe(true)

    const next = moveCards(initial, from, to)
    expect(next.foundations[0]).toHaveLength(0)
    expect(next.tableau[0]).toHaveLength(2)
    expect(next.tableau[0]?.[1]?.id).toBe('hearts-7')
  })

  it('refuse un déplacement illégal et renvoie l’état d’origine', () => {
    const red7 = makeCard('hearts', 7)
    const red8 = makeCard('diamonds', 8)

    const initial = createEmptyState({
      tableau: [[red7], [red8], [], [], [], [], []],
    })

    const from = { zone: 'tableau' as const, column: 0 }
    const to = { zone: 'tableau' as const, column: 1 }

    expect(canMove(initial, from, to)).toBe(false)
    const next = moveCards(initial, from, to)
    expect(next).toBe(initial)
  })
})

describe('findAutoMove', () => {
  it('trouve en priorité la fondation éligible pour un As', () => {
    const ace = makeCard('hearts', 1)
    const state = createEmptyState({
      tableau: [[ace], [], [], [], [], [], []],
    })

    const target = findAutoMove(state, { zone: 'tableau', column: 0 })
    expect(target).toEqual({ zone: 'foundation', foundationIndex: 0 })
  })

  it('trouve une colonne de tableau légitime si la carte ne peut aller en fondation', () => {
    const red7 = makeCard('hearts', 7)
    const black8 = makeCard('spades', 8)
    const state = createEmptyState({
      waste: [red7],
      tableau: [[black8], [], [], [], [], [], []],
    })

    const target = findAutoMove(state, { zone: 'waste' })
    expect(target).toEqual({ zone: 'tableau', column: 0 })
  })

  it('envoie un Roi vers une colonne vide si le Roi provient de la défausse ou libère une carte', () => {
    const hidden = makeCard('clubs', 3, false)
    const king = makeCard('spades', 13)
    const state = createEmptyState({
      tableau: [[hidden, king], [], [], [], [], [], []],
    })

    const target = findAutoMove(state, { zone: 'tableau', column: 0, cardIndex: 1 })
    expect(target).toEqual({ zone: 'tableau', column: 1 })
  })

  it('ne déplace pas un Roi seul sur une colonne vide vers une autre colonne vide', () => {
    const king = makeCard('spades', 13)
    const state = createEmptyState({
      tableau: [[king], [], [], [], [], [], []],
    })

    const target = findAutoMove(state, { zone: 'tableau', column: 0, cardIndex: 0 })
    expect(target).toBeNull()
  })

  it('renvoie null si aucun coup légitime n’est disponible pour la carte', () => {
    const red7 = makeCard('hearts', 7)
    const state = createEmptyState({
      tableau: [[red7], [], [], [], [], [], []],
    })

    const target = findAutoMove(state, { zone: 'tableau', column: 0 })
    expect(target).toBeNull()
  })
})

describe('score Klondike', () => {
  it('ajoute 5 points quand une carte passe de la défausse au tableau', () => {
    const black8 = makeCard('spades', 8)
    const red7 = makeCard('hearts', 7)
    const state = createEmptyState({
      waste: [red7],
      tableau: [[black8], [], [], [], [], [], []],
      score: 10,
    })

    const next = moveCards(state, { zone: 'waste' }, { zone: 'tableau', column: 0 })
    expect(next.score).toBe(15)
  })

  it('ajoute 10 points quand une carte passe de la défausse à la fondation', () => {
    const ace = makeCard('hearts', 1)
    const state = createEmptyState({
      waste: [ace],
      score: 0,
    })

    const next = moveCards(state, { zone: 'waste' }, { zone: 'foundation', foundationIndex: 0 })
    expect(next.score).toBe(10)
  })

  it('ajoute 10 points quand une carte passe du tableau à la fondation sans révéler de carte cachée', () => {
    const ace = makeCard('clubs', 1)
    const state = createEmptyState({
      tableau: [[ace], [], [], [], [], [], []],
      score: 5,
    })

    const next = moveCards(
      state,
      { zone: 'tableau', column: 0, cardIndex: 0 },
      { zone: 'foundation', foundationIndex: 0 },
    )
    expect(next.score).toBe(15)
  })

  it('ajoute 15 points (10 + 5) quand le départ vers la fondation révèle une carte cachée', () => {
    const hidden = makeCard('spades', 10, false)
    const ace = makeCard('spades', 1, true)
    const state = createEmptyState({
      tableau: [[hidden, ace], [], [], [], [], [], []],
      score: 20,
    })

    const next = moveCards(
      state,
      { zone: 'tableau', column: 0, cardIndex: 1 },
      { zone: 'foundation', foundationIndex: 0 },
    )
    expect(next.score).toBe(35) // 20 + 10 (fondation) + 5 (révélation)
  })

  it('ajoute 5 points quand un déplacement dans le tableau révèle une carte cachée', () => {
    const hidden = makeCard('diamonds', 9, false)
    const red7 = makeCard('hearts', 7, true)
    const black8 = makeCard('spades', 8, true)
    const state = createEmptyState({
      tableau: [[hidden, red7], [black8], [], [], [], [], []],
      score: 10,
    })

    const next = moveCards(
      state,
      { zone: 'tableau', column: 0, cardIndex: 1 },
      { zone: 'tableau', column: 1 },
    )
    expect(next.score).toBe(15) // 10 + 5 (révélation)
  })

  it('retire 15 points quand une carte descend d une fondation vers le tableau', () => {
    const black8 = makeCard('spades', 8)
    const red7 = makeCard('hearts', 7)
    const state = createEmptyState({
      foundations: [[red7], [], [], []],
      tableau: [[black8], [], [], [], [], [], []],
      score: 40,
    })

    const next = moveCards(
      state,
      { zone: 'foundation', foundationIndex: 0 },
      { zone: 'tableau', column: 0 },
    )
    expect(next.score).toBe(25) // 40 - 15
  })

  it('ne laisse jamais le score descendre en dessous de 0', () => {
    const black8 = makeCard('spades', 8)
    const red7 = makeCard('hearts', 7)
    const state = createEmptyState({
      foundations: [[red7], [], [], []],
      tableau: [[black8], [], [], [], [], [], []],
      score: 5,
    })

    const next = moveCards(
      state,
      { zone: 'foundation', foundationIndex: 0 },
      { zone: 'tableau', column: 0 },
    )
    expect(next.score).toBe(0) // Math.max(0, 5 - 15)
  })

  it('pénalise de 100 points le recyclage de la pioche en tirage 1 carte', () => {
    const state = createEmptyState({
      stock: [],
      waste: [makeCard('hearts', 5)],
      drawCount: 1,
      score: 150,
    })

    const next = draw(state)
    expect(next.score).toBe(50) // 150 - 100
  })

  it('pénalise de 20 points le recyclage de la pioche en tirage 3 cartes', () => {
    const state = createEmptyState({
      stock: [],
      waste: [makeCard('hearts', 5)],
      drawCount: 3,
      score: 50,
    })

    const next = draw(state)
    expect(next.score).toBe(30) // 50 - 20
  })
})


