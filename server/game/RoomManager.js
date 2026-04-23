// https://socket.io/docs/v3/rooms/
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
// developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/set

const GameRoom = require('./GameRoom');

class RoomManager {
    constructor(){
        this.roomMap = new Map();
    }

    generateCode(){
        let code;
        code = Math.random().toString(36).substring(2, 6).toUpperCase();
        return code;
    }

    createRoom(){
        const code = this.generateCode();
        const room = new GameRoom(code);
        this.roomMap.set(code, room);
        return room;
    }

    findRoom(code){
        const room = this.roomMap.get(code);
        if (room){
            return room;
        }
        return null;
    }

    deleteRoom(code){
        return this.roomMap.delete(code);
    }
}

module.exports = RoomManager;