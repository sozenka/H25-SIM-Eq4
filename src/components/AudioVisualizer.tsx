import React, { useEffect, useRef } from 'react'

const AudioVisualizer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Simulate audio visualization
      const bars = 50
      for (let i = 0; i < bars; i++) {
        const height = Math.random() * canvas.height * 0.8
        ctx.fillStyle = `hsl(${(i * 360) / bars}, 70%, 60%)`
        ctx.fillRect(
          (i * canvas.width) / bars,
          canvas.height - height,
          canvas.width / bars - 2,
          height
        )
      }

      requestAnimationFrame(draw)
    }

    draw()
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={200}
      className="w-full h-48 rounded-lg"
    />
  )
}

export default AudioVisualizer