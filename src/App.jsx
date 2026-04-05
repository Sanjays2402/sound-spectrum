import { useState, useCallback, useEffect } from 'react'
import Visualizer from './components/Visualizer.jsx'
import Controls from './components/Controls.jsx'
import { useAudio } from './hooks/useAudio.js'

export default function App() {
  const [mode, setMode] = useState('bars')
  const [theme, setTheme] = useState('neon')
  const [sensitivity, setSensitivity] = useState(1.5)
  const [gain, setGain] = useState(1.0)

  const {
    isActive,
    error,
    start,
    stop,
    setGain: setAudioGain,
    getFrequencyData,
    getTimeDomainData,
  } = useAudio()

  const handleToggle = useCallback(async () => {
    if (isActive) {
      stop()
    } else {
      await start()
    }
  }, [isActive, start, stop])

  // Sync gain to audio node
  useEffect(() => {
    setAudioGain(gain)
  }, [gain, setAudioGain])

  const handleScreenshot = useCallback(() => {
    const canvas = document.getElementById('visualizer-canvas')
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `sound-spectrum-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }, [])

  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const modes = ['bars', 'waveform', 'circular', 'particles']
    const handler = (e) => {
      switch (e.key) {
        case ' ':
          e.preventDefault()
          handleToggle()
          break
        case 'f':
          handleFullscreen()
          break
        case 's':
          handleScreenshot()
          break
        case 'ArrowRight':
          setMode(prev => modes[(modes.indexOf(prev) + 1) % modes.length])
          break
        case 'ArrowLeft':
          setMode(prev => modes[(modes.indexOf(prev) - 1 + modes.length) % modes.length])
          break
        case 'ArrowUp':
          e.preventDefault()
          setSensitivity(prev => Math.min(3, prev + 0.1))
          break
        case 'ArrowDown':
          e.preventDefault()
          setSensitivity(prev => Math.max(0.5, prev - 0.1))
          break
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleToggle, handleFullscreen, handleScreenshot])

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      <Visualizer
        mode={mode}
        theme={theme}
        sensitivity={sensitivity}
        isActive={isActive}
        getFrequencyData={getFrequencyData}
        getTimeDomainData={getTimeDomainData}
      />

      <Controls
        mode={mode}
        setMode={setMode}
        theme={theme}
        setTheme={setTheme}
        sensitivity={sensitivity}
        setSensitivity={setSensitivity}
        gain={gain}
        setGain={setGain}
        isActive={isActive}
        onToggle={handleToggle}
        onScreenshot={handleScreenshot}
        onFullscreen={handleFullscreen}
      />

      {/* Error display */}
      {error && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-red-500/20 border border-red-500/30 text-red-300 text-sm px-4 py-2 rounded-xl backdrop-blur-sm animate-fade-in z-20">
          {error}
        </div>
      )}

      {/* Keyboard hint (desktop only) */}
      {!isActive && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/20 text-[11px] tracking-wider hidden md:block">
          SPACE: mic &nbsp;·&nbsp; ←→: mode &nbsp;·&nbsp; ↑↓: sensitivity &nbsp;·&nbsp; F: fullscreen &nbsp;·&nbsp; S: screenshot
        </div>
      )}
    </div>
  )
}
