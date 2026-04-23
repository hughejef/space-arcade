const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const RoomManager = require('./game/RoomManager.js')
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map


const allowedInput = ['left', 'right', 'shoot'];
 
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }});
app.get('/', (req, res) => {
  res.send('Space Arcade server is running');
});
//create room manager
const roomManager = new RoomManager();

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  //create room
  socket.on('create_game', ({ userName }) => {
    const room = roomManager.createRoom();
    const { success, slot } = room.addPlayer(socket.id, userName);
    if (success) {
      socket.join(room.id);
      socket.emit('game_created', {matchCode: room.id, slot})
    }
  });
  //join room
  socket.on('join_game', ({ matchCode, userName }) => {
    const room = roomManager.findRoom(matchCode);
    if (!room) {
      socket.emit('join_failed', {reason: 'game_not_found'});
      return;
    }
    const { success, slot, reason } = room.addPlayer(socket.id, userName);

    if (!success) {
      socket.emit('join_failed', { reason });
      return;
    }
    socket.join(room.id);
    socket.emit('game_joined', { matchCode: room.id, slot });
  });
  
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
  
  socket.on('input', (data) => {
    console.log(`input from ${socket.id}:`, data);
  });

// TODO PR2:
// setting intervals for updating server tick snapshots
// https://javascript.info/settimeout-setinterval#setinterval
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});