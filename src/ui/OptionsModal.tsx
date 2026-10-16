import React from 'react'
import type { DrawCount } from '../engine'
import type { UserPreferences } from '../state/persistence'

interface OptionsModalProps {
  preferences: UserPreferences
  isOpen: boolean
  onClose: () => void
  onChangeDrawCount: (count: DrawCount) => void
  onToggleHaptic: () => void
  onToggleAnimations: () => void
}

export const OptionsModal: React.FC<OptionsModalProps> = ({
  preferences,
  isOpen,
  onClose,
  onChangeDrawCount,
  onToggleHaptic,
  onToggleAnimations,
}) => {
  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 110,
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
        aria-labelledby="options-title"
        style={{
          backgroundColor: '#1b4d29',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '12px',
          padding: '1.5rem',
          maxWidth: '380px',
          width: '100%',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          color: 'var(--felt-text)',
          boxSizing: 'border-box',
        }}
      >
        {/* En-tête */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.2rem',
          }}
        >
          <h2 id="options-title" style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>
            Options ⚙️
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer les options"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--felt-text-muted)',
              fontSize: '1.3rem',
              cursor: 'pointer',
              padding: '0.2rem 0.5rem',
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* Liste des options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {/* 1. Mode de pioche */}
          <div
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.25)',
              padding: '0.9rem',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.3rem' }}>
              Mode de pioche
            </div>
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--felt-text-muted)',
                marginBottom: '0.6rem',
              }}
            >
              Changer de mode démarre une nouvelle partie.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => onChangeDrawCount(1)}
                style={{
                  minHeight: '40px',
                  padding: '0.4rem',
                  backgroundColor:
                    preferences.drawCount === 1
                      ? 'var(--highlight-color)'
                      : 'rgba(255, 255, 255, 0.1)',
                  color: preferences.drawCount === 1 ? '#111' : 'var(--felt-text)',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                1 carte
              </button>
              <button
                type="button"
                onClick={() => onChangeDrawCount(3)}
                style={{
                  minHeight: '40px',
                  padding: '0.4rem',
                  backgroundColor:
                    preferences.drawCount === 3
                      ? 'var(--highlight-color)'
                      : 'rgba(255, 255, 255, 0.1)',
                  color: preferences.drawCount === 3 ? '#111' : 'var(--felt-text)',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                3 cartes
              </button>
            </div>
          </div>

          {/* 2. Retour haptique */}
          <div
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.25)',
              padding: '0.9rem',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.8rem',
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Retour haptique 📳</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--felt-text-muted)', marginTop: '0.2rem' }}>
                Vibrations subtiles lors des coups (mobile)
              </div>
            </div>
            <button
              type="button"
              onClick={onToggleHaptic}
              style={{
                minHeight: '36px',
                minWidth: '70px',
                padding: '0.4rem 0.8rem',
                backgroundColor: preferences.hapticFeedback
                  ? 'var(--highlight-color)'
                  : 'rgba(255, 255, 255, 0.15)',
                color: preferences.hapticFeedback ? '#111' : 'var(--felt-text)',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              {preferences.hapticFeedback ? 'Oui' : 'Non'}
            </button>
          </div>

          {/* 3. Animations & transitions */}
          <div
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.25)',
              padding: '0.9rem',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.8rem',
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Transitions fluides ✨</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--felt-text-muted)', marginTop: '0.2rem' }}>
                Animations GPU de déplacement des cartes
              </div>
            </div>
            <button
              type="button"
              onClick={onToggleAnimations}
              style={{
                minHeight: '36px',
                minWidth: '70px',
                padding: '0.4rem 0.8rem',
                backgroundColor: !preferences.disableAnimations
                  ? 'var(--highlight-color)'
                  : 'rgba(255, 255, 255, 0.15)',
                color: !preferences.disableAnimations ? '#111' : 'var(--felt-text)',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              {!preferences.disableAnimations ? 'Oui' : 'Non'}
            </button>
          </div>
        </div>

        {/* Bouton Fermer */}
        <div style={{ marginTop: '1.4rem' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: '100%',
              minHeight: '44px',
              padding: '0.7rem',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              color: 'var(--felt-text)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.95rem',
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

