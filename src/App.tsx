import { useCallback, useEffect, useState } from 'react'
import { findAutoMove, type DrawCount, type Location } from './engine'
import {
  loadPreferences,
  savePreferences,
  type AutoFoundationMode,
  type QuickMoveMode,
  type UserPreferences,
} from './state/persistence'
import { useGame } from './state/useGame'
import { AnimationLab } from './ui/AnimationLab'
import { Board } from './ui/Board'
import { Header } from './ui/Header'
import { OptionsModal } from './ui/OptionsModal'
import { StatsModal } from './ui/StatsModal'
import { Toolbar } from './ui/Toolbar'
import { UpdatePrompt } from './ui/UpdatePrompt'
import { VictoryCelebration, type VictoryMode } from './ui/VictoryCelebration'

const CELEBRATION_MODES: VictoryMode[] = ['fireworks-comics', 'fireworks-classic', 'confetti']

function getVictoryCelebrationMode(moves: number, elapsedMs: number): VictoryMode {
  // Calcul pur déterministe pour React Compiler : varie à chaque partie gagnée
  const hash = Math.abs((moves * 31 + Math.floor(elapsedMs / 1000)) % CELEBRATION_MODES.length)
  return CELEBRATION_MODES[hash] ?? 'fireworks-comics'
}

export default function App() {
  const [preferences, setPreferences] = useState<UserPreferences>(() => loadPreferences())
  const [isStatsOpen, setIsStatsOpen] = useState(false)
  const [isOptionsOpen, setIsOptionsOpen] = useState(false)
  const [isLabOpen, setIsLabOpen] = useState(
    () => typeof window !== 'undefined' && window.location.search.includes('lab'),
  )
  const [mockWon, setMockWon] = useState(false)
  const [dealId, setDealId] = useState(0)
  const [isDealing, setIsDealing] = useState(false)
  const [victoryCelebrationMode, setVictoryCelebrationMode] = useState<VictoryMode>('fireworks-comics')

  const handleDealComplete = useCallback(() => {
    setIsDealing(false)
  }, [])

  const {
    game,
    stats,
    canUndo,
    selectedLocation,
    activeHint,
    canAutocomplete,
    isAutocompleting,
    startAutocomplete,
    onStockClick,
    onSelectOrMove,
    onMoveCards,
    onQuickMoveToFoundation,
    onUndo,
    onHint,
    onNewGame,
    onResetStats,
  } = useGame(undefined, {
    autoFoundationMode: preferences.autoFoundationMode,
    isDealing,
  })

  const activeCelebrationMode: VictoryMode = mockWon
    ? victoryCelebrationMode
    : getVictoryCelebrationMode(game.moves, game.elapsedMs)

  const [isGameWonDelayed, setIsGameWonDelayed] = useState(false)

  // Temporisation à la victoire : laisse les 200ms de l'animation FLIP au dernier Roi pour atterrir
  useEffect(() => {
    if (game.status !== 'won') {
      return
    }
    const timer = setTimeout(() => {
      setIsGameWonDelayed(true)
    }, 350)
    return () => clearTimeout(timer)
  }, [game.status])

  const showVictoryOverlay = mockWon || (game.status === 'won' && isGameWonDelayed)

  const drawCount = preferences.drawCount

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
    setIsGameWonDelayed(false)
    setMockWon(false)
    setIsDealing(true)
    setDealId((prev) => prev + 1)
    onNewGame({ drawCount })
  }

  const handleChangeDrawCount = (nextCount: DrawCount) => {
    if (nextCount === preferences.drawCount) return
    savePreferences({ drawCount: nextCount })
    setPreferences((prev) => ({ ...prev, drawCount: nextCount }))
    setIsDealing(true)
    setDealId((prev) => prev + 1)
    onNewGame({ drawCount: nextCount })
  }

  const handleToggleAnimations = () => {
    const next = !preferences.disableAnimations
    savePreferences({ disableAnimations: next })
    setPreferences((prev) => ({ ...prev, disableAnimations: next }))
  }

  const handleChangeQuickMoveMode = (mode: QuickMoveMode) => {
    savePreferences({ quickMoveMode: mode })
    setPreferences((prev) => ({ ...prev, quickMoveMode: mode }))
  }

  const handleChangeAutoFoundationMode = (mode: AutoFoundationMode) => {
    savePreferences({ autoFoundationMode: mode })
    setPreferences((prev) => ({ ...prev, autoFoundationMode: mode }))
  }

  // Clic/Tap : coup rapide intelligent si single-tap, ou sélection classique
  const handleCardClickWithSmartMove = (location: Location) => {
    if (preferences.quickMoveMode === 'single-tap' && !selectedLocation) {
      const autoTarget = findAutoMove(game, location)
      if (autoTarget) {
        onMoveCards(location, autoTarget)
        return
      }
    }
    onSelectOrMove(location)
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
      {/* En-tête supérieur avec temps, score et coups */}
      <Header moves={game.moves} elapsedMs={game.elapsedMs} score={game.score} />

      {/* Plateau de jeu en 7 colonnes */}
      <Board
        state={game}
        dealId={dealId}
        onStockClick={onStockClick}
        onWasteClick={() => handleCardClickWithSmartMove({ zone: 'waste' })}
        onWasteDoubleClick={() => onQuickMoveToFoundation({ zone: 'waste' })}
        onFoundationClick={(fIndex) => onSelectOrMove({ zone: 'foundation', foundationIndex: fIndex })}
        onTableauCardClick={(col, cardIndex) => {
          handleCardClickWithSmartMove({ zone: 'tableau', column: col, cardIndex })
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
        disableAnimations={preferences.disableAnimations}
        onDealComplete={handleDealComplete}
        selectedLocation={
          selectedLocation?.zone === 'waste' || selectedLocation?.zone === 'tableau'
            ? selectedLocation
            : null
        }
      />

      {/* Bouton d'autocomplétion quand la victoire est assurée et que l'auto-déplacement est désactivé */}
      {canAutocomplete &&
        game.status === 'playing' &&
        preferences.autoFoundationMode === 'disabled' && (
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
            onClick={startAutocomplete}
            disabled={isAutocompleting}
            style={{
              padding: '0.6rem 1.2rem',
              backgroundColor: 'var(--highlight-color)',
              color: '#111111',
              border: 'none',
              borderRadius: '20px',
              fontWeight: 700,
              fontSize: '0.95rem',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
              cursor: isAutocompleting ? 'default' : 'pointer',
              opacity: isAutocompleting ? 0.75 : 1,
              minHeight: '44px',
            }}
          >
            {isAutocompleting ? 'Résolution en cours...' : 'Terminer automatiquement'}
          </button>
        </div>
      )}

      {/* Animation et Bannière de victoire */}
      {showVictoryOverlay && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 950,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            textAlign: 'center',
          }}
        >
          {/* 1. Voile sombre floutant le tapis de jeu en arrière-plan */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(3px)',
              WebkitBackdropFilter: 'blur(3px)',
              zIndex: 1,
            }}
          />

          {/* 2. Feux d'artifice nets et éclatants (au-dessus du flou) */}
          <VictoryCelebration
            mode={activeCelebrationMode}
            paused={isStatsOpen || isOptionsOpen}
            style={{ zIndex: 2 }}
          />

          {/* 3. Boîte de dialogue de victoire au premier plan */}
          <div
            style={{
              position: 'relative',
              zIndex: 3,
              backgroundColor: '#1b4d29',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '360px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
            }}
          >
            <h2 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0' }}>Victoire !</h2>
            <p style={{ margin: '0 0 1rem 0', color: 'var(--felt-text-muted)', lineHeight: 1.5 }}>
              Score : <strong style={{ color: 'var(--highlight-color)' }}>{game.score} points</strong>
              <br />
              Donne résolue en <strong>{game.moves} coups</strong>
              <br />
              Temps : <strong>{Math.floor(game.elapsedMs / 60000)} min {Math.floor((game.elapsedMs % 60000) / 1000)} s</strong>
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
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

              <button
                type="button"
                onClick={() => setIsStatsOpen(true)}
                style={{
                  minHeight: '44px',
                  padding: '0.6rem 1.2rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: 'var(--felt-text)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                }}
              >
                Voir mes statistiques
              </button>

              {mockWon && (
                <button
                  type="button"
                  onClick={() => {
                    setMockWon(false)
                    setIsLabOpen(true)
                  }}
                  style={{
                    minHeight: '44px',
                    padding: '0.65rem 1.2rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                  }}
                >
                  ← Revenir au Laboratoire
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Barre d'outils mobile */}
      <Toolbar
        canUndo={canUndo}
        onUndo={onUndo}
        onHint={onHint}
        onNewGame={handleStartNewGame}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenOptions={() => setIsOptionsOpen(true)}
      />

      {/* Modal des options */}
      <OptionsModal
        preferences={preferences}
        isOpen={isOptionsOpen}
        onClose={() => setIsOptionsOpen(false)}
        onChangeDrawCount={handleChangeDrawCount}
        onChangeQuickMoveMode={handleChangeQuickMoveMode}
        onChangeAutoFoundationMode={handleChangeAutoFoundationMode}
        onToggleAnimations={handleToggleAnimations}
        onOpenLab={() => setIsLabOpen(true)}
      />

      {/* Modal des statistiques */}
      <StatsModal
        stats={stats}
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        onReset={onResetStats}
      />

      {/* Laboratoire d'animations */}
      {isLabOpen && (
        <AnimationLab
          onClose={() => setIsLabOpen(false)}
          onTriggerVictory={(mode) => {
            setIsLabOpen(false)
            setVictoryCelebrationMode(mode)
            setMockWon(true)
          }}
          onTriggerDeal={() => {
            setIsLabOpen(false)
            handleStartNewGame()
          }}
        />
      )}

      {/* Notification de mise à jour PWA */}
      <UpdatePrompt />
    </div>
  )
}
