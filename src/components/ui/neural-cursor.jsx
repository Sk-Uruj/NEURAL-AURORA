import { useEffect, useRef, useState } from 'react'
import { motion, useSpring, useReducedMotion } from 'framer-motion'

function useFinePointer() {
  const [fine, setFine] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine) and (hover: hover)')
    const update = () => setFine(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return fine
}

const SPARK_COLORS = ['#00f0ff', '#00f0ff', '#7fd8ff', '#b829dd', '#b829dd', '#f0c040']
const INTERACTIVE_SELECTOR =
  "a, button, [role='button'], input, select, textarea, label"

const CORE_SIZE = 12
const AURA_SIZE = 320
const ORBIT_SIZE = 56

// A "neural spark" cursor: an instant plasma core leaves a conductive spark
// trail (canvas) while two electrons orbit around it and a soft aura lags
// behind. Speed-reactive: fast flicks streak into a comet, slow motion drifts
// gravity-fed sparks, clicks ripple outward. Unique to this project.
export function NeuralCursor() {
  const shouldReduceMotion = useReducedMotion()
  const fine = useFinePointer()

  const canvasRef = useRef(null)
  const coreRef = useRef(null)
  const pivotRef = useRef(null)
  const auraRef = useRef(null)
  const electronARef = useRef(null)
  const electronBRef = useRef(null)

  const mouse = useRef({ x: -100, y: -100 })
  const lastMouse = useRef({ x: -100, y: -100 })
  const history = useRef([])
  const sparks = useRef([])
  const ripples = useRef([])
  const angle = useRef(0)
  const speed = useRef(0)
  const idleAccum = useRef(0)
  const raf = useRef(0)
  const lastInteractive = useRef(false)
  const interactiveAt = useRef(0)
  const electronARadius = useRef(16)
  const electronBRadius = useRef(24)
  const coreScale = useRef(1)
  const auraAlpha = useRef(0.25)

  const auraX = useSpring(0, { stiffness: 120, damping: 20, mass: 0.6 })
  const auraY = useSpring(0, { stiffness: 120, damping: 20, mass: 0.6 })
  const orbitX = useSpring(0, { stiffness: 1000, damping: 34, mass: 0.4 })
  const orbitY = useSpring(0, { stiffness: 1000, damping: 34, mass: 0.4 })
  const orbitScale = useSpring(1, { stiffness: 320, damping: 26 })

  useEffect(() => {
    if (!fine || shouldReduceMotion) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
    }
    resize()
    window.addEventListener('resize', resize)

    const onMove = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY }
      auraX.set(e.clientX - AURA_SIZE / 2)
      auraY.set(e.clientY - AURA_SIZE / 2)
      orbitX.set(e.clientX - ORBIT_SIZE / 2)
      orbitY.set(e.clientY - ORBIT_SIZE / 2)

      const now = performance.now()
      if (now - interactiveAt.current < 80) return
      interactiveAt.current = now
      const el = document.elementFromPoint(e.clientX, e.clientY)
      const isInt = !!(el && el.closest?.(INTERACTIVE_SELECTOR))
      if (isInt !== lastInteractive.current) {
        lastInteractive.current = isInt
        orbitScale.set(isInt ? 1.7 : 1)
      }
    }

    const makeSpark = (x, y, angleRad, spread, force, gravity) => ({
      x,
      y,
      vx: Math.cos(angleRad) * force + (Math.random() - 0.5) * spread,
      vy: Math.sin(angleRad) * force + (Math.random() - 0.5) * spread,
      gy: gravity,
      life: 0.5 + Math.random() * 0.45,
      maxLife: 0.95,
      r: 1 + Math.random() * 1.7,
      color: SPARK_COLORS[(Math.random() * SPARK_COLORS.length) | 0],
    })

    const spawnSparks = (x, y, dir, speedVal) => {
      const s = sparks.current
      if (s.length >= 280) return
      const count = Math.min(3, Math.round(speedVal / 13) + 1)
      for (let i = 0; i < count; i++) {
        const a = dir + Math.PI + (Math.random() - 0.5) * 2.2
        s.push(makeSpark(x + (Math.random() - 0.5) * 4, y + (Math.random() - 0.5) * 4, a, 1.4, 0.6 + Math.random() * 1.1, 0.1 + Math.random() * 0.12))
      }
    }

    const burst = (x, y) => {
      for (let i = 0; i < 18; i++) {
        const a = (i / 18) * Math.PI * 2 + (Math.random() - 0.5) * 0.4
        const force = 1.6 + Math.random() * 2.6
        sparks.current.push(makeSpark(x, y, a, 0.3, force, 0.04))
      }
      ripples.current.push({ x, y, r: 8, life: 1, maxLife: 0.65 })
    }

    const draw = () => {
      raf.current = requestAnimationFrame(draw)

      const { x, y } = mouse.current
      const moved = Math.hypot(x - lastMouse.current.x, y - lastMouse.current.y)
      const speedVal = moved * 60
      speed.current = speedVal
      lastMouse.current = { x, y }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

      const dir = moved > 0.2 ? Math.atan2(y - lastMouse.current.y, x - lastMouse.current.x) : 0

      // Comet streak on fast flicks
      if (speedVal > 26 && moved > 0.2) {
        const dist = Math.hypot(y - lastMouse.current.y, x - lastMouse.current.x)
        const trailLen = Math.min(dist * 3, 100)
        const gx = Math.cos(dir) * trailLen
        const gy = Math.sin(dir) * trailLen
        const grad = ctx.createLinearGradient(x, y, x - gx, y - gy)
        grad.addColorStop(0, 'rgba(0,240,255,0.45)')
        grad.addColorStop(0.45, 'rgba(184,41,221,0.16)')
        grad.addColorStop(1, 'rgba(0,240,255,0)')
        ctx.globalCompositeOperation = 'lighter'
        ctx.strokeStyle = grad
        ctx.lineWidth = 5
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x - gx, y - gy)
        ctx.stroke()
        ctx.globalCompositeOperation = 'source-over'
      }

      // Conductive trace
      const cap = 16 + Math.round(Math.min(speedVal / 9, 40))
      if (history.current.length >= 2) {
        const pts = history.current
        ctx.lineWidth = 1.2
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)'
        ctx.lineJoin = 'round'
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(pts[0].x, pts[0].y)
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y)
        ctx.stroke()
        ctx.strokeStyle = 'rgba(184, 41, 221, 0.11)'
        ctx.lineWidth = 3
        ctx.stroke()
      }

      // Click ripples
      const rp = ripples.current
      for (let i = rp.length - 1; i >= 0; i--) {
        const p = rp[i]
        p.life -= 1 / 60 / p.maxLife
        p.r += 4.6
        if (p.life <= 0) {
          rp.splice(i, 1)
          continue
        }
        ctx.strokeStyle = `rgba(0, 240, 255, ${Math.max(p.life, 0) * 0.7})`
        ctx.lineWidth = 1.5 + Math.max(p.life, 0) * 3
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.stroke()
        ctx.strokeStyle = `rgba(184, 41, 221, ${Math.max(p.life, 0) * 0.35})`
        ctx.lineWidth = 4 + Math.max(p.life, 0) * 4
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * 0.72, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Charge sparks (gravity-fed)
      const s = sparks.current
      ctx.globalCompositeOperation = 'lighter'
      for (let i = s.length - 1; i >= 0; i--) {
        const p = s[i]
        p.life -= 1 / 60
        p.vy += p.gy
        p.x += p.vx
        p.y += p.vy
        p.vx *= 0.94
        p.vy *= 0.94
        if (
          p.life <= 0 ||
          p.x < -24 ||
          p.x > window.innerWidth + 24 ||
          p.y < -24 ||
          p.y > window.innerHeight + 24
        ) {
          s.splice(i, 1)
          continue
        }
        const alpha = Math.max(p.life, 0) / p.maxLife
        ctx.globalAlpha = alpha * 0.95
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = alpha * 0.22
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * 2.8, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'

      if (moved > 0.42) spawnSparks(x, y, dir, speedVal)

      // Idle "neuron tick": occasional drifting spark while resting
      const dt = 1 / 60
      idleAccum.current += moved > 0.8 ? 0 : dt
      if (idleAccum.current > 1.6 && s.length < 10) {
        idleAccum.current = 0
        const a = Math.random() * Math.PI * 2
        const force = 0.15 + Math.random() * 0.35
        s.push(makeSpark(x, y, a, 0.2, force, 0.02))
      }

      history.current.push({ x, y })
      if (history.current.length > cap) history.current.shift()

      // Atom expand over interactive elements
      const intRadius = lastInteractive.current
      electronARadius.current += ((intRadius ? 26 : 16) - electronARadius.current) * 0.1
      electronBRadius.current += ((intRadius ? 30 : 24) - electronBRadius.current) * 0.1
      if (electronARef.current) {
        electronARef.current.style.transform = `translateX(${electronARadius.current}px)`
      }
      if (electronBRef.current) {
        electronBRef.current.style.transform = `translateX(-${electronBRadius.current}px)`
      }

      angle.current += (lastInteractive.current ? 0.11 : 0.055) + Math.min(speedVal * 0.006, 0.12)
      if (pivotRef.current) {
        pivotRef.current.style.transform = `rotate(${angle.current}rad)`
      }

      coreScale.current += ((intRadius ? 1.32 : 1) - coreScale.current) * 0.1
      if (coreRef.current) {
        coreRef.current.style.transform =
          `translate(-50%, -50%) translate3d(${x}px, ${y}px, 0) scale(${coreScale.current})`
      }

      auraAlpha.current += (Math.min(0.85, 0.25 + speedVal * 0.004) - auraAlpha.current) * 0.08
      if (auraRef.current) {
        auraRef.current.style.opacity = String(auraAlpha.current)
      }
    }

    const onMouseDown = () => burst(mouse.current.x, mouse.current.y)

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mousedown', onMouseDown)
    document.body.style.cursor = 'none'
    raf.current = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(raf.current)
      document.body.style.cursor = ''
    }
  }, [fine, shouldReduceMotion, auraX, auraY, orbitX, orbitY, orbitScale])

  if (!fine || shouldReduceMotion) return null

  return (
    <div
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 200000 }}
    >
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />

      <motion.div
        ref={auraRef}
        style={{
          x: auraX,
          y: auraY,
          width: AURA_SIZE,
          height: AURA_SIZE,
          position: 'absolute',
          top: 0,
          left: 0,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(0,240,255,0.05) 0%, rgba(184,41,221,0.04) 38%, transparent 70%)',
          mixBlendMode: 'screen',
          opacity: 0.25,
        }}
      />

      <motion.div
        style={{
          x: orbitX,
          y: orbitY,
          scale: orbitScale,
          width: ORBIT_SIZE,
          height: ORBIT_SIZE,
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        <div ref={pivotRef} style={{ position: 'absolute', inset: 0 }}>
          <span
            ref={electronARef}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 5,
              height: 5,
              marginLeft: -2.5,
              marginTop: -2.5,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 30%, #ffffff, #00f0ff 60%)',
              boxShadow: '0 0 8px rgba(0,240,255,0.95), 0 0 16px rgba(0,240,255,0.4)',
              transform: 'translateX(16px)',
              willChange: 'transform',
            }}
          />
          <span
            ref={electronBRef}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 4,
              height: 4,
              marginLeft: -2,
              marginTop: -2,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 30%, #ffffff, #f0c040 60%)',
              boxShadow: '0 0 8px rgba(240,192,64,0.95), 0 0 16px rgba(240,192,64,0.4)',
              transform: 'translateX(-24px)',
              willChange: 'transform',
            }}
          />
        </div>
      </motion.div>

      <div
        ref={coreRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: CORE_SIZE,
          height: CORE_SIZE,
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 38% 32%, #ffffff 0%, #bff8ff 34%, #00f0ff 62%, #06bfd8 100%)',
          boxShadow:
            '0 0 10px rgba(0,240,255,0.95), 0 0 24px rgba(0,240,255,0.5), 0 0 44px rgba(0,240,255,0.28)',
          willChange: 'transform',
        }}
      />
    </div>
  )
}