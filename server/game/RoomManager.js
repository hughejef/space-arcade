// https://socket.io/docs/v3/rooms/
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
// developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/set

const GameRoom = require('./GameRoom');
const { TICK } = require('./constants');

class RoomManager {
    constructor(io) {
    console.log('RoomManager constructor called with io:', io ? 'defined' : 'UNDEFINED');
    this.roomMap = new Map();
    this.tickIntervalId = null;
    this.io = io;
    setInterval(() => this.oneTick(), TICK.MILLISECS);
    }

    generateCode() {
        let code;
        code = Math.random().toString(36).substring(2, 6).toUpperCase();
        return code;
    }

    createRoom() {
        const code = this.generateCode();
        const room = new GameRoom(code);
        this.roomMap.set(code, room);
        return room;
    }

    findRoom(code) {
        const room = this.roomMap.get(code);
        if (room) {
            return room;
        }
        return null;
    }

    getAllRooms() {
        const rooms = this.roomMap.values();
        return rooms;
    }

    deleteRoom(code) {
        this.roomMap.delete(code);
        }

    oneTick(){
        for (const room of this.roomMap.values()){
            if (room.phase === 'phase1' || room.phase === 'phase2'){
                const roomData = room.tick();
                this.io.to(room.id).emit('gameState', roomData);
                
                // If match is ended, emit final result
                if (room.phase === 'ended') {
                    const p1 = room.playerMap.player1;
                    const p2 = room.playerMap.player2;
                    this.io.to(room.id).emit('end_of_match', {
                        winner: room.winner,
                        finalScores: {
                            [p1 ? p1.userName : 'player1']: p1 ? p1.score : 0,
                            [p2 ? p2.userName : 'player2']: p2 ? p2.score : 0
                        }
                    });
                }
            }
        }
    }
}

module.exports = RoomManager;