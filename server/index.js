const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const RoomManager = require('./game/RoomManager.js');
const { TICK } = require('./game/constants.js');


const allowedInput = ['left', 'right', 'shoot'];

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});
app.get('/', (req, res) => {
  res.send('Space Arcade server is running');
});

const roomManager = new RoomManager(io);

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  // save this section for debugging until project is complete
  //socket.onAny((eventName, ...args) => {
  //  console.log('socket', socket.id, 'received event:', eventName, 'args:', args);
  //});

  socket.on('create_game', (userName) => {
    const room = roomManager.createRoom();
    const { success, slot } = room.addPlayer(socket.id, userName);
    if (success) {
      socket.join(room.id);
      socket.emit('game_created', { matchCode: room.id, slot });
    }
  });

  socket.on('join_game', (matchCode, userName) => {
    const room = roomManager.findRoom(matchCode);
    if (!room) {
      socket.emit('join_failed', { reason: 'game_not_found' });
      return;
    }
    const { success, slot, reason } = room.addPlayer(socket.id, userName);
    if (!success) {
      socket.emit('join_failed', { reason });
      return;
    }
    socket.join(room.id);
    socket.emit('game_joined', { matchCode: room.id, slot });

    // need to move both players to arena when game is full
    // AI suggested a match_started event to ensure player 1 joins game upon player 2 joining
    if (room.isFull()) {
      io.to(room.id).emit('match_started');
    }
  });

  socket.on('disconnecting', () => {
    console.log(`Client disconnecting: ${socket.id}`);
    for (const code of socket.rooms) {
      if (code === socket.id) continue;
      const room = roomManager.findRoom(code);
      if (!room) continue;
      room.removePlayer(socket.id);
      if (room.isEmpty()) {
        roomManager.deleteRoom(code);
      }
    }
  });

  socket.on('input', ({ key, state }) => {
    // console.log('INPUT EVENT received from', socket.id, 'key:', key, 'state:', state);
    for (const code of socket.rooms) {
      if (code === socket.id) continue;
      const room = roomManager.findRoom(code);
      if (!room) continue;
      const slot = room.getSlot(socket.id);
      if (!slot) continue;
      const player = room.playerMap[slot];
      player.currentInput[key] = (state === 'down');
      // console.log('input set', slot, key, state);
    }
  });

});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});