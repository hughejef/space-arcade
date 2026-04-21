import { useRef, useEffect } from 'react'

function App() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    canvas.width = 800
    canvas.height = 600

    const player1 = { x: 380, y: 40, width: 40, height: 44 }
    const player2 = { x: 380, y: 516, width: 40, height: 44 }

    let p1Score = 0
    let p2Score = 0

    const asteroids = []
    const rows = 5
    const cols = 12
    const gap = 6
    const blockW = (canvas.width - 40 - (cols - 1) * gap) / cols
    const blockH = 22
    const startX = 20
    const startY = (canvas.height - rows * (blockH + gap)) / 2
    const colors = ['#ff00ff', '#00ffff', '#ffff00', '#ff4444', '#44ff44']

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        asteroids.push({
          x: startX + c * (blockW + gap),
          y: startY + r * (blockH + gap),
          width: blockW,
          height: blockH,
          color: colors[r],
          alive: true,
          bumps: [
            Math.random() * 4 + 2,
            Math.random() * 4 + 2,
            Math.random() * 4 + 2,
            Math.random() * 4 + 2,
          ]
        })
      }
    }

    const projectiles = [
      { x: player1.x + player1.width / 2 - 2, y: player1.y + player1.height + 30, color: '#00ff88', dy: 1 },
      { x: player1.x + player1.width / 2 - 2, y: player1.y + player1.height + 70, color: '#00ff88', dy: 1 },
      { x: player2.x + player2.width / 2 - 2, y: player2.y - 40, color: '#ff4466', dy: -1 },
      { x: player2.x + player2.width / 2 - 2, y: player2.y - 80, color: '#ff4466', dy: -1 },
    ]

    function drawShip(x, y, w, h, color, facingUp) {
      ctx.shadowColor = color
      ctx.shadowBlur = 12
      ctx.fillStyle = color

      if (facingUp) {
        ctx.beginPath()
        ctx.moveTo(x + w / 2, y)
        ctx.lineTo(x + w / 2 + 6, y + 14)
        ctx.lineTo(x + w / 2 - 6, y + 14)
        ctx.closePath()
        ctx.fill()
        ctx.fillRect(x + w / 2 - 8, y + 14, 16, 18)
        ctx.beginPath()
        ctx.moveTo(x + w / 2 - 8, y + 16)
        ctx.lineTo(x, y + h)
        ctx.lineTo(x + w / 2 - 8, y + 30)
        ctx.closePath()
        ctx.fill()
        ctx.beginPath()
        ctx.moveTo(x + w / 2 + 8, y + 16)
        ctx.lineTo(x + w, y + h)
        ctx.lineTo(x + w / 2 + 8, y + 30)
        ctx.closePath()
        ctx.fill()
        ctx.fillStyle = '#ffffff44'
        ctx.beginPath()
        ctx.arc(x + w / 2, y + 18, 4, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = color + '66'
        ctx.fillRect(x + w / 2 - 5, y + h, 10, 4)
      } else {
        ctx.beginPath()
        ctx.moveTo(x + w / 2, y + h)
        ctx.lineTo(x + w / 2 + 6, y + h - 14)
        ctx.lineTo(x + w / 2 - 6, y + h - 14)
        ctx.closePath()
        ctx.fill()
        ctx.fillRect(x + w / 2 - 8, y + 12, 16, 18)
        ctx.beginPath()
        ctx.moveTo(x + w / 2 - 8, y + h - 16)
        ctx.lineTo(x, y)
        ctx.lineTo(x + w / 2 - 8, y + 14)
        ctx.closePath()
        ctx.fill()
        ctx.beginPath()
        ctx.moveTo(x + w / 2 + 8, y + h - 16)
        ctx.lineTo(x + w, y)
        ctx.lineTo(x + w / 2 + 8, y + 14)
        ctx.closePath()
        ctx.fill()
        ctx.fillStyle = '#ffffff44'
        ctx.beginPath()
        ctx.arc(x + w / 2, y + h - 18, 4, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = color + '66'
        ctx.fillRect(x + w / 2 - 5, y - 4, 10, 4)
      }

      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
    }

    function drawAsteroid(a) {
      ctx.fillStyle = a.color
      ctx.beginPath()
      ctx.moveTo(a.x + a.bumps[0], a.y)
      ctx.lineTo(a.x + a.width - a.bumps[1], a.y + a.bumps[1] / 2)
      ctx.lineTo(a.x + a.width, a.y + a.bumps[0])
      ctx.lineTo(a.x + a.width - a.bumps[2] / 2, a.y + a.height / 2)
      ctx.lineTo(a.x + a.width, a.y + a.height - a.bumps[3])
      ctx.lineTo(a.x + a.width - a.bumps[0], a.y + a.height)
      ctx.lineTo(a.x + a.bumps[2], a.y + a.height - a.bumps[1] / 2)
      ctx.lineTo(a.x, a.y + a.height - a.bumps[3])
      ctx.lineTo(a.x + a.bumps[1] / 2, a.y + a.height / 2)
      ctx.lineTo(a.x, a.y + a.bumps[2])
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = '#00000033'
      ctx.beginPath()
      ctx.arc(a.x + a.width * 0.3, a.y + a.height * 0.4, 3, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(a.x + a.width * 0.7, a.y + a.height * 0.6, 2, 0, Math.PI * 2)
      ctx.fill()
    }

    function drawProjectile(p) {
      ctx.shadowColor = p.color
      ctx.shadowBlur = 8
      ctx.fillStyle = p.color
      ctx.fillRect(p.x, p.y, 4, 10)
      ctx.shadowBlur = 0
      ctx.shadowColor = 'transparent'
      ctx.fillStyle = p.color + '44'
      ctx.fillRect(p.x, p.y + (p.dy > 0 ? -8 : 10), 4, 8)
      ctx.fillStyle = p.color + '22'
      ctx.fillRect(p.x, p.y + (p.dy > 0 ? -16 : 18), 4, 8)
    }

    function draw() {
      ctx.fillStyle = '#0a0a2e'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // arcade border
      ctx.strokeStyle = '#4444ff'
      ctx.lineWidth = 3
      ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8)
      ctx.strokeStyle = '#6666ff33'
      ctx.lineWidth = 1
      ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16)

      // stars
      ctx.fillStyle = '#ffffff'
      for (let i = 0; i < 50; i++) {
        const sx = (i * 137 + 29) % canvas.width
        const sy = (i * 211 + 43) % canvas.height
        ctx.fillRect(sx, sy, 1.5, 1.5)
      }

      // player labels
      ctx.font = '12px monospace'
      ctx.textAlign = 'center'
      ctx.fillStyle = '#00ff88'
      ctx.fillText('PLAYER 1', player1.x + player1.width / 2, player1.y - 8)
      ctx.fillStyle = '#ff4466'
      ctx.fillText('PLAYER 2', player2.x + player2.width / 2, player2.y + player2.height + 16)

      // ships
      drawShip(player1.x, player1.y, player1.width, player1.height, '#00ff88', false)
      drawShip(player2.x, player2.y, player2.width, player2.height, '#ff4466', true)

      // asteroids
      asteroids.forEach((a) => {
        if (a.alive) {
          drawAsteroid(a)
        }
      })

      // projectiles
      projectiles.forEach((p) => {
        drawProjectile(p)
      })

      // scoreboard
      ctx.fillStyle = '#ffffff'
      ctx.font = '18px monospace'
      ctx.textAlign = 'left'
      ctx.fillText('P1: ' + p1Score, 20, 25)
      ctx.textAlign = 'right'
      ctx.fillText('P2: ' + p2Score, canvas.width - 20, canvas.height - 12)

      // phase indicator
      ctx.textAlign = 'center'
      ctx.font = '14px monospace'
      ctx.fillStyle = '#888888'
      ctx.fillText('ASTEROID PHASE', canvas.width / 2, 20)

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
