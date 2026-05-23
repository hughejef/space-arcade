// Test script for leaderboard functionality

const { initializeDatabase, saveScore, getTopScores } = require('./Database.js');

initializeDatabase();

saveScore('PrabhashTest', 1200);
saveScore('JeffTest', 850);
saveScore('SomeStrangerTest', 1500);

const scores = getTopScores('daily');
console.log('Top scores:', scores);