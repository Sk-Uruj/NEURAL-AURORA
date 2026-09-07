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
// behind. Unique to this project — no ring-sampler or simple follow-dot.
export function NeuralCursor() {
  const shouldReduceMotion = useReducedMotion()
  const fine = useFinePointer()

  const canvasRef = useRef(null)
  const coreRef = useRef(null)
  const pivotRef = useRef(null)

  const mouse = useRef({ x: -100, y: -100 })
  const lastMouse = useRef({ x: -100, y: -100 })
  const history = useRef([])
  const sparks = useRef([])
  const angle = useRef(0)
  const raf = useRef(0)
  const lastInteractive = useRef(false)
  const interactiveAt = useRef(0)

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
      lastMouse.current = { x: e.clientX, y: e.clientY }

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

    const spawnSparks = (x, y, speed) => {
      const s = sparks.current
      if (s.length >= 260) return
      const dir = Math.atan2(y - lastMouse.current.y, x - lastMouse.current.x)
      const count = Math.min(2, Math.round(speed / 3) + 1)
      for (let i = 0; i < count; i++) {
        const a = dir + Math.PI + (Math.random() - 0.5) * 2.2
        const sp = 0.5 + Math.random() * 1.3
        s.push({
          x: x + (Math.random() - 0.5) * 4,
          y: y + (Math.random() - 0.5) * 4,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp * 0.7,
          life: 0.5 + Math.random() * 0.45,
          maxLife: 0.95,
          r: 1 + Math.random() * 1.7,
          color: SPARK_COLORS[(Math.random() * SPARK_COLORS.length) | 0],
        })
      }
    }

    const burst = (x, y) => {
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2 + (Math.random() - 0.5) * 0.4
        const sp = 1.4 + Math.random() * 2.4
        sparks.current.push({
          x,
          y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          life: 0.7 + Math.random() * 0.5,
          maxLife: 1.2,
          r: 1 + Math.random() * 2,
          color: SPARK_COLORS[(Math.random() * SPARK_COLORS.length) | 0],
        })
      }
    }

    const draw = () => {
      raf.current = requestAnimationFrame(draw)

      const { x, y } = mouse.current
      const moved = Math.hypot(x - lastMouse.current.x, y - lastMouse.current.y)

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

      const pts = history.current
      if (pts.length >= 2) {
        ctx.lineWidth = 1.2
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.18)'
        ctx.lineJoin = 'round'
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(pts[0].x, pts[0].y)
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y)
        ctx.stroke()
        ctx.strokeStyle = 'rgba(184, 41, 221, 0.10)'
        ctx.lineWidth = 3
        ctx.stroke()
      }

      if (moved > 0.42) spawnSparks(x, y, moved)
      lastMouse.current = { x, y }

      const s = sparks.current
      ctx.globalCompositeOperation = 'lighter'
      for (let i = s.length - 1; i >= 0; i--) {
        const p = s[i]
        p.life -= 1 / 60
        p.x += p.vx
        p.y += p.vy
        p.vx *= 0.92
        p.vy *= 0.92
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

      history.current.push({ x, y })
      if (history.current.length > 14) history.current.shift()

      angle.current += 0.055 + Math.min(moved * 0.006, 0.12)
      if (pivotRef.current) {
        pivotRef.current.style.transform = `rotate(${angle.current}rad)`
      }
      if (coreRef.current) {
        coreRef.current.style.transform =
          `translate(-50%, -50%) translate3d(${x}px, ${y}px, 0)`
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
            className="neural-cursor-electron neural-cursor-electron-a"
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
            }}
          />
          <span
            className="neural-cursor-electron neural-cursor-electron-b"
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
            }}
          />
        </div>
      </motion.div>

      <div
        ref={coreRef}
        className="neural-cursor-core"
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