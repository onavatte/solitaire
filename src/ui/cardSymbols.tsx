import React from 'react'
import type { Suit } from '../engine'

/**
 * Dessine l'enseigne SVG pure (Pique, Cœur, Carreau, Trèfle)
 */
export const SuitIcon: React.FC<{ suit: Suit; size?: number | string; color?: string }> = ({
  suit,
  size = '1em',
  color,
}) => {
  const fillColor =
    color ?? (suit === 'hearts' || suit === 'diamonds' ? 'var(--red-suit)' : 'var(--black-suit)')

  switch (suit) {
    case 'hearts':
      return (
        <svg
          viewBox="0 0 100 100"
          width={size}
          height={size}
          fill={fillColor}
          aria-hidden="true"
          style={{ display: 'inline-block', verticalAlign: 'middle' }}
        >
          <path d="M50,88 C50,88 12,56 12,32 C12,18 24,10 36,10 C44,10 48,15 50,20 C52,15 56,10 64,10 C76,10 88,18 88,32 C88,56 50,88 50,88 Z" />
        </svg>
      )
    case 'diamonds':
      return (
        <svg
          viewBox="0 0 100 100"
          width={size}
          height={size}
          fill={fillColor}
          aria-hidden="true"
          style={{ display: 'inline-block', verticalAlign: 'middle' }}
        >
          <path d="M50,8 L88,50 L50,92 L12,50 Z" />
        </svg>
      )
    case 'spades':
      return (
        <svg
          viewBox="0 0 100 100"
          width={size}
          height={size}
          fill={fillColor}
          aria-hidden="true"
          style={{ display: 'inline-block', verticalAlign: 'middle' }}
        >
          <path d="M50,10 C50,10 16,46 16,62 C16,74 26,80 37,80 C44,80 48,76 50,71 C50,78 45,86 42,90 L58,90 C55,86 50,78 50,71 C52,76 56,80 63,80 C74,80 84,74 84,62 C84,46 50,10 50,10 Z" />
        </svg>
      )
    case 'clubs':
      return (
        <svg
          viewBox="0 0 100 100"
          width={size}
          height={size}
          fill={fillColor}
          aria-hidden="true"
          style={{ display: 'inline-block', verticalAlign: 'middle' }}
        >
          <path d="M50,12 C42,12 36,18 36,26 C36,32 40,38 45,40 C38,38 22,42 22,54 C22,64 32,70 42,68 C44,68 47,67 49,65 C48,72 44,84 40,88 L60,88 C56,84 52,72 51,65 C53,67 56,68 58,68 C68,70 78,64 78,54 C78,42 62,38 55,40 C60,38 64,32 64,26 C64,18 58,12 50,12 Z" />
        </svg>
      )
  }
}

