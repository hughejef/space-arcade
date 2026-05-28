import { useState } from 'react'
import MuteToggle from './MuteToggle'
import HelpButton from './HelpButton'

function Menu({ userName, setUserName, onCreateGame, onJoinGame, onLeaderboard, onHelp }) {
  const [hoveredButton, setHoveredButton] = useState(null)

  // helper to determine if a button should show its hover state
  // returns true if this button is hovered AND it's not disabled
  const isHovered = (buttonName, disabled = false) => {
    return hoveredButton === buttonName && !disabled
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
        <HelpButton onClick={onHelp} />
        <MuteToggle />

        <div style={{ textAlign: 'center' }}>
          <h1 style={{ color: '#00ff88', fontSize: '48px', marginBottom: '8px' }}>SPACE ARCADE</h1>
          <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>1v1 space shooter</p>

          {/* controls hint section so new players know how to play */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            marginBottom: '20px',
            fontSize: '11px',
            color: '#888',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <kbd style={{
                background: '#1a1a3e',
                border: '1px solid #4444ff',
                borderRadius: '4px',
                padding: '3px 8px',
                color: '#00ff88',
                fontFamily: 'monospace',
                fontWeight: 'bold',
              }}>←</kbd>
              <span>LEFT</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <kbd style={{
                background: '#1a1a3e',
                border: '1px solid #4444ff',
                borderRadius: '4px',
                padding: '3px 8px',
                color: '#00ff88',
                fontFamily: 'monospace',
                fontWeight: 'bold',
              }}>→</kbd>
              <span>RIGHT</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <kbd style={{
                background: '#1a1a3e',
                border: '1px solid #4444ff',
                borderRadius: '4px',
                padding: '3px 8px',
                color: '#00ff88',
                fontFamily: 'monospace',
                fontWeight: 'bold',
              }}>SPACE</kbd>
              <span>SHOOT</span>
            </div>
          </div>

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
              onMouseEnter={() => setHoveredButton('create')}
              onMouseLeave={() => setHoveredButton(null)}
              onClick={onCreateGame}
              style={{
                padding: '14px',
                background: userName.trim() ? (isHovered('create') ? '#00cc66' : '#00ff88') : '#00ff8844',
                color: '#0a0a2e',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontFamily: 'monospace',
                fontWeight: 'bold',
                cursor: userName.trim() ? 'pointer' : 'not-allowed',
                transform: isHovered('create') ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.15s ease',
              }}>
              CREATE GAME
            </button>
            <button
              disabled={!userName.trim()}
              onMouseEnter={() => setHoveredButton('join')}
              onMouseLeave={() => setHoveredButton(null)}
              onClick={onJoinGame}
              style={{
                padding: '14px',
                background: isHovered('join') ? '#00ff8822' : 'transparent',
                color: userName.trim() ? '#00ff88' : '#00ff8844',
                border: `2px solid ${userName.trim() ? '#00ff88' : '#00ff8844'}`,
                borderRadius: '6px',
                fontSize: '16px',
                fontFamily: 'monospace',
                fontWeight: 'bold',
                cursor: userName.trim() ? 'pointer' : 'not-allowed',
                transform: isHovered('join') ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.15s ease',
              }}>
              JOIN GAME
            </button>
            <button
              onMouseEnter={() => setHoveredButton('leaderboard')}
              onMouseLeave={() => setHoveredButton(null)}
              onClick={onLeaderboard}
              style={{
                padding: '14px',
                background: isHovered('leaderboard') ? '#ffff0022' : 'transparent',
                color: '#ffff00',
                border: `2px solid ${isHovered('leaderboard') ? '#ffff00' : '#ffff0088'}`,
                borderRadius: '6px',
                fontSize: '16px',
                fontFamily: 'monospace',
                fontWeight: 'bold',
                cursor: 'pointer',
                transform: isHovered('leaderboard') ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.15s ease',
              }}>
              LEADERBOARD
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Menu
