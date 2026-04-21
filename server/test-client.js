//https://socket.io/docs/v4/client-initialization/

const { io } = require("socket.io-client");

const socket = io('http://localhost:3001');

socket.on('state', (snapshot) => {
  console.log('snapshot:', JSON.stringify(snapshot));
});

socket.on('connect', () => {
  console.log('connected as', socket.id);
  socket.emit('input', { key: 'left', state: 'down' });
  socket.emit('input', { key: 'right', state: 'down' });
  socket.emit('input', { key: 'shoot', state: 'down' });
  socket.emit('input', { key: 'cheat', state: 'down' }); // test fail
  socket.emit('input', { key: 'left', state: 'removed' }); // test fail

  setTimeout(() => {
    socket.emit('input', { key: 'left', state: 'up' });
  }, 1000);
});