const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const Player = require('./game/Player.js');

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
// on connection, new Player(socket.id); playerList.set(socket.id, player)
// on disconnect, playerList.delete(socket.id)
const playerList = new Map();
const allowedInput = ['left', 'right', 'shoot'];

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }});

app.get('/', (req, res) => {
  res.send('Space Arcade server is running');
});

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  const player = new Player(socket.id);
  playerList.set(socket.id, player);
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    playerList.delete(socket.id);
  });

  socket.on('input', (data) => {
    //console.log(`input from ${socket.id}:`, data);
    const player = playerList.get(socket.id);
    if (!player) return;

    // do nothing if valid key from list isn't pressed
    if (!allowedInput.includes(data.key)) return;
    if (data.state !== 'down' && data.state !== 'up') return;

    if (data.key === "left") player.currentInput.left = (data.state === "down");
    else if (data.key === "right") player.currentInput.right = (data.state === "down");
    else if (data.key === "shoot") player.currentInput.shoot = (data.state === "down");
    //console.log(`player state:`, player.currentInput);
  });

  
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});