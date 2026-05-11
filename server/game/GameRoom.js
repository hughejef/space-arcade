// Leveraging socket.io's native 'room' functionality
// https://socket.io/docs/v3/rooms/
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes

const Player = require('./Player.js');
const { SPAWN, ASTEROID, ARENA, PROJECTILE, SHIP }= require('./constants');

class GameRoom {
    // initial plan is to initiate player object with pre-defined socketId, x_pos, y_pos, and health. 
    // I'm fine with with changing this if we want
    constructor(id) {
        this.id = id; // id will be 4 digit alphanumeric room code
        this.playerMap = {player1: null, player2: null}; // two players, map of socket id, userName, ship state, and player score
        this.asteroids = []; // list of asteroids and their positions in arena
        this.projectiles = []; // list of projectiles and their positions in arena
        this.phase = "waiting";   // waiting for player 2, phase 1, phase 2, ended
        this.createdTime = Date.now();
        this.winner = null
    }
    isEmpty() {
    return this.playerMap.player1 === null && this.playerMap.player2 === null;
    }


    isFull() {
    return this.playerMap.player1 !== null && this.playerMap.player2 !== null;
    }

    
    // get slot for removing player
    getSlot(socketId){
        if (this.playerMap.player1 && this.playerMap.player1.id === socketId) // added this.playerMap.player1/2 check because getSlot is failing when no player in slot
            return 'player1';
        if (this.playerMap.player2 && this.playerMap.player2.id === socketId)
            return 'player2';
        return null;
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
        const player = new Player(socketId, x, y, facing, userName);
        
        // add to player map
        this.playerMap[slot] = player;

        // if game is now full, launch game (start phase1)
        if (this.isFull()) {
        this.phase = 'phase1';
        this.addAsteroids();
        }

        return {success: true, slot };
    }

    addAsteroids() {
        let id = 0;
        for (let row = 0; row < ASTEROID.rows; row++) {
            for (let col = 0; col < ASTEROID.cols; col++) {
                this.asteroids.push({
                    id: id++,
                    x: ASTEROID.gridLeft + col * ASTEROID.width,
                    y: ASTEROID.gridTop + row * ASTEROID.height
                });
            }
        }
    }

    removePlayer(socketId) {
        const slot = this.getSlot(socketId);
        if (slot === null) {
        return { success: false, reason: 'slot_not_in_room' };
        }
        this.playerMap[slot] = null;

        if (this.phase === "phase1" || this.phase === "phase2"){
            this.phase = 'ended';
        }
        const isEmpty = this.isEmpty();

        return {success: true, slot, isEmpty};
        };

    tick() {
        // Update Players, Asteroids, Projectiles, Phase
        for (const slot of ['player1', 'player2']){
            const player = this.playerMap[slot];
            if (!player){
                continue;
            }
            player.update();

            // Projectiles
            if (player.currentInput['shoot']){
                const projectile = player.shoot();
            
                if (projectile !== null){
                    projectile.owner = slot;
                    projectile.id = `${slot}-${Date.now()}`;
                    this.projectiles.push(projectile);
                }
            }
        }
        
        // update projectile movement
        this.projectiles = this.projectiles.filter(p => {
        p.y += p.facing === 'down' ? PROJECTILE.speed : -PROJECTILE.speed;
        return p.y > 0 && p.y < ARENA.height;
        });

        // Check each projectile against each asteroid
        for (let projIndex = this.projectiles.length - 1; projIndex >= 0; projIndex--) {
            const projectile = this.projectiles[projIndex];
            for (let astIndex = this.asteroids.length - 1; astIndex >= 0; astIndex--) {
                const asteroid = this.asteroids[astIndex];
                if (projectile.x < asteroid.x + ASTEROID.width &&
                    projectile.x + PROJECTILE.width > asteroid.x &&
                    projectile.y < asteroid.y + ASTEROID.height &&
                    projectile.y + PROJECTILE.height > asteroid.y) {
                    // proj hit!  remove asteroid and projectile,
                    // splice to delete element at index 1
                    this.asteroids.splice(astIndex, 1);
                    this.projectiles.splice(projIndex, 1);
                    // projectile.owner is the slot string ('player1' or 'player2'),
                    const shooter = this.playerMap[projectile.owner];
                    // +1 to shooting player
                    if (shooter) shooter.score += 1;
                    // stop with one projectile killing one asteroid
                    break;
                }
            }
        }

        // phase 2 projectile/ship collisions
        if (this.phase === 'phase2') {
            for (let projIndex = this.projectiles.length - 1; projIndex >= 0; projIndex--) {
                const projectile = this.projectiles[projIndex];
                for (const slot of ['player1', 'player2']) {
                    const target = this.playerMap[slot];
                    if (!target) continue;
                    if (slot === projectile.owner) continue;  // can't shoot yourself
                    if (projectile.x < target.x + SHIP.width &&
                        projectile.x + PROJECTILE.width > target.x &&
                        projectile.y < target.y + SHIP.height &&
                        projectile.y + PROJECTILE.height > target.y) {
                        target.takeDamage();
                        this.projectiles.splice(projIndex, 1);
                        break;
                    }
                }
            }
        }

        // check for dead players
        if (this.phase === 'phase2') {
            const p1 = this.playerMap.player1;
            const p2 = this.playerMap.player2;
            if (p1 && p1.isDead()) {
                this.phase = 'ended';
                this.winner = 'player2';
                if (p2) p2.score += 50;              // win bonus of 50
            } else if (p2 && p2.isDead()) {
                this.phase = 'ended';
                this.winner = 'player1';
                if (p1) p1.score += 50;
            }
        }

        // if asteroid list is empty, then transition phases
        if (this.phase === 'phase1' && this.asteroids.length === 0) {
            this.phase = 'phase2';
        }

        const gameState = {phase: this.phase,
            players: this.playerMap,
            asteroids: this.asteroids,
            projectiles: this.projectiles
        };
        console.log('tick: ', gameState);
        return gameState;
    }


        
};

module.exports = GameRoom;