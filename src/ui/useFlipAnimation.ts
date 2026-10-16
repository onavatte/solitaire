import { useLayoutEffect, useRef } from 'react'

interface FlipOptions {
  readonly disabled?: boolean
  readonly duration?: number
  readonly isManualDrop?: boolean
}

/**
 * Hook d'animation FLIP (First, Last, Invert, Play) pour animer
 * de façon purement GPU (translate3d) les cartes se déplaçant entre colonnes,
 * pioche, défausse et fondations sans aucune bibliothèque externe.
 */
export function useFlipAnimation(
  moves: number,
  options: FlipOptions = {},
) {
  const containerRef = useRef<HTMLElement | null>(null)
  const prevRectsRef = useRef<Map<string, DOMRect>>(new Map())
  const prevMovesRef = useRef<number>(moves)

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return
    if (options.disabled) return

    const container = containerRef.current
    if (!container) return

    const cardElements = container.querySelectorAll<HTMLElement>('[data-card-id]')
    const currentRects = new Map<string, DOMRect>()
    const prevRects = prevRectsRef.current
    const isNewGameOrInitial = moves === 0 || moves < prevMovesRef.current

    // Mesurer toutes les positions 'Last' du DOM
    cardElements.forEach((el) => {
      const id = el.dataset.cardId
      if (id) {
        currentRects.set(id, el.getBoundingClientRect())
      }
    })

    // Mémoriser le nombre de coups
    prevMovesRef.current = moves

    // Si c'est un drop manuel (la carte a déjà été glissée avec le doigt), on ne rejoue pas l'animation
    if (options.isManualDrop) {
      prevRectsRef.current = currentRects
      return
    }

    // Si c'est une nouvelle donne ou le chargement initial, on ne déclenche pas de transition FLIP
    if (isNewGameOrInitial) {
      prevRectsRef.current = currentRects
      return
    }

    // Respect strict de prefers-reduced-motion
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      prevRectsRef.current = currentRects
      return
    }

    const duration = options.duration ?? 200

    // Pour chaque carte qui a bougé, animer de l'ancienne vers la nouvelle position
    cardElements.forEach((el) => {
      const id = el.dataset.cardId
      if (!id) return

      const prev = prevRects.get(id)
      const current = currentRects.get(id)

      if (prev && current) {
        const dx = prev.left - current.left
        const dy = prev.top - current.top

        // Seuil d'au moins 2px pour filtrer le micro-jitter
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
          // Sauvegarder le z-index de base pour ne jamais le perdre
          const baseZIndex = el.dataset.baseZIndex ?? el.style.zIndex
          const numericBaseZ = parseInt(baseZIndex || '0', 10) || 0

          // Invert : replacer instantanément l'élément à son ancienne position
          el.style.transform = `translate3d(${dx}px, ${dy}px, 0)`
          el.style.transition = 'none'
          el.style.zIndex = String(500 + numericBaseZ)
          el.style.willChange = 'transform'

          // Forcer le reflow synchrone pour empêcher tout micro-flash de la carte à destination
          void el.offsetHeight

          // Play : animer vers (0, 0)
          requestAnimationFrame(() => {
            el.style.transition = `transform ${duration}ms cubic-bezier(0.2, 0.85, 0.25, 1)`
            el.style.transform = 'translate3d(0, 0, 0)'

            const cleanup = () => {
              el.style.transform = ''
              el.style.transition = ''
              el.style.willChange = ''
              // Restaurer le z-index exact d'origine
              el.style.zIndex = baseZIndex
              el.removeEventListener('transitionend', cleanup)
            }

            el.addEventListener('transitionend', cleanup, { once: true })
            setTimeout(cleanup, duration + 40)
          })
        }
      }
    })

    // Enregistrer les positions pour le prochain mouvement
    prevRectsRef.current = currentRects
  }, [moves, options.disabled, options.duration, options.isManualDrop])

  return containerRef
}
