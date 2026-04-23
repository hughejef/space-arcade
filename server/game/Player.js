//Source https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_classes

class Player {
    // initial plan is to initiate player object with pre-defined socket_id, x_pos, y_pos, and health. 
    // I'm fine with with changing this if we want
    constructor(socketId, x, y, maxHealth = 1, userName = "HAL9000", facing) {
        this.id = socketId;
        this.x = x;
        this.y = y;
        this.health = maxHealth;
        this.score = 0;
        this.currentInput = {left: false, right: false, shoot: false};
        this.userName = userName;
        this.facing = facing // If facing 'down' projectiles fire 'down' (y-) If facing 'up' projectiles fire 'up' (y+)
    }
    
    takeDamage(){
        this.health -= 1;
        return this.isDead();
    }

    isDead(){
        return this.health <= 0;
    }

    getSocketId(){
        return this.id
    }
}

module.exports = Player;