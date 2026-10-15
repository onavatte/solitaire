import type { Card, Rank, Suit } from '../engine'

export function rankLabel(rank: Rank): string {
  switch (rank) {
    case 1:
      return 'A'
    case 11:
      return 'V'
    case 12:
      return 'D'
    case 13:
      return 'R'
    default:
      return rank.toString()
  }
}

export function rankFullName(rank: Rank): string {
  switch (rank) {
    case 1:
      return 'As'
    case 11:
      return 'Valet'
    case 12:
      return 'Dame'
    case 13:
      return 'Roi'
    default:
      return rank.toString()
  }
}

export function suitFullName(suit: Suit): string {
  switch (suit) {
    case 'spades':
      return 'Pique'
    case 'hearts':
      return 'Cœur'
    case 'diamonds':
      return 'Carreau'
    case 'clubs':
      return 'Trèfle'
  }
}

export function cardAccessibleName(card: Card): string {
  if (!card.faceUp) {
    return 'Carte face cachée'
  }
  return `${rankFullName(card.rank)} de ${suitFullName(card.suit)}`
}

