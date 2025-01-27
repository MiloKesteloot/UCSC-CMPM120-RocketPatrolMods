// Name: Milo Kesteloot
// Project: Rocket Patrol Mods
// Date: 1/26/2025
// Hours: 1
// Mods:
//  * Create a new enemy Spaceship type (w/ new artwork) that's smaller, moves faster, and is worth more points (5)
//  * Implement a new timing/scoring mechanism that adds time to the clock for successful hits and subtracts time for misses (5)
//  * Implement mouse control for player movement and left mouse click to fire (5)
//  * Use Phaser's particle emitter to create a particle explosion when the rocket hits the spaceship (5)
//  * Display the time remaining (in seconds) on the screen (3)
// Sources:
//  * Mouse pointer position: https://stackoverflow.com/questions/28104605/how-to-find-the-mouse-position-x-y-using-phaser
//  * Particles: perplexity.ai


"use strict"

let config = {
    type: Phaser.AUTO,
    width: 640,
    height: 480,
    scene: [ Menu, Play ],
};

let game = new Phaser.Game(config);

// set UI sizes
let borderUISize = game.config.height / 15
let borderPadding = borderUISize / 3

// reserve keyboard bindings
let keyFIRE, keyRESET, keyLEFT, keyRIGHT
