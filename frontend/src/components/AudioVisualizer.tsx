import React, { useEffect, useRef, useState } from 'react'
import WaveSurfer from 'wavesurfer.js'
import { Play, Pause, RotateCcw } from 'lucide-react'

interface AudioVisualizerProps {
  audioUrl?: string
  audioData?: Blob | ArrayBuffer
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ audioUrl, audioData }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const wavesurferRef = useRef<WaveSurfer | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)

  useEffect(() => {
    if (!containerRef.current) return

    wavesurferRef.current = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#A78BFA',
      progressColor: '#8B5CF6',
      cursorColor: '#EC4899',
      barWidth: 2,
      barGap: 3,
      barRadius: 3,
      cursorWidth: 2,
      height: 100,
      barMinHeight: 1,
      normalize: true,
      responsive: true,
      fillParent: true,
      backend: 'WebAudio'
    })

    wavesurferRef.current.on('ready', () => {
      setDuration(wavesurferRef.current?.getDuration() || 0)
    })

    wavesurferRef.current.on('audioprocess', () => {
      setCurrentTime(wavesurferRef.current?.getCurrentTime() || 0)
    })

    wavesurferRef.current.on('finish', () => {
      setIsPlaying(false)
    })

    return () => {
      wavesurferRef.current?.destroy()
    }
  }, [])

  useEffect(() => {
    if (!wavesurferRef.current) return

    if (audioUrl) {
      wavesurferRef.current.load(audioUrl)
    } else if (audioData) {
      const blob = audioData instanceof Blob
        ? audioData
        : new Blob([audioData], { type: 'audio/wav' }) // or 'audio/webm' depending on your setup
      wavesurferRef.current.loadBlob(blob)
    }
  }, [audioUrl, audioData])

  const togglePlayPause = () => {
    if (!wavesurferRef.current) return

    if (isPlaying) {
      wavesurferRef.current.pause()
    } else {
      wavesurferRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const restart = () => {
    if (!wavesurferRef.current) return
    wavesurferRef.current.seekTo(0)
    setCurrentTime(0)
    if (!isPlaying) {
      togglePlayPause()
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-black/20 p-6 rounded-lg border border-purple-500/20">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlayPause}
            className="p-2 rounded-full bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 transition-colors"
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>
          <button
            onClick={restart}
            className="p-2 rounded-full bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 transition-colors"
          >
            <RotateCcw className="w-6 h-6" />
          </button>
        </div>
        <div className="text-purple-300 font-mono">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      <div ref={containerRef} className="w-full" />
    </div>
  )
}

export default AudioVisualizer