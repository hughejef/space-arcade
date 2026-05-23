import { useRef, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import Menu from './Menu'
import Lobby from './Lobby'
import JoinGame from './JoinGame'
import Leaderboard from './Leaderboard'
import GameOver from './GameOver'
import { playSound, startBgMusic, stopBgMusic } from './audio'

let socket = null

// Railway for online play socket connecton -jh
function getSocket() {
  if (!socket) {
    socket = io('https://space-arcade-production.up.railway.app')
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

    // player 1's screen is not updating when player 2 joins. added new match_started event to tell player 1 to get in game -JH
    s.on('match_started', () => {
    console.log('match started')
    setScreen('game')
    })
    // end of new code block -JH

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
      s.off('match_started') // added to return -JH
      s.off('join_failed')
      s.off('end_of_match')
    }
  }, [])

  // start background music on menu/lobby/join/leaderboard screens
  // stop it when the game starts so it doesnt compete with sound effects
  // game over also gets music since theres victory/defeat sounds but no constant gameplay sounds
  useEffect(() => {
    if (screen === 'game') {
      stopBgMusic()
    } else {
      startBgMusic()
    }
  }, [screen])

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

    let interpolation = {
      player1: { prevX: 380, prevY: 40, currX: 380, currY: 40, lastUpdate: Date.now() },
      player2: { prevX: 380, prevY: 516, currX: 380, currY: 516, lastUpdate: Date.now() },
    }

    let hitEffects = []
    let previousAsteroidIds = new Set()
    let phaseBanner = null
    let previousPhase = 'waiting'

    let hitFlashes = {
      player1: { lifetime: 0, maxLifetime: 15 },
      player2: { lifetime: 0, maxLifetime: 15 },
    }
    let previousHealth = {
      player1: 1,
      player2: 1,
    }

    let shipExplosions = []

    // wall bounce effects spawn when a projectile reverses horizontal direction
    // we track each projectile's last x position and direction to detect bounces
    let bounceEffects = []
    let projectileTracking = new Map() // id -> { lastX, lastDirection }

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
          playSound('asteroidHit')
        }
      })

      previousAsteroidIds = currentAsteroidIds

      // detect projectile bounces by tracking direction changes
      // if a projectile is near the edge and its horizontal direction flipped, spawn a bounce effect
      const newProjectileTracking = new Map()
      state.projectiles.forEach((p) => {
        const id = p.id || `${p.owner}-${p.spawnTime || ''}`
        const tracked = projectileTracking.get(id)
        if (!tracked && !projectileTracking.has(id)) {
          // this is a brand new projectile, play the laser sound
          playSound('laser')
        }
        if (tracked) {
          const newDirection = p.x > tracked.lastX ? 1 : (p.x < tracked.lastX ? -1 : tracked.lastDirection)
          if (tracked.lastDirection !== 0 && newDirection !== 0 && tracked.lastDirection !== newDirection) {
            // direction flipped, must have bounced off a wall
            // figure out which wall based on which edge the projectile is near
            const bounceX = p.x < 50 ? 12 : (p.x > canvas.width - 50 ? canvas.width - 12 : p.x)
            bounceEffects.push({
              x: bounceX,
              y: p.y,
              lifetime: 12,
              maxLifetime: 12,
            })
            playSound('bounce')
          }
          newProjectileTracking.set(id, { lastX: p.x, lastDirection: newDirection })
        } else {
          newProjectileTracking.set(id, { lastX: p.x, lastDirection: 0 })
        }
      })
      projectileTracking = newProjectileTracking

      if (state.phase !== previousPhase) {
        if (state.phase === 'phase1') {
          phaseBanner = { text: 'ASTEROID PHASE', color: '#ffaa00', lifetime: 120, maxLifetime: 120 }
        } else if (state.phase === 'phase2') {
          phaseBanner = { text: 'FIGHT!', color: '#ff4466', lifetime: 120, maxLifetime: 120 }
        }
        previousPhase = state.phase
      }

      const now = Date.now()
      ;['player1', 'player2'].forEach((slot) => {
        const prev = interpolation[slot]
        const newPlayer = state.players[slot]
        interpolation[slot] = {
          prevX: prev.currX,
          prevY: prev.currY,
          currX: newPlayer.x,
          currY: newPlayer.y,
          lastUpdate: now,
        }

        const newHealth = newPlayer.health !== undefined ? newPlayer.health : 1
        if (newHealth < previousHealth[slot]) {
          hitFlashes[slot].lifetime = hitFlashes[slot].maxLifetime
          playSound('shipHit')
        }

        if (newHealth <= 0 && previousHealth[slot] > 0) {
          spawnShipExplosion(newPlayer.x + 20, newPlayer.y + 22, slot === 'player1' ? '#00ff88' : '#ff4466')
          playSound('shipExplosion')
        }

        previousHealth[slot] = newHealth
      })

      gameState = state
    })

    function spawnShipExplosion(x, y, color) {
      const particles = []
      for (let i = 0; i < 16; i++) {
        const angle = (Math.PI * 2 * i) / 16 + Math.random() * 0.4
        const speed = 2 + Math.random() * 3
        particles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
        })
      }
      shipExplosions.push({
        x: x,
        y: y,
        color: color,
        particles: particles,
        lifetime: 45,
        maxLifetime: 45,
      })
    }

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

    function getInterpolatedPosition(slot) {
      const interp = interpolation[slot]
      const elapsed = Date.now() - interp.lastUpdate
      const t = Math.min(1, elapsed / 30)
      return {
        x: interp.prevX + (interp.currX - interp.prevX) * t,
        y: interp.prevY + (interp.currY - interp.prevY) * t,
      }
    }

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

    function drawHitFlash(x, y, w, h, lifetime, maxLifetime) {
      const opacity = lifetime / maxLifetime
      ctx.fillStyle = `rgba(255, 50, 50, ${opacity * 0.7})`
      ctx.fillRect(x - 4, y - 4, w + 8, h + 8)
    }

    function drawShipExplosion(explosion) {
      const progress = 1 - (explosion.lifetime / explosion.maxLifetime)
      const opacity = explosion.lifetime / explosion.maxLifetime

      const outerRadius = 10 + progress * 50
      ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.8})`
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.arc(explosion.x, explosion.y, outerRadius, 0, Math.PI * 2)
      ctx.stroke()

      const middleRadius = 5 + progress * 35
      const colorRgb = explosion.color === '#00ff88' ? '0, 255, 136' : '255, 68, 102'
      ctx.strokeStyle = `rgba(${colorRgb}, ${opacity})`
      ctx.lineWidth = 5
      ctx.beginPath()
      ctx.arc(explosion.x, explosion.y, middleRadius, 0, Math.PI * 2)
      ctx.stroke()

      ctx.fillStyle = `rgba(255, 255, 200, ${opacity * 0.9})`
      ctx.beginPath()
      ctx.arc(explosion.x, explosion.y, 8 * opacity, 0, Math.PI * 2)
      ctx.fill()

      explosion.particles.forEach((particle) => {
        particle.x += particle.vx
        particle.y += particle.vy
        particle.vy += 0.05
        particle.vx *= 0.98
        particle.vy *= 0.98

        ctx.fillStyle = `rgba(${colorRgb}, ${opacity})`
        ctx.fillRect(particle.x - 2, particle.y - 2, 4, 4)
      })
    }

    // draw a small spark effect at the wall bounce point
    // a quick burst of bright sparks that fade fast since bounces happen often
    function drawBounceEffect(effect) {
      const opacity = effect.lifetime / effect.maxLifetime
      const radius = (1 - opacity) * 12 + 4

      // bright white center spark
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
      ctx.beginPath()
      ctx.arc(effect.x, effect.y, radius * 0.4, 0, Math.PI * 2)
      ctx.fill()

      // yellow outer ring
      ctx.strokeStyle = `rgba(255, 230, 100, ${opacity * 0.8})`
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2)
      ctx.stroke()
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

    function drawPhaseBanner(banner) {
      const progress = 1 - (banner.lifetime / banner.maxLifetime)

      let opacity = 1
      if (progress > 0.7) {
        opacity = 1 - ((progress - 0.7) / 0.3)
      }

      let scale = 1
      if (progress < 0.15) {
        scale = progress / 0.15
      }

      const fontSize = 64 * scale
      ctx.save()

      ctx.fillStyle = `rgba(10, 10, 46, ${opacity * 0.85})`
      ctx.fillRect(0, canvas.height / 2 - 50, canvas.width, 100)

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

      const p1Pos = getInterpolatedPosition('player1')
      const p2Pos = getInterpolatedPosition('player2')

      const p1 = gameState.players.player1
      const p2 = gameState.players.player2

      if ((p1.health !== undefined ? p1.health : 1) > 0) {
        ctx.font = '11px monospace'
        ctx.textAlign = 'center'
        ctx.fillStyle = '#00ff88'
        ctx.fillText('P1', p1Pos.x + shipWidth / 2, p1Pos.y + 10)
        drawShip(p1Pos.x, p1Pos.y, shipWidth, shipHeight, '#00ff88', false)
        if (hitFlashes.player1.lifetime > 0) {
          drawHitFlash(p1Pos.x, p1Pos.y, shipWidth, shipHeight, hitFlashes.player1.lifetime, hitFlashes.player1.maxLifetime)
          hitFlashes.player1.lifetime -= 1
        }
      }

      if ((p2.health !== undefined ? p2.health : 1) > 0) {
        ctx.font = '11px monospace'
        ctx.textAlign = 'center'
        ctx.fillStyle = '#ff4466'
        ctx.fillText('P2', p2Pos.x + shipWidth / 2, p2Pos.y + shipHeight - 1)
        drawShip(p2Pos.x, p2Pos.y, shipWidth, shipHeight, '#ff4466', true)
        if (hitFlashes.player2.lifetime > 0) {
          drawHitFlash(p2Pos.x, p2Pos.y, shipWidth, shipHeight, hitFlashes.player2.lifetime, hitFlashes.player2.maxLifetime)
          hitFlashes.player2.lifetime -= 1
        }
      }

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

      // tick down bounce effects and remove dead ones
      bounceEffects = bounceEffects.filter((effect) => {
        if (effect.lifetime > 0) {
          drawBounceEffect(effect)
          effect.lifetime -= 1
          return true
        }
        return false
      })

      shipExplosions = shipExplosions.filter((explosion) => {
        if (explosion.lifetime > 0) {
          drawShipExplosion(explosion)
          explosion.lifetime -= 1
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
