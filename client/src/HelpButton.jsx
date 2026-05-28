// glowing help button that lives in the top-left corner of any menu screen
// mirrors the mute toggle in the top-right corner for visual balance
// pulsing glow animation makes it noticeable for new players
function HelpButton({ onClick }) {
  return (
    <>
      {/* keyframes for the pulsing glow animation */}
      <style>{`
        @keyframes helpButtonPulse {
          0%, 100% {
            box-shadow: 0 0 8px #ffff0066, 0 0 16px #ffff0044;
          }
          50% {
            box-shadow: 0 0 16px #ffff00aa, 0 0 32px #ffff0066;
          }
        }
      `}</style>
      <button
        onClick={onClick}
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          background: 'transparent',
          color: '#ffff00',
          border: '2px solid #ffff00',
          borderRadius: '6px',
          padding: '6px 12px',
          fontSize: '12px',
          fontFamily: 'monospace',
          fontWeight: 'bold',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          animation: 'helpButtonPulse 1.8s ease-in-out infinite',
        }}
        title="View instructions">
        <span style={{ fontSize: '14px' }}>❓</span>
        <span>HELP</span>
      </button>
    </>
  )
}

export default HelpButton
