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

let socket = null

function getSocket() {
  if (!socket) {
    socket = io('http://localhost:3001')
  }
  return socket
}

function App() {
  const [screen, setScreen] = useState('menu')
  const [matchCode, setMatchCode] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [userName, setUserName] = useState('')
  const [slot, setSlot] = useState(null)
  const [joinError, setJoinError] = useState('')
  const [matchResult, setMatchResult] = useState(null)

  useEffect(() => {
    const s = getSocket()

    s.on('game_created', ({ matchCode, slot }) => {
      console.log('game created:', matchCode, 'slot:', slot)
      setMatchCode(matchCode)
      setSlot(slot)
      setScreen('lobby')
    })

    s.on('game_joined', ({ matchCode, slot }) => {
      console.log('game joined:', matchCode, 'slot:', slot)
      setMatchCode(matchCode)
      setSlot(slot)
      setScreen('game')
    })

    s.on('join_failed', ({ reason }) => {
      console.log('join failed:', reason)
      setJoinError(reason || 'Could not join game')
    })

    s.on('end_of_match', ({ winner, finalScores }) => {
      console.log('match ended:', winner, finalScores)
      setMatchResult({ winner, finalScores })
      setScreen('gameOver')
    })

    return () => {
      s.off('game_created')
      s.off('game_joined')
      s.off('join_failed')
      s.off('end_of_match')
    }
  }, [])

  const handleCreateGame = () => {
    const s = getSocket()
    s.emit('create_game', userName)
  }

  const handleJoinGame = () => {
    if (joinCode.length === 4) {
      setJoinError('')
      const s = getSocket()
      s.emit('join_game', joinCode, userName)
    }
  }

  const handlePlayAgain = () => {
    setMatchResult(null)
    setMatchCode('')
    setSlot(null)
    setJoinCode('')
    setScreen('menu')
  }

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
                onClick={handleCreateGame}
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
            <p style={{ color: '#00ff88aa', fontSize: '12px', marginBottom: '4px' }}>Playing as: {userName}</p>
            <p style={{ color: '#888', fontSize: '11px', marginBottom: '20px' }}>You are {slot}</p>
            <p style={{ color: '#888', fontSize: '14px', marginBottom: '12px' }}>Share this code with your friend:</p>
            <div style={{
              background: '#1a1a3e', border: '2px solid #00ff88', borderRadius: '8px',
              padding: '20px 40px', marginBottom: '30px',
            }}>
              <span style={{ color: '#00ff88', fontSize: '36px', letterSpacing: '8px' }}>{matchCode}</span>
            </div>
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
              onChange={(e) => { setJoinCode(e.target.value.toUpperCase()); setJoinError('') }}
              style={{
                background: '#1a1a3e', border: '2px solid #ff4466', borderRadius: '8px',
                padding: '16px 20px', fontSize: '28px', color: '#ff4466',
                textAlign: 'center', letterSpacing: '8px', fontFamily: 'monospace',
                outline: 'none', width: '200px', marginBottom: '16px',
              }}
            />
            {joinError && (
              <p style={{ color: '#ff4466', fontSize: '12px', marginBottom: '12px' }}>{joinError}</p>
            )}
            <br />
            <button onClick={handleJoinGame} style={{
              padding: '12px 30px', background: '#ff4466', color: '#0a0a2e',
              border: 'none', borderRadius: '6px', fontSize: '14px',
              fontFamily: 'monospace', fontWeight: 'bold', cursor: 'pointer',
              marginBottom: '12px',
            }}>JOIN</button>
            <br />
            <button onClick={() => { setScreen('menu'); setJoinCode(''); setJoinError('') }} style={{
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

  if (screen === 'gameOver') {
    const didIWin = matchResult?.winner === slot
    const winnerColor = didIWin ? '#00ff88' : '#ff4466'
    const winnerText = didIWin ? 'VICTORY' : 'DEFEAT'

    return (
      <div style={menuStyle}>
        <div style={menuBoxStyle}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ color: winnerColor, fontSize: '48px', marginBottom: '8px' }}>{winnerText}</h1>
            <p style={{ color: '#888', fontSize: '14px', marginBottom: '30px' }}>
              Winner: {matchResult?.winner}
            </p>
            <div style={{
              background: '#1a1a3e', border: `2px solid ${winnerColor}`, borderRadius: '8px',
              padding: '20px 40px', marginBottom: '30px', minWidth: '280px',
            }}>
              <h3 style={{ color: '#ffffff', fontSize: '16px', marginBottom: '16px' }}>FINAL SCORES</h3>
              {matchResult?.finalScores && Object.keys(matchResult.finalScores).map((player) => (
                <p key={player} style={{
                  color: player === matchResult.winner ? '#00ff88' : '#888',
                  fontSize: '18px',
                  marginBottom: '8px',
                }}>
                  {player}: {matchResult.finalScores[player]}
                </p>
              ))}
            </div>
            <button onClick={handlePlayAgain} style={{
              padding: '12px 30px', background: '#00ff88', color: '#0a0a2e',
              border: 'none', borderRadius: '6px', fontSize: '14px',
              fontFamily: 'monospace', fontWeight: 'bold', cursor: 'pointer',
            }}>PLAY AGAIN</button>
          </div>
        </div>
      </div>
    )
  }

  return <GameCanvas slot={slot} />
}

function GameCanvas({ slot }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    canvas.width = 800
    canvas.height = 600

    const s = getSocket()

    let gameState = {
      phase: 'waiting',
      players: {
        player1: { x: 380, y: 40, health: 1, score: 0, userName: '' },
        player2: { x: 380, y: 516, health: 1, score: 0, userName: '' },
      },
      asteroids: [],
      projectiles: [],
    }

    s.on('gameState', (state) => {
      gameState = state
    })

    const keys = {
      left: false,
      right: false,
      shoot: false,
    }

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        if (!keys.left) {
          keys.left = true
          s.emit('input', { key: 'left', state: 'down' })
        }
      }
      if (e.key === 'ArrowRight' || e.key === 'd') {
        if (!keys.right) {
          keys.right = true
          s.emit('input', { key: 'right', state: 'down' })
        }
      }
      if (e.key === ' ') {
        e.preventDefault()
        if (!keys.shoot) {
          keys.shoot = true
          s.emit('input', { key: 'shoot', state: 'down' })
        }
      }
    }

    const handleKeyUp = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        keys.left = false
        s.emit('input', { key: 'left', state: 'up' })
      }
      if (e.key === 'ArrowRight' || e.key === 'd') {
        keys.right = false
        s.emit('input', { key: 'right', state: 'up' })
      }
      if (e.key === ' ') {
        keys.shoot = false
        s.emit('input', { key: 'shoot', state: 'up' })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    const shipWidth = 40
    const shipHeight = 44

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
      const color = '#ff8800'
      ctx.fillStyle = color
      ctx.fillRect(a.x, a.y, 60, 22)
      ctx.strokeStyle = '#ffffff22'
      ctx.strokeRect(a.x, a.y, 60, 22)
    }

    function drawProjectile(p) {
      ctx.shadowColor = p.color || '#ffffff'
      ctx.shadowBlur = 8
      ctx.fillStyle = p.color || '#ffffff'
      ctx.fillRect(p.x, p.y, 4, 10)
      ctx.shadowBlur = 0
      ctx.shadowColor = 'transparent'
    }

    function draw() {
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

      const p1 = gameState.players.player1
      const p2 = gameState.players.player2

      ctx.font = '11px monospace'
      ctx.textAlign = 'center'
      ctx.fillStyle = '#00ff88'
      ctx.fillText('P1', p1.x + shipWidth / 2, p1.y + 10)
      ctx.fillStyle = '#ff4466'
      ctx.fillText('P2', p2.x + shipWidth / 2, p2.y + shipHeight - 1)

      drawShip(p1.x, p1.y, shipWidth, shipHeight, '#00ff88', false)
      drawShip(p2.x, p2.y, shipWidth, shipHeight, '#ff4466', true)

      gameState.asteroids.forEach((a) => {
        drawAsteroid(a)
      })

      gameState.projectiles.forEach((p) => {
        drawProjectile(p)
      })

      ctx.fillStyle = '#ffffff'
      ctx.font = '18px monospace'
      ctx.textAlign = 'left'
      ctx.fillText((p1.userName || 'P1') + ': ' + p1.score, 20, 25)
      ctx.textAlign = 'right'
      ctx.fillText((p2.userName || 'P2') + ': ' + p2.score, canvas.width - 20, canvas.height - 12)

      ctx.textAlign = 'center'
      ctx.font = '14px monospace'
      ctx.fillStyle = '#888888'
      const phaseLabel = gameState.phase === 'phase1' ? 'ASTEROID PHASE' :
                         gameState.phase === 'phase2' ? 'FIGHT PHASE' :
                         gameState.phase === 'waiting' ? 'WAITING' :
                         gameState.phase === 'ended' ? 'GAME OVER' : ''
      ctx.fillText(phaseLabel, canvas.width / 2, 20)

      requestAnimationFrame(draw)
    }

    draw()

    return () => {
      s.off('gameState')
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [slot])

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
