import { describe, expect, it } from 'vitest'
import { getDealOrderIndex } from './useDealAnimation'

describe('getDealOrderIndex (ordre de distribution Klondike)', () => {
  it('calcule correctement les cartes de la rangée 0 (colonnes 0 à 6)', () => {
    // Rangée 0 : 1 carte sur chaque colonne 0..6
    expect(getDealOrderIndex(0, 0)).toBe(0)
    expect(getDealOrderIndex(1, 0)).toBe(1)
    expect(getDealOrderIndex(2, 0)).toBe(2)
    expect(getDealOrderIndex(3, 0)).toBe(3)
    expect(getDealOrderIndex(4, 0)).toBe(4)
    expect(getDealOrderIndex(5, 0)).toBe(5)
    expect(getDealOrderIndex(6, 0)).toBe(6)
  })

  it('calcule correctement les cartes de la rangée 1 (colonnes 1 à 6)', () => {
    // Rangée 1 : commence à l'index 7
    expect(getDealOrderIndex(1, 1)).toBe(7)
    expect(getDealOrderIndex(2, 1)).toBe(8)
    expect(getDealOrderIndex(6, 1)).toBe(12)
  })

  it('distribue exactement 28 cartes de 0 à 27 sans doublon', () => {
    const indices: number[] = []
    for (let col = 0; col < 7; col++) {
      for (let cardIdx = 0; cardIdx <= col; cardIdx++) {
        indices.push(getDealOrderIndex(col, cardIdx))
      }
    }

    expect(indices.length).toBe(28)
    indices.sort((a, b) => a - b)
    // Doit être [0, 1, 2, ..., 27]
    for (let i = 0; i < 28; i++) {
      expect(indices[i]).toBe(i)
    }
  })

  it('attribue bien la dernière carte (27) au sommet de la colonne 6', () => {
    expect(getDealOrderIndex(6, 6)).toBe(27)
  })
})

