import { useRef, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import Menu from './Menu'
import Lobby from './Lobby'
import JoinGame from './JoinGame'
import Leaderboard from './Leaderboard'
import GameOver from './GameOver'

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

  const handleJoinGame = (code) => {
    setJoinError('')
    const s = getSocket()
    s.emit('join_game', code, userName)
  }

  const handlePlayAgain = () => {
    setMatchResult(null)
    setMatchCode('')
    setSlot(null)
    setScreen('menu')
  }

  if (screen === 'menu') {
    return (
      <Menu
        userName={userName}
        setUserName={setUserName}
        onCreateGame={handleCreateGame}
        onJoinGame={() => setScreen('join')}
        onLeaderboard={() => setScreen('leaderboard')}
      />
    )
  }

  if (screen === 'lobby') {
    return (
      <Lobby
        userName={userName}
        slot={slot}
        matchCode={matchCode}
        onBack={() => setScreen('menu')}
      />
    )
  }

  if (screen === 'join') {
    return (
      <JoinGame
        userName={userName}
        joinError={joinError}
        onJoin={handleJoinGame}
        onBack={() => { setScreen('menu'); setJoinError('') }}
      />
    )
  }

  if (screen === 'leaderboard') {
    return <Leaderboard onBack={() => setScreen('menu')} />
  }

  if (screen === 'gameOver') {
    return (
      <GameOver
        matchResult={matchResult}
        slot={slot}
        onPlayAgain={handlePlayAgain}
      />
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
