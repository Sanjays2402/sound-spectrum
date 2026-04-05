import { useRef, useEffect, useCallback } from 'react'
import { drawBars } from '../visualizers/bars.js'
import { drawWaveform } from '../visualizers/waveform.js'
import { drawCircular } from '../visualizers/circular.js'
import { drawParticles, resetParticles } from '../visualizers/particles.js'
import { drawIdle } from '../visualizers/idle.js'
import { THEMES } from '../utils/themes.js'

export default function Visualizer({ mode, theme, sensitivity, isActive, getFrequencyData, getTimeDomainData }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const prevModeRef = useRef(mode)

  const render = useCallback((timestamp) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const width = canvas.clientWidth
    const height = canvas.clientHeight

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)
    }

    // Background with subtle fade trail
    const [bgR, bgG, bgB] = THEMES[theme].bg
    ctx.fillStyle = `rgba(${bgR}, ${bgG}, ${bgB}, 0.25)`
    ctx.fillRect(0, 0, width, height)

    if (!isActive) {
      drawIdle(ctx, width, height, theme, timestamp)
      animRef.current = requestAnimationFrame(render)
      return
    }

    const freqData = getFrequencyData()
    const timeData = getTimeDomainData()

    if (!freqData || !timeData) {
      drawIdle(ctx, width, height, theme, timestamp)
      animRef.current = requestAnimationFrame(render)
      return
    }

    // Reset particles on mode change
    if (prevModeRef.current !== mode) {
      if (mode !== 'particles' && prevModeRef.current === 'particles') {
        resetParticles()
      }
      prevModeRef.current = mode
    }

    switch (mode) {
      case 'bars':
        drawBars(ctx, width, height, freqData, theme, sensitivity)
        break
      case 'waveform':
        drawWaveform(ctx, width, height, timeData, theme, sensitivity)
        break
      case 'circular':
        drawCircular(ctx, width, height, freqData, theme, sensitivity, timestamp)
        break
      case 'particles':
        drawParticles(ctx, width, height, freqData, theme, sensitivity, timestamp)
        break
      default:
        drawBars(ctx, width, height, freqData, theme, sensitivity)
    }

    animRef.current = requestAnimationFrame(render)
  }, [mode, theme, sensitivity, isActive, getFrequencyData, getTimeDomainData])

  useEffect(() => {
    // Clear canvas fully on theme change
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      const [bgR, bgG, bgB] = THEMES[theme].bg
      ctx.fillStyle = `rgb(${bgR}, ${bgG}, ${bgB})`
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
  }, [theme])

  useEffect(() => {
    animRef.current = requestAnimationFrame(render)
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [render])

  return (
    <canvas
      ref={canvasRef}
      id="visualizer-canvas"
      className="absolute inset-0 w-full h-full"
      style={{ display: 'block' }}
    />
  )
}
