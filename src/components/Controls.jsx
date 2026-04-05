import { useState, useRef, useEffect, useCallback } from 'react'
import { THEMES, THEME_KEYS } from '../utils/themes.js'

const MODES = [
  { key: 'bars', label: 'Bars', icon: '▮▮▮' },
  { key: 'waveform', label: 'Wave', icon: '∿∿∿' },
  { key: 'circular', label: 'Circle', icon: '◎' },
  { key: 'particles', label: 'Burst', icon: '✦' },
]

export default function Controls({
  mode, setMode,
  theme, setTheme,
  sensitivity, setSensitivity,
  gain, setGain,
  isActive, onToggle,
  onScreenshot, onFullscreen,
}) {
  const [visible, setVisible] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const hideTimer = useRef(null)
  const containerRef = useRef(null)

  const scheduleHide = useCallback(() => {
    clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => {
      if (isActive) setVisible(false)
    }, 4000)
  }, [isActive])

  const handleInteraction = useCallback(() => {
    setVisible(true)
    scheduleHide()
  }, [scheduleHide])

  useEffect(() => {
    const handleMove = () => handleInteraction()
    const handleTouch = () => handleInteraction()
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('touchstart', handleTouch)
    scheduleHide()
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('touchstart', handleTouch)
      clearTimeout(hideTimer.current)
    }
  }, [handleInteraction, scheduleHide])

  // Keep visible when not active
  useEffect(() => {
    if (!isActive) setVisible(true)
  }, [isActive])

  const btnBase = "flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer select-none"
  const btnSm = `${btnBase} w-10 h-10 text-sm`

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-10 pointer-events-none"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease' }}
    >
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 pointer-events-auto"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-white/70 text-xs font-medium tracking-widest uppercase">Sound Spectrum</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onScreenshot} className={`${btnSm} bg-white/10 hover:bg-white/20 text-white/70 hover:text-white backdrop-blur-sm`} title="Screenshot">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <path d="M21 15l-5-5L5 21"/>
            </svg>
          </button>
          <button onClick={onFullscreen} className={`${btnSm} bg-white/10 hover:bg-white/20 text-white/70 hover:text-white backdrop-blur-sm`} title="Fullscreen">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
            </svg>
          </button>
          <button onClick={() => setShowSettings(!showSettings)} className={`${btnSm} ${showSettings ? 'bg-white/25' : 'bg-white/10'} hover:bg-white/20 text-white/70 hover:text-white backdrop-blur-sm`} title="Settings">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/><path d="M12 1v2m0 18v2m-9-11h2m18 0h2m-3.3-6.7-1.4 1.4M6.7 17.3l-1.4 1.4m0-13.4 1.4 1.4m10.6 10.6 1.4 1.4"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="absolute top-16 right-4 bg-black/70 backdrop-blur-xl rounded-2xl p-5 pointer-events-auto animate-fade-in min-w-[220px] border border-white/10">
          <div className="space-y-5">
            <div>
              <label className="text-white/50 text-[11px] font-medium tracking-wider uppercase mb-2 block">Sensitivity</label>
              <input
                type="range" min="0.5" max="3" step="0.1"
                value={sensitivity}
                onChange={e => setSensitivity(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-white/50 text-[11px] font-medium tracking-wider uppercase mb-2 block">Gain</label>
              <input
                type="range" min="0" max="3" step="0.1"
                value={gain}
                onChange={e => setGain(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-auto"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)', paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
      >
        {/* Mode selector */}
        <div className="flex justify-center gap-2 mb-4 px-4">
          {MODES.map(m => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                mode === m.key
                  ? 'bg-white/20 text-white backdrop-blur-sm'
                  : 'bg-white/5 text-white/40 hover:text-white/70 hover:bg-white/10'
              }`}
            >
              <span className="mr-1">{m.icon}</span> {m.label}
            </button>
          ))}
        </div>

        {/* Theme and mic toggle */}
        <div className="flex items-center justify-center gap-3 px-4">
          {/* Theme dots */}
          <div className="flex gap-2 items-center bg-black/30 rounded-full px-3 py-2 backdrop-blur-sm">
            {THEME_KEYS.map(k => (
              <button
                key={k}
                onClick={() => setTheme(k)}
                className="cursor-pointer transition-transform duration-200 hover:scale-125"
                style={{
                  width: theme === k ? 18 : 12,
                  height: theme === k ? 18 : 12,
                  borderRadius: '50%',
                  background: THEMES[k].colors[0],
                  boxShadow: theme === k ? `0 0 12px ${THEMES[k].colors[0]}` : 'none',
                  border: theme === k ? '2px solid rgba(255,255,255,0.5)' : '1px solid rgba(255,255,255,0.15)',
                  transition: 'all 0.2s ease',
                }}
                title={THEMES[k].name}
              />
            ))}
          </div>

          {/* Mic toggle */}
          <button
            onClick={onToggle}
            className={`${btnBase} w-14 h-14 text-lg ${
              isActive
                ? 'bg-white/20 text-white shadow-lg'
                : 'bg-white/10 text-white/60 hover:text-white hover:bg-white/15'
            } backdrop-blur-sm`}
            style={isActive ? { boxShadow: `0 0 25px ${THEMES[theme].colors[0]}44` } : {}}
          >
            {isActive ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" opacity="0.6">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
