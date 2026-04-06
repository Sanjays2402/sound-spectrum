import { useState, useCallback, useEffect, useRef } from 'react'
import Visualizer from './components/Visualizer.jsx'
import Controls from './components/Controls.jsx'
import { useAudio } from './hooks/useAudio.js'
import { useBeatDetection } from './hooks/useBeatDetection.js'
import { THEMES } from './utils/themes.js'

export default function App() {
  const [mode, setMode] = useState('bars')
  const [theme, setTheme] = useState('neon')
  const [sensitivity, setSensitivity] = useState(1.5)
  const [gain, setGain] = useState(1.0)
  const [isDragging, setIsDragging] = useState(false)
  const dragCountRef = useRef(0)

  const {
    isActive,
    audioSource,
    error,
    start,
    startFile,
    stop,
    setGain: setAudioGain,
    getFrequencyData,
    getTimeDomainData,
  } = useAudio()

  const { isBeat, bpm } = useBeatDetection(getFrequencyData, isActive)

  const handleToggle = useCallback(async () => {
    if (isActive) {
      stop()
    } else {
      await start()
    }
  }, [isActive, start, stop])

  const handleFileSelect = useCallback(async (file) => {
    if (!file) return
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/aac', 'audio/mp4', 'audio/webm']
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg|flac|aac|m4a|webm)$/i)) {
      return
    }
    await startFile(file)
  }, [startFile])

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

  // Drag and drop
  const handleDragEnter = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    dragCountRef.current++
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    dragCountRef.current--
    if (dragCountRef.current === 0) {
      setIsDragging(false)
    }
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    dragCountRef.current = 0
    setIsDragging(false)
    const file = e.dataTransfer?.files?.[0]
    if (file) handleFileSelect(file)
  }, [handleFileSelect])

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

  const themeColors = THEMES[theme].colors

  return (
    <div
      className="relative w-full h-full bg-black overflow-hidden"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Visualizer
        mode={mode}
        theme={theme}
        sensitivity={sensitivity}
        isActive={isActive}
        getFrequencyData={getFrequencyData}
        getTimeDomainData={getTimeDomainData}
      />

      {/* Beat flash overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-[5] transition-opacity duration-100"
        style={{
          opacity: isBeat ? 0.15 : 0,
          background: `radial-gradient(ellipse at center, ${themeColors[0]}, transparent 70%)`,
        }}
      />

      {/* BPM pill */}
      {isActive && bpm > 0 && (
        <div
          className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md text-xs font-semibold tracking-wide select-none"
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: themeColors[0],
            textShadow: `0 0 8px ${themeColors[0]}66`,
          }}
        >
          <span
            className="inline-block w-1.5 h-1.5 rounded-full"
            style={{
              background: themeColors[0],
              boxShadow: `0 0 6px ${themeColors[0]}`,
              animation: isBeat ? 'none' : 'pulse 1s ease-in-out infinite',
            }}
          />
          {bpm} BPM
        </div>
      )}

      {/* Audio source indicator */}
      {isActive && audioSource === 'file' && (
        <div
          className="absolute top-4 z-20 px-3 py-1.5 rounded-full backdrop-blur-md text-[11px] font-medium tracking-wider uppercase select-none"
          style={{
            left: bpm > 0 ? '7.5rem' : '1rem',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.5)',
          }}
        >
          ♫ Playing file
        </div>
      )}

      {/* Drag-and-drop overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div
            className="flex flex-col items-center gap-3 px-10 py-8 rounded-3xl border-2 border-dashed"
            style={{ borderColor: themeColors[0] + '80' }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={themeColors[0]} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}>
              <path d="M9 18V5l12-2v13"/>
              <circle cx="6" cy="18" r="3"/>
              <circle cx="18" cy="16" r="3"/>
            </svg>
            <span className="text-white/80 text-sm font-medium">Drop audio file to visualize</span>
            <span className="text-white/30 text-xs">MP3, WAV, OGG, FLAC</span>
          </div>
        </div>
      )}

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
        audioSource={audioSource}
        onToggle={handleToggle}
        onFileSelect={handleFileSelect}
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
          SPACE: mic &nbsp;·&nbsp; ←→: mode &nbsp;·&nbsp; ↑↓: sensitivity &nbsp;·&nbsp; F: fullscreen &nbsp;·&nbsp; S: screenshot &nbsp;·&nbsp; Drop audio file to play
        </div>
      )}
    </div>
  )
}
