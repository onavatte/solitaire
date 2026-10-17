import { useLayoutEffect, useRef } from 'react'

interface DealAnimationOptions {
  readonly disabled?: boolean
  readonly duration?: number // Durée de vol par carte en ms (ex: 220ms)
  readonly cardInterval?: number // Intervalle de décalage en ms (ex: 26ms)
  readonly onComplete?: () => void
}

/**
 * Calcule l'index séquentiel (0 à 27) d'une carte dans la distribution Klondike classique.
 * L'ordre se fait rangée par rangée, de gauche à droite sur les colonnes actives :
 * - Rangée 0 : col 0..6 (cartes 0..6)
 * - Rangée 1 : col 1..6 (cartes 7..12)
 * - Rangée 2 : col 2..6 (cartes 13..17)
 * - Rangée 3 : col 3..6 (cartes 18..21)
 * - Rangée 4 : col 4..6 (cartes 22..24)
 * - Rangée 5 : col 5..6 (cartes 25..26)
 * - Rangée 6 : col 6 (carte 27)
 */
export function getDealOrderIndex(colIndex: number, cardIndex: number): number {
  let offset = 0
  for (let r = 0; r < cardIndex; r++) {
    offset += 7 - r
  }
  return offset + (colIndex - cardIndex)
}

/**
 * Hook animant la distribution des 28 cartes du tableau depuis la pioche.
 * Purement GPU (translate3d, opacity), sans aucun re-render React.
 * Skippable instantanément dès que le joueur touche l'écran.
 */
export function useDealAnimation(
  dealId: number,
  containerRef: React.RefObject<HTMLElement | null>,
  options: DealAnimationOptions = {},
) {
  const { disabled, duration = 220, cardInterval = 26, onComplete } = options
  const isDealingRef = useRef(false)
  const cleanupFnsRef = useRef<(() => void)[]>([])

  useLayoutEffect(() => {
    if (dealId === 0) return
    if (typeof window === 'undefined') return
    if (disabled) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

    const container = containerRef.current
    if (!container) return

    // Emplacement de la pioche (point de départ de toutes les cartes)
    const stockEl = container.querySelector<HTMLElement>('[data-stock-pile="true"]')
    if (!stockEl) return

    const stockRect = stockEl.getBoundingClientRect()
    if (stockRect.width === 0 || stockRect.height === 0) return

    const cardElements = container.querySelectorAll<HTMLElement>('[data-tableau-card="true"]')
    if (cardElements.length === 0) return

    isDealingRef.current = true

    const interval = cardInterval

    // Nettoyer toute animation précédente si existante
    cleanupFnsRef.current.forEach((fn) => fn())
    cleanupFnsRef.current = []

    const cleanups: (() => void)[] = []

    cardElements.forEach((el) => {
      const col = parseInt(el.dataset.colIndex ?? '0', 10)
      const cardIdx = parseInt(el.dataset.cardIndex ?? '0', 10)
      const order = getDealOrderIndex(col, cardIdx)

      const cardRect = el.getBoundingClientRect()
      const dx = stockRect.left - cardRect.left
      const dy = stockRect.top - cardRect.top

      const baseZIndex = el.dataset.baseZIndex ?? el.style.zIndex

      // Invert initial : placer la carte sur la pioche avec opacité 0
      el.style.transform = `translate3d(${dx}px, ${dy}px, 0)`
      el.style.transition = 'none'
      el.style.opacity = '0'
      el.style.zIndex = String(50 + order)
      el.style.willChange = 'transform, opacity'

      const delay = order * interval

      const cleanup = () => {
        el.style.transform = ''
        el.style.transition = ''
        el.style.opacity = ''
        el.style.willChange = ''
        el.style.zIndex = baseZIndex
      }
      cleanups.push(cleanup)

      // Déclencher le vol fluide au moment de son délai
      const flyTimer = setTimeout(() => {
        el.style.opacity = '1'
        el.style.transition = `transform ${duration}ms cubic-bezier(0.2, 0.85, 0.25, 1), opacity 80ms ease`
        el.style.transform = 'translate3d(0, 0, 0)'

        const doneTimer = setTimeout(cleanup, duration + 30)
        cleanups.push(() => clearTimeout(doneTimer))
      }, delay)

      cleanups.push(() => clearTimeout(flyTimer))
    })

    const totalDuration = 28 * interval + duration + 60
    const endTimer = setTimeout(() => {
      isDealingRef.current = false
      onComplete?.()
    }, totalDuration)
    cleanups.push(() => clearTimeout(endTimer))

    cleanupFnsRef.current = cleanups

    // Skip immédiat si le joueur touche l'écran
    const handleSkip = () => {
      if (isDealingRef.current) {
        cleanupFnsRef.current.forEach((fn) => fn())
        cleanupFnsRef.current = []
        isDealingRef.current = false
        onComplete?.()
      }
    }

    container.addEventListener('pointerdown', handleSkip, { capture: true, once: true })

    return () => {
      container.removeEventListener('pointerdown', handleSkip, { capture: true })
      cleanupFnsRef.current.forEach((fn) => fn())
      cleanupFnsRef.current = []
      isDealingRef.current = false
    }
  }, [cardInterval, containerRef, dealId, disabled, duration, onComplete])
}

