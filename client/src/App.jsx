import { useRef, useEffect } from 'react'

function App() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    canvas.width = 800
    canvas.height = 600

    function draw() {
      ctx.fillStyle = '#0a0a2e'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      requestAnimationFrame(draw)
    }

    draw()
  }, [])

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: '#000'
    }}>
      <canvas ref={canvasRef} />
    </div>
  )
}

export default App
