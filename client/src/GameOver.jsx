import { useEffect } from 'react'
import { playSound } from './audio'

function GameOver({ matchResult, slot, onPlayAgain }) {
  const didIWin = matchResult?.winner === slot
  const winnerColor = didIWin ? '#00ff88' : '#ff4466'
  const winnerText = didIWin ? 'VICTORY' : 'DEFEAT'

  // play victory or defeat sound once when the game over screen mounts
  // the empty dependency array means this only runs on first render
  useEffect(() => {
    if (didIWin) {
      playSound('victory')
    } else {
      playSound('defeat')
    }
  }, [])

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: '#000',
    }}>
      <div style={{
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
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ color: winnerColor, fontSize: '48px', marginBottom: '8px' }}>
            {winnerText}
          </h1>
          <p style={{ color: '#888', fontSize: '14px', marginBottom: '30px' }}>
            Winner: {matchResult?.winner}
          </p>

          <div style={{
            background: '#1a1a3e',
            border: `2px solid ${winnerColor}`,
            borderRadius: '8px',
            padding: '20px 40px',
            marginBottom: '30px',
            minWidth: '280px',
          }}>
            <h3 style={{ color: '#ffffff', fontSize: '16px', marginBottom: '16px' }}>
              FINAL SCORES
            </h3>
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

          <button
            onClick={onPlayAgain}
            style={{
              padding: '12px 30px',
              background: '#00ff88',
              color: '#0a0a2e',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontFamily: 'monospace',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}>
            PLAY AGAIN
          </button>
        </div>
      </div>
    </div>
  )
}

export default GameOver
