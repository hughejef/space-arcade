import { useRef, useEffect, useState } from 'react'
import { io } from 'socket.io-client'

const menuStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  background: '#000',
}

const menuBoxStyle = {
  width: '800px',
  height: '600px',
  background: '#0a0a2e',
  border: '3px solid #4444ff',
  borderRadius: '4px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontFamily: 'monospace',
  position: 'relative',
}

function App() {
  const [screen, setScreen] = useState('menu')
  const [matchCode, setMatchCode] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [userName, setUserName] = useState('')

  if (screen === 'menu') {
    return (
      <div style={menuStyle}>
        <div style={menuBoxStyle}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ color: '#00ff88', fontSize: '48px', marginBottom: '8px' }}>SPACE ARCADE</h1>
            <p style={{ color: '#888', fontSize: '14px', marginBottom: '30px' }}>1v1 space shooter</p>

            <input
              type="text"
              placeholder="Enter username"
              maxLength={12}
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              style={{
                background: '#1a1a3e', border: '2px solid #4444ff', borderRadius: '6px',
                padding: '10px 16px', fontSize: '16px', color: '#ffffff',
                textAlign: 'center', fontFamily: 'monospace',
                outline: 'none', width: '220px', marginBottom: '20px',
              }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '250px', margin: '0 auto' }}>
              <button
                disabled={!userName.trim()}
                onClick={() => {
                  setScreen('lobby')
                  setMatchCode(Math.random().toString(36).substring(2, 6).toUpperCase())
                }}
                style={{
                  padding: '14px',
                  background: userName.trim() ? '#00ff88' : '#00ff8844',
                  color: '#0a0a2e',
                  border: 'none', borderRadius: '6px', fontSize: '16px',
                  fontFamily: 'monospace', fontWeight: 'bold',
                  cursor: userName.trim() ? 'pointer' : 'not-allowed',
                }}>CREATE GAME</button>
              <button
                disabled={!userName.trim()}
                onClick={() => setScreen('join')}
                style={{
                  padding: '14px', background: 'transparent',
                  color: userName.trim() ? '#00ff88' : '#00ff8844',
                  border: `2px solid ${userName.trim() ? '#00ff88' : '#00ff8844'}`,
                  borderRadius: '6px', fontSize: '16px',
                  fontFamily: 'monospace', fontWeight: 'bold',
                  cursor: userName.trim() ? 'pointer' : 'not-allowed',
                }}>JOIN GAME</button>
              <button onClick={() => setScreen('leaderboard')} style={{
                padding: '14px', background: 'transparent', color: '#888',
                border: '2px solid #444', borderRadius: '6px', fontSize: '16px',
                fontFamily: 'monospace', cursor: 'pointer',
              }}>LEADERBOARD</button>
              <button onClick={() => window.close()} style={{
                padding: '14px', background: 'transparent', color: '#ff4466',
                border: '2px solid #ff446644', borderRadius: '6px', fontSize: '16px',
                fontFamily: 'monospace', cursor: 'pointer',
              }}>QUIT</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (screen === 'lobby') {
    return (
      <div style={menuStyle}>
        <div style={menuBoxStyle}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: '#00ff88', fontSize: '24px', marginBottom: '8px' }}>WAITING FOR OPPONENT</h2>
            <p style={{ color: '#00ff88aa', fontSize: '12px', marginBottom: '20px' }}>Playing as: {userName}</p>
            <p style={{ color: '#888', fontSize: '14px', marginBottom: '12px' }}>Share this code with your friend:</p>
            <div style={{
              background: '#1a1a3e', border: '2px solid #00ff88', borderRadius: '8px',
              padding: '20px 40px', marginBottom: '30px',
            }}>
              <span style={{ color: '#00ff88', fontSize: '36px', letterSpacing: '8px' }}>{matchCode}</span>
            </div>
            <button onClick={() => setScreen('game')} style={{
              padding: '12px 30px', background: '#00ff88', color: '#0a0a2e',
              border: 'none', borderRadius: '6px', fontSize: '14px',
              fontFamily: 'monospace', fontWeight: 'bold', cursor: 'pointer',
              marginBottom: '12px',
            }}>START GAME</button>
            <br />
            <button onClick={() => setScreen('menu')} style={{
              padding: '10px 30px', background: 'transparent', color: '#888',
              border: '2px solid #444', borderRadius: '6px', fontSize: '14px',
              fontFamily: 'monospace', cursor: 'pointer', marginTop: '8px',
            }}>BACK</button>
          </div>
        </div>
      </div>
    )
  }

  if (screen === 'join') {
    return (
      <div style={menuStyle}>
        <div style={menuBoxStyle}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: '#ff4466', fontSize: '24px', marginBottom: '8px' }}>JOIN GAME</h2>
            <p style={{ color: '#ff4466aa', fontSize: '12px', marginBottom: '20px' }}>Playing as: {userName}</p>
            <p style={{ color: '#888', fontSize: '14px', marginBottom: '12px' }}>Enter the match code:</p>
            <input
              type="text"
              maxLength={4}
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              style={{
                background: '#1a1a3e', border: '2px solid #ff4466', borderRadius: '8px',
                padding: '16px 20px', fontSize: '28px', color: '#ff4466',
                textAlign: 'center', letterSpacing: '8px', fontFamily: 'monospace',
                outline: 'none', width: '200px', marginBottom: '24px',
              }}
            />
            <br />
            <button onClick={() => {
              if (joinCode.length === 4) {
                setScreen('game')
              }
            }} style={{
              padding: '12px 30px', background: '#ff4466', color: '#0a0a2e',
              border: 'none', borderRadius: '6px', fontSize: '14px',
              fontFamily: 'monospace', fontWeight: 'bold', cursor: 'pointer',
              marginBottom: '12px',
            }}>JOIN</button>
            <br />
            <button onClick={() => { setScreen('menu'); setJoinCode('') }} style={{
              padding: '10px 30px', background: 'transparent', color: '#888',
              border: '2px solid #444', borderRadius: '6px', fontSize: '14px',
              fontFamily: 'monospace', cursor: 'pointer', marginTop: '8px',
            }}>BACK</button>
          </div>
        </div>
      </div>
    )
  }

  if (screen === 'leaderboard') {
    return (
      <div style={menuStyle}>
        <div style={menuBoxStyle}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: '#ffff00', fontSize: '24px', marginBottom: '20px' }}>LEADERBOARD</h2>
            <p style={{ color: '#888', fontSize: '14px', marginBottom: '30px' }}>Coming soon...</p>
            <button onClick={() => setScreen('menu')} style={{
              padding: '10px 30px', background: 'transparent', color: '#888',
              border: '2px solid #444', borderRadius: '6px', fontSize: '14px',
              fontFamily: 'monospace', cursor: 'pointer',
            }}>BACK</button>
          </div>
        </div>
      </div>
    )
  }

  return <GameCanvas />
}

function GameCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    canvas.width = 800
    canvas.height = 600

    const socket = io('http://localhost:3001')

    socket.on('connect', () => {
      console.log('connected to server as', socket.id)
    })

    socket.on('gameState', (state) => {
      console.log('game state received:', state)
    })

    const player1 = { x: 380, y: 40, width: 40, height: 44 }
    const player2 = { x: 380, y: 516, width: 40, height: 44 }

    let p1Score = 0
    let p2Score = 0

    const keys = {
      left: false,
      right: false,
      shoot: false,
    }

    const shipSpeed = 8

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        if (!keys.left) {
          keys.left = true
          socket.emit('input', { key: 'left', state: 'down' })
        }
      }
      if (e.key === 'ArrowRight' || e.key === 'd') {
        if (!keys.right) {
          keys.right = true
          socket.emit('input', { key: 'right', state: 'down' })
        }
      }
      if (e.key === ' ') {
        e.preventDefault()
        if (!keys.shoot) {
          keys.shoot = true
          socket.emit('input', { key: 'shoot', state: 'down' })
        }
      }
    }

    const handleKeyUp = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        keys.left = false
        socket.emit('input', { key: 'left', state: 'up' })
      }
      if (e.key === 'ArrowRight' || e.key === 'd') {
        keys.right = false
        socket.emit('input', { key: 'right', state: 'up' })
      }
      if (e.key === ' ') {
        keys.shoot = false
        socket.emit('input', { key: 'shoot', state: 'up' })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

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

    const projectiles = []

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
      if (keys.left && player1.x > 10) {
        player1.x -= shipSpeed
      }
      if (keys.right && player1.x < canvas.width - player1.width - 10) {
        player1.x += shipSpeed
      }

      ctx.fillStyle = '#0a0a2e'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.strokeStyle = '#4444ff'
      ctx.lineWidth = 3
      ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8)
      ctx.strokeStyle = '#6666ff33'
      ctx.lineWidth = 1
      ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16)

      ctx.fillStyle = '#ffffff'
      for (let i = 0; i < 50; i++) {
        const sx = (i * 137 + 29) % canvas.width
        const sy = (i * 211 + 43) % canvas.height
        ctx.fillRect(sx, sy, 1.5, 1.5)
      }

      ctx.font = '11px monospace'
      ctx.textAlign = 'center'
      ctx.fillStyle = '#00ff88'
      ctx.fillText('P1', player1.x + player1.width / 2, player1.y + 10)
      ctx.fillStyle = '#ff4466'
      ctx.fillText('P2', player2.x + player2.width / 2, player2.y + player2.height - 1)

      drawShip(player1.x, player1.y, player1.width, player1.height, '#00ff88', false)
      drawShip(player2.x, player2.y, player2.width, player2.height, '#ff4466', true)

      asteroids.forEach((a) => {
        if (a.alive) {
          drawAsteroid(a)
        }
      })

      projectiles.forEach((p) => {
        drawProjectile(p)
      })

      ctx.fillStyle = '#ffffff'
      ctx.font = '18px monospace'
      ctx.textAlign = 'left'
      ctx.fillText('P1: ' + p1Score, 20, 25)
      ctx.textAlign = 'right'
      ctx.fillText('P2: ' + p2Score, canvas.width - 20, canvas.height - 12)

      ctx.textAlign = 'center'
      ctx.font = '14px monospace'
      ctx.fillStyle = '#888888'
      ctx.fillText('ASTEROID PHASE', canvas.width / 2, 20)

      requestAnimationFrame(draw)
    }

    draw()

    return () => {
      socket.disconnect()
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
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
