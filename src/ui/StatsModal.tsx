import React, { useState } from 'react'
import type { GameStats } from '../state/persistence'

interface StatsModalProps {
  stats: GameStats
  isOpen: boolean
  onClose: () => void
  onReset: () => void
}

function formatDuration(ms: number | null): string {
  if (ms === null) return '—'
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export const StatsModal: React.FC<StatsModalProps> = ({
  stats,
  isOpen,
  onClose,
  onReset,
}) => {
  const [activeTab, setActiveTab] = useState<'draw1' | 'draw3'>('draw1')
  const [showConfirmReset, setShowConfirmReset] = useState(false)

  if (!isOpen) return null

  const currentStats = stats[activeTab]
  const winRate =
    currentStats.gamesPlayed > 0
      ? Math.round((currentStats.gamesWon / currentStats.gamesPlayed) * 100)
      : 0

  const handleResetClick = () => {
    if (showConfirmReset) {
      onReset()
      setShowConfirmReset(false)
    } else {
      setShowConfirmReset(true)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
        padding: '1rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Statistiques du joueur"
        style={{
          backgroundColor: '#1b4d29',
          border: '2px solid rgba(255, 255, 255, 0.25)',
          borderRadius: '12px',
          padding: '1.5rem',
          maxWidth: '380px',
          width: '100%',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
          color: 'var(--felt-text)',
        }}
      >
        {/* Titre et bouton fermer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>
            Statistiques
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer les statistiques"
            style={{
              minWidth: '44px',
              minHeight: '44px',
              background: 'transparent',
              border: 'none',
              color: 'var(--felt-text)',
              fontSize: '1.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Onglets Pioche 1 carte / Pioche 3 cartes */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1.2rem',
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            padding: '4px',
            borderRadius: '8px',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setActiveTab('draw1')
              setShowConfirmReset(false)
            }}
            style={{
              flex: 1,
              minHeight: '40px',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.85rem',
              backgroundColor:
                activeTab === 'draw1'
                  ? 'var(--highlight-color)'
                  : 'transparent',
              color: activeTab === 'draw1' ? '#111111' : 'var(--felt-text)',
              cursor: 'pointer',
            }}
          >
            1 carte
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('draw3')
              setShowConfirmReset(false)
            }}
            style={{
              flex: 1,
              minHeight: '40px',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.85rem',
              backgroundColor:
                activeTab === 'draw3'
                  ? 'var(--highlight-color)'
                  : 'transparent',
              color: activeTab === 'draw3' ? '#111111' : 'var(--felt-text)',
              cursor: 'pointer',
            }}
          >
            3 cartes
          </button>
        </div>

        {/* Grille des statistiques */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.8rem',
            marginBottom: '1.5rem',
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              padding: '0.8rem',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '0.8rem',
                color: 'var(--felt-text-muted)',
                marginBottom: '0.2rem',
              }}
            >
              Parties jouées
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>
              {currentStats.gamesPlayed}
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              padding: '0.8rem',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '0.8rem',
                color: 'var(--felt-text-muted)',
                marginBottom: '0.2rem',
              }}
            >
              Victoires (% gagne)
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>
              {currentStats.gamesWon} ({winRate}%)
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              padding: '0.8rem',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '0.8rem',
                color: 'var(--felt-text-muted)',
                marginBottom: '0.2rem',
              }}
            >
              Série actuelle / max
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>
              {currentStats.currentStreak} / {currentStats.maxStreak}
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              padding: '0.8rem',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '0.8rem',
                color: 'var(--felt-text-muted)',
                marginBottom: '0.2rem',
              }}
            >
              Meilleur temps
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>
              {formatDuration(currentStats.bestTimeMs)}
            </div>
          </div>

          <div
            style={{
              gridColumn: 'span 2',
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              padding: '0.8rem',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '0.8rem',
                color: 'var(--felt-text-muted)',
                marginBottom: '0.2rem',
              }}
            >
              Meilleur score (moins de coups)
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>
              {currentStats.bestMoves !== null ? `${currentStats.bestMoves} coups` : '—'}
            </div>
          </div>
        </div>

        {/* Boutons d'action : Réinitialiser & Fermer */}
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'space-between' }}>
          <button
            type="button"
            onClick={handleResetClick}
            style={{
              minHeight: '44px',
              padding: '0.5rem 0.8rem',
              backgroundColor: showConfirmReset ? '#8B0000' : 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {showConfirmReset ? 'Confirmer la remise à zéro ?' : 'Réinitialiser'}
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              minHeight: '44px',
              padding: '0.5rem 1.2rem',
              backgroundColor: 'var(--highlight-color)',
              color: '#111111',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}

