import React, { useEffect, useRef, useState } from 'react'
import type { Card } from '../engine'
import { colorOf } from '../engine'
import { CourtFigure } from './CourtFigures'
import { SuitIcon } from './cardSymbols'
import { cardAccessibleName, rankLabel } from './cardUtils'

interface CardViewProps {
  card: Card
  isHighlighted?: boolean
  isSelected?: boolean
  onClick?: () => void
  style?: React.CSSProperties
  className?: string
  disableFlipAnimation?: boolean
}

const CardBackSvg: React.FC = () => (
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
)

export const CardView: React.FC<CardViewProps> = ({
  card,
  isHighlighted,
  isSelected,
  onClick,
  style,
  className,
  disableFlipAnimation,
}) => {
  const isRed = colorOf(card.suit) === 'red'
  const textColor = isRed ? 'var(--red-suit)' : 'var(--black-suit)'
  const label = rankLabel(card.rank)
  const isCourt = card.rank >= 11 // Valet, Dame, Roi

  // Détection d'un vrai retournement : passage de face cachée (false) à face visible (true)
  const prevFaceUpRef = useRef(card.faceUp)
  const [justFlipped, setJustFlipped] = useState(false)

  useEffect(() => {
    if (disableFlipAnimation) {
      prevFaceUpRef.current = card.faceUp
      return
    }
    if (!prevFaceUpRef.current && card.faceUp) {
      setJustFlipped(true)
      const timer = setTimeout(() => {
        setJustFlipped(false)
      }, 600) // 600ms pour un retournement 3D fluide et lisible
      return () => clearTimeout(timer)
    }
    prevFaceUpRef.current = card.faceUp
  }, [card.faceUp, disableFlipAnimation])

  // Contenu commun de la face avant
  const renderFrontContent = () => (
    <>
      {/* En-tête supérieur gauche : rang et enseigne côte à côte */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 'clamp(2px, 0.6vw, 4px)',
          lineHeight: 1,
          width: 'fit-content',
          zIndex: 1,
        }}
      >
        <span
          style={{
            fontSize: 'clamp(1rem, 4.4vw, 1.55rem)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
          }}
        >
          {label}
        </span>
        <div
          style={{
            fontSize: 'clamp(0.85rem, 3.8vw, 1.3rem)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <SuitIcon suit={card.suit} />
        </div>
      </div>

      {/* Corps de la carte */}
      {isCourt ? (
        // Figures (Valet, Dame, Roi) : Portrait SVG traditionnel
        <div
          style={{
            position: 'absolute',
            inset: 'auto 0 clamp(2px, 0.8vw, 5px) 0',
            height: '74%',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          <CourtFigure rank={card.rank} suit={card.suit} />
        </div>
      ) : (
        // As et cartes numérotées 2 à 10 : Grand symbole unique descendant vers le bas
        <div
          style={{
            position: 'absolute',
            inset: 'auto 0 4px 0',
            height: '68%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            fontSize: 'clamp(2.3rem, 9.8vw, 4.2rem)',
          }}
        >
          <SuitIcon suit={card.suit} />
        </div>
      )}
    </>
  )

  // Rendu avec animation 3D complète lors de la découverte (Dos -> Tranche -> Face)
  if (justFlipped) {
    return (
      <div
        role="button"
        tabIndex={0}
        aria-label={cardAccessibleName(card)}
        onClick={(e) => {
          e.stopPropagation()
          onClick?.()
        }}
        className={className}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: 'var(--card-aspect-ratio)',
          boxSizing: 'border-box',
          cursor: 'pointer',
          perspective: '800px',
          ...style,
        }}
      >
        <div className="card-flip-3d">
          {/* Face Dos (0°) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              backgroundColor: '#1b3b6f',
              borderRadius: 'var(--card-radius)',
              boxShadow: 'var(--card-shadow)',
              border: '2px solid #ffffff',
              boxSizing: 'border-box',
              overflow: 'hidden',
            }}
          >
            <CardBackSvg />
          </div>

          {/* Face Avant (180°) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
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
            }}
          >
            {renderFrontContent()}
          </div>
        </div>
      </div>
    )
  }

  // Dos de carte classique au repos avec motif géométrique SVG
  if (!card.faceUp) {
    return (
      <div
        role="img"
        onClick={(e) => {
          e.stopPropagation()
          onClick?.()
        }}
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
        <CardBackSvg />
      </div>
    )
  }

  // Face avant de carte classique standard au repos
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={cardAccessibleName(card)}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
      onDoubleClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
      }}
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
      {renderFrontContent()}
    </div>
  )
}
