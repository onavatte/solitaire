import React from 'react'
import type { DraggedSequence } from './input/useDrag'
import { CardView } from './CardView'

interface DragOverlayProps {
  dragged: DraggedSequence | null
}

export const DragOverlay: React.FC<DragOverlayProps> = ({ dragged }) => {
  if (!dragged) {
    return null
  }

  const { cards, currentPos, grabOffset, width, isSnapping } = dragged
  const x = currentPos.x - grabOffset.x
  const y = currentPos.y - grabOffset.y

  return (
    <div
      style={{
        position: 'fixed',
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        pointerEvents: 'none',
        zIndex: 1000,
        boxSizing: 'border-box',
        filter: 'drop-shadow(0 12px 24px rgba(0, 0, 0, 0.45))',
        transition: isSnapping
          ? 'left 180ms cubic-bezier(0.2, 0.9, 0.3, 1), top 180ms cubic-bezier(0.2, 0.9, 0.3, 1)'
          : undefined,
      }}
    >
      {cards.map((card, index) => {
        return (
          <div
            key={card.id}
            style={{
              position: index === 0 ? 'relative' : 'absolute',
              top: index === 0 ? 0 : `${index * 24}px`,
              left: 0,
              right: 0,
            }}
          >
            <CardView card={card} />
          </div>
        )
      })}
    </div>
  )
}

