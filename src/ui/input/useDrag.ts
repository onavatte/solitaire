import { useCallback, useRef, useState } from 'react'
import type { Card, Location } from '../../engine'

export interface DraggedSequence {
  from: Location
  cards: readonly Card[]
  originPos: { x: number; y: number }
  currentPos: { x: number; y: number }
  grabOffset: { x: number; y: number }
  width: number
}

interface UseDragOptions {
  onDrop: (from: Location, to: Location) => void
  onTap: (location: Location) => void
  onDoubleTap?: (location: Location) => void
  canDragCard?: (location: Location) => boolean
}

function isSameLocation(a: Location, b: Location): boolean {
  if (a.zone !== b.zone) return false
  if (a.zone === 'tableau' && b.zone === 'tableau') {
    return a.column === b.column && a.cardIndex === b.cardIndex
  }
  if (a.zone === 'foundation' && b.zone === 'foundation') {
    return a.foundationIndex === b.foundationIndex
  }
  return true
}

export function useDrag({ onDrop, onTap, onDoubleTap, canDragCard }: UseDragOptions) {
  const [dragged, setDragged] = useState<DraggedSequence | null>(null)
  const isDraggingRef = useRef(false)
  const startPosRef = useRef({ x: 0, y: 0 })
  const pendingSequenceRef = useRef<Omit<DraggedSequence, 'currentPos'> | null>(null)
  const lastTapRef = useRef<{ location: Location; time: number } | null>(null)

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, from: Location, cards: readonly Card[]) => {
      // Uniquement bouton gauche ou touch
      if (e.button !== 0) return

      if (canDragCard && !canDragCard(from)) {
        return
      }

      const rect = e.currentTarget.getBoundingClientRect()
      const grabOffset = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }

      startPosRef.current = { x: e.clientX, y: e.clientY }
      isDraggingRef.current = false

      pendingSequenceRef.current = {
        from,
        cards,
        originPos: { x: rect.left, y: rect.top },
        grabOffset,
        width: rect.width,
      }

      // Capture globale des mouvements du pointeur
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    },
    [canDragCard],
  )

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!pendingSequenceRef.current) return

    const dx = e.clientX - startPosRef.current.x
    const dy = e.clientY - startPosRef.current.y
    const distance = Math.hypot(dx, dy)

    // Seuil de déclenchement du glisser-déposer (6 pixels)
    if (!isDraggingRef.current && distance > 6) {
      isDraggingRef.current = true
    }

    if (isDraggingRef.current) {
      setDragged({
        ...pendingSequenceRef.current,
        currentPos: { x: e.clientX, y: e.clientY },
      })
    }
  }, [])

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!pendingSequenceRef.current) return

      const wasDragging = isDraggingRef.current
      const from = pendingSequenceRef.current.from

      if (wasDragging) {
        // Recherche de la zone de drop sous le curseur
        const dropTarget = document
          .elementFromPoint(e.clientX, e.clientY)
          ?.closest<HTMLElement>('[data-drop-zone]')

        if (dropTarget) {
          const zone = dropTarget.dataset.dropZone
          if (zone === 'tableau') {
            const col = Number.parseInt(dropTarget.dataset.dropCol ?? '', 10)
            if (!Number.isNaN(col)) {
              onDrop(from, { zone: 'tableau', column: col })
            }
          } else if (zone === 'foundation') {
            const fIndex = Number.parseInt(dropTarget.dataset.dropFoundation ?? '', 10)
            if (!Number.isNaN(fIndex)) {
              onDrop(from, { zone: 'foundation', foundationIndex: fIndex })
            }
          }
        }
      } else {
        // Clic ou tap sans mouvement
        const now = Date.now()
        const lastTap = lastTapRef.current

        if (
          onDoubleTap &&
          lastTap &&
          now - lastTap.time < 350 &&
          isSameLocation(lastTap.location, from)
        ) {
          // Double-clic / double-tap confirmé !
          lastTapRef.current = null
          onDoubleTap(from)
        } else {
          lastTapRef.current = { location: from, time: now }
          onTap(from)
        }
      }

      // Nettoyage
      try {
        if ((e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) {
          (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
        }
      } catch {
        // Ignorer si la capture était déjà relâchée
      }

      pendingSequenceRef.current = null
      isDraggingRef.current = false
      setDragged(null)
    },
    [onDrop, onTap, onDoubleTap],
  )

  const handlePointerCancel = useCallback(() => {
    pendingSequenceRef.current = null
    isDraggingRef.current = false
    setDragged(null)
  }, [])

  return {
    dragged,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
  }
}
