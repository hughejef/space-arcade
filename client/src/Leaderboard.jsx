import { useState, useEffect } from 'react'

// the endpoint is GET /leaderboard?period=daily|weekly|monthly
// it returns an array of { playerName, score, timestamp } where timestamp is Unix seconds
const API_URL = 'https://space-arcade-production.up.railway.app'

// pick a color based on the player's rank
// gold for 1st, silver for 2nd, bronze for 3rd, white for the rest
function getRankColor(rank) {
  if (rank === 1) return '#ffd700'
  if (rank === 2) return '#c0c0c0'
  if (rank === 3) return '#cd7f32'
  return '#ffffff'
}

// format a Unix timestamp (seconds since epoch) into something readable
// example: 1779546506 becomes "May 23"
function formatDate(unixSeconds) {
  const date = new Date(unixSeconds * 1000)
  const month = date.toLocaleString('en-US', { month: 'short' })
  const day = date.getDate()
  return `${month} ${day}`
}

// fetch scores for a given period from leaderboard API
// his API returns { playerName, score, timestamp } objects, no rank field
// so we calculate rank from the array index (results come back sorted by score DESC)
async function fetchScores(period) {
  const response = await fetch(`${API_URL}/leaderboard?period=${period}`)
  if (!response.ok) {
    throw new Error(`Server returned ${response.status}`)
  }
  const rawScores = await response.json()
  // normalize the API response to add rank and use a consistent field name
  return rawScores.map((entry, index) => ({
    rank: index + 1,
    userName: entry.playerName,
    score: entry.score,
    timestamp: entry.timestamp,
  }))
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
