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

// flag to switch between mock data and live API
// flip this to true once Jeffrey's leaderboard backend is hooked up
const USE_MOCK_DATA = true

const API_URL = 'http://localhost:3001'

// pick a color based on the player's rank
// gold for 1st, silver for 2nd, bronze for 3rd, white for the rest
function getRankColor(rank) {
  if (rank === 1) return '#ffd700'
  if (rank === 2) return '#c0c0c0'
  if (rank === 3) return '#cd7f32'
  return '#ffffff'
}

// format an ISO timestamp into something readable
// example: "2026-04-30T14:22:00Z" becomes "Apr 30"
function formatDate(timestamp) {
  const date = new Date(timestamp)
  const month = date.toLocaleString('en-US', { month: 'short' })
  const day = date.getDate()
  return `${month} ${day}`
}

// fetch scores for a given period from either the mock data or the real API
// returns a promise that resolves to an array of score entries
async function fetchScores(period) {
  if (USE_MOCK_DATA) {
    // simulate a small delay so the loading state is visible
    await new Promise((resolve) => setTimeout(resolve, 200))
    return MOCK_LEADERBOARD[period] || []
  }

  // real API call once backend is ready
  const response = await fetch(`${API_URL}/leaderboard?period=${period}`)
  if (!response.ok) {
    throw new Error(`Server returned ${response.status}`)
  }
  return await response.json()
}

function Leaderboard({ onBack }) {
  const [period, setPeriod] = useState('daily')
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // load scores whenever the period changes
  useEffect(() => {
    let cancelled = false

    async function loadScores() {
      setLoading(true)
      setError('')
      try {
        const data = await fetchScores(period)
        if (!cancelled) {
          setScores(data)
        }
      } catch (err) {
        if (!cancelled) {
          setError('Could not load leaderboard. Please try again.')
          setScores([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadScores()

    // cleanup so we don't update state if the component unmounts mid-fetch
    return () => {
      cancelled = true
    }
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

          {!loading && error && (
            <p style={{ color: '#ff4466', fontSize: '14px' }}>{error}</p>
          )}

          {!loading && !error && scores.length === 0 && (
            <p style={{ color: '#888', fontSize: '14px' }}>No scores yet for this period</p>
          )}

          {!loading && !error && scores.length > 0 && (
            <div style={{
              background: '#1a1a3e',
              border: '1px solid #4444ff',
              borderRadius: '8px',
              padding: '16px 20px',
              marginTop: '10px',
            }}>
              {/* column headers for the score list */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '50px 1fr 100px 80px',
                padding: '6px 12px',
                color: '#888',
                fontSize: '11px',
                textTransform: 'uppercase',
                borderBottom: '1px solid #4444ff44',
                marginBottom: '6px',
              }}>
                <span style={{ textAlign: 'left' }}>Rank</span>
                <span style={{ textAlign: 'left' }}>Player</span>
                <span style={{ textAlign: 'right' }}>Score</span>
                <span style={{ textAlign: 'right' }}>Date</span>
              </div>

              {scores.map((entry) => (
                <div key={entry.rank} style={{
                  display: 'grid',
                  gridTemplateColumns: '50px 1fr 100px 80px',
                  padding: '8px 12px',
                  fontSize: '14px',
                  color: getRankColor(entry.rank),
                  fontWeight: entry.rank <= 3 ? 'bold' : 'normal',
                  borderBottom: '1px solid #4444ff22',
                }}>
                  <span style={{ textAlign: 'left' }}>#{entry.rank}</span>
                  <span style={{ textAlign: 'left' }}>{entry.userName}</span>
                  <span style={{ textAlign: 'right' }}>{entry.score.toLocaleString()}</span>
                  <span style={{ textAlign: 'right', color: '#888', fontWeight: 'normal' }}>
                    {formatDate(entry.timestamp)}
                  </span>
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
