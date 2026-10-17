import React, { useState } from 'react'
import type { Card, Suit } from '../engine'
import { CardView } from './CardView'
import { SuitPulse } from './SuitPulse'
import { VictoryCelebration, type VictoryMode } from './VictoryCelebration'

interface AnimationLabProps {
  onClose: () => void
  onTriggerVictory?: (mode: VictoryMode) => void
  onTriggerDeal?: () => void
}

const SAMPLE_CARDS: Card[] = [
  { id: 'jh', suit: 'hearts', rank: 11, faceUp: true },
  { id: 'qs', suit: 'spades', rank: 12, faceUp: true },
  { id: 'kd', suit: 'diamonds', rank: 13, faceUp: true },
  { id: 'ac', suit: 'clubs', rank: 1, faceUp: true },
  { id: '10d', suit: 'diamonds', rank: 10, faceUp: true },
]

type FlipVariant = 'current' | 'full3d' | 'elevated3d'

export const AnimationLab: React.FC<AnimationLabProps> = ({ onClose, onTriggerVictory, onTriggerDeal }) => {
  const [selectedCardIndex, setSelectedCardIndex] = useState(0)
  const [isFaceUp, setIsFaceUp] = useState(false)
  const [durationMs, setDurationMs] = useState(1000) // Ralenti par défaut à 1000ms pour bien voir
  const [variant, setVariant] = useState<FlipVariant>('full3d')
  const [manualProgress, setManualProgress] = useState<number | null>(null) // null = mode automatique
  const [activeCelebration, setActiveCelebration] = useState<VictoryMode | null>(null)
  const [activePulse, setActivePulse] = useState<{ id: number; suit: Suit } | null>(null)


  const activeCard = SAMPLE_CARDS[selectedCardIndex] ?? SAMPLE_CARDS[0]!
  const cardWithState: Card = { ...activeCard, faceUp: isFaceUp }

  // Calcul des styles d'animation selon la variante choisie
  const getCardStyle = (): React.CSSProperties => {
    // Mode pas-à-pas manuel (0% à 100%)
    if (manualProgress !== null) {
      const angle = manualProgress * 180 // 0° = dos, 180° = face
      return {
        transform: `perspective(800px) rotateY(${angle}deg)`,
        transition: 'none',
      }
    }

    return {}
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#0e2b17',
        backgroundImage: 'radial-gradient(circle at center, #1b4d29 0%, #0c2413 100%)',
        color: '#ffffff',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        padding: 'calc(0.8rem + env(safe-area-inset-top, 0px)) 1rem calc(1rem + env(safe-area-inset-bottom, 0px))',
        boxSizing: 'border-box',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {/* Barre supérieure */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          maxWidth: '540px',
          width: '100%',
          margin: '0 auto 1rem auto',
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
            Laboratoire d'Animations
          </h1>
          <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
            Prévisualisation au ralenti et réglages fins
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{
            minHeight: '38px',
            padding: '0.4rem 0.9rem',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '6px',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
          }}
        >
          Retour au jeu
        </button>
      </div>

      {/* Zone centrale de visualisation de la carte */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '220px',
          margin: '0.5rem auto 1rem auto',
          perspective: '1000px',
        }}
      >
        <div
          style={{
            width: 'clamp(95px, 26vw, 130px)',
            aspectRatio: 'var(--card-aspect-ratio)',
            position: 'relative',
            ...getCardStyle(),
          }}
        >
          {manualProgress !== null ? (
            // Rendu pas-à-pas avec faces recto/verso en 3D
            <div
              style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                transformStyle: 'preserve-3d',
                transform: `rotateY(${manualProgress * 180}deg)`,
              }}
            >
              {/* Face Dos (0° à 90°) */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
              >
                <CardView card={{ ...activeCard, faceUp: false }} />
              </div>
              {/* Face Avant (90° à 180°) */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                <CardView card={{ ...activeCard, faceUp: true }} />
              </div>
            </div>
          ) : (
            // Rendu automatique animé avec la variante sélectionnée
            <LabAnimatedCard
              key={`${activeCard.id}-${variant}`}
              card={cardWithState}
              variant={variant}
              durationMs={durationMs}
            />
          )}

          {/* Onde de symbole d'enseigne active en prévisualisation */}
          {activePulse && (
            <SuitPulse
              key={activePulse.id}
              suit={activePulse.suit}
              onComplete={() => setActivePulse(null)}
            />
          )}
        </div>

        <div style={{ marginTop: '0.8rem', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)' }}>
          {manualProgress !== null
            ? `Angle actuel : ${Math.round(manualProgress * 180)}° (${manualProgress < 0.5 ? 'Dos' : 'Face'})`
            : `État : ${isFaceUp ? 'Face visible' : 'Dos caché'} — Durée : ${durationMs} ms (${(220 / durationMs).toFixed(2)}x)`}
        </div>
      </div>

      {/* Panneau de contrôle */}
      <div
        style={{
          maxWidth: '540px',
          width: '100%',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          backgroundColor: 'rgba(0, 0, 0, 0.35)',
          padding: '1rem',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxSizing: 'border-box',
        }}
      >
        {/* Actions principales : Déclencher le Flip */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
          <button
            type="button"
            onClick={() => {
              setManualProgress(null)
              setIsFaceUp((prev) => !prev)
            }}
            style={{
              minHeight: '44px',
              backgroundColor: 'var(--highlight-color)',
              color: '#111',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: 'pointer',
            }}
          >
            {isFaceUp ? 'Retourner (Cacher)' : 'Retourner (Révéler)'}
          </button>

          <button
            type="button"
            onClick={() => {
              setManualProgress(null)
              setIsFaceUp(false)
              setTimeout(() => setIsFaceUp(true), 60)
            }}
            style={{
              minHeight: '44px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            Rejouer révélation
          </button>
        </div>

        {/* Choix de la carte */}
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.3rem' }}>
            Carte à tester :
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.35rem' }}>
            {SAMPLE_CARDS.map((c, i) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCardIndex(i)}
                style={{
                  minHeight: '36px',
                  backgroundColor: selectedCardIndex === i ? 'var(--highlight-color)' : 'rgba(255, 255, 255, 0.1)',
                  color: selectedCardIndex === i ? '#111' : '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                {c.rank === 11 ? 'V' : c.rank === 12 ? 'D' : c.rank === 13 ? 'R' : c.rank === 1 ? 'A' : '10'}
              </button>
            ))}
          </div>
        </div>

        {/* Variantes d'animation */}
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.3rem' }}>
            Style d'animation :
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.35rem' }}>
            <button
              type="button"
              onClick={() => {
                setManualProgress(null)
                setVariant('current')
              }}
              style={{
                minHeight: '36px',
                backgroundColor: variant === 'current' && manualProgress === null ? 'var(--highlight-color)' : 'rgba(255, 255, 255, 0.1)',
                color: variant === 'current' && manualProgress === null ? '#111' : '#fff',
                border: 'none',
                borderRadius: '5px',
                fontWeight: 600,
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
            >
              1. Actuelle (90°→0°)
            </button>
            <button
              type="button"
              onClick={() => {
                setManualProgress(null)
                setVariant('full3d')
              }}
              style={{
                minHeight: '36px',
                backgroundColor: variant === 'full3d' && manualProgress === null ? 'var(--highlight-color)' : 'rgba(255, 255, 255, 0.1)',
                color: variant === 'full3d' && manualProgress === null ? '#111' : '#fff',
                border: 'none',
                borderRadius: '5px',
                fontWeight: 600,
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
            >
              2. Flip 3D (0°→180°)
            </button>
            <button
              type="button"
              onClick={() => {
                setManualProgress(null)
                setVariant('elevated3d')
              }}
              style={{
                minHeight: '36px',
                backgroundColor: variant === 'elevated3d' && manualProgress === null ? 'var(--highlight-color)' : 'rgba(255, 255, 255, 0.1)',
                color: variant === 'elevated3d' && manualProgress === null ? '#111' : '#fff',
                border: 'none',
                borderRadius: '5px',
                fontWeight: 600,
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
            >
              3. Flip 3D soulevé
            </button>
          </div>
        </div>

        {/* Vitesse / Ralenti */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.3rem' }}>
            <span>Vitesse : {durationMs} ms</span>
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              <button
                type="button"
                onClick={() => setDurationMs(220)}
                style={{ padding: '0.1rem 0.4rem', fontSize: '0.7rem', cursor: 'pointer', borderRadius: '3px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: durationMs === 220 ? '#fff' : 'transparent', color: durationMs === 220 ? '#000' : '#fff' }}
              >
                1x (Jeu)
              </button>
              <button
                type="button"
                onClick={() => setDurationMs(600)}
                style={{ padding: '0.1rem 0.4rem', fontSize: '0.7rem', cursor: 'pointer', borderRadius: '3px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: durationMs === 600 ? '#fff' : 'transparent', color: durationMs === 600 ? '#000' : '#fff' }}
              >
                0.35x
              </button>
              <button
                type="button"
                onClick={() => setDurationMs(1500)}
                style={{ padding: '0.1rem 0.4rem', fontSize: '0.7rem', cursor: 'pointer', borderRadius: '3px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: durationMs === 1500 ? '#fff' : 'transparent', color: durationMs === 1500 ? '#000' : '#fff' }}
              >
                Ralenti (0.15x)
              </button>
            </div>
          </div>
          <input
            type="range"
            min="100"
            max="3000"
            step="50"
            value={durationMs}
            onChange={(e) => {
              setManualProgress(null)
              setDurationMs(Number(e.target.value))
            }}
            style={{ width: '100%', cursor: 'pointer' }}
          />
        </div>

        {/* Mode pas-à-pas (Scrubber manuel) */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.3rem' }}>
            <span>Contrôle pas-à-pas (scrubber d'angle) :</span>
            {manualProgress !== null && (
              <button
                type="button"
                onClick={() => setManualProgress(null)}
                style={{ padding: '0.1rem 0.4rem', fontSize: '0.7rem', cursor: 'pointer', borderRadius: '3px', border: 'none', backgroundColor: '#e24a4a', color: '#fff' }}
              >
                Désactiver
              </button>
            )}
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={manualProgress ?? (isFaceUp ? 1 : 0)}
            onChange={(e) => setManualProgress(Number(e.target.value))}
            style={{ width: '100%', cursor: 'pointer' }}
          />
        </div>

        {/* Section animation de distribution */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.15)', paddingTop: '0.8rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.4rem' }}>
            Distribution des 28 cartes (Nouvelle donne) :
          </div>
          <button
            type="button"
            onClick={() => onTriggerDeal?.()}
            style={{
              width: '100%',
              minHeight: '38px',
              padding: '0.5rem 1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              color: 'var(--highlight-color)',
              border: '1px solid var(--highlight-color)',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >
            🃏 Lancer une distribution animée
          </button>
        </div>

        {/* Section animation de victoire */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.15)', paddingTop: '0.8rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.4rem' }}>
            1. Tester l'animation seule (plein écran) :
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.35rem', marginBottom: '0.8rem' }}>
            <button
              type="button"
              onClick={() => setActiveCelebration('fireworks-comics')}
              style={{
                minHeight: '36px',
                backgroundColor: activeCelebration === 'fireworks-comics' ? 'var(--highlight-color)' : 'rgba(255, 255, 255, 0.15)',
                color: activeCelebration === 'fireworks-comics' ? '#111' : '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
            >
              Comics Pop
            </button>
            <button
              type="button"
              onClick={() => setActiveCelebration('fireworks-classic')}
              style={{
                minHeight: '36px',
                backgroundColor: activeCelebration === 'fireworks-classic' ? 'var(--highlight-color)' : 'rgba(255, 255, 255, 0.15)',
                color: activeCelebration === 'fireworks-classic' ? '#111' : '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
            >
              Classiques
            </button>
            <button
              type="button"
              onClick={() => setActiveCelebration('confetti')}
              style={{
                minHeight: '36px',
                backgroundColor: activeCelebration === 'confetti' ? 'var(--highlight-color)' : 'rgba(255, 255, 255, 0.15)',
                color: activeCelebration === 'confetti' ? '#111' : '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
            >
              Confettis
            </button>
          </div>

          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.4rem' }}>
            2. Tester dans l'écran de victoire du jeu :
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.35rem' }}>
            <button
              type="button"
              onClick={() => onTriggerVictory?.('fireworks-comics')}
              style={{
                minHeight: '36px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.72rem',
                cursor: 'pointer',
              }}
            >
              + Comics Pop
            </button>
            <button
              type="button"
              onClick={() => onTriggerVictory?.('fireworks-classic')}
              style={{
                minHeight: '36px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.72rem',
                cursor: 'pointer',
              }}
            >
              + Classiques
            </button>
            <button
              type="button"
              onClick={() => onTriggerVictory?.('confetti')}
              style={{
                minHeight: '36px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.72rem',
                cursor: 'pointer',
              }}
            >
              + Confettis
            </button>
            <button
              type="button"
              onClick={() => {
                const modes: VictoryMode[] = ['fireworks-comics', 'fireworks-classic', 'confetti']
                const rand = modes[Math.floor(Math.random() * modes.length)] ?? 'fireworks-comics'
                onTriggerVictory?.(rand)
              }}
              style={{
                minHeight: '36px',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: 'var(--highlight-color)',
                border: '1px solid var(--highlight-color)',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.72rem',
                cursor: 'pointer',
              }}
            >
              🎲 Aléatoire
            </button>
          </div>
        </div>

        {/* Section Onde d'enseigne en fondation (Suit Pulse) */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '0.8rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.4rem' }}>
            Tester l'onde d'enseigne (fondation) :
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
            <button
              type="button"
              onClick={() => {
                setActivePulse(null)
                setTimeout(() => setActivePulse({ id: Date.now(), suit: 'hearts' }), 30)
              }}
              style={{
                minHeight: '38px',
                backgroundColor: 'rgba(230, 57, 70, 0.25)',
                color: '#ff6b6b',
                border: '1px solid rgba(230, 57, 70, 0.4)',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              ♥ Cœur
            </button>
            <button
              type="button"
              onClick={() => {
                setActivePulse(null)
                setTimeout(() => setActivePulse({ id: Date.now(), suit: 'diamonds' }), 30)
              }}
              style={{
                minHeight: '38px',
                backgroundColor: 'rgba(230, 57, 70, 0.25)',
                color: '#ff6b6b',
                border: '1px solid rgba(230, 57, 70, 0.4)',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              ♦ Carreau
            </button>
            <button
              type="button"
              onClick={() => {
                setActivePulse(null)
                setTimeout(() => setActivePulse({ id: Date.now(), suit: 'spades' }), 30)
              }}
              style={{
                minHeight: '38px',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              ♠ Pique
            </button>
            <button
              type="button"
              onClick={() => {
                setActivePulse(null)
                setTimeout(() => setActivePulse({ id: Date.now(), suit: 'clubs' }), 30)
              }}
              style={{
                minHeight: '38px',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              ♣ Trèfle
            </button>
          </div>
        </div>
      </div>

      {/* Rendu plein écran de l'animation de fête active */}
      {activeCelebration && (
        <>
          <VictoryCelebration
            mode={activeCelebration}
            onClose={() => setActiveCelebration(null)}
          />
          <button
            type="button"
            onClick={() => setActiveCelebration(null)}
            style={{
              position: 'fixed',
              top: 'calc(1rem + env(safe-area-inset-top, 0px))',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000,
              padding: '0.5rem 1.2rem',
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
            }}
          >
            Arrêter la fête (ou cliquer l'écran)
          </button>
        </>
      )}
    </div>
  )
}

/**
 * Composant de carte animé selon la variante et la durée choisies
 */
const LabAnimatedCard: React.FC<{
  card: Card
  variant: FlipVariant
  durationMs: number
}> = ({ card, variant, durationMs }) => {
  if (variant === 'current') {
    // Variante 1 : Actuelle
    return (
      <div
        key={String(card.faceUp)}
        style={{
          width: '100%',
          height: '100%',
          animation: card.faceUp
            ? `cardReveal ${durationMs}ms cubic-bezier(0.2, 0.8, 0.25, 1) forwards`
            : undefined,
        }}
      >
        <CardView card={card} disableFlipAnimation />
      </div>
    )
  }

  if (variant === 'elevated3d') {
    // Variante 3 : Flip 3D avec élévation et ombre portée à mi-parcours (50%)
    return (
      <>
        <style>{`
          @keyframes labFlipToFace {
            0% { transform: perspective(800px) rotateY(0deg) scale(1); filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); }
            50% { transform: perspective(800px) rotateY(90deg) scale(1.15); filter: drop-shadow(0 16px 30px rgba(0,0,0,0.6)); }
            100% { transform: perspective(800px) rotateY(180deg) scale(1); filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); }
          }
          @keyframes labFlipToBack {
            0% { transform: perspective(800px) rotateY(180deg) scale(1); filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); }
            50% { transform: perspective(800px) rotateY(90deg) scale(1.15); filter: drop-shadow(0 16px 30px rgba(0,0,0,0.6)); }
            100% { transform: perspective(800px) rotateY(0deg) scale(1); filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); }
          }
        `}</style>
        <div
          key={`${card.id}-${card.faceUp}`}
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            transformStyle: 'preserve-3d',
            WebkitTransformStyle: 'preserve-3d',
            animation: card.faceUp
              ? `labFlipToFace ${durationMs}ms cubic-bezier(0.2, 0.85, 0.25, 1) forwards`
              : `labFlipToBack ${durationMs}ms cubic-bezier(0.2, 0.85, 0.25, 1) forwards`,
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            <CardView card={{ ...card, faceUp: false }} disableFlipAnimation />
          </div>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <CardView card={{ ...card, faceUp: true }} disableFlipAnimation />
          </div>
        </div>
      </>
    )
  }

  // Variante 2 : Vrai retournement 3D continu (Dos -> Tranche -> Face)
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        transformStyle: 'preserve-3d',
        WebkitTransformStyle: 'preserve-3d',
        transition: `transform ${durationMs}ms cubic-bezier(0.2, 0.85, 0.25, 1)`,
        transform: card.faceUp
          ? 'perspective(800px) rotateY(180deg)'
          : 'perspective(800px) rotateY(0deg)',
      }}
    >
      {/* Face Dos (rotation 0°) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
      >
        <CardView card={{ ...card, faceUp: false }} disableFlipAnimation />
      </div>

      {/* Face Avant (rotation 180°) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
        }}
      >
        <CardView card={{ ...card, faceUp: true }} disableFlipAnimation />
      </div>
    </div>
  )
}

