// https://socket.io/docs/v3/rooms/
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
// developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/set

const GameRoom = require('./GameRoom');
const { TICK } = require('./constants');

class RoomManager {
    constructor() {
        this.roomMap = new Map();
        this.tickIntervalId = null;
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
        this.startTickLoop();
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
        if (this.roomMap.size === 0) {
            this.stopTickLoop();
        }
    }

    oneTick(){
    for (const room of this.roomMap.values()) {
        room.tick();  // GameRoom.tick() will console.log for now
    }
    }


    startTickLoop() {
        if (this.tickIntervalId === null) {
            this.tickIntervalId = setInterval(() => this.oneTick(), TICK.MS);
        }
    }

    // https://stackoverflow.com/questions/109086/stop-setinterval-call-in-javascript
    stopTickLoop() {
        if (this.tickIntervalId !== null) {
            clearInterval(this.tickIntervalId);
            this.tickIntervalId = null;
        }

    }
}

module.exports = RoomManager;