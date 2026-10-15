export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs'

export type CardColor = 'red' | 'black'

export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13

export interface Card {
  readonly id: string
  readonly suit: Suit
  readonly rank: Rank
  readonly faceUp: boolean
}

export type DrawCount = 1 | 3

export type GameStatus = 'playing' | 'won'

export interface GameState {
  readonly tableau: readonly (readonly Card[])[]
  readonly foundations: readonly (readonly Card[])[]
  readonly stock: readonly Card[]
  readonly waste: readonly Card[]
  readonly drawCount: DrawCount
  readonly moves: number
  readonly elapsedMs: number
  readonly seed: string | number
  readonly status: GameStatus
}

export interface DealOptions {
  readonly drawCount?: DrawCount
  readonly seed?: string | number
}

export type Location =
  | { readonly zone: 'tableau'; readonly column: number; readonly cardIndex?: number }
  | { readonly zone: 'foundation'; readonly foundationIndex: number }
  | { readonly zone: 'waste' }
  | { readonly zone: 'stock' }
