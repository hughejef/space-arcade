const ARENA = { 
    width: 800, 
    height: 600 
};
const SPAWN = {
    player1: { x: 380, y: 40 },
    player2: { x: 380, y: 516 }
};
const SHIP = {
    width: 40, 
    height: 44, 
    speed: 8,  // speed tells server how far left right to move ship
    margin: 10, // use margin to keep ship within bounds
    cooldown: 500 // shot cooldown to avoid endless spamming of firing
};
const TICK = {
    RATE: 30,
    MILLISECS: 1000 / 30
};
const PROJECTILE = {
    width: 4,
    height: 10,
    speed: 12  // pixels projectile moves at each tick
};
const ASTEROID = {
    width: 40,
    height: 20,
    rows: 5,
    cols: 18,
    gridTop: 240,    // top of asteroid zone --- derive bottom of grid with 'gridTop + (rows * height)'
    gridLeft: 40     // left start of asteroid zone --- derive gridRight with 'gridLeft + (cols * width)'
};
module.exports = { ARENA, SPAWN, SHIP, TICK, PROJECTILE, ASTEROID };
