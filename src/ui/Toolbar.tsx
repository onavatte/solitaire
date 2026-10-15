import React from 'react'

interface ToolbarProps {
  moves: number
  elapsedMs: number
  drawCount: 1 | 3
  canUndo: boolean
  onUndo: () => void
  onHint: () => void
  onNewGame: () => void
  onToggleDrawCount: () => void
}

export const Toolbar: React.FC<ToolbarProps> = ({
  moves,
  elapsedMs,
  drawCount,
  canUndo,
  onUndo,
  onHint,
  onNewGame,
  onToggleDrawCount,
}) => {
  const totalSeconds = Math.floor(elapsedMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

  return (
    <footer
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.5rem 0.8rem calc(0.5rem + env(safe-area-inset-bottom, 0px))',
        backgroundColor: 'var(--toolbar-bg)',
        borderTop: '1px solid var(--toolbar-border)',
        backdropFilter: 'blur(8px)',
        zIndex: 50,
      }}
    >
      {/* Statistiques et mode de pioche */}
      <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', fontSize: '0.85rem', fontWeight: 500 }}>
        <div>
          <span style={{ color: 'var(--felt-text-muted)', marginRight: '0.2rem' }}>Temps</span>
          <span>{formattedTime}</span>
        </div>
        <div>
          <span style={{ color: 'var(--felt-text-muted)', marginRight: '0.2rem' }}>Coups</span>
          <span>{moves}</span>
        </div>
        <button
          type="button"
          onClick={onToggleDrawCount}
          title="Changer le mode de pioche (1 ou 3 cartes)"
          style={{
            minHeight: '36px',
            padding: '0.2rem 0.5rem',
            backgroundColor: 'var(--btn-bg)',
            color: 'var(--felt-text)',
            border: '1px solid var(--toolbar-border)',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {drawCount === 1 ? '1 carte' : '3 cartes'}
        </button>
      </div>

      {/* Boutons d'action tactiles (>= 44px) */}
      <div style={{ display: 'flex', gap: '0.4rem' }}>
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          style={{
            minHeight: '44px',
            minWidth: '44px',
            padding: '0.5rem 0.7rem',
            backgroundColor: canUndo ? 'var(--btn-bg)' : 'var(--btn-disabled)',
            color: canUndo ? 'var(--felt-text)' : 'var(--felt-text-muted)',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: canUndo ? 'pointer' : 'default',
            touchAction: 'manipulation',
          }}
        >
          Annuler
        </button>

        <button
          type="button"
          onClick={onHint}
          style={{
            minHeight: '44px',
            minWidth: '44px',
            padding: '0.5rem 0.7rem',
            backgroundColor: 'var(--btn-bg)',
            color: 'var(--felt-text)',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            touchAction: 'manipulation',
          }}
        >
          Indice
        </button>

        <button
          type="button"
          onClick={onNewGame}
          style={{
            minHeight: '44px',
            minWidth: '44px',
            padding: '0.5rem 0.7rem',
            backgroundColor: 'var(--btn-bg)',
            color: 'var(--felt-text)',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            touchAction: 'manipulation',
          }}
        >
          Nouvelle
        </button>
      </div>
    </footer>
  )
}
