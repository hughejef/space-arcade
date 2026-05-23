import { useState, useEffect } from 'react'
import MuteToggle from './MuteToggle'

function Lobby({ userName, slot, matchCode, onBack }) {
  // animated dots that cycle from 0 to 3 every 500ms
  // makes the "WAITING FOR OPPONENT" header feel less static
  const [dots, setDots] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev + 1) % 4)
    }, 500)
    return () => clearInterval(interval)
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
        <MuteToggle />

        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#00ff88', fontSize: '24px', marginBottom: '8px' }}>
            WAITING FOR OPPONENT{'.'.repeat(dots)}
          </h2>
          <p style={{ color: '#00ff88aa', fontSize: '12px', marginBottom: '4px' }}>
            Playing as: {userName}
          </p>
          <p style={{ color: '#888', fontSize: '11px', marginBottom: '20px' }}>
            You are {slot}
          </p>
          <p style={{ color: '#888', fontSize: '14px', marginBottom: '12px' }}>
            Share this code with your friend:
          </p>
          <div style={{
            background: '#1a1a3e',
            border: '2px solid #00ff88',
            borderRadius: '8px',
            padding: '20px 40px',
            marginBottom: '30px',
            boxShadow: '0 0 20px #00ff8844',
          }}>
            <span style={{
              color: '#00ff88',
              fontSize: '36px',
              letterSpacing: '8px',
            }}>
              {matchCode}
            </span>
          </div>
          <button
            onClick={onBack}
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

export default Lobby