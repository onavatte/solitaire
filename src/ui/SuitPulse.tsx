import React from 'react'
import type { Suit } from '../engine'
import { SuitIcon } from './cardSymbols'

interface SuitPulseProps {
  suit: Suit
  onComplete?: () => void
}

export const SuitPulse: React.FC<SuitPulseProps> = ({ suit, onComplete }) => {
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
        zIndex: 15,
        pointerEvents: 'none',
      }}
    >
      <SuitIcon suit={suit} size="70%" />
    </div>
  )
}

