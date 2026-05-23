import { useState } from 'react'
import { toggleMute, isMuted } from './audio'

// reusable mute toggle button that can be placed in any menu screen
// shows a speaker emoji with text label that flips between sound on and muted states
function MuteToggle() {
  const [muted, setMuted] = useState(isMuted())

  const handleMuteToggle = () => {
    const newMutedState = toggleMute()
    setMuted(newMutedState)
  }

  return (
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
        fontSize: '12px',
        fontFamily: 'monospace',
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}
      title={muted ? 'Click to unmute' : 'Click to mute'}>
      <span style={{ fontSize: '14px' }}>{muted ? '🔇' : '🔊'}</span>
      <span>SOUND {muted ? 'OFF' : 'ON'}</span>
    </button>
  )
}

export default MuteToggle
