import { getThemeColor } from '../utils/themes.js'
import { THEMES } from '../utils/themes.js'

export function drawWaveform(ctx, width, height, timeData, theme, sensitivity) {
  const themeData = THEMES[theme]
  const sliceWidth = width / timeData.length
  const centerY = height / 2

  // Draw multiple layered waves for depth
  for (let layer = 2; layer >= 0; layer--) {
    const alpha = layer === 0 ? 1.0 : layer === 1 ? 0.4 : 0.15
    const scale = 1 + layer * 0.3
    const offset = layer * 2

    ctx.beginPath()
    ctx.lineWidth = layer === 0 ? 2.5 : layer === 1 ? 1.5 : 1

    for (let i = 0; i < timeData.length; i++) {
      const v = ((timeData[i] / 128.0) - 1.0) * sensitivity * scale
      const y = centerY + v * (height * 0.4)
      const x = i * sliceWidth

      const color = getThemeColor(theme, i, timeData.length)

      if (i === 0) {
        ctx.moveTo(x, y + offset)
      } else {
        ctx.lineTo(x, y + offset)
      }
    }

    const mainColor = getThemeColor(theme, 0, 1)
    ctx.strokeStyle = mainColor.replace('rgb', 'rgba').replace(')', `, ${alpha})`)

    if (themeData.glow && layer === 0) {
      ctx.shadowColor = mainColor
      ctx.shadowBlur = 20
    }

    ctx.stroke()
    ctx.shadowBlur = 0
  }

  // Gradient fill under main wave
  ctx.beginPath()
  for (let i = 0; i < timeData.length; i++) {
    const v = ((timeData[i] / 128.0) - 1.0) * sensitivity
    const y = centerY + v * (height * 0.4)
    const x = i * sliceWidth
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.lineTo(width, height)
  ctx.lineTo(0, height)
  ctx.closePath()

  const fillGradient = ctx.createLinearGradient(0, centerY - height * 0.3, 0, height)
  const baseColor = getThemeColor(theme, 0, 1)
  fillGradient.addColorStop(0, baseColor.replace('rgb', 'rgba').replace(')', ', 0.15)'))
  fillGradient.addColorStop(1, 'transparent')
  ctx.fillStyle = fillGradient
  ctx.fill()
}
