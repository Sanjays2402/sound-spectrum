import { getThemeColorRaw } from '../utils/themes.js'
import { THEMES } from '../utils/themes.js'

const MAX_PARTICLES = 500
let particles = []

class Particle {
  constructor(x, y, color, energy) {
    this.x = x
    this.y = y
    const angle = Math.random() * Math.PI * 2
    const speed = (1 + Math.random() * 4) * energy
    this.vx = Math.cos(angle) * speed
    this.vy = Math.sin(angle) * speed
    this.color = color
    this.life = 1.0
    this.decay = 0.008 + Math.random() * 0.02
    this.size = 2 + Math.random() * 4 * energy
    this.gravity = 0.02 + Math.random() * 0.03
  }

  update() {
    this.x += this.vx
    this.y += this.vy
    this.vy += this.gravity
    this.vx *= 0.99
    this.life -= this.decay
    this.size *= 0.997
  }

  draw(ctx, glow) {
    if (this.life <= 0) return
    const [r, g, b] = this.color
    const alpha = this.life * 0.8
    ctx.beginPath()
    ctx.arc(this.x, this.y, Math.max(0.5, this.size), 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`

    if (glow && this.life > 0.5) {
      ctx.shadowColor = `rgb(${r}, ${g}, ${b})`
      ctx.shadowBlur = 8 * this.life
    }

    ctx.fill()
    ctx.shadowBlur = 0
  }
}

export function drawParticles(ctx, width, height, freqData, theme, sensitivity, time) {
  const themeData = THEMES[theme]
  const cx = width / 2
  const cy = height / 2

  // Compute energy bands
  const bass = freqData.slice(0, 10).reduce((a, b) => a + b, 0) / (10 * 255)
  const mid = freqData.slice(10, 80).reduce((a, b) => a + b, 0) / (70 * 255)
  const high = freqData.slice(80, 200).reduce((a, b) => a + b, 0) / (120 * 255)
  const avgEnergy = (bass + mid + high) / 3 * sensitivity

  // Spawn particles on beats
  if (bass * sensitivity > 0.35) {
    const count = Math.floor(bass * sensitivity * 15)
    for (let i = 0; i < count && particles.length < MAX_PARTICLES; i++) {
      const colorIndex = Math.floor(Math.random() * freqData.length)
      const color = getThemeColorRaw(theme, colorIndex, freqData.length)
      particles.push(new Particle(
        cx + (Math.random() - 0.5) * 100,
        cy + (Math.random() - 0.5) * 100,
        color,
        bass * sensitivity
      ))
    }
  }

  // Spawn mid-frequency particles from edges
  if (mid * sensitivity > 0.25) {
    const count = Math.floor(mid * sensitivity * 8)
    for (let i = 0; i < count && particles.length < MAX_PARTICLES; i++) {
      const edge = Math.random()
      let x, y
      if (edge < 0.25) { x = 0; y = Math.random() * height }
      else if (edge < 0.5) { x = width; y = Math.random() * height }
      else if (edge < 0.75) { x = Math.random() * width; y = 0 }
      else { x = Math.random() * width; y = height }

      const color = getThemeColorRaw(theme, Math.floor(Math.random() * freqData.length), freqData.length)
      const p = new Particle(x, y, color, mid * sensitivity * 0.7)
      // Direct toward center
      const dx = cx - x
      const dy = cy - y
      const dist = Math.sqrt(dx * dx + dy * dy)
      p.vx = (dx / dist) * mid * sensitivity * 3
      p.vy = (dy / dist) * mid * sensitivity * 3
      p.gravity = 0
      particles.push(p)
    }
  }

  // Update and draw
  particles = particles.filter(p => p.life > 0)
  for (const p of particles) {
    p.update()
    p.draw(ctx, themeData.glow)
  }

  // Central energy orb
  const orbRadius = 30 + avgEnergy * 80
  const orbGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, orbRadius)
  const orbColor = getThemeColorRaw(theme, 0, 1)
  orbGradient.addColorStop(0, `rgba(${orbColor[0]}, ${orbColor[1]}, ${orbColor[2]}, ${0.3 * avgEnergy})`)
  orbGradient.addColorStop(0.5, `rgba(${orbColor[0]}, ${orbColor[1]}, ${orbColor[2]}, ${0.1 * avgEnergy})`)
  orbGradient.addColorStop(1, 'transparent')

  ctx.beginPath()
  ctx.arc(cx, cy, orbRadius, 0, Math.PI * 2)
  ctx.fillStyle = orbGradient
  ctx.fill()
}

export function resetParticles() {
  particles = []
}
