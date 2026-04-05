export const THEMES = {
  neon: {
    name: 'Neon',
    colors: ['#ff00ff', '#00ffff', '#ff0080', '#80ff00', '#8000ff'],
    bg: [0, 0, 0],
    glow: true,
  },
  sunset: {
    name: 'Sunset',
    colors: ['#ff6b35', '#f7c59f', '#ff3864', '#2e294e', '#ffd23f'],
    bg: [15, 5, 10],
    glow: true,
  },
  ocean: {
    name: 'Ocean',
    colors: ['#0077b6', '#00b4d8', '#90e0ef', '#caf0f8', '#023e8a'],
    bg: [2, 5, 15],
    glow: true,
  },
  monochrome: {
    name: 'Mono',
    colors: ['#ffffff', '#cccccc', '#999999', '#666666', '#e0e0e0'],
    bg: [0, 0, 0],
    glow: false,
  },
  rainbow: {
    name: 'Rainbow',
    colors: ['#ff0000', '#ff8800', '#ffff00', '#00ff00', '#0088ff', '#8800ff'],
    bg: [0, 0, 0],
    glow: true,
  },
}

export const THEME_KEYS = Object.keys(THEMES)

export function getThemeColor(theme, index, total) {
  const colors = THEMES[theme].colors
  const i = (index / total) * (colors.length - 1)
  const lo = Math.floor(i)
  const hi = Math.min(lo + 1, colors.length - 1)
  const t = i - lo
  return lerpColor(colors[lo], colors[hi], t)
}

export function getThemeColorRaw(theme, index, total) {
  const colors = THEMES[theme].colors
  const i = (index / total) * (colors.length - 1)
  const lo = Math.floor(i)
  const hi = Math.min(lo + 1, colors.length - 1)
  const t = i - lo
  return lerpColorRGB(colors[lo], colors[hi], t)
}

function hexToRGB(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return [r, g, b]
}

function lerpColorRGB(c1, c2, t) {
  const [r1, g1, b1] = hexToRGB(c1)
  const [r2, g2, b2] = hexToRGB(c2)
  return [
    Math.round(r1 + (r2 - r1) * t),
    Math.round(g1 + (g2 - g1) * t),
    Math.round(b1 + (b2 - b1) * t),
  ]
}

function lerpColor(c1, c2, t) {
  const [r, g, b] = lerpColorRGB(c1, c2, t)
  return `rgb(${r}, ${g}, ${b})`
}
