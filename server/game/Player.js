//Source https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_classes

const { ARENA, SHIP, PROJECTILE }  = require('./constants.js');

class Player {
    // initial plan is to initiate player object with pre-defined socket_id, x_pos, y_pos, and health. 
    // I'm fine with with changing this if we want
    constructor(socketId, x, y, facing, userName = "HAL9000", maxHealth = 1) {
        this.id = socketId;
        this.x = x;
        this.y = y;
        this.health = maxHealth;
        this.score = 0;
        this.currentInput = {left: false, right: false, shoot: false};
        this.userName = userName;
        this.facing = facing; // If facing 'down' projectiles fire 'down' (y+) If facing 'up' projectiles fire 'up' (y-)
        this.lastShotTime = 0; // for shot cooldown
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

    update(){
        if (this.currentInput['left'] === true){
            this.x -= SHIP.speed;
        }
        if (this.currentInput['right'] === true){
            this.x += SHIP.speed;
        }
        // add boundaries
        //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/max
        this.x = Math.max(0, Math.min(ARENA.width - SHIP.width, this.x));
        if (this.currentInput['shoot'] === true){
            // TODO
        }

    }

    shoot(){
        const now = Date.now();
        if (now - this.lastShotTime < SHIP.cooldown){
            return null;
        }
        this.lastShotTime = now;
        return{
            x:this.x + SHIP.width / 2 - PROJECTILE.width / 2,
            y:this.facing === 'down' ? this.y + SHIP.height : this.y - PROJECTILE.height,
            owner: null,
            facing: this.facing
        };

    }
}

module.exports = Player;