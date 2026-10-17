import React, { useEffect, useRef } from 'react'

export type VictoryMode = 'fireworks-classic' | 'fireworks-comics' | 'confetti'

interface VictoryCelebrationProps {
  mode?: VictoryMode
  paused?: boolean
  onClose?: () => void
  style?: React.CSSProperties
}

// Couleurs classiques scintillantes
const CLASSIC_COLORS = [
  '#f59e0b', // Or étincelant
  '#ef4444', // Rouge rubis
  '#10b981', // Émeraude
  '#3b82f6', // Bleu roi
  '#ec4899', // Rose fuchsia
  '#a855f7', // Violet améthyste
  '#ffffff', // Blanc diamant
]

// Couleurs pop comics vives
const COMICS_COLORS = [
  '#facc15', // Jaune comics
  '#f43f5e', // Rouge pop
  '#06b6d4', // Cyan vif
  '#a3e635', // Vert lime
  '#ffffff', // Blanc franc
  '#fb923c', // Orange mandarine
]

const CONFETTI_COLORS = [
  '#f59e0b',
  '#ef4444',
  '#3b82f6',
  '#10b981',
  '#ec4899',
  '#ffffff',
]

// Particule pour feu d'artifice classique
interface SparkParticle {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  alpha: number
  decay: number
  size: number
}

// Particule pour feu d'artifice style Comics
interface ComicsSparkParticle {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  alpha: number
  decay: number
  size: number
  rotation: number
  rotationSpeed: number
  isStar: boolean
}

// Trace une étoile stylisée à 4 branches
function drawStar4(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
) {
  ctx.beginPath()
  for (let i = 0; i < 4; i++) {
    const outerAngle = (i * Math.PI) / 2
    const innerAngle = outerAngle + Math.PI / 4
    if (i === 0) {
      ctx.moveTo(cx + Math.cos(outerAngle) * outerRadius, cy + Math.sin(outerAngle) * outerRadius)
    } else {
      ctx.lineTo(cx + Math.cos(outerAngle) * outerRadius, cy + Math.sin(outerAngle) * outerRadius)
    }
    ctx.lineTo(cx + Math.cos(innerAngle) * innerRadius, cy + Math.sin(innerAngle) * innerRadius)
  }
  ctx.closePath()
  ctx.fill()
}

// Onde de choc circulaire Comics
interface Shockwave {
  x: number
  y: number
  radius: number
  maxRadius: number
  color: string
  alpha: number
}

// Fusée en montée
interface Rocket {
  x: number
  y: number
  vx: number
  vy: number
  targetY: number
  color: string
  trail: { x: number; y: number; alpha: number }[]
}

// Particule de confetti avec physique chaotique et asynchrone
interface ConfettiParticle {
  x: number
  y: number
  vx: number
  vy: number
  gravity: number
  maxVy: number
  width: number
  height: number
  color: string
  rotation: number
  rotationSpeed: number
  swing: number
  swingSpeed: number
  swingAmp: number
  drift: number
  flip: number
  flipSpeed: number
  flipAxis: 'x' | 'y'
  opacity: number
}



export const VictoryCelebration: React.FC<VictoryCelebrationProps> = ({
  mode = 'fireworks-classic',
  paused = false,
  onClose,
  style,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const pausedRef = useRef(paused)
  useEffect(() => {
    pausedRef.current = paused
  }, [paused])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) return

    let animationFrameId: number
    const dpr = Math.max(window.devicePixelRatio || 1, 1)

    const updateSize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.scale(dpr, dpr)
    }

    updateSize()

    const screenWidth = window.innerWidth
    const screenHeight = window.innerHeight

    // Collections d'éléments animés
    const rockets: Rocket[] = []
    const classicSparks: SparkParticle[] = []
    const comicsSparks: ComicsSparkParticle[] = []
    const shockwaves: Shockwave[] = []
    const confettiList: ConfettiParticle[] = []

    // Restriction de la zone horizontale à la largeur du plateau (720px max, centré)
    const boardWidth = Math.min(screenWidth, 720)
    const minX = (screenWidth - boardWidth) / 2 + 24
    const maxX = minX + boardWidth - 48

    let lastRocketTime = 0
    // Cadence soutenue pour un spectacle dense et festif
    const rocketInterval = mode === 'fireworks-comics' ? 330 : 280

    let lastConfettiTime = 0
    const confettiInterval = 3000

    // Lance une salve de 1 à 3 fusées synchronisées
    const launchSalvo = (now: number, count = 2) => {
      const colors = mode === 'fireworks-comics' ? COMICS_COLORS : CLASSIC_COLORS
      for (let i = 0; i < count; i++) {
        const x = minX + Math.random() * (maxX - minX)
        const targetY = screenHeight * 0.12 + Math.random() * (screenHeight * 0.42)
        const color = colors[Math.floor(Math.random() * colors.length)] ?? '#f59e0b'
        const speed = Math.random() * 4 + 11.5

        rockets.push({
          x,
          y: screenHeight,
          vx: (Math.random() - 0.5) * 2.4,
          vy: -speed,
          targetY,
          color,
          trail: [],
        })
      }
      lastRocketTime = now
    }

    // Explosion de fusée en feu d'artifice classique (ample, dense et scintillante)
    const explodeClassic = (x: number, y: number, color: string) => {
      const sparkCount = Math.floor(Math.random() * 25) + 65
      for (let i = 0; i < sparkCount; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = Math.random() * 2.5 + 3.0 // Vitesse harmonisée avec Comics
        classicSparks.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color,
          alpha: 1,
          decay: Math.random() * 0.010 + 0.008,
          size: Math.random() * 2.4 + 1.8,
        })
      }
    }

    // Explosion de fusée en feu d'artifice Comics (explosion large & étoiles pop)
    const explodeComics = (x: number, y: number, color: string) => {
      // Onde de choc plus large
      shockwaves.push({
        x,
        y,
        radius: 2,
        maxRadius: Math.random() * 30 + 70,
        color,
        alpha: 1,
      })

      // Étoiles et éclats pop s'étendant largement (couleur unie par bouquet)
      const sparkCount = Math.floor(Math.random() * 16) + 36
      for (let i = 0; i < sparkCount; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = Math.random() * 2.5 + 3.0 // Vitesse harmonisée

        comicsSparks.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color, // Même couleur unie pour tout le bouquet
          alpha: 1,
          decay: Math.random() * 0.010 + 0.008,
          size: Math.random() * 6 + 6,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.25,
          isStar: i % 2 === 0,
        })
      }
    }

    // Lance un gros panache unique de confettis en éventail harmonieux
    const launchSingleConfettiBurst = (total = 190) => {
      for (let i = 0; i < total; i++) {
        // Source : 0 = gauche, 1 = centre, 2 = droite du plateau
        const source = i % 3
        let x = minX
        let vx = (Math.random() - 0.3) * 6 // Éventail gauche : -1.8 à +4.2 (ouvert vers le haut)
        let vy = -(Math.random() * 8 + 18) // Impulsion haute : monte au-dessus du pop-up

        if (source === 1) {
          // Centre : grand éventail symétrique
          x = minX + (maxX - minX) * 0.5 + (Math.random() - 0.5) * 80
          vx = (Math.random() - 0.5) * 10 // -5.0 à +5.0
          vy = -(Math.random() * 8 + 20)
        } else if (source === 2) {
          // Droite : éventail droit : -4.2 à +1.8 (ouvert vers le haut)
          x = maxX
          vx = (Math.random() - 0.7) * 6
        }

        const width = Math.random() * 6 + 6
        const height = Math.random() * 10 + 6
        confettiList.push({
          x,
          y: screenHeight + Math.random() * 20,
          vx,
          vy,
          gravity: Math.random() * 0.07 + 0.06, // 0.06 à 0.13 (accélération propre)
          maxVy: Math.random() * 1.6 + 1.4, // 1.4 à 3.0 px/frame (vitesse terminale propre)
          width,
          height,
          color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)] ?? '#f59e0b',
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 8,
          swing: Math.random() * Math.PI * 2,
          swingSpeed: Math.random() * 0.04 + 0.03,
          swingAmp: Math.random() * 2.2 + 1.0, // 1.0 à 3.2 px d'amplitude
          drift: (Math.random() - 0.5) * 0.45, // micro-brise latérale
          flip: Math.random() * Math.PI * 2,
          flipSpeed: Math.random() * 0.09 + 0.04,
          flipAxis: Math.random() < 0.5 ? 'x' : 'y',
          opacity: 1,
        })
      }
    }

    // Démarrage immédiat selon le mode
    if (mode === 'confetti') {
      launchSingleConfettiBurst(190)
    } else if (mode.startsWith('fireworks')) {
      launchSalvo(0, 3)
    }

    let wasPaused = false

    // Boucle d'animation (60 FPS)
    const animate = (timestamp: number) => {
      if (pausedRef.current) {
        wasPaused = true
        animationFrameId = requestAnimationFrame(animate)
        return
      }

      if (wasPaused) {
        lastRocketTime = timestamp
        lastConfettiTime = timestamp
        wasPaused = false
      }

      // Efface toujours le canvas pour préserver la transparence sur le tapis feutrine
      ctx.clearRect(0, 0, screenWidth, screenHeight)

      // Déclenchement périodique de salves denses (2 à 3 fusées)
      if (mode.startsWith('fireworks') && timestamp - lastRocketTime > rocketInterval) {
        launchSalvo(timestamp, Math.random() < 0.45 ? 3 : 2)
      }

      // Relance périodique de confettis toutes les 3 secondes
      if (mode === 'confetti') {
        if (lastConfettiTime === 0) {
          lastConfettiTime = timestamp
        } else if (timestamp - lastConfettiTime > confettiInterval) {
          launchSingleConfettiBurst(190)
          lastConfettiTime = timestamp
        }
      }

      // --- 1. Animation des fusées montantes ---
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i]!
        r.x += r.vx
        r.y += r.vy
        r.vy += 0.08 // petite décélération

        // Traînée de la fusée
        r.trail.push({ x: r.x, y: r.y, alpha: 1 })
        if (r.trail.length > 7) r.trail.shift()

        // Dessine la traînée
        for (const pt of r.trail) {
          ctx.beginPath()
          ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2)
          ctx.fillStyle = r.color
          ctx.globalAlpha = pt.alpha
          ctx.fill()
          pt.alpha -= 0.14
        }
        ctx.globalAlpha = 1

        // Arrivée au point d'explosion
        if (r.y <= r.targetY || r.vy >= -1) {
          if (mode === 'fireworks-comics') {
            explodeComics(r.x, r.y, r.color)
          } else {
            explodeClassic(r.x, r.y, r.color)
          }
          rockets.splice(i, 1)
        }
      }

      // --- 2. Animation des étincelles classiques ---
      if (mode === 'fireworks-classic') {
        for (let i = classicSparks.length - 1; i >= 0; i--) {
          const sp = classicSparks[i]!
          sp.x += sp.vx
          sp.y += sp.vy
          sp.vx *= 0.975 // friction douce harmonisée
          sp.vy *= 0.975
          sp.vy += 0.04 // gravité douce
          sp.alpha -= sp.decay

          if (sp.alpha <= 0) {
            classicSparks.splice(i, 1)
            continue
          }

          ctx.beginPath()
          ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2)
          ctx.fillStyle = sp.color
          ctx.globalAlpha = sp.alpha
          ctx.shadowColor = sp.color
          ctx.shadowBlur = 6
          ctx.fill()
        }
        ctx.shadowColor = 'transparent'
        ctx.globalAlpha = 1
      }

      // --- 3. Animation des ondes de choc et étoiles Comics ---
      if (mode === 'fireworks-comics') {
        // Ondes de choc
        for (let i = shockwaves.length - 1; i >= 0; i--) {
          const sw = shockwaves[i]!
          sw.radius += 3.5
          sw.alpha -= 0.045

          if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
            shockwaves.splice(i, 1)
            continue
          }

          ctx.beginPath()
          ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2)
          ctx.strokeStyle = sw.color
          ctx.lineWidth = 3
          ctx.globalAlpha = sw.alpha
          ctx.stroke()
        }

        // Étoiles pop (qui planent doucement)
        for (let i = comicsSparks.length - 1; i >= 0; i--) {
          const sp = comicsSparks[i]!
          sp.x += sp.vx
          sp.y += sp.vy
          sp.vx *= 0.975 // expansion ample
          sp.vy *= 0.975
          sp.vy += 0.04 // gravité douce
          sp.rotation += sp.rotationSpeed
          sp.alpha -= sp.decay

          if (sp.alpha <= 0) {
            comicsSparks.splice(i, 1)
            continue
          }

          ctx.save()
          ctx.translate(sp.x, sp.y)
          ctx.rotate(sp.rotation)
          ctx.globalAlpha = sp.alpha
          ctx.fillStyle = sp.color
          ctx.strokeStyle = '#000000'
          ctx.lineWidth = 1.2

          if (sp.isStar) {
            drawStar4(ctx, 0, 0, sp.size, sp.size * 0.38)
            ctx.stroke()
          } else {
            // Losange pop
            ctx.beginPath()
            ctx.moveTo(0, -sp.size * 0.7)
            ctx.lineTo(sp.size * 0.5, 0)
            ctx.lineTo(0, sp.size * 0.7)
            ctx.lineTo(-sp.size * 0.5, 0)
            ctx.closePath()
            ctx.fill()
            ctx.stroke()
          }

          ctx.restore()
        }
        ctx.globalAlpha = 1
      }

      // --- 4. Animation des Confettis (retombée chaotique, organique et asynchrone) ---
      if (mode === 'confetti') {
        for (let i = confettiList.length - 1; i >= 0; i--) {
          const p = confettiList[i]!

          // Phase de montée : décélération naturelle
          if (p.vy < 0) {
            p.vy += 0.28
          } else {
            // Phase de descente : prise au vent et vitesse terminale propre à chaque confetti
            p.vy = Math.min(p.vy + p.gravity, p.maxVy)
          }

          // Balancement latéral organique avec double harmonique et micro-brise
          p.vx *= 0.985
          p.x += p.vx + p.drift + Math.sin(p.swing) * p.swingAmp + Math.sin(p.swing * 1.7) * (p.swingAmp * 0.35)
          p.y += p.vy
          p.rotation += p.rotationSpeed
          p.swing += p.swingSpeed
          p.flip += p.flipSpeed

          // Ne s'estompe que tout en bas de l'écran (sous le pop-up et le plateau)
          if (p.y > screenHeight * 0.94) {
            p.opacity = Math.max(0, p.opacity - 0.015)
          }

          // Nettoyage des confettis disparus
          if (p.opacity <= 0 || p.y > screenHeight + 40) {
            confettiList.splice(i, 1)
            continue
          }

          ctx.save()
          ctx.translate(p.x, p.y)
          ctx.rotate((p.rotation * Math.PI) / 180)

          // Culbute 3D asynchrone (axe X ou Y selon le confetti)
          const flipScale = Math.cos(p.flip)
          if (p.flipAxis === 'x') {
            ctx.scale(flipScale, 1)
          } else {
            ctx.scale(1, flipScale)
          }

          ctx.fillStyle = p.color
          ctx.globalAlpha = p.opacity
          ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height)
          ctx.restore()
        }
        ctx.globalAlpha = 1
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    animationFrameId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [mode])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 900,
        pointerEvents: onClose ? 'auto' : 'none',
        overflow: 'hidden',
        ...style,
      }}
      onClick={onClose}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
