import { parallaxHorizontally } from "../../../shared/animation.js"
import Collision from "../../../shared/collision.js"
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../../../shared/constants.js"
import Gamepad from "../../../shared/gamepad.js"
import Player from "../../player/player.js"
import { BACKGROUND, BG_CITY_BACK, BG_CITY_FRONT, BG_LIGHT, BG_TOP_FIRST, BG_TOP_SECOND, BG_TOP_THIRD, STREAM_GAME } from "./constants.js"

function drawParallaxTop() {
    parallaxHorizontally(BG_TOP_THIRD, 1)
    parallaxHorizontally(BG_TOP_SECOND, 1)
    parallaxHorizontally(BG_TOP_FIRST, 1)
}

function drawParallaxBottom() {
    parallaxHorizontally(BG_CITY_BACK, 1)
    BG_LIGHT.draw(BG_LIGHT.x, BG_LIGHT.y)
    parallaxHorizontally(BG_CITY_FRONT, 1)
}

let initialized = false;

function createCollider() {

    if (initialized) return

    Collision.register({
        type: 'rect',
        x: 0,
        y: SCREEN_HEIGHT - 50,
        w: SCREEN_WIDTH,
        h: 50,
        layer: 'ground',
        tags: ['ground', 'solid'],
        static: true
    });

    Collision.register({
        type: 'rect',
        x: 0,
        y: 0,
        w: SCREEN_WIDTH,
        h: 50,
        layer: 'ground',
        tags: ['ground', 'solid'],
        static: true
    });

    initialized = true;
}

const player = new Player({ PLAYER_PORT: 0 })

function GAME_LOOP(deltaTime) {
    if (!STREAM_GAME.playing()) {
        STREAM_GAME.play();
    }

    BACKGROUND.draw(0, 0)
    drawParallaxBottom();
    drawParallaxTop();

    createCollider();

    if (Gamepad.player(0).justPressed(Pads.R1)) {
        Collision.toggleDebug();
    }

    player.update(deltaTime);

    Collision.check();

    Collision.renderDebug();
}

export default GAME_LOOP