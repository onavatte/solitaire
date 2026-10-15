import React from 'react'
import type { Card } from '../engine'
import { colorOf } from '../engine'
import { SuitIcon } from './cardSymbols'
import { cardAccessibleName, rankLabel } from './cardUtils'

interface CardViewProps {
  card: Card
  isHighlighted?: boolean
  isSelected?: boolean
  onClick?: () => void
  onDoubleClick?: () => void
  style?: React.CSSProperties
  className?: string
}

export const CardView: React.FC<CardViewProps> = ({
  card,
  isHighlighted,
  isSelected,
  onClick,
  onDoubleClick,
  style,
  className,
}) => {
  const isRed = colorOf(card.suit) === 'red'
  const textColor = isRed ? 'var(--red-suit)' : 'var(--black-suit)'
  const label = rankLabel(card.rank)
  const isCourt = card.rank >= 11 // Valet, Dame, Roi

  // Dos de carte classique avec motif géométrique SVG
  if (!card.faceUp) {
    return (
      <div
        role="img"
        aria-label="Carte face cachée"
        onClick={onClick}
        className={className}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: 'var(--card-aspect-ratio)',
          backgroundColor: '#1b3b6f',
          borderRadius: 'var(--card-radius)',
          boxShadow: 'var(--card-shadow)',
          border: '2px solid #ffffff',
          boxSizing: 'border-box',
          overflow: 'hidden',
          cursor: onClick ? 'pointer' : 'default',
          ...style,
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 140"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <pattern id="cardBackPattern" width="10" height="10" patternUnits="userSpaceOnUse">
              <path
                d="M 0 5 L 5 0 L 10 5 L 5 10 Z"
                fill="none"
                stroke="rgba(255, 255, 255, 0.22)"
                strokeWidth="0.8"
              />
            </pattern>
          </defs>
          <rect x="4" y="4" width="92" height="132" rx="4" fill="#152e59" stroke="#ffffff" strokeWidth="1" />
          <rect x="7" y="7" width="86" height="126" rx="3" fill="url(#cardBackPattern)" />
        </svg>
      </div>
    )
  }

  // Face avant de carte classique standard
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={cardAccessibleName(card)}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: 'var(--card-aspect-ratio)',
        backgroundColor: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        borderRadius: 'var(--card-radius)',
        boxShadow: isHighlighted || isSelected ? 'var(--highlight-shadow)' : 'var(--card-shadow)',
        boxSizing: 'border-box',
        overflow: 'hidden',
        color: textColor,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 'clamp(2px, 0.8vw, 5px)',
        cursor: 'pointer',
        transform: isSelected ? 'translateY(-4px)' : undefined,
        transition: 'transform 0.1s ease, box-shadow 0.15s ease',
        ...style,
      }}
    >
      {/* Coin supérieur gauche */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          lineHeight: 1,
          width: 'fit-content',
        }}
      >
        <span
          style={{
            fontSize: 'clamp(0.75rem, 2.8vw, 1.15rem)',
            fontWeight: 800,
            letterSpacing: '-0.05em',
          }}
        >
          {label}
        </span>
        <div style={{ fontSize: 'clamp(0.6rem, 2.2vw, 0.95rem)', marginTop: '1px' }}>
          <SuitIcon suit={card.suit} />
        </div>
      </div>

      {/* Centre de la carte */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        {card.rank === 1 ? (
          // As : Grand symbole central
          <div style={{ fontSize: 'clamp(1.6rem, 6.5vw, 2.8rem)' }}>
            <SuitIcon suit={card.suit} />
          </div>
        ) : isCourt ? (
          // Figures (V, D, R) : Cadre sobre et lettre de figure
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${textColor}33`,
              borderRadius: '4px',
              padding: '2px 6px',
              backgroundColor: `${textColor}08`,
            }}
          >
            <span style={{ fontSize: 'clamp(1.1rem, 4.5vw, 1.8rem)', fontWeight: 800 }}>
              {label}
            </span>
            <div style={{ fontSize: 'clamp(0.8rem, 3vw, 1.1rem)' }}>
              <SuitIcon suit={card.suit} />
            </div>
          </div>
        ) : (
          // Cartes 2 à 10 : Symbole moyen centré
          <div style={{ fontSize: 'clamp(1.2rem, 4.5vw, 1.9rem)' }}>
            <SuitIcon suit={card.suit} />
          </div>
        )}
      </div>

      {/* Coin inférieur droit (inversé 180deg) */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          lineHeight: 1,
          width: 'fit-content',
          alignSelf: 'flex-end',
          transform: 'rotate(180deg)',
        }}
      >
        <span
          style={{
            fontSize: 'clamp(0.75rem, 2.8vw, 1.15rem)',
            fontWeight: 800,
            letterSpacing: '-0.05em',
          }}
        >
          {label}
        </span>
        <div style={{ fontSize: 'clamp(0.6rem, 2.2vw, 0.95rem)', marginTop: '1px' }}>
          <SuitIcon suit={card.suit} />
        </div>
      </div>
    </div>
  )
}
