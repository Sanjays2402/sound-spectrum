import { useRef, useCallback, useEffect, useState } from 'react'

export function useAudio() {
  const audioCtxRef = useRef(null)
  const analyserRef = useRef(null)
  const sourceRef = useRef(null)
  const streamRef = useRef(null)
  const gainNodeRef = useRef(null)
  const [isActive, setIsActive] = useState(false)
  const [error, setError] = useState(null)

  const start = useCallback(async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      audioCtxRef.current = ctx

      const analyser = ctx.createAnalyser()
      analyser.fftSize = 2048
      analyser.smoothingTimeConstant = 0.8
      analyserRef.current = analyser

      const gainNode = ctx.createGain()
      gainNode.gain.value = 1.0
      gainNodeRef.current = gainNode

      const source = ctx.createMediaStreamSource(stream)
      sourceRef.current = source

      source.connect(gainNode)
      gainNode.connect(analyser)

      setIsActive(true)
    } catch (err) {
      setError(err.message || 'Microphone access denied')
      setIsActive(false)
    }
  }, [])

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect()
      sourceRef.current = null
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close()
      audioCtxRef.current = null
    }
    analyserRef.current = null
    gainNodeRef.current = null
    setIsActive(false)
  }, [])

  const setGain = useCallback((value) => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = value
    }
  }, [])

  const getFrequencyData = useCallback(() => {
    if (!analyserRef.current) return null
    const data = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(data)
    return data
  }, [])

  const getTimeDomainData = useCallback(() => {
    if (!analyserRef.current) return null
    const data = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteTimeDomainData(data)
    return data
  }, [])

  const setSmoothingTimeConstant = useCallback((value) => {
    if (analyserRef.current) {
      analyserRef.current.smoothingTimeConstant = value
    }
  }, [])

  useEffect(() => {
    return () => stop()
  }, [stop])

  return {
    isActive,
    error,
    start,
    stop,
    setGain,
    getFrequencyData,
    getTimeDomainData,
    setSmoothingTimeConstant,
  }
}
