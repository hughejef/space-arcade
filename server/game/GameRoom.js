// Leveraging socket.io's native 'room' functionality
// https://socket.io/docs/v3/rooms/
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes

const Player = require('./Player.js');
const { SPAWN }= require('./constants');

class GameRoom {
    // initial plan is to initiate player object with pre-defined socketId, x_pos, y_pos, and health. 
    // I'm fine with with changing this if we want
    constructor(id) {
        this.id = id; // id will be 5 digit alphanumeric room code
        this.playerMap = {player1: null, player2: null}; // two players, map of socket id, userName, ship state, and player score
        this.asteroids = []; // list of asteroids and their positions in arena
        this.projectiles = []; // list of projectiles and their positions in arena
        this.phase = "waiting";   // waiting for player 2, phase 1, phase 2, end
        this.createdTime = Date.now();
    }
    isEmpty() {
    return this.playerMap.player1 === null && this.playerMap.player2 === null;
    }

    isFull() {
    return this.playerMap.player1 !== null && this.playerMap.player2 !== null;
    }

    addPlayer(socketId, userName){
        // check if full
        if (this.isFull()) {
            return {success: false, reason: 'full'};
        }

        // decide player slotting
        let slot;
        if (this.playerMap.player1 === null) {
            slot = 'player1';
        } else {
            slot = 'player2';
        };

        // assign spawn coordinates to correct player based on slot
        const { x, y } = SPAWN[slot];

        // facing down or up will determine which way projectiles fire
        const facing = slot === 'player1' ? 'down' : 'up';

        // create player in game (1 health for now)
        const player = new Player(socketId, x, y, 1, userName, facing);
        
        // add to player map
        this.playerMap[slot] = player;

        // if game is now full, launch game (start phase1)
        if (this.isFull()) {
        this.phase = 'phase1';
        }

        return {success: true, slot };
    }
};

module.exports = GameRoom;