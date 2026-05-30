import MuteToggle from './MuteToggle'

// reusable styled key component for showing keyboard shortcuts in the controls section
// matches the kbd styling used in the main menu controls hint
function Key({ children }) {
  return (
    <kbd style={{
      background: '#1a1a3e',
      border: '1px solid #4444ff',
      borderRadius: '4px',
      padding: '4px 10px',
      color: '#00ff88',
      fontFamily: 'monospace',
      fontWeight: 'bold',
      fontSize: '13px',
      display: 'inline-block',
      minWidth: '20px',
      textAlign: 'center',
    }}>{children}</kbd>
  )
}

// section header used at the top of each instruction section
// color prop lets each section have a unique accent color so they pop visually
function SectionHeader({ color, children }) {
  return (
    <h3 style={{
      color: color,
      fontSize: '15px',
      marginTop: '0',
      marginBottom: '8px',
      letterSpacing: '1px',
      textShadow: `0 0 8px ${color}66`,
    }}>{children}</h3>
  )
}

// wrapper around each section with consistent spacing and a subtle divider
function Section({ children }) {
  return (
    <div style={{
      marginBottom: '14px',
      textAlign: 'left',
      paddingBottom: '12px',
      borderBottom: '1px solid #4444ff33',
    }}>{children}</div>
  )
}

function Instructions({ onBack }) {
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

        <div style={{
          width: '88%',
          maxHeight: '88%',
          overflowY: 'auto',
          padding: '20px 0',
        }}>
          <h2 style={{
            color: '#ffff00',
            fontSize: '28px',
            textAlign: 'center',
            marginTop: '0',
            marginBottom: '20px',
            textShadow: '0 0 16px #ffff0066',
          }}>HOW TO PLAY</h2>

          {/* getting started: username + create or join */}
          <Section>
            <SectionHeader color="#00ff88">GETTING STARTED</SectionHeader>
            <p style={{ color: '#ccc', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
              Enter a username on the main menu. To start a new match, click <strong style={{ color: '#00ff88' }}>CREATE GAME</strong>. You will get a 4-digit code to share with your friend. To join an existing match, click <strong style={{ color: '#00ff88' }}>JOIN GAME</strong> and enter the code your friend shared with you.
            </p>
          </Section>

          {/* controls: arrow keys and space */}
          <Section>
            <SectionHeader color="#ffff00">CONTROLS</SectionHeader>
            <div style={{
              display: 'flex',
              gap: '24px',
              flexWrap: 'wrap',
              alignItems: 'center',
              fontSize: '13px',
              color: '#ccc',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Key>←</Key>
                <span>Move left</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Key>→</Key>
                <span>Move right</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Key>SPACE</Key>
                <span>Shoot</span>
              </div>
            </div>
          </Section>

          {/* phase 1: destroy asteroids for points and armor */}
          <Section>
            <SectionHeader color="#ff8800">PHASE 1 — ASTEROID PHASE</SectionHeader>
            <p style={{ color: '#ccc', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
              Destroy asteroids to score points and build up your armor. Every <strong style={{ color: '#ff8800' }}>10 asteroids destroyed</strong> earns you 1 armor heart, up to a max of 3 hearts. The more aggressive you are in phase 1, the better your chances in phase 2. When all asteroids are cleared, phase 2 begins.
            </p>
          </Section>

          {/* phase 2: fight to the death */}
          <Section>
            <SectionHeader color="#ff4466">PHASE 2 — FIGHT PHASE</SectionHeader>
            <p style={{ color: '#ccc', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
              Battle your opponent in a dogfight. Each hit removes 1 armor heart. <strong style={{ color: '#ff4466' }}>3 hits and you are out.</strong> The last ship standing wins the match and earns a <strong style={{ color: '#00ff88' }}>+50 bonus</strong> on top of their phase 1 score. Tip: projectiles bounce off walls so watch your angles.
            </p>
          </Section>

          {/* leaderboard: check standings after */}
          <Section>
            <SectionHeader color="#ffd700">LEADERBOARD</SectionHeader>
            <p style={{ color: '#ccc', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
              After each match, your score is saved to the leaderboard. Click the <strong style={{ color: '#ffff00' }}>LEADERBOARD</strong> button on the main menu to view your standings filtered by <strong style={{ color: '#ffd700' }}>daily</strong>, <strong style={{ color: '#c0c0c0' }}>weekly</strong>, or <strong style={{ color: '#cd7f32' }}>monthly</strong>. Climb to the top by stacking wins.
            </p>
          </Section>

          <div style={{ textAlign: 'center', marginTop: '8px' }}>
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
              }}>
              BACK
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Instructions
