//Source https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_classes

class Player {
    // initial plan is to initiate player object with pre-defined socket_id, x_pos, y_pos, and health. 
    // I'm fine with with changing this if we want
    constructor(socketId, x = 0, y = 0, maxHealth = 1) {
        this.id = socketId;
        this.x = x;
        this.y = y;
        this.health = maxHealth;
        this.score = 0;
        this.currentInput = {left: false, right: false, shoot: false};
    }
}

module.exports = Player;