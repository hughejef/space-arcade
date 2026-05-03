//https://socket.io/docs/v4/client-initialization/

const { io } = require("socket.io-client");

//PLAYER 1

const socketA = io('http://localhost:3001');
let matchCode = null; // collect match code to pass to player 2 join game

socketA.on('connect', () => {
  console.log('Player 1 connected as', socketA.id);
  socketA.emit('create_game', {userName: 'JEFF'});
});

socketA.on('game_created', (response) => {
  console.log('Player 1: Room created: ', response.matchCode, 'slot: ', response.slot);
  matchCode = response.matchCode;

  startPlayer2();

  setTimeout(() => {
    console.log('Player 1 disconnecting... ');
    socketA.disconnect();
  }, 5000);
});

//PLAYER 2
function startPlayer2() {
  const socketB = io('http://localhost:3001');


  socketB.on('connect', () => {
    console.log('Player 2 connected as ', socketB.id);
    socketB.emit('join_game', {matchCode, userName: 'PRABHASH'});
  });

  socketB.on('game_joined', (response) => {
    console.log('player 2 joined room: ', response.matchCode, 'slot: ', response.slot);
    setTimeout(() => {
      console.log('Player 2 disconnecting...');
      socketB.disconnect();
    }, 2000);
  })


}