import { getThemeColor } from '../utils/themes.js'
import { THEMES } from '../utils/themes.js'

export function drawCircular(ctx, width, height, freqData, theme, sensitivity, time) {
  const cx = width / 2
  const cy = height / 2
  const baseRadius = Math.min(width, height) * 0.2
  const maxRadius = Math.min(width, height) * 0.42
  const themeData = THEMES[theme]
  const barCount = Math.min(180, freqData.length)

  // Outer ring glow
  const avgEnergy = freqData.reduce((a, b) => a + b, 0) / freqData.length / 255
  if (themeData.glow) {
    const glowColor = getThemeColor(theme, 0, 1)
    ctx.beginPath()
    ctx.arc(cx, cy, baseRadius + 5, 0, Math.PI * 2)
    ctx.strokeStyle = glowColor.replace('rgb', 'rgba').replace(')', `, ${avgEnergy * 0.5})`)
    ctx.lineWidth = 2
    ctx.shadowColor = glowColor
    ctx.shadowBlur = 30 * avgEnergy * sensitivity
    ctx.stroke()
    ctx.shadowBlur = 0
  }

  // Draw bars radiating outward
  for (let i = 0; i < barCount; i++) {
    const angle = (i / barCount) * Math.PI * 2 - Math.PI / 2 + time * 0.0002
    const value = (freqData[i % freqData.length] / 255) * sensitivity
    const barLength = value * (maxRadius - baseRadius)
    const color = getThemeColor(theme, i, barCount)

    const x1 = cx + Math.cos(angle) * baseRadius
    const y1 = cy + Math.sin(angle) * baseRadius
    const x2 = cx + Math.cos(angle) * (baseRadius + barLength)
    const y2 = cy + Math.sin(angle) * (baseRadius + barLength)

    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.strokeStyle = color
    ctx.lineWidth = Math.max(1.5, (Math.PI * 2 * baseRadius) / barCount * 0.6)
    ctx.lineCap = 'round'

    if (themeData.glow && value > 0.5) {
      ctx.shadowColor = color
      ctx.shadowBlur = 10 * value
    }

    ctx.stroke()
    ctx.shadowBlur = 0
  }

  // Inner circle with breathing effect
  const breathe = 1 + Math.sin(time * 0.002) * 0.05
  const innerRadius = baseRadius * 0.6 * breathe

  const innerGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, innerRadius)
  const centerColor = getThemeColor(theme, barCount / 2, barCount)
  innerGradient.addColorStop(0, centerColor.replace('rgb', 'rgba').replace(')', ', 0.3)'))
  innerGradient.addColorStop(1, 'transparent')

  ctx.beginPath()
  ctx.arc(cx, cy, innerRadius, 0, Math.PI * 2)
  ctx.fillStyle = innerGradient
  ctx.fill()

  // Mirror bars inward (smaller)
  for (let i = 0; i < barCount; i += 2) {
    const angle = (i / barCount) * Math.PI * 2 - Math.PI / 2 + time * 0.0002
    const value = (freqData[i % freqData.length] / 255) * sensitivity * 0.4
    const barLength = value * baseRadius * 0.5
    const color = getThemeColor(theme, i, barCount)

    const x1 = cx + Math.cos(angle) * (baseRadius * 0.95)
    const y1 = cy + Math.sin(angle) * (baseRadius * 0.95)
    const x2 = cx + Math.cos(angle) * (baseRadius * 0.95 - barLength)
    const y2 = cy + Math.sin(angle) * (baseRadius * 0.95 - barLength)

    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.strokeStyle = color.replace('rgb', 'rgba').replace(')', ', 0.5)')
    ctx.lineWidth = 1
    ctx.stroke()
  }
}
