import { useRef, useEffect, useState, useCallback } from 'react'

export function useBeatDetection(getFrequencyData, isActive) {
  const [isBeat, setIsBeat] = useState(false)
  const [bpm, setBpm] = useState(0)
  const energyHistoryRef = useRef([])
  const beatTimesRef = useRef([])
  const animRef = useRef(null)
  const beatTimeoutRef = useRef(null)
  const lastBeatRef = useRef(0)

  const detect = useCallback(() => {
    if (!isActive) {
      animRef.current = requestAnimationFrame(detect)
      return
    }

    const freqData = getFrequencyData()
    if (!freqData) {
      animRef.current = requestAnimationFrame(detect)
      return
    }

    // Calculate current frame energy (RMS of frequency magnitudes)
    let energy = 0
    for (let i = 0; i < freqData.length; i++) {
      energy += freqData[i] * freqData[i]
    }
    energy = Math.sqrt(energy / freqData.length)

    // Maintain rolling energy history (~43 frames ≈ 0.7s at 60fps)
    const history = energyHistoryRef.current
    history.push(energy)
    if (history.length > 43) history.shift()

    // Average energy
    const avgEnergy = history.reduce((a, b) => a + b, 0) / history.length

    const now = performance.now()

    // Beat: current energy > 1.5× average, minimum energy threshold, 200ms cooldown
    if (energy > avgEnergy * 1.5 && energy > 10 && now - lastBeatRef.current > 200) {
      lastBeatRef.current = now
      setIsBeat(true)

      clearTimeout(beatTimeoutRef.current)
      beatTimeoutRef.current = setTimeout(() => setIsBeat(false), 100)

      // Track beat timestamps for BPM
      const beats = beatTimesRef.current
      beats.push(now)
      if (beats.length > 20) beats.shift()

      // Need at least 4 beats to estimate BPM
      if (beats.length >= 4) {
        const intervals = []
        for (let i = 1; i < beats.length; i++) {
          intervals.push(beats[i] - beats[i - 1])
        }
        // Filter out outlier intervals (> 2× median)
        intervals.sort((a, b) => a - b)
        const median = intervals[Math.floor(intervals.length / 2)]
        const filtered = intervals.filter(v => v < median * 2 && v > median * 0.5)
        if (filtered.length >= 2) {
          const avgInterval = filtered.reduce((a, b) => a + b, 0) / filtered.length
          const estimatedBpm = Math.round(60000 / avgInterval)
          if (estimatedBpm >= 40 && estimatedBpm <= 220) {
            setBpm(estimatedBpm)
          }
        }
      }
    }

    animRef.current = requestAnimationFrame(detect)
  }, [getFrequencyData, isActive])

  useEffect(() => {
    animRef.current = requestAnimationFrame(detect)
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
      clearTimeout(beatTimeoutRef.current)
    }
  }, [detect])

  // Reset when audio stops
  useEffect(() => {
    if (!isActive) {
      energyHistoryRef.current = []
      beatTimesRef.current = []
      setBpm(0)
      setIsBeat(false)
    }
  }, [isActive])

  return { isBeat, bpm }
}
