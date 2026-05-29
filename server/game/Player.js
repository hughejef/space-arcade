//Source https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_classes
const { ARENA, SHIP, PROJECTILE }  = require('./constants.js');
class Player {
    // initial plan is to initiate player object with pre-defined socket_id, x_pos, y_pos, and health. 
    // I'm fine with with changing this if we want
    // armor system: health starts at 0 and grows during phase 1 as the player destroys asteroids
    // (every 10 destroyed = +1 armor, capped at 3). during phase 2 each hit removes 1 armor.
    constructor(socketId, x, y, facing, userName = "HAL9000", maxHealth = 3) {
        this.id = socketId;
        this.x = x;
        this.y = y;
        this.health = 0; // starts at 0, gained during phase 1 by destroying asteroids
        this.maxHealth = maxHealth; // cap for the armor bar (3 hearts)
        this.asteroidsDestroyed = 0; // tracks progress toward armor gains during phase 1
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