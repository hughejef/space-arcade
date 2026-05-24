import { useState } from 'react'
import { toggleMute, isMuted } from './audio'

// reusable mute toggle button that can be placed in any menu screen
// shows a speaker emoji that flips between sound-on and muted states
// position prop allows callers to pin it wherever they want via CSS positioning
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
        fontSize: '14px',
        fontFamily: 'monospace',
        cursor: 'pointer',
      }}
      title={muted ? 'Unmute' : 'Mute'}>
      {muted ? '🔇' : '🔊'}
    </button>
  )
}

export default MuteToggle
