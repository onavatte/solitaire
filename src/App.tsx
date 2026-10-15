import { useState } from 'react'
import { useGame } from './state/useGame'
import { Board } from './ui/Board'
import { Toolbar } from './ui/Toolbar'
import { UpdatePrompt } from './ui/UpdatePrompt'

export default function App() {
  const [drawCount, setDrawCount] = useState<1 | 3>(1)
  const {
    game,
    canUndo,
    selectedLocation,
    activeHint,
    canAutocomplete,
    onStockClick,
    onSelectOrMove,
    onMoveCards,
    onQuickMoveToFoundation,
    onUndo,
    onHint,
    onNewGame,
    onAutocompleteStep,
  } = useGame({ drawCount })

  // Calcul des surbrillances pour l'indice visuel
  const highlightStock = activeHint?.type === 'draw'
  const highlightWaste =
    activeHint?.type === 'move' && activeHint.from.zone === 'waste'
  const highlightFoundationIndex =
    activeHint?.type === 'move' && activeHint.to.zone === 'foundation'
      ? activeHint.to.foundationIndex
      : null
  const highlightTableau =
    activeHint?.type === 'move' && activeHint.from.zone === 'tableau'
      ? {
          column: activeHint.from.column,
          cardIndex: activeHint.from.cardIndex ?? 0,
        }
      : null

  const handleStartNewGame = () => {
    onNewGame({ drawCount })
  }

  const handleToggleDrawCount = () => {
    const nextDrawCount: 1 | 3 = drawCount === 1 ? 3 : 1
    setDrawCount(nextDrawCount)
    onNewGame({ drawCount: nextDrawCount })
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        backgroundColor: 'var(--felt-bg)',
        backgroundImage: 'var(--felt-gradient)',
        color: 'var(--felt-text)',
      }}
    >
      {/* Plateau de jeu en 7 colonnes */}
      <Board
        state={game}
        onStockClick={onStockClick}
        onWasteClick={() => onSelectOrMove({ zone: 'waste' })}
        onWasteDoubleClick={() => onQuickMoveToFoundation({ zone: 'waste' })}
        onFoundationClick={(fIndex) => onSelectOrMove({ zone: 'foundation', foundationIndex: fIndex })}
        onTableauCardClick={(col, cardIndex) => {
          onSelectOrMove({ zone: 'tableau', column: col, cardIndex })
        }}
        onTableauCardDoubleClick={(col, cardIndex) => {
          onQuickMoveToFoundation({ zone: 'tableau', column: col, cardIndex })
        }}
        onTableauEmptyClick={(col) => onSelectOrMove({ zone: 'tableau', column: col })}
        onDropMove={onMoveCards}
        highlightStock={highlightStock}
        highlightWaste={highlightWaste}
        highlightFoundationIndex={highlightFoundationIndex}
        highlightTableau={highlightTableau}
        selectedLocation={
          selectedLocation?.zone === 'waste' || selectedLocation?.zone === 'tableau'
            ? selectedLocation
            : null
        }
      />

      {/* Bouton d'autocomplétion quand la victoire est assurée */}
      {canAutocomplete && game.status === 'playing' && (
        <div
          style={{
            position: 'fixed',
            bottom: '70px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 40,
          }}
        >
          <button
            type="button"
            onClick={onAutocompleteStep}
            style={{
              padding: '0.6rem 1.2rem',
              backgroundColor: 'var(--highlight-color)',
              color: '#111111',
              border: 'none',
              borderRadius: '20px',
              fontWeight: 700,
              fontSize: '0.95rem',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
              cursor: 'pointer',
              minHeight: '44px',
            }}
          >
            Terminer automatiquement ⚡
          </button>
        </div>
      )}

      {/* Bannière de victoire */}
      {game.status === 'won' && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            backdropFilter: 'blur(4px)',
            padding: '1rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              backgroundColor: '#1b4d29',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '360px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
            }}
          >
            <h2 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0' }}>Victoire ! 🏆</h2>
            <p style={{ margin: '0 0 1.5rem 0', color: 'var(--felt-text-muted)' }}>
              Bravo, vous avez résolu la donne en {game.moves} coups !
            </p>
            <button
              type="button"
              onClick={handleStartNewGame}
              style={{
                minHeight: '44px',
                padding: '0.75rem 1.5rem',
                backgroundColor: 'var(--highlight-color)',
                color: '#111111',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: 'pointer',
              }}
            >
              Rejouer une partie
            </button>
          </div>
        </div>
      )}

      {/* Barre d'outils mobile */}
      <Toolbar
        moves={game.moves}
        elapsedMs={game.elapsedMs}
        drawCount={drawCount}
        canUndo={canUndo}
        onUndo={onUndo}
        onHint={onHint}
        onNewGame={handleStartNewGame}
        onToggleDrawCount={handleToggleDrawCount}
      />

      {/* Notification de mise à jour PWA */}
      <UpdatePrompt />
    </div>
  )
}
