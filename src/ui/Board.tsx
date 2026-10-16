import React from 'react'
import type { GameState, Location } from '../engine'
import { CardView } from './CardView'
import { DragOverlay } from './DragOverlay'
import { Slot } from './Slot'
import { useDrag } from './input/useDrag'
import { useFlipAnimation } from './useFlipAnimation'

interface BoardProps {
  state: GameState
  onStockClick: () => void
  onWasteClick?: () => void
  onWasteDoubleClick?: () => void
  onFoundationClick?: (foundationIndex: number) => void
  onTableauCardClick?: (column: number, cardIndex: number) => void
  onTableauCardDoubleClick?: (column: number, cardIndex: number) => void
  onTableauEmptyClick?: (column: number) => void
  onDropMove?: (from: Location, to: Location) => void
  canDragCard?: (from: Location) => boolean
  highlightStock?: boolean
  highlightWaste?: boolean
  highlightFoundationIndex?: number | null
  highlightTableau?: { column: number; cardIndex: number } | null
  selectedLocation?:
    | { readonly zone: 'waste' }
    | { readonly zone: 'tableau'; readonly column: number; readonly cardIndex?: number }
    | null
}

export const Board: React.FC<BoardProps> = ({
  state,
  onStockClick,
  onWasteClick,
  onWasteDoubleClick,
  onFoundationClick,
  onTableauCardClick,
  onTableauCardDoubleClick,
  onTableauEmptyClick,
  onDropMove,
  canDragCard,
  highlightStock,
  highlightWaste,
  highlightFoundationIndex,
  highlightTableau,
  selectedLocation,
}) => {
  const {
    dragged,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
  } = useDrag({
    onDrop: (from, to) => {
      onDropMove?.(from, to)
    },
    onTap: (loc) => {
      if (loc.zone === 'waste') {
        onWasteClick?.()
      } else if (loc.zone === 'tableau') {
        onTableauCardClick?.(loc.column, loc.cardIndex ?? 0)
      } else if (loc.zone === 'foundation') {
        onFoundationClick?.(loc.foundationIndex)
      }
    },
    onDoubleTap: (loc) => {
      if (loc.zone === 'waste') {
        onWasteDoubleClick?.()
      } else if (loc.zone === 'tableau') {
        onTableauCardDoubleClick?.(loc.column, loc.cardIndex ?? 0)
      }
    },
    canDragCard,
  })

  const boardRef = useFlipAnimation(state.moves, { disabled: Boolean(dragged) })

  // Vérifie si une carte fait partie de la séquence en cours de glissement
  const isCardDragged = (loc: Location): boolean => {
    if (!dragged) return false
    if (dragged.from.zone !== loc.zone) return false
    if (loc.zone === 'waste') return true
    if (loc.zone === 'foundation' && 'foundationIndex' in dragged.from) {
      return dragged.from.foundationIndex === loc.foundationIndex
    }
    if (loc.zone === 'tableau' && 'column' in dragged.from && 'column' in loc) {
      if (dragged.from.column !== loc.column) return false
      const fromIndex = dragged.from.cardIndex ?? 0
      const targetIndex = loc.cardIndex ?? 0
      return targetIndex >= fromIndex
    }
    return false
  }

  return (
    <main
      ref={boardRef as React.RefObject<HTMLElement>}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 'clamp(8px, 1.8vh, 16px)',
        paddingTop: 'calc(0.5rem + env(safe-area-inset-top, 0px))',
        paddingLeft: 'var(--board-gap)',
        paddingRight: 'var(--board-gap)',
        paddingBottom: '0.5rem',
        maxWidth: '720px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Rangée supérieure (ergonomie droitier) : 4 Fondations (0..3), Espace (4), Défausse (5), Pioche (6) */}
      <section
        aria-label="Zone supérieure : fondations, défausse et pioche"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 'var(--board-gap)',
          width: '100%',
        }}
      >
        {/* Colonnes 0, 1, 2, 3 : Fondations (cibles de drop) */}
        {state.foundations.map((foundation, index) => {
          const topCard = foundation[foundation.length - 1]
          const underCard = foundation.length >= 2 ? foundation[foundation.length - 2] : null
          return (
            <div
              key={`foundation-${index}`}
              data-drop-zone="foundation"
              data-drop-foundation={index}
              style={{ position: 'relative', height: '100%' }}
            >
              <Slot
                label="A"
                onClick={() => onFoundationClick?.(index)}
                highlight={highlightFoundationIndex === index}
              >
                {/* Carte sous-jacente conservée visible pendant le vol d'arrivée de topCard */}
                {underCard && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      zIndex: 1,
                      pointerEvents: 'none',
                    }}
                  >
                    <CardView card={underCard} />
                  </div>
                )}

                {topCard && (
                  <div
                    data-card-id={topCard.id}
                    onPointerDown={(e) =>
                      handlePointerDown(
                        e,
                        { zone: 'foundation', foundationIndex: index },
                        [topCard],
                      )
                    }
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerCancel}
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '100%',
                      zIndex: 2,
                      opacity: isCardDragged({ zone: 'foundation', foundationIndex: index })
                        ? 0.2
                        : 1,
                      touchAction: 'none',
                    }}
                  >
                    <CardView
                      card={topCard}
                      isHighlighted={highlightFoundationIndex === index}
                    />
                  </div>
                )}
              </Slot>
            </div>
          )
        })}

        {/* Colonne 4 : Espace vide séparateur */}
        <div aria-hidden="true" />

        {/* Colonne 5 : Défausse / Waste (avec éventail horizontal vers la gauche) */}
        <div style={{ position: 'relative' }}>
          <Slot highlight={highlightWaste}>
            {state.waste.length > 0 && (() => {
              const maxVisible = state.drawCount === 3 ? 3 : 1
              const count = Math.min(state.waste.length, maxVisible)
              const visibleCards = state.waste.slice(-count)
              // Carte sous-jacente pour éviter tout vide visuel pendant l'arrivée d'une carte
              const underWaste =
                state.waste.length > count
                  ? state.waste[state.waste.length - count - 1]
                  : null

              return (
                <>
                  {underWaste && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 1,
                        pointerEvents: 'none',
                      }}
                    >
                      <CardView card={underWaste} />
                    </div>
                  )}

                  {visibleCards.map((card, idx) => {
                    const offsetIndex = idx - (visibleCards.length - 1)
                    const isTop = idx === visibleCards.length - 1

                    if (isTop) {
                      return (
                        <div
                          key={card.id}
                          data-card-id={card.id}
                          onPointerDown={(e) =>
                            handlePointerDown(e, { zone: 'waste' }, [card])
                          }
                          onPointerMove={handlePointerMove}
                          onPointerUp={handlePointerUp}
                          onPointerCancel={handlePointerCancel}
                          style={{
                            position: 'absolute',
                            inset: 0,
                            zIndex: 10,
                            opacity: isCardDragged({ zone: 'waste' }) ? 0.2 : 1,
                            touchAction: 'none',
                          }}
                        >
                          <CardView
                            card={card}
                            isSelected={selectedLocation?.zone === 'waste'}
                            isHighlighted={highlightWaste}
                          />
                        </div>
                      )
                    }

                    // Cartes sous-jacentes visibles dépassant vers la gauche
                    return (
                      <div
                        key={card.id}
                        data-card-id={card.id}
                        style={{
                          position: 'absolute',
                          top: 0,
                          bottom: 0,
                          left: `calc(${offsetIndex} * clamp(14px, 3.2vw, 22px))`,
                          width: '100%',
                          zIndex: idx + 2,
                          pointerEvents: 'none',
                        }}
                      >
                        <CardView card={card} />
                      </div>
                    )
                  })}
                </>
              )
            })()}
          </Slot>
        </div>

        {/* Colonne 6 : Talon / Pioche (Stock, sous le pouce droit) */}
        <div style={{ position: 'relative' }}>
          <Slot
            label={state.stock.length > 0 ? undefined : '↺'}
            onClick={state.stock.length === 0 ? onStockClick : undefined}
            highlight={highlightStock}
          >
            {state.stock.length > 0 && (() => {
              const topStock = state.stock[state.stock.length - 1]
              const underStock =
                state.stock.length >= 2 ? state.stock[state.stock.length - 2] : null
              if (!topStock) return null
              return (
                <>
                  {underStock && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 1,
                        pointerEvents: 'none',
                      }}
                    >
                      <CardView card={underStock} />
                    </div>
                  )}
                  <div
                    data-card-id={topStock.id}
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '100%',
                      zIndex: 2,
                    }}
                  >
                    <CardView card={topStock} onClick={onStockClick} />
                  </div>
                </>
              )
            })()}
          </Slot>
        </div>
      </section>

      {/* Rangée inférieure : Les 7 colonnes du tableau (cibles de drop) */}
      <section
        aria-label="Tableau de jeu"
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 'var(--board-gap)',
          width: '100%',
        }}
      >
        {state.tableau.map((column, colIndex) => {
          return (
            <div
              key={`tableau-col-${colIndex}`}
              data-drop-zone="tableau"
              data-drop-col={colIndex}
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
              }}
            >
              {/* Emplacement vide (pour poser un Roi si la colonne est vide) */}
              <Slot
                label="R"
                onClick={() => onTableauEmptyClick?.(colIndex)}
              />

              {/* Cascade des cartes de la colonne */}
              {column.map((card, cardIndex) => {
                let topOffset = 0
                for (let i = 0; i < cardIndex; i++) {
                  const prevCard = column[i]
                  topOffset += prevCard?.faceUp ? 24 : 12
                }

                const cardLoc: Location = {
                  zone: 'tableau',
                  column: colIndex,
                  cardIndex,
                }

                const isCardSelected =
                  selectedLocation?.zone === 'tableau' &&
                  selectedLocation.column === colIndex &&
                  (selectedLocation.cardIndex === undefined
                    ? cardIndex === column.length - 1
                    : cardIndex >= selectedLocation.cardIndex)

                const isCardHighlighted =
                  highlightTableau?.column === colIndex &&
                  highlightTableau?.cardIndex === cardIndex

                const draggedThisCard = isCardDragged(cardLoc)
                const isTopRevealed =
                  card.faceUp && cardIndex === column.length - 1 && state.moves > 0

                return (
                  <div
                    key={card.id}
                    data-card-id={card.id}
                    data-base-z-index={cardIndex + 1}
                    className={isTopRevealed ? 'card-revealed' : undefined}
                    onPointerDown={
                      card.faceUp
                        ? (e) =>
                            handlePointerDown(
                              e,
                              cardLoc,
                              column.slice(cardIndex),
                            )
                        : undefined
                    }
                    onPointerMove={card.faceUp ? handlePointerMove : undefined}
                    onPointerUp={card.faceUp ? handlePointerUp : undefined}
                    onPointerCancel={card.faceUp ? handlePointerCancel : undefined}
                    style={{
                      position: 'absolute',
                      top: `${topOffset}px`,
                      left: 0,
                      right: 0,
                      zIndex: cardIndex + 1,
                      opacity: draggedThisCard ? 0.2 : 1,
                      touchAction: card.faceUp ? 'none' : 'auto',
                    }}
                  >
                    <CardView
                      card={card}
                      isSelected={isCardSelected}
                      isHighlighted={isCardHighlighted}
                    />
                  </div>
                )
              })}
            </div>
          )
        })}
      </section>

      {/* Rendu des cartes flottantes pendant le glissement */}
      <DragOverlay dragged={dragged} />
    </main>
  )
}
