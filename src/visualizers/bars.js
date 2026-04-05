import { getThemeColor } from '../utils/themes.js'
import { THEMES } from '../utils/themes.js'

export function drawBars(ctx, width, height, freqData, theme, sensitivity) {
  const barCount = Math.min(128, freqData.length)
  const barWidth = width / barCount
  const gap = Math.max(1, barWidth * 0.15)
  const themeData = THEMES[theme]

  for (let i = 0; i < barCount; i++) {
    const value = (freqData[i] / 255) * sensitivity
    const barHeight = value * height * 0.85
    const x = i * barWidth
    const color = getThemeColor(theme, i, barCount)

    // Mirror bars from bottom
    const gradient = ctx.createLinearGradient(x, height, x, height - barHeight)
    gradient.addColorStop(0, color)
    gradient.addColorStop(1, color.replace('rgb', 'rgba').replace(')', ', 0.3)'))

    ctx.fillStyle = gradient
    ctx.fillRect(x + gap / 2, height - barHeight, barWidth - gap, barHeight)

    // Glow effect
    if (themeData.glow && value > 0.4) {
      ctx.shadowColor = color
      ctx.shadowBlur = 15 * value
      ctx.fillRect(x + gap / 2, height - barHeight, barWidth - gap, 2)
      ctx.shadowBlur = 0
    }

    // Reflection (subtle)
    ctx.fillStyle = color.replace('rgb', 'rgba').replace(')', ', 0.08)')
    ctx.fillRect(x + gap / 2, height, barWidth - gap, barHeight * 0.2)
  }
}
