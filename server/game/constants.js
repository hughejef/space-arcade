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
    margin: 10 // use margin to keep ship within bounds

};

module.exports = { ARENA, SPAWN, SHIP };