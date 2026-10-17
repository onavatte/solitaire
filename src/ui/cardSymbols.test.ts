import { describe, expect, it } from 'vitest'
import { cardAccessibleName, rankFullName, rankLabel, suitFullName } from './cardUtils'
import type { Card } from '../engine'

describe('cardSymbols helpers', () => {
  it('fournit les bons labels courts pour les cartes', () => {
    expect(rankLabel(1)).toBe('A')
    expect(rankLabel(7)).toBe('7')
    expect(rankLabel(10)).toBe('10')
    expect(rankLabel(11)).toBe('V')
    expect(rankLabel(12)).toBe('D')
    expect(rankLabel(13)).toBe('R')
  })

  it('fournit les noms complets en français pour l’accessibilité', () => {
    expect(rankFullName(1)).toBe('As')
    expect(rankFullName(12)).toBe('Dame')
    expect(suitFullName('spades')).toBe('Pique')
    expect(suitFullName('hearts')).toBe('Cœur')
    expect(suitFullName('diamonds')).toBe('Carreau')
    expect(suitFullName('clubs')).toBe('Trèfle')

    const card: Card = { id: 'hearts-12', suit: 'hearts', rank: 12, faceUp: true }
    expect(cardAccessibleName(card)).toBe('Dame de Cœur')

    const hiddenCard: Card = { id: 'spades-1', suit: 'spades', rank: 1, faceUp: false }
    expect(cardAccessibleName(hiddenCard)).toBe('Carte face cachée')
  })

  it('exporte CourtFigure correctement', async () => {
    const { CourtFigure } = await import('./CourtFigures')
    expect(typeof CourtFigure).toBe('function')
  })

  it('exporte SuitPulse correctement', async () => {
    const { SuitPulse } = await import('./SuitPulse')
    expect(typeof SuitPulse).toBe('function')
  })
})
