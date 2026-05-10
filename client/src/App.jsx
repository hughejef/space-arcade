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

    let hitEffects = []
    let previousAsteroidIds = new Set()

    // phase banner state - shows a big text overlay when phases change
    // banner has its own lifetime that ticks down each frame for fade out
    let phaseBanner = null
    let previousPhase = 'waiting'

    s.on('gameState', (state) => {
      const currentAsteroidIds = new Set(state.asteroids.map((a) => a.id || `${a.x},${a.y}`))

      gameState.asteroids.forEach((a) => {
        const id = a.id || `${a.x},${a.y}`
        if (previousAsteroidIds.has(id) && !currentAsteroidIds.has(id)) {
          hitEffects.push({
            x: a.x + 30,
            y: a.y + 11,
            lifetime: 20,
            maxLifetime: 20,
          })
        }
      })

      previousAsteroidIds = currentAsteroidIds

      // detect phase change and trigger banner
      if (state.phase !== previousPhase) {
        if (state.phase === 'phase1') {
          phaseBanner = { text: 'ASTEROID PHASE', color: '#ffaa00', lifetime: 120, maxLifetime: 120 }
        } else if (state.phase === 'phase2') {
          phaseBanner = { text: 'FIGHT!', color: '#ff4466', lifetime: 120, maxLifetime: 120 }
        }
        previousPhase = state.phase
      }

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
      const color = p.color || (p.owner === 'player1' ? '#00ff88' : '#ff4466')
      const trailDirection = p.owner === 'player1' ? -1 : 1

      ctx.shadowColor = color
      ctx.shadowBlur = 12
      ctx.fillStyle = color
      ctx.fillRect(p.x - 1, p.y, 6, 12)

      ctx.shadowBlur = 6
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(p.x, p.y + 2, 4, 8)

      ctx.shadowBlur = 0
      ctx.shadowColor = 'transparent'

      ctx.fillStyle = color + 'aa'
      ctx.fillRect(p.x, p.y + (trailDirection * 8), 4, 8)
      ctx.fillStyle = color + '66'
      ctx.fillRect(p.x, p.y + (trailDirection * 16), 4, 8)
      ctx.fillStyle = color + '33'
      ctx.fillRect(p.x, p.y + (trailDirection * 24), 4, 8)
    }

    function drawHitEffect(effect) {
      const progress = 1 - (effect.lifetime / effect.maxLifetime)
      const radius = 8 + progress * 18
      const opacity = effect.lifetime / effect.maxLifetime

      ctx.strokeStyle = `rgba(255, 200, 100, ${opacity})`
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2)
      ctx.stroke()

      ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.5})`
      ctx.beginPath()
      ctx.arc(effect.x, effect.y, radius * 0.4, 0, Math.PI * 2)
      ctx.fill()
    }

    function drawHealthBar(x, y, width, currentHealth, maxHealth, color) {
      const fillRatio = Math.max(0, Math.min(1, currentHealth / maxHealth))
      const barHeight = 4

      ctx.fillStyle = '#222244'
      ctx.fillRect(x, y, width, barHeight)

      ctx.fillStyle = color
      ctx.fillRect(x, y, width * fillRatio, barHeight)

      ctx.strokeStyle = '#ffffff44'
      ctx.lineWidth = 1
      ctx.strokeRect(x, y, width, barHeight)
    }

    function drawScorePanel(x, y, player, color, align) {
      const userName = player.userName || (color === '#00ff88' ? 'P1' : 'P2')
      const score = player.score || 0
      const health = player.health !== undefined ? player.health : 1
      const maxHealth = 1

      ctx.font = 'bold 14px monospace'
      ctx.textAlign = align
      ctx.fillStyle = color
      ctx.fillText(userName, x, y)

      ctx.font = '20px monospace'
      ctx.fillStyle = '#ffffff'
      ctx.fillText(score.toString(), x, y + 22)

      const barWidth = 80
      const barX = align === 'left' ? x : x - barWidth
      drawHealthBar(barX, y + 30, barWidth, health, maxHealth, color)
    }

    // draw a big animated phase banner across the middle of the screen
    // it scales up quickly at the start, holds, then fades out
    function drawPhaseBanner(banner) {
      const progress = 1 - (banner.lifetime / banner.maxLifetime)

      // opacity stays full for first 70% of lifetime, then fades over the last 30%
      let opacity = 1
      if (progress > 0.7) {
        opacity = 1 - ((progress - 0.7) / 0.3)
      }

      // scale ramps up quickly in the first 15% then stays at 1
      let scale = 1
      if (progress < 0.15) {
        scale = progress / 0.15
      }

      const fontSize = 64 * scale
      ctx.save()

      // semi-transparent dark band across the canvas behind the text
      ctx.fillStyle = `rgba(10, 10, 46, ${opacity * 0.85})`
      ctx.fillRect(0, canvas.height / 2 - 50, canvas.width, 100)

      // glow effect on the text
      ctx.shadowColor = banner.color
      ctx.shadowBlur = 20
      ctx.fillStyle = banner.color
      ctx.globalAlpha = opacity
      ctx.font = `bold ${fontSize}px monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(banner.text, canvas.width / 2, canvas.height / 2)

      ctx.restore()
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

      hitEffects = hitEffects.filter((effect) => {
        if (effect.lifetime > 0) {
          drawHitEffect(effect)
          effect.lifetime -= 1
          return true
        }
        return false
      })

      drawScorePanel(20, 50, p1, '#00ff88', 'left')
      drawScorePanel(canvas.width - 20, canvas.height - 60, p2, '#ff4466', 'right')

      ctx.textAlign = 'center'
      ctx.font = '14px monospace'
      ctx.fillStyle = '#888888'
      const phaseLabel = gameState.phase === 'phase1' ? 'ASTEROID PHASE' :
                         gameState.phase === 'phase2' ? 'FIGHT PHASE' :
                         gameState.phase === 'waiting' ? 'WAITING' :
                         gameState.phase === 'ended' ? 'GAME OVER' : ''
      ctx.fillText(phaseLabel, canvas.width / 2, 20)

      // draw the phase banner on top of everything else if active
      if (phaseBanner && phaseBanner.lifetime > 0) {
        drawPhaseBanner(phaseBanner)
        phaseBanner.lifetime -= 1
      } else {
        phaseBanner = null
      }

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
