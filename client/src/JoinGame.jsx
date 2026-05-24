import { useState } from 'react'
import MuteToggle from './MuteToggle'

function JoinGame({ userName, joinError, onJoin, onBack }) {
  const [joinCode, setJoinCode] = useState('')

  const handleJoinClick = () => {
    if (joinCode.length === 4) {
      onJoin(joinCode)
    }
  }

  const handleBackClick = () => {
    setJoinCode('')
    onBack()
  }

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
        <MuteToggle />

        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#ff4466', fontSize: '24px', marginBottom: '8px' }}>
            JOIN GAME
          </h2>
          <p style={{ color: '#ff4466aa', fontSize: '12px', marginBottom: '20px' }}>
            Playing as: {userName}
          </p>
          <p style={{ color: '#888', fontSize: '14px', marginBottom: '12px' }}>
            Enter the match code:
          </p>
          <input
            type="text"
            maxLength={4}
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            style={{
              background: '#1a1a3e',
              border: '2px solid #ff4466',
              borderRadius: '8px',
              padding: '16px 20px',
              fontSize: '28px',
              color: '#ff4466',
              textAlign: 'center',
              letterSpacing: '8px',
              fontFamily: 'monospace',
              outline: 'none',
              width: '200px',
              marginBottom: '16px',
            }}
          />

          {joinError && (
            <p style={{ color: '#ff4466', fontSize: '12px', marginBottom: '12px' }}>
              {joinError}
            </p>
          )}

          <br />
          <button
            onClick={handleJoinClick}
            style={{
              padding: '12px 30px',
              background: '#ff4466',
              color: '#0a0a2e',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontFamily: 'monospace',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginBottom: '12px',
            }}>
            JOIN
          </button>
          <br />
          <button
            onClick={handleBackClick}
            style={{
              padding: '10px 30px',
              background: 'transparent',
              color: '#888',
              border: '2px solid #444',
              borderRadius: '6px',
              fontSize: '14px',
              fontFamily: 'monospace',
              cursor: 'pointer',
              marginTop: '8px',
            }}>
            BACK
          </button>
        </div>
      </div>
    </div>
  )
}

export default JoinGame
