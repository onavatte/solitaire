import React from 'react'
import type { Suit } from '../engine'
import { SuitIcon } from './cardSymbols'

interface SuitPulseProps {
  suit: Suit
  onComplete?: () => void
}

export const SuitPulse: React.FC<SuitPulseProps> = ({ suit, onComplete }) => {
  const suitColor =
    suit === 'hearts' || suit === 'diamonds' ? 'var(--red-suit, #e63946)' : 'var(--black-suit, #1d3557)'

  return (
    <div
      className="suit-pulse-fade"
      onAnimationEnd={onComplete}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 600,
        pointerEvents: 'none',
        color: suitColor,
      }}
    >
      <SuitIcon suit={suit} size="70%" />
    </div>
  )
}

