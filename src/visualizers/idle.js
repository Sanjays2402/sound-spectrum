import { getThemeColor, getThemeColorRaw } from '../utils/themes.js'

const IDLE_PARTICLES = []
const IDLE_COUNT = 60

function initIdleParticles(width, height) {
  IDLE_PARTICLES.length = 0
  for (let i = 0; i < IDLE_COUNT; i++) {
    IDLE_PARTICLES.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: 1 + Math.random() * 3,
      phase: Math.random() * Math.PI * 2,
    })
  }
}

export function drawIdle(ctx, width, height, theme, time) {
  if (IDLE_PARTICLES.length === 0 || IDLE_PARTICLES.length !== IDLE_COUNT) {
    initIdleParticles(width, height)
  }

  const cx = width / 2
  const cy = height / 2

  // Slowly rotating rings
  for (let ring = 0; ring < 3; ring++) {
    const radius = 80 + ring * 60
    const dotCount = 30 + ring * 10
    const speed = (0.0003 + ring * 0.0001) * (ring % 2 === 0 ? 1 : -1)

    ctx.beginPath()
    for (let i = 0; i < dotCount; i++) {
      const angle = (i / dotCount) * Math.PI * 2 + time * speed
      const wobble = Math.sin(time * 0.001 + i * 0.5) * 10
      const x = cx + Math.cos(angle) * (radius + wobble)
      const y = cy + Math.sin(angle) * (radius + wobble)

      const alpha = 0.2 + Math.sin(time * 0.002 + i) * 0.15
      const color = getThemeColor(theme, i, dotCount)

      ctx.moveTo(x + 2, y)
      ctx.arc(x, y, 1.5 + Math.sin(time * 0.003 + i) * 0.5, 0, Math.PI * 2)
      ctx.fillStyle = color.replace('rgb', 'rgba').replace(')', `, ${alpha})`)
      ctx.fill()
      ctx.beginPath()
    }
  }

  // Floating particles
  for (let i = 0; i < IDLE_PARTICLES.length; i++) {
    const p = IDLE_PARTICLES[i]
    p.x += p.vx + Math.sin(time * 0.001 + p.phase) * 0.2
    p.y += p.vy + Math.cos(time * 0.001 + p.phase) * 0.2

    // Wrap around edges
    if (p.x < 0) p.x = width
    if (p.x > width) p.x = 0
    if (p.y < 0) p.y = height
    if (p.y > height) p.y = 0

    const alpha = 0.15 + Math.sin(time * 0.002 + p.phase) * 0.1
    const [r, g, b] = getThemeColorRaw(theme, i, IDLE_PARTICLES.length)

    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
    ctx.fill()
  }

  // Central pulsing orb
  const pulse = Math.sin(time * 0.001) * 0.3 + 0.7
  const orbRadius = 40 * pulse
  const orbGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, orbRadius)
  const [r, g, b] = getThemeColorRaw(theme, 0, 1)
  orbGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.15 * pulse})`)
  orbGrad.addColorStop(1, 'transparent')

  ctx.beginPath()
  ctx.arc(cx, cy, orbRadius, 0, Math.PI * 2)
  ctx.fillStyle = orbGrad
  ctx.fill()

  // Text hint
  ctx.fillStyle = `rgba(255, 255, 255, ${0.15 + Math.sin(time * 0.002) * 0.05})`
  ctx.font = '14px Inter, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('tap to start', cx, cy + orbRadius + 40)
}
