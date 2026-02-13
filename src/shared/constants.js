// GENERAL
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Screen.getMode();
const ASSETS_PATH = Object.freeze({
    PARALLAX: "./assets/img/parallax",
    SPRITES: "./assets/img/sprites",
    SOUNDS: "./assets/sound",
    UI: "./assets/img/ui",
    TILES: "./assets/img/tiles",
    TEXTURES: "./assets/img/textures",
    MAPS: "./data/SinglePlayerMap"
})
const GAME_STATE = Object.freeze({
    MAIN_MENU: 'MAIN_MENU',
    LOADING: 'LOADING',
    SINGLE_PLAYER: 'SINGLE_PLAYER',
    MULTIPLAYER: 'MULTIPLAYER',
    CREDITS: 'CREDITS',
    SCORES: 'SCORES',
})

// PLAYER
const PLAYER_ONE_PORT = 0;
const PLAYER_ANIMATION = Object.freeze({
    INIT: 'init',
    WALK: 'walk',
    FALL: 'fall',
    WALK_SLIDE: 'walk_slide',
    DEAD: 'dead',
    RUN: 'run'
})
const PLAYER_MOVEMENT = Object.freeze({
    MAX_Y_VELOCITY: 320.0,
    DEFAULT_GRAVITY: 7.0,
    DEFAULT_SPEED: 43.9
})

// GAME
const GAME_GROUND_LEVEL = 425;
const GAME_SCALE_FACTOR = 0.641509;
const FLASH_HEIGHT = 480;

export {
    SCREEN_HEIGHT,
    SCREEN_WIDTH,
    PLAYER_ANIMATION,
    ASSETS_PATH,
    PLAYER_ONE_PORT,
    PLAYER_MOVEMENT,
    GAME_STATE,
    GAME_GROUND_LEVEL,
    GAME_SCALE_FACTOR,
    FLASH_HEIGHT
}