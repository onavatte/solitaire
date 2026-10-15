import React from 'react'

interface SlotProps {
  label?: string
  children?: React.ReactNode
  onClick?: () => void
  highlight?: boolean
}

export const Slot: React.FC<SlotProps> = ({ label, children, onClick, highlight }) => {
  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: 'var(--card-aspect-ratio)',
        backgroundColor: 'var(--slot-bg)',
        border: '1.5px dashed var(--slot-border)',
        borderRadius: 'var(--slot-radius)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: highlight ? 'var(--highlight-shadow)' : undefined,
        cursor: onClick ? 'pointer' : 'default',
        boxSizing: 'border-box',
      }}
    >
      {label && !children && (
        <span
          style={{
            color: 'rgba(255, 255, 255, 0.25)',
            fontSize: 'clamp(1rem, 3.5vw, 1.6rem)',
            fontWeight: 700,
            userSelect: 'none',
          }}
        >
          {label}
        </span>
      )}
      {children}
    </div>
  )
}

