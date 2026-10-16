import { useLayoutEffect, useRef } from 'react'

interface FlipOptions {
  readonly disabled?: boolean
  readonly duration?: number
}

/**
 * Hook d'animation FLIP (First, Last, Invert, Play) pour animer
 * de façon purement GPU (translate3d) les cartes se déplaçant entre colonnes,
 * pioche, défausse et fondations sans aucune bibliothèque externe.
 */
export function useFlipAnimation(
  dependency: unknown,
  options: FlipOptions = {},
) {
  const containerRef = useRef<HTMLElement | null>(null)
  const prevRectsRef = useRef<Map<string, DOMRect>>(new Map())

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return
    if (options.disabled) return

    // Respect strict de prefers-reduced-motion
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    const container = containerRef.current
    if (!container) return

    const cardElements = container.querySelectorAll<HTMLElement>('[data-card-id]')
    const currentRects = new Map<string, DOMRect>()
    const prevRects = prevRectsRef.current

    // Mesurer toutes les positions 'Last' du DOM
    cardElements.forEach((el) => {
      const id = el.dataset.cardId
      if (id) {
        currentRects.set(id, el.getBoundingClientRect())
      }
    })

    const duration = options.duration ?? 200

    // Pour chaque carte qui existait déjà, animer la transition de l'ancienne vers la nouvelle position
    cardElements.forEach((el) => {
      const id = el.dataset.cardId
      if (!id) return

      const prev = prevRects.get(id)
      const current = currentRects.get(id)

      if (prev && current) {
        const dx = prev.left - current.left
        const dy = prev.top - current.top

        // Seuil d'au moins 2px pour éviter le micro-jitter
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
          // Invert : déplacer instantanément l'élément à son ancienne position
          el.style.transform = `translate3d(${dx}px, ${dy}px, 0)`
          el.style.transition = 'none'
          el.style.zIndex = '500'

          // Play : animer vers (0, 0) au frame suivant
          requestAnimationFrame(() => {
            el.style.transition = `transform ${duration}ms cubic-bezier(0.2, 0.85, 0.25, 1)`
            el.style.transform = 'translate3d(0, 0, 0)'

            const cleanup = () => {
              el.style.transform = ''
              el.style.transition = ''
              el.style.zIndex = ''
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
  }, [dependency, options.disabled, options.duration])

  return containerRef
}

