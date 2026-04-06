import { useRef, useCallback, useEffect, useState } from 'react'

export function useAudio() {
  const audioCtxRef = useRef(null)
  const analyserRef = useRef(null)
  const sourceRef = useRef(null)
  const streamRef = useRef(null)
  const gainNodeRef = useRef(null)
  const bufferSourceRef = useRef(null)
  const [isActive, setIsActive] = useState(false)
  const [audioSource, setAudioSource] = useState(null) // 'mic' | 'file' | null
  const [error, setError] = useState(null)

  const cleanup = useCallback(() => {
    if (bufferSourceRef.current) {
      try { bufferSourceRef.current.stop() } catch (_) { /* already stopped */ }
      bufferSourceRef.current.disconnect()
      bufferSourceRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect()
      sourceRef.current = null
    }
    if (gainNodeRef.current) {
      gainNodeRef.current.disconnect()
      gainNodeRef.current = null
    }
    if (analyserRef.current) {
      analyserRef.current.disconnect()
      analyserRef.current = null
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close()
      audioCtxRef.current = null
    }
  }, [])

  const stop = useCallback(() => {
    cleanup()
    setIsActive(false)
    setAudioSource(null)
  }, [cleanup])

  const start = useCallback(async () => {
    try {
      setError(null)
      cleanup()

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

      setAudioSource('mic')
      setIsActive(true)
    } catch (err) {
      setError(err.message || 'Microphone access denied')
      setIsActive(false)
    }
  }, [cleanup])

  const startFile = useCallback(async (file) => {
    try {
      setError(null)
      cleanup()

      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      audioCtxRef.current = ctx

      const analyser = ctx.createAnalyser()
      analyser.fftSize = 2048
      analyser.smoothingTimeConstant = 0.8
      analyserRef.current = analyser

      const gainNode = ctx.createGain()
      gainNode.gain.value = 1.0
      gainNodeRef.current = gainNode

      const arrayBuffer = await file.arrayBuffer()
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer)

      const source = ctx.createBufferSource()
      source.buffer = audioBuffer
      bufferSourceRef.current = source

      source.connect(gainNode)
      gainNode.connect(analyser)
      analyser.connect(ctx.destination)

      source.onended = () => {
        setIsActive(false)
        setAudioSource(null)
      }

      source.start(0)
      setAudioSource('file')
      setIsActive(true)
    } catch (err) {
      setError(err.message || 'Failed to load audio file')
      setIsActive(false)
    }
  }, [cleanup])

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
    return () => cleanup()
  }, [cleanup])

  return {
    isActive,
    audioSource,
    error,
    start,
    startFile,
    stop,
    setGain,
    getFrequencyData,
    getTimeDomainData,
    setSmoothingTimeConstant,
  }
}
