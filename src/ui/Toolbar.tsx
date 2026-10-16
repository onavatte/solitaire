import React from 'react'

interface ToolbarProps {
  canUndo: boolean
  onUndo: () => void
  onHint: () => void
  onNewGame: () => void
  onOpenStats: () => void
  onOpenOptions: () => void
}

export const Toolbar: React.FC<ToolbarProps> = ({
  canUndo,
  onUndo,
  onHint,
  onNewGame,
  onOpenStats,
  onOpenOptions,
}) => {
  const itemStyle = (enabled = true): React.CSSProperties => ({
    flex: 1,
    minHeight: '48px',
    minWidth: '44px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2px',
    padding: '0.3rem 0.2rem',
    backgroundColor: enabled ? 'var(--btn-bg)' : 'transparent',
    color: enabled ? 'var(--felt-text)' : 'var(--btn-disabled)',
    border: 'none',
    borderRadius: '8px',
    cursor: enabled ? 'pointer' : 'default',
    touchAction: 'manipulation',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
  })

  const labelStyle: React.CSSProperties = {
    fontSize: '0.68rem',
    fontWeight: 600,
    letterSpacing: '0.01em',
    lineHeight: 1,
  }

  const iconStyle: React.CSSProperties = {
    fontSize: '1.25rem',
    lineHeight: 1,
  }

  return (
    <footer
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '0.3rem',
        alignItems: 'center',
        padding: '0.35rem 0.6rem calc(0.45rem + env(safe-area-inset-bottom, 0px))',
        backgroundColor: 'var(--toolbar-bg)',
        borderTop: '1px solid var(--toolbar-border)',
        backdropFilter: 'blur(8px)',
        zIndex: 50,
        flexShrink: 0,
        boxSizing: 'border-box',
        maxWidth: '720px',
        width: '100%',
        margin: '0 auto',
      }}
    >
      {/* 1. Options (à gauche) */}
      <button
        type="button"
        onClick={onOpenOptions}
        title="Ouvrir les options"
        aria-label="Options"
        style={itemStyle(true)}
      >
        <span style={iconStyle} aria-hidden="true">
          ⚙️
        </span>
        <span style={labelStyle}>Options</span>
      </button>

      {/* 2. Statistiques */}
      <button
        type="button"
        onClick={onOpenStats}
        title="Consulter les statistiques"
        aria-label="Statistiques"
        style={itemStyle(true)}
      >
        <span style={iconStyle} aria-hidden="true">
          📊
        </span>
        <span style={labelStyle}>Stats</span>
      </button>

      {/* 3. Nouvelle partie (au centre) */}
      <button
        type="button"
        onClick={onNewGame}
        title="Démarrer une nouvelle partie"
        aria-label="Nouvelle partie"
        style={itemStyle(true)}
      >
        <span style={iconStyle} aria-hidden="true">
          🃏
        </span>
        <span style={labelStyle}>Nouvelle</span>
      </button>

      {/* 4. Indice */}
      <button
        type="button"
        onClick={onHint}
        title="Obtenir un indice"
        aria-label="Indice"
        style={itemStyle(true)}
      >
        <span style={iconStyle} aria-hidden="true">
          💡
        </span>
        <span style={labelStyle}>Indice</span>
      </button>

      {/* 5. Annuler (à droite, sous le pouce) */}
      <button
        type="button"
        onClick={onUndo}
        disabled={!canUndo}
        title="Annuler le dernier coup"
        aria-label="Annuler"
        style={itemStyle(canUndo)}
      >
        <span style={iconStyle} aria-hidden="true">
          ↩
        </span>
        <span style={labelStyle}>Annuler</span>
      </button>
    </footer>
  )
}
