import { useState } from 'react'
import { toggleMute, isMuted } from './audio'

function Menu({ userName, setUserName, onCreateGame, onJoinGame, onLeaderboard }) {
  const [muted, setMuted] = useState(isMuted())

  const handleMuteToggle = () => {
    const newMutedState = toggleMute()
    setMuted(newMutedState)
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
        {/* mute toggle button in the top-right corner of the menu box */}
        <button
          onClick={handleMuteToggle}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            color: muted ? '#888' : '#00ff88',
            border: `2px solid ${muted ? '#444' : '#00ff88'}`,
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '14px',
            fontFamily: 'monospace',
            cursor: 'pointer',
          }}
          title={muted ? 'Unmute' : 'Mute'}>
          {muted ? '🔇' : '🔊'}
        </button>

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
              background: '#1a1a3e',
              border: '2px solid #4444ff',
              borderRadius: '6px',
              padding: '10px 16px',
              fontSize: '16px',
              color: '#ffffff',
              textAlign: 'center',
              fontFamily: 'monospace',
              outline: 'none',
              width: '220px',
              marginBottom: '20px',
            }}
          />

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            width: '250px',
            margin: '0 auto',
          }}>
            <button
              disabled={!userName.trim()}
              onClick={onCreateGame}
              style={{
                padding: '14px',
                background: userName.trim() ? '#00ff88' : '#00ff8844',
                color: '#0a0a2e',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontFamily: 'monospace',
                fontWeight: 'bold',
                cursor: userName.trim() ? 'pointer' : 'not-allowed',
              }}>
              CREATE GAME
            </button>
            <button
              disabled={!userName.trim()}
              onClick={onJoinGame}
              style={{
                padding: '14px',
                background: 'transparent',
                color: userName.trim() ? '#00ff88' : '#00ff8844',
                border: `2px solid ${userName.trim() ? '#00ff88' : '#00ff8844'}`,
                borderRadius: '6px',
                fontSize: '16px',
                fontFamily: 'monospace',
                fontWeight: 'bold',
                cursor: userName.trim() ? 'pointer' : 'not-allowed',
              }}>
              JOIN GAME
            </button>
            <button
              onClick={onLeaderboard}
              style={{
                padding: '14px',
                background: 'transparent',
                color: '#888',
                border: '2px solid #444',
                borderRadius: '6px',
                fontSize: '16px',
                fontFamily: 'monospace',
                cursor: 'pointer',
              }}>
              LEADERBOARD
            </button>
            <button
              onClick={() => window.close()}
              style={{
                padding: '14px',
                background: 'transparent',
                color: '#ff4466',
                border: '2px solid #ff446644',
                borderRadius: '6px',
                fontSize: '16px',
                fontFamily: 'monospace',
                cursor: 'pointer',
              }}>
              QUIT
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Menu
