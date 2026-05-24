// https://sqlite.org/index.html


const Database = require('better-sqlite3');

// open database
const db = new Database('leaderboard.db');

// initialize database
function initializeDatabase() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS Leaderboard (
            playerName TEXT,
            score INTEGER,
            timestamp INTEGER
        )
    `);
}

// insert scores into db when match ends
function saveScore(playerName, score) {
    const stmt = db.prepare(`
        INSERT INTO Leaderboard (playerName, score, timestamp)
        VALUES (?, ?, ?)
    `);
    stmt.run(playerName, score, Math.floor(Date.now() / 1000));
}

// retrieve scores from db for Leaderboard display
function getTopScores(period) {                // period is 'daily', 'weekly', or 'monthly'
    const now = Math.floor(Date.now() / 1000); //convert current datetime to seconds

    const periodSeconds = {
        daily: 60 * 60 * 24, // last 24 hours
        weekly: 60 * 60 * 24 * 7, // last 7 days
        monthly: 60 * 60 * 24 * 30 // last 30 days
    };

    const cutoff = now - periodSeconds[period];

    const stmt = db.prepare(`
        SELECT playerName, score, timestamp
        FROM Leaderboard
        WHERE timestamp >= ?
        ORDER BY score DESC
        LIMIT 10
    `);

    return stmt.all(cutoff);
}

// clear database function to remove test data
function clearScores() {
    db.exec('DELETE FROM Leaderboard');
}
module.exports = { initializeDatabase, saveScore, getTopScores, clearScores };