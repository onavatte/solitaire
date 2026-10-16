import React from 'react'

interface HeaderProps {
  moves: number
  elapsedMs: number
}

export const Header: React.FC<HeaderProps> = ({ moves, elapsedMs }) => {
  const totalSeconds = Math.floor(elapsedMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
        padding: 'calc(0.4rem + env(safe-area-inset-top, 0px)) 1rem 0.2rem',
        fontSize: '0.85rem',
        fontWeight: 600,
        color: 'var(--felt-text)',
        fontVariantNumeric: 'tabular-nums',
        userSelect: 'none',
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <span style={{ color: 'var(--felt-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Temps
        </span>
        <span style={{ fontWeight: 700 }}>{formattedTime}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <span style={{ color: 'var(--felt-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Coups
        </span>
        <span style={{ fontWeight: 700 }}>{moves}</span>
      </div>
    </header>
  )
}

