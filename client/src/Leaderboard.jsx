import { useState, useEffect } from 'react'

// each entry has username, score, and timestamp of when the score was set
const MOCK_LEADERBOARD = {
  daily: [
    { rank: 1, userName: 'StarFox', score: 1850, timestamp: '2026-04-30T14:22:00Z' },
    { rank: 2, userName: 'NovaPilot', score: 1640, timestamp: '2026-04-30T11:15:00Z' },
    { rank: 3, userName: 'CometRider', score: 1520, timestamp: '2026-04-30T18:47:00Z' },
    { rank: 4, userName: 'AstroAce', score: 1410, timestamp: '2026-04-30T09:33:00Z' },
    { rank: 5, userName: 'VoidHunter', score: 1290, timestamp: '2026-04-30T20:12:00Z' },
  ],
  weekly: [
    { rank: 1, userName: 'GalaxyGod', score: 2340, timestamp: '2026-04-28T16:30:00Z' },
    { rank: 2, userName: 'StarFox', score: 1850, timestamp: '2026-04-30T14:22:00Z' },
    { rank: 3, userName: 'PulsarKing', score: 1780, timestamp: '2026-04-26T13:05:00Z' },
    { rank: 4, userName: 'NovaPilot', score: 1640, timestamp: '2026-04-30T11:15:00Z' },
    { rank: 5, userName: 'CometRider', score: 1520, timestamp: '2026-04-30T18:47:00Z' },
  ],
  monthly: [
    { rank: 1, userName: 'NebulaQueen', score: 3120, timestamp: '2026-04-12T22:18:00Z' },
    { rank: 2, userName: 'GalaxyGod', score: 2340, timestamp: '2026-04-28T16:30:00Z' },
    { rank: 3, userName: 'BlackHole99', score: 2180, timestamp: '2026-04-15T10:42:00Z' },
    { rank: 4, userName: 'StarFox', score: 1850, timestamp: '2026-04-30T14:22:00Z' },
    { rank: 5, userName: 'PulsarKing', score: 1780, timestamp: '2026-04-26T13:05:00Z' },
  ],
}

function Leaderboard({ onBack }) {
  const [period, setPeriod] = useState('daily')
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(false)

  // load scores whenever the period changes
  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => {
      setScores(MOCK_LEADERBOARD[period] || [])
      setLoading(false)
    }, 200)
    return () => clearTimeout(timer)
  }, [period])

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
      }}>
        <div style={{ textAlign: 'center', width: '90%' }}>
          <h2 style={{ color: '#ffff00', fontSize: '32px', marginBottom: '16px' }}>LEADERBOARD</h2>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '20px',
          }}>
            {['daily', 'weekly', 'monthly'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                style={{
                  padding: '8px 20px',
                  background: period === p ? '#ffff00' : 'transparent',
                  color: period === p ? '#0a0a2e' : '#ffff00',
                  border: '2px solid #ffff00',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontFamily: 'monospace',
                  fontWeight: period === p ? 'bold' : 'normal',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                }}>
                {p}
              </button>
            ))}
          </div>

          {loading && (
            <p style={{ color: '#888', fontSize: '14px' }}>Loading scores...</p>
          )}

          {!loading && scores.length === 0 && (
            <p style={{ color: '#888', fontSize: '14px' }}>No scores yet for this period</p>
          )}

          {!loading && scores.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              {scores.map((entry) => (
                <div key={entry.rank} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 16px',
                  color: '#fff',
                  fontSize: '14px',
                }}>
                  <span>#{entry.rank} {entry.userName}</span>
                  <span>{entry.score}</span>
                </div>
              ))}
            </div>
          )}

          <button onClick={onBack} style={{
            marginTop: '30px',
            padding: '10px 30px',
            background: 'transparent',
            color: '#888',
            border: '2px solid #444',
            borderRadius: '6px',
            fontSize: '14px',
            fontFamily: 'monospace',
            cursor: 'pointer',
          }}>BACK</button>
        </div>
      </div>
    </div>
  )
}

export default Leaderboard
